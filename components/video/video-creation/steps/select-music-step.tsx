"use client";

import {
  IconAspectRatio,
  IconCheck,
  IconMusic,
  IconPlayerPause,
  IconPlayerPlay,
  IconSparkles,
  IconVolume,
  IconVolumeOff,
} from "@tabler/icons-react";
import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import type { MusicTrack, VideoAspectRatio } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import {
  MUSIC_CATEGORIES,
  VIDEO_ASPECT_RATIOS,
} from "@/lib/video/video-constants";

interface SelectMusicStepProps {
  selectedTrack: MusicTrack | null;
  onSelectTrack: (track: MusicTrack | null) => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  aspectRatio: VideoAspectRatio;
  onAspectRatioChange: (ratio: VideoAspectRatio) => void;
  generateNativeAudio: boolean;
  onGenerateNativeAudioChange: (generate: boolean) => void;
}

// Mock music tracks - in production, these would come from the database
const MOCK_TRACKS: MusicTrack[] = [
  {
    id: "1",
    name: "Elegant Home",
    artist: "Ambient Studios",
    category: "modern",
    mood: "professional",
    audioUrl: "/audio/elegant-home.mp3",
    durationSeconds: 180,
    bpm: 90,
    previewUrl: null,
    waveformUrl: null,
    licenseType: "royalty-free",
    attribution: null,
    isActive: true,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    name: "Luxury Living",
    artist: "Cinema Sounds",
    category: "cinematic",
    mood: "elegant",
    audioUrl: "/audio/luxury-living.mp3",
    durationSeconds: 240,
    bpm: 75,
    previewUrl: null,
    waveformUrl: null,
    licenseType: "royalty-free",
    attribution: null,
    isActive: true,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "3",
    name: "Sunny Spaces",
    artist: "Mood Music",
    category: "upbeat",
    mood: "energetic",
    audioUrl: "/audio/sunny-spaces.mp3",
    durationSeconds: 150,
    bpm: 120,
    previewUrl: null,
    waveformUrl: null,
    licenseType: "royalty-free",
    attribution: null,
    isActive: true,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "4",
    name: "Peaceful Retreat",
    artist: "Ambient Studios",
    category: "calm",
    mood: "relaxing",
    audioUrl: "/audio/peaceful-retreat.mp3",
    durationSeconds: 200,
    bpm: 60,
    previewUrl: null,
    waveformUrl: null,
    licenseType: "royalty-free",
    attribution: null,
    isActive: true,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "5",
    name: "Classical Elegance",
    artist: "Orchestra Collection",
    category: "classical",
    mood: "warm",
    audioUrl: "/audio/classical-elegance.mp3",
    durationSeconds: 220,
    bpm: 85,
    previewUrl: null,
    waveformUrl: null,
    licenseType: "royalty-free",
    attribution: null,
    isActive: true,
    createdAt: new Date("2024-01-01"),
  },
];

