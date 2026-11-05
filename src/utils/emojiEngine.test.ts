import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STARTER_PRESETS,
  computeMotionFrame,
  createHistoryStack,
  formatShortcode,
  pushHistoryState,
  randomizeEmojiConfig,
  redoHistoryState,
  undoHistoryState,
  validateShortcode,
} from './emojiEngine';
import {
  GIVEN_PHOTO_EMOJIS,
  MULTI_REACTION_SHEETS,
  computeSheetGridSlices,
  computeSvgCropPlacement,
  createDroppedPhotoEmoji,
  getCropImgProps,
  mixEmojiConfigs,
  parseCropUrl,
  randomizePhotoCombo,
} from './photoEmojiCatalog';

test('formatShortcode normalizes custom emoji shortcodes properly', () => {
  assert.equal(formatShortcode('Party Cat!'), ':party_cat:');
  assert.equal(formatShortcode('::rocket-launch::'), ':rocket-launch:');
  assert.equal(formatShortcode('   '), ':custom_moji:');
});

test('validateShortcode rejects invalid or empty codes and accepts valid ones', () => {
  assert.equal(validateShortcode('').valid, false);
  assert.equal(validateShortcode(':a:').valid, false);
  assert.equal(validateShortcode('bad space').valid, false);
  assert.equal(validateShortcode(':neko_hype_2:').valid, true);
});

test('computeMotionFrame computes deterministic kinematics across normalized time', () => {
  const base = STARTER_PRESETS[0]; // bounce-joy
  const frameStart = computeMotionFrame(base, 0);
  const frameQuarter = computeMotionFrame(base, 0.25);

  assert.equal(frameStart.normalizedTime, 0);
  assert.ok(frameQuarter.body.translateY < -5, 'Expected upward bounce at t=0.25');
  assert.equal(frameQuarter.particles.length, 6);

  const frameBlink = computeMotionFrame(base, 0.72);
  assert.ok(frameBlink.eyes.blinkScaleY < 0.25, 'Expected eyes to blink near t=0.72');
});

test('randomizeEmojiConfig produces deterministic config when seeded', () => {
  const c1 = randomizeEmojiConfig(42);
  const c2 = randomizeEmojiConfig(42);
  assert.equal(c1.faceShape, c2.faceShape);
  assert.equal(c1.eyes, c2.eyes);
  assert.equal(c1.mouth, c2.mouth);
  assert.equal(c1.motionPreset, c2.motionPreset);
  assert.equal(c1.shortcode, c2.shortcode);
});

test('GIVEN_PHOTO_EMOJIS contains all 62 solo reaction emojis (14 new + 32 separated sheet crops + 16 originals)', () => {
  assert.equal(GIVEN_PHOTO_EMOJIS.length, 62);
  assert.equal(MULTI_REACTION_SHEETS.length, 4);
  const splitSheetItems = GIVEN_PHOTO_EMOJIS.filter((i) => i.category === 'split-sheet');
  const newSoloItems = GIVEN_PHOTO_EMOJIS.filter((i) => i.category === 'new-solo');
  const originalItems = GIVEN_PHOTO_EMOJIS.filter((i) => i.category === 'original');
  assert.equal(splitSheetItems.length, 32);
  assert.equal(newSoloItems.length, 14);
  assert.equal(originalItems.length, 16);

  for (const item of GIVEN_PHOTO_EMOJIS) {
    assert.ok(item.photoUrl.startsWith('/assets/aistudio/'), `Invalid path: ${item.photoUrl}`);
    assert.ok(!item.photoUrl.includes('/crops/'), `Must not depend on untracked /crops/ dir: ${item.photoUrl}`);
    assert.equal(item.matchingConfig.photoUrl, item.photoUrl);
  }
});

test('parseCropUrl, computeSvgCropPlacement, and getCropImgProps accurately slice sticker sheet coordinates', () => {
  const bananaUrl = '/assets/aistudio/michis_74bb539b.jpg#crop=20,108,176,348,736,1308';
  const parsed = parseCropUrl(bananaUrl);
  assert.equal(parsed.baseUrl, '/assets/aistudio/michis_74bb539b.jpg');
  assert.deepEqual(parsed.crop, { x: 20, y: 108, w: 176, h: 348, sw: 736, sh: 1308 });

  const svgPlace = computeSvgCropPlacement(bananaUrl, 30, 30, 140, 140);
  assert.equal(svgPlace.href, '/assets/aistudio/michis_74bb539b.jpg');
  assert.equal(svgPlace.preserveAspectRatio, 'none');
  assert.ok(svgPlace.width > 500 && svgPlace.height > 900);

  const imgProps = getCropImgProps(bananaUrl);
  assert.equal(imgProps.src, '/assets/aistudio/michis_74bb539b.jpg');
  assert.ok(imgProps.style?.objectViewBox?.startsWith('inset('));
});

test('createDroppedPhotoEmoji and computeSheetGridSlices process user drops and multi-reaction sheets accurately', () => {
  const dropped = createDroppedPhotoEmoji('data:image/jpeg;base64,abc', 'my_mood_cat.jpg', 'foodie', 1);
  assert.equal(dropped.category, 'user-drop');
  assert.equal(dropped.mood, 'foodie');
  assert.equal(dropped.shortcode, ':my_mood_cat:');

  const slices = computeSheetGridSlices(600, 800, 3, 4);
  assert.equal(slices.length, 12);
  assert.ok(slices[0].width > 100 && slices[0].height > 150);
});

test('mixEmojiConfigs combines two photo emojis across duo-collab and vector-overlay modes', () => {
  const pA = GIVEN_PHOTO_EMOJIS[0].matchingConfig;
  const pB = GIVEN_PHOTO_EMOJIS[14].matchingConfig;

  const duo = mixEmojiConfigs(pA, pB, 'duo-collab');
  assert.equal(duo.photoUrl, pA.photoUrl);
  assert.equal(duo.secondaryPhotoUrl, pB.photoUrl);
  assert.equal(duo.photoMixMode, 'duo-collab');
  assert.equal(duo.motionPreset, pB.motionPreset);

  const overlay = mixEmojiConfigs(pA, pB, 'vector-overlay');
  assert.equal(overlay.photoUrl, pA.photoUrl);
  assert.equal(overlay.eyes, pB.eyes);
  assert.equal(overlay.mouth, pB.mouth);
  assert.equal(overlay.photoMixMode, 'vector-overlay');
});

test('randomizePhotoCombo produces deterministic photo mashups and respects mood filter', () => {
  const r1 = randomizePhotoCombo(99, GIVEN_PHOTO_EMOJIS, 'foodie');
  const r2 = randomizePhotoCombo(99, GIVEN_PHOTO_EMOJIS, 'foodie');
  assert.equal(r1.parentA.id, r2.parentA.id);
  assert.equal(r1.parentB.id, r2.parentB.id);
  assert.equal(r1.parentA.mood, 'foodie');
  assert.equal(r1.parentB.mood, 'foodie');
  assert.notEqual(r1.parentA.id, r1.parentB.id);
  assert.equal(r1.config.motionPreset, r2.config.motionPreset);
});

test('undo and redo history stack transitions work accurately', () => {
  let stack = createHistoryStack<number>(1);
  stack = pushHistoryState(stack, 2);
  stack = pushHistoryState(stack, 3);
  assert.equal(stack.present, 3);
  assert.equal(stack.past.length, 2);

  stack = undoHistoryState(stack);
  assert.equal(stack.present, 2);
  assert.equal(stack.future.length, 1);

  stack = redoHistoryState(stack);
  assert.equal(stack.present, 3);
  assert.equal(stack.future.length, 0);
});
