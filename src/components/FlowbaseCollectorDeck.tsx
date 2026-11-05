import React, { useMemo, useRef, useState } from 'react';
import {
  EmojiConfig,
  GivenPhotoItem,
  MoodVibeId,
  PhotoCategoryFilter,
} from '../types/emoji';
import {
  MULTI_REACTION_SHEETS,
  computeSheetGridSlices,
  createDroppedPhotoEmoji,
  getCropImgProps,
  mixEmojiConfigs,
} from '../utils/photoEmojiCatalog';
import { EmojiRenderer } from './EmojiRenderer';
import {
  CheckCircle2,
  ShoppingBag,
  Share2,
  Bookmark,
  Image as ImageIcon,
  ArrowRight,
  Clock,
  ChevronLeft,
  ChevronRight,
  Upload,
  Scissors,
  Shuffle,
  Diamond,
} from 'lucide-react';

export interface MixHistoryRecord {
  id: string;
  event: 'Transfer' | 'Purchase' | 'List' | 'Mood Mix' | 'Sheet Split';
  fromAvatar: string;
  toAvatar: string;
  fromName: string;
  toName: string;
  amount: number;
  valueLabel: string;
  dateLabel: string;
  resultConfig: EmojiConfig;
}

interface FlowbaseCollectorDeckProps {
  activeConfig: EmojiConfig;
  allPhotoEmojis: GivenPhotoItem[];
  userDroppedItems: GivenPhotoItem[];
  searchQuery: string;
  selectedMood: MoodVibeId;
  historyRecords: MixHistoryRecord[];
  onChangeMood: (mood: MoodVibeId) => void;
  onAddDroppedItems: (items: GivenPhotoItem[]) => void;
  onSelectEmoji: (config: EmojiConfig, sourceItem?: GivenPhotoItem) => void;
  onMixWithStage: (item: GivenPhotoItem) => void;
  onRollMoodMixture: (mood?: MoodVibeId) => void;
  onSaveToPack: (config: EmojiConfig) => void;
}

const CARD_CREATORS = [
  {
    name: 'Jackie Hong',
    handle: '@jackie_michi',
    avatar: '/assets/aistudio/Cutie_kitty___5ad37e3f.jpg',
    statA: '12',
    statALabel: 'solo',
    statB: '24',
    statBLabel: 'fps',
    statC: '8',
    statCLabel: 'rigs',
    ethValue: '4,71 ETH',
    photoCount: 238,
    frameBg: 'bg-[#F4F2FA]',
    innerClass: 'flowbase-card-1',
    transformClass: 'lg:-rotate-[3.5deg] lg:translate-y-1 z-30',
  },
  {
    name: 'Andrew Paul',
    handle: '@andrew_catz',
    avatar: '/assets/aistudio/872572496612386411_a4d75efd.jpg',
    statA: '12',
    statALabel: 'days',
    statB: '23',
    statBLabel: 'mixes',
    statC: '6',
    statCLabel: 'fx',
    ethValue: '2,3 ETH',
    photoCount: 164,
    frameBg: 'bg-[#ECECEF]',
    innerClass: 'flowbase-card-2',
    transformClass: 'lg:rotate-[0.5deg] lg:translate-y-2 lg:-ml-8 xl:-ml-6 z-20',
  },
  {
    name: 'Adam Usman',
    handle: '@adam_splits',
    avatar: '/assets/aistudio/doctor_pigeon_06780e50.jpg',
    statA: '32',
    statALabel: 'split',
    statB: '14',
    statBLabel: 'new',
    statC: '4',
    statCLabel: 'sheets',
    ethValue: '1,91 ETH',
    photoCount: 312,
    frameBg: 'bg-[#D6EFE9]',
    innerClass: 'flowbase-card-3',
    transformClass: 'lg:-rotate-[6deg] lg:-translate-y-2 lg:-ml-8 xl:-ml-6 z-10',
  },
  {
    name: 'Maria Jonas',
    handle: '@maria_rizz',
    avatar: '/assets/aistudio/here_s_a_rose_for_all_of_u_____f8690034.jpg',
    statA: '19',
    statALabel: 'moods',
    statB: '27',
    statBLabel: 'drops',
    statC: '9',
    statCLabel: 'vibes',
    ethValue: '4,5 ETH',
    photoCount: 238,
    frameBg: 'bg-[#F6EFE0]',
    innerClass: 'flowbase-card-4',
    transformClass: 'lg:rotate-[0deg] lg:translate-y-3 lg:-ml-8 xl:-ml-6 z-0',
  },
];

