import React, { useState } from 'react';
import { History, Trash2, Download, Play, Pause, X, Music, Radio } from 'lucide-react';
import { GeneratedAudioItem } from '../types';
import { base64ToBlobUrl, clearAudioHistory, deleteAudioItem, downloadWavFile } from '../services/ttsService';

interface AudioHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: GeneratedAudioItem[];
  onSelectAudio: (item: GeneratedAudioItem) => void;
  onHistoryUpdated: () => void;
}

export const AudioHistoryDrawer: React.FC<AudioHistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectAudio,
  onHistoryUpdated,
}) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  if (!isOpen) return null;

  const handlePlayToggle = (item: GeneratedAudioItem) => {
    if (playingId === item.id) {
      audioElement?.pause();
      setPlayingId(null);
      return;
    }

    if (audioElement) {
      audioElement.pause();
    }

    const url = base64ToBlobUrl(item.audioBase64, item.mimeType);
    const audio = new Audio(url);
    setAudioElement(audio);
    setPlayingId(item.id);

    audio.onended = () => {
      setPlayingId(null);
      URL.revokeObjectURL(url);
    };

    audio.play().catch((e) => {
      console.error('Play error', e);
      setPlayingId(null);
    });
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (playingId === id) {
      audioElement?.pause();
      setPlayingId(null);
    }
    deleteAudioItem(id);
    onHistoryUpdated();
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all generated audio clips from library?')) {
      audioElement?.pause();
      setPlayingId(null);
      clearAudioHistory();
      onHistoryUpdated();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800/40">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Audio Library</h3>
              <p className="text-xs text-slate-400">
                {history.length} {history.length === 1 ? 'clip' : 'clips'} saved
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-950/40 transition"
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <Music className="w-10 h-10 stroke-1 mb-2 text-slate-600" />
              <p className="text-sm font-medium">No audio clips yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Generated voiceovers and podcasts will automatically be archived here for instant replay and download.
              </p>
            </div>
          ) : (
            history.map((item) => {
              const isCurrentPlaying = playingId === item.id;
              const dateStr = new Date(item.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectAudio(item)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer group ${
                    isCurrentPlaying
                      ? 'bg-indigo-950/70 border-indigo-500/80 shadow-md ring-1 ring-indigo-500/40'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">
                        {item.voice}
                      </span>
                      {item.isDialogue && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/40">
                          Dialogue
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {dateStr}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 italic mb-3 font-sans leading-relaxed">
                    "{item.text}"
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayToggle(item);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 hover:bg-indigo-600 hover:text-white transition"
                    >
                      {isCurrentPlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5 fill-current" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          Play
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const filename = `voicecraft_${item.voice.toLowerCase()}_${Date.now()}.wav`;
                          downloadWavFile(item.audioBase64, filename);
                        }}
                        title="Download WAV"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(item.id, e)}
                        title="Delete clip"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
