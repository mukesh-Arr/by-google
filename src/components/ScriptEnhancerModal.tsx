import React, { useState } from 'react';
import { Sparkles, X, Check, Loader2, Wand2, Globe } from 'lucide-react';
import { enhanceScriptApi } from '../services/ttsService';
import { SupportedLanguage } from '../types';

interface ScriptEnhancerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentText: string;
  currentLanguage?: SupportedLanguage;
  onApply: (enhancedText: string) => void;
}

export const ScriptEnhancerModal: React.FC<ScriptEnhancerModalProps> = ({
  isOpen,
  onClose,
  currentText,
  currentLanguage = 'en',
  onApply,
}) => {
  const [lang, setLang] = useState<SupportedLanguage>(currentLanguage);
  const [selectedStyle, setSelectedStyle] = useState('natural');
  const [loading, setLoading] = useState(false);
  const [enhancedText, setEnhancedText] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const englishStyles = [
    { id: 'natural', label: 'Natural & Fluent', desc: 'Smooth phrasing and natural breathing pauses' },
    { id: 'podcast', label: 'Punchy Podcast', desc: 'Engaging, energetic conversational rhythm' },
    { id: 'storyteller', label: 'Audiobook Storyteller', desc: 'Dramatic pacing and expressive sensory pauses' },
    { id: 'news', label: 'Broadcast News Anchor', desc: 'Crisp, articulate, professional cadence' },
    { id: 'calm', label: 'Mindful & Soothing', desc: 'Relaxing, gentle cadence for wellness and sleep' },
  ];

  const hindiStyles = [
    { id: 'natural', label: 'स्वाभाविक एवं स्पष्ट (Natural Hindi)', desc: 'सहज प्रवाह, शुद्ध उच्चारण एवं विराम चिह्न' },
    { id: 'podcast', label: 'रोचक पॉडकास्ट (Hindi Podcast)', desc: 'युवा, ऊर्जावान एवं आकर्षक बातचीत शैली' },
    { id: 'storyteller', label: 'कथावाचक / कहानी (Hindi Story)', desc: 'भावपूर्ण उतार-चढ़ाव और रहस्यमयी विराम' },
    { id: 'news', label: 'समाचार वाचक (Hindi News Anchor)', desc: 'स्पष्ट, गंभीर एवं औपचारिक प्रसारण शैली' },
    { id: 'calm', label: 'शांति एवं ध्यान (Hindi Meditation)', desc: 'धीमी, कोमल एवं तनाव-मुक्त आवाज' },
  ];

  const hinglishStyles = [
    { id: 'natural', label: 'Urban Hinglish', desc: 'Natural blend of modern Hindi & English' },
    { id: 'podcast', label: 'YouTuber / Podcaster', desc: 'Punchy casual slang and verbal hooks' },
    { id: 'calm', label: 'Lifestyle & Wellness', desc: 'Soft conversational contemporary tone' },
  ];

  const activeStyles =
    lang === 'hi' ? hindiStyles : lang === 'hinglish' ? hinglishStyles : englishStyles;

  const handleGenerate = async () => {
    if (!currentText.trim()) {
      setError('Please enter some text in the studio first.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await enhanceScriptApi({
        text: currentText,
        style: selectedStyle,
        language: lang,
      });
      setEnhancedText(result);
    } catch (err: any) {
      setError(err?.message || 'Failed to enhance script');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (enhancedText) {
      onApply(enhancedText);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-950 text-purple-400 border border-purple-800/40">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                AI Voiceover Script Doctor (Hindi & English)
              </h3>
              <p className="text-xs text-slate-400">
                Polish sentence cadence, natural breath pauses, and clear pronunciation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Selector */}
        <div className="px-4 sm:px-5 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-xs text-slate-400 font-medium">Target Language:</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setLang('hi')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                lang === 'hi'
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🇮🇳 हिन्दी (Hindi)
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                lang === 'en'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🇬🇧 English
            </button>
            <button
              type="button"
              onClick={() => setLang('hinglish')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                lang === 'hinglish'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🌐 Hinglish
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Style Selector */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Select Tone / शैली
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activeStyles.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStyle(s.id)}
                  type="button"
                  className={`p-2.5 text-left rounded-xl border text-xs transition ${
                    selectedStyle === s.id
                      ? 'bg-purple-950/70 border-purple-500 text-purple-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold text-white mb-0.5">{s.label}</div>
                  <div className="text-[11px] text-slate-400">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Original Preview */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">
              Current Text to Polish
            </label>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 max-h-24 overflow-y-auto font-sans leading-relaxed">
              {currentText || <span className="text-slate-500 italic">No text provided</span>}
            </div>
          </div>

          {/* Action Trigger */}
          <button
            onClick={handleGenerate}
            disabled={loading || !currentText.trim()}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/20 disabled:opacity-50 transition active:scale-[0.99] cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Polishing {lang === 'hi' ? 'Hindi' : 'English'} script with Gemini...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Polish Script for Natural {lang === 'hi' ? 'Hindi' : 'English'} Speech
              </>
            )}
          </button>

          {error && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/60 text-xs text-red-300">
              {error}
            </div>
          )}

          {/* Enhanced Result */}
          {enhancedText && (
            <div className="space-y-2 animate-in fade-in duration-300">
              <label className="text-xs font-semibold text-purple-300 flex items-center justify-between">
                <span>Optimized Script ({lang === 'hi' ? 'हिन्दी' : 'English'})</span>
                <span className="text-[11px] text-slate-400">Ready to synthesize</span>
              </label>
              <textarea
                value={enhancedText}
                onChange={(e) => setEnhancedText(e.target.value)}
                rows={4}
                className="w-full p-3 bg-slate-950 border border-purple-500/50 rounded-xl text-xs text-white leading-relaxed focus:outline-none focus:ring-1 focus:ring-purple-400 font-sans"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition"
          >
            Close
          </button>
          {enhancedText && (
            <button
              onClick={handleApply}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Apply to Studio Editor
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
