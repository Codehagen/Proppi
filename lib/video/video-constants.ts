/**
 * Video generation constants and pricing
 */

// Video generation pricing
export const VIDEO_PRICING = {
  COST_PER_SECOND_NO_AUDIO: 0.07, // $0.07 per second
  COST_PER_SECOND_WITH_AUDIO: 0.14, // $0.14 per second
  COST_PER_5_SECOND_CLIP: 0.35, // $0.35 per 5-second clip (no audio)
  COST_PER_10_SECOND_CLIP: 0.7, // $0.70 per 10-second clip (no audio)
} as const;

// Video duration options
export const VIDEO_DURATIONS = {
  SHORT: 5, // 5 seconds - recommended
  LONG: 10, // 10 seconds
} as const;

export type VideoDuration =
  (typeof VIDEO_DURATIONS)[keyof typeof VIDEO_DURATIONS];

// Video aspect ratios
export const VIDEO_ASPECT_RATIOS = [
  {
    id: "16:9",
    label: "Landscape (16:9)",
    description: "Best for YouTube, websites",
  },
  {
    id: "9:16",
    label: "Portrait (9:16)",
    description: "Best for Instagram Reels, TikTok",
  },
  {
    id: "1:1",
    label: "Square (1:1)",
    description: "Best for Instagram, Facebook",
  },
] as const;

export type VideoAspectRatio = "16:9" | "9:16" | "1:1";

// Music categories for the track selector
export const MUSIC_CATEGORIES = [
  { id: "modern", label: "Modern", icon: "IconMusic" },
  { id: "classical", label: "Classical", icon: "IconPiano" },
  { id: "upbeat", label: "Upbeat", icon: "IconBolt" },
  { id: "calm", label: "Calm", icon: "IconLeaf" },
  { id: "cinematic", label: "Cinematic", icon: "IconMovie" },
] as const;

export type MusicCategory = (typeof MUSIC_CATEGORIES)[number]["id"];

// Video generation limits
export const VIDEO_LIMITS = {
  MAX_IMAGES_PER_VIDEO: 20, // Max 20 images = 100 seconds
  MAX_VIDEO_DURATION_SECONDS: 100, // ~$7 max cost
  MIN_IMAGES_PER_VIDEO: 2, // At least 2 images for a video
} as const;

// Default video settings
export const VIDEO_DEFAULTS = {
  ASPECT_RATIO: "16:9" as VideoAspectRatio,
  CLIP_DURATION: 5 as VideoDuration,
  MUSIC_VOLUME: 50, // 50% volume
  GENERATE_NATIVE_AUDIO: true, // New default
} as const;

// Calculate estimated cost for video
export function calculateVideoCost(
  clipCount: number,
  durationPerClip: VideoDuration = 5,
  withAudio = true
): number {
  const costPerSecond = withAudio
    ? VIDEO_PRICING.COST_PER_SECOND_WITH_AUDIO
    : VIDEO_PRICING.COST_PER_SECOND_NO_AUDIO;
  return clipCount * costPerSecond * durationPerClip;
}

// Format cost for display
export function formatVideoCost(costInDollars: number): string {
  return `$${costInDollars.toFixed(2)}`;
}

// Convert cost to cents for database storage
export function costToCents(costInDollars: number): number {
  return Math.round(costInDollars * 100);
}

// Convert cents to dollars for display
export function centsToDollars(cents: number): number {
  return cents / 100;
}
