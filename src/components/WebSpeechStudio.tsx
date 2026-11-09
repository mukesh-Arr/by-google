import React, { useEffect, useState } from 'react';
import { Volume2, Play, Square, Pause, Zap, Sliders, Globe, Sparkles } from 'lucide-react';

interface WebSpeechStudioProps {
  initialText?: string;
  defaultLang?: 'en' | 'hi';
}

const HINDI_SAMPLE =
  'नमस्ते! यह ब्राउज़र का नेटिव टेक्स्ट-टू-स्पीच है। आप बोलने की गति, पिच और आवाज़ को तुरंत बदल सकते हैं।';

const ENGLISH_SAMPLE =
  'Hello! This is instant browser native text-to-speech. You can adjust the rate, pitch, and voice in real-time.';

export const WebSpeechStudio: React.FC<WebSpeechStudioProps> = ({
  initialText = '',
  defaultLang = 'en',
}) => {
  const [langFilter, setLangFilter] = useState<'all' | 'en' | 'hi'>(defaultLang);
  const [text, setText] = useState(
    initialText || (defaultLang === 'hi' ? HINDI_SAMPLE : ENGLISH_SAMPLE)
  );
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceUri, setSelectedVoiceUri] = useState<string>('');
  const [rate, setRate] = useState<number>(1);
  const [pitch, setPitch] = useState<number>(1);
  const [volume, setVolume] = useState<number>(1);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      if (available.length > 0) {
        setVoices(available);
        pickBestVoice(available, langFilter);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const pickBestVoice = (voiceList: SpeechSynthesisVoice[], filter: 'all' | 'en' | 'hi') => {
    if (filter === 'hi') {
      const hiVoice = voiceList.find(
        (v) => v.lang.toLowerCase().startsWith('hi') || v.name.toLowerCase().includes('hindi')
      );
      if (hiVoice) {
        setSelectedVoiceUri(hiVoice.voiceURI);
        return;
      }
    } else if (filter === 'en') {
      const enVoice = voiceList.find(
        (v) => v.lang.toLowerCase().startsWith('en-in') || v.lang.toLowerCase().startsWith('en')
      );
      if (enVoice) {
        setSelectedVoiceUri(enVoice.voiceURI);
        return;
      }
    }

    if (!selectedVoiceUri && voiceList.length > 0) {
      const defaultVoice = voiceList.find((v) => v.default) || voiceList[0];
      if (defaultVoice) setSelectedVoiceUri(defaultVoice.voiceURI);
    }
  };

  const handleLangFilterChange = (newFilter: 'all' | 'en' | 'hi') => {
    setLangFilter(newFilter);
    pickBestVoice(voices, newFilter);
    if (newFilter === 'hi' && text === ENGLISH_SAMPLE) {
      setText(HINDI_SAMPLE);
    } else if (newFilter === 'en' && text === HINDI_SAMPLE) {
      setText(ENGLISH_SAMPLE);
    }
  };

  const filteredVoices = voices.filter((v) => {
    if (langFilter === 'hi') {
      return v.lang.toLowerCase().startsWith('hi') || v.name.toLowerCase().includes('hindi');
    }
    if (langFilter === 'en') {
      return v.lang.toLowerCase().startsWith('en');
    }
    return true;
  });

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Web Speech API is not supported in this browser.');
      return;
    }

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsSpeaking(true);
      return;
    }

    window.speechSynthesis.cancel();

    if (!text.trim()) return;

    const utterance = new SpeechSynthesisUtterance(text);
    const chosenVoice = voices.find((v) => v.voiceURI === selectedVoiceUri);
    if (chosenVoice) {
      utterance.voice = chosenVoice;
    }
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = (e) => {
      console.error('Speech error', e);
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    if (window.speechSynthesis.speaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="text-base font-bold text-white">
              Instant Browser Native Speech (Hindi & English)
            </h3>
            <p className="text-xs text-slate-400">
              Zero-latency client-side synthesis using your device's installed Hindi & English voices
            </p>
          </div>
        </div>

        {/* Language Filter Chips */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            type="button"
            onClick={() => handleLangFilterChange('hi')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              langFilter === 'hi'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🇮🇳 हिन्दी (Hindi)
          </button>
          <button
            type="button"
            onClick={() => handleLangFilterChange('en')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              langFilter === 'en'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🇬🇧 English
          </button>
          <button
            type="button"
            onClick={() => handleLangFilterChange('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
              langFilter === 'all'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Voices
          </button>
        </div>
      </div>

      {/* Voice Selection */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <label className="font-semibold text-slate-300">
            Device Voice ({filteredVoices.length} found for {langFilter === 'hi' ? 'Hindi' : langFilter === 'en' ? 'English' : 'All'})
          </label>
          {langFilter === 'hi' && filteredVoices.length === 0 && (
            <span className="text-amber-400 text-[11px]">
              No local Hindi voice installed on this OS. Switch to Gemini Studio Voices for 24kHz Hindi!
            </span>
          )}
        </div>
        <select
          value={selectedVoiceUri}
          onChange={(e) => setSelectedVoiceUri(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
        >
          {filteredVoices.length > 0 ? (
            filteredVoices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name} ({v.lang}) {v.default ? '★ Default' : ''}
              </option>
            ))
          ) : (
            <option value="">No matching voice found for current filter</option>
          )}
        </select>
      </div>

      {/* Text Area */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <label className="font-semibold text-slate-300">
            Text to Speak ({langFilter === 'hi' ? 'हिन्दी' : 'English'})
          </label>
          <button
            type="button"
            onClick={() => setText(langFilter === 'hi' ? HINDI_SAMPLE : ENGLISH_SAMPLE)}
            className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            Load Sample
          </button>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder={langFilter === 'hi' ? 'यहाँ हिन्दी में लिखें या पेस्ट करें...' : 'Type or paste English text here...'}
          className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 leading-relaxed resize-none font-sans"
        />
      </div>

      {/* Fine-Tuning Sliders: Rate, Pitch, Volume */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Speaking Rate</span>
            <span className="font-mono text-amber-300 font-semibold">{rate.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.05"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Pitch</span>
            <span className="font-mono text-amber-300 font-semibold">{pitch.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.05"
            value={pitch}
            onChange={(e) => setPitch(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Volume</span>
            <span className="font-mono text-amber-300 font-semibold">{Math.round(volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>
      </div>

      {/* Playback action buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSpeak}
          className="flex-1 py-3 px-4 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition active:scale-[0.99] cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current" />
          {isPaused ? 'Resume Speaking' : langFilter === 'hi' ? 'आवाज़ में बोलें (Speak Hindi)' : 'Speak English Text'}
        </button>

        {isSpeaking && (
          <button
            onClick={handlePause}
            className="py-3 px-4 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition"
          >
            <Pause className="w-4 h-4" />
            Pause
          </button>
        )}

        <button
          onClick={handleStop}
          disabled={!isSpeaking && !isPaused}
          className="py-3 px-4 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 flex items-center gap-1.5 transition"
        >
          <Square className="w-4 h-4" />
          Stop
        </button>
      </div>
    </div>
  );
};
