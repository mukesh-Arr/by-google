import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '20mb' }));

// Initialize GenAI
let ai: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('No GEMINI_API_KEY configured');
    }
    ai = new GoogleGenAI({
      apiKey,
      apiVersion: 'v1alpha',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return ai;
}

// Check status & voices
app.get('/api/tts/status', (_req: Request, res: Response) => {
  res.json({
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    geminiVoiceNames: ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'],
    models: [
      { id: 'gemini-3.8-flash-lite-tts', name: 'Gemini 3.8 Flash Lite TTS', description: 'Fast, natural, versatile speech synthesis' },
      { id: 'gemini-3.8-flash-tts', name: 'Gemini 3.8 Flash TTS', description: 'Flagship multi-speaker & expressive voice model' }
    ]
  });
});

// Single-speaker TTS endpoint
app.post('/api/tts/generate', async (req: Request, res: Response) => {
  try {
    const {
      text,
      voice = 'Kore',
      style,
      model = 'gemini-3.8-flash-lite-tts',
      language = 'en',
      languageCode,
    } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Text content is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({
        error: 'No GEMINI_API_KEY configured. You can use Browser Native TTS mode or add your API key in Settings > Secrets.',
        code: 'NO_API_KEY'
      });
    }

    const client = getGenAI();

    const validVoice = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'].includes(voice) ? voice : 'Kore';
    const chosenModel = model === 'gemini-3.8-flash-tts' ? 'gemini-3.8-flash-tts' : 'gemini-3.8-flash-lite-tts';

    const part: { text: string; speechMetadata?: { style: string } } = {
      text: text.trim(),
    };

    if (style && typeof style === 'string' && style.trim()) {
      part.speechMetadata = { style: style.trim() };
    } else if (language === 'hi') {
      part.speechMetadata = { style: 'Natural, fluent Hindi speaker with warm authentic Indian pronunciation and expressive cadence' };
    } else if (language === 'hinglish') {
      part.speechMetadata = { style: 'Natural, urban Hinglish speaker fluently blending conversational Hindi and English' };
    }

    const targetLangCode = languageCode || (language === 'hi' ? 'hi-IN' : 'en-US');

    const response = await client.models.generateContent({
      model: chosenModel,
      contents: [
        {
          role: 'user',
          parts: [part],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: validVoice },
          },
          languageCode: targetLangCode,
        },
      },
    });

    const candidate = response.candidates?.[0];
    const candidateParts = candidate?.content?.parts;
    let base64Audio = candidateParts?.[0]?.inlineData?.data;

    // Search all parts in candidate just in case
    if (!base64Audio && candidateParts && candidateParts.length > 0) {
      for (const p of candidateParts) {
        if (p.inlineData?.data) {
          base64Audio = p.inlineData.data;
          break;
        }
      }
    }

    if (!base64Audio) {
      return res.status(502).json({
        error: 'The Gemini TTS model did not return audio data. Please try adjusting the text or style.'
      });
    }

    return res.json({
      audio: base64Audio,
      mimeType: 'audio/wav',
      voice: validVoice,
      model: chosenModel,
    });
  } catch (error: any) {
    console.error('TTS Generation Error:', error);
    const message = error?.message || 'Failed to generate speech audio';
    const status = error?.status || 500;
    return res.status(status).json({ error: message });
  }
});

