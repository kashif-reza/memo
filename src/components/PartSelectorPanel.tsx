import React, { useRef, useState } from 'react';
import {
  AccessoryId,
  BrowStyleId,
  CheekStyleId,
  EffectId,
  EmojiConfig,
  EyeStyleId,
  FaceShapeId,
  FeatureFineTune,
  MouthStyleId,
  PhotoMixMode,
} from '../types/emoji';
import {
  ACCESSORY_STYLES,
  BROW_STYLES,
  CHEEK_STYLES,
  COLOR_SWATCHES,
  EFFECT_STYLES,
  EYE_STYLES,
  FACE_SHAPES,
  MOUTH_STYLES,
  STARTER_PRESETS,
} from '../utils/emojiEngine';
import { GIVEN_PHOTO_EMOJIS, mixEmojiConfigs } from '../utils/photoEmojiCatalog';
import { EmojiRenderer } from './EmojiRenderer';
import {
  Sliders,
  Sparkles,
  Smile,
  Eye,
  Crown,
  Palette,
  Camera,
  Blend,
  Upload,
  Scissors,
} from 'lucide-react';
import {
  GivenPhotoItem,
  PhotoCategoryFilter,
} from '../types/emoji';
import {
  MULTI_REACTION_SHEETS,
  createDroppedPhotoEmoji,
  getCropImgProps,
} from '../utils/photoEmojiCatalog';

export type PartCategoryTab = 'photos' | 'base' | 'eyes' | 'mouth' | 'gear' | 'tuning';

interface PartSelectorPanelProps {
  config: EmojiConfig;
  allPhotoEmojis: GivenPhotoItem[];
  onAddDroppedItems: (items: GivenPhotoItem[]) => void;
  onUpdateConfig: (updater: (prev: EmojiConfig) => EmojiConfig) => void;
  onSelectPreset: (preset: EmojiConfig) => void;
  onOpenMixerModal: () => void;
}

