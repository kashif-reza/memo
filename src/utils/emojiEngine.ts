import {
  AccessoryId,
  BrowStyleId,
  CheekStyleId,
  ComputedMotionFrame,
  EasingMode,
  EffectId,
  EmojiConfig,
  EyeStyleId,
  FaceShapeId,
  GivenPhotoItem,
  MotionPresetId,
  MouthStyleId,
  ParticleState,
  PhotoMixMode,
  TransformState,
} from '../types/emoji';

export interface CatalogItem<T extends string> {
  id: T;
  label: string;
  category?: string;
}

export const FACE_SHAPES: CatalogItem<FaceShapeId>[] = [
  { id: 'classic-round', label: 'Classic Sphere' },
  { id: 'squircle', label: 'Soft Squircle' },
  { id: 'cat-ears', label: 'Neko Cat' },
  { id: 'bear-ears', label: 'Kuma Bear' },
  { id: 'devil-horns', label: 'Imp Horns' },
  { id: 'blob-slime', label: 'Mochi Blob' },
  { id: 'star-burst', label: 'Cosmic Star' },
  { id: 'heart-face', label: 'Heart Pop' },
];

export const EYE_STYLES: CatalogItem<EyeStyleId>[] = [
  { id: 'wide-anime', label: 'Sparkle Gloss' },
  { id: 'happy-arc', label: 'Joyful Arcs' },
  { id: 'star-struck', label: 'Starstruck' },
  { id: 'heart-eyes', label: 'Lovestruck' },
  { id: 'wink-playful', label: 'Cheeky Wink' },
  { id: 'sassy-side', label: 'Side Eye' },
  { id: 'laser-glow', label: 'Hyper Laser' },
  { id: 'dizzy-spiral', label: 'Spiral Dizzy' },
  { id: 'sleepy-droop', label: 'Unimpressed' },
  { id: 'crying-streams', label: 'Waterfall Tears' },
];

export const BROW_STYLES: CatalogItem<BrowStyleId>[] = [
  { id: 'none', label: 'No Brows' },
  { id: 'relaxed', label: 'Soft Arch' },
  { id: 'raised-surprised', label: 'High Alert' },
  { id: 'angry-furrow', label: 'Fierce Scowl' },
  { id: 'worried-tilt', label: 'Pleading Tilt' },
  { id: 'sassy-single', label: 'The Rock Raise' },
  { id: 'thick-bold', label: 'Bold Mugi' },
];

export const MOUTH_STYLES: CatalogItem<MouthStyleId>[] = [
  { id: 'open-laugh', label: 'Beam Laugh' },
  { id: 'big-grin', label: 'Cheesy Grin' },
  { id: 'cat-w', label: 'UwU Whiskers' },
  { id: 'smirk-cool', label: 'Sly Smirk' },
  { id: 'tongue-blep', label: 'Silly Blep' },
  { id: 'shocked-o', label: 'Gasp O' },
  { id: 'frown-pout', label: 'Sulky Pout' },
  { id: 'gritted-teeth', label: 'Panic Grit' },
  { id: 'drool-yum', label: 'Craving Drool' },
  { id: 'zipper-mute', label: 'Zipper Sealed' },
];

export const CHEEK_STYLES: CatalogItem<CheekStyleId>[] = [
  { id: 'none', label: 'None' },
  { id: 'soft-blush', label: 'Rosy Glow' },
  { id: 'cute-slashes', label: 'Manga Blushes' },
  { id: 'freckles', label: 'Sun Freckles' },
  { id: 'star-stickers', label: 'Star Decals' },
  { id: 'sweat-drop', label: 'Nervous Sweat' },
];

