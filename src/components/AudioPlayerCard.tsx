import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Volume2,
  VolumeX,
  Share2,
  Check,
  Sparkles,
  Radio,
} from 'lucide-react';
import { GeneratedAudioItem } from '../types';
import { AudioVisualizer } from './AudioVisualizer';
import { base64ToBlobUrl, downloadWavFile } from '../services/ttsService';

interface AudioPlayerCardProps {
  item: GeneratedAudioItem;
}

export const AudioPlayerCard: React.FC<AudioPlayerCardProps> = ({ item }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>('');

  useEffect(() => {
    // Generate blob URL from base64 audio
    if (item.audioBase64) {
      const url = base64ToBlobUrl(item.audioBase64, item.mimeType || 'audio/wav');
      setAudioUrl(url);
      setCurrentTime(0);
      setIsPlaying(false);

      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [item.audioBase64, item.mimeType]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => console.error('Audio play error:', err));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const handleVolumeToggle = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  const handleDownload = () => {
    const safeVoice = item.voice || 'voice';
    const timestamp = new Date(item.timestamp).toISOString().slice(0, 10);
    const filename = `voicecraft_${safeVoice}_${timestamp}.wav`;
    downloadWavFile(item.audioBase64, filename);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(item.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const speedOptions = [0.75, 1.0, 1.25, 1.5, 2.0];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl backdrop-blur-md relative overflow-hidden group">
      {/* Decorative gradient glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hidden audio element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false);
            setCurrentTime(0);
          }}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
        />
      )}

      {/* Top Bar: Title / Voice Badge / Download */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-950/80 text-indigo-300 border border-indigo-700/50">
            <Radio className="w-3.5 h-3.5 text-indigo-400" />
            Voice: <strong className="text-white font-semibold">{item.voice}</strong>
          </span>

          {item.style && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-normal bg-purple-950/60 text-purple-300 border border-purple-800/40">
              <Sparkles className="w-3 h-3 text-purple-400" />
              {item.style.length > 35 ? item.style.slice(0, 32) + '...' : item.style}
            </span>
          )}

          <span className="text-xs text-slate-400 font-mono">
            24kHz Mono WAV
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyText}
            title="Copy script text"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 transition active:scale-95"
            title="Download high-resolution WAV"
          >
            <Download className="w-3.5 h-3.5" />
            Download WAV
          </button>
        </div>
      </div>

      {/* Waveform Visualizer */}
      <AudioVisualizer isPlaying={isPlaying} audioRef={audioRef} />

      {/* Scrubber Progress Bar */}
      <div className="space-y-1.5 my-2">
        <input
          type="range"
          min="0"
          max={duration || 100}
          step="0.05"
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400"
        />
        <div className="flex justify-between text-xs text-slate-400 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Playback Controls & Speed */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
        {/* Play / Pause / Replay */}
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 transition-transform active:scale-95"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current translate-x-0.5" />}
          </button>
          <button
            onClick={handleRestart}
            title="Replay from start"
            className="p-2.5 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Volume Control */}
          <div className="flex items-center gap-2 pl-2">
            <button
              onClick={handleVolumeToggle}
              className="text-slate-400 hover:text-slate-200"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-slate-300"
            />
          </div>
        </div>

        {/* Speed Chips */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 px-2 font-medium">Speed:</span>
          {speedOptions.map((rate) => (
            <button
              key={rate}
              onClick={() => handleRateChange(rate)}
              className={`px-2 py-0.5 text-xs rounded-lg font-mono font-medium transition ${
                playbackRate === rate
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>

      {/* Spoken Text Preview */}
      <div className="mt-3 pt-3 border-t border-slate-800/60">
        <p className="text-xs text-slate-300 italic line-clamp-2 leading-relaxed font-sans">
          "{item.text}"
        </p>
      </div>
    </div>
  );
};
