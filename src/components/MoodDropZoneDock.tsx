import React, { useRef, useState } from 'react';
import { EmojiConfig, GivenPhotoItem, MoodVibeId } from '../types/emoji';
import {
  MULTI_REACTION_SHEETS,
  computeSheetGridSlices,
  createDroppedPhotoEmoji,
  mixEmojiConfigs,
} from '../utils/photoEmojiCatalog';
import {
  Upload,
  Shuffle,
  Scissors,
  Sparkles,
  Plus,
  Check,
  ImagePlus,
} from 'lucide-react';

interface MoodDropZoneDockProps {
  activeConfig: EmojiConfig;
  userDroppedItems: GivenPhotoItem[];
  selectedMood: MoodVibeId;
  onChangeMood: (mood: MoodVibeId) => void;
  onAddDroppedItems: (items: GivenPhotoItem[]) => void;
  onSelectEmoji: (config: EmojiConfig) => void;
  onRollMoodMixture: (mood: MoodVibeId) => void;
  onOpenMixerModal: () => void;
}

const MOOD_PILLS: Array<{ id: MoodVibeId; label: string; badge: string }> = [
  { id: 'all', label: 'All Moods', badge: '✨' },
  { id: 'crying', label: 'Crying & Sad', badge: '😭' },
  { id: 'rizz', label: 'Rizz & Cool', badge: '😎' },
  { id: 'wholesome', label: 'Wholesome', badge: '💖' },
  { id: 'foodie', label: 'Foodie Michis', badge: '🍓' },
  { id: 'chaotic', label: 'Chaotic Vibe', badge: '🔥' },
];

