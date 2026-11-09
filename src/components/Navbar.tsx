import React from 'react';
import {
  Mic,
  Users,
  Zap,
  History,
  Volume2,
  FileText,
  Globe,
} from 'lucide-react';
import { AppMode, SupportedLanguage } from '../types';

interface NavbarProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onOpenHistory: () => void;
  onOpenPresets: () => void;
  historyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onModeChange,
  currentLanguage,
  onLanguageChange,
  onOpenHistory,
  onOpenPresets,
  historyCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 flex-shrink-0">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-white tracking-tight">
                VoiceCraft
              </h1>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800/50">
                Gemini 3.8 TTS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              English & हिन्दी Text-to-Speech Studio
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="hidden lg:flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => onModeChange('narration')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              currentMode === 'narration'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            Studio Voiceover
          </button>

          <button
            onClick={() => onModeChange('dialogue')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              currentMode === 'dialogue'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Dialogue & Podcast
          </button>

          <button
            onClick={() => onModeChange('webspeech')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              currentMode === 'webspeech'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Native TTS
          </button>
        </div>

        {/* Right Section: Language Toggle, Presets, Library */}
        <div className="flex items-center gap-2">
          {/* Language Selector Dropdown / Toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-xl">
            <button
              type="button"
              onClick={() => onLanguageChange('en')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                currentLanguage === 'en'
                  ? 'bg-indigo-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="English"
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange('hi')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                currentLanguage === 'hi'
                  ? 'bg-amber-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="हिन्दी (Hindi)"
            >
              हिन्दी
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange('hinglish')}
              className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                currentLanguage === 'hinglish'
                  ? 'bg-purple-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Hinglish"
            >
              Hinglish
            </button>
          </div>

          <button
            onClick={onOpenPresets}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Presets</span>
          </button>

          <button
            onClick={onOpenHistory}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Library</span>
            {historyCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Mode Tabs */}
      <div className="flex lg:hidden border-t border-slate-800/80 p-1.5 bg-slate-950 justify-around">
        <button
          onClick={() => onModeChange('narration')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${
            currentMode === 'narration'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400'
          }`}
        >
          <Mic className="w-3 h-3" />
          Studio
        </button>
        <button
          onClick={() => onModeChange('dialogue')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${
            currentMode === 'dialogue'
              ? 'bg-purple-600 text-white'
              : 'text-slate-400'
          }`}
        >
          <Users className="w-3 h-3" />
          Dialogue
        </button>
        <button
          onClick={() => onModeChange('webspeech')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${
            currentMode === 'webspeech'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'text-slate-400'
          }`}
        >
          <Zap className="w-3 h-3" />
          Native
        </button>
      </div>
    </header>
  );
};
