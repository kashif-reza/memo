import React, { useMemo, useState } from 'react';
import {
  AccessoryId,
  EffectId,
  EmojiConfig,
  EyeStyleId,
  FaceShapeId,
  GivenPhotoItem,
  MoodVibeId,
  MouthStyleId,
  PhotoMixMode,
  SavedEmoji,
} from '../types/emoji';
import {
  ACCESSORY_STYLES,
  EFFECT_STYLES,
  EYE_STYLES,
  FACE_SHAPES,
  MOTION_PRESETS,
  MOUTH_STYLES,
} from '../utils/emojiEngine';
import { getCropImgProps } from '../utils/photoEmojiCatalog';
import { EmojiRenderer } from './EmojiRenderer';
import { BRAND_COLOR_SWATCHES } from './NftCollectionsShowcase';
import {
  Shuffle,
  Dices,
  Bookmark,
  Check,
  Download,
  MessageSquare,
  Play,
  Pause,
  Copy,
  Trash2,
  Palette,
  ImagePlus,
} from 'lucide-react';

interface MinimalistCreatorStudioProps {
  config: EmojiConfig;
  allPhotoEmojis: GivenPhotoItem[];
  savedPack: SavedEmoji[];
  isPlaying: boolean;
  shortcodeDraft: string;
  shortcodeError: string | null;
  saveFeedback: boolean;
  copiedId: string | null;
  onTogglePlay: () => void;
  onShortcodeChange: (val: string) => void;
  onUpdateConfig: (updater: (prev: EmojiConfig) => EmojiConfig) => void;
  onSelectPreset: (preset: EmojiConfig, sourceItem?: GivenPhotoItem) => void;
  onMixWithStage: (item: GivenPhotoItem) => void;
  onRandomPhotoCombo: () => void;
  onRandomVectorRig: () => void;
  onSaveToPack: () => void;
  onDeleteSaved: (id: string) => void;
  onCopyShortcode: (shortcode: string, id: string) => void;
  onOpenExport: () => void;
  onOpenChatSim: () => void;
  onAddPhotos?: (files: FileList | File[]) => void;
}

type StudioStepTab = 'photo' | 'motion' | 'face' | 'saved';

const QUICK_CAPTIONS = [
  '',
  'SO SAD RN',
  '10/10 RIZZ',
  'NO MONEY',
  'IT IS FINE',
  'SPILL TEA',
  'HOLD UP',
  'BIG BRAIN',
  'YUMMY',
];

