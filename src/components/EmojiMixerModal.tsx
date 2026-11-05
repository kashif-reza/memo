import React, { useState } from 'react';
import { EmojiConfig, GivenPhotoItem, PhotoMixMode } from '../types/emoji';
import { STARTER_PRESETS } from '../utils/emojiEngine';
import {
  GIVEN_PHOTO_EMOJIS,
  getCropImgProps,
  mixEmojiConfigs,
  randomizePhotoCombo,
} from '../utils/photoEmojiCatalog';
import { EmojiRenderer } from './EmojiRenderer';
import { X, Shuffle, Sparkles, ArrowRight, Plus, Check } from 'lucide-react';

interface EmojiMixerModalProps {
  isOpen: boolean;
  allPhotoEmojis?: GivenPhotoItem[];
  onClose: () => void;
  onApplyMix: (mixedConfig: EmojiConfig) => void;
  onSaveMixToPack: (mixedConfig: EmojiConfig) => void;
}

export const EmojiMixerModal: React.FC<EmojiMixerModalProps> = ({
  isOpen,
  allPhotoEmojis = GIVEN_PHOTO_EMOJIS,
  onClose,
  onApplyMix,
  onSaveMixToPack,
}) => {
  // Combine all realistic photo configs (including user drops + split sheet solo emojis) + 6 vector rigs
  const allPool: EmojiConfig[] = [
    ...allPhotoEmojis.map((item) => item.matchingConfig),
    ...STARTER_PRESETS,
  ];

  const [slotAId, setSlotAId] = useState<string>(allPhotoEmojis[0]?.id || GIVEN_PHOTO_EMOJIS[0].id);
  const [slotBId, setSlotBId] = useState<string>(allPhotoEmojis[14]?.id || GIVEN_PHOTO_EMOJIS[5].id);
  const [mixMode, setMixMode] = useState<PhotoMixMode>('duo-collab');
  const [savedToast, setSavedToast] = useState<boolean>(false);

  if (!isOpen) return null;

  const parentA = allPool.find((item) => item.id === slotAId) || allPool[0];
  const parentB = allPool.find((item) => item.id === slotBId) || allPool[1];

  const mixedResult = mixEmojiConfigs(parentA, parentB, mixMode);

  const handleRandomizeSlots = () => {
    const combo = randomizePhotoCombo(undefined, allPhotoEmojis);
    setSlotAId(combo.parentA.id);
    setSlotBId(combo.parentB.id);
    const modes: PhotoMixMode[] = ['duo-collab', 'vector-overlay', 'cross-morph', 'cutout-solo'];
    setMixMode(modes[Math.floor(Math.random() * modes.length)]);
  };

  const handleSaveToPack = () => {
    onSaveMixToPack(mixedResult);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 1600);
  };

  const fusionModes: Array<{ id: PhotoMixMode; label: string; desc: string }> = [
    {
      id: 'duo-collab',
      label: 'Duo Collab Sticker',
      desc: 'Both Photo A & Photo B bounce together side-by-side',
    },
    {
      id: 'vector-overlay',
      label: 'Photo + Vector Face',
      desc: 'Photo A portrait fused with Slot B animated eyes, mouth & gear',
    },
    {
      id: 'cross-morph',
      label: 'Kinetic Cross-Morph',
      desc: 'Rhythmically morphs between Photo A & Photo B in motion',
    },
    {
      id: 'cutout-solo',
      label: 'Cutout + Gear Splice',
      desc: 'Photo A cutout inside Slot B silhouette, hat, aura & physics',
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="emoji-mixer-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
    >
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-200/80 dark:border-slate-800 bg-amber-50/60 dark:bg-slate-900">
          <div>
            <h2
              id="emoji-mixer-title"
              className="text-lg font-bold text-slate-900 dark:text-slate-100"
            >
              Emoji & Realistic Photo Mixer Lab
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Mix any two solo reaction photos, separated sticker sheet emojis, or dropped images together.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRandomizeSlots}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Roll Random Combo</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Emoji Mixer Lab"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-amber-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Fusion Stage: Slot A + Slot B = Live Fused Result */}
          <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center p-5 rounded-2xl delightful-studio-bg dark:bg-slate-950/70 border border-amber-200 dark:border-slate-800">
            {/* Slot A Card */}
            <div className="lg:col-span-3 flex flex-col items-center p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-slate-800 shadow-2xs">
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1">
                Base Parent A
              </span>
              <div className="w-28 h-28 flex items-center justify-center backdrop-sunny-pop rounded-xl border border-amber-200 dark:border-slate-800 overflow-hidden">
                <EmojiRenderer config={parentA} size={96} animate={true} showShadow={false} />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-2 truncate max-w-full">
                {parentA.name}
              </span>
              <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400">
                {parentA.shortcode}
              </span>
            </div>

            {/* Plus Operator */}
            <div className="lg:col-span-1 flex items-center justify-center">
              <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-slate-800 flex items-center justify-center text-amber-700 dark:text-slate-300">
                <Plus className="w-5 h-5" />
              </div>
            </div>

            {/* Slot B Card */}
            <div className="lg:col-span-3 flex flex-col items-center p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-slate-800 shadow-2xs">
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1">
                Modifier Parent B
              </span>
              <div className="w-28 h-28 flex items-center justify-center backdrop-peach-fizz rounded-xl border border-rose-200 dark:border-slate-800 overflow-hidden">
                <EmojiRenderer config={parentB} size={96} animate={true} showShadow={false} />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-2 truncate max-w-full">
                {parentB.name}
              </span>
              <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400">
                {parentB.shortcode}
              </span>
            </div>

            {/* Arrow Operator */}
            <div className="lg:col-span-1 flex items-center justify-center">
              <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>

            {/* Live Mixed Output Stage */}
            <div className="lg:col-span-3 flex flex-col items-center p-3 rounded-xl bg-white dark:bg-slate-900 border-2 border-amber-500 shadow-md">
              <span className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400 mb-1">
                Fused Hybrid Emoji
              </span>
              <div className="w-32 h-32 flex items-center justify-center backdrop-sunny-pop rounded-xl border border-amber-300 dark:border-slate-800 overflow-hidden">
                <EmojiRenderer config={mixedResult} size={116} animate={true} showShadow={false} />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-2 truncate max-w-full">
                {mixedResult.name}
              </span>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                {mixedResult.shortcode} · {mixedResult.motionPreset}
              </span>
            </div>
          </div>

          {/* Fusion Mode Selector */}
          <div>
            <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Fusion Style
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {fusionModes.map((m) => {
                const active = mixMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMixMode(m.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      active
                        ? 'border-amber-500 bg-amber-500/10 text-slate-900 dark:text-white'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="text-xs font-semibold">{m.label}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                      {m.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dual Picker Grids for Parent A & Parent B */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Picker A */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  01. Choose Parent A ({allPool.length} photos & rigs)
                </h3>
                <span className="text-[11px] font-mono text-amber-500">{parentA.name}</span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-56 overflow-y-auto p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                {allPool.map((item) => {
                  const selected = item.id === slotAId;
                  const thumbProps = getCropImgProps(item.photoUrl);
                  return (
                    <button
                      key={`a-${item.id}`}
                      type="button"
                      onClick={() => setSlotAId(item.id)}
                      className={`flex flex-col items-center p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                        selected
                          ? 'border-amber-500 bg-amber-500/15'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-md overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                        {item.photoUrl ? (
                          <img
                            {...thumbProps}
                            alt={item.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <EmojiRenderer config={item} size={36} animate={false} showShadow={false} />
                        )}
                      </div>
                      <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300 truncate w-full mt-1">
                        {item.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Picker B */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  02. Choose Parent B ({allPool.length} photos & rigs)
                </h3>
                <span className="text-[11px] font-mono text-amber-500">{parentB.name}</span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-56 overflow-y-auto p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                {allPool.map((item) => {
                  const selected = item.id === slotBId;
                  const thumbProps = getCropImgProps(item.photoUrl);
                  return (
                    <button
                      key={`b-${item.id}`}
                      type="button"
                      onClick={() => setSlotBId(item.id)}
                      className={`flex flex-col items-center p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                        selected
                          ? 'border-amber-500 bg-amber-500/15'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-md overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                        {item.photoUrl ? (
                          <img
                            {...thumbProps}
                            alt={item.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <EmojiRenderer config={item} size={36} animate={false} showShadow={false} />
                        )}
                      </div>
                      <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300 truncate w-full mt-1">
                        {item.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Fused Rig: <strong className="text-slate-800 dark:text-slate-200">{mixedResult.name}</strong> ({mixedResult.shortcode})
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleSaveToPack}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {savedToast ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Saved to Pack!</span>
                </>
              ) : (
                <span>Save Mix to Pack</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                onApplyMix(mixedResult);
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Load Mix into Studio</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
