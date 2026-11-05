import React from 'react';
import {
  EasingMode,
  EmojiConfig,
  LayerMotionToggles,
  MotionPresetId,
  SavedEmoji,
} from '../types/emoji';
import { MOTION_PRESETS } from '../utils/emojiEngine';
import { EmojiRenderer } from './EmojiRenderer';
import { Activity, Layers, Bookmark, Trash2, Copy, Check } from 'lucide-react';

interface MotionInspectorPanelProps {
  config: EmojiConfig;
  onUpdateConfig: (updater: (prev: EmojiConfig) => EmojiConfig) => void;
  savedPack: SavedEmoji[];
  onLoadSaved: (config: EmojiConfig) => void;
  onDeleteSaved: (id: string) => void;
  copiedId: string | null;
  onCopyShortcode: (shortcode: string, id: string) => void;
}

export const MotionInspectorPanel: React.FC<MotionInspectorPanelProps> = ({
  config,
  onUpdateConfig,
  savedPack,
  onLoadSaved,
  onDeleteSaved,
  copiedId,
  onCopyShortcode,
}) => {
  const toggleLayerMotion = (key: keyof LayerMotionToggles) => {
    onUpdateConfig((prev) => ({
      ...prev,
      layerMotion: {
        ...prev.layerMotion,
        [key]: !prev.layerMotion[key],
      },
    }));
  };

  const easingOptions: Array<{ id: EasingMode; label: string }> = [
    { id: 'snappy-spring', label: 'Spring' },
    { id: 'smooth-sine', label: 'Sine' },
    { id: 'linear', label: 'Linear' },
    { id: 'step-retro', label: '8-Bit Step' },
  ];

  const layerItems: Array<{ key: keyof LayerMotionToggles; label: string; detail: string }> = [
    { key: 'eyeBlink', label: 'Auto Blinking', detail: 'Natural periodic eyelid snap' },
    { key: 'eyeTrack', label: 'Gaze Drift', detail: 'Subtle pupil/eye look-around' },
    { key: 'browWiggle', label: 'Brow Express', detail: 'Expressive eyebrow pitch' },
    { key: 'mouthTalk', label: 'Lip Chatter', detail: 'Rhythmic jaw squash & open' },
    { key: 'gearBounce', label: 'Gear Follow-Through', detail: 'Phase-lagged hat/prop bounce' },
    { key: 'fxOrbit', label: 'Particle Orbit', detail: 'Continuous ambient particle loop' },
  ];

  return (
    <aside
      aria-label="Motion Physics and Saved Emoji Pack"
      className="w-full lg:w-[360px] shrink-0 bg-white dark:bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-y-auto p-4 space-y-6"
    >
      {/* 1. Primary Kinetic Rig Preset */}
      <section>
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-amber-500" />
            <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              01. Primary Motion Rig
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
            {MOTION_PRESETS.length} rigs
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {MOTION_PRESETS.map((preset) => {
            const isSelected = config.motionPreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() =>
                  onUpdateConfig((prev) => ({
                    ...prev,
                    motionPreset: preset.id as MotionPresetId,
                  }))
                }
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/10 text-slate-900 dark:text-white'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="text-xs font-semibold truncate">{preset.label}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {preset.description}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Physics Parameters (Speed, Amplitude, Easing) */}
      <section className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3.5">
        <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
          02. Physics & Timing Curve
        </h2>

        {/* Speed Multiplier */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <label
              htmlFor="motion-speed-slider"
              className="font-medium text-slate-700 dark:text-slate-300"
            >
              Cycle Speed
            </label>
            <span className="font-mono text-slate-600 dark:text-slate-400 tabular-nums">
              {config.motionSpeed.toFixed(2)}x ({Math.round(1400 / config.motionSpeed)}ms)
            </span>
          </div>
          <input
            id="motion-speed-slider"
            type="range"
            min={0.25}
            max={2.5}
            step={0.05}
            value={config.motionSpeed}
            onChange={(e) =>
              onUpdateConfig((prev) => ({
                ...prev,
                motionSpeed: parseFloat(e.target.value),
              }))
            }
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>

        {/* Amplitude / Intensity */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <label
              htmlFor="motion-intensity-slider"
              className="font-medium text-slate-700 dark:text-slate-300"
            >
              Motion Amplitude
            </label>
            <span className="font-mono text-slate-600 dark:text-slate-400 tabular-nums">
              {Math.round(config.motionIntensity * 100)}%
            </span>
          </div>
          <input
            id="motion-intensity-slider"
            type="range"
            min={0.2}
            max={2.0}
            step={0.05}
            value={config.motionIntensity}
            onChange={(e) =>
              onUpdateConfig((prev) => ({
                ...prev,
                motionIntensity: parseFloat(e.target.value),
              }))
            }
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>

        {/* Easing Selector */}
        <div className="space-y-1.5">
          <span className="block text-xs font-medium text-slate-700 dark:text-slate-300">
            Interpolation Curve
          </span>
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg">
            {easingOptions.map((opt) => {
              const active = config.easing === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onUpdateConfig((prev) => ({ ...prev, easing: opt.id }))}
                  className={`py-1.5 px-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-amber-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Secondary Layer Kinematics */}
      <section className="pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Layers className="w-4 h-4 text-amber-500" />
          <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            03. Secondary Layer Motion
          </h2>
        </div>

        <div className="space-y-1.5">
          {layerItems.map((item) => {
            const enabled = config.layerMotion[item.key];
            return (
              <button
                key={item.key}
                type="button"
                role="switch"
                aria-checked={enabled}
                onClick={() => toggleLayerMotion(item.key)}
                className="w-full flex items-center justify-between p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-colors cursor-pointer"
              >
                <div className="min-w-0 pr-2">
                  <div className="text-xs font-medium text-slate-900 dark:text-slate-100">
                    {item.label}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {item.detail}
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold whitespace-nowrap shrink-0 ${
                    enabled
                      ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {enabled ? 'ON' : 'OFF'}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. Saved Custom Emoji Pack */}
      <section className="pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <Bookmark className="w-4 h-4 text-amber-500" />
            <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              04. Saved Pack ({savedPack.length})
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Click to load
          </span>
        </div>

        {savedPack.length === 0 ? (
          <div className="p-4 rounded-lg border border-dashed border-slate-300 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No saved emojis in your pack yet. Click &ldquo;Save to Pack&rdquo; on the stage to store custom emojis.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {savedPack.map((entry) => {
              const isCopied = copiedId === entry.config.id;
              return (
                <div
                  key={entry.config.id}
                  className="flex items-center justify-between gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50"
                >
                  <button
                    type="button"
                    onClick={() => onLoadSaved(entry.config)}
                    className="flex items-center gap-2.5 min-w-0 flex-1 text-left cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0">
                      <EmojiRenderer
                        config={entry.config}
                        size={34}
                        animate={true}
                        showShadow={false}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-amber-500 transition-colors truncate">
                        {entry.config.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                        {entry.config.shortcode} · {entry.config.motionPreset}
                      </div>
                    </div>
                  </button>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => onCopyShortcode(entry.config.shortcode, entry.config.id)}
                      aria-label={`Copy shortcode ${entry.config.shortcode}`}
                      className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteSaved(entry.config.id)}
                      aria-label={`Remove ${entry.config.name} from pack`}
                      className="p-1.5 rounded-md text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </aside>
  );
};
