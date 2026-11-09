import React from 'react';
import { GeminiVoice } from '../types';
import { GEMINI_VOICES } from '../services/ttsService';
import { Check, Mic } from 'lucide-react';

interface VoiceSelectorProps {
  selectedVoice: GeminiVoice;
  onSelectVoice: (voice: GeminiVoice) => void;
  disabled?: boolean;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoice,
  onSelectVoice,
  disabled = false,
}) => {
  const voicesList = Object.keys(GEMINI_VOICES) as GeminiVoice[];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Mic className="w-4 h-4 text-indigo-400" />
          Select AI Voice Actor
        </label>
        <span className="text-xs text-slate-400">
          5 Studio Grade 24kHz Voices
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {voicesList.map((voiceKey) => {
          const v = GEMINI_VOICES[voiceKey];
          const isSelected = selectedVoice === voiceKey;

          return (
            <button
              key={voiceKey}
              type="button"
              disabled={disabled}
              onClick={() => onSelectVoice(voiceKey)}
              className={`relative text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between group cursor-pointer ${
                isSelected
                  ? 'bg-indigo-950/60 border-indigo-500/80 shadow-lg shadow-indigo-950/50 ring-1 ring-indigo-500/40'
                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {/* Voice Avatar Badge */}
              <div className="flex items-start justify-between mb-2">
                <div
                  className={`w-9 h-9 rounded-lg bg-gradient-to-br ${v.avatarColor} flex items-center justify-center text-white font-bold text-sm shadow-md`}
                >
                  {v.name[0]}
                </div>
                {isSelected && (
                  <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </span>
                )}
              </div>

              {/* Name & Tone */}
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {v.name}
                  </h4>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    {v.gender}
                  </span>
                </div>
                <p className="text-xs font-medium text-indigo-300/90 mt-0.5 line-clamp-1">
                  {v.tone}
                </p>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-tight">
                  {v.description}
                </p>
              </div>

              {/* Tag */}
              <div className="mt-2.5 pt-2 border-t border-slate-800/60">
                <span className="text-[10px] text-slate-500 block truncate">
                  {v.bestFor}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