export const FlowbaseCollectorDeck: React.FC<FlowbaseCollectorDeckProps> = ({
  activeConfig,
  allPhotoEmojis,
  userDroppedItems,
  searchQuery,
  selectedMood,
  historyRecords,
  onChangeMood,
  onAddDroppedItems,
  onSelectEmoji,
  onMixWithStage,
  onRollMoodMixture,
  onSaveToPack,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<PhotoCategoryFilter>('all');
  const [deckOffset, setDeckOffset] = useState<number>(0);
  const [historyTab, setHistoryTab] = useState<'all' | 'purchase' | 'transfer' | 'catalog'>('transfer');
  const [autoSplitOnDrop, setAutoSplitOnDrop] = useState<boolean>(false);
  const [splitGrid, setSplitGrid] = useState<'2x2' | '3x3' | '3x4'>('3x3');
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const [dropNotice, setDropNotice] = useState<string | null>(null);

  const notify = (text: string) => {
    setDropNotice(text);
    setTimeout(() => setDropNotice(null), 2600);
  };

  // Filtered pool of solo reaction emojis
  const filteredPool = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allPhotoEmojis.filter((item) => {
      if (categoryFilter !== 'all' && item.category !== categoryFilter) {
        return false;
      }
      if (selectedMood !== 'all' && item.mood && item.mood !== selectedMood) {
        return false;
      }
      if (q) {
        return (
          item.name.toLowerCase().includes(q) ||
          item.vibeTag.toLowerCase().includes(q) ||
          (item.sourceSheetName && item.sourceSheetName.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [allPhotoEmojis, categoryFilter, selectedMood, searchQuery]);

  // 4 fanned cards for "Recent Collections"
  const fannedItems = useMemo(() => {
    const pool = filteredPool.length > 0 ? filteredPool : allPhotoEmojis;
    const result: GivenPhotoItem[] = [];
    for (let i = 0; i < 4; i++) {
      result.push(pool[(deckOffset + i) % pool.length]);
    }
    return result;
  }, [filteredPool, allPhotoEmojis, deckOffset]);

  // Client-side sticker sheet slicer for dropped multi-reaction images
  const sliceDroppedSheet = (dataUrl: string, baseTitle: string) => {
    const [rows, cols] = splitGrid.split('x').map(Number);
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
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const created: GivenPhotoItem[] = [];

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
        const croppedUrl = canvas.toDataURL('image/jpeg', 0.9);
        created.push(
          createDroppedPhotoEmoji(
            croppedUrl,
            `${baseTitle} #${idx + 1}`,
            selectedMood === 'all' ? 'chaotic' : selectedMood,
            idx + 1
          )
        );
      });

      if (created.length > 0) {
        onAddDroppedItems(created);
        onSelectEmoji(created[0].matchingConfig, created[0]);
        notify(`Separated ${created.length} solo emojis from "${baseTitle}"!`);
      }
    };
    img.src = dataUrl;
  };

  const handleFilesDropped = (files: FileList | File[]) => {
    const valid = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (valid.length === 0) return;

    valid.forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = typeof reader.result === 'string' ? reader.result : null;
        if (!dataUrl) return;
        const cleanTitle = file.name.replace(/\.[^/.]+$/, '');
        if (autoSplitOnDrop) {
          sliceDroppedSheet(dataUrl, cleanTitle);
        } else {
          const newItem = createDroppedPhotoEmoji(
            dataUrl,
            cleanTitle,
            selectedMood === 'all' ? 'wholesome' : selectedMood,
            userDroppedItems.length + idx + 1
          );
          onAddDroppedItems([newItem]);
          const mixed = mixEmojiConfigs(
            newItem.matchingConfig,
            activeConfig,
            'duo-collab'
          );
          onSelectEmoji(mixed, newItem);
          notify(`Dropped "${newItem.name}" & fused into a new Mood Mix!`);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const filteredHistory = useMemo(() => {
    if (historyTab === 'all') return historyRecords;
    if (historyTab === 'purchase') {
      return historyRecords.filter(
        (r) => r.event === 'Purchase' || r.event === 'Sheet Split' || r.event === 'List'
      );
    }
    return historyRecords;
  }, [historyRecords, historyTab]);

  const splitSheetCount = useMemo(
    () => allPhotoEmojis.filter((i) => i.category === 'split-sheet').length,
    [allPhotoEmojis]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDraggingOver(true);
      }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDraggingOver(false);
        if (e.dataTransfer.files?.length) {
          handleFilesDropped(e.dataTransfer.files);
        }
      }}
      className="flex-1 flex flex-col justify-between min-w-0 space-y-5"
    >
      {/* Hidden multi-file input for continuous Mood Drops */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => {
          if (e.target.files) handleFilesDropped(e.target.files);
          e.target.value = '';
        }}
        className="sr-only"
        aria-label="Drop or upload reaction images"
      />

      {/* TOP SECTION: RECENT COLLECTIONS (Fanned 4-Card Stack from Reference Photo) */}
      <section aria-label="Recent Collections">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-xl font-bold text-white tracking-tight">
              Recent Collections
            </h2>

            {/* Category & Sheet Filter Pills */}
            <div className="hidden sm:flex items-center gap-1 bg-[#3C3645] p-1 rounded-full">
              {(
                [
                  { id: 'all', label: `All (${allPhotoEmojis.length})` },
                  { id: 'split-sheet', label: `Split Sheets (${splitSheetCount})` },
                  { id: 'new-solo', label: 'New Solo (14)' },
                  ...(userDroppedItems.length > 0
                    ? [{ id: 'user-drop', label: `Drops (${userDroppedItems.length})` }]
                    : []),
                ] as Array<{ id: PhotoCategoryFilter; label: string }>
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setCategoryFilter(tab.id);
                    setDeckOffset(0);
                  }}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    categoryFilter === tab.id
                      ? 'bg-white text-[#2E2936] shadow-xs'
                      : 'text-[#B2ABBE] hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Deck Pagination & Instant Mood Mix */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onRollMoodMixture(selectedMood)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#484152] hover:bg-[#564E63] text-white text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              <Shuffle className="w-3 h-3 text-[#E5BE93]" />
              <span>Mix Mood</span>
            </button>
            <button
              type="button"
              aria-label="Previous Collection Cards"
              onClick={() =>
                setDeckOffset(
                  (prev) =>
                    (prev - 1 + Math.max(1, filteredPool.length)) %
                    Math.max(1, filteredPool.length)
                )
              }
              className="w-7 h-7 rounded-full bg-[#3C3645] hover:bg-[#4E4759] text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label="Next Collection Cards"
              onClick={() =>
                setDeckOffset((prev) => (prev + 1) % Math.max(1, filteredPool.length))
              }
              className="w-7 h-7 rounded-full bg-[#3C3645] hover:bg-[#4E4759] text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Fanned Overlapping Phone-Notch Cards matching Reference Image */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-0 lg:flex lg:items-center pt-1 pb-2 px-1">
          {fannedItems.map((item, idx) => {
            const meta = CARD_CREATORS[idx % CARD_CREATORS.length];
            const isSelected = activeConfig.photoUrl === item.photoUrl;
            const thumbProps = getCropImgProps(item.photoUrl);

            return (
              <div
                key={`${item.id}-${idx}`}
                onClick={() => onSelectEmoji(item.matchingConfig, item)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectEmoji(item.matchingConfig, item);
                  }
                }}
                aria-label={`Select ${item.name} reaction card`}
                className={`group relative lg:w-[148px] xl:w-[198px] shrink-0 rounded-[26px] p-2.5 ${meta.frameBg} ${meta.transformClass} hover:z-40 hover:-translate-y-1.5 transition-all duration-200 cursor-pointer shadow-[0_18px_38px_rgba(17,13,24,0.42)] ${
                  isSelected ? 'ring-2 ring-white' : ''
                }`}
              >
                {/* Top Phone Notch Cutout */}
                <div
                  aria-hidden="true"
                  className={`w-14 h-2.5 ${meta.frameBg} rounded-b-xl mx-auto -mb-1.5 relative z-20`}
                />

                {/* Card Creator Header */}
                <div className="flex items-center justify-between gap-1.5 px-1.5 py-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <img
                      {...thumbProps}
                      alt={meta.name}
                      referrerPolicy="no-referrer"
                      className="w-6 h-6 rounded-full object-cover ring-1 ring-black/10 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-[#231F28] truncate">
                        <span className="truncate">{item.name}</span>
                        <CheckCircle2 className="w-3 h-3 text-[#2E2936] fill-[#2E2936] text-white shrink-0" />
                      </div>
                      <div className="text-[9px] text-[#7A7485] truncate">
                        {item.sourceSheetName ? `✂️ ${item.sourceSheetName}` : meta.handle}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMixWithStage(item);
                    }}
                    title={`Mix ${item.name} with active emoji`}
                    aria-label={`Mix ${item.name} with active emoji`}
                    className="w-6 h-6 rounded-full bg-[#2E2936] text-white flex items-center justify-center shrink-0 hover:scale-105 transition-transform cursor-pointer"
                  >
                    <ShoppingBag className="w-3 h-3" />
                  </button>
                </div>

                {/* Inner Artwork Stage with Stat Bubbles & Bottom Bronze Bar */}
                <div
                  className={`relative h-[188px] xl:h-[196px] rounded-[20px] p-2.5 flex flex-col justify-between overflow-hidden ${meta.innerClass}`}
                >
                  {/* Top Stat Bubbles + Upload/Share Circle */}
                  <div className="flex items-center justify-between gap-1 relative z-10">
                    <div className="flex items-center gap-1">
                      <div className="w-7 h-7 rounded-full bg-black/20 backdrop-blur-xs border border-white/40 flex flex-col items-center justify-center text-white leading-none">
                        <span className="text-[9px] font-bold tabular-nums">{meta.statA}</span>
                        <span className="text-[7px] opacity-85">{meta.statALabel}</span>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-black/20 backdrop-blur-xs border border-white/40 flex flex-col items-center justify-center text-white leading-none">
                        <span className="text-[9px] font-bold tabular-nums">{meta.statB}</span>
                        <span className="text-[7px] opacity-85">{meta.statBLabel}</span>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-black/20 backdrop-blur-xs border border-white/40 flex flex-col items-center justify-center text-white leading-none">
                        <span className="text-[9px] font-bold tabular-nums">{meta.statC}</span>
                        <span className="text-[7px] opacity-85">{meta.statCLabel}</span>
                      </div>
                    </div>

                    <span className="w-6 h-6 rounded-full bg-black/25 backdrop-blur-xs text-white flex items-center justify-center">
                      <Share2 className="w-2.5 h-2.5" />
                    </span>
                  </div>

                  {/* Center Character / Reaction Emoji Artwork */}
                  <div className="my-auto flex items-center justify-center relative z-10 py-1">
                    <div className="group-hover:scale-105 transition-transform">
                      <EmojiRenderer
                        config={item.matchingConfig}
                        size={98}
                        animate={false}
                        showShadow={true}
                      />
                    </div>
                  </div>

                  {/* Bottom Pill Strip (Photo Count + Bronze ETH/Mood Pill + Bookmark) */}
                  <div className="flex items-center justify-between gap-1 relative z-10">
                    <span className="px-2 py-1 rounded-full bg-black/20 backdrop-blur-xs text-white text-[9px] font-bold flex items-center gap-1 tabular-nums">
                      <ImageIcon className="w-2.5 h-2.5" />
                      <span>{allPhotoEmojis.length}</span>
                    </span>

                    <span className="px-2 py-1 rounded-full bg-[#7A5C43]/90 text-white text-[9px] font-bold flex items-center gap-1 tabular-nums shadow-xs">
                      <span>{meta.ethValue}</span>
                      <span className="w-3.5 h-3.5 rounded-full bg-[#59402B] flex items-center justify-center">
                        <Diamond className="w-2 h-2 fill-current" />
                      </span>
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSaveToPack(item.matchingConfig);
                      }}
                      aria-label={`Bookmark ${item.name}`}
                      className="w-6 h-6 rounded-full bg-white text-[#2E2936] flex items-center justify-center shadow-xs hover:scale-105 transition-transform cursor-pointer"
                    >
                      <Bookmark className="w-2.5 h-2.5 fill-current" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* BOTTOM SECTION: HISTORY + CONTINUOUS MOOD DROP BAR */}
      <section aria-label="History and Continuous Mood Drop" className="flex-1 flex flex-col min-h-0">
        {/* Section Header + Tabs matching Reference Photo ("History" ... "All history  Purchase  Transfer") */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-xl font-bold text-white tracking-tight">
              History
            </h2>
            {dropNotice && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold">
                {dropNotice}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 sm:gap-5 text-xs font-semibold">
            {(
              [
                { id: 'all', label: 'All history' },
                { id: 'purchase', label: 'Purchase' },
                { id: 'transfer', label: 'Transfer' },
                { id: 'catalog', label: `Solo Catalog (${filteredPool.length})` },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setHistoryTab(t.id)}
                className={`transition-colors cursor-pointer whitespace-nowrap ${
                  historyTab === t.id
                    ? 'text-white font-bold'
                    : 'text-[#8E8798] hover:text-[#CBC5D4]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rounded Translucent Slate Container matching the History Card in the Photo */}
        <div
          className={`flex-1 rounded-[28px] bg-[#464050]/90 border transition-colors p-4 sm:p-5 flex flex-col justify-start gap-2.5 min-h-[240px] ${
            isDraggingOver
              ? 'border-[#E5BE93] bg-[#524B5E]'
              : 'border-white/5'
          }`}
        >
          {/* Compact Continuous Image Drop & Sheet Splitter Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-2 border-b border-white/10">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 text-left group cursor-pointer"
            >
              <span className="w-7 h-7 rounded-full bg-white/10 group-hover:bg-white/20 text-[#E5BE93] flex items-center justify-center transition-colors">
                <Upload className="w-3.5 h-3.5" />
              </span>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-[#E5BE93] transition-colors">
                  Drop Images Here for Mood Mixtures
                </div>
                <div className="text-[10px] text-[#A8A1B4]">
                  Drop solo reactions or sticker sheets ({MULTI_REACTION_SHEETS.length} sheets → {splitSheetCount} solo emojis ready)
                </div>
              </div>
            </button>

            <div className="flex flex-wrap items-center gap-1.5">
              {/* Mood Filter Pills */}
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'crying', label: '😭 Cry' },
                  { id: 'rizz', label: '😎 Rizz' },
                  { id: 'foodie', label: '🍓 Michis' },
                ] as Array<{ id: MoodVibeId; label: string }>
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    onChangeMood(m.id);
                    onRollMoodMixture(m.id);
                  }}
                  className={`px-2 py-1 rounded-full text-[10px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    selectedMood === m.id
                      ? 'bg-white text-[#2E2936] font-bold'
                      : 'bg-[#383341] text-[#B8B1C4] hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}

              {/* Auto-Split Sticker Sheet Toggle */}
              <button
                type="button"
                onClick={() => setAutoSplitOnDrop((prev) => !prev)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  autoSplitOnDrop
                    ? 'bg-[#E5BE93] text-[#2E2936] font-bold'
                    : 'bg-[#383341] text-[#C5BED0] hover:text-white'
                }`}
              >
                <Scissors className="w-3 h-3" />
                <span>{autoSplitOnDrop ? `Split ${splitGrid}: ON` : 'Split Sheet'}</span>
              </button>

              {autoSplitOnDrop && (
                <select
                  aria-label="Sticker Sheet Split Grid"
                  value={splitGrid}
                  onChange={(e) => setSplitGrid(e.target.value as '2x2' | '3x3' | '3x4')}
                  className="px-1.5 py-1 rounded-full bg-[#312C38] text-white text-[10px] font-mono border border-white/15 cursor-pointer"
                >
                  <option value="2x2">2×2</option>
                  <option value="3x3">3×3</option>
                  <option value="3x4">3×4</option>
                </select>
              )}
            </div>
          </div>

          {historyTab === 'catalog' ? (
            /* Scrollable Solo Reaction Emoji Grid (all 62 + user drops) */
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-[195px] overflow-y-auto pr-1">
              {filteredPool.map((item) => {
                const active = activeConfig.photoUrl === item.photoUrl;
                const thumbProps = getCropImgProps(item.photoUrl);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectEmoji(item.matchingConfig, item)}
                    className={`flex flex-col items-center p-1.5 rounded-2xl border text-center transition-all cursor-pointer group ${
                      active
                        ? 'bg-white/15 border-white text-white'
                        : 'bg-[#383341]/80 border-white/5 text-[#D8D2E2] hover:bg-white/10'
                    }`}
                  >
                    <img
                      {...thumbProps}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-xl object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className="text-[10px] font-semibold truncate w-full mt-1">
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Exact History Table from the Reference Photo (Event | From/To | Amount | Value | Date) */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[11px] font-medium text-[#9E97A8] border-b border-white/5">
                    <th className="pb-2.5 font-medium">Event</th>
                    <th className="pb-2.5 font-medium">From/To</th>
                    <th className="pb-2.5 font-medium text-center">Amount</th>
                    <th className="pb-2.5 font-medium text-right">Value</th>
                    <th className="pb-2.5 font-medium text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {filteredHistory.slice(0, 4).map((row, idx) => {
                    const fromImgProps = getCropImgProps(row.fromAvatar);
                    const toImgProps = getCropImgProps(row.toAvatar);
                    return (
                      <tr
                        key={row.id}
                        onClick={() => onSelectEmoji(row.resultConfig)}
                        className="hover:bg-white/5 transition-colors cursor-pointer group"
                      >
                        <td className="py-2.5 font-medium text-[#E2DCEB] group-hover:text-white whitespace-nowrap">
                          {row.event}
                        </td>
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            <img
                              {...fromImgProps}
                              alt={row.fromName}
                              referrerPolicy="no-referrer"
                              className="w-6 h-6 rounded-full object-cover ring-1 ring-white/20"
                            />
                            {row.event === 'List' ? (
                              <>
                                <span className="w-3.5 h-3.5 rounded-full bg-white text-[#2E2936] flex items-center justify-center">
                                  <Clock className="w-2.5 h-2.5" />
                                </span>
                                <span className="w-6 h-6 rounded-full border border-dashed border-[#8E8798]" />
                              </>
                            ) : (
                              <>
                                <ArrowRight
                                  className={`w-3.5 h-3.5 ${
                                    idx % 2 === 0 ? 'text-emerald-400' : 'text-rose-400'
                                  }`}
                                />
                                <img
                                  {...toImgProps}
                                  alt={row.toName}
                                  referrerPolicy="no-referrer"
                                  className="w-6 h-6 rounded-full object-cover ring-1 ring-white/20"
                                />
                              </>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 text-center font-mono text-[#E2DCEB] tabular-nums">
                          {row.amount}
                        </td>
                        <td className="py-2.5 text-right font-mono font-semibold text-white tabular-nums whitespace-nowrap">
                          {row.valueLabel}
                        </td>
                        <td className="py-2.5 text-right font-mono text-[#B8B1C4] tabular-nums whitespace-nowrap">
                          {row.dateLabel}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