export const ACCESSORY_STYLES: CatalogItem<AccessoryId>[] = [
  { id: 'none', label: 'No Gear' },
  { id: 'deal-shades', label: 'Pixel Shades' },
  { id: 'royal-crown', label: 'Gold Crown' },
  { id: 'angel-halo', label: 'Floating Halo' },
  { id: 'party-cone', label: 'Party Hat' },
  { id: 'headset-pro', label: 'Streamer Mic' },
  { id: 'cowboy-hat', label: 'Sheriff Hat' },
  { id: 'sprout-leaf', label: 'Bean Sprout' },
  { id: 'chef-toque', label: 'Chef Toque' },
  { id: 'monocle-classy', label: 'Gold Monocle' },
];

export const EFFECT_STYLES: CatalogItem<EffectId>[] = [
  { id: 'none', label: 'No Particles' },
  { id: 'sparkles', label: 'Twinkle Stars' },
  { id: 'floating-hearts', label: 'Rising Hearts' },
  { id: 'fire-aura', label: 'Blazing Aura' },
  { id: 'anger-vein', label: 'Popping Vein' },
  { id: 'zzz-sleep', label: 'Floating Zzz' },
  { id: 'music-notes', label: 'Groove Notes' },
  { id: 'confetti-pop', label: 'Party Confetti' },
  { id: 'electric-bolts', label: 'Volt Sparks' },
];

export interface MotionPresetMeta {
  id: MotionPresetId;
  label: string;
  description: string;
  recommendedBpm: number;
}

export const MOTION_PRESETS: MotionPresetMeta[] = [
  { id: 'bounce-joy', label: 'Elastic Bounce', description: 'Upbeat vertical hop with squash and stretch on landing', recommendedBpm: 120 },
  { id: 'jelly-squish', label: 'Mochi Squish', description: 'Soft gelatinous oscillation preserving volume', recommendedBpm: 110 },
  { id: 'tada-pop', label: 'Tada Fanfare', description: 'Anticipation wind-up followed by celebratory scale burst', recommendedBpm: 100 },
  { id: 'party-wobble', label: 'Party Groove', description: 'Rhythmic figure-eight sway with secondary ear/hat lag', recommendedBpm: 128 },
  { id: 'rage-vibrate', label: 'High-Cafe Shake', description: 'Rapid high-frequency jitter for hype or frustration', recommendedBpm: 160 },
  { id: 'spin-360', label: 'Orbit Spin', description: 'Full 360-degree kinetic rotation with easing pause', recommendedBpm: 95 },
  { id: 'float-hover', label: 'Zero-G Float', description: 'Dreamy anti-gravity levitation with gentle tilt', recommendedBpm: 80 },
  { id: 'head-nod', label: 'Approve Nod', description: 'Affirmative vertical parallax pitch of facial features', recommendedBpm: 115 },
  { id: 'head-shake', label: 'Nope Shake', description: 'Horizontal parallax head turn side to side', recommendedBpm: 115 },
  { id: 'heartbeat-pulse', label: 'Cardio Thump', description: 'Double-beat lub-dub rhythmic expansion', recommendedBpm: 108 },
];

export const COLOR_SWATCHES = [
  { name: 'Classic Gold', primary: '#FBBF24', secondary: '#F59E0B', outline: '#78350F' },
  { name: 'Sakura Mochi', primary: '#F472B6', secondary: '#DB2777', outline: '#831843' },
  { name: 'Mint Slime', primary: '#34D399', secondary: '#059669', outline: '#064E3B' },
  { name: 'Sky Cloud', primary: '#38BDF8', secondary: '#0284C7', outline: '#0C4A6E' },
  { name: 'Cosmic Taro', primary: '#A78BFA', secondary: '#7C3AED', outline: '#4C1D95' },
  { name: 'Spicy Chili', primary: '#FB7185', secondary: '#E11D48', outline: '#881337' },
  { name: 'Tangerine Pop', primary: '#FB923C', secondary: '#EA580C', outline: '#7C2D12' },
  { name: 'Frost Milk', primary: '#F1F5F9', secondary: '#CBD5E1', outline: '#334155' },
];

