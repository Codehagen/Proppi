"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import {
  IconArrowLeft,
  IconDownload,
  IconMovie,
  IconMusic,
  IconPhoto,
  IconClock,
  IconCheck,
  IconLoader2,
  IconAlertTriangle,
  IconPlayerPlay,
  IconPlayerPause,
  IconVolume,
  IconVolumeOff,
  IconMaximize,
  IconRefresh,
  IconTrash,
  IconAspectRatio,
} from "@tabler/icons-react"
import { toast } from "sonner"
import { useRealtimeRun } from "@trigger.dev/react-hooks"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { VideoProject, VideoClip, MusicTrack, VideoProjectStatus } from "@/lib/db/schema"
import { VIDEO_ROOM_TYPES } from "@/lib/video/room-sequence"
import { formatVideoCost } from "@/lib/video/video-constants"
import { cn } from "@/lib/utils"
import { deleteVideoProject, retryFailedClip } from "@/lib/actions/video"
import type { generateVideoTask } from "@/trigger/video-orchestrator"

const statusConfig: Record<
  VideoProjectStatus,
  {
    label: string
    variant: "status-active" | "status-pending" | "status-completed" | "destructive"
    icon: React.ReactNode
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
}

const clipStatusConfig = {
  pending: { label: "Pending", color: "bg-muted" },
  processing: { label: "Processing", color: "bg-[var(--accent-teal)]" },
  completed: { label: "Completed", color: "bg-[var(--accent-green)]" },
  failed: { label: "Failed", color: "bg-destructive" },
}

// Real-time progress component for video generation
function RealtimeVideoProgress({
  runId,
  accessToken,
  clipCount,
}: {
  runId?: string
  accessToken?: string | null
  clipCount: number
}) {
  const { run } = useRealtimeRun<typeof generateVideoTask>(runId ?? "", {
    accessToken: accessToken ?? "",
    enabled: !!runId && !!accessToken,
  })

  // Metadata is nested under "status" key from the orchestrator
  const metadata = run?.metadata as {
    status?: {
      step?: string
      label?: string
      clipIndex?: number
      totalClips?: number
      progress?: number
    }
  } | undefined
  const status = metadata?.status
  const step = status?.step || "generating"
  const currentClip = status?.clipIndex || 0
  const total = status?.totalClips || clipCount
  const progressFromMetadata = status?.progress

  // Use metadata progress if available, otherwise calculate from clips
  const progress = progressFromMetadata ?? (step === "compiling" ? 70 : Math.round((currentClip / total) * 100))

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-teal)]/10">
            <IconLoader2 className="h-5 w-5 animate-spin text-[var(--accent-teal)]" />
          </div>
          <div>
            <div className="font-medium">
              {status?.label || (step === "compiling" ? "Compiling video…" : `Generating clip ${currentClip} of ${total}`)}
            </div>
            <div className="text-sm text-muted-foreground">
              {step === "starting"
                ? "Preparing video generation"
                : step === "compiling"
                  ? "Adding transitions and music"
                  : step === "completed"
                    ? "Your video is ready"
                    : "Creating cinematic clips from your images"}
            </div>
          </div>
        </div>
        <span className="text-2xl font-bold text-[var(--accent-teal)]">{progress}%</span>
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
  )
}

// Video Player Component
function VideoPlayer({
  videoUrl,
  thumbnailUrl,
}: {
  videoUrl: string
  thumbnailUrl: string | null
}) {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const [volume, setVolume] = React.useState(1)
  const [isMuted, setIsMuted] = React.useState(false)
  const [showControls, setShowControls] = React.useState(true)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const handleVolumeChange = (value: number[]) => {
    if (videoRef.current) {
      const newVolume = value[0]
      videoRef.current.volume = newVolume
      setVolume(newVolume)
      setIsMuted(newVolume === 0)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        videoRef.current.requestFullscreen()
      }
    }
  }

  return (
    <div
      className="relative aspect-video overflow-hidden rounded-xl bg-black"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => !isPlaying && setShowControls(true)}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        poster={thumbnailUrl || undefined}
        className="h-full w-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onClick={togglePlay}
      />

      {/* Play overlay when paused */}
      {!isPlaying && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
          onClick={togglePlay}
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/90 shadow-xl hover:scale-105 transition-transform">
            <IconPlayerPlay className="h-10 w-10 text-black ml-1" />
          </div>
        </div>
      )}

      {/* Controls */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Progress bar */}
        <Slider
          value={[currentTime]}
          onValueChange={handleSeek}
          max={duration || 100}
          step={0.1}
          className="mb-3"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
            >
              {isPlaying ? (
                <IconPlayerPause className="h-4 w-4" />
              ) : (
                <IconPlayerPlay className="h-4 w-4 ml-0.5" />
              )}
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="text-white hover:text-white/80"
              >
                {isMuted ? (
                  <IconVolumeOff className="h-5 w-5" />
                ) : (
                  <IconVolume className="h-5 w-5" />
                )}
              </button>
              <Slider
                value={[isMuted ? 0 : volume]}
                onValueChange={handleVolumeChange}
                max={1}
                step={0.1}
                className="w-20"
              />
            </div>

            <span className="text-sm text-white font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="text-white hover:text-white/80"
          >
            <IconMaximize className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

interface VideoDetailContentProps {
  videoProject: VideoProject
  clips: VideoClip[]
  musicTrack: MusicTrack | null
}

