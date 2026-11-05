import React, { useEffect, useRef, useState } from 'react';
import { EmojiConfig } from '../types/emoji';
import { serializeSvgWithInlinedImages } from '../utils/photoEmojiCatalog';
import { EmojiRenderer } from './EmojiRenderer';
import { X, Download, Film, Image as ImageIcon, FileCode, Copy, Check } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: EmojiConfig;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, config }) => {
  const [frameCount, setFrameCount] = useState<number>(8);
  const [frameSize, setFrameSize] = useState<number>(128);
  const [spriteDataUrl, setSpriteDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  const frameSvgRefs = useRef<Array<SVGSVGElement | null>>([]);
  const singleSvgRef = useRef<SVGSVGElement | null>(null);

  const phases = Array.from({ length: frameCount }, (_, i) => i / frameCount);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setIsGenerating(true);

    const timer = setTimeout(async () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = frameSize * frameCount;
        canvas.height = frameSize;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        for (let i = 0; i < frameCount; i++) {
          const svgEl = frameSvgRefs.current[i];
          if (!svgEl) continue;
          const svgString = await serializeSvgWithInlinedImages(svgEl);
          const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(svgBlob);

          await new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => {
              ctx.drawImage(img, i * frameSize, 0, frameSize, frameSize);
              URL.revokeObjectURL(url);
              resolve();
            };
            img.onerror = () => {
              URL.revokeObjectURL(url);
              resolve();
            };
            img.src = url;
          });
        }

        if (!cancelled) {
          setSpriteDataUrl(canvas.toDataURL('image/png'));
          setIsGenerating(false);
        }
      } catch {
        if (!cancelled) {
          setIsGenerating(false);
        }
      }
    }, 120);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isOpen, frameCount, frameSize, config]);

  if (!isOpen) return null;

  const downloadDataUrl = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadHighResPng = async () => {
    const svgEl = singleSvgRef.current;
    if (!svgEl) return;
    const svgString = await serializeSvgWithInlinedImages(svgEl);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      if (ctx) {
        ctx.drawImage(img, 0, 0, 512, 512);
        const pngUrl = canvas.toDataURL('image/png');
        const cleanName = config.shortcode.replace(/:/g, '') || 'custom_emoji';
        downloadDataUrl(pngUrl, `${cleanName}_512x512.png`);
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleDownloadSvg = async () => {
    const svgEl = singleSvgRef.current;
    if (!svgEl) return;
    const svgString = await serializeSvgWithInlinedImages(svgEl);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const cleanName = config.shortcode.replace(/:/g, '') || 'custom_emoji';
    downloadDataUrl(url, `${cleanName}.svg`);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleCopyJson = () => {
    navigator.clipboard?.writeText(JSON.stringify(config, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 1800);
  };

  const cleanFilePrefix = config.shortcode.replace(/:/g, '') || 'custom_moji';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4"
    >
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2
              id="export-modal-title"
              className="text-lg font-bold text-slate-900 dark:text-slate-100"
            >
              Export Animated Emoji & Sprite Sheet
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {config.name} · <span className="font-mono">{config.shortcode}</span> · Motion:{' '}
              {config.motionPreset}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Export Modal"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Hidden offscreen SVG frames used for exact rasterization */}
          <div className="sr-only" aria-hidden="true">
            <EmojiRenderer
              ref={singleSvgRef}
              config={config}
              size={512}
              animate={false}
              forcedNormalizedTime={0.2}
            />
            {phases.map((phase, idx) => (
              <EmojiRenderer
                key={idx}
                ref={(el) => {
                  frameSvgRefs.current[idx] = el;
                }}
                config={config}
                size={frameSize}
                animate={false}
                forcedNormalizedTime={phase}
              />
            ))}
          </div>

          {/* 1. Multi-Frame Motion Sprite Sheet Section */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-amber-500" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Motion Sprite Sheet Filmstrip (.PNG)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Transparent horizontal frame strip ready for Discord/Slack sticker pipelines or CSS sprites.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-800 p-1 rounded-lg">
                  {[6, 8, 12].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setFrameCount(count)}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
                        frameCount === count
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-amber-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {count} Frames
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-800 p-1 rounded-lg">
                  {[128, 256].map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setFrameSize(sz)}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
                        frameSize === sz
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-amber-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {sz}px
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Filmstrip Preview */}
            <div className="p-3 rounded-lg checkerboard-dark border border-slate-300 dark:border-slate-800 overflow-x-auto">
              <div className="flex items-center gap-2 min-w-max">
                {phases.map((phase, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center p-1.5 rounded bg-slate-900/60 border border-slate-700/60"
                  >
                    <EmojiRenderer
                      config={config}
                      size={68}
                      animate={false}
                      forcedNormalizedTime={phase}
                    />
                    <span className="text-[10px] font-mono text-slate-400 mt-1 tabular-nums">
                      F{idx + 1} ({Math.round(phase * 100)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                Output Dimensions: {frameSize * frameCount} × {frameSize}px PNG
              </span>
              <button
                type="button"
                disabled={!spriteDataUrl || isGenerating}
                onClick={() => {
                  if (spriteDataUrl) {
                    downloadDataUrl(
                      spriteDataUrl,
                      `${cleanFilePrefix}_spritesheet_${frameCount}f.png`
                    );
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                <span>{isGenerating ? 'Rendering Strip...' : 'Download Sprite Sheet (.PNG)'}</span>
              </button>
            </div>
          </div>

          {/* 2. Direct Sticker & Vector Downloads */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={handleDownloadHighResPng}
              className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500/60 bg-white dark:bg-slate-900 text-left transition-all cursor-pointer group"
            >
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  High-Res Sticker (.PNG)
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                  512 × 512px Transparent
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={handleDownloadSvg}
              className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500/60 bg-white dark:bg-slate-900 text-left transition-all cursor-pointer group"
            >
              <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-500 group-hover:bg-sky-500 group-hover:text-slate-950 transition-colors">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Scalable Vector (.SVG)
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  Lossless Vector Artwork
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={handleCopyJson}
              className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500/60 bg-white dark:bg-slate-900 text-left transition-all cursor-pointer group"
            >
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                {copiedJson ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {copiedJson ? 'Copied Rig JSON!' : 'Copy Rig Preset (.JSON)'}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  Shareable Motion Config
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