export const STARTER_PRESETS: EmojiConfig[] = [
  {
    id: 'preset-hype-cat',
    name: 'Neko Hype',
    shortcode: ':neko_hype:',
    faceShape: 'cat-ears',
    primaryColor: '#FBBF24',
    secondaryColor: '#F59E0B',
    outlineColor: '#78350F',
    outlineWidth: 3.5,
    has3DShading: true,
    eyes: 'star-struck',
    eyeColor: '#1E293B',
    brows: 'raised-surprised',
    mouth: 'cat-w',
    cheeks: 'soft-blush',
    cheekColor: '#F43F5E',
    accessory: 'party-cone',
    accessoryColor: '#8B5CF6',
    effect: 'sparkles',
    effectColor: '#FDE047',
    fineTune: {
      faceScale: 1,
      eyeScale: 1.08,
      eyeSpacing: 2,
      eyeOffsetY: 0,
      mouthScale: 1.05,
      mouthOffsetY: 2,
      gearOffsetY: -2,
      gearRotation: -6,
    },
    motionPreset: 'bounce-joy',
    motionSpeed: 1.15,
    motionIntensity: 1.1,
    easing: 'snappy-spring',
    layerMotion: {
      eyeBlink: true,
      eyeTrack: true,
      browWiggle: true,
      mouthTalk: true,
      gearBounce: true,
      fxOrbit: true,
    },
  },
  {
    id: 'preset-deal-boss',
    name: 'Ship It Boss',
    shortcode: ':ship_it_boss:',
    faceShape: 'squircle',
    primaryColor: '#38BDF8',
    secondaryColor: '#0284C7',
    outlineColor: '#0C4A6E',
    outlineWidth: 3.5,
    has3DShading: true,
    eyes: 'sassy-side',
    eyeColor: '#0F172A',
    brows: 'sassy-single',
    mouth: 'smirk-cool',
    cheeks: 'none',
    cheekColor: '#F43F5E',
    accessory: 'deal-shades',
    accessoryColor: '#0F172A',
    effect: 'electric-bolts',
    effectColor: '#38BDF8',
    fineTune: {
      faceScale: 1,
      eyeScale: 1,
      eyeSpacing: 0,
      eyeOffsetY: -1,
      mouthScale: 1,
      mouthOffsetY: 1,
      gearOffsetY: 2,
      gearRotation: 0,
    },
    motionPreset: 'party-wobble',
    motionSpeed: 1.0,
    motionIntensity: 1.0,
    easing: 'smooth-sine',
    layerMotion: {
      eyeBlink: false,
      eyeTrack: true,
      browWiggle: true,
      mouthTalk: false,
      gearBounce: true,
      fxOrbit: true,
    },
  },
  {
    id: 'preset-caffeinated-panic',
    name: 'Prod Incident',
    shortcode: ':prod_panic:',
    faceShape: 'blob-slime',
    primaryColor: '#FB7185',
    secondaryColor: '#E11D48',
    outlineColor: '#881337',
    outlineWidth: 3.5,
    has3DShading: true,
    eyes: 'dizzy-spiral',
    eyeColor: '#1E293B',
    brows: 'worried-tilt',
    mouth: 'gritted-teeth',
    cheeks: 'sweat-drop',
    cheekColor: '#38BDF8',
    accessory: 'headset-pro',
    accessoryColor: '#334155',
    effect: 'fire-aura',
    effectColor: '#F97316',
    fineTune: {
      faceScale: 1.02,
      eyeScale: 1.12,
      eyeSpacing: 3,
      eyeOffsetY: -2,
      mouthScale: 1.1,
      mouthOffsetY: 3,
      gearOffsetY: 0,
      gearRotation: 0,
    },
    motionPreset: 'rage-vibrate',
    motionSpeed: 1.4,
    motionIntensity: 1.2,
    easing: 'linear',
    layerMotion: {
      eyeBlink: false,
      eyeTrack: true,
      browWiggle: true,
      mouthTalk: true,
      gearBounce: true,
      fxOrbit: true,
    },
  },
  {
    id: 'preset-mochi-love',
    name: 'Mochi Crush',
    shortcode: ':mochi_crush:',
    faceShape: 'bear-ears',
    primaryColor: '#F472B6',
    secondaryColor: '#DB2777',
    outlineColor: '#831843',
    outlineWidth: 3.5,
    has3DShading: true,
    eyes: 'heart-eyes',
    eyeColor: '#E11D48',
    brows: 'relaxed',
    mouth: 'tongue-blep',
    cheeks: 'cute-slashes',
    cheekColor: '#FB7185',
    accessory: 'angel-halo',
    accessoryColor: '#FDE047',
    effect: 'floating-hearts',
    effectColor: '#FB7185',
    fineTune: {
      faceScale: 1,
      eyeScale: 1.05,
      eyeSpacing: 1,
      eyeOffsetY: 1,
      mouthScale: 0.95,
      mouthOffsetY: 1,
      gearOffsetY: -4,
      gearRotation: 0,
    },
    motionPreset: 'jelly-squish',
    motionSpeed: 0.95,
    motionIntensity: 1.15,
    easing: 'smooth-sine',
    layerMotion: {
      eyeBlink: true,
      eyeTrack: false,
      browWiggle: true,
      mouthTalk: false,
      gearBounce: true,
      fxOrbit: true,
    },
  },
  {
    id: 'preset-royal-chef',
    name: 'Let Him Cook',
    shortcode: ':let_him_cook:',
    faceShape: 'classic-round',
    primaryColor: '#34D399',
    secondaryColor: '#059669',
    outlineColor: '#064E3B',
    outlineWidth: 3.5,
    has3DShading: true,
    eyes: 'wink-playful',
    eyeColor: '#064E3B',
    brows: 'thick-bold',
    mouth: 'drool-yum',
    cheeks: 'soft-blush',
    cheekColor: '#F43F5E',
    accessory: 'chef-toque',
    accessoryColor: '#F8FAFC',
    effect: 'sparkles',
    effectColor: '#FBBF24',
    fineTune: {
      faceScale: 1,
      eyeScale: 1,
      eyeSpacing: 0,
      eyeOffsetY: 0,
      mouthScale: 1,
      mouthOffsetY: 0,
      gearOffsetY: -3,
      gearRotation: 4,
    },
    motionPreset: 'tada-pop',
    motionSpeed: 1.05,
    motionIntensity: 1.0,
    easing: 'snappy-spring',
    layerMotion: {
      eyeBlink: true,
      eyeTrack: true,
      browWiggle: true,
      mouthTalk: true,
      gearBounce: true,
      fxOrbit: true,
    },
  },
  {
    id: 'preset-sleepy-sprout',
    name: 'AFK Sprout',
    shortcode: ':afk_sprout:',
    faceShape: 'blob-slime',
    primaryColor: '#A78BFA',
    secondaryColor: '#7C3AED',
    outlineColor: '#4C1D95',
    outlineWidth: 3.5,
    has3DShading: true,
    eyes: 'sleepy-droop',
    eyeColor: '#1E1B4B',
    brows: 'none',
    mouth: 'shocked-o',
    cheeks: 'soft-blush',
    cheekColor: '#F472B6',
    accessory: 'sprout-leaf',
    accessoryColor: '#4ADE80',
    effect: 'zzz-sleep',
    effectColor: '#C4B5FD',
    fineTune: {
      faceScale: 0.98,
      eyeScale: 1,
      eyeSpacing: 0,
      eyeOffsetY: 2,
      mouthScale: 0.85,
      mouthOffsetY: 3,
      gearOffsetY: 0,
      gearRotation: 0,
    },
    motionPreset: 'float-hover',
    motionSpeed: 0.75,
    motionIntensity: 0.9,
    easing: 'smooth-sine',
    layerMotion: {
      eyeBlink: true,
      eyeTrack: false,
      browWiggle: false,
      mouthTalk: true,
      gearBounce: true,
      fxOrbit: true,
    },
  },
];

