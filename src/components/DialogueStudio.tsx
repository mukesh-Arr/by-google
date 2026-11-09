import React, { useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Loader2,
  Sparkles,
  MessageSquare,
  Globe,
} from 'lucide-react';
import { DialogueLine, DialogueSpeaker, GeminiVoice, GeneratedAudioItem, SupportedLanguage } from '../types';
import { generateDialogueApi, saveAudioItem } from '../services/ttsService';

interface DialogueStudioProps {
  onAudioGenerated: (item: GeneratedAudioItem) => void;
}

const AVAILABLE_VOICES: GeminiVoice[] = ['Puck', 'Kore', 'Charon', 'Fenrir', 'Zephyr'];

const ENGLISH_DIALOGUE: DialogueLine[] = [
  {
    id: '1',
    speaker: 'Alex',
    text: 'Welcome back everyone! <breath> Today we are diving into synthetic voice models.',
    style: 'Enthusiastic, bright podcast host',
  },
  {
    id: '2',
    speaker: 'Sam',
    text: "That's right, |yeah| it has been a huge milestone for emotional nuance.",
    style: 'Articulate, engaged co-host with warm cadence',
  },
  {
    id: '3',
    speaker: 'Alex',
    text: 'Can you believe how natural conversational backchanneling sounds now? <laugh>',
    style: 'Laughing warmly and genuinely amazed',
  },
  {
    id: '4',
    speaker: 'Sam',
    text: '|mhm| It completely changes storytelling and dual-actor narrations.',
    style: 'Agreeing thoughtfully and nodding',
  },
];

const HINDI_DIALOGUE: DialogueLine[] = [
  {
    id: '1',
    speaker: 'रोहन',
    text: 'नमस्ते प्रिया! <breath> क्या तुमने जेमिनी का नया वॉइस मॉडल सुना?',
    style: 'उत्साही और ऊर्जावान पॉडकास्ट होस्ट (Enthusiastic Hindi host)',
  },
  {
    id: '2',
    speaker: 'प्रिया',
    text: 'हाँ रोहन! |mhm| उच्चारण और भावनाएं बिल्कुल असली इंसान जैसी लग रही हैं।',
    style: 'गंभीर और विचारशील स्वर (Articulate & warm Hindi co-host)',
  },
  {
    id: '3',
    speaker: 'रोहन',
    text: 'सच में! <laugh> अब हम दोनों एक साथ पूरा पॉडकास्ट रिकॉर्ड कर सकते हैं।',
    style: 'हंसते हुए और खुशी से भरा स्वर (Joyful with natural laugh)',
  },
  {
    id: '4',
    speaker: 'प्रिया',
    text: '|yeah| यह तकनीक कहानियों और नाटकों को जीवंत बना देगी!',
    style: 'सहमति जताते हुए आत्मविश्वास भरा स्वर (Confident & appreciative)',
  },
];

