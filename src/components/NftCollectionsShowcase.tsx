import React, { useMemo, useState } from 'react';
import {
  EmojiConfig,
  GivenPhotoItem,
  MoodVibeId,
} from '../types/emoji';
import { getCropImgProps } from '../utils/photoEmojiCatalog';
import { EmojiRenderer } from './EmojiRenderer';
import {
  ChevronsLeft,
  ChevronsRight,
  Dices,
  Sliders,
  Download,
  Bookmark,
  Check,
  CheckCircle2,
  Diamond,
  Shuffle,
} from 'lucide-react';

export interface BrandColorSwatch {
  name: string;
  hex: string;
  secondaryHex: string;
  textDark?: boolean;
}

// Exact 9-color palette from the user's attached FEEDFOOD Brand Identity sheet
export const BRAND_COLOR_SWATCHES: BrandColorSwatch[] = [
  { name: 'Coral Red', hex: '#FF4925', secondaryHex: '#E97A11' },
  { name: 'Golden Yellow', hex: '#FFBA00', secondaryHex: '#E97A11', textDark: true },
  { name: 'Copper Orange', hex: '#E97A11', secondaryHex: '#FF4925' },
  { name: 'Lime Green', hex: '#8EBE2A', secondaryHex: '#FFBA00' },
  { name: 'Snow Gray', hex: '#F9F9F9', secondaryHex: '#E8B1C4', textDark: true },
  { name: 'Sky Blue', hex: '#67AEEE', secondaryHex: '#A281EE' },
  { name: 'Dusty Rose', hex: '#E8B1C4', secondaryHex: '#FF004C', textDark: true },
  { name: 'Light Purple', hex: '#A281EE', secondaryHex: '#67AEEE' },
  { name: 'Reddish Fuchsia', hex: '#FF004C', secondaryHex: '#FF4925' },
];

interface NftCollectionsShowcaseProps {
  activeConfig: EmojiConfig;
  allPhotoEmojis: GivenPhotoItem[];
  selectedMood: MoodVibeId;
  isPlaying: boolean;
  saveFeedback: boolean;
  onChangeMood: (mood: MoodVibeId) => void;
  onSelectEmoji: (config: EmojiConfig, sourceItem?: GivenPhotoItem) => void;
  onMixWithStage: (item: GivenPhotoItem) => void;
  onRandomCreation: () => void;
  onRandomVectorCreation: () => void;
  onOpenEasyStudio: () => void;
  onOpenExport: () => void;
  onSaveToPack: (config?: EmojiConfig) => void;
}

const MEDALLION_BACKDROPS = [
  'bg-gradient-to-b from-[#FF4925] to-[#E97A11]',
  'bg-gradient-to-b from-[#FFBA00] to-[#E97A11]',
  'bg-gradient-to-b from-[#8EBE2A] to-[#6FA018]',
  'bg-gradient-to-b from-[#67AEEE] to-[#4A90D9]',
  'bg-gradient-to-b from-[#A281EE] to-[#835EDB]',
  'bg-gradient-to-b from-[#FF004C] to-[#D4003F]',
  'bg-gradient-to-b from-[#E8B1C4] to-[#D48DA6]',
  'bg-gradient-to-b from-[#E97A11] to-[#C86208]',
];

const HOT_CARD_STAGES = [
  'bg-gradient-to-br from-[#FFBA00] to-[#E97A11]',
  'bg-gradient-to-br from-[#67AEEE] to-[#A281EE]',
  'bg-gradient-to-br from-[#8EBE2A] to-[#67AEEE]',
];

const HOT_OWNERS = [
  { name: 'COURTNEY HENRY', avatar: '/assets/aistudio/Cutie_kitty___5ad37e3f.jpg', timer: '08 : 58 : 45', bid: '8.32 ETH', badgeColor: '#FF4925' },
  { name: 'ARLENE MCCOY', avatar: '/assets/aistudio/872572496612386411_a4d75efd.jpg', timer: '06 : 42 : 19', bid: '9.15 ETH', badgeColor: '#E97A11' },
  { name: 'RALPH EDWARDS', avatar: '/assets/aistudio/doctor_pigeon_06780e50.jpg', timer: '11 : 20 : 04', bid: '7.84 ETH', badgeColor: '#FF004C' },
];

