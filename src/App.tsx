import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EmojiConfig, GivenPhotoItem, MoodVibeId, SavedEmoji } from './types/emoji';
import {
  STARTER_PRESETS,
  createHistoryStack,
  formatShortcode,
  pushHistoryState,
  randomizeEmojiConfig,
  redoHistoryState,
  undoHistoryState,
  validateShortcode,
} from './utils/emojiEngine';
import {
  GIVEN_PHOTO_EMOJIS,
  createDroppedPhotoEmoji,
  mixEmojiConfigs,
  randomizePhotoCombo,
} from './utils/photoEmojiCatalog';
import { PartSelectorPanel } from './components/PartSelectorPanel';
import { MotionInspectorPanel } from './components/MotionInspectorPanel';
import { StageTimeline } from './components/StageTimeline';
import { ExportModal } from './components/ExportModal';
import { ChatSimulatorModal } from './components/ChatSimulatorModal';
import { EmojiMixerModal } from './components/EmojiMixerModal';
import {
  FlowbaseCollectorDeck,
  MixHistoryRecord,
} from './components/FlowbaseCollectorDeck';
import { FlowbaseFeaturedStageCard } from './components/FlowbaseFeaturedStageCard';
import {
  Home,
  Hexagon,
  Gift,
  PieChart,
  Bookmark,
  Settings,
  Bell,
  Search,
  Plus,
  Undo2,
  Redo2,
  Shuffle,
  Dices,
} from 'lucide-react';

const STORAGE_KEY = 'mojimotion_saved_pack_v3';

