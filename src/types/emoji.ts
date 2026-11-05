export type FaceShapeId =
  | 'classic-round'
  | 'squircle'
  | 'cat-ears'
  | 'bear-ears'
  | 'devil-horns'
  | 'blob-slime'
  | 'star-burst'
  | 'heart-face';

export type EyeStyleId =
  | 'happy-arc'
  | 'wide-anime'
  | 'star-struck'
  | 'heart-eyes'
  | 'wink-playful'
  | 'sassy-side'
  | 'laser-glow'
  | 'dizzy-spiral'
  | 'sleepy-droop'
  | 'crying-streams';

export type BrowStyleId =
  | 'none'
  | 'relaxed'
  | 'raised-surprised'
  | 'angry-furrow'
  | 'worried-tilt'
  | 'sassy-single'
  | 'thick-bold';

export type MouthStyleId =
  | 'big-grin'
  | 'open-laugh'
  | 'cat-w'
  | 'smirk-cool'
  | 'tongue-blep'
  | 'shocked-o'
  | 'frown-pout'
  | 'gritted-teeth'
  | 'drool-yum'
  | 'zipper-mute';

export type CheekStyleId =
  | 'none'
  | 'soft-blush'
  | 'cute-slashes'
  | 'freckles'
  | 'star-stickers'
  | 'sweat-drop';

export type AccessoryId =
  | 'none'
  | 'deal-shades'
  | 'royal-crown'
  | 'angel-halo'
  | 'party-cone'
  | 'headset-pro'
  | 'cowboy-hat'
  | 'sprout-leaf'
  | 'chef-toque'
  | 'monocle-classy';

export type EffectId =
  | 'none'
  | 'sparkles'
  | 'floating-hearts'
  | 'fire-aura'
  | 'anger-vein'
  | 'zzz-sleep'
  | 'music-notes'
  | 'confetti-pop'
  | 'electric-bolts';

export type MotionPresetId =
  | 'bounce-joy'
  | 'jelly-squish'
  | 'tada-pop'
  | 'head-nod'
  | 'head-shake'
  | 'spin-360'
  | 'float-hover'
  | 'rage-vibrate'
  | 'party-wobble'
  | 'heartbeat-pulse';

export type EasingMode = 'smooth-sine' | 'snappy-spring' | 'linear' | 'step-retro';

export interface LayerMotionToggles {
  eyeBlink: boolean;
  eyeTrack: boolean;
  browWiggle: boolean;
  mouthTalk: boolean;
  gearBounce: boolean;
  fxOrbit: boolean;
}

export interface FeatureFineTune {
  faceScale: number;     // 0.8 to 1.2
  eyeScale: number;      // 0.7 to 1.4
  eyeSpacing: number;    // -16 to +16
  eyeOffsetY: number;    // -14 to +14
  mouthScale: number;    // 0.7 to 1.4
  mouthOffsetY: number;  // -14 to +14
  gearOffsetY: number;   // -16 to +16
  gearRotation: number;  // -30 to +30
}

export type PhotoMixMode =
  | 'none'
  | 'cutout-solo'     // Pure realistic photo masked inside the animated head silhouette + gear + FX
  | 'vector-overlay'  // Realistic photo base + animated vector eyes/brows/mouth/gear/FX layered on top
  | 'duo-collab'      // Two realistic photos bouncing together in a duo sticker rig
  | 'cross-morph';    // Dynamic rhythmic morph/crossfade between Photo A and Photo B across the loop

export interface EmojiConfig {
  id: string;
  name: string;
  shortcode: string;
  // Realistic photo sticker & mixer fields
  photoUrl?: string | null;
  secondaryPhotoUrl?: string | null;
  photoMixMode?: PhotoMixMode;
  photoScale?: number;    // 0.8 to 1.6
  photoOffsetY?: number;  // -25 to +25
  captionText?: string;   // Optional bottom meme sticker caption
  // Base appearance
  faceShape: FaceShapeId;
  primaryColor: string;
  secondaryColor: string;
  outlineColor: string;
  outlineWidth: number; // 0 to 6
  has3DShading: boolean;
  // Facial features
  eyes: EyeStyleId;
  eyeColor: string;
  brows: BrowStyleId;
  mouth: MouthStyleId;
  cheeks: CheekStyleId;
  cheekColor: string;
  accessory: AccessoryId;
  accessoryColor: string;
  effect: EffectId;
  effectColor: string;
  // Fine tuning
  fineTune: FeatureFineTune;
  // Motion configuration
  motionPreset: MotionPresetId;
  motionSpeed: number;     // 0.25 to 3.0 (multiplier)
  motionIntensity: number; // 0.2 to 2.0 (amplitude multiplier)
  easing: EasingMode;
  layerMotion: LayerMotionToggles;
}

export type PhotoCategoryFilter =
  | 'all'
  | 'user-drop'
  | 'split-sheet'
  | 'new-solo'
  | 'original';

export type MoodVibeId =
  | 'all'
  | 'crying'
  | 'rizz'
  | 'wholesome'
  | 'foodie'
  | 'chaotic';

export interface GivenPhotoItem {
  id: string;
  name: string;
  shortcode: string;
  photoUrl: string;
  vibeTag: string;
  defaultCaption: string;
  category?: 'original' | 'new-solo' | 'split-sheet' | 'user-drop';
  mood?: MoodVibeId;
  sourceSheetName?: string;
  matchingConfig: EmojiConfig;
}

export interface SheetSliceBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

export interface TransformState {
  translateX: number;
  translateY: number;
  scaleX: number;
  scaleY: number;
  rotate: number;
  skewX: number;
}

export interface ParticleState {
  id: number;
  x: number;
  y: number;
  scale: number;
  opacity: number;
  rotate: number;
}

export interface ComputedMotionFrame {
  normalizedTime: number; // 0 to 1
  body: TransformState;
  faceFeatures: TransformState;
  eyes: TransformState & { blinkScaleY: number };
  brows: TransformState;
  mouth: TransformState & { openFactor: number };
  accessory: TransformState;
  particles: ParticleState[];
}

export interface SavedEmoji {
  config: EmojiConfig;
  createdAt: string;
  usageCount: number;
}

export interface ChatMessage {
  id: string;
  author: string;
  role: string;
  timestamp: string;
  text: string;
  customEmojiIds: string[];
  reactions: Array<{
    emojiId: string;
    shortcode: string;
    count: number;
    userReacted: boolean;
  }>;
}
