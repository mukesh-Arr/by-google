import React, { useEffect, useState } from 'react';
import {
  Mic,
  Sparkles,
  Loader2,
  Wand2,
  FileText,
  Sliders,
  Volume2,
  AlertCircle,
  Play,
  Layers,
  Globe,
} from 'lucide-react';
import { AppMode, GeminiVoice, GeneratedAudioItem, SupportedLanguage } from './types';
import {
  generateSpeechApi,
  getAudioHistory,
  saveAudioItem,
} from './services/ttsService';
import { Navbar } from './components/Navbar';
import { VoiceSelector } from './components/VoiceSelector';
import { AudioPlayerCard } from './components/AudioPlayerCard';
import { DialogueStudio } from './components/DialogueStudio';
import { WebSpeechStudio } from './components/WebSpeechStudio';
import { PresetsModal, PresetItem } from './components/PresetsModal';
import { ScriptEnhancerModal } from './components/ScriptEnhancerModal';
import { AudioHistoryDrawer } from './components/AudioHistoryDrawer';

const ENGLISH_STARTER =
  'Welcome to VoiceCraft! <breath> Powered by Google Gemini 3.8 Flash TTS, you can synthesize ultra-realistic voices with emotional pacing, natural breathing, and studio-grade 24kHz clarity. |yeah| Try changing voices or styles to hear the magic.';

const HINDI_STARTER =
  'वॉइसक्राफ्ट में आपका स्वागत है! <breath> गूगल जेमिनी 3.8 फ्लैश टीटीएस के साथ, अब आप हिन्दी और अंग्रेजी में सजीव और भावपूर्ण आवाज़ें बना सकते हैं। <laugh> स्वाभाविक सांसों, हाव-भाव और 24kHz स्पष्टता के साथ सुनिए यह जादू। |yeah| यह सचमुच अद्भुत है!';

const HINGLISH_STARTER =
  'Hey everyone, welcome to VoiceCraft! <breath> Ab aap effortlessly Hindi aur English speech synthesize kar sakte hain with emotional depth and crystal clear 24kHz audio. <laugh> Try different voices and feel the realism!';

const ENGLISH_STYLES = [
  { label: 'Warm Documentary', style: 'Warm, clear, and cinematic documentary narrator' },
  { label: 'Energetic Podcast', style: 'High-energy, charismatic, and enthusiastic podcast host' },
  { label: 'Gentle Storyteller', style: 'Soft, soothing bedtime storyteller with gentle pacing' },
  { label: 'News Anchor', style: 'Crisp, articulate, authoritative professional news anchor' },
  { label: 'Dramatic Trailer', style: 'Deep, resonant, dramatic blockbuster movie trailer voice' },
  { label: 'Casual Friendly', style: 'Relaxed, friendly, natural everyday conversation' },
];

const HINDI_STYLES = [
  { label: 'समाचार वाचक (News)', style: 'Crisp, articulate Hindi news anchor with authoritative clear cadence' },
  { label: 'कथावाचक (Storyteller)', style: 'Deep theatrical Hindi storyteller with suspenseful dramatic pauses' },
  { label: 'ध्यान व शांति (Calm)', style: 'Soft, gentle, peaceful Hindi meditation guide with deep soothing breaths' },
  { label: 'उत्साही पॉडकास्ट (Podcast)', style: 'Energetic, warm, and engaging Hindi podcast host' },
  { label: 'त्योहार विज्ञापन (Ad)', style: 'Joyful, bright, celebratory festive Hindi commercial voiceover' },
  { label: 'प्रेरणादायक (Motivation)', style: 'Powerful, confident, resonant Hindi motivational speaker' },
];

const HINGLISH_STYLES = [
  { label: 'Tech YouTuber', style: 'Conversational urban Hinglish tech host with high energy and casual youth slang' },
  { label: 'Casual Banter', style: 'Friendly, natural Hinglish conversation with lighthearted laughter' },
  { label: 'Lifestyle Ad', style: 'Modern urban Indian lifestyle commercial with upbeat friendly tone' },
];

