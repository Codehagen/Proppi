"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import {
  IconArrowLeft,
  IconDownload,
  IconPhoto,
  IconSparkles,
  IconClock,
  IconCheck,
  IconLoader2,
  IconAlertTriangle,
  IconArrowsMaximize,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Project, ImageGeneration, ProjectStatus } from "@/lib/db/schema"
import { getTemplateById } from "@/lib/style-templates"
import { cn } from "@/lib/utils"

const statusConfig: Record<
  ProjectStatus,
  {
    label: string
    variant: "status-active" | "status-pending" | "status-completed" | "status-archived"
    icon: React.ReactNode
  }
> = {
  completed: {
    label: "Completed",
    variant: "status-completed",
    icon: <IconCheck className="h-3 w-3" />,
  },
  processing: {
    label: "Processing",
    variant: "status-active",
    icon: <IconLoader2 className="h-3 w-3 animate-spin" />,
  },
  pending: {
    label: "Pending",
    variant: "status-pending",
    icon: <IconClock className="h-3 w-3" />,
  },
  failed: {
    label: "Failed",
    variant: "status-archived",
    icon: <IconAlertTriangle className="h-3 w-3" />,
  },
}

function ImageCard({
  image,
  index,
  onSelect,
}: {
  image: ImageGeneration
  index: number
  onSelect: () => void
}) {
  const isCompleted = image.status === "completed"
  const displayUrl = isCompleted && image.resultImageUrl ? image.resultImageUrl : image.originalImageUrl

  return (
    <button
      onClick={onSelect}
      className={cn(
        "animate-fade-in-up group relative aspect-square overflow-hidden rounded-xl bg-muted ring-1 ring-foreground/5 transition-all duration-200",
        "hover:ring-foreground/10 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-teal)]"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <Image
        src={displayUrl}
        alt={`Image ${index + 1}`}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      />

      {/* Status overlay for non-completed */}
      {!isCompleted && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          {image.status === "processing" ? (
            <div className="flex flex-col items-center gap-2">
              <IconLoader2 className="h-8 w-8 animate-spin text-white" />
              <span className="text-sm font-medium text-white">Processing…</span>
            </div>
          ) : image.status === "pending" ? (
            <div className="flex flex-col items-center gap-2">
              <IconClock className="h-8 w-8 text-white/70" />
              <span className="text-sm font-medium text-white/70">Pending</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <IconAlertTriangle className="h-8 w-8 text-red-400" />
              <span className="text-sm font-medium text-red-400">Failed</span>
            </div>
          )}
        </div>
      )}

      {/* Hover overlay */}
      {isCompleted && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/40 group-hover:opacity-100">
          <IconArrowsMaximize className="h-8 w-8 text-white" />
        </div>
      )}

      {/* Image number */}
      <div className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
        {index + 1}
      </div>

      {/* Completed badge */}
      {isCompleted && (
        <div className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 shadow-md">
          <IconCheck className="h-3.5 w-3.5 text-white" />
        </div>
      )}
    </button>
  )
}

function ComparisonView({
  originalUrl,
  enhancedUrl,
  onClose,
}: {
  originalUrl: string
  enhancedUrl: string
  onClose: () => void
}) {
  const [sliderPosition, setSliderPosition] = React.useState(50)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const handleMove = React.useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPosition(percentage)
  }, [])

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent) => {
      if (e.buttons !== 1) return
      handleMove(e.clientX)
    },
    [handleMove]
  )

  const handleTouchMove = React.useCallback(
    (e: React.TouchEvent) => {
      handleMove(e.touches[0].clientX)
    },
    [handleMove]
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <button
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
        aria-label="Close comparison view"
      >
        <IconArrowLeft className="h-6 w-6" />
      </button>

      <div
        ref={containerRef}
        className="relative aspect-[4/3] w-full max-w-4xl cursor-col-resize overflow-hidden rounded-2xl"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onMouseDown={(e) => handleMove(e.clientX)}
        onTouchStart={(e) => handleMove(e.touches[0].clientX)}
      >
        {/* Enhanced image (full width) */}
        <Image src={enhancedUrl} alt="Enhanced" fill className="object-cover" />

        {/* Original image (clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <Image src={originalUrl} alt="Original" fill className="object-cover" />
        </div>

        {/* Slider line */}
        <div
          className="absolute bottom-0 top-0 w-1 bg-white shadow-lg"
          style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
        >
          <div className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg">
            <div className="flex gap-0.5">
              <IconArrowLeft className="h-4 w-4 text-foreground" />
              <IconArrowLeft className="h-4 w-4 rotate-180 text-foreground" />
            </div>
          </div>
        </div>

        {/* Labels */}
        <div className="pointer-events-none absolute bottom-4 left-4 rounded-full bg-black/60 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
          Original
        </div>
        <div className="pointer-events-none absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
          Enhanced
        </div>
      </div>
    </div>
  )
}