const IDENTITY_TRANSFORM: TransformState = {
  translateX: 0,
  translateY: 0,
  scaleX: 1,
  scaleY: 1,
  rotate: 0,
  skewX: 0,
};

/**
 * Normalizes and validates a custom emoji `:shortcode:`
 */
export function formatShortcode(raw: string): string {
  const cleaned = raw
    .toLowerCase()
    .trim()
    .replace(/^:+|:+$/g, '')
    .replace(/[^a-z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 28);
  return cleaned ? `:${cleaned}:` : ':custom_moji:';
}

export function validateShortcode(raw: string): { valid: boolean; error?: string } {
  const trimmed = raw.trim().replace(/^:+|:+$/g, '');
  if (!trimmed) {
    return { valid: false, error: 'Shortcode cannot be empty.' };
  }
  if (trimmed.length < 2) {
    return { valid: false, error: 'Shortcode must be at least 2 characters.' };
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return { valid: false, error: 'Use only letters, numbers, underscores, or hyphens.' };
  }
  return { valid: true };
}

/**
 * Applies easing shaping to a normalized cycle phase t in [0, 1)
 */
export function applyEasingPhase(t: number, mode: EasingMode): number {
  const clamped = ((t % 1) + 1) % 1;
  switch (mode) {
    case 'step-retro':
      // Quantize into 8 distinct retro sprite frames
      return Math.floor(clamped * 8) / 8;
    case 'snappy-spring': {
      // Sharper attack and settle
      return clamped < 0.5
        ? 0.5 * Math.pow(clamped * 2, 1.35)
        : 0.5 + 0.5 * (1 - Math.pow((1 - clamped) * 2, 1.35));
    }
    case 'linear':
    case 'smooth-sine':
    default:
      return clamped;
  }
}

/**
 * Computes deterministic 2D rig kinematics for any normalized loop phase t in [0, 1).
 * Used by real-time preview, timeline scrubber, AND multi-frame Sprite Sheet / WebM exporter.
 */
export function computeMotionFrame(
  config: EmojiConfig,
  rawNormalizedTime: number
): ComputedMotionFrame {
  const t = applyEasingPhase(rawNormalizedTime, config.easing);
  const tau = Math.PI * 2;
  const angle = t * tau;
  const amp = Math.max(0.1, Math.min(2.5, config.motionIntensity));

  const body: TransformState = { ...IDENTITY_TRANSFORM };
  const faceFeatures: TransformState = { ...IDENTITY_TRANSFORM };
  const eyes: TransformState & { blinkScaleY: number } = {
    ...IDENTITY_TRANSFORM,
    blinkScaleY: 1,
  };
  const brows: TransformState = { ...IDENTITY_TRANSFORM };
  const mouth: TransformState & { openFactor: number } = {
    ...IDENTITY_TRANSFORM,
    openFactor: 1,
  };
  const accessory: TransformState = { ...IDENTITY_TRANSFORM };

  // Primary motion preset kinematics
  switch (config.motionPreset) {
    case 'bounce-joy': {
      // Hop in first half, squash on landing around t = 0.5 & 0.0
      const bounceWave = Math.abs(Math.sin(angle));
      body.translateY = -bounceWave * 18 * amp;
      const squash = Math.cos(angle * 2);
      body.scaleX = 1 + squash * 0.09 * amp;
      body.scaleY = 1 - squash * 0.1 * amp;
      faceFeatures.translateY = -Math.sin(angle) * 3.5 * amp;
      break;
    }
    case 'jelly-squish': {
      const s = Math.sin(angle * 2);
      body.scaleX = 1 + s * 0.14 * amp;
      body.scaleY = 1 - s * 0.13 * amp;
      body.skewX = Math.cos(angle) * 6 * amp;
      body.translateY = Math.abs(s) * 4 * amp;
      faceFeatures.translateX = Math.sin(angle) * 3 * amp;
      break;
    }
    case 'tada-pop': {
      // Wind-up [0..0.25], burst + wiggle [0.25..0.75], settle [0.75..1]
      if (t < 0.25) {
        const p = t / 0.25;
        body.scaleX = 1 - p * 0.12 * amp;
        body.scaleY = 1 - p * 0.12 * amp;
        body.rotate = -p * 10 * amp;
      } else if (t < 0.8) {
        const p = (t - 0.25) / 0.55;
        const burst = Math.sin(p * Math.PI);
        body.scaleX = 1 + burst * 0.18 * amp;
        body.scaleY = 1 + burst * 0.18 * amp;
        body.rotate = Math.sin(p * tau * 2.5) * 14 * amp * (1 - p * 0.5);
        body.translateY = -burst * 10 * amp;
      } else {
        const p = (t - 0.8) / 0.2;
        body.scaleX = 1 + (1 - p) * 0.03 * amp;
        body.scaleY = 1 + (1 - p) * 0.03 * amp;
      }
      break;
    }
    case 'party-wobble': {
      body.translateX = Math.sin(angle) * 9 * amp;
      body.translateY = -Math.abs(Math.cos(angle)) * 8 * amp;
      body.rotate = Math.sin(angle) * 12 * amp;
      body.scaleX = 1 + Math.cos(angle * 2) * 0.05 * amp;
      body.scaleY = 1 - Math.cos(angle * 2) * 0.05 * amp;
      faceFeatures.translateX = Math.sin(angle) * 4 * amp;
      break;
    }
    case 'rage-vibrate': {
      // High frequency harmonic vibration
      body.translateX = Math.sin(angle * 6) * 5.5 * amp;
      body.translateY = Math.cos(angle * 8) * 4.0 * amp;
      body.rotate = Math.sin(angle * 5) * 6 * amp;
      body.scaleX = 1 + Math.sin(angle * 4) * 0.04 * amp;
      body.scaleY = 1 + Math.cos(angle * 4) * 0.04 * amp;
      break;
    }
    case 'spin-360': {
      // Smooth eased 360 spin
      const easedSpin = t - Math.sin(angle) / (tau * 1.8);
      body.rotate = easedSpin * 360;
      body.scaleX = 1 + Math.sin(angle) * 0.06 * amp;
      body.scaleY = 1 + Math.sin(angle) * 0.06 * amp;
      break;
    }
    case 'float-hover': {
      body.translateY = Math.sin(angle) * 11 * amp;
      body.rotate = Math.cos(angle) * 4.5 * amp;
      body.scaleX = 1 - Math.sin(angle) * 0.03 * amp;
      body.scaleY = 1 + Math.sin(angle) * 0.03 * amp;
      faceFeatures.translateY = Math.sin(angle - 0.4) * 3.5 * amp;
      break;
    }
    case 'head-nod': {
      const pitch = Math.sin(angle * 2);
      body.translateY = pitch * 5 * amp;
      body.scaleY = 1 - Math.abs(pitch) * 0.04 * amp;
      faceFeatures.translateY = pitch * 10 * amp;
      break;
    }
    case 'head-shake': {
      const yaw = Math.sin(angle * 2);
      body.translateX = yaw * 5 * amp;
      body.rotate = yaw * 4 * amp;
      faceFeatures.translateX = yaw * 12 * amp;
      break;
    }
    case 'heartbeat-pulse': {
      // Double lub-dub pulse
      const beat1 = Math.exp(-Math.pow((t - 0.18) * 12, 2));
      const beat2 = 0.75 * Math.exp(-Math.pow((t - 0.36) * 14, 2));
      const pulse = (beat1 + beat2) * 0.2 * amp;
      body.scaleX = 1 + pulse;
      body.scaleY = 1 + pulse;
      faceFeatures.scaleX = 1 + pulse * 0.4;
      faceFeatures.scaleY = 1 + pulse * 0.4;
      break;
    }
  }

  // Secondary layer motions
  const rawPhase = ((rawNormalizedTime % 1) + 1) % 1;
  if (config.layerMotion.eyeBlink) {
    // Crisp natural blink around rawPhase = 0.72
    const blinkDist = Math.abs(rawPhase - 0.72);
    if (blinkDist < 0.06) {
      const blinkCurve = Math.cos((blinkDist / 0.06) * (Math.PI / 2));
      eyes.blinkScaleY = Math.max(0.08, 1 - blinkCurve * 0.92);
    }
  }

  if (config.layerMotion.eyeTrack) {
    eyes.translateX += Math.sin(angle) * 3.5 * amp;
    eyes.translateY += Math.cos(angle) * 2.0 * amp;
  }

  if (config.layerMotion.browWiggle) {
    brows.translateY = Math.sin(angle * 2) * -4.5 * amp;
    brows.rotate = Math.cos(angle * 2) * 5 * amp;
  }

  if (config.layerMotion.mouthTalk) {
    const chomp = 0.5 + 0.5 * Math.sin(angle * 3);
    mouth.scaleY = 0.85 + chomp * 0.32 * amp;
    mouth.scaleX = 1 - (chomp - 0.5) * 0.12 * amp;
    mouth.openFactor = 0.7 + chomp * 0.5;
  }

  if (config.layerMotion.gearBounce) {
    // Phase-lagged secondary follow-through on hats/crowns/glasses
    const lagAngle = angle - 0.55;
    accessory.translateY = -Math.abs(Math.sin(lagAngle)) * 7.5 * amp;
    accessory.rotate = Math.cos(lagAngle) * 7 * amp;
  }

  // Particle states (deterministic 6 particles)
  const particles: ParticleState[] = [];
  const particleCount = 6;
  for (let i = 0; i < particleCount; i++) {
    const offset = i / particleCount;
    const pTime = config.layerMotion.fxOrbit ? (t + offset) % 1 : offset;
    const pAngle = pTime * tau;
    const radius = 78 + (i % 2) * 10;
    const x = Math.cos(pAngle + i * 1.1) * radius;
    const y = Math.sin(pAngle + i * 1.1) * (radius * 0.85) - Math.sin(pTime * Math.PI) * 10;
    const pulse = 0.65 + 0.45 * Math.sin(pAngle * 2 + i);
    const opacity = 0.45 + 0.55 * Math.sin(pTime * Math.PI);
    particles.push({
      id: i,
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2)),
      scale: Number(pulse.toFixed(3)),
      opacity: Number(opacity.toFixed(3)),
      rotate: Number(((pTime * 360 + i * 45) % 360).toFixed(1)),
    });
  }

  return {
    normalizedTime: t,
    body,
    faceFeatures,
    eyes,
    brows,
    mouth,
    accessory,
    particles,
  };
}