export const PartSelectorPanel: React.FC<PartSelectorPanelProps> = ({
  config,
  allPhotoEmojis,
  onAddDroppedItems,
  onUpdateConfig,
  onSelectPreset,
  onOpenMixerModal,
}) => {
  const [activeTab, setActiveTab] = useState<PartCategoryTab>('photos');
  const [photoFilter, setPhotoFilter] = useState<PhotoCategoryFilter>('all');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const updateFineTune = (key: keyof FeatureFineTune, value: number) => {
    onUpdateConfig((prev) => ({
      ...prev,
      fineTune: {
        ...prev.fineTune,
        [key]: value,
      },
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = typeof reader.result === 'string' ? reader.result : null;
        if (dataUrl) {
          const newItem = createDroppedPhotoEmoji(
            dataUrl,
            file.name,
            'wholesome',
            idx + 1
          );
          onAddDroppedItems([newItem]);
          onSelectPreset(newItem.matchingConfig);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const filteredPhotos = allPhotoEmojis.filter((item) => {
    if (photoFilter === 'all') return true;
    return item.category === photoFilter;
  });

  const splitSheetCount = allPhotoEmojis.filter((i) => i.category === 'split-sheet').length;
  const newSoloCount = allPhotoEmojis.filter((i) => i.category === 'new-solo').length;
  const userDropCount = allPhotoEmojis.filter((i) => i.category === 'user-drop').length;

  const tabs: Array<{ id: PartCategoryTab; label: string; icon: React.ReactNode }> = [
    {
      id: 'photos',
      label: `Photos (${allPhotoEmojis.length})`,
      icon: <Camera className="w-3.5 h-3.5 shrink-0" />,
    },
    { id: 'base', label: 'Base', icon: <Palette className="w-3.5 h-3.5 shrink-0" /> },
    { id: 'eyes', label: 'Eyes', icon: <Eye className="w-3.5 h-3.5 shrink-0" /> },
    { id: 'mouth', label: 'Mouth', icon: <Smile className="w-3.5 h-3.5 shrink-0" /> },
    { id: 'gear', label: 'Gear & FX', icon: <Crown className="w-3.5 h-3.5 shrink-0" /> },
    { id: 'tuning', label: 'Rig Tune', icon: <Sliders className="w-3.5 h-3.5 shrink-0" /> },
  ];

  const mixModes: Array<{ id: PhotoMixMode; label: string }> = [
    { id: 'cutout-solo', label: 'Realistic Cutout' },
    { id: 'vector-overlay', label: 'Photo + Vector' },
    { id: 'duo-collab', label: 'Duo Collab' },
    { id: 'cross-morph', label: 'Cross-Morph' },
    { id: 'none', label: 'Vector Only' },
  ];

  return (
    <aside
      aria-label="Emoji Parts and Appearance Customizer"
      className="w-full lg:w-[380px] shrink-0 bg-white/95 dark:bg-slate-900 border-b lg:border-b-0 lg:border-r border-amber-200/80 dark:border-slate-800 flex flex-col h-full overflow-hidden"
    >
      {/* Category Navigation Bar */}
      <div className="p-3 border-b border-amber-200/70 dark:border-slate-800 bg-amber-50/60 dark:bg-slate-950/50">
        <div
          role="tablist"
          aria-label="Customization categories"
          className="grid grid-cols-3 gap-1.5 p-1 bg-amber-100/70 dark:bg-slate-800/80 rounded-lg"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable Category Inspector */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {activeTab === 'photos' && (
          <>
            {/* Quick CTA to Open 2-Slot Mixer Lab */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-amber-100/80 via-rose-100/70 to-amber-100/80 dark:from-amber-500/10 dark:to-rose-500/10 border border-amber-300 dark:border-amber-500/30 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Emoji & Photo Mixer Lab
                </div>
                <div className="text-[11px] text-slate-700 dark:text-slate-300 truncate">
                  Fuse any 2 solo reactions or dropped photos
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenMixerModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Blend className="w-3.5 h-3.5" />
                <span>Open Mixer</span>
              </button>
            </div>

            {/* Realistic Photo Mode & Meme Caption Controls */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  01. Photo Render & Mashup Mode
                </h2>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="sr-only"
                  aria-label="Upload Custom Photo"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  <Upload className="w-3 h-3" />
                  <span>+ Drop / Upload Photos</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {mixModes.map((m) => {
                  const currentMode =
                    config.photoMixMode || (config.photoUrl ? 'cutout-solo' : 'none');
                  const active = currentMode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() =>
                        onUpdateConfig((prev) => ({
                          ...prev,
                          photoUrl:
                            m.id !== 'none' && !prev.photoUrl
                              ? allPhotoEmojis[0].photoUrl
                              : prev.photoUrl,
                          secondaryPhotoUrl:
                            (m.id === 'duo-collab' || m.id === 'cross-morph') &&
                            !prev.secondaryPhotoUrl
                              ? allPhotoEmojis[1]?.photoUrl || allPhotoEmojis[0].photoUrl
                              : prev.secondaryPhotoUrl,
                          photoMixMode: m.id,
                        }))
                      }
                      className={`px-2 py-1.5 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap truncate ${
                        active
                          ? 'border-amber-500 bg-amber-500/20 text-slate-900 dark:text-amber-300 font-bold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-amber-300'
                      }`}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>

              {/* Meme Caption Input */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="meme-caption-input"
                  className="text-xs font-medium text-slate-600 dark:text-slate-400 shrink-0"
                >
                  Caption:
                </label>
                <input
                  id="meme-caption-input"
                  type="text"
                  maxLength={18}
                  placeholder="e.g. SO SAD RN, 10/10 RIZZ"
                  value={config.captionText || ''}
                  onChange={(e) =>
                    onUpdateConfig((prev) => ({
                      ...prev,
                      captionText: e.target.value.toUpperCase(),
                    }))
                  }
                  className="flex-1 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-slate-800 bg-amber-50/40 dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </section>

            {/* Separated Sticker Sheets Summary Badge */}
            <div className="p-2.5 rounded-xl bg-rose-50/90 dark:bg-slate-800/60 border border-rose-200/80 dark:border-slate-700 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Scissors className="w-4 h-4 text-rose-500 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-slate-800 dark:text-slate-100 truncate">
                    {MULTI_REACTION_SHEETS.length} Multi-Reaction Sheets Separated
                  </div>
                  <div className="text-[10px] text-slate-600 dark:text-slate-400 truncate">
                    Extracted {splitSheetCount} solo cat, dog & michi reaction emojis
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setPhotoFilter((prev) => (prev === 'split-sheet' ? 'all' : 'split-sheet'))
                }
                className="px-2 py-1 rounded-md bg-rose-500 hover:bg-rose-400 text-white text-[10px] font-bold whitespace-nowrap shrink-0 cursor-pointer"
              >
                {photoFilter === 'split-sheet' ? 'Show All' : `View ${splitSheetCount} Solo`}
              </button>
            </div>

            {/* All Solo Reaction Photos Grid with Category Filter Tabs */}
            <section className="pt-2 border-t border-amber-200/70 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  02. Solo Reaction Emojis ({filteredPhotos.length})
                </h2>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Click Solo or +Mix
                </span>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap gap-1">
                {[
                  { id: 'all' as const, label: `All (${allPhotoEmojis.length})` },
                  { id: 'split-sheet' as const, label: `Split Sheets (${splitSheetCount})` },
                  { id: 'new-solo' as const, label: `New Solo (${newSoloCount})` },
                  ...(userDropCount > 0
                    ? [{ id: 'user-drop' as const, label: `My Drops (${userDropCount})` }]
                    : []),
                  { id: 'original' as const, label: 'Classics (16)' },
                ].map((f) => {
                  const active = photoFilter === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setPhotoFilter(f.id)}
                      className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-colors cursor-pointer ${
                        active
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-amber-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-100'
                      }`}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {filteredPhotos.map((item) => {
                  const isPrimary = config.photoUrl === item.photoUrl;
                  const thumbProps = getCropImgProps(item.photoUrl);
                  return (
                    <div
                      key={item.id}
                      className={`flex flex-col p-2 rounded-xl border transition-all ${
                        isPrimary
                          ? 'border-amber-500 bg-amber-500/15 shadow-2xs'
                          : 'border-amber-200/80 dark:border-slate-800 bg-amber-50/30 dark:bg-slate-950/50 hover:border-amber-400 dark:hover:border-slate-700'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => onSelectPreset(item.matchingConfig)}
                        className="flex items-center gap-2 text-left cursor-pointer group"
                      >
                        <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-amber-300/80 dark:border-slate-700 bg-white">
                          <img
                            {...thumbProps}
                            alt={item.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 transition-colors truncate">
                            {item.name}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                            {item.sourceSheetName ? `✂️ ${item.sourceSheetName}` : item.vibeTag}
                          </div>
                        </div>
                      </button>

                      <div className="flex items-center justify-between gap-1 mt-2 pt-1.5 border-t border-amber-200/60 dark:border-slate-800/70">
                        <button
                          type="button"
                          onClick={() => onSelectPreset(item.matchingConfig)}
                          className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                        >
                          Solo Emoji
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const mixed = mixEmojiConfigs(
                              config,
                              item.matchingConfig,
                              config.photoUrl && config.photoUrl !== item.photoUrl
                                ? 'duo-collab'
                                : 'vector-overlay'
                            );
                            onSelectPreset(mixed);
                          }}
                          className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/35 text-amber-800 dark:text-amber-300 text-[10px] font-bold cursor-pointer whitespace-nowrap"
                        >
                          + Mix With Active
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {activeTab === 'base' && (
          <>
            {/* Silhouette Picker */}
            <section>
              <div className="flex items-center justify-between mb-2.5">
                <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  01. Head Silhouette (Clips Photo & Vector)
                </h2>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                  {FACE_SHAPES.length} shapes
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {FACE_SHAPES.map((shape) => {
                  const selected = config.faceShape === shape.id;
                  return (
                    <button
                      key={shape.id}
                      type="button"
                      onClick={() =>
                        onUpdateConfig((prev) => ({ ...prev, faceShape: shape.id as FaceShapeId }))
                      }
                      className={`flex items-center gap-2.5 p-2 rounded-lg border text-left transition-all cursor-pointer ${
                        selected
                          ? 'border-amber-500 bg-amber-500/10 text-slate-900 dark:text-white'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="w-10 h-10 shrink-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800/80 rounded-md overflow-hidden">
                        <EmojiRenderer
                          config={{
                            ...config,
                            faceShape: shape.id,
                            effect: 'none',
                            accessory: 'none',
                            captionText: '',
                          }}
                          size={36}
                          animate={false}
                          showShadow={false}
                        />
                      </div>
                      <span className="text-xs font-medium truncate">{shape.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Color Swatches */}
            <section className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2.5">
                <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  02. Surface Palette
                </h2>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateConfig((prev) => ({ ...prev, has3DShading: !prev.has3DShading }))
                  }
                  className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline cursor-pointer whitespace-nowrap"
                >
                  {config.has3DShading ? '3D Gloss: On' : 'Flat Vector: On'}
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {COLOR_SWATCHES.map((swatch) => {
                  const isActive =
                    config.primaryColor.toLowerCase() === swatch.primary.toLowerCase();
                  return (
                    <button
                      key={swatch.name}
                      type="button"
                      onClick={() =>
                        onUpdateConfig((prev) => ({
                          ...prev,
                          primaryColor: swatch.primary,
                          secondaryColor: swatch.secondary,
                          outlineColor: swatch.outline,
                        }))
                      }
                      aria-label={`Apply ${swatch.name} color theme`}
                      className={`group flex flex-col items-center gap-1 p-1.5 rounded-lg border transition-all cursor-pointer ${
                        isActive
                          ? 'border-amber-500 bg-amber-500/10'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <span
                        className="w-7 h-7 rounded-full border border-black/15 shadow-inner"
                        style={{
                          background: `radial-gradient(circle at 35% 30%, ${swatch.primary}, ${swatch.secondary})`,
                        }}
                      />
                      <span className="text-[11px] text-slate-600 dark:text-slate-400 truncate max-w-full">
                        {swatch.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Color Inputs */}
              <div className="grid grid-cols-3 gap-2.5">
                <label className="flex flex-col gap-1 text-xs text-slate-600 dark:text-slate-400">
                  <span>Primary</span>
                  <div className="flex items-center gap-1.5 p-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                    <input
                      type="color"
                      aria-label="Primary Face Color"
                      value={config.primaryColor}
                      onChange={(e) =>
                        onUpdateConfig((prev) => ({ ...prev, primaryColor: e.target.value }))
                      }
                      className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <span className="font-mono text-[11px] uppercase tabular-nums">
                      {config.primaryColor}
                    </span>
                  </div>
                </label>
                <label className="flex flex-col gap-1 text-xs text-slate-600 dark:text-slate-400">
                  <span>Shadow</span>
                  <div className="flex items-center gap-1.5 p-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                    <input
                      type="color"
                      aria-label="Secondary Gradient Color"
                      value={config.secondaryColor}
                      onChange={(e) =>
                        onUpdateConfig((prev) => ({ ...prev, secondaryColor: e.target.value }))
                      }
                      className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <span className="font-mono text-[11px] uppercase tabular-nums">
                      {config.secondaryColor}
                    </span>
                  </div>
                </label>
                <label className="flex flex-col gap-1 text-xs text-slate-600 dark:text-slate-400">
                  <span>Outline</span>
                  <div className="flex items-center gap-1.5 p-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                    <input
                      type="color"
                      aria-label="Outline Stroke Color"
                      value={config.outlineColor}
                      onChange={(e) =>
                        onUpdateConfig((prev) => ({ ...prev, outlineColor: e.target.value }))
                      }
                      className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <span className="font-mono text-[11px] uppercase tabular-nums">
                      {config.outlineColor}
                    </span>
                  </div>
                </label>
              </div>
            </section>

            {/* Vector Starter Presets */}
            <section className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  03. Classic Vector Rigs
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {STARTER_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onSelectPreset(preset)}
                    className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-amber-500/60 bg-slate-50/60 dark:bg-slate-950/60 text-left transition-all cursor-pointer"
                  >
                    <EmojiRenderer config={preset} size={32} animate={false} showShadow={false} />
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </>
        )}

        {activeTab === 'eyes' && (
          <>
            <section>
              <div className="flex items-center justify-between mb-2.5">
                <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  01. Eye Expression
                </h2>
                <label className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span>Iris</span>
                  <input
                    type="color"
                    aria-label="Eye Iris Color"
                    value={config.eyeColor}
                    onChange={(e) =>
                      onUpdateConfig((prev) => ({ ...prev, eyeColor: e.target.value }))
                    }
                    className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent"
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {EYE_STYLES.map((eye) => {
                  const selected = config.eyes === eye.id;
                  return (
                    <button
                      key={eye.id}
                      type="button"
                      onClick={() =>
                        onUpdateConfig((prev) => ({
                          ...prev,
                          eyes: eye.id as EyeStyleId,
                          photoMixMode:
                            prev.photoUrl && prev.photoMixMode === 'cutout-solo'
                              ? 'vector-overlay'
                              : prev.photoMixMode,
                        }))
                      }
                      className={`flex items-center gap-2.5 p-2 rounded-lg border text-left transition-all cursor-pointer ${
                        selected
                          ? 'border-amber-500 bg-amber-500/10 text-slate-900 dark:text-white'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="w-10 h-10 shrink-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800/80 rounded-md">
                        <EmojiRenderer
                          config={{
                            ...config,
                            photoUrl: null,
                            eyes: eye.id,
                            accessory: 'none',
                            effect: 'none',
                            captionText: '',
                          }}
                          size={36}
                          animate={false}
                          showShadow={false}
                        />
                      </div>
                      <span className="text-xs font-medium truncate">{eye.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-2.5">
                02. Eyebrows
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {BROW_STYLES.map((brow) => {
                  const selected = config.brows === brow.id;
                  return (
                    <button
                      key={brow.id}
                      type="button"
                      onClick={() =>
                        onUpdateConfig((prev) => ({
                          ...prev,
                          brows: brow.id as BrowStyleId,
                          photoMixMode:
                            prev.photoUrl && prev.photoMixMode === 'cutout-solo'
                              ? 'vector-overlay'
                              : prev.photoMixMode,
                        }))
                      }
                      className={`px-3 py-2 rounded-lg border text-xs font-medium text-left transition-all cursor-pointer truncate ${
                        selected
                          ? 'border-amber-500 bg-amber-500/10 text-slate-900 dark:text-white'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {brow.label}
                    </button>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {activeTab === 'mouth' && (
          <>
            <section>
              <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-2.5">
                01. Mouth & Lip Shape
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {MOUTH_STYLES.map((mouth) => {
                  const selected = config.mouth === mouth.id;
                  return (
                    <button
                      key={mouth.id}
                      type="button"
                      onClick={() =>
                        onUpdateConfig((prev) => ({
                          ...prev,
                          mouth: mouth.id as MouthStyleId,
                          photoMixMode:
                            prev.photoUrl && prev.photoMixMode === 'cutout-solo'
                              ? 'vector-overlay'
                              : prev.photoMixMode,
                        }))
                      }
                      className={`flex items-center gap-2.5 p-2 rounded-lg border text-left transition-all cursor-pointer ${
                        selected
                          ? 'border-amber-500 bg-amber-500/10 text-slate-900 dark:text-white'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="w-10 h-10 shrink-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800/80 rounded-md">
                        <EmojiRenderer
                          config={{
                            ...config,
                            photoUrl: null,
                            mouth: mouth.id,
                            accessory: 'none',
                            effect: 'none',
                            captionText: '',
                          }}
                          size={36}
                          animate={false}
                          showShadow={false}
                        />
                      </div>
                      <span className="text-xs font-medium truncate">{mouth.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2.5">
                <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  02. Cheek & Face Marks
                </h2>
                <label className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span>Tint</span>
                  <input
                    type="color"
                    aria-label="Cheek Tint Color"
                    value={config.cheekColor}
                    onChange={(e) =>
                      onUpdateConfig((prev) => ({ ...prev, cheekColor: e.target.value }))
                    }
                    className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent"
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {CHEEK_STYLES.map((cheek) => {
                  const selected = config.cheeks === cheek.id;
                  return (
                    <button
                      key={cheek.id}
                      type="button"
                      onClick={() =>
                        onUpdateConfig((prev) => ({
                          ...prev,
                          cheeks: cheek.id as CheekStyleId,
                          photoMixMode:
                            prev.photoUrl && prev.photoMixMode === 'cutout-solo'
                              ? 'vector-overlay'
                              : prev.photoMixMode,
                        }))
                      }
                      className={`px-3 py-2 rounded-lg border text-xs font-medium text-left transition-all cursor-pointer truncate ${
                        selected
                          ? 'border-amber-500 bg-amber-500/10 text-slate-900 dark:text-white'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {cheek.label}
                    </button>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {activeTab === 'gear' && (
          <>
            <section>
              <div className="flex items-center justify-between mb-2.5">
                <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  01. Headgear & Props (Works on Photos & Vector)
                </h2>
                <label className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span>Accent</span>
                  <input
                    type="color"
                    aria-label="Accessory Accent Color"
                    value={config.accessoryColor}
                    onChange={(e) =>
                      onUpdateConfig((prev) => ({ ...prev, accessoryColor: e.target.value }))
                    }
                    className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent"
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {ACCESSORY_STYLES.map((acc) => {
                  const selected = config.accessory === acc.id;
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() =>
                        onUpdateConfig((prev) => ({ ...prev, accessory: acc.id as AccessoryId }))
                      }
                      className={`flex items-center gap-2.5 p-2 rounded-lg border text-left transition-all cursor-pointer ${
                        selected
                          ? 'border-amber-500 bg-amber-500/10 text-slate-900 dark:text-white'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="w-10 h-10 shrink-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800/80 rounded-md">
                        <EmojiRenderer
                          config={{
                            ...config,
                            accessory: acc.id,
                            effect: 'none',
                            captionText: '',
                          }}
                          size={36}
                          animate={false}
                          showShadow={false}
                        />
                      </div>
                      <span className="text-xs font-medium truncate">{acc.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2.5">
                <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  02. Ambient Particle FX
                </h2>
                <label className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span>FX Glow</span>
                  <input
                    type="color"
                    aria-label="Particle Effect Color"
                    value={config.effectColor}
                    onChange={(e) =>
                      onUpdateConfig((prev) => ({ ...prev, effectColor: e.target.value }))
                    }
                    className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent"
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {EFFECT_STYLES.map((fx) => {
                  const selected = config.effect === fx.id;
                  return (
                    <button
                      key={fx.id}
                      type="button"
                      onClick={() =>
                        onUpdateConfig((prev) => ({ ...prev, effect: fx.id as EffectId }))
                      }
                      className={`px-3 py-2 rounded-lg border text-xs font-medium text-left transition-all cursor-pointer truncate ${
                        selected
                          ? 'border-amber-500 bg-amber-500/10 text-slate-900 dark:text-white'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {fx.label}
                    </button>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {activeTab === 'tuning' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Photo & Facial Proportions
              </h2>
              <button
                type="button"
                onClick={() =>
                  onUpdateConfig((prev) => ({
                    ...prev,
                    photoScale: 1.1,
                    photoOffsetY: 0,
                    outlineWidth: 4,
                    fineTune: {
                      faceScale: 1,
                      eyeScale: 1,
                      eyeSpacing: 0,
                      eyeOffsetY: 0,
                      mouthScale: 1,
                      mouthOffsetY: 0,
                      gearOffsetY: 0,
                      gearRotation: 0,
                    },
                  }))
                }
                className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
              >
                Reset Sliders
              </button>
            </div>

            {/* Photo Crop Zoom & Offset Sliders */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <label
                  htmlFor="tune-photo-scale"
                  className="font-medium text-slate-700 dark:text-slate-300"
                >
                  Photo Crop Zoom
                </label>
                <span className="font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                  {Math.round((config.photoScale ?? 1.1) * 100)}%
                </span>
              </div>
              <input
                id="tune-photo-scale"
                type="range"
                min={0.8}
                max={1.6}
                step={0.02}
                value={config.photoScale ?? 1.1}
                onChange={(e) =>
                  onUpdateConfig((prev) => ({
                    ...prev,
                    photoScale: parseFloat(e.target.value),
                  }))
                }
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <label
                  htmlFor="tune-photo-offset-y"
                  className="font-medium text-slate-700 dark:text-slate-300"
                >
                  Photo Vertical Pan Y
                </label>
                <span className="font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                  {config.photoOffsetY ?? 0}px
                </span>
              </div>
              <input
                id="tune-photo-offset-y"
                type="range"
                min={-25}
                max={25}
                step={1}
                value={config.photoOffsetY ?? 0}
                onChange={(e) =>
                  onUpdateConfig((prev) => ({
                    ...prev,
                    photoOffsetY: parseFloat(e.target.value),
                  }))
                }
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {[
              {
                label: 'Eye Size',
                key: 'eyeScale' as const,
                min: 0.7,
                max: 1.4,
                step: 0.02,
                val: config.fineTune.eyeScale,
                fmt: (v: number) => `${Math.round(v * 100)}%`,
              },
              {
                label: 'Eye Spacing',
                key: 'eyeSpacing' as const,
                min: -14,
                max: 14,
                step: 1,
                val: config.fineTune.eyeSpacing,
                fmt: (v: number) => `${v > 0 ? '+' : ''}${v}px`,
              },
              {
                label: 'Eye Height Y',
                key: 'eyeOffsetY' as const,
                min: -14,
                max: 14,
                step: 1,
                val: config.fineTune.eyeOffsetY,
                fmt: (v: number) => `${v > 0 ? '+' : ''}${v}px`,
              },
              {
                label: 'Mouth Scale',
                key: 'mouthScale' as const,
                min: 0.7,
                max: 1.4,
                step: 0.02,
                val: config.fineTune.mouthScale,
                fmt: (v: number) => `${Math.round(v * 100)}%`,
              },
              {
                label: 'Gear Tilt Angle',
                key: 'gearRotation' as const,
                min: -25,
                max: 25,
                step: 1,
                val: config.fineTune.gearRotation,
                fmt: (v: number) => `${v > 0 ? '+' : ''}${v}°`,
              },
            ].map((slider) => (
              <div key={slider.key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label
                    htmlFor={`tune-${slider.key}`}
                    className="font-medium text-slate-700 dark:text-slate-300"
                  >
                    {slider.label}
                  </label>
                  <span className="font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                    {slider.fmt(slider.val)}
                  </span>
                </div>
                <input
                  id={`tune-${slider.key}`}
                  type="range"
                  min={slider.min}
                  max={slider.max}
                  step={slider.step}
                  value={slider.val}
                  onChange={(e) => updateFineTune(slider.key, parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            ))}
          </section>
        )}
      </div>
    </aside>
  );
};