interface ProjectDetailContentProps {
  project: Project
  images: ImageGeneration[]
}

export function ProjectDetailContent({ project, images }: ProjectDetailContentProps) {
  const [selectedImage, setSelectedImage] = React.useState<ImageGeneration | null>(null)

  const template = getTemplateById(project.styleTemplateId)
  const status = statusConfig[project.status as ProjectStatus] || statusConfig.pending
  const completedImages = images.filter((img) => img.status === "completed")

  return (
    <>
      <div className="space-y-6 px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="animate-fade-in-up flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon" className="shrink-0">
              <Link href="/dashboard">
                <IconArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
                <Badge variant={status.variant} className="gap-1">
                  {status.icon}
                  {status.label}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {template?.name || "Unknown Style"} • {project.imageCount} image
                {project.imageCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {completedImages.length > 0 && (
            <Button className="gap-2" style={{ backgroundColor: "var(--accent-teal)" }}>
              <IconDownload className="h-4 w-4" />
              Download All
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="animate-fade-in-up stagger-1 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="stats-card flex items-center gap-3 rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/5">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{
                backgroundColor: "color-mix(in oklch, var(--accent-teal) 15%, transparent)",
              }}
            >
              <IconPhoto className="h-4 w-4" style={{ color: "var(--accent-teal)" }} />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Total
              </p>
              <p
                className="font-mono text-lg font-semibold tabular-nums"
                style={{ color: "var(--accent-teal)" }}
              >
                {project.imageCount}
              </p>
            </div>
          </div>

          <div className="stats-card flex items-center gap-3 rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/5">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{
                backgroundColor: "color-mix(in oklch, var(--accent-green) 15%, transparent)",
              }}
            >
              <IconCheck className="h-4 w-4" style={{ color: "var(--accent-green)" }} />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Completed
              </p>
              <p
                className="font-mono text-lg font-semibold tabular-nums"
                style={{ color: "var(--accent-green)" }}
              >
                {project.completedCount}
              </p>
            </div>
          </div>

          <div className="stats-card flex items-center gap-3 rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/5">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{
                backgroundColor: "color-mix(in oklch, var(--accent-teal) 15%, transparent)",
              }}
            >
              <IconSparkles className="h-4 w-4" style={{ color: "var(--accent-teal)" }} />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Style
              </p>
              <p className="text-sm font-medium text-foreground truncate max-w-[120px]">
                {template?.name || "Unknown"}
              </p>
            </div>
          </div>

          <div className="stats-card flex items-center gap-3 rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/5">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{
                backgroundColor: "color-mix(in oklch, var(--accent-amber) 15%, transparent)",
              }}
            >
              <IconClock className="h-4 w-4" style={{ color: "var(--accent-amber)" }} />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Created
              </p>
              <p className="text-sm font-medium text-foreground">
                {project.createdAt.toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Image grid */}
        <div className="animate-fade-in-up stagger-2">
          <h2 className="mb-4 text-lg font-semibold">Images</h2>
          {images.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {images.map((image, index) => (
                <ImageCard
                  key={image.id}
                  image={image}
                  index={index}
                  onSelect={() => {
                    if (image.status === "completed" && image.resultImageUrl) {
                      setSelectedImage(image)
                    }
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-foreground/10 py-12 text-center">
              <IconPhoto className="h-12 w-12 text-muted-foreground/30" />
              <p className="mt-4 text-sm text-muted-foreground">No images in this project yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Comparison modal */}
      {selectedImage && selectedImage.resultImageUrl && (
        <ComparisonView
          originalUrl={selectedImage.originalImageUrl}
          enhancedUrl={selectedImage.resultImageUrl}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  )
}