export const DialogueStudio: React.FC<DialogueStudioProps> = ({ onAudioGenerated }) => {
  const [dialogueLang, setDialogueLang] = useState<SupportedLanguage>('en');

  const [speakers, setSpeakers] = useState<DialogueSpeaker[]>([
    { name: 'Alex', voice: 'Puck' },
    { name: 'Sam', voice: 'Kore' },
  ]);

  const [lines, setLines] = useState<DialogueLine[]>(ENGLISH_DIALOGUE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLanguageSwitch = (newLang: SupportedLanguage) => {
    setDialogueLang(newLang);
    if (newLang === 'hi') {
      setSpeakers([
        { name: 'रोहन', voice: 'Puck' },
        { name: 'प्रिया', voice: 'Kore' },
      ]);
      setLines(HINDI_DIALOGUE);
    } else {
      setSpeakers([
        { name: 'Alex', voice: 'Puck' },
        { name: 'Sam', voice: 'Kore' },
      ]);
      setLines(ENGLISH_DIALOGUE);
    }
  };

  const handleSpeakerChange = (index: number, updates: Partial<DialogueSpeaker>) => {
    const updated = [...speakers];
    const oldName = updated[index].name;
    updated[index] = { ...updated[index], ...updates };
    setSpeakers(updated);

    // If speaker name changed, update dialogue lines
    if (updates.name && updates.name !== oldName) {
      setLines((prev) =>
        prev.map((l) => (l.speaker === oldName ? { ...l, speaker: updates.name! } : l))
      );
    }
  };

  const handleAddLine = (speakerName: string) => {
    const newLine: DialogueLine = {
      id: Date.now().toString(),
      speaker: speakerName,
      text: '',
      style: dialogueLang === 'hi' ? 'स्वाभाविक संवाद शैली' : 'Natural dialogue style',
    };
    setLines([...lines, newLine]);
  };

  const handleUpdateLine = (id: string, updates: Partial<DialogueLine>) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  };

  const handleDeleteLine = (id: string) => {
    if (lines.length <= 1) return;
    setLines((prev) => prev.filter((l) => l.id !== id));
  };

  const handleInsertTag = (lineId: string, tag: string) => {
    setLines((prev) =>
      prev.map((l) => {
        if (l.id !== lineId) return l;
        return {
          ...l,
          text: l.text ? `${l.text} ${tag}` : tag,
        };
      })
    );
  };

  const handleGenerate = async () => {
    const validLines = lines.filter((l) => l.text.trim().length > 0);
    if (validLines.length === 0) {
      setError('Please add at least one line with text.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await generateDialogueApi({
        lines: validLines,
        speakers,
        language: dialogueLang,
      });

      const fullScript = validLines.map((l) => `${l.speaker}: ${l.text}`).join('\n');

      const newItem: GeneratedAudioItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        text: fullScript,
        voice: `${speakers[0].name} (${speakers[0].voice}) & ${speakers[1].name} (${speakers[1].voice})`,
        audioBase64: response.audio,
        mimeType: response.mimeType,
        model: 'gemini-3.8-flash-tts',
        style: dialogueLang === 'hi' ? 'दोहरे वक्ता संवाद (Hindi Dialogue)' : 'Dual-Speaker Dialogue',
        language: dialogueLang,
        isDialogue: true,
        speakers,
      };

      saveAudioItem(newItem);
      onAudioGenerated(newItem);
    } catch (err: any) {
      setError(err?.message || 'Failed to generate dialogue audio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Language Picker */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-sm font-bold text-white">
              Dialogue Language & Actors
            </h3>
            <p className="text-xs text-slate-400">
              Select conversation language: English or हिन्दी (Hindi)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            type="button"
            onClick={() => handleLanguageSwitch('en')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              dialogueLang === 'en'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🇬🇧 English Script
          </button>
          <button
            type="button"
            onClick={() => handleLanguageSwitch('hi')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              dialogueLang === 'hi'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🇮🇳 हिन्दी संवाद (Hindi Script)
          </button>
        </div>
      </div>

      {/* Speaker Configuration Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">
              Dual-Speaker Voice Pairing
            </h3>
          </div>
          <span className="text-xs text-indigo-300 font-mono px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-800/40">
            gemini-3.8-flash-tts
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {speakers.map((sp, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3"
            >
              <div className="space-y-1 flex-1">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Speaker {idx + 1} Name
                </label>
                <input
                  type="text"
                  value={sp.name}
                  onChange={(e) => handleSpeakerChange(idx, { name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div className="space-y-1 w-44">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Voice Actor
                </label>
                <select
                  value={sp.voice}
                  onChange={(e) => handleSpeakerChange(idx, { voice: e.target.value as GeminiVoice })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {AVAILABLE_VOICES.map((v) => (
                    <option key={v} value={v}>
                      {v} {v === 'Puck' ? '(Energetic M)' : v === 'Kore' ? '(Clear F)' : v === 'Charon' ? '(Deep M)' : v === 'Fenrir' ? '(Bold M)' : '(Soft F)'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Screenplay Lines List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            Dialogue Turns ({dialogueLang === 'hi' ? 'हिन्दी' : 'English'})
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAddLine(speakers[0].name)}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-lg font-medium bg-slate-800 text-indigo-300 hover:bg-slate-700 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              + {speakers[0].name}
            </button>
            <button
              onClick={() => handleAddLine(speakers[1].name)}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-lg font-medium bg-slate-800 text-purple-300 hover:bg-slate-700 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              + {speakers[1].name}
            </button>
          </div>
        </div>

        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {lines.map((line) => {
            const isSpeaker1 = line.speaker === speakers[0].name;

            return (
              <div
                key={line.id}
                className={`p-4 rounded-xl border transition-all ${
                  isSpeaker1
                    ? 'bg-slate-900/90 border-indigo-900/50'
                    : 'bg-slate-900/90 border-purple-900/50'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        isSpeaker1 ? 'bg-indigo-600' : 'bg-purple-600'
                      }`}
                    >
                      {line.speaker[0]}
                    </span>
                    <select
                      value={line.speaker}
                      onChange={(e) => handleUpdateLine(line.id, { speaker: e.target.value })}
                      className="bg-slate-950 border border-slate-800 text-xs text-white rounded-lg px-2 py-1 font-semibold"
                    >
                      <option value={speakers[0].name}>{speakers[0].name}</option>
                      <option value={speakers[1].name}>{speakers[1].name}</option>
                    </select>

                    <input
                      type="text"
                      placeholder={dialogueLang === 'hi' ? 'टोन (जैसे: उत्साह, हंसी, शांति)' : 'Tone (e.g. Whispering, Excited, Laughing)'}
                      value={line.style || ''}
                      onChange={(e) => handleUpdateLine(line.id, { style: e.target.value })}
                      className="bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 w-64 placeholder:text-slate-600"
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDeleteLine(line.id)}
                      disabled={lines.length <= 1}
                      title="Delete Turn"
                      className="p-1.5 text-slate-500 hover:text-red-400 disabled:opacity-30 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <textarea
                  value={line.text}
                  onChange={(e) => handleUpdateLine(line.id, { text: e.target.value })}
                  placeholder={dialogueLang === 'hi' ? `${line.speaker} क्या बोलेंगे?` : `What does ${line.speaker} say?`}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 resize-none font-sans leading-relaxed"
                />

                {/* Quick Vocal Burst Insertion */}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-500 font-mono">Insert:</span>
                  {['<laugh>', '<breath>', '<gasp>', '|yeah|', '|mhm|'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleInsertTag(line.id, tag)}
                      className="px-1.5 py-0.5 rounded bg-slate-800/80 hover:bg-indigo-950 hover:text-indigo-300 text-[10px] font-mono text-slate-400 border border-slate-700/60 transition"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-400 hover:via-purple-500 hover:to-pink-400 text-white shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Synthesizing Dual-Speaker {dialogueLang === 'hi' ? 'Hindi' : 'English'} Dialogue...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate {dialogueLang === 'hi' ? 'Hindi' : 'English'} Dialogue Audio with Gemini 3.8 Flash
            </>
          )}
        </button>
      </div>
    </div>
  );
};
