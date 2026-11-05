import React from 'react';
import { EmojiConfig } from '../types/emoji';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

interface StageTimelineProps {
  config: EmojiConfig;
  isPlaying: boolean;
  onTogglePlay: () => void;
  scrubTime: number; // 0 to 1
  onScrubChange: (normalizedTime: number) => void;
  fps: number;
  onChangeFps: (fps: number) => void;
}

export const StageTimeline: React.FC<StageTimelineProps> = ({
  config,
  isPlaying,
  onTogglePlay,
  scrubTime,
  onScrubChange,
  fps,
  onChangeFps,
}) => {
  const totalFrames = fps;
  const currentFrameIndex = Math.min(totalFrames, Math.floor(scrubTime * totalFrames) + 1);
  const cycleDurationMs = Math.round(1400 / config.motionSpeed);
  const currentMs = Math.round(scrubTime * cycleDurationMs);

  const stepFrame = (delta: number) => {
    const step = 1 / totalFrames;
    const next = (((scrubTime + delta * step) % 1) + 1) % 1;
    onScrubChange(Number(next.toFixed(4)));
  };

  return (
    <div
      aria-label="Animation Timeline Controls"
      className="w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-3 flex flex-col gap-2.5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Playback Transport Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => stepFrame(-1)}
            aria-label="Previous Frame"
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onTogglePlay}
            aria-label={isPlaying ? 'Pause Animation' : 'Play Animation'}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play Loop</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => stepFrame(1)}
            aria-label="Next Frame"
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Frame & Time Telemetry */}
        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 font-mono tabular-nums">
          <span>
            Frame {String(currentFrameIndex).padStart(2, '0')} / {totalFrames}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            {String(currentMs).padStart(4, '0')}ms / {cycleDurationMs}ms
          </span>
          <span aria-hidden="true">·</span>
          <span>Rig: {config.motionPreset}</span>
        </div>

        {/* Frame Rate Selector */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          {[12, 24, 30, 60].map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() => onChangeFps(rate)}
              className={`px-2 py-1 rounded text-xs font-mono font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
                fps === rate
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {rate} FPS
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Scrubber Track with Keyframe Ticks */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 w-10 tabular-nums">
          {Math.round(scrubTime * 100)}%
        </span>
        <div className="relative flex-1 flex items-center">
          <input
            type="range"
            aria-label="Scrub Animation Loop Phase"
            min={0}
            max={0.99}
            step={0.01}
            value={scrubTime}
            onChange={(e) => onScrubChange(parseFloat(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>
        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 w-12 text-right tabular-nums">
          Loop
        </span>
      </div>
    </div>
  );
};