export function VideoDetailContent({
  videoProject,
  clips,
  musicTrack,
}: VideoDetailContentProps) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const status = statusConfig[videoProject.status]
  const isProcessing = videoProject.status === "generating" || videoProject.status === "compiling"
  const isCompleted = videoProject.status === "completed"
  const isFailed = videoProject.status === "failed"

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteVideoProject(videoProject.id)
      if (result.success) {
        toast.success("Video deleted")
        router.push("/video")
      } else {
        throw new Error("Failed to delete video")
      }
    } catch {
      toast.error("Failed to delete video")
      setIsDeleting(false)
    }
  }

  const handleDownload = async () => {
    if (!videoProject.finalVideoUrl) return

    try {
      const response = await fetch(videoProject.finalVideoUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${videoProject.name.replace(/[^a-z0-9]/gi, "_")}.mp4`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success("Download started")
    } catch {
      toast.error("Failed to download video")
    }
  }

  const handleRetryClip = async (clipId: string) => {
    try {
      const result = await retryFailedClip(clipId)
      if (result.success) {
        toast.success("Retry started")
        router.refresh()
      } else {
        throw new Error("Failed to retry clip")
      }
    } catch {
      toast.error("Failed to retry clip")
    }
  }

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/video">
                <IconArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">{videoProject.name}</h1>
                <Badge variant={status.variant} className="gap-1.5">
                  {status.icon}
                  {status.label}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Created {format(new Date(videoProject.createdAt), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isCompleted && videoProject.finalVideoUrl && (
              <Button onClick={handleDownload} className="gap-2" style={{ backgroundColor: "var(--accent-teal)" }}>
                <IconDownload className="h-4 w-4" />
                Download
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(true)}
              className="gap-2 text-destructive hover:text-destructive"
            >
              <IconTrash className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player or Progress */}
            {isProcessing ? (
              <RealtimeVideoProgress
                runId={videoProject.triggerRunId || undefined}
                accessToken={videoProject.triggerAccessToken}
                clipCount={videoProject.clipCount}
              />
            ) : isCompleted && videoProject.finalVideoUrl ? (
              <VideoPlayer
                videoUrl={videoProject.finalVideoUrl}
                thumbnailUrl={videoProject.thumbnailUrl}
              />
            ) : isFailed ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
                <IconAlertTriangle className="mx-auto h-12 w-12 text-destructive" />
                <h3 className="mt-4 font-semibold text-destructive">Video Generation Failed</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                  {videoProject.errorMessage || "An error occurred during video generation. You can retry failed clips below."}
                </p>
              </div>
            ) : (
              <div className="aspect-video rounded-xl border-2 border-dashed flex items-center justify-center bg-muted/30">
                <div className="text-center">
                  <IconMovie className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">Video not yet generated</p>
                </div>
              </div>
            )}

            {/* Clips Grid */}
            <div>
              <h3 className="mb-4 font-medium flex items-center gap-2">
                <IconPhoto className="h-4 w-4" />
                Video Clips ({clips.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {clips.map((clip, index) => {
                  const roomConfig = VIDEO_ROOM_TYPES.find((r) => r.id === clip.roomType)
                  const clipStatus = clipStatusConfig[clip.status]

                  return (
                    <div
                      key={clip.id}
                      className={cn(
                        "relative overflow-hidden rounded-xl border bg-card",
                        clip.status === "processing" && "ring-2 ring-[var(--accent-teal)]",
                        clip.status === "failed" && "ring-2 ring-destructive"
                      )}
                    >
                      {/* Thumbnail */}
                      <div className="relative aspect-video bg-muted">
                        <Image
                          src={clip.sourceImageUrl}
                          alt={clip.roomLabel || roomConfig?.label || `Clip ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 50vw, 33vw"
                        />

                        {/* Sequence number */}
                        <div className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs font-bold text-white">
                          {index + 1}
                        </div>

                        {/* Status indicator */}
                        <div className="absolute top-2 right-2">
                          <div className={cn("h-2.5 w-2.5 rounded-full", clipStatus.color)} />
                        </div>

                        {/* Processing shimmer */}
                        {clip.status === "processing" && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                        )}

                        {/* Retry button for failed clips */}
                        {clip.status === "failed" && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleRetryClip(clip.id)}
                              className="gap-1"
                            >
                              <IconRefresh className="h-3.5 w-3.5" />
                              Retry
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-2.5">
                        <div className="text-sm font-medium truncate">
                          {clip.roomLabel || roomConfig?.label || "Unknown"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {clip.durationSeconds || 5}s • {clipStatus.label}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Video Info */}
            <div className="rounded-xl border bg-card p-5">
              <h3 className="font-medium mb-4">Video Details</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Aspect Ratio</dt>
                  <dd className="font-medium flex items-center gap-1.5">
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
                <div className="border-t pt-3 flex justify-between">
                  <dt className="text-muted-foreground">Cost</dt>
                  <dd className="font-bold" style={{ color: "var(--accent-amber)" }}>
                    {formatVideoCost(videoProject.actualCost ? videoProject.actualCost / 100 : videoProject.estimatedCost / 100)}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Music Info */}
            <div className="rounded-xl border bg-card p-5">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <IconMusic className="h-4 w-4" />
                Background Music
              </h3>
              {musicTrack ? (
                <div>
                  <div className="font-medium">{musicTrack.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {musicTrack.artist} • {musicTrack.category}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Volume: {videoProject.musicVolume}%
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No background music</div>
              )}
            </div>

            {/* Progress Stats */}
            {isProcessing && (
              <div className="rounded-xl border bg-card p-5">
                <h3 className="font-medium mb-4">Generation Progress</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Completed Clips</span>
                    <span className="font-medium text-[var(--accent-green)]">
                      {videoProject.completedClipCount} / {videoProject.clipCount}
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
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{videoProject.name}&quot; and all its clips.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
  )
}