const TOP_CREATORS = [
  {
    handle: '@JENNY_WILSON',
    label: 'Crying & Wholesome Pack',
    avatar: '/assets/aistudio/Cutie_kitty___5ad37e3f.jpg',
    mood: 'crying' as MoodVibeId,
    accentHex: '#FF4925',
    tileBgs: [
      'bg-[#A281EE]',
      'bg-[#E8B1C4]',
      'bg-[#FFBA00]',
      'bg-[#FF4925]',
    ],
  },
  {
    handle: '@ALBERT_FLORES',
    label: 'Rizz & Shades Pack',
    avatar: '/assets/aistudio/872572496612386411_a4d75efd.jpg',
    mood: 'rizz' as MoodVibeId,
    accentHex: '#E97A11',
    tileBgs: [
      'bg-[#67AEEE]',
      'bg-[#8EBE2A]',
      'bg-[#E97A11]',
      'bg-[#FFBA00]',
    ],
  },
  {
    handle: '@MICHI_STUDIO',
    label: 'Chaotic & Michi Pack',
    avatar: '/assets/aistudio/here_s_a_rose_for_all_of_u_____f8690034.jpg',
    mood: 'foodie' as MoodVibeId,
    accentHex: '#FF004C',
    tileBgs: [
      'bg-[#FF004C]',
      'bg-[#E8B1C4]',
      'bg-[#A281EE]',
      'bg-[#8EBE2A]',
    ],
  },
];

type ShowcaseFilter = 'all' | 'new-solo' | 'crying' | 'rizz' | 'split-sheet';