export default function App() {
  const [mode, setMode] = useState<AppMode>('narration');
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [selectedVoice, setSelectedVoice] = useState<GeminiVoice>('Kore');
  const [text, setText] = useState<string>(ENGLISH_STARTER);
  const [customStyle, setCustomStyle] = useState<string>('Warm, clear, and cinematic documentary narrator');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.8-flash-lite-tts');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Audio items
  const [currentAudio, setCurrentAudio] = useState<GeneratedAudioItem | null>(null);
  const [history, setHistory] = useState<GeneratedAudioItem[]>([]);

  // Modals
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isEnhancerOpen, setIsEnhancerOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Load initial history
  useEffect(() => {
    const saved = getAudioHistory();
    setHistory(saved);
    if (saved.length > 0 && !currentAudio) {
      setCurrentAudio(saved[0]);
    }
  }, []);

  const refreshHistory = () => {
    const updated = getAudioHistory();
    setHistory(updated);
  };

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);

    // If text was previous default starter, update to new language starter
    if (text === ENGLISH_STARTER || text === HINDI_STARTER || text === HINGLISH_STARTER) {
      if (newLang === 'hi') {
        setText(HINDI_STARTER);
        setCustomStyle('Crisp, articulate Hindi news anchor with authoritative clear cadence');
      } else if (newLang === 'hinglish') {
        setText(HINGLISH_STARTER);
        setCustomStyle('Conversational urban Hinglish tech host with high energy');
      } else {
        setText(ENGLISH_STARTER);
        setCustomStyle('Warm, clear, and cinematic documentary narrator');
      }
    } else {
      // Just adjust recommended style
      if (newLang === 'hi') {
        setCustomStyle('Natural, fluent Hindi speaker with authentic Indian accent');
      } else if (newLang === 'hinglish') {
        setCustomStyle('Natural urban Hinglish speaker mixing conversational Hindi and English');
      }
    }
  };

  const handleGenerateSpeech = async () => {
    if (!text.trim()) {
      setError('Please enter some text to synthesize.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await generateSpeechApi({
        text: text.trim(),
        voice: selectedVoice,
        style: customStyle.trim() || undefined,
        model: selectedModel,
        language,
      });

      const newItem: GeneratedAudioItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        text: text.trim(),
        voice: selectedVoice,
        audioBase64: response.audio,
        mimeType: response.mimeType,
        model: selectedModel,
        style: customStyle.trim() || undefined,
        language,
      };

      saveAudioItem(newItem);
      setCurrentAudio(newItem);
      refreshHistory();
    } catch (err: any) {
      console.error('Speech generation failed:', err);
      setError(err?.message || 'Failed to synthesize speech');
    } finally {
      setLoading(false);
    }
  };

  // Keyboard shortcut Ctrl+Enter / Cmd+Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleGenerateSpeech();
    }
  };

  const handleInsertTag = (tag: string) => {
    setText((prev) => `${prev} ${tag} `);
  };

  const handleSelectPreset = (preset: PresetItem) => {
    setText(preset.text);
    setSelectedVoice(preset.recommendedVoice);
    setCustomStyle(preset.style);
    if (preset.language) {
      setLanguage(preset.language);
    }
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const estimatedSeconds = Math.round((wordCount / (language === 'hi' ? 120 : 140)) * 60);

  const activeStyles =
    language === 'hi'
      ? HINDI_STYLES
      : language === 'hinglish'
      ? HINGLISH_STYLES
      : ENGLISH_STYLES;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentMode={mode}
        onModeChange={setMode}
        currentLanguage={language}
        onLanguageChange={handleLanguageChange}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenPresets={() => setIsPresetsOpen(true)}
        historyCount={history.length}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {mode === 'dialogue' && (
          <DialogueStudio
            onAudioGenerated={(item) => {
              setCurrentAudio(item);
              refreshHistory();
            }}
          />
        )}

        {mode === 'webspeech' && (
          <WebSpeechStudio
            initialText={text}
            defaultLang={language === 'hi' ? 'hi' : 'en'}
          />
        )}

        {mode === 'narration' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 7 Columns: Voice Selection, Script & Settings */}
            <div className="lg:col-span-7 space-y-6">
              {/* Language Indicator & Quick Switch Banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md">
                <div className="flex items-center gap-2.5">
                  <Globe className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      Speech Language:
                      <span className="text-indigo-400 font-semibold">
                        {language === 'hi' ? '🇮🇳 हिन्दी (Hindi)' : language === 'hinglish' ? '🌐 Hinglish' : '🇬🇧 English'}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Gemini 3.8 natively synthesizes authentic Indian Hindi (Devanagari) & English accents
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleLanguageChange('en')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      language === 'en'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🇬🇧 English
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLanguageChange('hi')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      language === 'hi'
                        ? 'bg-amber-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🇮🇳 हिन्दी (Hindi)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLanguageChange('hinglish')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      language === 'hinglish'
                        ? 'bg-purple-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🌐 Hinglish
                  </button>
                </div>
              </div>

              {/* Voice Actor Selector */}
              <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 shadow-lg">
                <VoiceSelector
                  selectedVoice={selectedVoice}
                  onSelectVoice={setSelectedVoice}
                  disabled={loading}
                />
              </div>

              {/* Script Input Card */}
              <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 shadow-lg space-y-4">
                {/* Header & Helpers */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    {language === 'hi' ? 'भाषण / संवाद स्क्रिप्ट (Hindi Script)' : 'Speech Script'}
                  </label>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsEnhancerOpen(true)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-950/80 text-purple-300 border border-purple-800/50 hover:bg-purple-900/80 transition cursor-pointer"
                      title="AI Script Doctor"
                    >
                      <Wand2 className="w-3.5 h-3.5 text-purple-400" />
                      {language === 'hi' ? 'AI स्क्रिप्ट सुधार (Polish)' : 'AI Script Polish'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsPresetsOpen(true)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      {language === 'hi' ? 'हिन्दी नमूने (Presets)' : 'Sample Presets'}
                    </button>
                  </div>
                </div>

                {/* Textarea */}
                <div className="relative">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      language === 'hi'
                        ? 'यहाँ हिन्दी में अपना पाठ टाइप करें या पेस्ट करें (देवनागरी)...'
                        : 'Enter or paste English text to synthesize into spoken speech...'
                    }
                    rows={6}
                    disabled={loading}
                    className="w-full bg-slate-950/90 border border-slate-800 rounded-xl p-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-sans leading-relaxed resize-y disabled:opacity-60"
                  />

                  {/* Quick stats at bottom corner */}
                  <div className="flex justify-between items-center text-xs text-slate-400 px-1 pt-1 font-mono">
                    <div className="flex items-center gap-3">
                      <span>{wordCount} {language === 'hi' ? 'शब्द (words)' : 'words'}</span>
                      <span>•</span>
                      <span>{text.length} {language === 'hi' ? 'अक्षर (chars)' : 'chars'}</span>
                      <span>•</span>
                      <span className="text-indigo-400">~{estimatedSeconds}s audio</span>
                    </div>
                    <span className="hidden sm:inline text-slate-400 text-[11px]">
                      Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">Ctrl+Enter</kbd> to generate
                    </span>
                  </div>
                </div>

                {/* Expressive Tags Insertion Toolbar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-slate-400 uppercase tracking-wider text-[11px]">
                      {language === 'hi' ? 'भावपूर्ण ध्वनियां जोड़ें (Vocal Bursts & Pauses)' : 'Insert Vocal Bursts & Natural Punctuation'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {language === 'hi' ? 'hi-IN 24kHz' : 'en-US 24kHz'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { tag: '<breath>', label: language === 'hi' ? 'सांस' : 'Breathing' },
                      { tag: '<laugh>', label: language === 'hi' ? 'हंसी' : 'Laugh' },
                      { tag: '<gasp>', label: language === 'hi' ? 'चौंकना' : 'Gasp' },
                      { tag: '|yeah|', label: language === 'hi' ? 'सहमति (हाँ)' : 'Backchannel (yeah)' },
                      { tag: '|mhm|', label: language === 'hi' ? 'हूं-हूं' : 'Backchannel (mhm)' },
                      { tag: '...', label: language === 'hi' ? 'विराम' : 'Pause' },
                    ].map((item) => (
                      <button
                        key={item.tag}
                        type="button"
                        onClick={() => handleInsertTag(item.tag)}
                        className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 hover:text-indigo-300 hover:border-indigo-500/50 hover:bg-slate-900 transition flex items-center gap-1 active:scale-95 cursor-pointer"
                      >
                        <span className="text-indigo-400 font-bold">{item.tag}</span>
                        <span className="text-[10px] text-slate-400">({item.label})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Expressive Tone & Style Config */}
                <div className="space-y-2 pt-2 border-t border-slate-800/70">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                      {language === 'hi' ? 'बोलने का अंदाज / शैली (Voice Style)' : 'Narration Style & Persona Prompt'}
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Speech metadata styling
                    </span>
                  </div>

                  {/* Style Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {activeStyles.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setCustomStyle(p.style)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                          customStyle === p.style
                            ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                            : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {/* Freeform Style Input */}
                  <input
                    type="text"
                    value={customStyle}
                    onChange={(e) => setCustomStyle(e.target.value)}
                    placeholder={
                      language === 'hi'
                        ? 'उदा. गंभीर हिन्दी समाचार वाचक, या कोमल कहानीकार की आवाज़...'
                        : 'e.g. Warm documentary narrator, energetic commercial announcer...'
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-sans"
                  />
                </div>

                {/* Model Engine Selector */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/70 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">Model:</span>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="gemini-3.8-flash-lite-tts">
                        gemini-3.8-flash-lite-tts (Fast & Efficient)
                      </option>
                      <option value="gemini-3.8-flash-tts">
                        gemini-3.8-flash-tts (Flagship Expressive)
                      </option>
                    </select>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Output: 24kHz Mono WAV
                  </span>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-800/80 text-xs text-red-200 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">{error}</p>
                      <p className="text-red-300 mt-0.5">
                        Tip: You can switch to the "Native TTS" tab for offline device speech if an API key is not configured.
                      </p>
                    </div>
                  </div>
                )}

                {/* Main Generate Button */}
                <button
                  type="button"
                  onClick={handleGenerateSpeech}
                  disabled={loading}
                  className="w-full py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-400 hover:via-purple-500 hover:to-pink-400 text-white shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2.5 transition active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating {language === 'hi' ? 'Hindi' : 'English'} 24kHz HD Voice Audio...
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5 fill-current" />
                      {language === 'hi'
                        ? 'हिन्दी भाषण तैयार करें (Synthesize Hindi WAV)'
                        : 'Synthesize Speech Audio (24kHz WAV)'}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right 5 Columns: Audio Player & History Feed */}
            <div className="lg:col-span-5 space-y-6">
              {/* Active Player Card */}
              {currentAudio ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs px-1">
                    <span className="font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-indigo-400" />
                      Master Playback Studio
                    </span>
                    <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Ready to Play
                    </span>
                  </div>
                  <AudioPlayerCard item={currentAudio} />
                </div>
              ) : (
                <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-8 text-center flex flex-col items-center justify-center text-slate-500 min-h-[220px]">
                  <Volume2 className="w-12 h-12 stroke-1 text-slate-700 mb-3" />
                  <h4 className="text-sm font-semibold text-slate-400">
                    No Audio Generated Yet
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Choose a voice actor, enter your script in Hindi or English, and click "Synthesize Speech Audio" to generate real-time 24kHz audio.
                  </p>
                </div>
              )}

              {/* Language & Voice Capabilities Info Card */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-amber-400" />
                  Hindi & English Features
                </h4>
                <div className="space-y-2 text-xs text-slate-400">
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-md bg-amber-950 text-amber-400 flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
                      हि
                    </span>
                    <div>
                      <strong className="text-slate-200">Devanagari & Hindi Phonetics:</strong>{' '}
                      Supports pure Devanagari Hindi text with authentic cadence, accurate matras, and natural Indian pauses.
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-md bg-indigo-950 text-indigo-400 flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
                      EN
                    </span>
                    <div>
                      <strong className="text-slate-200">Expressive English:</strong>{' '}
                      Vocal bursts like <code className="text-indigo-400">&lt;laugh&gt;</code>,{' '}
                      <code className="text-indigo-400">&lt;breath&gt;</code>, and backchanneling{' '}
                      <code className="text-indigo-400">|yeah|</code>.
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-md bg-purple-950 text-purple-400 flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
                      द्वि
                    </span>
                    <div>
                      <strong className="text-slate-200">Dual-Speaker Hindi & English Screenplays:</strong>{' '}
                      Build conversational multi-character audio plays and podcasts in either language in the <em>Dialogue</em> tab.
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Generation Mini-List */}
              {history.length > 0 && (
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-purple-400" />
                      Recent Clips ({history.length})
                    </h4>
                    <button
                      onClick={() => setIsHistoryOpen(true)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-2">
                    {history.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setCurrentAudio(item)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          currentAudio?.id === item.id
                            ? 'bg-indigo-950/60 border-indigo-500/60'
                            : 'bg-slate-950/60 border-slate-800/60 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white">
                              {item.voice}
                            </span>
                            {item.language && (
                              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                                {item.language}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-500 font-mono">
                              {new Date(item.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5 font-sans">
                            "{item.text}"
                          </p>
                        </div>
                        <button
                          type="button"
                          className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-indigo-600 text-white flex items-center justify-center transition flex-shrink-0 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modals & Drawers */}
      <PresetsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onSelectPreset={handleSelectPreset}
      />

      <ScriptEnhancerModal
        isOpen={isEnhancerOpen}
        onClose={() => setIsEnhancerOpen(false)}
        currentText={text}
        currentLanguage={language}
        onApply={(enhanced) => setText(enhanced)}
      />

      <AudioHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectAudio={(item) => setCurrentAudio(item)}
        onHistoryUpdated={refreshHistory}
      />
    </div>
  );
}
