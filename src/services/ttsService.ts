import { DialogueLine, DialogueSpeaker, GeneratedAudioItem, GeminiVoice } from '../types';

export const GEMINI_VOICES: Record<GeminiVoice, {
  name: string;
  gender: 'Female' | 'Male';
  accent: string;
  tone: string;
  avatarColor: string;
  description: string;
  bestFor: string;
}> = {
  Kore: {
    name: 'Kore',
    gender: 'Female',
    accent: 'Neutral American',
    tone: 'Warm, clear, articulate',
    avatarColor: 'from-amber-400 to-rose-500',
    description: 'Polished and conversational with natural emotional range.',
    bestFor: 'Audiobooks, tutorials, documentaries, warm narration',
  },
  Puck: {
    name: 'Puck',
    gender: 'Male',
    accent: 'Neutral American',
    tone: 'Energetic, engaging, bright',
    avatarColor: 'from-blue-500 to-cyan-400',
    description: 'Youthful and lively with great enthusiasm and clarity.',
    bestFor: 'Podcasts, video essays, upbeat explainers, advertisements',
  },
  Charon: {
    name: 'Charon',
    gender: 'Male',
    accent: 'Deep American',
    tone: 'Resonant, gravelly, authoritative',
    avatarColor: 'from-purple-600 to-indigo-800',
    description: 'Rich lower register with gravitas and cinematic weight.',
    bestFor: 'Movie trailers, dramatic readings, hard news, philosophy',
  },
  Fenrir: {
    name: 'Fenrir',
    gender: 'Male',
    accent: 'Strong American',
    tone: 'Intense, confident, bold',
    avatarColor: 'from-emerald-500 to-teal-700',
    description: 'Direct and impactful with commanding presence.',
    bestFor: 'Fitness motivation, gaming characters, executive presentations',
  },
  Zephyr: {
    name: 'Zephyr',
    gender: 'Female',
    accent: 'Soft American',
    tone: 'Gentle, soothing, airy',
    avatarColor: 'from-pink-400 to-purple-400',
    description: 'Calm, peaceful, and empathetic with relaxed pacing.',
    bestFor: 'Meditation, sleep stories, wellness apps, gentle guidance',
  },
};

const STORAGE_KEY = 'voicecraft_audio_history_v1';

export function getAudioHistory(): GeneratedAudioItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load history', err);
    return [];
  }
}

export function saveAudioItem(item: GeneratedAudioItem): void {
  try {
    const existing = getAudioHistory();
    // Keep max 25 items to avoid blowing localStorage limit
    const updated = [item, ...existing.filter((x) => x.id !== item.id)].slice(0, 25);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save to history', err);
  }
}

export function deleteAudioItem(id: string): void {
  try {
    const existing = getAudioHistory();
    const updated = existing.filter((x) => x.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete history item', err);
  }
}

export function clearAudioHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear history', err);
  }
}

// Single-speaker TTS API call
export async function generateSpeechApi(params: {
  text: string;
  voice: GeminiVoice;
  style?: string;
  model?: string;
  language?: string;
}): Promise<{ audio: string; mimeType: string }> {
  const res = await fetch('/api/tts/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to generate speech');
  }

  return {
    audio: data.audio,
    mimeType: data.mimeType || 'audio/wav',
  };
}

// Multi-speaker Dialogue API call
export async function generateDialogueApi(params: {
  lines: DialogueLine[];
  speakers: DialogueSpeaker[];
  language?: string;
}): Promise<{ audio: string; mimeType: string }> {
  const res = await fetch('/api/tts/dialogue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lines: params.lines.map((l) => ({
        speaker: l.speaker,
        text: l.text,
        style: l.style,
      })),
      speakers: params.speakers,
      language: params.language,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to generate dialogue audio');
  }

  return {
    audio: data.audio,
    mimeType: data.mimeType || 'audio/wav',
  };
}

// AI Script Enhancer call
export async function enhanceScriptApi(params: {
  text: string;
  style: string;
  language?: string;
}): Promise<string> {
  const res = await fetch('/api/tts/enhance-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to enhance script');
  }

  return data.enhancedText;
}

// Convert base64 WAV to Blob URL
export function base64ToBlobUrl(base64: string, mimeType = 'audio/wav'): string {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });
  return URL.createObjectURL(blob);
}

// Trigger download of WAV file
export function downloadWavFile(base64: string, filename = 'speech.wav'): void {
  const url = base64ToBlobUrl(base64, 'audio/wav');
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
