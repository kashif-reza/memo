import React, { forwardRef, useEffect, useId, useState } from 'react';
import { EmojiConfig } from '../types/emoji';
import { computeMotionFrame } from '../utils/emojiEngine';
import { computeSvgCropPlacement } from '../utils/photoEmojiCatalog';

export interface EmojiRendererProps {
  config: EmojiConfig;
  size?: number;
  animate?: boolean;
  /** If provided, overrides the internal clock with an explicit normalized time [0..1) */
  forcedNormalizedTime?: number | null;
  /** Callback fired on animation tick for timeline synchronization */
  onFrameTick?: (normalizedTime: number) => void;
  className?: string;
  showShadow?: boolean;
}

export const EmojiRenderer = forwardRef<SVGSVGElement, EmojiRendererProps>(
  (
    {
      config,
      size = 220,
      animate = true,
      forcedNormalizedTime = null,
      onFrameTick,
      className = '',
      showShadow = true,
    },
    ref
  ) => {
    const uid = useId().replace(/:/g, '');
    const [internalTime, setInternalTime] = useState<number>(0.12);

    useEffect(() => {
      if (!animate || forcedNormalizedTime !== null) {
        return;
      }
      let rafId: number;
      const start = performance.now();
      const baseDurationMs = 1400;

      const loop = (now: number) => {
        const elapsed = (now - start) * config.motionSpeed;
        const t = (((elapsed % baseDurationMs) + baseDurationMs) % baseDurationMs) / baseDurationMs;
        setInternalTime(t);
        if (onFrameTick) {
          onFrameTick(t);
        }
        rafId = requestAnimationFrame(loop);
      };

      rafId = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(rafId);
    }, [animate, forcedNormalizedTime, config.motionSpeed, onFrameTick]);

    const activeTime =
      forcedNormalizedTime !== null && forcedNormalizedTime !== undefined
        ? forcedNormalizedTime
        : animate
        ? internalTime
        : 0.14;

    const frame = computeMotionFrame(config, activeTime);
    const { fineTune } = config;
    const strokeW = config.outlineWidth;
    const strokeCol = config.outlineColor;

    const hasPhoto = Boolean(config.photoUrl && config.photoMixMode !== 'none');
    const mixMode = config.photoMixMode || (config.photoUrl ? 'cutout-solo' : 'none');

    // Helper for SVG transform string around center (100, 100)
    const bodyTransformStr = [
      `translate(${frame.body.translateX.toFixed(2)}, ${frame.body.translateY.toFixed(2)})`,
      `translate(100, 100)`,
      `rotate(${frame.body.rotate.toFixed(2)})`,
      `skewX(${frame.body.skewX.toFixed(2)})`,
      `scale(${(frame.body.scaleX * fineTune.faceScale).toFixed(3)}, ${(frame.body.scaleY * fineTune.faceScale).toFixed(3)})`,
      `translate(-100, -100)`,
    ].join(' ');

    const featuresTransformStr = [
      `translate(${frame.faceFeatures.translateX.toFixed(2)}, ${frame.faceFeatures.translateY.toFixed(2)})`,
      `translate(100, 100)`,
      `scale(${frame.faceFeatures.scaleX.toFixed(3)}, ${frame.faceFeatures.scaleY.toFixed(3)})`,
      `translate(-100, -100)`,
    ].join(' ');

    const eyesTransformStr = [
      `translate(${frame.eyes.translateX.toFixed(2)}, ${(frame.eyes.translateY + fineTune.eyeOffsetY).toFixed(2)})`,
      `translate(100, 92)`,
      `scale(${fineTune.eyeScale.toFixed(3)}, ${(fineTune.eyeScale * frame.eyes.blinkScaleY).toFixed(3)})`,
      `translate(-100, -92)`,
    ].join(' ');

    const browsTransformStr = [
      `translate(${frame.brows.translateX.toFixed(2)}, ${(frame.brows.translateY + fineTune.eyeOffsetY).toFixed(2)})`,
      `translate(100, 72)`,
      `rotate(${frame.brows.rotate.toFixed(2)})`,
      `translate(-100, -72)`,
    ].join(' ');

    const mouthTransformStr = [
      `translate(${frame.mouth.translateX.toFixed(2)}, ${(frame.mouth.translateY + fineTune.mouthOffsetY).toFixed(2)})`,
      `translate(100, 126)`,
      `scale(${(frame.mouth.scaleX * fineTune.mouthScale).toFixed(3)}, ${(frame.mouth.scaleY * fineTune.mouthScale).toFixed(3)})`,
      `translate(-100, -126)`,
    ].join(' ');

    const gearTransformStr = [
      `translate(${frame.accessory.translateX.toFixed(2)}, ${(frame.accessory.translateY + fineTune.gearOffsetY).toFixed(2)})`,
      `translate(100, 56)`,
      `rotate(${(frame.accessory.rotate + fineTune.gearRotation).toFixed(2)})`,
      `translate(-100, -56)`,
    ].join(' ');

    const leftEyeX = 72 - fineTune.eyeSpacing;
    const rightEyeX = 128 + fineTune.eyeSpacing;
    const eyeY = 93;

    const shadowScale = Math.max(0.45, Math.min(1.2, 1 + frame.body.translateY / 55));

    const gradId = `faceGrad-${uid}`;
    const shineId = `faceShine-${uid}`;
    const laserId = `laserGlow-${uid}`;
    const clipId = `faceClip-${uid}`;
    const duoLeftClipId = `duoLeftClip-${uid}`;
    const duoRightClipId = `duoRightClip-${uid}`;

    const fillUrl = config.has3DShading ? `url(#${gradId})` : config.primaryColor;

    const renderClipGeometry = () => {
      switch (config.faceShape) {
        case 'squircle':
          return <rect x="36" y="36" width="128" height="128" rx="42" />;
        case 'cat-ears':
        case 'bear-ears':
        case 'devil-horns':
          return <circle cx="100" cy="104" r="62" />;
        case 'blob-slime':
          return (
            <path d="M 100 38 C 142 38, 166 68, 168 110 C 170 146, 146 164, 100 164 C 54 164, 30 146, 32 110 C 34 68, 58 38, 100 38 Z" />
          );
        case 'star-burst':
          return (
            <path d="M 100 26 L 121 64 L 164 72 L 134 104 L 140 148 L 100 129 L 60 148 L 66 104 L 36 72 L 79 64 Z" />
          );
        case 'heart-face':
          return (
            <path d="M 100 164 C 100 164, 32 122, 32 76 C 32 48, 56 34, 78 34 C 92 34, 100 44, 100 54 C 100 44, 108 34, 122 34 C 144 34, 168 48, 168 76 C 168 122, 100 164, 100 164 Z" />
          );
        case 'classic-round':
        default:
          return <circle cx="100" cy="100" r="64" />;
      }
    };

    const renderBaseShape = (strokeOnly = false) => {
      const f = strokeOnly ? 'none' : fillUrl;
      switch (config.faceShape) {
        case 'squircle':
          return (
            <rect
              x="36"
              y="36"
              width="128"
              height="128"
              rx="42"
              fill={f}
              stroke={strokeCol}
              strokeWidth={strokeW}
            />
          );
        case 'cat-ears':
          return (
            <g>
              <path
                d="M 44 68 L 36 24 L 78 44 Z"
                fill={strokeOnly ? fillUrl : f}
                stroke={strokeCol}
                strokeWidth={strokeW}
                strokeLinejoin="round"
              />
              {!strokeOnly && <path d="M 47 58 L 43 33 L 68 46 Z" fill={config.cheekColor} opacity="0.55" />}
              <path
                d="M 156 68 L 164 24 L 122 44 Z"
                fill={strokeOnly ? fillUrl : f}
                stroke={strokeCol}
                strokeWidth={strokeW}
                strokeLinejoin="round"
              />
              {!strokeOnly && <path d="M 153 58 L 157 33 L 132 46 Z" fill={config.cheekColor} opacity="0.55" />}
              <circle
                cx="100"
                cy="104"
                r="62"
                fill={f}
                stroke={strokeCol}
                strokeWidth={strokeW}
              />
            </g>
          );
        case 'bear-ears':
          return (
            <g>
              <circle
                cx="50"
                cy="48"
                r="22"
                fill={strokeOnly ? fillUrl : f}
                stroke={strokeCol}
                strokeWidth={strokeW}
              />
              <circle cx="50" cy="48" r="11" fill={config.secondaryColor} opacity="0.7" />
              <circle
                cx="150"
                cy="48"
                r="22"
                fill={strokeOnly ? fillUrl : f}
                stroke={strokeCol}
                strokeWidth={strokeW}
              />
              <circle cx="150" cy="48" r="11" fill={config.secondaryColor} opacity="0.7" />
              <circle
                cx="100"
                cy="104"
                r="62"
                fill={f}
                stroke={strokeCol}
                strokeWidth={strokeW}
              />
            </g>
          );
        case 'devil-horns':
          return (
            <g>
              <path
                d="M 48 56 C 32 36, 36 18, 56 22 C 52 34, 58 44, 68 48 Z"
                fill={config.secondaryColor}
                stroke={strokeCol}
                strokeWidth={strokeW}
                strokeLinejoin="round"
              />
              <path
                d="M 152 56 C 168 36, 164 18, 144 22 C 148 34, 142 44, 132 48 Z"
                fill={config.secondaryColor}
                stroke={strokeCol}
                strokeWidth={strokeW}
                strokeLinejoin="round"
              />
              <circle
                cx="100"
                cy="104"
                r="62"
                fill={f}
                stroke={strokeCol}
                strokeWidth={strokeW}
              />
            </g>
          );
        case 'blob-slime':
          return (
            <path
              d="M 100 38 C 142 38, 166 68, 168 110 C 170 146, 146 164, 100 164 C 54 164, 30 146, 32 110 C 34 68, 58 38, 100 38 Z"
              fill={f}
              stroke={strokeCol}
              strokeWidth={strokeW}
              strokeLinejoin="round"
            />
          );
        case 'star-burst':
          return (
            <path
              d="M 100 26 L 121 64 L 164 72 L 134 104 L 140 148 L 100 129 L 60 148 L 66 104 L 36 72 L 79 64 Z"
              fill={f}
              stroke={strokeCol}
              strokeWidth={strokeW}
              strokeLinejoin="round"
            />
          );
        case 'heart-face':
          return (
            <path
              d="M 100 164 C 100 164, 32 122, 32 76 C 32 48, 56 34, 78 34 C 92 34, 100 44, 100 54 C 100 44, 108 34, 122 34 C 144 34, 168 48, 168 76 C 168 122, 100 164, 100 164 Z"
              fill={f}
              stroke={strokeCol}
              strokeWidth={strokeW}
              strokeLinejoin="round"
            />
          );
        case 'classic-round':
        default:
          return (
            <circle
              cx="100"
              cy="100"
              r="64"
              fill={f}
              stroke={strokeCol}
              strokeWidth={strokeW}
            />
          );
      }
    };

    const renderPhotoLayer = () => {
      if (!hasPhoto || !config.photoUrl) return null;
      const pScale = config.photoScale ?? 1.1;
      const pOffsetY = config.photoOffsetY ?? 0;
      const imgSize = 140 * pScale;
      const imgX = 100 - imgSize / 2;
      const imgY = 100 - imgSize / 2 + pOffsetY;

      if (mixMode === 'duo-collab') {
        const secondUrl = config.secondaryPhotoUrl || config.photoUrl;
        const bobOffset = Math.sin(activeTime * Math.PI * 2) * 5;
        const leftImg = computeSvgCropPlacement(config.photoUrl, 26, 52, 100, 100);
        const rightImg = computeSvgCropPlacement(secondUrl, 74, 52, 100, 100);
        return (
          <g>
            {/* Left Photo Medallion */}
            <g transform={`translate(-24, ${bobOffset.toFixed(1)}) rotate(-6 76 102)`}>
              <circle cx="76" cy="102" r="46" fill={config.primaryColor} stroke="#FFFFFF" strokeWidth="5" />
              <g clipPath={`url(#${duoLeftClipId})`}>
                <image
                  href={leftImg.href}
                  x={leftImg.x}
                  y={leftImg.y}
                  width={leftImg.width}
                  height={leftImg.height}
                  preserveAspectRatio={leftImg.preserveAspectRatio}
                />
              </g>
              <circle cx="76" cy="102" r="46" fill="none" stroke={strokeCol} strokeWidth={strokeW} />
            </g>

            {/* Right Photo Medallion */}
            <g transform={`translate(24, ${(-bobOffset).toFixed(1)}) rotate(6 124 102)`}>
              <circle cx="124" cy="102" r="46" fill={config.secondaryColor} stroke="#FFFFFF" strokeWidth="5" />
              <g clipPath={`url(#${duoRightClipId})`}>
                <image
                  href={rightImg.href}
                  x={rightImg.x}
                  y={rightImg.y}
                  width={rightImg.width}
                  height={rightImg.height}
                  preserveAspectRatio={rightImg.preserveAspectRatio}
                />
              </g>
              <circle cx="124" cy="102" r="46" fill="none" stroke={strokeCol} strokeWidth={strokeW} />
            </g>
          </g>
        );
      }

      const morphOpacity =
        mixMode === 'cross-morph' && config.secondaryPhotoUrl
          ? Number((0.5 - 0.5 * Math.cos(activeTime * Math.PI * 2)).toFixed(3))
          : 0;

      const primaryPlacement = computeSvgCropPlacement(
        config.photoUrl,
        imgX,
        imgY,
        imgSize,
        imgSize
      );
      const secondaryPlacement =
        mixMode === 'cross-morph' && config.secondaryPhotoUrl
          ? computeSvgCropPlacement(config.secondaryPhotoUrl, imgX, imgY, imgSize, imgSize)
          : null;

      return (
        <g>
          {renderBaseShape(false)}
          <g clipPath={`url(#${clipId})`}>
            <image
              href={primaryPlacement.href}
              x={primaryPlacement.x}
              y={primaryPlacement.y}
              width={primaryPlacement.width}
              height={primaryPlacement.height}
              preserveAspectRatio={primaryPlacement.preserveAspectRatio}
            />
            {secondaryPlacement && (
              <image
                href={secondaryPlacement.href}
                x={secondaryPlacement.x}
                y={secondaryPlacement.y}
                width={secondaryPlacement.width}
                height={secondaryPlacement.height}
                opacity={morphOpacity}
                preserveAspectRatio={secondaryPlacement.preserveAspectRatio}
              />
            )}
          </g>
          {/* Crisp outer silhouette frame over clipped photo */}
          {renderBaseShape(true)}
        </g>
      );
    };

    const renderCheeks = () => {
      switch (config.cheeks) {
        case 'soft-blush':
          return (
            <g opacity="0.65">
              <ellipse cx={leftEyeX - 12} cy={eyeY + 19} rx="13" ry="7.5" fill={config.cheekColor} />
              <ellipse cx={rightEyeX + 12} cy={eyeY + 19} rx="13" ry="7.5" fill={config.cheekColor} />
            </g>
          );
        case 'cute-slashes':
          return (
            <g stroke={config.cheekColor} strokeWidth="3" strokeLinecap="round" opacity="0.85">
              <line x1={leftEyeX - 20} y1={eyeY + 21} x2={leftEyeX - 15} y2={eyeY + 14} />
              <line x1={leftEyeX - 13} y1={eyeY + 22} x2={leftEyeX - 8} y2={eyeY + 15} />
              <line x1={leftEyeX - 6} y1={eyeY + 21} x2={leftEyeX - 1} y2={eyeY + 14} />
              <line x1={rightEyeX + 1} y1={eyeY + 21} x2={rightEyeX + 6} y2={eyeY + 14} />
              <line x1={rightEyeX + 8} y1={eyeY + 22} x2={rightEyeX + 13} y2={eyeY + 15} />
              <line x1={rightEyeX + 15} y1={eyeY + 21} x2={rightEyeX + 20} y2={eyeY + 14} />
            </g>
          );
        case 'freckles':
          return (
            <g fill={config.outlineColor} opacity="0.55">
              <circle cx={leftEyeX - 16} cy={eyeY + 16} r="2.2" />
              <circle cx={leftEyeX - 9} cy={eyeY + 19} r="2.2" />
              <circle cx={leftEyeX - 3} cy={eyeY + 15} r="2.2" />
              <circle cx={rightEyeX + 3} cy={eyeY + 15} r="2.2" />
              <circle cx={rightEyeX + 9} cy={eyeY + 19} r="2.2" />
              <circle cx={rightEyeX + 16} cy={eyeY + 16} r="2.2" />
            </g>
          );
        case 'star-stickers':
          return (
            <g fill={config.cheekColor}>
              <polygon
                points={`${leftEyeX - 13},${eyeY + 11} ${leftEyeX - 10},${eyeY + 16} ${leftEyeX - 5},${eyeY + 17} ${leftEyeX - 9},${eyeY + 21} ${leftEyeX - 8},${eyeY + 26} ${leftEyeX - 13},${eyeY + 23} ${leftEyeX - 18},${eyeY + 26} ${leftEyeX - 17},${eyeY + 21} ${leftEyeX - 21},${eyeY + 17} ${leftEyeX - 16},${eyeY + 16}`}
              />
              <polygon
                points={`${rightEyeX + 13},${eyeY + 11} ${rightEyeX + 16},${eyeY + 16} ${rightEyeX + 21},${eyeY + 17} ${rightEyeX + 17},${eyeY + 21} ${rightEyeX + 18},${eyeY + 26} ${rightEyeX + 13},${eyeY + 23} ${rightEyeX + 8},${eyeY + 26} ${rightEyeX + 9},${eyeY + 21} ${rightEyeX + 5},${eyeY + 17} ${rightEyeX + 10},${eyeY + 16}`}
              />
            </g>
          );
        case 'sweat-drop':
          return (
            <path
              d={`M ${rightEyeX + 22} ${eyeY - 22} C ${rightEyeX + 22} ${eyeY - 22}, ${rightEyeX + 32} ${eyeY - 6}, ${rightEyeX + 22} ${eyeY + 2} C ${rightEyeX + 12} ${eyeY - 6}, ${rightEyeX + 22} ${eyeY - 22}, ${rightEyeX + 22} ${eyeY - 22} Z`}
              fill="#38BDF8"
              stroke={strokeCol}
              strokeWidth="2.5"
            />
          );
        case 'none':
        default:
          return null;
      }
    };

    const renderEyes = () => {
      switch (config.eyes) {
        case 'happy-arc':
          return (
            <g fill="none" stroke={config.eyeColor} strokeWidth="5.5" strokeLinecap="round">
              <path d={`M ${leftEyeX - 13} ${eyeY + 4} Q ${leftEyeX} ${eyeY - 14} ${leftEyeX + 13} ${eyeY + 4}`} />
              <path d={`M ${rightEyeX - 13} ${eyeY + 4} Q ${rightEyeX} ${eyeY - 14} ${rightEyeX + 13} ${eyeY + 4}`} />
            </g>
          );
        case 'star-struck': {
          const makeStar = (cx: number, cy: number, rOuter: number, rInner: number) => {
            const pts: string[] = [];
            for (let i = 0; i < 10; i++) {
              const r = i % 2 === 0 ? rOuter : rInner;
              const a = (i * Math.PI) / 5 - Math.PI / 2;
              pts.push(`${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`);
            }
            return pts.join(' ');
          };
          return (
            <g>
              <polygon
                points={makeStar(leftEyeX, eyeY, 17, 7.5)}
                fill="#FDE047"
                stroke={strokeCol}
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <polygon
                points={makeStar(rightEyeX, eyeY, 17, 7.5)}
                fill="#FDE047"
                stroke={strokeCol}
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <circle cx={leftEyeX - 3} cy={eyeY - 3} r="2.5" fill="#FFFFFF" />
              <circle cx={rightEyeX - 3} cy={eyeY - 3} r="2.5" fill="#FFFFFF" />
            </g>
          );
        }
        case 'heart-eyes': {
          const renderHeart = (cx: number, cy: number) => (
            <path
              d={`M ${cx} ${cy + 14} C ${cx} ${cy + 14}, ${cx - 17} ${cy + 2}, ${cx - 17} ${cy - 7} C ${cx - 17} ${cy - 14}, ${cx - 8} ${cy - 16}, ${cx} ${cy - 8} C ${cx + 8} ${cy - 16}, ${cx + 17} ${cy - 14}, ${cx + 17} ${cy - 7} C ${cx + 17} ${cy + 2}, ${cx} ${cy + 14}, ${cx} ${cy + 14} Z`}
              fill="#F43F5E"
              stroke={strokeCol}
              strokeWidth="3"
              strokeLinejoin="round"
            />
          );
          return (
            <g>
              {renderHeart(leftEyeX, eyeY)}
              {renderHeart(rightEyeX, eyeY)}
              <circle cx={leftEyeX - 5} cy={eyeY - 6} r="2.8" fill="#FFE4E6" />
              <circle cx={rightEyeX - 5} cy={eyeY - 6} r="2.8" fill="#FFE4E6" />
            </g>
          );
        }
        case 'wink-playful':
          return (
            <g>
              <ellipse cx={leftEyeX} cy={eyeY} rx="10.5" ry="13" fill={config.eyeColor} />
              <circle cx={leftEyeX - 3.5} cy={eyeY - 4.5} r="4" fill="#FFFFFF" />
              <circle cx={leftEyeX + 3.5} cy={eyeY + 4} r="2" fill="#FFFFFF" />
              <path
                d={`M ${rightEyeX - 13} ${eyeY - 5} L ${rightEyeX - 1} ${eyeY + 1} L ${rightEyeX - 13} ${eyeY + 8}`}
                fill="none"
                stroke={config.eyeColor}
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={`M ${rightEyeX - 2} ${eyeY + 1} L ${rightEyeX + 12} ${eyeY + 1}`}
                fill="none"
                stroke={config.eyeColor}
                strokeWidth="5"
                strokeLinecap="round"
              />
            </g>
          );
        case 'sassy-side':
          return (
            <g>
              <ellipse cx={leftEyeX} cy={eyeY} rx="12" ry="10" fill="#FFFFFF" stroke={strokeCol} strokeWidth="3" />
              <circle cx={leftEyeX + 5} cy={eyeY} r="6.5" fill={config.eyeColor} />
              <circle cx={leftEyeX + 7} cy={eyeY - 2.5} r="2" fill="#FFFFFF" />
              <line x1={leftEyeX - 13} y1={eyeY - 6} x2={leftEyeX + 13} y2={eyeY - 6} stroke={strokeCol} strokeWidth="3.5" strokeLinecap="round" />

              <ellipse cx={rightEyeX} cy={eyeY} rx="12" ry="10" fill="#FFFFFF" stroke={strokeCol} strokeWidth="3" />
              <circle cx={rightEyeX + 5} cy={eyeY} r="6.5" fill={config.eyeColor} />
              <circle cx={rightEyeX + 7} cy={eyeY - 2.5} r="2" fill="#FFFFFF" />
              <line x1={rightEyeX - 13} y1={eyeY - 6} x2={rightEyeX + 13} y2={eyeY - 6} stroke={strokeCol} strokeWidth="3.5" strokeLinecap="round" />
            </g>
          );
        case 'laser-glow':
          return (
            <g>
              <ellipse cx={leftEyeX} cy={eyeY} rx="14" ry="9" fill={`url(#${laserId})`} />
              <ellipse cx={rightEyeX} cy={eyeY} rx="14" ry="9" fill={`url(#${laserId})`} />
              <ellipse cx={leftEyeX} cy={eyeY} rx="8" ry="5" fill="#FFFFFF" />
              <ellipse cx={rightEyeX} cy={eyeY} rx="8" ry="5" fill="#FFFFFF" />
              <path
                d={`M ${leftEyeX - 22} ${eyeY} L ${leftEyeX + 22} ${eyeY} M ${leftEyeX} ${eyeY - 16} L ${leftEyeX} ${eyeY + 16}`}
                stroke="#EF4444"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d={`M ${rightEyeX - 22} ${eyeY} L ${rightEyeX + 22} ${eyeY} M ${rightEyeX} ${eyeY - 16} L ${rightEyeX} ${eyeY + 16}`}
                stroke="#EF4444"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </g>
          );
        case 'dizzy-spiral':
          return (
            <g fill="none" stroke={config.eyeColor} strokeWidth="3.5" strokeLinecap="round">
              <path
                d={`M ${leftEyeX} ${eyeY} m -2 0 a 3 3 0 1 0 6 0 a 6 6 0 1 0 -12 0 a 9 9 0 1 0 18 0 a 12 12 0 1 0 -24 0`}
              />
              <path
                d={`M ${rightEyeX} ${eyeY} m -2 0 a 3 3 0 1 0 6 0 a 6 6 0 1 0 -12 0 a 9 9 0 1 0 18 0 a 12 12 0 1 0 -24 0`}
              />
            </g>
          );
        case 'sleepy-droop':
          return (
            <g>
              <path
                d={`M ${leftEyeX - 12} ${eyeY} A 12 10 0 0 0 ${leftEyeX + 12} ${eyeY} Z`}
                fill={config.eyeColor}
              />
              <line
                x1={leftEyeX - 14}
                y1={eyeY}
                x2={leftEyeX + 14}
                y2={eyeY}
                stroke={strokeCol}
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d={`M ${rightEyeX - 12} ${eyeY} A 12 10 0 0 0 ${rightEyeX + 12} ${eyeY} Z`}
                fill={config.eyeColor}
              />
              <line
                x1={rightEyeX - 14}
                y1={eyeY}
                x2={rightEyeX + 14}
                y2={eyeY}
                stroke={strokeCol}
                strokeWidth="4"
                strokeLinecap="round"
              />
            </g>
          );
        case 'crying-streams':
          return (
            <g>
              <path
                d={`M ${leftEyeX - 8} ${eyeY + 4} L ${leftEyeX - 12} ${eyeY + 52} L ${leftEyeX + 6} ${eyeY + 52} L ${leftEyeX + 8} ${eyeY + 4} Z`}
                fill="#38BDF8"
                opacity="0.85"
              />
              <path
                d={`M ${rightEyeX - 8} ${eyeY + 4} L ${rightEyeX - 6} ${eyeY + 52} L ${rightEyeX + 12} ${eyeY + 52} L ${rightEyeX + 8} ${eyeY + 4} Z`}
                fill="#38BDF8"
                opacity="0.85"
              />
              <ellipse cx={leftEyeX} cy={eyeY} rx="10" ry="12" fill={config.eyeColor} />
              <circle cx={leftEyeX - 3} cy={eyeY - 4} r="4" fill="#FFFFFF" />
              <ellipse cx={rightEyeX} cy={eyeY} rx="10" ry="12" fill={config.eyeColor} />
              <circle cx={rightEyeX - 3} cy={eyeY - 4} r="4" fill="#FFFFFF" />
            </g>
          );
        case 'wide-anime':
        default:
          return (
            <g>
              <ellipse cx={leftEyeX} cy={eyeY} rx="11.5" ry="14" fill={config.eyeColor} />
              <circle cx={leftEyeX - 3.5} cy={eyeY - 5} r="4.5" fill="#FFFFFF" />
              <circle cx={leftEyeX + 4} cy={eyeY + 4.5} r="2.2" fill="#FFFFFF" />

              <ellipse cx={rightEyeX} cy={eyeY} rx="11.5" ry="14" fill={config.eyeColor} />
              <circle cx={rightEyeX - 3.5} cy={eyeY - 5} r="4.5" fill="#FFFFFF" />
              <circle cx={rightEyeX + 4} cy={eyeY + 4.5} r="2.2" fill="#FFFFFF" />
            </g>
          );
      }
    };

    const renderBrows = () => {
      const browY = 69;
      switch (config.brows) {
        case 'relaxed':
          return (
            <g fill="none" stroke={strokeCol} strokeWidth="4.2" strokeLinecap="round">
              <path d={`M ${leftEyeX - 12} ${browY + 2} Q ${leftEyeX} ${browY - 5} ${leftEyeX + 12} ${browY + 2}`} />
              <path d={`M ${rightEyeX - 12} ${browY + 2} Q ${rightEyeX} ${browY - 5} ${rightEyeX + 12} ${browY + 2}`} />
            </g>
          );
        case 'raised-surprised':
          return (
            <g fill="none" stroke={strokeCol} strokeWidth="4.5" strokeLinecap="round">
              <path d={`M ${leftEyeX - 13} ${browY - 2} Q ${leftEyeX} ${browY - 13} ${leftEyeX + 13} ${browY - 2}`} />
              <path d={`M ${rightEyeX - 13} ${browY - 2} Q ${rightEyeX} ${browY - 13} ${rightEyeX + 13} ${browY - 2}`} />
            </g>
          );
        case 'angry-furrow':
          return (
            <g fill="none" stroke={strokeCol} strokeWidth="5" strokeLinecap="round">
              <line x1={leftEyeX - 14} y1={browY - 5} x2={leftEyeX + 12} y2={browY + 6} />
              <line x1={rightEyeX - 12} y1={browY + 6} x2={rightEyeX + 14} y2={browY - 5} />
            </g>
          );
        case 'worried-tilt':
          return (
            <g fill="none" stroke={strokeCol} strokeWidth="4.5" strokeLinecap="round">
              <line x1={leftEyeX - 14} y1={browY + 5} x2={leftEyeX + 12} y2={browY - 4} />
              <line x1={rightEyeX - 12} y1={browY - 4} x2={rightEyeX + 14} y2={browY + 5} />
            </g>
          );
        case 'sassy-single':
          return (
            <g fill="none" stroke={strokeCol} strokeWidth="4.8" strokeLinecap="round">
              <line x1={leftEyeX - 13} y1={browY + 3} x2={leftEyeX + 13} y2={browY + 4} />
              <path d={`M ${rightEyeX - 13} ${browY - 1} Q ${rightEyeX} ${browY - 14} ${rightEyeX + 14} ${browY - 1}`} />
            </g>
          );
        case 'thick-bold':
          return (
            <g fill={strokeCol}>
              <rect x={leftEyeX - 14} y={browY - 5} width="28" height="8" rx="4" transform={`rotate(-6 ${leftEyeX} ${browY})`} />
              <rect x={rightEyeX - 14} y={browY - 5} width="28" height="8" rx="4" transform={`rotate(6 ${rightEyeX} ${browY})`} />
            </g>
          );
        case 'none':
        default:
          return null;
      }
    };

    const renderMouth = () => {
      const my = 126;
      switch (config.mouth) {
        case 'big-grin':
          return (
            <g>
              <path
                d={`M 74 ${my - 4} Q 100 ${my + 26} 126 ${my - 4} Z`}
                fill="#FFFFFF"
                stroke={strokeCol}
                strokeWidth="3.5"
                strokeLinejoin="round"
              />
              <line x1="78" y1={my + 5} x2="122" y2={my + 5} stroke={strokeCol} strokeWidth="2.5" />
            </g>
          );
        case 'cat-w':
          return (
            <path
              d={`M 80 ${my - 2} Q 90 ${my + 10} 100 ${my - 1} Q 110 ${my + 10} 120 ${my - 2}`}
              fill="none"
              stroke={strokeCol}
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        case 'smirk-cool':
          return (
            <path
              d={`M 82 ${my + 4} Q 104 ${my + 6} 122 ${my - 7}`}
              fill="none"
              stroke={strokeCol}
              strokeWidth="4.5"
              strokeLinecap="round"
            />
          );
        case 'tongue-blep':
          return (
            <g>
              <path
                d={`M 78 ${my - 2} Q 100 ${my + 12} 122 ${my - 2}`}
                fill="none"
                stroke={strokeCol}
                strokeWidth="4.2"
                strokeLinecap="round"
              />
              <path
                d={`M 90 ${my + 3} L 90 ${my + 16} A 10 10 0 0 0 110 ${my + 16} L 110 ${my + 3} Z`}
                fill="#FB7185"
                stroke={strokeCol}
                strokeWidth="3.2"
              />
              <line x1="100" y1={my + 4} x2="100" y2={my + 17} stroke={strokeCol} strokeWidth="2.2" strokeLinecap="round" />
            </g>
          );
        case 'shocked-o':
          return (
            <ellipse
              cx="100"
              cy={my + 4}
              rx="12"
              ry="15"
              fill="#7F1D1D"
              stroke={strokeCol}
              strokeWidth="3.8"
            />
          );
        case 'frown-pout':
          return (
            <path
              d={`M 80 ${my + 10} Q 100 ${my - 8} 120 ${my + 10}`}
              fill="none"
              stroke={strokeCol}
              strokeWidth="4.5"
              strokeLinecap="round"
            />
          );
        case 'gritted-teeth':
          return (
            <g>
              <rect
                x="74"
                y={my - 5}
                width="52"
                height="20"
                rx="9"
                fill="#FFFFFF"
                stroke={strokeCol}
                strokeWidth="3.5"
              />
              <line x1="76" y1={my + 5} x2="124" y2={my + 5} stroke={strokeCol} strokeWidth="2.5" />
              <line x1="88" y1={my - 4} x2="88" y2={my + 14} stroke={strokeCol} strokeWidth="2.2" />
              <line x1="100" y1={my - 4} x2="100" y2={my + 14} stroke={strokeCol} strokeWidth="2.2" />
              <line x1="112" y1={my - 4} x2="112" y2={my + 14} stroke={strokeCol} strokeWidth="2.2" />
            </g>
          );
        case 'drool-yum':
          return (
            <g>
              <path
                d={`M 76 ${my - 3} Q 100 ${my + 22} 124 ${my - 3} Z`}
                fill="#991B1B"
                stroke={strokeCol}
                strokeWidth="3.5"
                strokeLinejoin="round"
              />
              <path
                d={`M 108 ${my + 8} C 108 ${my + 8}, 105 ${my + 28}, 111 ${my + 28} C 117 ${my + 28}, 115 ${my + 6}, 115 ${my + 6}`}
                fill="#38BDF8"
                stroke={strokeCol}
                strokeWidth="2.5"
              />
            </g>
          );
        case 'zipper-mute':
          return (
            <g stroke={strokeCol} strokeWidth="3.5" strokeLinecap="round">
              <line x1="74" y1={my + 3} x2="126" y2={my + 3} />
              <line x1="84" y1={my - 3} x2="84" y2={my + 9} />
              <line x1="94" y1={my - 3} x2="94" y2={my + 9} />
              <line x1="104" y1={my - 3} x2="104" y2={my + 9} />
              <line x1="114" y1={my - 3} x2="114" y2={my + 9} />
            </g>
          );
        case 'open-laugh':
        default:
          return (
            <g>
              <path
                d={`M 73 ${my - 5} C 73 ${my + 26}, 127 ${my + 26}, 127 ${my - 5} Z`}
                fill="#7F1D1D"
                stroke={strokeCol}
                strokeWidth="3.8"
                strokeLinejoin="round"
              />
              <path
                d={`M 85 ${my + 11} Q 100 ${my + 2} 115 ${my + 11} Q 100 ${my + 20} 85 ${my + 11} Z`}
                fill="#FB7185"
              />
              <path d={`M 76 ${my - 4} L 124 ${my - 4} L 121 ${my + 2} L 79 ${my + 2} Z`} fill="#FFFFFF" />
            </g>
          );
      }
    };

    const renderAccessory = () => {
      const accCol = config.accessoryColor;
      switch (config.accessory) {
        case 'deal-shades':
          return (
            <g transform="translate(0, 32)">
              <line x1="36" y1="54" x2="164" y2="54" stroke="#0F172A" strokeWidth="5" strokeLinecap="round" />
              <rect x="50" y="52" width="42" height="22" rx="3" fill={accCol} stroke="#0F172A" strokeWidth="3.5" />
              <rect x="108" y="52" width="42" height="22" rx="3" fill={accCol} stroke="#0F172A" strokeWidth="3.5" />
              <rect x="56" y="56" width="6" height="6" fill="#FFFFFF" />
              <rect x="62" y="62" width="6" height="6" fill="#FFFFFF" />
              <rect x="114" y="56" width="6" height="6" fill="#FFFFFF" />
              <rect x="120" y="62" width="6" height="6" fill="#FFFFFF" />
            </g>
          );
        case 'royal-crown':
          return (
            <g>
              <path
                d="M 64 46 L 56 16 L 80 30 L 100 10 L 120 30 L 144 16 L 136 46 Z"
                fill={accCol}
                stroke={strokeCol}
                strokeWidth="3.5"
                strokeLinejoin="round"
              />
              <circle cx="100" cy="33" r="4.5" fill="#EF4444" />
              <circle cx="77" cy="36" r="3.5" fill="#38BDF8" />
              <circle cx="123" cy="36" r="3.5" fill="#38BDF8" />
            </g>
          );
        case 'angel-halo':
          return (
            <g>
              <ellipse
                cx="100"
                cy="24"
                rx="38"
                ry="10"
                fill="none"
                stroke={accCol}
                strokeWidth="7"
              />
              <ellipse
                cx="100"
                cy="24"
                rx="38"
                ry="10"
                fill="none"
                stroke="#FEF08A"
                strokeWidth="2.5"
              />
            </g>
          );
        case 'party-cone':
          return (
            <g>
              <path
                d="M 74 44 L 100 6 L 126 44 Z"
                fill={accCol}
                stroke={strokeCol}
                strokeWidth="3.5"
                strokeLinejoin="round"
              />
              <circle cx="100" cy="6" r="7" fill="#FDE047" stroke={strokeCol} strokeWidth="2.5" />
              <circle cx="96" cy="26" r="3.5" fill="#F472B6" />
              <circle cx="108" cy="34" r="3.5" fill="#38BDF8" />
              <circle cx="88" cy="37" r="3.5" fill="#4ADE80" />
            </g>
          );
        case 'headset-pro':
          return (
            <g>
              <path
                d="M 34 100 A 66 66 0 0 1 166 100"
                fill="none"
                stroke={accCol}
                strokeWidth="8"
                strokeLinecap="round"
              />
              <rect x="24" y="82" width="16" height="34" rx="8" fill={accCol} stroke={strokeCol} strokeWidth="3" />
              <rect x="160" y="82" width="16" height="34" rx="8" fill={accCol} stroke={strokeCol} strokeWidth="3" />
              <path
                d="M 32 112 Q 44 138 78 136"
                fill="none"
                stroke={strokeCol}
                strokeWidth="4"
                strokeLinecap="round"
              />
              <circle cx="80" cy="136" r="5" fill="#10B981" stroke={strokeCol} strokeWidth="2.5" />
            </g>
          );
        case 'cowboy-hat':
          return (
            <g>
              <path
                d="M 66 42 C 66 16, 86 14, 100 22 C 114 14, 134 16, 134 42 Z"
                fill={accCol}
                stroke={strokeCol}
                strokeWidth="3.5"
                strokeLinejoin="round"
              />
              <path
                d="M 38 40 Q 100 54 162 40 Q 135 34 100 38 Q 65 34 38 40 Z"
                fill={accCol}
                stroke={strokeCol}
                strokeWidth="3.5"
                strokeLinejoin="round"
              />
            </g>
          );
        case 'sprout-leaf':
          return (
            <g>
              <path
                d="M 100 40 Q 100 18 104 14"
                fill="none"
                stroke="#15803D"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M 102 18 C 118 8, 132 18, 118 28 C 110 32, 102 24, 102 18 Z"
                fill={accCol}
                stroke={strokeCol}
                strokeWidth="2.8"
              />
              <path
                d="M 100 22 C 84 12, 72 22, 84 30 C 92 34, 100 26, 100 22 Z"
                fill={accCol}
                stroke={strokeCol}
                strokeWidth="2.8"
              />
            </g>
          );
        case 'chef-toque':
          return (
            <g>
              <path
                d="M 68 44 C 54 36, 58 14, 78 18 C 86 6, 114 6, 122 18 C 142 14, 146 36, 132 44 Z"
                fill={accCol}
                stroke={strokeCol}
                strokeWidth="3.5"
                strokeLinejoin="round"
              />
              <rect
                x="68"
                y="38"
                width="64"
                height="12"
                rx="3"
                fill="#E2E8F0"
                stroke={strokeCol}
                strokeWidth="3"
              />
            </g>
          );
        case 'monocle-classy':
          return (
            <g transform="translate(0, 34)">
              <circle
                cx={rightEyeX}
                cy={eyeY - 34}
                r="18"
                fill="rgba(56, 189, 248, 0.2)"
                stroke={accCol}
                strokeWidth="4"
              />
              <path
                d={`M ${rightEyeX + 16} ${eyeY - 26} Q ${rightEyeX + 22} ${eyeY + 2} ${rightEyeX + 12} ${eyeY + 24}`}
                fill="none"
                stroke={accCol}
                strokeWidth="2.5"
                strokeDasharray="3 3"
              />
            </g>
          );
        case 'none':
        default:
          return null;
      }
    };

    const renderParticles = () => {
      if (config.effect === 'none') return null;
      const fxCol = config.effectColor;

      return (
        <g>
          {frame.particles.map((p) => {
            const px = 100 + p.x;
            const py = 100 + p.y;
            const transform = `translate(${px.toFixed(1)}, ${py.toFixed(1)}) scale(${p.scale}) rotate(${p.rotate})`;

            switch (config.effect) {
              case 'sparkles':
                return (
                  <g key={p.id} transform={transform} opacity={p.opacity}>
                    <path
                      d="M 0 -11 Q 0 0 11 0 Q 0 0 0 11 Q 0 0 -11 0 Q 0 0 0 -11 Z"
                      fill={fxCol}
                      stroke={strokeCol}
                      strokeWidth="1.5"
                    />
                  </g>
                );
              case 'floating-hearts':
                return (
                  <g key={p.id} transform={`translate(${px.toFixed(1)}, ${py.toFixed(1)}) scale(${p.scale})`} opacity={p.opacity}>
                    <path
                      d="M 0 8 C 0 8, -10 1, -10 -4 C -10 -8, -5 -9, 0 -4 C 5 -9, 10 -8, 10 -4 C 10 1, 0 8, 0 8 Z"
                      fill={fxCol}
                      stroke={strokeCol}
                      strokeWidth="1.8"
                    />
                  </g>
                );
              case 'fire-aura':
                return (
                  <g key={p.id} transform={`translate(${px.toFixed(1)}, ${py.toFixed(1)}) scale(${p.scale})`} opacity={p.opacity}>
                    <path
                      d="M 0 -12 C 6 -4, 9 4, 0 10 C -9 4, -6 -4, 0 -12 Z"
                      fill={fxCol}
                      stroke="#DC2626"
                      strokeWidth="2"
                    />
                  </g>
                );
              case 'anger-vein':
                if (p.id > 1) return null;
                return (
                  <g
                    key={p.id}
                    transform={`translate(${p.id === 0 ? 146 : 54}, ${p.id === 0 ? 52 : 56}) scale(${0.85 + p.scale * 0.3})`}
                  >
                    <path
                      d="M -10 -3 L -3 -3 L -3 -10 M 10 -3 L 3 -3 L 3 -10 M -10 3 L -3 3 L -3 10 M 10 3 L 3 3 L 3 10"
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                );
              case 'zzz-sleep':
                if (p.id > 2) return null;
                return (
                  <g
                    key={p.id}
                    transform={`translate(${(142 + p.id * 14).toFixed(1)}, ${(58 - p.id * 18 + Math.sin(activeTime * Math.PI * 2 + p.id) * 5).toFixed(1)}) scale(${0.7 + p.id * 0.2})`}
                    opacity={p.opacity}
                  >
                    <text
                      x="0"
                      y="0"
                      fontFamily="var(--font-display), sans-serif"
                      fontWeight="800"
                      fontSize="18"
                      fill={fxCol}
                      stroke={strokeCol}
                      strokeWidth="1.2"
                    >
                      Z
                    </text>
                  </g>
                );
              case 'music-notes':
                return (
                  <g key={p.id} transform={`translate(${px.toFixed(1)}, ${py.toFixed(1)}) scale(${p.scale})`} opacity={p.opacity}>
                    <circle cx="-3" cy="5" r="4" fill={fxCol} />
                    <path d="M 0 5 L 0 -7 L 8 -4 L 8 -1 L 0 -4" fill={fxCol} stroke={strokeCol} strokeWidth="1.5" />
                  </g>
                );
              case 'confetti-pop':
                return (
                  <g key={p.id} transform={transform} opacity={p.opacity}>
                    <rect
                      x="-5"
                      y="-3"
                      width="10"
                      height="6"
                      rx="1.5"
                      fill={['#F43F5E', '#38BDF8', '#FACC15', '#4ADE80', '#A855F7', '#FB923C'][p.id % 6]}
                    />
                  </g>
                );
              case 'electric-bolts':
                return (
                  <g key={p.id} transform={transform} opacity={p.opacity}>
                    <polygon
                      points="2,-10 -6,1 0,1 -2,10 6,-1 0,-1"
                      fill={fxCol}
                      stroke={strokeCol}
                      strokeWidth="1.2"
                    />
                  </g>
                );
              default:
                return null;
            }
          })}
        </g>
      );
    };

    const showVectorFacialFeatures = !hasPhoto || mixMode === 'vector-overlay';

    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="-10 -22 220 220"
        xmlns="http://www.w3.org/2000/svg"
        className={`select-none overflow-visible ${className}`}
        role="img"
        aria-label={`${config.name} animated custom emoji`}
      >
        <defs>
          <radialGradient id={gradId} cx="36%" cy="30%" r="70%">
            <stop offset="0%" stopColor={config.primaryColor} />
            <stop offset="72%" stopColor={config.primaryColor} />
            <stop offset="100%" stopColor={config.secondaryColor} />
          </radialGradient>
          <linearGradient id={shineId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <radialGradient id={laserId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="55%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
          </radialGradient>
          <clipPath id={clipId}>{renderClipGeometry()}</clipPath>
          <clipPath id={duoLeftClipId}>
            <circle cx="76" cy="102" r="46" />
          </clipPath>
          <clipPath id={duoRightClipId}>
            <circle cx="124" cy="102" r="46" />
          </clipPath>
        </defs>

        {/* Ground Contact Shadow */}
        {showShadow && (
          <ellipse
            cx="100"
            cy="178"
            rx={(38 * shadowScale).toFixed(1)}
            ry={(7.5 * shadowScale).toFixed(1)}
            fill="rgba(15, 23, 42, 0.32)"
          />
        )}

        {/* Main Animated Body Rig */}
        <g transform={bodyTransformStr}>
          {/* Base Silhouette or Realistic Photo Sticker Cutout */}
          {hasPhoto ? renderPhotoLayer() : renderBaseShape(false)}

          {/* Specular Top Gloss Highlight */}
          {config.has3DShading && !hasPhoto && (
            <ellipse
              cx="84"
              cy="58"
              rx="26"
              ry="12"
              transform="rotate(-14 84 58)"
              fill={`url(#${shineId})`}
              pointerEvents="none"
            />
          )}

          {/* Parallax Facial Feature Group */}
          {showVectorFacialFeatures && (
            <g transform={featuresTransformStr}>
              {renderCheeks()}
              <g transform={eyesTransformStr}>{renderEyes()}</g>
              <g transform={browsTransformStr}>{renderBrows()}</g>
              <g transform={mouthTransformStr}>{renderMouth()}</g>
            </g>
          )}

          {/* Secondary-Motion Headgear & Accessories */}
          <g transform={gearTransformStr}>{renderAccessory()}</g>

          {/* Optional Meme Sticker Caption Overlay */}
          {config.captionText && (
            <g transform={`translate(100, 162)`}>
              <text
                x="0"
                y="0"
                textAnchor="middle"
                fontFamily="var(--font-display), sans-serif"
                fontWeight="800"
                fontSize="16"
                letterSpacing="0.04em"
                fill="#FFFFFF"
                stroke="#0F172A"
                strokeWidth="5"
                strokeLinejoin="round"
                style={{ paintOrder: 'stroke fill' }}
              >
                {config.captionText}
              </text>
            </g>
          )}
        </g>

        {/* Foreground & Orbiting Particle Effects */}
        {renderParticles()}
      </svg>
    );
  }
);

EmojiRenderer.displayName = 'EmojiRenderer';