/**
 * Generates a randomized EmojiConfig for creative inspiration.
 */
export function randomizeEmojiConfig(seed?: number): EmojiConfig {
  let s = seed ?? Math.floor(Math.random() * 1000000);
  const nextRand = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
  const pick = <T,>(arr: T[]): T => arr[Math.floor(nextRand() * arr.length)];

  const swatch = pick(COLOR_SWATCHES);
  const face = pick(FACE_SHAPES);
  const eye = pick(EYE_STYLES);
  const brow = pick(BROW_STYLES);
  const mouth = pick(MOUTH_STYLES);
  const cheek = pick(CHEEK_STYLES);
  const acc = pick(ACCESSORY_STYLES);
  const fx = pick(EFFECT_STYLES);
  const preset = pick(MOTION_PRESETS);

  const adjectives = ['hyper', 'cosmic', 'spicy', 'chill', 'turbo', 'pixel', 'mochi', 'funky', 'royal', 'neon'];
  const nouns = ['bean', 'pals', 'vibe', 'critter', 'spark', 'boss', 'cat', 'star', 'jam', 'pop'];
  const adj = pick(adjectives);
  const noun = pick(nouns);

  return {
    id: `moji-${Date.now()}-${Math.floor(nextRand() * 1000)}`,
    name: `${adj.charAt(0).toUpperCase() + adj.slice(1)} ${noun.charAt(0).toUpperCase() + noun.slice(1)}`,
    shortcode: `:${adj}_${noun}:`,
    faceShape: face.id,
    primaryColor: swatch.primary,
    secondaryColor: swatch.secondary,
    outlineColor: swatch.outline,
    outlineWidth: 3.5,
    has3DShading: true,
    eyes: eye.id,
    eyeColor: '#0F172A',
    brows: brow.id,
    mouth: mouth.id,
    cheeks: cheek.id,
    cheekColor: '#F43F5E',
    accessory: acc.id,
    accessoryColor: pick(['#FBBF24', '#8B5CF6', '#EC4899', '#10B981', '#38BDF8', '#0F172A']),
    effect: fx.id,
    effectColor: pick(['#FDE047', '#FB7185', '#38BDF8', '#A78BFA', '#4ADE80']),
    fineTune: {
      faceScale: 1,
      eyeScale: Number((0.92 + nextRand() * 0.25).toFixed(2)),
      eyeSpacing: Math.round((nextRand() - 0.5) * 8),
      eyeOffsetY: Math.round((nextRand() - 0.5) * 6),
      mouthScale: Number((0.92 + nextRand() * 0.25).toFixed(2)),
      mouthOffsetY: Math.round((nextRand() - 0.5) * 6),
      gearOffsetY: 0,
      gearRotation: Math.round((nextRand() - 0.5) * 12),
    },
    motionPreset: preset.id,
    motionSpeed: Number((0.85 + nextRand() * 0.55).toFixed(2)),
    motionIntensity: Number((0.9 + nextRand() * 0.4).toFixed(2)),
    easing: pick(['smooth-sine', 'snappy-spring']),
    layerMotion: {
      eyeBlink: true,
      eyeTrack: nextRand() > 0.35,
      browWiggle: nextRand() > 0.35,
      mouthTalk: nextRand() > 0.4,
      gearBounce: true,
      fxOrbit: true,
    },
  };
}

export interface HistoryStack<T> {
  past: T[];
  present: T;
  future: T[];
}

export function createHistoryStack<T>(initial: T): HistoryStack<T> {
  return {
    past: [],
    present: initial,
    future: [],
  };
}

export function pushHistoryState<T>(stack: HistoryStack<T>, next: T, maxItems = 30): HistoryStack<T> {
  const updatedPast = [...stack.past, stack.present].slice(-maxItems);
  return {
    past: updatedPast,
    present: next,
    future: [],
  };
}

export function undoHistoryState<T>(stack: HistoryStack<T>): HistoryStack<T> {
  if (stack.past.length === 0) return stack;
  const previous = stack.past[stack.past.length - 1];
  const newPast = stack.past.slice(0, stack.past.length - 1);
  return {
    past: newPast,
    present: previous,
    future: [stack.present, ...stack.future],
  };
}

export function redoHistoryState<T>(stack: HistoryStack<T>): HistoryStack<T> {
  if (stack.future.length === 0) return stack;
  const next = stack.future[0];
  const newFuture = stack.future.slice(1);
  return {
    past: [...stack.past, stack.present],
    present: next,
    future: newFuture,
  };
}