export const NftCollectionsShowcase: React.FC<NftCollectionsShowcaseProps> = ({
  activeConfig,
  allPhotoEmojis,
  isPlaying,
  saveFeedback,
  onSelectEmoji,
  onMixWithStage,
  onRandomCreation,
  onRandomVectorCreation,
  onOpenEasyStudio,
  onOpenExport,
  onSaveToPack,
}) => {
  const [activeFilter, setActiveFilter] = useState<ShowcaseFilter>('all');
  const [carouselIndex, setCarouselIndex] = useState<number>(0);
  const [hotPage, setHotPage] = useState<number>(0);

  const filteredEmojis = useMemo(() => {
    const list = allPhotoEmojis.filter((item) => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'new-solo') return item.category === 'new-solo';
      if (activeFilter === 'split-sheet') return item.category === 'split-sheet';
      if (activeFilter === 'crying') return item.mood === 'crying';
      if (activeFilter === 'rizz') return item.mood === 'rizz' || item.mood === 'chaotic';
      return true;
    });
    return list.length >= 7 ? list : allPhotoEmojis;
  }, [allPhotoEmojis, activeFilter]);

  // 7 visible medallions in the symmetric fan [-3, -2, -1, 0, +1, +2, +3]
  const wheelSlots = useMemo(() => {
    const offsets = [-3, -2, -1, 0, 1, 2, 3];
    const len = filteredEmojis.length;
    return offsets.map((offset) => {
      const idx = (((carouselIndex + offset) % len) + len) % len;
      return {
        offset,
        idx,
        item: filteredEmojis[idx],
      };
    });
  }, [filteredEmojis, carouselIndex]);

  const hotCards = useMemo(() => {
    const start = (hotPage * 3) % Math.max(1, filteredEmojis.length);
    return [0, 1, 2].map((i) => filteredEmojis[(start + i) % filteredEmojis.length]);
  }, [filteredEmojis, hotPage]);

  const handleStepCarousel = (delta: number) => {
    const len = filteredEmojis.length;
    const nextIdx = (((carouselIndex + delta) % len) + len) % len;
    setCarouselIndex(nextIdx);
    const nextItem = filteredEmojis[nextIdx];
    if (nextItem) {
      onSelectEmoji(nextItem.matchingConfig, nextItem);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F9F9F9] text-slate-900 select-none">
      {/* TOP RIBBON TICKER IN CORAL RED & GOLDEN YELLOW */}
      <div className="relative w-full overflow-hidden py-2.5 mb-6 bg-[#FF4925] text-white shadow-xs">
        <div className="flex items-center justify-around gap-6 text-[11px] font-display font-bold tracking-[0.18em] uppercase whitespace-nowrap">
          {['EMOJI ART', 'MOJI STUDIO', 'CUSTOM RIGS', 'EMOJI ART', 'REACTION MIXER', 'EMOJI ART', 'INSTANT CREATE'].map(
            (label, idx) => (
              <span key={idx} className="inline-flex items-center gap-3">
                <span>{label}</span>
                <span aria-hidden="true" className="text-[#FFBA00] text-sm">
                  ✦
                </span>
              </span>
            )
          )}
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 pb-16 space-y-14">
        {/* SECTION 1: EMOJI COLLECTIONS HEADER + FILTER TABS */}
        <section aria-label="Emoji Collections Carousel" className="relative pt-1">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
            <div className="max-w-md">
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-wider uppercase">
                <span className="text-[#FF4925]">EMOJI</span>{' '}
                <span className="text-slate-900">COLLECTIONS</span>
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Spin the reaction wheel, hit Random Creation, or cook any emoji in Easy Studio.
              </p>
            </div>

            {/* Rectangular Segmented Filter Box */}
            <div
              role="tablist"
              aria-label="Filter Collections"
              className="inline-flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs self-start lg:self-auto"
            >
              {(
                [
                  { id: 'all', label: 'ALL' },
                  { id: 'new-solo', label: 'MEMES' },
                  { id: 'crying', label: 'CRYING' },
                  { id: 'rizz', label: 'RIZZ' },
                  { id: 'split-sheet', label: 'STICKERS' },
                ] as Array<{ id: ShowcaseFilter; label: string }>
              ).map((tab) => {
                const active = activeFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => {
                      setActiveFilter(tab.id);
                      setCarouselIndex(0);
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-[#FF4925] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-[#F9F9F9]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 7-CIRCLE OVERLAPPING MEDALLION CAROUSEL WITH << AND >> ARROWS */}
          <div className="relative flex items-center justify-between gap-2 sm:gap-4 py-4">
            {/* Left << Button */}
            <button
              type="button"
              onClick={() => handleStepCarousel(-1)}
              aria-label="Previous Emoji in Carousel"
              className="w-12 h-12 rounded-full flex items-center justify-center bg-white border border-slate-200 text-[#FF4925] hover:bg-[#FF4925] hover:text-white shadow-sm transition-all cursor-pointer shrink-0 z-50"
            >
              <ChevronsLeft className="w-8 h-8 stroke-[2.2]" />
            </button>

            {/* 7 Overlapping Circular Medallions */}
            <div className="flex-1 flex items-center justify-center overflow-visible py-4">
              <div className="flex items-center justify-center">
                {wheelSlots.map(({ offset, idx, item }) => {
                  const isCenter = offset === 0;
                  const abs = Math.abs(offset);

                  const sizeClasses =
                    abs === 0
                      ? 'w-48 h-48 sm:w-60 sm:h-60 z-40 ring-4 ring-[#FF4925] shadow-[0_20px_50px_rgba(255,73,37,0.32)]'
                      : abs === 1
                      ? 'hidden sm:flex w-36 h-36 md:w-44 md:h-44 z-30 opacity-95 ring-4 ring-white shadow-md'
                      : abs === 2
                      ? 'hidden md:flex w-28 h-28 lg:w-36 lg:h-36 z-20 opacity-90 ring-4 ring-white shadow-sm'
                      : 'hidden xl:flex w-24 h-24 z-10 opacity-80 ring-2 ring-white';

                  const overlapMargin =
                    offset < 0
                      ? '-mr-7 sm:-mr-9 lg:-mr-10'
                      : offset > 0
                      ? '-ml-7 sm:-ml-9 lg:-ml-10'
                      : 'mx-0';

                  const bgGradient =
                    MEDALLION_BACKDROPS[idx % MEDALLION_BACKDROPS.length];

                  const displayedConfig = isCenter ? activeConfig : item.matchingConfig;
                  const renderSize =
                    abs === 0 ? 185 : abs === 1 ? 132 : abs === 2 ? 104 : 76;

                  return (
                    <button
                      key={`${item.id}-${offset}`}
                      type="button"
                      onClick={() => {
                        setCarouselIndex(idx);
                        onSelectEmoji(item.matchingConfig, item);
                      }}
                      aria-label={
                        isCenter
                          ? `Active stage emoji ${displayedConfig.name}`
                          : `Select ${item.name} onto center stage`
                      }
                      className={`relative rounded-full ${bgGradient} ${sizeClasses} ${overlapMargin} flex items-center justify-center transition-all duration-200 hover:scale-105 cursor-pointer shrink-0 overflow-hidden`}
                    >
                      <div className="pointer-events-none flex items-center justify-center">
                        <EmojiRenderer
                          config={displayedConfig}
                          size={renderSize}
                          animate={isPlaying && isCenter}
                          showShadow={!isCenter}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right >> Button */}
            <button
              type="button"
              onClick={() => handleStepCarousel(1)}
              aria-label="Next Emoji in Carousel"
              className="w-12 h-12 rounded-full flex items-center justify-center bg-white border border-slate-200 text-[#FF4925] hover:bg-[#FF4925] hover:text-white shadow-sm transition-all cursor-pointer shrink-0 z-50"
            >
              <ChevronsRight className="w-8 h-8 stroke-[2.2]" />
            </button>
          </div>

          {/* MINIMALIST ONE-CLICK WORKFLOW BAR UNDER CENTER STAGE */}
          <div className="mt-4 flex flex-col items-center text-center gap-4">
            <div>
              <div className="inline-flex items-center gap-2">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                  {activeConfig.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-md bg-[#FFBA00]/25 text-xs font-mono font-bold text-[#E97A11]">
                  {activeConfig.shortcode}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any medallion to switch character, or use the one-click tools below:
              </p>
            </div>

            {/* Primary Minimalist Action Strip (No Drop/Upload button) */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={onRandomCreation}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF4925] hover:bg-[#E97A11] text-white font-display font-bold text-sm shadow-[0_10px_25px_rgba(255,73,37,0.3)] hover:scale-[1.02] transition-all cursor-pointer whitespace-nowrap"
              >
                <Shuffle className="w-4 h-4" />
                <span>Random Creation</span>
              </button>

              <button
                type="button"
                onClick={onRandomVectorCreation}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#FFBA00] hover:bg-[#E97A11] text-slate-950 hover:text-white font-bold text-xs transition-colors cursor-pointer whitespace-nowrap"
              >
                <Dices className="w-4 h-4" />
                <span>Random Cartoon</span>
              </button>

              <button
                type="button"
                onClick={onOpenEasyStudio}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white hover:bg-[#67AEEE]/15 border border-slate-200 text-slate-900 font-bold text-xs shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
              >
                <Sliders className="w-4 h-4 text-[#67AEEE]" />
                <span>Customize Emoji</span>
              </button>

              <button
                type="button"
                onClick={() => onSaveToPack()}
                className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-white hover:bg-[#8EBE2A]/15 border border-slate-200 text-slate-900 font-bold text-xs shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
              >
                {saveFeedback ? (
                  <>
                    <Check className="w-4 h-4 text-[#8EBE2A]" />
                    <span className="text-[#8EBE2A]">Saved!</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4 text-[#A281EE]" />
                    <span>Save</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onOpenExport}
                className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-[#FF004C] hover:bg-[#FF4925] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 2: HOT CREATIONS (3-Card Grid) */}
        <section aria-label="Hot Creations">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-wider uppercase">
              <span className="text-slate-900">HOT</span>{' '}
              <span className="text-[#FF4925]">CREATIONS</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {hotCards.map((item, idx) => {
              const owner = HOT_OWNERS[idx % HOT_OWNERS.length];
              const stageBg = HOT_CARD_STAGES[idx % HOT_CARD_STAGES.length];
              const isSelected = activeConfig.photoUrl === item.photoUrl;

              return (
                <article
                  key={`${item.id}-${idx}`}
                  className={`rounded-2xl bg-white border-2 p-4 flex flex-col justify-between transition-all shadow-sm ${
                    isSelected
                      ? 'border-[#FF4925] shadow-[0_12px_30px_rgba(255,73,37,0.18)]'
                      : 'border-slate-200/80 hover:border-[#FFBA00]'
                  }`}
                >
                  {/* Card Top Owner Row */}
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={owner.avatar}
                        alt={owner.name}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-[#E8B1C4] shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">
                          CREATED BY
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold text-slate-900 truncate">
                          <span className="truncate">{owner.name}</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#67AEEE] fill-[#67AEEE] text-white shrink-0" />
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onMixWithStage(item)}
                      className="px-2.5 py-1 rounded-lg bg-[#E8B1C4]/35 hover:bg-[#FF4925] text-[11px] font-bold text-[#FF004C] hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                    >
                      + Mix Duo
                    </button>
                  </div>

                  {/* Large Rounded Square Stage */}
                  <div
                    onClick={() => onSelectEmoji(item.matchingConfig, item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectEmoji(item.matchingConfig, item);
                      }
                    }}
                    aria-label={`Load ${item.name} onto stage`}
                    className={`relative aspect-square rounded-xl ${stageBg} flex items-center justify-center overflow-hidden cursor-pointer group`}
                  >
                    <div className="group-hover:scale-105 transition-transform duration-200">
                      <EmojiRenderer
                        config={item.matchingConfig}
                        size={175}
                        animate={false}
                        showShadow={true}
                      />
                    </div>
                  </div>

                  {/* Title & Monospace Timer/Rig Row */}
                  <div className="flex items-center justify-between gap-2 pt-4 pb-3 border-b border-slate-100">
                    <h3 className="font-display text-sm font-bold text-slate-900 truncate">
                      {item.name}
                    </h3>
                    <span className="font-mono text-xs font-bold text-[#E97A11] tabular-nums whitespace-nowrap">
                      {owner.timer}
                    </span>
                  </div>

                  {/* Card Footer: Shortcode / Value + Solid Coral Red Action Button */}
                  <div className="flex items-center justify-between gap-3 pt-3.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-[#FFBA00]/25 text-[#E97A11] flex items-center justify-center shrink-0">
                        <Diamond className="w-3.5 h-3.5 fill-current" />
                      </span>
                      <div className="min-w-0">
                        <div className="text-[10px] font-medium text-slate-500">
                          {item.vibeTag}
                        </div>
                        <div className="font-mono text-xs font-bold text-slate-900 tabular-nums truncate">
                          {owner.bid}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectEmoji(item.matchingConfig, item)}
                      className="px-5 py-2 rounded-lg bg-[#FF4925] hover:bg-[#E97A11] text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Use Emoji
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Pagination Indicator Bar */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {[0, 1, 2].map((pageIdx) => (
              <button
                key={pageIdx}
                type="button"
                aria-label={`Hot Creations Page ${pageIdx + 1}`}
                onClick={() => setHotPage(pageIdx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  hotPage === pageIdx
                    ? 'w-8 bg-[#FF4925]'
                    : 'w-2.5 bg-slate-300 hover:bg-[#FFBA00]'
                }`}
              />
            ))}
          </div>
        </section>

        {/* SECTION 3: TOP CREATOR (3-Column Bento Collage Packs) */}
        <section aria-label="Top Creator Emoji Packs">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-wider uppercase">
              <span className="text-slate-900">TOP</span>{' '}
              <span className="text-[#FF4925]">CREATOR</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TOP_CREATORS.map((creator, cIdx) => {
              const packItems = allPhotoEmojis
                .filter((i) => i.mood === creator.mood)
                .slice(0, 4);
              const fallbackItems = allPhotoEmojis.slice(cIdx * 4, cIdx * 4 + 4);
              const tiles = packItems.length === 4 ? packItems : fallbackItems;
              const mainTile = tiles[0];
              const subTileA = tiles[1];
              const subTileB = tiles[2];
              const subTileC = tiles[3];

              return (
                <article
                  key={creator.handle}
                  className="rounded-2xl bg-white border-2 border-slate-200/80 p-4 flex flex-col gap-3.5 shadow-sm"
                >
                  {/* Top Creator Header + Action Button */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={creator.avatar}
                        alt={creator.handle}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-[#FFBA00] shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 text-xs font-bold text-slate-900 truncate">
                          <span className="truncate">{creator.handle}</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#67AEEE] fill-[#67AEEE] text-white shrink-0" />
                        </div>
                        <div className="text-[10px] font-medium text-slate-500 truncate">
                          {creator.label}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (mainTile) onSelectEmoji(mainTile.matchingConfig, mainTile);
                      }}
                      className="px-4 py-1.5 rounded-lg bg-[#FF4925] hover:bg-[#E97A11] text-white text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Load Pack
                    </button>
                  </div>

                  {/* 4-Tile Bento Collage (1 Large Left + 3 Right) */}
                  <div className="grid grid-cols-2 grid-rows-[210px] gap-2.5 h-[210px] overflow-hidden">
                    {/* Left Large Tile */}
                    {mainTile && (
                      <button
                        type="button"
                        onClick={() => onSelectEmoji(mainTile.matchingConfig, mainTile)}
                        aria-label={`Select ${mainTile.name}`}
                        className={`h-full w-full min-h-0 rounded-xl ${creator.tileBgs[0]} flex items-center justify-center overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer p-2`}
                      >
                        <img
                          {...getCropImgProps(mainTile.photoUrl)}
                          alt={mainTile.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </button>
                    )}

                    {/* Right 3 Tiles (2 Top Small + 1 Bottom Wide) */}
                    <div className="grid grid-rows-2 gap-2.5 h-full min-h-0 overflow-hidden">
                      <div className="grid grid-cols-2 gap-2.5 h-full min-h-0 overflow-hidden">
                        {[subTileA, subTileB].map(
                          (sub, sIdx) =>
                            sub && (
                              <button
                                key={sub.id}
                                type="button"
                                onClick={() => onSelectEmoji(sub.matchingConfig, sub)}
                                aria-label={`Select ${sub.name}`}
                                className={`h-full w-full min-h-0 rounded-xl ${creator.tileBgs[sIdx + 1]} flex items-center justify-center overflow-hidden hover:scale-[1.03] transition-transform cursor-pointer p-1`}
                              >
                                <img
                                  {...getCropImgProps(sub.photoUrl)}
                                  alt={sub.name}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              </button>
                            )
                        )}
                      </div>

                      {subTileC && (
                        <button
                          type="button"
                          onClick={() => onSelectEmoji(subTileC.matchingConfig, subTileC)}
                          aria-label={`Select ${subTileC.name}`}
                          className={`h-full w-full min-h-0 rounded-xl ${creator.tileBgs[3]} flex items-center justify-center overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer p-1.5`}
                        >
                          <img
                            {...getCropImgProps(subTileC.photoUrl)}
                            alt={subTileC.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

