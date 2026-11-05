import React from 'react';
import {
  EmojiConfig,
  PhotoMixMode,
} from '../types/emoji';
import { MOTION_PRESETS } from '../utils/emojiEngine';
import { getCropImgProps } from '../utils/photoEmojiCatalog';
import { EmojiRenderer } from './EmojiRenderer';
import {
  CheckCircle2,
  ShoppingBag,
  Share2,
  Bookmark,
  Check,
  Image as ImageIcon,
  Diamond,
  Play,
  Pause,
  Sliders,
} from 'lucide-react';

interface FlowbaseFeaturedStageCardProps {
  config: EmojiConfig;
  totalPhotosCount: number;
  isPlaying: boolean;
  scrubTime: number;
  saveFeedback: boolean;
  editionNumber: number;
  onTogglePlay: () => void;
  onFrameTick: (t: number) => void;
  onUpdateConfig: (updater: (prev: EmojiConfig) => EmojiConfig) => void;
  onOpenMixer: () => void;
  onOpenExport: () => void;
  onSaveToPack: () => void;
  onRollMoodMix: () => void;
  onOpenCreatorStudio: () => void;
}

export const FlowbaseFeaturedStageCard: React.FC<FlowbaseFeaturedStageCardProps> = ({
  config,
  totalPhotosCount,
  isPlaying,
  scrubTime,
  saveFeedback,
  editionNumber,
  onTogglePlay,
  onFrameTick,
  onUpdateConfig,
  onOpenMixer,
  onOpenExport,
  onSaveToPack,
  onRollMoodMix,
  onOpenCreatorStudio,
}) => {
  const quickRigs = MOTION_PRESETS.slice(0, 6);

  const quickModes: Array<{ id: PhotoMixMode; label: string }> = [
    { id: 'cutout-solo', label: 'Solo Photo' },
    { id: 'vector-overlay', label: '+ Vector Face' },
    { id: 'duo-collab', label: 'Duo Mix' },
    { id: 'none', label: 'Vector Only' },
  ];

  const activeMode = config.photoMixMode || (config.photoUrl ? 'cutout-solo' : 'none');
  const avatarProps = getCropImgProps(
    config.photoUrl || '/assets/aistudio/Billie_eilish_fb05e43d.jpg'
  );

  return (
    <aside
      aria-label="Featured Animated Emoji Stage"
      className="w-full lg:w-[340px] xl:w-[420px] shrink-0 flex flex-col"
    >
      <div
        data-testid="emoji-stage-viewport"
        className="relative flex-1 min-h-[500px] xl:min-h-[540px] rounded-[36px] flowbase-hero-stage p-5 xl:p-6 flex flex-col justify-between overflow-hidden shadow-[0_24px_48px_rgba(16,12,24,0.38)]"
      >
        {/* Signature Curved Top-Center Cutout Notch matching Reference Image */}
        <div
          aria-hidden="true"
          className="absolute -top-1 left-1/2 -translate-x-1/2 w-28 h-5 bg-[#312c38] rounded-b-[24px] z-20"
        />

        {/* Subtle 3D Sand Platform & Bokeh Atmosphere */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-4 bottom-[225px] h-24 bg-gradient-to-b from-[#F7E8D0]/95 via-[#ECCB9F]/85 to-transparent rounded-t-[44px] shadow-[0_2px_18px_rgba(255,255,255,0.65)_inset]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-[275px] w-40 h-5 rounded-full bg-[#7A5229]/20 blur-md"
        />

        {/* TOP HEADER: Creator Profile ("Lynn Chang ✔") + 2 Stacked Floating Action Circles */}
        <div className="relative z-20 flex items-start justify-between gap-3 pt-1">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-white/80 shadow-md shrink-0 bg-[#E5DDF0]">
              <img
                {...avatarProps}
                alt="Lynn Chang"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-display text-sm font-bold text-[#231F28] truncate">
                  Lynn Chang
                </span>
                <CheckCircle2 className="w-4 h-4 text-[#231F28] fill-[#231F28] text-white shrink-0" />
              </div>
              <div className="text-xs text-[#7D7689] font-medium truncate">
                @lynnchang_145 · {config.shortcode}
              </div>
            </div>
          </div>

          {/* 2 Stacked Circular Action Buttons on Right (Mix Bag + Export Upload) */}
          <div className="flex flex-col items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onOpenMixer}
              aria-label="Open Emoji Mixer Lab"
              title="Open 2-Emoji Mixer Lab"
              className="w-11 h-11 rounded-full bg-white hover:bg-[#F7F4FC] text-[#2E2936] shadow-md flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onOpenExport}
              aria-label="Export Emoji"
              title="Export Animated Emoji (WebM, Sprite, SVG, JSON)"
              className="w-11 h-11 rounded-full bg-[#736D82]/85 hover:bg-[#625C70] text-white backdrop-blur-xs shadow-md flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CENTER STAGE: Live Animated Emoji + Quick Rig & Mashup Controls */}
        <div className="relative z-20 my-auto flex flex-col items-center justify-center py-2">
          {/* Decorative Butterfly / Sparkle Accent like Reference Photo */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-2 left-16 text-lg select-none opacity-85 -rotate-12"
          >
            🦋
          </div>

          {/* Live Animated Emoji Renderer */}
          <div className="relative flex items-center justify-center">
            <EmojiRenderer
              config={config}
              size={215}
              animate={isPlaying}
              forcedNormalizedTime={isPlaying ? null : scrubTime}
              onFrameTick={onFrameTick}
            />
          </div>

          {/* Interactive Stage Controls Strip (Mode + Motion Rig + Play/Pause) */}
          <div className="mt-2 flex flex-col items-center gap-1.5 w-full">
            {/* Render Mode Pills */}
            <div className="flex flex-wrap items-center justify-center gap-1 bg-black/15 backdrop-blur-xs p-1 rounded-full">
              {quickModes.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() =>
                    onUpdateConfig((prev) => ({
                      ...prev,
                      photoMixMode: m.id,
                    }))
                  }
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    activeMode === m.id
                      ? 'bg-white text-[#231F28] shadow-2xs'
                      : 'text-[#3B332B] hover:text-black'
                  }`}
                >
                  {m.label}
                </button>
              ))}
              <button
                type="button"
                onClick={onTogglePlay}
                aria-label={isPlaying ? 'Pause Animation' : 'Play Animation'}
                className="w-5 h-5 rounded-full bg-white/90 text-[#231F28] flex items-center justify-center ml-0.5 cursor-pointer"
              >
                {isPlaying ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
              </button>
            </div>

            {/* Motion Preset Quick Switcher */}
            <div className="flex flex-wrap items-center justify-center gap-1">
              {quickRigs.map((rig) => {
                const selected = config.motionPreset === rig.id;
                return (
                  <button
                    key={rig.id}
                    type="button"
                    onClick={() =>
                      onUpdateConfig((prev) => ({
                        ...prev,
                        motionPreset: rig.id,
                      }))
                    }
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
                      selected
                        ? 'bg-[#2E2936] text-white shadow-2xs'
                        : 'bg-white/55 text-[#4A3B2C] hover:bg-white/80'
                    }`}
                  >
                    {rig.label}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={onOpenCreatorStudio}
                className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/80 hover:bg-white text-[#2E2936] flex items-center gap-1 cursor-pointer"
              >
                <Sliders className="w-2.5 h-2.5" />
                <span>Parts</span>
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Title, Edition Number (#141), and 3-Pill Bar */}
        <div className="relative z-20 pt-2">
          <div className="flex items-baseline justify-between gap-2">
            <h1 className="font-display text-2xl font-extrabold text-[#231F20] tracking-tight truncate">
              {config.name}
            </h1>
          </div>
          <div className="font-display text-lg font-extrabold text-[#9A846E] tracking-tight mb-3.5 tabular-nums">
            #{editionNumber}
          </div>

          {/* 3-Pill Action Bar matching Reference Photo ([🖼️ 120] [ 21.345 ETH ♦ ] [ 🔖 ]) */}
          <div className="flex items-center gap-2.5">
            {/* Left Caramel Pill: Total Solo Photos / Open Studio */}
            <button
              type="button"
              onClick={onOpenCreatorStudio}
              title="Browse all 62 solo reaction photos & customize parts"
              className="px-4 py-2.5 rounded-full bg-[#BD9165]/90 hover:bg-[#B28457] text-white font-bold text-sm flex items-center gap-2 shadow-sm transition-colors cursor-pointer shrink-0 tabular-nums"
            >
              <ImageIcon className="w-4 h-4" />
              <span>{totalPhotosCount}</span>
            </button>

            {/* Center Bronze Pill: Roll Random Mood Mix / ETH Display */}
            <button
              type="button"
              onClick={onRollMoodMix}
              title="Click to roll a fresh Random Mood Mixture"
              className="flex-1 px-4 py-2 rounded-full bg-[#8B633F] hover:bg-[#7A5534] text-white font-bold text-sm flex items-center justify-between gap-2 shadow-sm transition-colors cursor-pointer min-w-0"
            >
              <span className="truncate tabular-nums">21.345 ETH · MIX</span>
              <span className="w-7 h-7 rounded-full bg-[#6B4A2B] flex items-center justify-center shrink-0">
                <Diamond className="w-3.5 h-3.5 fill-current text-white" />
              </span>
            </button>

            {/* Right White Bookmark Circle: Save to Custom Pack */}
            <button
              type="button"
              onClick={onSaveToPack}
              aria-label="Save Emoji to Pack"
              title="Save Emoji to Custom Pack"
              className="w-11 h-11 rounded-full bg-white hover:bg-[#FAF7F2] text-[#6B4A2B] shadow-md flex items-center justify-center transition-transform hover:scale-105 cursor-pointer shrink-0"
            >
              {saveFeedback ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Bookmark className="w-4 h-4 fill-current" />
              )}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
