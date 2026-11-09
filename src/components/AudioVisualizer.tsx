import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  audioRef?: React.RefObject<HTMLAudioElement | null>;
  barCount?: number;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  audioRef,
  barCount = 36,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  useEffect(() => {
    // Attempt Web Audio API Analyser connection if audioRef exists
    if (audioRef?.current && !analyserRef.current) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          audioContextRef.current = ctx;
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 128;
          analyserRef.current = analyser;

          // Connect audio source safely
          try {
            const source = ctx.createMediaElementSource(audioRef.current);
            source.connect(analyser);
            analyser.connect(ctx.destination);
            sourceRef.current = source;
          } catch (e) {
            // In case media element is already connected or cross-origin
            console.debug('MediaElementAudioSource already connected or blocked:', e);
          }
        }
      } catch (err) {
        console.debug('Web Audio Analyser not supported or restricted:', err);
      }
    }
  }, [audioRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let dataArray: Uint8Array | null = null;
      if (analyserRef.current && isPlaying) {
        dataArray = new Uint8Array(new ArrayBuffer(analyserRef.current.frequencyBinCount));
        analyserRef.current.getByteFrequencyData(dataArray as any);
      }

      const width = canvas.width;
      const height = canvas.height;
      const totalBars = barCount;
      const spacing = 3;
      const barWidth = Math.max(2, (width - (totalBars - 1) * spacing) / totalBars);

      for (let i = 0; i < totalBars; i++) {
        let barHeight = 4; // idle minimum height

        if (isPlaying) {
          if (dataArray && dataArray.length > 0) {
            const index = Math.floor((i / totalBars) * (dataArray.length * 0.7));
            const val = dataArray[index] || 0;
            barHeight = Math.max(4, (val / 255) * (height * 0.85));
          } else {
            // Simulated dynamic acoustic waveform when web audio analyser is inactive
            const wave1 = Math.sin(phase + i * 0.35) * 0.5 + 0.5;
            const wave2 = Math.cos(phase * 1.5 + i * 0.2) * 0.5 + 0.5;
            barHeight = Math.max(6, (wave1 * 0.6 + wave2 * 0.4) * (height * 0.8));
          }
        }

        const x = i * (barWidth + spacing);
        const y = (height - barHeight) / 2;

        // Gradient color for bars
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (isPlaying) {
          gradient.addColorStop(0, '#a855f7'); // purple-500
          gradient.addColorStop(0.5, '#6366f1'); // indigo-500
          gradient.addColorStop(1, '#06b6d4'); // cyan-500
        } else {
          gradient.addColorStop(0, '#334155');
          gradient.addColorStop(1, '#1e293b');
        }

        ctx.fillStyle = gradient;
        // Rounded bar
        ctx.beginPath();
        const radius = Math.min(barWidth / 2, 2);
        ctx.roundRect(x, y, barWidth, barHeight, radius);
        ctx.fill();
      }

      phase += 0.08;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, barCount]);

  return (
    <div className="w-full flex items-center justify-center py-2">
      <canvas
        ref={canvasRef}
        width={360}
        height={56}
        className="w-full max-w-sm h-14"
      />
    </div>
  );
};