export const MoodDropZoneDock: React.FC<MoodDropZoneDockProps> = ({
  activeConfig,
  userDroppedItems,
  selectedMood,
  onChangeMood,
  onAddDroppedItems,
  onSelectEmoji,
  onRollMoodMixture,
  onOpenMixerModal,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [autoSplitOnDrop, setAutoSplitOnDrop] = useState(false);
  const [splitGridPreset, setSplitGridPreset] = useState<'2x2' | '3x3' | '3x4'>('3x3');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 2600);
  };

  /**
   * Client-side HTML5 Canvas slicer that separates a multi-reaction sticker sheet
   * into individual solo reaction data URLs and registers each as a solo emoji.
   */
  const sliceImageUrlIntoSoloEmojis = (
    srcUrl: string,
    baseTitle: string,
    rows: number,
    cols: number
  ) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const boxes = computeSheetGridSlices(
        img.naturalWidth || 600,
        img.naturalHeight || 800,
        rows,
        cols,
        0.04
      );
      const created: GivenPhotoItem[] = [];
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      boxes.forEach((box, idx) => {
        canvas.width = box.width;
        canvas.height = box.height;
        ctx.clearRect(0, 0, box.width, box.height);
        ctx.drawImage(
          img,
          box.x,
          box.y,
          box.width,
          box.height,
          0,
          0,
          box.width,
          box.height
        );
        const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        const soloItem = createDroppedPhotoEmoji(
          croppedDataUrl,
          `${baseTitle} Solo ${idx + 1}`,
          selectedMood === 'all' ? 'chaotic' : selectedMood,
          idx + 1
        );
        created.push(soloItem);
      });

      if (created.length > 0) {
        onAddDroppedItems(created);
        onSelectEmoji(created[0].matchingConfig);
        showToast(`Separated ${created.length} solo reaction emojis from ${baseTitle}!`);
      }
    };
    img.src = srcUrl;
  };

  const processFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileArray.length === 0) return;

    const [rows, cols] = splitGridPreset.split('x').map(Number);

    fileArray.forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = typeof reader.result === 'string' ? reader.result : null;
        if (!dataUrl) return;

        if (autoSplitOnDrop) {
          sliceImageUrlIntoSoloEmojis(
            dataUrl,
            file.name.replace(/\.[^/.]+$/, ''),
            rows,
            cols
          );
        } else {
          const item = createDroppedPhotoEmoji(
            dataUrl,
            file.name,
            selectedMood === 'all' ? 'wholesome' : selectedMood,
            userDroppedItems.length + idx + 1
          );
          onAddDroppedItems([item]);
          // Automatically mix or load the newly dropped image
          if (userDroppedItems.length > 0 || activeConfig.photoUrl) {
            const mixed = mixEmojiConfigs(
              item.matchingConfig,
              activeConfig,
              'duo-collab'
            );
            onSelectEmoji(mixed);
            showToast(`Dropped "${item.name}" & mixed with active emoji!`);
          } else {
            onSelectEmoji(item.matchingConfig);
            showToast(`Added "${item.name}" to your Mood Drop Mix pool!`);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  return (
    <div
      aria-label="Continuous Mood Image Drop and Mixture Zone"
      className="w-full max-w-2xl rounded-2xl bg-gradient-to-r from-amber-50/95 via-rose-50/90 to-sky-50/95 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 border-2 border-amber-300/80 dark:border-amber-500/40 shadow-sm p-3.5 space-y-3"
    >
      {/* Top Row: Drop Zone + Instant Mood Mixture Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Interactive Drag & Drop Target */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Drop reaction images or multi-reaction sticker sheets here to mix"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className={`flex-1 flex items-center gap-3 px-3.5 py-2.5 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
            isDragging
              ? 'border-amber-500 bg-amber-100/80 dark:bg-amber-500/20 scale-[1.01]'
              : 'border-amber-400/90 dark:border-amber-500/50 bg-white/90 dark:bg-slate-950/70 hover:border-amber-500 hover:bg-white'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              if (e.target.files) processFiles(e.target.files);
              e.target.value = '';
            }}
            className="sr-only"
            aria-label="Upload or Drop Mood Reaction Images"
          />
          <div className="w-10 h-10 rounded-xl bg-amber-400/25 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
            <ImagePlus className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Drop Images Here for Mood Mixtures</span>
              {userDroppedItems.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-mono font-bold">
                  +{userDroppedItems.length} Dropped
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
              Drop solo photos or multi-reaction sheets — auto-fuses into animated mood emojis
            </p>
          </div>
          <span className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold whitespace-nowrap shrink-0 flex items-center gap-1">
            <Upload className="w-3.5 h-3.5" />
            <span>Drop / Browse</span>
          </span>
        </div>

        {/* Right Action Buttons: Auto-Split Toggle + Instant Random Mood Mix */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setAutoSplitOnDrop((prev) => !prev)}
            title="When enabled, dropping a collage/sticker sheet automatically separates it into solo reaction emojis"
            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              autoSplitOnDrop
                ? 'border-rose-500 bg-rose-500 text-white shadow-xs'
                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-amber-400'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>{autoSplitOnDrop ? `Split Sheet (${splitGridPreset}): ON` : 'Split Sheet: OFF'}</span>
          </button>

          {autoSplitOnDrop && (
            <select
              aria-label="Sticker Sheet Split Grid Size"
              value={splitGridPreset}
              onChange={(e) => setSplitGridPreset(e.target.value as '2x2' | '3x3' | '3x4')}
              className="px-2 py-2 rounded-xl border border-rose-300 bg-white dark:bg-slate-800 text-xs font-mono font-semibold text-slate-800 dark:text-slate-100 cursor-pointer"
            >
              <option value="2x2">2×2</option>
              <option value="3x3">3×3</option>
              <option value="3x4">3×4</option>
            </select>
          )}

          <button
            type="button"
            onClick={() => onRollMoodMixture(selectedMood)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-xs transition-all cursor-pointer whitespace-nowrap"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Random Mood Mix</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Mood Filter Chips + Separated Sheet Quick-Access */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-amber-200/70 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mr-1">
            Mood Mix Filter:
          </span>
          {MOOD_PILLS.map((pill) => {
            const active = selectedMood === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => {
                  onChangeMood(pill.id);
                  onRollMoodMixture(pill.id);
                }}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  active
                    ? 'bg-amber-500 text-slate-950 shadow-2xs'
                    : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:border-amber-400'
                }`}
              >
                <span>{pill.badge}</span>
                <span>{pill.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {statusMessage ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100/90 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-md">
              <Check className="w-3 h-3" />
              <span>{statusMessage}</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={onOpenMixerModal}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300 hover:underline cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>{MULTI_REACTION_SHEETS.length} Sticker Sheets Separated into 26 Solo Emojis →</span>
            </button>
          )}
        </div>
      </div>

      {/* User Dropped Images Quick Tray (shows immediately when user drops files) */}
      {userDroppedItems.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pt-1.5 border-t border-amber-200/70 dark:border-slate-800">
          <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 shrink-0">
            Your Drops ({userDroppedItems.length}):
          </span>
          {userDroppedItems.slice(0, 8).map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-1.5 p-1 pr-2 rounded-lg bg-white dark:bg-slate-800 border border-amber-300 dark:border-slate-700 shrink-0"
            >
              <img
                src={item.photoUrl}
                alt={item.name}
                className="w-7 h-7 rounded object-cover"
              />
              <button
                type="button"
                onClick={() => onSelectEmoji(item.matchingConfig)}
                className="text-[11px] font-semibold text-slate-800 dark:text-slate-100 hover:text-amber-600 truncate max-w-[90px] cursor-pointer"
              >
                {item.name}
              </button>
              <button
                type="button"
                onClick={() => {
                  const mixed = mixEmojiConfigs(
                    activeConfig,
                    item.matchingConfig,
                    'duo-collab'
                  );
                  onSelectEmoji(mixed);
                }}
                title={`Mix ${item.name} with current stage emoji`}
                className="px-1.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/35 text-amber-800 dark:text-amber-300 text-[10px] font-bold cursor-pointer flex items-center"
              >
                <Plus className="w-2.5 h-2.5" />
                <span>Mix</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
