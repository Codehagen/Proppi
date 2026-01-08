"use client";

import {
  IconAlertTriangle,
  IconArrowLeft,
  IconArrowRight,
  IconAspectRatio,
  IconCheck,
  IconClock,
  IconDownload,
  IconLoader2,
  IconMaximize,
  IconMovie,
  IconMusic,
  IconPhoto,
  IconPlayerPause,
  IconPlayerPlay,
  IconRefresh,
  IconScissors,
  IconTrash,
  IconVolume,
  IconVolumeOff,
} from "@tabler/icons-react";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { deleteVideoProject, retryFailedClip } from "@/lib/actions/video";
import type {
  MusicTrack,
  VideoClip,
  VideoProject,
  VideoProjectStatus,
} from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { VIDEO_ROOM_TYPES } from "@/lib/video/room-sequence";
import type { generateVideoTask } from "@/trigger/video-orchestrator";

const statusConfig: Record<
  VideoProjectStatus,
  {
    label: string;
    variant:
      | "status-active"
      | "status-pending"
      | "status-completed"
      | "destructive";
    icon: React.ReactNode;
  }
> = {
  draft: {
    label: "Draft",
    variant: "status-pending",
    icon: <IconClock className="h-3 w-3" />,
  },
  generating: {
    label: "Generating Clips",
    variant: "status-active",
    icon: <IconLoader2 className="h-3 w-3 animate-spin" />,
  },
  compiling: {
    label: "Compiling Video",
    variant: "status-active",
    icon: <IconLoader2 className="h-3 w-3 animate-spin" />,
  },
  completed: {
    label: "Completed",
    variant: "status-completed",
    icon: <IconCheck className="h-3 w-3" />,
  },
  failed: {
    label: "Failed",
    variant: "destructive",
    icon: <IconAlertTriangle className="h-3 w-3" />,
  },
};

const clipStatusConfig = {
  pending: { label: "Pending", color: "bg-muted" },
  processing: { label: "Processing", color: "bg-[var(--accent-teal)]" },
  completed: { label: "Completed", color: "bg-[var(--accent-green)]" },
  failed: { label: "Failed", color: "bg-destructive" },
};

// Real-time progress component for video generation
function RealtimeVideoProgress({
  runId,
  accessToken,
  clipCount,
  onComplete,
}: {
  runId?: string;
  accessToken?: string | null;
  clipCount: number;
  onComplete?: () => void;
}) {
  const router = useRouter();
  const { run } = useRealtimeRun<typeof generateVideoTask>(runId ?? "", {
    accessToken: accessToken ?? "",
    enabled: !!runId && !!accessToken,
  });

  const isFailed =
    run?.status === "CANCELED" ||
    run?.status === "CRASHED" ||
    run?.status === "SYSTEM_FAILURE" ||
    run?.status === "EXPIRED" ||
    run?.status === "TIMED_OUT";
  const isCompleted = run?.status === "COMPLETED";

  // Metadata is nested under "status" key from the orchestrator
  const metadata = run?.metadata as
    | {
        status?: {
          step?: string;
          label?: string;
          clipIndex?: number;
          totalClips?: number;
          progress?: number;
        };
      }
    | undefined;
  const status = metadata?.status;
  const step = status?.step || (isFailed ? "failed" : "generating");
  const currentClip = status?.clipIndex || 0;
  const total = status?.totalClips || clipCount;
  const progressFromMetadata = status?.progress;

  // Use metadata progress if available, otherwise calculate from clips
  const progress =
    progressFromMetadata ??
    (step === "compiling"
      ? 70
      : isFailed
        ? 0
        : Math.round((currentClip / total) * 100));

  // Auto-refresh page when run completes or fails to get latest data
  React.useEffect(() => {
    if (isCompleted || isFailed) {
      onComplete?.();
    }
  }, [run?.status, onComplete, isCompleted, isFailed]);

  if (isFailed) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <IconAlertTriangle className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-destructive">
              Generation Failed
            </h3>
            <p className="mt-1 text-muted-foreground text-sm">
              {status?.label ||
                `The background task failed with status: ${run?.status}. Please try again.`}
            </p>
          </div>
          <Button
            className="flex items-center gap-2"
            onClick={() => router.refresh()}
            size="sm"
            variant="outline"
          >
            <IconRefresh className="h-4 w-4" />
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-left">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-teal)]/10">
            {isCompleted ? (
              <IconCheck className="h-5 w-5 text-[var(--accent-teal)]" />
            ) : (
              <IconLoader2 className="h-5 w-5 animate-spin text-[var(--accent-teal)]" />
            )}
          </div>
          <div>
            <div className="font-medium">
              {status?.label ||
                (step === "compiling"
                  ? "Compiling video…"
                  : step === "generating" &&
                      status?.label?.includes("transitions")
                    ? status.label
                    : `Generating clip ${currentClip} of ${total}`)}
            </div>
            <div className="text-muted-foreground text-sm">
              {step === "starting"
                ? "Preparing video generation"
                : step === "compiling"
                  ? "Adding transitions and music"
                  : step === "generating" &&
                      status?.label?.includes("transitions")
                    ? "Creating seamless transitions between clips"
                    : step === "completed"
                      ? "Your video is ready"
                      : "Creating cinematic clips from your images"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-bold text-2xl text-[var(--accent-teal)]">
            {progress}%
          </span>
          <Button
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => router.refresh()}
            size="icon"
            title="Manual refresh"
            variant="ghost"
          >
            <IconRefresh className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            backgroundColor: "var(--accent-teal)",
          }}
        />
      </div>
    </div>
  );
}