export default function App() {
  const quickUploadRef = useRef<HTMLInputElement | null>(null);

  // Active workspace mode: 'creator' shows the exact Flowbase Collector/Creator Deck from reference photo;
  // 'studio' opens the full vector parts + motion physics rigging drawers alongside the featured stage.
  const [workspaceView, setWorkspaceView] = useState<'creator' | 'studio'>('creator');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Continuously dropped user images for mood mixtures
  const [userDroppedItems, setUserDroppedItems] = useState<GivenPhotoItem[]>([]);
  const [selectedMood, setSelectedMood] = useState<MoodVibeId>('all');

  const allPhotoEmojis = useMemo(
    () => [...userDroppedItems, ...GIVEN_PHOTO_EMOJIS],
    [userDroppedItems]
  );

  // History-tracked emoji configuration (starts with Banana Suit Cat / Waterfall Cry Cat)
  const [history, setHistory] = useState(() =>
    createHistoryStack<EmojiConfig>(GIVEN_PHOTO_EMOJIS[14].matchingConfig)
  );
  const config = history.present;

  // Edition number display (#141 in reference photo)
  const [editionNumber, setEditionNumber] = useState<number>(141);

  // Live Mix & Transfer History Records (seeded with 4 records matching the photo's History table)
  const [historyRecords, setHistoryRecords] = useState<MixHistoryRecord[]>(() => [
    {
      id: 'hist-1',
      event: 'Transfer',
      fromAvatar: GIVEN_PHOTO_EMOJIS[14].photoUrl,
      toAvatar: GIVEN_PHOTO_EMOJIS[0].photoUrl,
      fromName: GIVEN_PHOTO_EMOJIS[14].name,
      toName: GIVEN_PHOTO_EMOJIS[0].name,
      amount: 3,
      valueLabel: '12,4 ETH',
      dateLabel: '21/08',
      resultConfig: mixEmojiConfigs(
        GIVEN_PHOTO_EMOJIS[14].matchingConfig,
        GIVEN_PHOTO_EMOJIS[0].matchingConfig,
        'duo-collab'
      ),
    },
    {
      id: 'hist-2',
      event: 'Purchase',
      fromAvatar: GIVEN_PHOTO_EMOJIS[15].photoUrl,
      toAvatar: GIVEN_PHOTO_EMOJIS[9].photoUrl,
      fromName: GIVEN_PHOTO_EMOJIS[15].name,
      toName: GIVEN_PHOTO_EMOJIS[9].name,
      amount: 7,
      valueLabel: '11,3 ETH',
      dateLabel: '12/07',
      resultConfig: GIVEN_PHOTO_EMOJIS[15].matchingConfig,
    },
    {
      id: 'hist-3',
      event: 'List',
      fromAvatar: GIVEN_PHOTO_EMOJIS[4].photoUrl,
      toAvatar: GIVEN_PHOTO_EMOJIS[8].photoUrl,
      fromName: GIVEN_PHOTO_EMOJIS[4].name,
      toName: GIVEN_PHOTO_EMOJIS[8].name,
      amount: 1,
      valueLabel: '2,56 ETH',
      dateLabel: '04/01',
      resultConfig: GIVEN_PHOTO_EMOJIS[4].matchingConfig,
    },
    {
      id: 'hist-4',
      event: 'Transfer',
      fromAvatar: GIVEN_PHOTO_EMOJIS[18].photoUrl,
      toAvatar: GIVEN_PHOTO_EMOJIS[2].photoUrl,
      fromName: GIVEN_PHOTO_EMOJIS[18].name,
      toName: GIVEN_PHOTO_EMOJIS[2].name,
      amount: 3,
      valueLabel: '6,51 ETH',
      dateLabel: '24/02',
      resultConfig: mixEmojiConfigs(
        GIVEN_PHOTO_EMOJIS[18].matchingConfig,
        GIVEN_PHOTO_EMOJIS[2].matchingConfig,
        'vector-overlay'
      ),
    },
  ]);

  // Timeline playback & scrubbing state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [scrubTime, setScrubTime] = useState<number>(0.15);
  const [fps, setFps] = useState<number>(24);

  // Shortcode input & validation
  const [shortcodeDraft, setShortcodeDraft] = useState<string>(config.shortcode);
  const [shortcodeError, setShortcodeError] = useState<string | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isChatSimOpen, setIsChatSimOpen] = useState<boolean>(false);
  const [isMixerOpen, setIsMixerOpen] = useState<boolean>(false);

  // Saved Custom Emoji Pack
  const [savedPack, setSavedPack] = useState<SavedEmoji[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore storage errors
    }
    return [
      { config: GIVEN_PHOTO_EMOJIS[14].matchingConfig, createdAt: '2026-11-04', usageCount: 32 },
      { config: GIVEN_PHOTO_EMOJIS[0].matchingConfig, createdAt: '2026-11-04', usageCount: 28 },
      { config: GIVEN_PHOTO_EMOJIS[15].matchingConfig, createdAt: '2026-11-04', usageCount: 21 },
      { config: GIVEN_PHOTO_EMOJIS[9].matchingConfig, createdAt: '2026-11-04', usageCount: 18 },
      { config: STARTER_PRESETS[0], createdAt: '2026-11-04', usageCount: 11 },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPack));
    } catch {
      // ignore storage errors
    }
  }, [savedPack]);

  // Sync shortcode input when preset/history changes
  useEffect(() => {
    setShortcodeDraft(config.shortcode);
    setShortcodeError(null);
  }, [config.shortcode]);

  const handleUpdateConfig = useCallback((updater: (prev: EmojiConfig) => EmojiConfig) => {
    setHistory((prevStack) => {
      const nextConfig = updater(prevStack.present);
      return pushHistoryState(prevStack, nextConfig);
    });
  }, []);

  const handleAddDroppedItems = useCallback((newItems: GivenPhotoItem[]) => {
    setUserDroppedItems((prev) => [...newItems, ...prev]);
    if (newItems.length > 0) {
      const first = newItems[0];
      setHistoryRecords((prev) => [
        {
          id: `drop-${Date.now()}`,
          event: newItems.length > 1 ? 'Sheet Split' : 'Purchase',
          fromAvatar: first.photoUrl,
          toAvatar: newItems[1]?.photoUrl || GIVEN_PHOTO_EMOJIS[0].photoUrl,
          fromName: first.name,
          toName: newItems[1]?.name || 'Stage Mix',
          amount: newItems.length,
          valueLabel: `${(newItems.length * 1.4).toFixed(1).replace('.', ',')} ETH`,
          dateLabel: 'Now',
          resultConfig: first.matchingConfig,
        },
        ...prev,
      ]);
    }
  }, []);

  const handleUndo = () => {
    setHistory((prev) => undoHistoryState(prev));
  };

  const handleRedo = () => {
    setHistory((prev) => redoHistoryState(prev));
  };

  // Randomize Photo Combo (fuses 2 random photos from user drops + solo catalog and logs in History)
  const handleRandomPhotoCombo = (moodOverride?: MoodVibeId) => {
    const activeMood = moodOverride ?? selectedMood;
    const { config: comboCfg, parentA, parentB } = randomizePhotoCombo(
      undefined,
      allPhotoEmojis,
      activeMood
    );
    setHistory((prev) => pushHistoryState(prev, comboCfg));
    setEditionNumber((prev) => ((prev + 7) % 899) + 100);
    setHistoryRecords((prev) => [
      {
        id: `mix-${Date.now()}`,
        event: 'Transfer',
        fromAvatar: parentA.photoUrl,
        toAvatar: parentB.photoUrl,
        fromName: parentA.name,
        toName: parentB.name,
        amount: 2,
        valueLabel: `${(Math.random() * 9 + 2).toFixed(1).replace('.', ',')} ETH`,
        dateLabel: 'Live',
        resultConfig: comboCfg,
      },
      ...prev,
    ]);
  };

  // Randomize Pure Vector Rig
  const handleRandomVectorRig = () => {
    const randomCfg = randomizeEmojiConfig();
    setHistory((prev) => pushHistoryState(prev, randomCfg));
    setEditionNumber((prev) => ((prev + 3) % 899) + 100);
  };

  const handleSelectPreset = (preset: EmojiConfig, sourceItem?: GivenPhotoItem) => {
    const cloned: EmojiConfig = {
      ...preset,
      fineTune: { ...preset.fineTune },
      layerMotion: { ...preset.layerMotion },
    };
    setHistory((prev) => pushHistoryState(prev, cloned));
    if (sourceItem) {
      const idx = allPhotoEmojis.findIndex((i) => i.id === sourceItem.id);
      if (idx >= 0) setEditionNumber(101 + idx);
    }
  };

  const handleMixWithStage = (item: GivenPhotoItem) => {
    const mixed = mixEmojiConfigs(config, item.matchingConfig, 'duo-collab');
    setHistory((prev) => pushHistoryState(prev, mixed));
    setHistoryRecords((prev) => [
      {
        id: `duo-${Date.now()}`,
        event: 'Transfer',
        fromAvatar: config.photoUrl || item.photoUrl,
        toAvatar: item.photoUrl,
        fromName: config.name,
        toName: item.name,
        amount: 2,
        valueLabel: '8,40 ETH',
        dateLabel: 'Now',
        resultConfig: mixed,
      },
      ...prev,
    ]);
  };

  const handleShortcodeInput = (val: string) => {
    setShortcodeDraft(val);
    const check = validateShortcode(val);
    if (!check.valid) {
      setShortcodeError(check.error || 'Invalid shortcode');
    } else {
      setShortcodeError(null);
      const formatted = formatShortcode(val);
      setHistory((prev) => ({
        ...prev,
        present: {
          ...prev.present,
          shortcode: formatted,
        },
      }));
    }
  };

  const handleSaveConfigToPack = (targetConfig: EmojiConfig) => {
    const formattedCode = formatShortcode(targetConfig.shortcode);
    const snapshotConfig: EmojiConfig = {
      ...targetConfig,
      id: `custom-${Date.now()}`,
      shortcode: formattedCode,
    };

    setSavedPack((prev) => [
      {
        config: snapshotConfig,
        createdAt: new Date().toISOString().slice(0, 10),
        usageCount: 1,
      },
      ...prev.filter((item) => item.config.shortcode !== formattedCode),
    ]);
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 1800);
  };

  const handleSaveToPack = () => {
    const check = validateShortcode(shortcodeDraft);
    if (!check.valid) {
      setShortcodeError(check.error || 'Enter a valid shortcode before saving.');
      return;
    }
    handleSaveConfigToPack({
      ...config,
      shortcode: formatShortcode(shortcodeDraft),
    });
  };

  const handleDeleteSaved = (id: string) => {
    setSavedPack((prev) => prev.filter((item) => item.config.id !== id));
  };

  const handleCopyShortcode = (shortcode: string, id: string) => {
    navigator.clipboard?.writeText(shortcode);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1600);
  };

  const handleFrameTick = useCallback((t: number) => {
    setScrubTime(t);
  }, []);

  const handleManualScrub = (nextTime: number) => {
    setIsPlaying(false);
    setScrubTime(nextTime);
  };

  const handleTopBarQuickUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const created: GivenPhotoItem[] = [];
    Array.from(files).forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = typeof reader.result === 'string' ? reader.result : null;
        if (!dataUrl) return;
        const item = createDroppedPhotoEmoji(
          dataUrl,
          file.name.replace(/\.[^/.]+$/, ''),
          selectedMood === 'all' ? 'wholesome' : selectedMood,
          userDroppedItems.length + idx + 1
        );
        created.push(item);
        if (created.length === files.length) {
          handleAddDroppedItems(created);
          handleSelectPreset(created[0].matchingConfig, created[0]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  return (
    <div className="min-h-screen w-full flowbase-outer-bg flex items-center justify-center p-2 sm:p-4 lg:p-6 text-white">
      {/* Hidden input for "+ Add Emoji" button in top bar */}
      <input
        ref={quickUploadRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleTopBarQuickUpload}
        className="sr-only"
        aria-label="Add or drop new emoji reaction photos"
      />

      {/* Main Rounded Dark-Plum App Container matching Reference Image */}
      <div className="w-full max-w-[1400px] min-h-[780px] rounded-[38px] flowbase-shell flex flex-col lg:flex-row overflow-x-hidden p-4 sm:p-6 gap-5">
        {/* LEFT VERTICAL ICON RAIL (matching Reference Photo: "CC" logo, white active circle, 5 muted icons, bell + avatar) */}
        <aside
          aria-label="Primary Workspace Navigation"
          className="flex lg:flex-col items-center justify-between lg:w-[64px] shrink-0 py-1 px-2 lg:px-0"
        >
          {/* Top Monogram Logo ("cc") */}
          <a
            href="#dashboard"
            onClick={(e) => {
              e.preventDefault();
              setWorkspaceView('creator');
            }}
            className="font-display text-2xl font-black tracking-tighter text-white select-none"
          >
            cc
          </a>

          {/* Center 6 Vertical Icons */}
          <nav
            aria-label="Studio Sections"
            className="flex lg:flex-col items-center gap-3.5 sm:gap-5 my-auto"
          >
            <button
              type="button"
              onClick={() => setWorkspaceView('creator')}
              aria-label="Creator Collections Deck"
              title="Collections & Mood Mix Deck"
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                workspaceView === 'creator'
                  ? 'bg-white text-[#2E2936] shadow-md scale-105'
                  : 'text-[#8E8798] hover:text-white hover:bg-white/10'
              }`}
            >
              <Home className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setWorkspaceView('studio')}
              aria-label="Parts and Motion Rig Studio"
              title="Customize Parts, Shortcode & Motion Physics"
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                workspaceView === 'studio'
                  ? 'bg-white text-[#2E2936] shadow-md scale-105'
                  : 'text-[#8E8798] hover:text-white hover:bg-white/10'
              }`}
            >
              <Hexagon className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => quickUploadRef.current?.click()}
              aria-label="Drop or Upload Mood Reaction Images"
              title="Drop or Upload Reaction Photos & Sticker Sheets"
              className="relative w-11 h-11 rounded-full text-[#8E8798] hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Gift className="w-5 h-5" />
              <span
                aria-hidden="true"
                className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#FF6B6B]"
              />
            </button>

            <button
              type="button"
              onClick={() => setIsMixerOpen(true)}
              aria-label="Emoji Mixer Lab"
              title="Open 2-Emoji Mixer Lab"
              className="w-11 h-11 rounded-full text-[#8E8798] hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
            >
              <PieChart className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleSaveToPack}
              aria-label="Save Current Emoji to Pack"
              title="Bookmark / Save Current Emoji"
              className="w-11 h-11 rounded-full text-[#8E8798] hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Bookmark className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setIsExportOpen(true)}
              aria-label="Export Animated Emoji"
              title="Export Emoji (WebM, Sprite, SVG, JSON)"
              className="w-11 h-11 rounded-full text-[#8E8798] hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Settings className="w-5 h-5" />
            </button>
          </nav>

          {/* Bottom Bell (Chat Sandbox) & User Avatar */}
          <div className="flex lg:flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => setIsChatSimOpen(true)}
              aria-label="Test in Chat Sandbox"
              title="Test Emoji in Live Discord/Slack Chat Sandbox"
              className="relative w-10 h-10 rounded-full text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Bell className="w-5 h-5 fill-current" />
              <span
                aria-hidden="true"
                className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-[#FF6B6B]"
              />
            </button>

            <button
              type="button"
              onClick={() => handleRandomPhotoCombo()}
              aria-label="Roll Random Mood Mix"
              title="Click Avatar for Instant Random Mood Mix"
              className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/25 hover:ring-white transition-all cursor-pointer shrink-0"
            >
              <img
                src="/assets/aistudio/Billie_eilish_fb05e43d.jpg"
                alt="Creator Profile"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </button>
          </div>
        </aside>

        {/* MAIN RIGHT WORKSPACE (Top Header Bar + 2-Column Content Split) */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 gap-5">
          {/* TOP HEADER BAR matching Reference Image: [Creator | Collector] ... [Search NFT's, Collections] [+ Add NFT] */}
          <header className="flex flex-wrap items-center justify-between gap-4 shrink-0">
            {/* Left Pill Switcher ("Creator" | "Collector") + Quick Undo/Redo/Shortcode */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center bg-[#3C3645] p-1 rounded-full">
                <button
                  type="button"
                  onClick={() => setWorkspaceView('creator')}
                  className={`px-6 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    workspaceView === 'creator'
                      ? 'bg-white text-[#2E2936] shadow-xs'
                      : 'text-[#9E97A8] hover:text-white'
                  }`}
                >
                  Creator
                </button>
                <button
                  type="button"
                  onClick={() => setWorkspaceView('studio')}
                  className={`px-6 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    workspaceView === 'studio'
                      ? 'bg-white text-[#2E2936] shadow-xs'
                      : 'text-[#9E97A8] hover:text-white'
                  }`}
                >
                  Collector
                </button>
              </div>

              {/* Subtle Quick Controls: Shortcode, Undo/Redo, Random Mix */}
              <div className="hidden xl:flex items-center gap-2">
                <label htmlFor="shortcode-input" className="sr-only">
                  Emoji Shortcode
                </label>
                <input
                  id="shortcode-input"
                  type="text"
                  value={shortcodeDraft}
                  onChange={(e) => handleShortcodeInput(e.target.value)}
                  placeholder=":custom_moji:"
                  aria-invalid={!!shortcodeError}
                  className={`w-36 px-3 py-1.5 rounded-full text-xs font-mono bg-[#3C3645] focus:outline-none border ${
                    shortcodeError
                      ? 'border-rose-400 text-rose-300'
                      : 'border-transparent text-[#D8D2E5] focus:border-white/30'
                  }`}
                />
                {shortcodeError && (
                  <span role="alert" className="text-[11px] font-medium text-rose-400 whitespace-nowrap">
                    {shortcodeError}
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={history.past.length === 0}
                  aria-label="Undo Change"
                  className="p-2 rounded-full bg-[#3C3645] text-[#CBC5D6] hover:text-white disabled:opacity-35 transition-colors cursor-pointer"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleRedo}
                  disabled={history.future.length === 0}
                  aria-label="Redo Change"
                  className="p-2 rounded-full bg-[#3C3645] text-[#CBC5D6] hover:text-white disabled:opacity-35 transition-colors cursor-pointer"
                >
                  <Redo2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRandomPhotoCombo()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#3C3645] hover:bg-[#4B4456] text-xs font-semibold text-[#E5BE93] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Random Photo Mix</span>
                </button>
                <button
                  type="button"
                  onClick={handleRandomVectorRig}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#3C3645] hover:bg-[#4B4456] text-xs font-semibold text-[#B9E6D3] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Dices className="w-3.5 h-3.5" />
                  <span>Random Vector</span>
                </button>
              </div>
            </div>

            {/* Right Search Input + "+ Add Emoji" White Pill CTA */}
            <div className="flex items-center gap-3">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-[#9E97A8] absolute left-4 pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Emoji's, Collections"
                  aria-label="Search Emojis and Collections"
                  className="w-48 sm:w-64 pl-10 pr-4 py-2.5 rounded-full bg-[#3C3645] text-xs text-white placeholder-[#8E8798] focus:outline-none focus:ring-1 focus:ring-white/30"
                />
              </div>

              <button
                type="button"
                onClick={() => quickUploadRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-[#F5F2FA] text-[#2E2936] text-xs font-bold shadow-sm transition-transform hover:scale-[1.02] cursor-pointer whitespace-nowrap shrink-0"
              >
                <span className="w-4 h-4 rounded-full bg-[#2E2936] text-white flex items-center justify-center">
                  <Plus className="w-3 h-3 stroke-[3]" />
                </span>
                <span>Add Emoji</span>
              </button>
            </div>
          </header>

          {/* MAIN 2-COLUMN BODY */}
          {workspaceView === 'creator' ? (
            <main
              id="dashboard"
              className="flex-1 flex flex-col lg:flex-row gap-5 xl:gap-6 min-h-0"
            >
              {/* Left Column: Fanned Recent Collections + History & Continuous Mood Drop */}
              <FlowbaseCollectorDeck
                activeConfig={config}
                allPhotoEmojis={allPhotoEmojis}
                userDroppedItems={userDroppedItems}
                searchQuery={searchQuery}
                selectedMood={selectedMood}
                historyRecords={historyRecords}
                onChangeMood={setSelectedMood}
                onAddDroppedItems={handleAddDroppedItems}
                onSelectEmoji={handleSelectPreset}
                onMixWithStage={handleMixWithStage}
                onRollMoodMixture={handleRandomPhotoCombo}
                onSaveToPack={handleSaveConfigToPack}
              />

              {/* Right Column: Large Notched Featured Hero Stage Card */}
              <FlowbaseFeaturedStageCard
                config={config}
                totalPhotosCount={allPhotoEmojis.length}
                isPlaying={isPlaying}
                scrubTime={scrubTime}
                saveFeedback={saveFeedback}
                editionNumber={editionNumber}
                onTogglePlay={() => setIsPlaying((prev) => !prev)}
                onFrameTick={handleFrameTick}
                onUpdateConfig={handleUpdateConfig}
                onOpenMixer={() => setIsMixerOpen(true)}
                onOpenExport={() => setIsExportOpen(true)}
                onSaveToPack={handleSaveToPack}
                onRollMoodMix={() => handleRandomPhotoCombo()}
                onOpenCreatorStudio={() => setWorkspaceView('studio')}
              />
            </main>
          ) : (
            /* Full Parts, Photos & Motion Rigging Studio View */
            <main
              id="studio"
              className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 rounded-[28px]"
            >
              <div className="dark flex-1 flex flex-col lg:flex-row gap-4 min-h-0 overflow-hidden rounded-[28px]">
                <PartSelectorPanel
                  config={config}
                  allPhotoEmojis={allPhotoEmojis}
                  onAddDroppedItems={handleAddDroppedItems}
                  onUpdateConfig={handleUpdateConfig}
                  onSelectPreset={(preset) => handleSelectPreset(preset)}
                  onOpenMixerModal={() => setIsMixerOpen(true)}
                />

                <div className="flex-1 flex flex-col justify-between min-w-0 gap-3 overflow-y-auto">
                  <FlowbaseFeaturedStageCard
                    config={config}
                    totalPhotosCount={allPhotoEmojis.length}
                    isPlaying={isPlaying}
                    scrubTime={scrubTime}
                    saveFeedback={saveFeedback}
                    editionNumber={editionNumber}
                    onTogglePlay={() => setIsPlaying((prev) => !prev)}
                    onFrameTick={handleFrameTick}
                    onUpdateConfig={handleUpdateConfig}
                    onOpenMixer={() => setIsMixerOpen(true)}
                    onOpenExport={() => setIsExportOpen(true)}
                    onSaveToPack={handleSaveToPack}
                    onRollMoodMix={() => handleRandomPhotoCombo()}
                    onOpenCreatorStudio={() => setWorkspaceView('creator')}
                  />

                  <div className="rounded-2xl overflow-hidden border border-white/10">
                    <StageTimeline
                      config={config}
                      isPlaying={isPlaying}
                      onTogglePlay={() => setIsPlaying((prev) => !prev)}
                      scrubTime={scrubTime}
                      onScrubChange={handleManualScrub}
                      fps={fps}
                      onChangeFps={setFps}
                    />
                  </div>
                </div>

                <MotionInspectorPanel
                  config={config}
                  onUpdateConfig={handleUpdateConfig}
                  savedPack={savedPack}
                  onLoadSaved={(preset) => handleSelectPreset(preset)}
                  onDeleteSaved={handleDeleteSaved}
                  copiedId={copiedId}
                  onCopyShortcode={handleCopyShortcode}
                />
              </div>
            </main>
          )}
        </div>
      </div>

      {/* Modals */}
      <EmojiMixerModal
        isOpen={isMixerOpen}
        allPhotoEmojis={allPhotoEmojis}
        onClose={() => setIsMixerOpen(false)}
        onApplyMix={(mixed) => handleSelectPreset(mixed)}
        onSaveMixToPack={handleSaveConfigToPack}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        config={config}
      />

      <ChatSimulatorModal
        isOpen={isChatSimOpen}
        onClose={() => setIsChatSimOpen(false)}
        currentConfig={config}
        savedPack={savedPack}
      />
    </div>
  );
}
