import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { ExportModal } from './components/ExportModal';
import { ChatSimulatorModal } from './components/ChatSimulatorModal';
import { NftCollectionsShowcase } from './components/NftCollectionsShowcase';
import { MinimalistCreatorStudio } from './components/MinimalistCreatorStudio';
import {
  Shuffle,
  Undo2,
  Redo2,
  Download,
} from 'lucide-react';

const STORAGE_KEY = 'mojimotion_saved_pack_v4';
const CUSTOM_PHOTOS_STORAGE_KEY = 'mojimotion_custom_photos_v1';

export type WorkspaceTab = 'collections' | 'easy-studio';

export default function App() {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('collections');
  const [selectedMood, setSelectedMood] = useState<MoodVibeId>('all');

  const [customPhotos, setCustomPhotos] = useState<GivenPhotoItem[]>(() => {
    try {
      const raw = localStorage.getItem(CUSTOM_PHOTOS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_PHOTOS_STORAGE_KEY, JSON.stringify(customPhotos));
    } catch {
      // ignore storage quota errors
    }
  }, [customPhotos]);

  const allPhotoEmojis = useMemo(
    () => [...customPhotos, ...GIVEN_PHOTO_EMOJIS],
    [customPhotos]
  );

  // History-tracked emoji configuration
  const [history, setHistory] = useState(() =>
    createHistoryStack<EmojiConfig>(GIVEN_PHOTO_EMOJIS[0].matchingConfig)
  );
  const config = history.present;

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Shortcode input & validation
  const [shortcodeDraft, setShortcodeDraft] = useState<string>(config.shortcode);
  const [shortcodeError, setShortcodeError] = useState<string | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isChatSimOpen, setIsChatSimOpen] = useState<boolean>(false);

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

  const handleUndo = () => {
    setHistory((prev) => undoHistoryState(prev));
  };

  const handleRedo = () => {
    setHistory((prev) => redoHistoryState(prev));
  };

  // Random Creation (fuses 2 random photos from the built-in catalog)
  const handleRandomPhotoCombo = (moodOverride?: MoodVibeId) => {
    const activeMood = moodOverride ?? selectedMood;
    const { config: comboCfg } = randomizePhotoCombo(
      undefined,
      allPhotoEmojis,
      activeMood
    );
    setHistory((prev) => pushHistoryState(prev, comboCfg));
  };

  // Randomize Pure Cartoon Vector Rig
  const handleRandomVectorRig = () => {
    const randomCfg = randomizeEmojiConfig();
    setHistory((prev) => pushHistoryState(prev, randomCfg));
  };

  const handleSelectPreset = (preset: EmojiConfig) => {
    const cloned: EmojiConfig = {
      ...preset,
      fineTune: { ...preset.fineTune },
      layerMotion: { ...preset.layerMotion },
    };
    setHistory((prev) => pushHistoryState(prev, cloned));
  };

  const handleMixWithStage = (item: GivenPhotoItem) => {
    const mixed = mixEmojiConfigs(config, item.matchingConfig, 'duo-collab');
    setHistory((prev) => pushHistoryState(prev, mixed));
  };

  const handleAddUserPhotos = (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (list.length === 0) return;

    list.forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const item = createDroppedPhotoEmoji(
            reader.result,
            file.name,
            selectedMood === 'all' ? 'rizz' : selectedMood,
            idx + 1
          );
          setCustomPhotos((prev) => [item, ...prev]);
          if (idx === 0) {
            setHistory((prev) => pushHistoryState(prev, item.matchingConfig));
          }
        }
      };
      reader.readAsDataURL(file);
    });
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

  const handleSaveConfigToPack = (targetConfig?: EmojiConfig) => {
    const cfgToSave = targetConfig || config;
    const formattedCode = formatShortcode(cfgToSave.shortcode);
    const snapshotConfig: EmojiConfig = {
      ...cfgToSave,
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

  return (
    <div className="min-h-screen w-full bg-[#F9F9F9] text-slate-900 flex flex-col">
      {/* MINIMALIST 3-ZONE TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-[#E8B1C4] border-b border-[#d899b0] px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="max-w-[1360px] mx-auto flex items-center justify-between gap-4 sm:gap-8">
          {/* Zone 1: Custom Logo + "Your Memo" Brand Wordmark */}
          <a
            href="#top"
            title="Your Memo"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('collections');
            }}
            className="flex items-center gap-2.5 font-display text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0 group"
          >
            <img
              src="/assets/aistudio/WhatsApp_Image_2026-11-06_at_4.41.22_PM_bdbc8d81.jpeg"
              alt="The Memo Logo"
              className="w-9 h-9 rounded-full object-cover bg-white shadow-xs group-hover:scale-105 transition-transform"
            />
            <span>
              <span className="text-[#FF004C]">Your</span>{' '}
              <span className="text-slate-900">Memo</span>
            </span>
          </a>

          {/* Zone 2: Minimalist Navbar View Buttons */}
          <nav
            aria-label="Primary Workspace Views"
            className="flex items-center gap-1 sm:gap-2 p-1 rounded-xl bg-white/80 border border-white/60 overflow-x-auto shadow-2xs"
          >
            <button
              type="button"
              onClick={() => setActiveTab('collections')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'collections'
                  ? 'bg-[#FF004C] text-white shadow-xs'
                  : 'text-slate-800 hover:text-slate-950 hover:bg-white'
              }`}
            >
              Collections
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('easy-studio')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'easy-studio'
                  ? 'bg-[#FF004C] text-white shadow-xs'
                  : 'text-slate-800 hover:text-slate-950 hover:bg-white'
              }`}
            >
              Easy Studio
            </button>

            <button
              type="button"
              onClick={() => setIsChatSimOpen(true)}
              className="hidden md:inline-flex px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-800 hover:text-slate-950 hover:bg-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Chat Sandbox
            </button>
          </nav>

          {/* Zone 3: Prominent Random Creation CTA + Undo/Redo & Export */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden lg:flex items-center gap-1 mr-1">
              <button
                type="button"
                onClick={handleUndo}
                disabled={history.past.length === 0}
                aria-label="Undo Change"
                className="p-2 rounded-lg bg-white/85 border border-white/60 text-slate-800 hover:bg-white disabled:opacity-35 transition-colors cursor-pointer"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleRedo}
                disabled={history.future.length === 0}
                aria-label="Redo Change"
                className="p-2 rounded-lg bg-white/85 border border-white/60 text-slate-800 hover:bg-white disabled:opacity-35 transition-colors cursor-pointer"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleRandomPhotoCombo()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF4925] hover:bg-[#E97A11] text-white text-xs font-bold shadow-[0_6px_18px_rgba(255,73,37,0.28)] transition-all hover:scale-[1.02] cursor-pointer whitespace-nowrap shrink-0"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Random Creation</span>
            </button>

            <button
              type="button"
              onClick={() => setIsExportOpen(true)}
              aria-label="Export Animated Emoji"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FF004C] hover:bg-[#FF4925] text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </header>

      {/* ACTIVE WORKSPACE VIEW */}
      <main className="flex-1 w-full">
        {activeTab === 'collections' && (
          <NftCollectionsShowcase
            activeConfig={config}
            allPhotoEmojis={allPhotoEmojis}
            selectedMood={selectedMood}
            isPlaying={isPlaying}
            saveFeedback={saveFeedback}
            onChangeMood={setSelectedMood}
            onSelectEmoji={handleSelectPreset}
            onMixWithStage={handleMixWithStage}
            onRandomCreation={() => handleRandomPhotoCombo()}
            onRandomVectorCreation={handleRandomVectorRig}
            onOpenEasyStudio={() => setActiveTab('easy-studio')}
            onOpenExport={() => setIsExportOpen(true)}
            onSaveToPack={handleSaveConfigToPack}
          />
        )}

        {activeTab === 'easy-studio' && (
          <MinimalistCreatorStudio
            config={config}
            allPhotoEmojis={allPhotoEmojis}
            savedPack={savedPack}
            isPlaying={isPlaying}
            shortcodeDraft={shortcodeDraft}
            shortcodeError={shortcodeError}
            saveFeedback={saveFeedback}
            copiedId={copiedId}
            onTogglePlay={() => setIsPlaying((prev) => !prev)}
            onShortcodeChange={handleShortcodeInput}
            onUpdateConfig={handleUpdateConfig}
            onSelectPreset={handleSelectPreset}
            onMixWithStage={handleMixWithStage}
            onRandomPhotoCombo={() => handleRandomPhotoCombo()}
            onRandomVectorRig={handleRandomVectorRig}
            onSaveToPack={handleSaveToPack}
            onDeleteSaved={handleDeleteSaved}
            onCopyShortcode={handleCopyShortcode}
            onOpenExport={() => setIsExportOpen(true)}
            onOpenChatSim={() => setIsChatSimOpen(true)}
            onAddPhotos={handleAddUserPhotos}
          />
        )}
      </main>

      {/* Modals */}
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