export function SelectMusicStep({
  selectedTrack,
  onSelectTrack,
  volume,
  onVolumeChange,
  aspectRatio,
  onAspectRatioChange,
  generateNativeAudio,
  onGenerateNativeAudioChange,
}: SelectMusicStepProps) {
  const [activeCategory, setActiveCategory] = React.useState<string>("all");
  const [playingId, setPlayingId] = React.useState<string | null>(null);

  const filteredTracks =
    activeCategory === "all"
      ? MOCK_TRACKS
      : MOCK_TRACKS.filter((t) => t.category === activeCategory);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-8">
      {/* Native Audio Toggle */}
      <div className="rounded-xl border-(--accent-teal)/30 border-2 bg-(--accent-teal)/5 p-6 transition-all">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-(--accent-teal) text-white shadow-(--accent-teal)/20 shadow-lg">
            <IconSparkles className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">
                  AI Native Audio Generation
                </h3>
                <p className="text-muted-foreground text-sm">
                  Our AI can generate cinematic audio and speech directly with
                  the video.
                </p>
              </div>
              <Checkbox
                checked={generateNativeAudio}
                className="h-6 w-6 border-2"
                id="native-audio"
                onCheckedChange={(checked) =>
                  onGenerateNativeAudioChange(!!checked)
                }
              />
            </div>

            {generateNativeAudio && (
              <div className="mt-4 animate-fade-in space-y-3">
                <div className="flex items-center gap-2 font-medium text-(--accent-teal) text-sm">
                  <IconCheck className="h-4 w-4" />
                  Premium Production Quality ($0.14/sec)
                </div>
                <div className="text-muted-foreground text-xs leading-relaxed">
                  <p>• Synchronized environmental sounds and atmosphere</p>
                  <p>
                    • Native speech synthesis (lowercase for speech, UPPERCASE
                    for proper nouns)
                  </p>
                  <p>• Professional audio-visual coherence</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Aspect Ratio Selection */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 font-medium text-sm">
          <IconAspectRatio className="h-4 w-4" />
          Video Aspect Ratio
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {VIDEO_ASPECT_RATIOS.map((ratio) => (
            <button
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200",
                aspectRatio === ratio.id
                  ? "border-(--accent-teal) bg-(--accent-teal)/5"
                  : "border-transparent bg-muted/50 hover:bg-muted"
              )}
              key={ratio.id}
              onClick={() => onAspectRatioChange(ratio.id as VideoAspectRatio)}
              type="button"
            >
              {/* Aspect Ratio Visual */}
              <div
                className={cn(
                  "rounded border-2 transition-colors",
                  aspectRatio === ratio.id
                    ? "border-(--accent-teal)"
                    : "border-muted-foreground/30"
                )}
                style={{
                  width:
                    ratio.id === "16:9" ? 48 : ratio.id === "9:16" ? 27 : 36,
                  height:
                    ratio.id === "16:9" ? 27 : ratio.id === "9:16" ? 48 : 36,
                }}
              />
              <div className="text-center">
                <div className="font-medium text-sm">{ratio.label}</div>
                <div className="text-muted-foreground text-xs">
                  {ratio.description}
                </div>
              </div>
              {aspectRatio === ratio.id && (
                <IconCheck className="h-4 w-4 text-(--accent-teal)" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Music Selection */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 font-medium text-sm">
          <IconMusic className="h-4 w-4" />
          Background Music
          <span className="font-normal text-muted-foreground">(optional)</span>
        </h3>

        {/* Category Tabs */}
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            className={cn(
              "rounded-full px-4 py-1.5 font-medium text-sm transition-colors",
              activeCategory === "all"
                ? "bg-(--accent-teal) text-white"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setActiveCategory("all")}
            type="button"
          >
            All
          </button>
          {MUSIC_CATEGORIES.map((cat) => (
            <button
              className={cn(
                "rounded-full px-4 py-1.5 font-medium text-sm transition-colors",
                activeCategory === cat.id
                  ? "bg-(--accent-teal) text-white"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              type="button"
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* No Music Option */}
        <button
          className={cn(
            "mb-4 flex w-full items-center gap-3 rounded-xl border-2 p-4 transition-all duration-200",
            selectedTrack === null
              ? "border-(--accent-teal) bg-(--accent-teal)/5"
              : "border-transparent bg-muted/50 hover:bg-muted"
          )}
          onClick={() => onSelectTrack(null)}
          type="button"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <IconVolumeOff className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 text-left">
            <div className="font-medium">No Music</div>
            <div className="text-muted-foreground text-sm">
              Video will have no background audio
            </div>
          </div>
          {selectedTrack === null && (
            <IconCheck className="h-5 w-5 text-(--accent-teal)" />
          )}
        </button>

        {/* Track List */}
        <div className="space-y-2">
          {filteredTracks.map((track) => (
            <div
              className={cn(
                "flex w-full cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all duration-200",
                selectedTrack?.id === track.id
                  ? "border-(--accent-teal) bg-(--accent-teal)/5"
                  : "border-transparent bg-muted/50 hover:bg-muted"
              )}
              key={track.id}
              onClick={() => onSelectTrack(track)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectTrack(track);
                }
              }}
              role="button"
              tabIndex={0}
            >
              {/* Play Button */}
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full bg-(--accent-teal)/10 text-(--accent-teal) hover:bg-(--accent-teal)/20"
                onClick={(e) => {
                  e.stopPropagation();
                  setPlayingId(playingId === track.id ? null : track.id);
                }}
                type="button"
              >
                {playingId === track.id ? (
                  <IconPlayerPause className="h-5 w-5" />
                ) : (
                  <IconPlayerPlay className="ml-0.5 h-5 w-5" />
                )}
              </button>

              {/* Track Info */}
              <div className="flex-1 text-left">
                <div className="font-medium">{track.name}</div>
                <div className="text-muted-foreground text-sm">
                  {track.artist} • {formatDuration(track.durationSeconds)} •{" "}
                  {track.bpm} BPM
                </div>
              </div>

              {/* Category Badge */}
              <div className="rounded-full bg-muted px-3 py-1 font-medium text-xs capitalize">
                {track.category}
              </div>

              {selectedTrack?.id === track.id && (
                <IconCheck className="h-5 w-5 text-(--accent-teal)" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Volume Control */}
      {selectedTrack && (
        <div className="rounded-xl border bg-muted/30 p-4">
          <div className="flex items-center gap-4">
            <IconVolume className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <Slider
                className="w-full"
                max={100}
                min={0}
                onValueChange={([v]) => onVolumeChange(v)}
                step={5}
                value={[volume]}
              />
            </div>
            <span className="w-12 text-right font-medium text-sm">
              {volume}%
            </span>
          </div>
          <p className="mt-2 text-muted-foreground text-xs">
            Adjust the background music volume relative to the video
          </p>
        </div>
      )}
    </div>
  );
}
