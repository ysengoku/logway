export const PROFILE_ICON_NAMES = [
  'cat',
  'dog',
  'dove',
  'fish',
  'frog',
  'shrimp',
  'apple-whole',
  'seedling',
  'user-astronaut',
  'user-secret',
  'chess-knight',
  'face-grin-hearts',
  'face-grin-squint-tears',
  'face-smile',
  'face-smile-wink',
] as const;

export type ProfileIconName = (typeof PROFILE_ICON_NAMES)[number];