// Dual-speaker screenplay dialogue endpoint
app.post('/api/tts/dialogue', async (req: Request, res: Response) => {
  try {
    const { lines, speakers, language = 'en', languageCode } = req.body;

    if (!Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({ error: 'Dialogue lines are required' });
    }

    if (!Array.isArray(speakers) || speakers.length !== 2) {
      return res.status(400).json({ error: 'Exactly two speakers are required for dialogue mode' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({
        error: 'No GEMINI_API_KEY configured. Please check Settings > Secrets.',
        code: 'NO_API_KEY'
      });
    }

    const client = getGenAI();
    const speaker1 = speakers[0];
    const speaker2 = speakers[1];

    const defaultStyle = language === 'hi' 
      ? 'Natural, authentic Indian Hindi conversational dialogue' 
      : language === 'hinglish' 
      ? 'Natural urban Hinglish conversational dialogue' 
      : 'Natural, conversational style';

    const parts = lines.map((line: { speaker: string; text: string; style?: string }) => ({
      text: `${line.speaker}: ${line.text}`,
      speechMetadata: {
        speaker: line.speaker,
        style: line.style || defaultStyle,
      },
    }));

    const targetLangCode = languageCode || (language === 'hi' ? 'hi-IN' : 'en-US');

    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash-tts',
      contents: [
        {
          role: 'user',
          parts,
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          multiSpeakerVoiceConfig: {
            speakerVoiceConfigs: [
              {
                speaker: speaker1.name,
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: speaker1.voice || 'Puck' },
                },
              },
              {
                speaker: speaker2.name,
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: speaker2.voice || 'Kore' },
                },
              },
            ],
          },
          languageCode: targetLangCode,
        },
      },
    });

    const candidate = response.candidates?.[0];
    const candidateParts = candidate?.content?.parts;
    let base64Audio = candidateParts?.[0]?.inlineData?.data;

    if (!base64Audio && candidateParts && candidateParts.length > 0) {
      for (const p of candidateParts) {
        if (p.inlineData?.data) {
          base64Audio = p.inlineData.data;
          break;
        }
      }
    }

    if (!base64Audio) {
      return res.status(502).json({
        error: 'Failed to generate dialogue audio from Gemini TTS.'
      });
    }

    return res.json({
      audio: base64Audio,
      mimeType: 'audio/wav',
      speakers,
      language,
    });
  } catch (error: any) {
    console.error('Dialogue Generation Error:', error);
    const message = error?.message || 'Failed to generate dialogue audio';
    const status = error?.status || 500;
    return res.status(status).json({ error: message });
  }
});

// Text Enhancer / Scriptwriter endpoint using gemini-3.8-flash
app.post('/api/tts/enhance-text', async (req: Request, res: Response) => {
  try {
    const { text, style = 'natural', language = 'en' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ error: 'No GEMINI_API_KEY configured', code: 'NO_API_KEY' });
    }

    const client = getGenAI();

    let langDirective = 'in English';
    if (language === 'hi') {
      langDirective = 'in natural fluent Hindi (Devanagari script)';
    } else if (language === 'hinglish') {
      langDirective = 'in conversational modern Hinglish (blend of Hindi and English in Roman/Latin script)';
    }

    const instructions: Record<string, string> = {
      natural: `Enhance this text for spoken narration ${langDirective}: smooth phrasing, natural conversational breathing pauses, engaging rhythm. Keep core meaning intact.`,
      podcast: `Rewrite this into an energetic, punchy podcast intro/dialogue style ${langDirective} with natural verbal hooks and backchanneling cues.`,
      storyteller: `Enhance this text into a captivating storytelling narration style ${langDirective} with vivid sensory pacing and expressive pauses.`,
      news: `Rewrite into a crisp, authoritative broadcast news anchor style ${langDirective} with professional cadence.`,
      calm: `Rewrite into a soothing, mindful meditation voice script ${langDirective} with gentle pauses and reassuring flow.`,
    };

    const instruction = instructions[style] || instructions.natural;

    let enhanced = text;
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are an expert voiceover script doctor and speech director.
Task: ${instruction}
Original text:
"${text}"

Rules:
- Provide ONLY the enhanced text ready to be read aloud.
- Do NOT include markdown quotes around the whole text or commentary like "Here is your script:".
- Make sure numbers, abbreviations, and symbols are formatted cleanly for seamless voice pronunciation.`,
      });
      enhanced = response.text?.trim() || text;
    } catch (primaryErr: any) {
      console.warn('gemini-3.8-flash failed, falling back to gemini-3.1-flash-lite:', primaryErr?.message);
      const fallbackResponse = await client.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: `You are an expert voiceover script doctor.
Task: ${instruction}
Original text:
"${text}"

Rules:
- Provide ONLY the enhanced text ready to be read aloud.
- Do NOT include markdown commentary.`,
      });
      enhanced = fallbackResponse.text?.trim() || text;
    }

    return res.json({ enhancedText: enhanced });
  } catch (error: any) {
    console.error('Enhance Text Error:', error);
    return res.status(500).json({ error: error?.message || 'Failed to enhance script' });
  }
});

// Setup Vite or static serving
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VoiceCraft server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
