export type GeminiVoice = 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';

export interface VoiceMeta {
  id: GeminiVoice;
  name: string;
  gender: 'Female' | 'Male';
  accent: string;
  tone: string;
  avatarColor: string;
  description: string;
  bestFor: string;
}

export type SupportedLanguage = 'en' | 'hi' | 'hinglish';

export interface GeneratedAudioItem {
  id: string;
  timestamp: number;
  text: string;
  voice: string;
  audioBase64: string;
  mimeType: string;
  duration?: number;
  model: string;
  style?: string;
  language?: SupportedLanguage;
  isDialogue?: boolean;
  speakers?: Array<{ name: string; voice: string }>;
}

export interface DialogueLine {
  id: string;
  speaker: string;
  text: string;
  style?: string;
}

export interface DialogueSpeaker {
  name: string;
  voice: GeminiVoice;
}

export type AppMode = 'narration' | 'dialogue' | 'webspeech';