// Video Player Component
function VideoPlayer({
  videoUrl,
  thumbnailUrl,
}: {
  videoUrl: string;
  thumbnailUrl: string | null;
}) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [volume, setVolume] = React.useState(1);
  const [isMuted, setIsMuted] = React.useState(false);
  const [showControls, setShowControls] = React.useState(true);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    if (videoRef.current) {
      const newVolume = value[0];
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div
      className="relative aspect-video overflow-hidden rounded-xl bg-black"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => !isPlaying && setShowControls(true)}
    >
      <video
        className="h-full w-full object-contain"
        onClick={togglePlay}
        onEnded={() => setIsPlaying(false)}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        poster={thumbnailUrl || undefined}
        ref={videoRef}
        src={videoUrl}
      />

      {/* Play overlay when paused */}
      {!isPlaying && (
        <div
          className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/30"
          onClick={togglePlay}
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/90 shadow-xl transition-transform hover:scale-105">
            <IconPlayerPlay className="ml-1 h-10 w-10 text-black" />
          </div>
        </div>
      )}

      {/* Controls */}
      <div
        className={cn(
          "absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Progress bar */}
        <Slider
          className="mb-3"
          max={duration || 100}
          onValueChange={handleSeek}
          step={0.1}
          value={[currentTime]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <IconPlayerPause className="h-4 w-4" />
              ) : (
                <IconPlayerPlay className="ml-0.5 h-4 w-4" />
              )}
            </button>

            <div className="flex items-center gap-2">
              <button
                className="text-white hover:text-white/80"
                onClick={toggleMute}
              >
                {isMuted ? (
                  <IconVolumeOff className="h-5 w-5" />
                ) : (
                  <IconVolume className="h-5 w-5" />
                )}
              </button>
              <Slider
                className="w-20"
                max={1}
                onValueChange={handleVolumeChange}
                step={0.1}
                value={[isMuted ? 0 : volume]}
              />
            </div>

            <span className="font-mono text-sm text-white">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <button
            className="text-white hover:text-white/80"
            onClick={toggleFullscreen}
          >
            <IconMaximize className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface VideoDetailContentProps {
  videoProject: VideoProject;
  clips: VideoClip[];
  musicTrack: MusicTrack | null;
}

export function VideoDetailContent({
  videoProject,
  clips,
  musicTrack,
}: VideoDetailContentProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const status = statusConfig[videoProject.status];
  const isProcessing =
    videoProject.status === "generating" || videoProject.status === "compiling";
  const isCompleted = videoProject.status === "completed";
  const isFailed = videoProject.status === "failed";

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteVideoProject(videoProject.id);
      if (result.success) {
        toast.success("Video deleted");
        router.push("/video");
      } else {
        throw new Error("Failed to delete video");
      }
    } catch {
      toast.error("Failed to delete video");
      setIsDeleting(false);
    }
  };

  const handleDownload = async () => {
    if (!videoProject.finalVideoUrl) return;

    try {
      const response = await fetch(videoProject.finalVideoUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${videoProject.name.replace(/[^a-z0-9]/gi, "_")}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Download started");
    } catch {
      toast.error("Failed to download video");
    }
  };

  const handleRetryClip = async (clipId: string) => {
    try {
      const result = await retryFailedClip(clipId);
      if (result.success) {
        toast.success("Retry started");
        router.refresh();
      } else {
        throw new Error("Failed to retry clip");
      }
    } catch {
      toast.error("Failed to retry clip");
    }
  };

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild size="sm" variant="ghost">
              <Link href="/video">
                <IconArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-bold text-2xl tracking-tight">
                  {videoProject.name}
                </h1>
                <Badge className="gap-1.5" variant={status.variant}>
                  {status.icon}
                  {status.label}
                </Badge>
              </div>
              <p className="mt-1 text-muted-foreground text-sm">
                Created{" "}
                {format(
                  new Date(videoProject.createdAt),
                  "MMM d, yyyy 'at' h:mm a"
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isCompleted && videoProject.finalVideoUrl && (
              <Button
                className="gap-2"
                onClick={handleDownload}
                style={{ backgroundColor: "var(--accent-teal)" }}
              >
                <IconDownload className="h-4 w-4" />
                Download
              </Button>
            )}
            <Button
              className="gap-2 text-destructive hover:text-destructive"
              onClick={() => setShowDeleteDialog(true)}
              variant="outline"
            >
              <IconTrash className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Video Player or Progress */}
            {isProcessing ? (
              <RealtimeVideoProgress
                accessToken={videoProject.triggerAccessToken}
                clipCount={videoProject.clipCount}
                onComplete={() => router.refresh()}
                runId={videoProject.triggerRunId || undefined}
              />
            ) : isCompleted && videoProject.finalVideoUrl ? (
              <VideoPlayer
                thumbnailUrl={videoProject.thumbnailUrl}
                videoUrl={videoProject.finalVideoUrl}
              />
            ) : isFailed ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
                <IconAlertTriangle className="mx-auto h-12 w-12 text-destructive" />
                <h3 className="mt-4 font-semibold text-destructive">
                  Video Generation Failed
                </h3>
                <p className="mx-auto mt-2 max-w-md text-muted-foreground text-sm">
                  {videoProject.errorMessage ||
                    "An error occurred during video generation. You can retry failed clips below."}
                </p>
              </div>
            ) : (
              <div className="flex aspect-video items-center justify-center rounded-xl border-2 border-dashed bg-muted/30">
                <div className="text-center">
                  <IconMovie className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">
                    Video not yet generated
                  </p>
                </div>
              </div>
            )}

            {/* Clips Grid */}
            <div>
              <h3 className="mb-4 flex items-center gap-2 font-medium">
                <IconPhoto className="h-4 w-4" />
                Video Clips ({clips.length})
              </h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {clips.map((clip, index) => {
                  const roomConfig = VIDEO_ROOM_TYPES.find(
                    (r) => r.id === clip.roomType
                  );
                  const clipStatus = clipStatusConfig[clip.status];
                  const nextClip = clips[index + 1];
                  const showTransition =
                    clip.transitionType === "seamless" &&
                    index < clips.length - 1;

                  return (
                    <React.Fragment key={clip.id}>
                      {/* Main Clip Card */}
                      <div
                        className={cn(
                          "relative overflow-hidden rounded-xl border bg-card",
                          clip.status === "processing" &&
                            "ring-2 ring-[var(--accent-teal)]",
                          clip.status === "failed" && "ring-2 ring-destructive"
                        )}
                      >
                        {/* Thumbnail */}
                        <div className="relative aspect-video bg-muted">
                          {clip.status === "pending" ||
                          clip.status === "processing" ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                              <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                          ) : (
                            <Image
                              alt={
                                clip.roomLabel ||
                                roomConfig?.label ||
                                `Clip ${index + 1}`
                              }
                              className="object-cover"
                              fill
                              sizes="(max-width: 640px) 50vw, 33vw"
                              src={clip.sourceImageUrl}
                            />
                          )}

                          {/* Sequence number */}
                          <div className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 font-bold text-white text-xs">
                            {index + 1}
                          </div>

                          {/* Status indicator */}
                          <div className="absolute top-2 right-2">
                            <div
                              className={cn(
                                "h-2.5 w-2.5 rounded-full",
                                clipStatus.color
                              )}
                            />
                          </div>

                          {/* Processing shimmer */}
                          {clip.status === "processing" && (
                            <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                          )}

                          {/* Retry button for failed clips */}
                          {clip.status === "failed" && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                              <Button
                                className="gap-1"
                                onClick={() => handleRetryClip(clip.id)}
                                size="sm"
                                variant="secondary"
                              >
                                <IconRefresh className="h-3.5 w-3.5" />
                                Retry
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="p-2.5">
                          <div className="truncate font-medium text-sm">
                            {clip.roomLabel || roomConfig?.label || "Unknown"}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {clip.durationSeconds || 5}s • {clipStatus.label}
                          </div>
                        </div>
                      </div>

                      {/* Transition Card */}
                      {showTransition && (
                        <div
                          className={cn(
                            "relative overflow-hidden rounded-xl border-2 border-dashed bg-muted/30",
                            clip.transitionClipUrl
                              ? "border-[var(--accent-teal)]/30 bg-[var(--accent-teal)]/5"
                              : "border-muted-foreground/20"
                          )}
                        >
                          <div className="relative flex aspect-video flex-col items-center justify-center p-3">
                            {clip.transitionClipUrl ? (
                              <>
                                <video
                                  className="absolute inset-0 h-full w-full rounded-lg object-cover"
                                  loop
                                  muted
                                  playsInline
                                  src={clip.transitionClipUrl}
                                />
                                <div className="absolute inset-0 rounded-lg bg-black/20" />
                                <div className="relative z-10 flex flex-col items-center gap-1.5">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--accent-teal)]/30 bg-[var(--accent-teal)]/20">
                                    <IconArrowRight className="h-4 w-4 text-[var(--accent-teal)]" />
                                  </div>
                                  <span className="font-bold text-[9px] text-[var(--accent-teal)] uppercase tracking-wider">
                                    Seamless
                                  </span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-muted-foreground/30 border-dashed bg-muted">
                                  {isProcessing && !clip.transitionClipUrl ? (
                                    <IconLoader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                  ) : (
                                    <IconScissors className="h-5 w-5 text-muted-foreground" />
                                  )}
                                </div>
                                <span className="mt-2 font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
                                  {isProcessing && !clip.transitionClipUrl
                                    ? "Generating Transition"
                                    : "Transition"}
                                </span>
                                {nextClip && (
                                  <div className="mt-1 flex items-center gap-1">
                                    <div className="relative h-4 w-6 overflow-hidden rounded border border-muted-foreground/20">
                                      {clip.endImageUrl && (
                                        <Image
                                          alt="From"
                                          className="object-cover opacity-60"
                                          fill
                                          sizes="24px"
                                          src={clip.endImageUrl}
                                        />
                                      )}
                                    </div>
                                    <IconArrowRight className="h-3 w-3 text-muted-foreground" />
                                    <div className="relative h-4 w-6 overflow-hidden rounded border border-muted-foreground/20">
                                      {nextClip.sourceImageUrl && (
                                        <Image
                                          alt="To"
                                          className="object-cover opacity-60"
                                          fill
                                          sizes="24px"
                                          src={nextClip.sourceImageUrl}
                                        />
                                      )}
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                          <div className="border-muted-foreground/10 border-t p-2 text-center">
                            <div className="font-medium text-[10px] text-muted-foreground">
                              {clip.transitionClipUrl
                                ? "5s • Ready"
                                : isProcessing
                                  ? "5s • Generating..."
                                  : "5s • Pending"}
                            </div>
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Video Info */}
            <div className="rounded-xl border bg-card p-5">
              <h3 className="mb-4 font-medium">Video Details</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Aspect Ratio</dt>
                  <dd className="flex items-center gap-1.5 font-medium">
                    <IconAspectRatio className="h-3.5 w-3.5" />
                    {videoProject.aspectRatio}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Total Clips</dt>
                  <dd className="font-medium">{videoProject.clipCount}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Duration</dt>
                  <dd className="font-medium">
                    {videoProject.durationSeconds
                      ? `${Math.floor(videoProject.durationSeconds / 60)}:${(videoProject.durationSeconds % 60).toString().padStart(2, "0")}`
                      : `~${videoProject.clipCount * 5}s`}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Music Info */}
            <div className="rounded-xl border bg-card p-5">
              <h3 className="mb-4 flex items-center gap-2 font-medium">
                <IconMusic className="h-4 w-4" />
                Background Music
              </h3>
              {musicTrack ? (
                <div>
                  <div className="font-medium">{musicTrack.name}</div>
                  <div className="text-muted-foreground text-sm">
                    {musicTrack.artist} • {musicTrack.category}
                  </div>
                  <div className="mt-2 text-muted-foreground text-xs">
                    Volume: {videoProject.musicVolume}%
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground text-sm">
                  No background music
                </div>
              )}
            </div>

            {/* Progress Stats */}
            {isProcessing && (
              <div className="rounded-xl border bg-card p-5">
                <h3 className="mb-4 font-medium">Generation Progress</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Completed Clips
                    </span>
                    <span className="font-medium text-[var(--accent-green)]">
                      {videoProject.completedClipCount} /{" "}
                      {videoProject.clipCount}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(videoProject.completedClipCount / videoProject.clipCount) * 100}%`,
                        backgroundColor: "var(--accent-green)",
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog onOpenChange={setShowDeleteDialog} open={showDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{videoProject.name}&quot; and
              all its clips. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? (
                <>
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                "Delete Video"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