export const MinimalistCreatorStudio: React.FC<MinimalistCreatorStudioProps> = ({
  config,
  allPhotoEmojis,
  savedPack,
  isPlaying,
  shortcodeDraft,
  shortcodeError,
  saveFeedback,
  copiedId,
  onTogglePlay,
  onShortcodeChange,
  onUpdateConfig,
  onSelectPreset,
  onMixWithStage,
  onRandomPhotoCombo,
  onRandomVectorRig,
  onSaveToPack,
  onDeleteSaved,
  onCopyShortcode,
  onOpenExport,
  onOpenChatSim,
  onAddPhotos,
}) => {
  const [activeStep, setActiveStep] = useState<StudioStepTab>('photo');
  const [moodFilter, setMoodFilter] = useState<
    MoodVibeId | 'meme-pack' | 'split-sheet'
  >('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeMixMode: PhotoMixMode =
    config.photoMixMode || (config.photoUrl ? 'cutout-solo' : 'none');

  const filteredPhotos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allPhotoEmojis.filter((item) => {
      if (
        moodFilter === 'meme-pack' &&
        item.category !== 'new-solo' &&
        item.category !== 'user-drop'
      ) {
        return false;
      }
      if (moodFilter === 'split-sheet' && item.category !== 'split-sheet') return false;
      if (
        moodFilter !== 'all' &&
        moodFilter !== 'meme-pack' &&
        moodFilter !== 'split-sheet' &&
        item.mood !== moodFilter
      ) {
        return false;
      }
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.shortcode.toLowerCase().includes(q) ||
        item.vibeTag.toLowerCase().includes(q) ||
        item.defaultCaption.toLowerCase().includes(q)
      );
    });
  }, [allPhotoEmojis, moodFilter, searchQuery]);

  return (
    <div className="w-full min-h-screen bg-[#F9F9F9] text-slate-900">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-6">
        {/* Minimalist Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-wider uppercase">
              <span className="text-[#FF4925]">SOLO EMOJI</span>{' '}
              <span className="text-slate-900">CREATOR COOKER</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Pick any reaction from the built-in library, mix two emojis in one click, or press Random Creation.
            </p>
          </div>

          {/* Prominent Random Creation Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onRandomPhotoCombo}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF4925] hover:bg-[#E97A11] text-white font-display font-bold text-xs sm:text-sm shadow-[0_8px_22px_rgba(255,73,37,0.28)] transition-all cursor-pointer whitespace-nowrap"
            >
              <Shuffle className="w-4 h-4" />
              <span>Random Creation</span>
            </button>

            <button
              type="button"
              onClick={onRandomVectorRig}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFBA00] hover:bg-[#E97A11] text-slate-950 hover:text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <Dices className="w-4 h-4" />
              <span>Random Cartoon</span>
            </button>
          </div>
        </div>

        {/* MAIN 2-COLUMN MINIMALIST WORKSPACE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN (5 cols): LIVE PREVIEW STAGE + 9-COLOR BRAND PALETTE + INSTANT EXPORT */}
          <section
            aria-label="Live Emoji Stage"
            className="lg:col-span-5 rounded-2xl bg-white border-2 border-slate-200/80 shadow-sm p-5 sm:p-6 flex flex-col items-center gap-5"
          >
            {/* Top Stage Bar: Name & Play/Pause */}
            <div className="w-full flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[10px] font-bold tracking-wider uppercase text-[#FF4925]">
                  LIVE PREVIEW STAGE
                </div>
                <h2 className="font-display text-lg font-bold text-slate-900 truncate">
                  {config.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={onTogglePlay}
                aria-label={isPlaying ? 'Pause Animation' : 'Play Animation'}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F9F9F9] hover:bg-[#FFBA00]/25 border border-slate-200 text-xs font-bold text-slate-900 cursor-pointer whitespace-nowrap"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-[#FF4925]" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-[#8EBE2A]" />
                    <span>Play</span>
                  </>
                )}
              </button>
            </div>

            {/* Glowing Medallion Stage */}
            <div
              data-testid="emoji-stage-viewport"
              className="relative w-56 h-56 sm:w-60 sm:h-60 rounded-full ring-4 ring-[#FF4925] shadow-[0_18px_45px_rgba(255,73,37,0.25)] flex items-center justify-center overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${config.primaryColor || '#FFBA00'}, ${config.secondaryColor || '#FF4925'})`,
              }}
            >
              <EmojiRenderer
                config={config}
                size={195}
                animate={isPlaying}
                showShadow={true}
              />
            </div>

            {/* 9-Color Brand Palette Swatches */}
            <div className="w-full">
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-700 mb-2">
                <Palette className="w-3.5 h-3.5 text-[#FF4925]" />
                <span>Brand Color Palette (9 Swatches)</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {BRAND_COLOR_SWATCHES.map((swatch) => {
                  const selected =
                    config.primaryColor.toUpperCase() === swatch.hex.toUpperCase();
                  return (
                    <button
                      key={swatch.hex}
                      type="button"
                      onClick={() =>
                        onUpdateConfig((prev) => ({
                          ...prev,
                          primaryColor: swatch.hex,
                          secondaryColor: swatch.secondaryHex,
                        }))
                      }
                      className={`flex items-center gap-2 p-1.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selected
                          ? 'bg-[#F9F9F9] border-[#FF4925] ring-2 ring-[#FF4925]/30'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span
                        className="w-6 h-6 rounded-lg border border-black/10 shrink-0"
                        style={{ backgroundColor: swatch.hex }}
                      />
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold text-slate-900 truncate">
                          {swatch.name}
                        </div>
                        <div className="font-mono text-[9px] text-slate-500">
                          {swatch.hex}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4 Simple Style Mode Pills */}
            <div className="w-full">
              <div className="text-[11px] font-bold text-slate-600 mb-2 text-center">
                Emoji Display Style
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 rounded-xl bg-[#F9F9F9] border border-slate-200">
                {(
                  [
                    { id: 'cutout-solo', label: 'Solo Photo' },
                    { id: 'vector-overlay', label: 'Photo + Face' },
                    { id: 'duo-collab', label: '2-Photo Mix' },
                    { id: 'none', label: 'Cartoon Only' },
                  ] as Array<{ id: PhotoMixMode; label: string }>
                ).map((m) => {
                  const active = activeMixMode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() =>
                        onUpdateConfig((prev) => ({
                          ...prev,
                          photoMixMode: m.id,
                        }))
                      }
                      className={`py-2 px-2 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                        active
                          ? 'bg-[#FF4925] text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Shortcode Input + Save Button */}
            <div className="w-full pt-2 border-t border-slate-100 space-y-2">
              <label
                htmlFor="studio-shortcode-input"
                className="block text-xs font-bold text-slate-700"
              >
                Emoji Shortcode (for Slack / Discord)
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="studio-shortcode-input"
                  type="text"
                  value={shortcodeDraft}
                  onChange={(e) => onShortcodeChange(e.target.value)}
                  placeholder=":custom_moji:"
                  aria-invalid={!!shortcodeError}
                  className={`flex-1 px-3.5 py-2.5 rounded-xl bg-[#F9F9F9] font-mono text-xs border focus:outline-none ${
                    shortcodeError
                      ? 'border-[#FF004C] text-[#FF004C]'
                      : 'border-slate-200 text-slate-900 focus:border-[#FF4925]'
                  }`}
                />
                <button
                  type="button"
                  onClick={onSaveToPack}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#8EBE2A] hover:bg-[#7AA820] text-white text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                >
                  {saveFeedback ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4" />
                      <span>Save Emoji</span>
                    </>
                  )}
                </button>
              </div>
              {shortcodeError && (
                <p role="alert" className="text-xs text-[#FF004C] font-medium">
                  {shortcodeError}
                </p>
              )}
            </div>

            {/* Bottom Action Row: Chat Test + Export */}
            <div className="w-full grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={onOpenChatSim}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#67AEEE]/15 hover:bg-[#67AEEE]/25 border border-[#67AEEE]/40 text-xs font-bold text-slate-900 transition-colors cursor-pointer whitespace-nowrap"
              >
                <MessageSquare className="w-4 h-4 text-[#67AEEE]" />
                <span>Test in Chat</span>
              </button>

              <button
                type="button"
                onClick={onOpenExport}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#FF004C] hover:bg-[#FF4925] text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                <span>Export Emoji</span>
              </button>
            </div>
          </section>

          {/* RIGHT COLUMN (7 cols): MINIMALIST 4-TAB STEP PICKER */}
          <section
            aria-label="Minimalist Emoji Customizer"
            className="lg:col-span-7 rounded-2xl bg-white border-2 border-slate-200/80 shadow-sm p-5 sm:p-6 flex flex-col gap-5"
          >
            {/* Rectangular Segmented Step Bar */}
            <div
              role="tablist"
              aria-label="Customization Steps"
              className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 rounded-xl bg-[#F9F9F9] border border-slate-200"
            >
              {(
                [
                  { id: 'photo', label: '1. EMOJI LIBRARY' },
                  { id: 'motion', label: '2. MOTION' },
                  { id: 'face', label: '3. FACE & TEXT' },
                  { id: 'saved', label: `4. SAVED (${savedPack.length})` },
                ] as Array<{ id: StudioStepTab; label: string }>
              ).map((tab) => {
                const active = activeStep === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveStep(tab.id)}
                    className={`py-2.5 px-3 rounded-lg text-xs font-bold tracking-wider uppercase transition-all cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-[#FF4925] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* TAB 1: BUILT-IN EMOJI LIBRARY & MIX (No Upload/Drop UI) */}
            {activeStep === 'photo' && (
              <div className="space-y-4">
                {/* Category Filter & Search Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(
                      [
                        { id: 'all', label: `All (${allPhotoEmojis.length})` },
                        { id: 'meme-pack', label: '🔥 Memes (54)' },
                        { id: 'split-sheet', label: '✂️ Stickers (69)' },
                        { id: 'crying', label: '😭 Crying' },
                        { id: 'rizz', label: '😎 Rizz' },
                        { id: 'foodie', label: '🍓 Michis' },
                      ] as const
                    ).map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMoodFilter(m.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                          moodFilter === m.id
                            ? 'bg-[#E97A11] text-white'
                            : 'bg-[#F9F9F9] text-slate-600 hover:text-slate-900 border border-slate-200'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {onAddPhotos && (
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF004C] hover:bg-[#FF4925] text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-2xs">
                        <ImagePlus className="w-3.5 h-3.5" />
                        <span>+ Add Photos</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              onAddPhotos(e.target.files);
                              e.target.value = '';
                            }
                          }}
                        />
                      </label>
                    )}

                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search library..."
                      aria-label="Search emoji library"
                      className="w-full sm:w-40 px-3 py-1.5 rounded-lg bg-[#F9F9F9] border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#FF4925]"
                    />
                  </div>
                </div>

                {/* Clean Visual Grid of Reaction Photos */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 max-h-[430px] overflow-y-auto pr-1">
                  {filteredPhotos.map((item) => {
                    const selected = config.photoUrl === item.photoUrl;
                    return (
                      <div
                        key={item.id}
                        onClick={() => onSelectPreset(item.matchingConfig, item)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onSelectPreset(item.matchingConfig, item);
                          }
                        }}
                        aria-label={`Select ${item.name}`}
                        className={`group relative rounded-xl p-2 border flex flex-col items-center text-center transition-all cursor-pointer ${
                          selected
                            ? 'bg-[#FFBA00]/20 border-[#FF4925] shadow-2xs'
                            : 'bg-[#F9F9F9] border-slate-200 hover:border-[#FFBA00]'
                        }`}
                      >
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-white mb-1.5 border border-slate-100">
                          <img
                            {...getCropImgProps(item.photoUrl)}
                            alt={item.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <span className="text-[11px] font-bold text-slate-900 truncate w-full">
                          {item.name}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMixWithStage(item);
                          }}
                          className="mt-1 px-2 py-0.5 rounded bg-[#E8B1C4]/45 hover:bg-[#FF4925] text-[10px] font-bold text-[#FF004C] hover:text-white transition-colors cursor-pointer"
                        >
                          + Mix Duo
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: MOTION BOUNCE (Minimalist 1-Click Presets + Speed Buttons) */}
            {activeStep === 'motion' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
                    Choose Animation Bounce
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {MOTION_PRESETS.map((preset) => {
                      const active = config.motionPreset === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() =>
                            onUpdateConfig((prev) => ({
                              ...prev,
                              motionPreset: preset.id,
                            }))
                          }
                          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                            active
                              ? 'bg-[#FFBA00]/20 border-[#FF4925] text-slate-900 shadow-2xs'
                              : 'bg-[#F9F9F9] border-slate-200 text-slate-700 hover:border-[#FFBA00]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-900">
                              {preset.label}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-[#E97A11] tabular-nums">
                              {preset.recommendedBpm} BPM
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-1">
                            {preset.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Simple 3-Button Speed & Intensity Pickers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <div className="text-xs font-bold text-slate-700 mb-2">
                      Animation Speed
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#F9F9F9] border border-slate-200">
                      {[
                        { label: 'Slow', val: 0.7 },
                        { label: 'Normal', val: 1.0 },
                        { label: 'Fast', val: 1.5 },
                      ].map((s) => (
                        <button
                          key={s.label}
                          type="button"
                          onClick={() =>
                            onUpdateConfig((prev) => ({ ...prev, motionSpeed: s.val }))
                          }
                          className={`py-2 rounded-lg text-xs font-bold cursor-pointer ${
                            Math.abs(config.motionSpeed - s.val) < 0.2
                              ? 'bg-[#FF4925] text-white'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-700 mb-2">
                      Bounce Intensity
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#F9F9F9] border border-slate-200">
                      {[
                        { label: 'Gentle', val: 0.5 },
                        { label: 'Medium', val: 0.85 },
                        { label: 'Hyper', val: 1.2 },
                      ].map((b) => (
                        <button
                          key={b.label}
                          type="button"
                          onClick={() =>
                            onUpdateConfig((prev) => ({
                              ...prev,
                              motionIntensity: b.val,
                            }))
                          }
                          className={`py-2 rounded-lg text-xs font-bold cursor-pointer ${
                            Math.abs(config.motionIntensity - b.val) < 0.18
                              ? 'bg-[#FF4925] text-white'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: FACE, ACCESSORIES & CAPTION TEXT */}
            {activeStep === 'face' && (
              <div className="space-y-5 max-h-[420px] overflow-y-auto pr-1">
                {/* Quick Caption Text Picker */}
                <div>
                  <label
                    htmlFor="caption-text-input"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"
                  >
                    Meme Caption Sticker
                  </label>
                  <input
                    id="caption-text-input"
                    type="text"
                    maxLength={18}
                    value={config.captionText || ''}
                    onChange={(e) =>
                      onUpdateConfig((prev) => ({
                        ...prev,
                        captionText: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="Type short caption (e.g. SO SAD RN)"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F9F9F9] border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#FF4925] mb-2"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_CAPTIONS.map((cap) => (
                      <button
                        key={cap || 'none'}
                        type="button"
                        onClick={() =>
                          onUpdateConfig((prev) => ({ ...prev, captionText: cap }))
                        }
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer ${
                          (config.captionText || '') === cap
                            ? 'bg-[#FF4925] text-white font-bold'
                            : 'bg-[#F9F9F9] text-slate-600 hover:text-slate-900 border border-slate-200'
                        }`}
                      >
                        {cap || 'No Text'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hat / Accessory */}
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Hat & Glasses
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {ACCESSORY_STYLES.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() =>
                          onUpdateConfig((prev) => ({
                            ...prev,
                            accessory: item.id as AccessoryId,
                          }))
                        }
                        className={`py-2 px-2.5 rounded-xl border text-xs font-semibold cursor-pointer truncate ${
                          config.accessory === item.id
                            ? 'bg-[#FF4925] border-[#FF4925] text-white font-bold'
                            : 'bg-[#F9F9F9] border-slate-200 text-slate-700 hover:bg-[#FFBA00]/15'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Particle Effect */}
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Special Particle Effect
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {EFFECT_STYLES.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() =>
                          onUpdateConfig((prev) => ({
                            ...prev,
                            effect: item.id as EffectId,
                          }))
                        }
                        className={`py-2 px-2.5 rounded-xl border text-xs font-semibold cursor-pointer truncate ${
                          config.effect === item.id
                            ? 'bg-[#FF4925] border-[#FF4925] text-white font-bold'
                            : 'bg-[#F9F9F9] border-slate-200 text-slate-700 hover:bg-[#FFBA00]/15'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Frame Shape, Eyes & Mouth */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <label htmlFor="select-shape" className="block text-xs font-bold text-slate-700 mb-1.5">
                      Silhouette Shape
                    </label>
                    <select
                      id="select-shape"
                      value={config.faceShape}
                      onChange={(e) =>
                        onUpdateConfig((prev) => ({
                          ...prev,
                          faceShape: e.target.value as FaceShapeId,
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#F9F9F9] border border-slate-200 text-xs font-medium text-slate-900 cursor-pointer"
                    >
                      {FACE_SHAPES.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="select-eyes" className="block text-xs font-bold text-slate-700 mb-1.5">
                      Cartoon Eyes
                    </label>
                    <select
                      id="select-eyes"
                      value={config.eyes}
                      onChange={(e) =>
                        onUpdateConfig((prev) => ({
                          ...prev,
                          eyes: e.target.value as EyeStyleId,
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#F9F9F9] border border-slate-200 text-xs font-medium text-slate-900 cursor-pointer"
                    >
                      {EYE_STYLES.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="select-mouth" className="block text-xs font-bold text-slate-700 mb-1.5">
                      Cartoon Mouth
                    </label>
                    <select
                      id="select-mouth"
                      value={config.mouth}
                      onChange={(e) =>
                        onUpdateConfig((prev) => ({
                          ...prev,
                          mouth: e.target.value as MouthStyleId,
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#F9F9F9] border border-slate-200 text-xs font-medium text-slate-900 cursor-pointer"
                    >
                      {MOUTH_STYLES.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: SAVED EMOJI PACK */}
            {activeStep === 'saved' && (
              <div className="space-y-3">
                {savedPack.length === 0 ? (
                  <div className="text-center py-12 text-xs text-slate-500">
                    No saved emojis yet. Click &ldquo;Save Emoji&rdquo; on the left stage to add one!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                    {savedPack.map((saved) => (
                      <div
                        key={saved.config.id}
                        onClick={() => onSelectPreset(saved.config)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onSelectPreset(saved.config);
                          }
                        }}
                        className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#F9F9F9] border border-slate-200 hover:border-[#FF4925] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-[#FFBA00] to-[#FF4925] flex items-center justify-center shrink-0">
                            <EmojiRenderer
                              config={saved.config}
                              size={42}
                              animate={false}
                              showShadow={false}
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 truncate">
                              {saved.config.name}
                            </div>
                            <div className="font-mono text-[11px] font-semibold text-[#E97A11] truncate">
                              {saved.config.shortcode}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onCopyShortcode(saved.config.shortcode, saved.config.id);
                            }}
                            aria-label={`Copy shortcode ${saved.config.shortcode}`}
                            className="p-2 rounded-lg bg-white hover:bg-[#FFBA00]/25 border border-slate-200 text-slate-800 cursor-pointer"
                          >
                            {copiedId === saved.config.id ? (
                              <Check className="w-3.5 h-3.5 text-[#8EBE2A]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteSaved(saved.config.id);
                            }}
                            aria-label={`Delete ${saved.config.name}`}
                            className="p-2 rounded-lg bg-white hover:bg-[#FF004C]/15 border border-slate-200 text-[#FF004C] cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

