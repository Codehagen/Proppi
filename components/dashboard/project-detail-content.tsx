"use client";

import {
  IconAlertTriangle,
  IconArrowLeft,
  IconArrowsMaximize,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
  IconDownload,
  IconLoader2,
  IconPencil,
  IconPhoto,
  IconPlus,
  IconRefresh,
  IconSparkles,
  IconTrash,
  IconX,
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
import { deleteSelectedImages, retryImageProcessing } from "@/lib/actions";
import type { ImageGeneration, Project, ProjectStatus } from "@/lib/db/schema";
import { getTemplateById } from "@/lib/style-templates";
import { cn } from "@/lib/utils";
import type { processImageTask } from "@/trigger/process-image";
import { AddImagesDialog } from "./add-images-dialog";
import { ImageMaskEditor } from "./image-mask-editor";

const statusConfig: Record<
  ProjectStatus,
  {
    label: string;
    variant:
      | "status-active"
      | "status-pending"
      | "status-completed"
      | "status-archived";
    icon: React.ReactNode;
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
};

interface ImageGroup {
  rootId: string;
  versions: ImageGeneration[];
  latestVersion: ImageGeneration;
}

// Component to show realtime processing status
function RealtimeProcessingLabel({
  runId,
  accessToken,
  fallback = "Enhancing…",
  onComplete,
}: {
  runId?: string;
  accessToken?: string | null;
  fallback?: string;
  onComplete?: () => void;
}) {
  const { run } = useRealtimeRun<typeof processImageTask>(runId ?? "", {
    accessToken: accessToken ?? "",
    enabled: !!runId && !!accessToken,
  });

  // Track completion
  const prevStatusRef = React.useRef<string | undefined>();
  React.useEffect(() => {
    const currentStatus = run?.status;
    if (prevStatusRef.current !== currentStatus) {
      if (
        currentStatus === "COMPLETED" &&
        prevStatusRef.current &&
        prevStatusRef.current !== "COMPLETED"
      ) {
        onComplete?.();
      }
      prevStatusRef.current = currentStatus;
    }
  }, [run?.status, onComplete]);

  if (!(runId && accessToken)) {
    return <span className="font-medium text-sm text-white">{fallback}</span>;
  }

  const status = run?.metadata?.status as
    | { label?: string; progress?: number }
    | undefined;
  const label = status?.label || fallback;

  return <span className="font-medium text-sm text-white">{label}</span>;
}

function ImageCard({
  image,
  index,
  onCompare,
  onEdit,
  onRetry,
  onDownload,
  onToggleSelect,
  isRetrying,
  isSelected,
  versionCount,
  onVersionClick,
  runId,
  accessToken,
  onProcessingComplete,
}: {
  image: ImageGeneration;
  index: number;
  onCompare: () => void;
  onEdit: () => void;
  onRetry: () => void;
  onDownload: () => void;
  onToggleSelect: () => void;
  isRetrying: boolean;
  isSelected: boolean;
  versionCount?: number;
  onVersionClick?: () => void;
  runId?: string;
  accessToken?: string | null;
  onProcessingComplete?: () => void;
}) {
  const isCompleted = image.status === "completed";
  const displayUrl =
    isCompleted && image.resultImageUrl
      ? image.resultImageUrl
      : image.originalImageUrl;
  const hasMultipleVersions = versionCount && versionCount > 1;

  return (
    <div
      className={cn(
        "group relative aspect-square animate-fade-in-up overflow-hidden rounded-xl bg-muted ring-1 transition-all duration-200",
        isCompleted &&
          !isSelected &&
          "ring-foreground/5 hover:shadow-lg hover:ring-foreground/10",
        isSelected && "shadow-lg ring-2 ring-[var(--accent-teal)]"
      )}
      onClick={() => {
        if (isCompleted) {
          onToggleSelect();
        }
      }}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <Image
        alt={`Image ${index + 1}`}
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        src={displayUrl}
      />

      {/* Status overlay for non-completed */}
      {!isCompleted && (
        <>
          {/* Shimmer effect for processing */}
          {image.status === "processing" && (
            <div className="image-shimmer absolute inset-0 bg-black/30" />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            {image.status === "processing" ? (
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full border-2 border-white/20" />
                  <div className="absolute inset-0 h-12 w-12 animate-spin rounded-full border-2 border-transparent border-t-white" />
                </div>
                <RealtimeProcessingLabel
                  accessToken={accessToken}
                  fallback="Enhancing…"
                  onComplete={onProcessingComplete}
                  runId={runId}
                />
              </div>
            ) : image.status === "pending" ? (
              <div className="flex flex-col items-center gap-2">
                <IconClock className="h-8 w-8 text-white/70" />
                <span className="font-medium text-sm text-white/70">
                  Queued
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <IconAlertTriangle className="h-8 w-8 text-red-400" />
                <span className="font-medium text-red-400 text-sm">Failed</span>
                <Button
                  className="mt-1 gap-1.5 bg-white/90 text-foreground hover:bg-white"
                  disabled={isRetrying}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRetry();
                  }}
                  size="sm"
                  variant="secondary"
                >
                  {isRetrying ? (
                    <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <IconRefresh className="h-3.5 w-3.5" />
                  )}
                  Retry
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Selection indicator */}
      {isCompleted && (
        <div
          className={cn(
            "absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all",
            isSelected
              ? "border-[var(--accent-teal)] bg-[var(--accent-teal)]"
              : "border-white/50 bg-black/20 opacity-0 group-hover:opacity-100"
          )}
        >
          {isSelected && <IconCheck className="h-3.5 w-3.5 text-white" />}
        </div>
      )}

      {/* Hover overlay for completed images */}
      {isCompleted && (
        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/40 group-hover:opacity-100">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-teal)]"
            onClick={(e) => {
              e.stopPropagation();
              onCompare();
            }}
            title="Compare"
          >
            <IconArrowsMaximize className="h-5 w-5" />
          </button>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-teal)]"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            title="Edit"
          >
            <IconPencil className="h-5 w-5" />
          </button>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-teal)]"
            onClick={(e) => {
              e.stopPropagation();
              onDownload();
            }}
            title="Download"
          >
            <IconDownload className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Image number */}
      <div className="absolute right-2 bottom-2 rounded-full bg-black/60 px-2 py-1 font-medium text-white text-xs backdrop-blur-sm">
        {index + 1}
      </div>

      {/* Version badge - show if multiple versions exist */}
      {hasMultipleVersions && (
        <button
          className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-purple-500 px-2 py-1 font-medium text-white text-xs shadow-md transition-colors hover:bg-purple-600"
          onClick={(e) => {
            e.stopPropagation();
            onVersionClick?.();
          }}
          title={`${versionCount} versions available`}
        >
          v{image.version || 1}
          <span className="text-white/70">/{versionCount}</span>
        </button>
      )}
    </div>
  );
}

function VersionSelector({
  versions,
  initialVersion,
  onSelect,
  onEdit,
  onClose,
}: {
  versions: ImageGeneration[];
  initialVersion: ImageGeneration;
  onSelect: (image: ImageGeneration) => void;
  onEdit: (image: ImageGeneration) => void;
  onClose: () => void;
}) {
  const [selectedVersion, setSelectedVersion] = React.useState(initialVersion);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-2xl rounded-2xl bg-card p-6 shadow-xl">
        <button
          aria-label="Close"
          className="absolute top-4 right-4 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          onClick={onClose}
        >
          <IconArrowLeft className="h-5 w-5" />
        </button>

        <h3 className="mb-4 font-semibold text-lg">Version History</h3>
        <p className="mb-4 text-muted-foreground text-sm">
          Click on a version to select it, then compare or edit.
        </p>

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {versions.map((version) => {
            const isSelected = version.id === selectedVersion.id;
            const displayUrl =
              version.resultImageUrl || version.originalImageUrl;
            return (
              <button
                className={cn(
                  "group relative aspect-square overflow-hidden rounded-lg ring-2 transition-all",
                  isSelected
                    ? "ring-purple-500"
                    : "ring-transparent hover:ring-foreground/20"
                )}
                key={version.id}
                onClick={() => setSelectedVersion(version)}
              >
                <Image
                  alt={`Version ${version.version || 1}`}
                  className="object-cover"
                  fill
                  sizes="150px"
                  src={displayUrl}
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <span className="font-medium text-white text-xs">
                    v{version.version || 1}
                  </span>
                </div>
                {isSelected && (
                  <div className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-purple-500">
                    <IconCheck className="h-3 w-3 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
          <Button
            className="gap-2"
            onClick={() => {
              onSelect(selectedVersion);
              onClose();
            }}
            variant="outline"
          >
            <IconArrowsMaximize className="h-4 w-4" />
            Compare
          </Button>
          {selectedVersion.status === "completed" && (
            <Button
              className="gap-2"
              onClick={() => {
                onEdit(selectedVersion);
                onClose();
              }}
            >
              <IconPencil className="h-4 w-4" />
              Edit v{selectedVersion.version || 1}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function ComparisonView({
  originalUrl,
  enhancedUrl,
  onClose,
}: {
  originalUrl: string;
  enhancedUrl: string;
  onClose: () => void;
}) {
  const [sliderPosition, setSliderPosition] = React.useState(50);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleMove = React.useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent) => {
      if (e.buttons !== 1) return;
      handleMove(e.clientX);
    },
    [handleMove]
  );

  const handleTouchMove = React.useCallback(
    (e: React.TouchEvent) => {
      handleMove(e.touches[0].clientX);
    },
    [handleMove]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <button
        aria-label="Close comparison view"
        className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
        onClick={onClose}
      >
        <IconArrowLeft className="h-6 w-6" />
      </button>

      <div
        className="relative aspect-[4/3] w-full max-w-4xl cursor-col-resize overflow-hidden rounded-2xl"
        onMouseDown={(e) => handleMove(e.clientX)}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onTouchStart={(e) => handleMove(e.touches[0].clientX)}
        ref={containerRef}
      >
        {/* Enhanced image (full width) */}
        <Image alt="Enhanced" className="object-cover" fill src={enhancedUrl} />

        {/* Original image (clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <Image
            alt="Original"
            className="object-cover"
            fill
            src={originalUrl}
          />
        </div>

        {/* Slider line */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
          style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
        >
          <div className="absolute top-1/2 left-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg">
            <div className="flex gap-0.5">
              <IconArrowLeft className="h-4 w-4 text-foreground" />
              <IconArrowLeft className="h-4 w-4 rotate-180 text-foreground" />
            </div>
          </div>
        </div>

        {/* Labels */}
        <div className="pointer-events-none absolute bottom-4 left-4 rounded-full bg-black/60 px-3 py-1.5 font-medium text-sm text-white backdrop-blur-sm">
          Original
        </div>
        <div className="pointer-events-none absolute right-4 bottom-4 rounded-full bg-black/60 px-3 py-1.5 font-medium text-sm text-white backdrop-blur-sm">
          Enhanced
        </div>
      </div>
    </div>
  );
}

function ImageLightbox({
  images,
  currentIndex,
  onClose,
  onNavigate,
  onEdit,
  onDownload,
  onCompare,
}: {
  images: ImageGroup[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onEdit: (image: ImageGeneration) => void;
  onDownload: (image: ImageGeneration) => void;
  onCompare: (image: ImageGeneration) => void;
}) {
  const currentGroup = images[currentIndex];
  const currentImage = currentGroup?.latestVersion;
  const displayUrl =
    currentImage?.resultImageUrl || currentImage?.originalImageUrl;
  const hasEnhancedVersion =
    currentImage?.resultImageUrl && currentImage.originalImageUrl;

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && currentIndex > 0) {
        onNavigate(currentIndex - 1);
      } else if (e.key === "ArrowRight" && currentIndex < images.length - 1) {
        onNavigate(currentIndex + 1);
      } else if (e.key === "Escape") {
        onClose();
      } else if (e.key === "c" && hasEnhancedVersion) {
        onCompare(currentImage);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    currentIndex,
    images.length,
    onNavigate,
    onClose,
    onCompare,
    currentImage,
    hasEnhancedVersion,
  ]);

  if (!(currentImage && displayUrl)) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-white/70">
            {currentIndex + 1} / {images.length}
          </span>
          {currentGroup.versions.length > 1 && (
            <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-purple-300 text-xs">
              v{currentImage.version || 1}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasEnhancedVersion && (
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              onClick={() => onCompare(currentImage)}
              title="Compare (C)"
            >
              <IconArrowsMaximize className="h-5 w-5" />
            </button>
          )}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            onClick={() => onDownload(currentImage)}
            title="Download"
          >
            <IconDownload className="h-5 w-5" />
          </button>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            onClick={() => onEdit(currentImage)}
            title="Edit"
          >
            <IconPencil className="h-5 w-5" />
          </button>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            onClick={onClose}
            title="Close (Esc)"
          >
            <IconX className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main image area */}
      <div className="relative flex flex-1 items-center justify-center px-16">
        {/* Previous button */}
        {currentIndex > 0 && (
          <button
            className="absolute left-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            onClick={() => onNavigate(currentIndex - 1)}
          >
            <IconChevronLeft className="h-6 w-6" />
          </button>
        )}

        {/* Image */}
        <div className="relative h-full w-full max-w-5xl">
          <Image
            alt={`Image ${currentIndex + 1}`}
            className="object-contain"
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
            src={displayUrl}
          />
        </div>

        {/* Next button */}
        {currentIndex < images.length - 1 && (
          <button
            className="absolute right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            onClick={() => onNavigate(currentIndex + 1)}
          >
            <IconChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Filmstrip */}
      <div className="flex justify-center gap-2 overflow-x-auto px-4 py-4">
        {images.map((group, index) => {
          const thumbUrl =
            group.latestVersion.resultImageUrl ||
            group.latestVersion.originalImageUrl;
          const isActive = index === currentIndex;
          return (
            <button
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg ring-2 transition-all",
                isActive
                  ? "ring-white"
                  : "opacity-50 ring-transparent hover:opacity-80"
              )}
              key={group.rootId}
              onClick={() => onNavigate(index)}
            >
              <Image
                alt={`Thumbnail ${index + 1}`}
                className="object-cover"
                fill
                sizes="64px"
                src={thumbUrl}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface ProjectDetailContentProps {
  project: Project;
  images: ImageGeneration[];
}

export function ProjectDetailContent({
  project,
  images,
}: ProjectDetailContentProps) {
  const router = useRouter();
  const [selectedImage, setSelectedImage] =
    React.useState<ImageGeneration | null>(null);
  const [editingImage, setEditingImage] =
    React.useState<ImageGeneration | null>(null);
  const [editingImageLatestVersion, setEditingImageLatestVersion] =
    React.useState<number>(1);
  const [addImagesOpen, setAddImagesOpen] = React.useState(false);
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null);
  const [retryingImageId, setRetryingImageId] = React.useState<string | null>(
    null
  );
  const [versionSelectorGroup, setVersionSelectorGroup] =
    React.useState<ImageGroup | null>(null);
  const [selectedImageIds, setSelectedImageIds] = React.useState<Set<string>>(
    new Set()
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  // Real-time run tracking for processing images
  const [runIds, setRunIds] = React.useState<Map<string, string>>(() => {
    // Extract runIds from processing images on initial load
    const initialRunIds = new Map<string, string>();
    for (const img of images) {
      if (img.status === "processing" || img.status === "pending") {
        const metadata = img.metadata as { runId?: string } | null;
        if (metadata?.runId) {
          initialRunIds.set(img.id, metadata.runId);
        }
      }
    }
    return initialRunIds;
  });
  const [accessToken, setAccessToken] = React.useState<string | null>(null);

  // Update runIds when images change (e.g., after server refresh with new processing images)
  React.useEffect(() => {
    setRunIds((prevRunIds) => {
      const newRunIds = new Map<string, string>();
      for (const img of images) {
        if (img.status === "processing" || img.status === "pending") {
          const metadata = img.metadata as { runId?: string } | null;
          if (metadata?.runId) {
            newRunIds.set(img.id, metadata.runId);
          }
        }
      }
      // Only update if there are actual changes
      if (newRunIds.size === prevRunIds.size) {
        let same = true;
        for (const [key, value] of newRunIds) {
          if (prevRunIds.get(key) !== value) {
            same = false;
            break;
          }
        }
        if (same) return prevRunIds;
      }
      return newRunIds;
    });
  }, [images]);

  const template = getTemplateById(project.styleTemplateId);
  const status =
    statusConfig[project.status as ProjectStatus] || statusConfig.pending;
  const completedImages = images.filter((img) => img.status === "completed");

  // Group images by their root ID (original image or first in version chain)
  const imageGroups = React.useMemo(() => {
    const grouped = new Map<string, ImageGeneration[]>();

    for (const img of images) {
      const rootId = img.parentId || img.id;
      if (!grouped.has(rootId)) {
        grouped.set(rootId, []);
      }
      grouped.get(rootId)!.push(img);
    }

    // Sort each group by version and create ImageGroup objects
    const groups: ImageGroup[] = [];
    for (const [rootId, versions] of grouped) {
      versions.sort((a, b) => (a.version || 1) - (b.version || 1));
      const latestVersion = versions[versions.length - 1];
      groups.push({ rootId, versions, latestVersion });
    }

    // Sort groups by the latest version's creation date (most recent first)
    groups.sort(
      (a, b) =>
        new Date(b.latestVersion.createdAt).getTime() -
        new Date(a.latestVersion.createdAt).getTime()
    );

    return groups;
  }, [images]);

  // Count only root images (not versions) for the "add more" limit
  const rootImageCount = imageGroups.length;
  const canAddMore = rootImageCount < 10;

  // Helper to start editing an image with version info
  const startEditing = React.useCallback(
    (image: ImageGeneration) => {
      const rootId = image.parentId || image.id;
      const group = imageGroups.find((g) => g.rootId === rootId);
      const latestVersion = group
        ? Math.max(...group.versions.map((v) => v.version || 1))
        : 1;
      setEditingImage(image);
      setEditingImageLatestVersion(latestVersion);
    },
    [imageGroups]
  );

  const handleRetry = async (imageId: string) => {
    setRetryingImageId(imageId);
    try {
      const result = await retryImageProcessing(imageId);
      if (result.success && result.data.runId) {
        // Store the run ID for real-time tracking
        setRunIds((prev) => new Map(prev).set(imageId, result.data.runId!));
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to retry:", error);
    } finally {
      setRetryingImageId(null);
    }
  };

  const toggleImageSelection = React.useCallback((imageId: string) => {
    setSelectedImageIds((prev) => {
      const next = new Set(prev);
      if (next.has(imageId)) {
        next.delete(imageId);
      } else {
        next.add(imageId);
      }
      return next;
    });
  }, []);

  const clearSelection = React.useCallback(() => {
    setSelectedImageIds(new Set());
  }, []);

  const handleDeleteSelected = async () => {
    if (selectedImageIds.size === 0) return;

    const count = selectedImageIds.size;
    setDeleteDialogOpen(false);

    const deletePromise = deleteSelectedImages(Array.from(selectedImageIds));

    toast.promise(deletePromise, {
      loading: `Deleting ${count} image${count !== 1 ? "s" : ""}…`,
      success: (result) => {
        if (result.success) {
          clearSelection();
          router.refresh();
          return `Deleted ${result.data?.deletedCount || count} image${(result.data?.deletedCount || count) !== 1 ? "s" : ""}`;
        }
        throw new Error(result.error || "Delete failed");
      },
      error: (err) => err?.message || "Failed to delete images",
    });
  };

  const handleDownload = () => {
    const hasSelection = selectedImageIds.size > 0;
    const count = hasSelection ? selectedImageIds.size : completedImages.length;

    const downloadPromise = new Promise<void>((resolve, reject) => {
      try {
        const url = hasSelection
          ? `/api/download/${project.id}?imageIds=${Array.from(selectedImageIds).join(",")}`
          : `/api/download/${project.id}`;

        window.location.href = url;

        // Clear selection and resolve after download starts
        setTimeout(() => {
          if (hasSelection) clearSelection();
          resolve();
        }, 1000);
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(downloadPromise, {
      loading: `Preparing ${count} image${count !== 1 ? "s" : ""} for download…`,
      success: "Download started",
      error: "Download failed",
    });
  };

  const handleDownloadSingle = async (image: ImageGeneration) => {
    const imageUrl = image.resultImageUrl || image.originalImageUrl;
    if (!imageUrl) return;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Get filename from metadata or generate one
      const metadata = image.metadata as { originalFileName?: string } | null;
      const originalName = metadata?.originalFileName || `image-${image.id}`;
      const extension = imageUrl.split(".").pop()?.split("?")[0] || "jpg";
      const baseName = originalName.replace(/\.[^/.]+$/, "");
      const versionSuffix =
        (image.version || 1) > 1 ? `-v${image.version}` : "";
      a.download = `${baseName}${versionSuffix}.${extension}`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  // Fetch access token when we have run IDs to track
  React.useEffect(() => {
    if (runIds.size === 0) return;

    const fetchToken = async () => {
      try {
        const response = await fetch("/api/trigger-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ runIds: Array.from(runIds.values()) }),
        });
        if (response.ok) {
          const data = await response.json();
          setAccessToken(data.token);
        }
      } catch (error) {
        console.error("Failed to fetch access token:", error);
      }
    };

    fetchToken();
  }, [runIds]);

  // Polling for processing images (fallback when we don't have realtime)
  React.useEffect(() => {
    const processingImages = images.filter(
      (img) => img.status === "processing" || img.status === "pending"
    );

    if (processingImages.length === 0) return;

    // Poll less frequently if we have realtime tracking
    const pollInterval = runIds.size > 0 ? 10_000 : 5000;

    const interval = setInterval(() => {
      router.refresh();
    }, pollInterval);

    return () => clearInterval(interval);
  }, [images, router, runIds.size]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Lightbox has its own keyboard handlers, don't duplicate
      if (lightboxIndex !== null) {
        return;
      }

      // Escape - clear selection or close modals
      if (e.key === "Escape") {
        if (versionSelectorGroup) {
          setVersionSelectorGroup(null);
        } else if (selectedImage) {
          setSelectedImage(null);
        } else if (editingImage) {
          setEditingImage(null);
        } else if (selectedImageIds.size > 0) {
          clearSelection();
        }
        return;
      }

      // A - select all completed images
      if (e.key === "a" && !e.metaKey && !e.ctrlKey) {
        const allCompletedIds = imageGroups
          .filter((g) => g.latestVersion.status === "completed")
          .map((g) => g.latestVersion.id);
        setSelectedImageIds(new Set(allCompletedIds));
        return;
      }

      // D - download
      if (e.key === "d" && !e.metaKey && !e.ctrlKey) {
        if (completedImages.length > 0) {
          handleDownload();
        }
        return;
      }

      // E - edit (only if exactly one image selected)
      if (e.key === "e" && !e.metaKey && !e.ctrlKey) {
        if (selectedImageIds.size === 1) {
          const selectedId = Array.from(selectedImageIds)[0];
          const group = imageGroups.find(
            (g) => g.latestVersion.id === selectedId
          );
          if (group && group.latestVersion.status === "completed") {
            startEditing(group.latestVersion);
          }
        }
        return;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedImageIds,
    selectedImage,
    editingImage,
    versionSelectorGroup,
    lightboxIndex,
    imageGroups,
    completedImages,
    clearSelection,
    handleDownload,
    startEditing,
  ]);

  return (
    <>
      <div className="space-y-6 px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="flex animate-fade-in-up flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button asChild className="shrink-0" size="icon" variant="ghost">
              <Link href="/dashboard">
                <IconArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-bold text-2xl tracking-tight">
                  {project.name}
                </h1>
                <Badge className="gap-1" variant={status.variant}>
                  {status.icon}
                  {status.label}
                </Badge>
              </div>
              <p className="mt-1 text-muted-foreground text-sm">
                {template?.name || "Unknown Style"} • {project.imageCount} image
                {project.imageCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canAddMore && (
              <Button
                className="gap-2"
                onClick={() => setAddImagesOpen(true)}
                variant="outline"
              >
                <IconPlus className="h-4 w-4" />
                Add More
              </Button>
            )}
            {completedImages.length > 0 && selectedImageIds.size === 0 && (
              <Button
                className="gap-2"
                onClick={handleDownload}
                style={{ backgroundColor: "var(--accent-teal)" }}
              >
                <IconDownload className="h-4 w-4" />
                Download All
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="stagger-1 grid animate-fade-in-up grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="stats-card flex items-center gap-3 rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/5">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{
                backgroundColor:
                  "color-mix(in oklch, var(--accent-teal) 15%, transparent)",
              }}
            >
              <IconPhoto
                className="h-4 w-4"
                style={{ color: "var(--accent-teal)" }}
              />
            </div>
            <div>
              <p className="font-medium text-[11px] text-muted-foreground uppercase tracking-wider">
                Total
              </p>
              <p
                className="font-mono font-semibold text-lg tabular-nums"
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
                backgroundColor:
                  "color-mix(in oklch, var(--accent-green) 15%, transparent)",
              }}
            >
              <IconCheck
                className="h-4 w-4"
                style={{ color: "var(--accent-green)" }}
              />
            </div>
            <div>
              <p className="font-medium text-[11px] text-muted-foreground uppercase tracking-wider">
                Completed
              </p>
              <p
                className="font-mono font-semibold text-lg tabular-nums"
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
                backgroundColor:
                  "color-mix(in oklch, var(--accent-teal) 15%, transparent)",
              }}
            >
              <IconSparkles
                className="h-4 w-4"
                style={{ color: "var(--accent-teal)" }}
              />
            </div>
            <div>
              <p className="font-medium text-[11px] text-muted-foreground uppercase tracking-wider">
                Style
              </p>
              <p className="max-w-[120px] truncate font-medium text-foreground text-sm">
                {template?.name || "Unknown"}
              </p>
            </div>
          </div>

          <div className="stats-card flex items-center gap-3 rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/5">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{
                backgroundColor:
                  "color-mix(in oklch, var(--accent-amber) 15%, transparent)",
              }}
            >
              <IconClock
                className="h-4 w-4"
                style={{ color: "var(--accent-amber)" }}
              />
            </div>
            <div>
              <p className="font-medium text-[11px] text-muted-foreground uppercase tracking-wider">
                Created
              </p>
              <p className="font-medium text-foreground text-sm">
                {format(project.createdAt, "MMM dd, yyyy")}
              </p>
            </div>
          </div>
        </div>

        {/* Image grid */}
        <div className="stagger-2 animate-fade-in-up">
          <h2 className="mb-4 font-semibold text-lg">Images</h2>
          {imageGroups.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {imageGroups.map((group, index) => (
                <ImageCard
                  accessToken={accessToken}
                  image={group.latestVersion}
                  index={index}
                  isRetrying={retryingImageId === group.latestVersion.id}
                  isSelected={selectedImageIds.has(group.latestVersion.id)}
                  key={group.rootId}
                  onCompare={() => {
                    if (group.latestVersion.status === "completed") {
                      setLightboxIndex(index);
                    }
                  }}
                  onDownload={() => handleDownloadSingle(group.latestVersion)}
                  onEdit={() => {
                    if (group.latestVersion.status === "completed") {
                      startEditing(group.latestVersion);
                    }
                  }}
                  onProcessingComplete={() => {
                    toast.success("Image processing complete!");
                    router.refresh();
                  }}
                  onRetry={() => handleRetry(group.latestVersion.id)}
                  onToggleSelect={() =>
                    toggleImageSelection(group.latestVersion.id)
                  }
                  onVersionClick={() => {
                    if (group.versions.length > 1) {
                      setVersionSelectorGroup(group);
                    }
                  }}
                  runId={runIds.get(group.latestVersion.id)}
                  versionCount={group.versions.length}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-foreground/10 border-dashed py-12 text-center">
              <IconPhoto className="h-12 w-12 text-muted-foreground/30" />
              <p className="mt-4 text-muted-foreground text-sm">
                No images in this project yet
              </p>
              <Button
                className="mt-4 gap-2"
                onClick={() => setAddImagesOpen(true)}
                variant="outline"
              >
                <IconPlus className="h-4 w-4" />
                Add Images
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Selection Bar */}
      {selectedImageIds.size > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex animate-slide-up items-center justify-center p-4">
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-card/95 px-6 py-3 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full"
                style={{ backgroundColor: "var(--accent-teal)" }}
              >
                <IconCheck className="h-4 w-4 text-white" />
              </div>
              <span className="font-medium">
                {selectedImageIds.size} selected
              </span>
            </div>

            <div className="h-6 w-px bg-border" />

            <div className="flex items-center gap-2">
              <Button
                className="gap-1.5 text-muted-foreground hover:text-foreground"
                onClick={clearSelection}
                size="sm"
                variant="ghost"
              >
                <IconX className="h-4 w-4" />
                Clear
              </Button>

              <Button
                className="gap-1.5 text-red-500 hover:bg-red-500/10 hover:text-red-500"
                onClick={() => setDeleteDialogOpen(true)}
                size="sm"
                variant="ghost"
              >
                <IconTrash className="h-4 w-4" />
                Delete
              </Button>

              <Button
                className="gap-1.5"
                onClick={handleDownload}
                size="sm"
                style={{ backgroundColor: "var(--accent-teal)" }}
              >
                <IconDownload className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Comparison modal */}
      {selectedImage && selectedImage.resultImageUrl && (
        <ComparisonView
          enhancedUrl={selectedImage.resultImageUrl}
          onClose={() => setSelectedImage(null)}
          originalUrl={selectedImage.originalImageUrl}
        />
      )}

      {/* Add images dialog */}
      <AddImagesDialog
        currentImageCount={images.length}
        onOpenChange={setAddImagesOpen}
        open={addImagesOpen}
        projectId={project.id}
        projectName={project.name}
      />

      {/* Mask editor for inpainting */}
      {editingImage && (
        <ImageMaskEditor
          image={editingImage}
          latestVersion={editingImageLatestVersion}
          onClose={() => setEditingImage(null)}
        />
      )}

      {/* Version selector modal */}
      {versionSelectorGroup && (
        <VersionSelector
          initialVersion={versionSelectorGroup.latestVersion}
          onClose={() => setVersionSelectorGroup(null)}
          onEdit={(version) => {
            startEditing(version);
          }}
          onSelect={(version) => {
            // Open comparison view for the selected version
            setSelectedImage(version);
          }}
          versions={versionSelectorGroup.versions}
        />
      )}

      {/* Image Lightbox Gallery */}
      {lightboxIndex !== null && (
        <ImageLightbox
          currentIndex={lightboxIndex}
          images={imageGroups}
          onClose={() => setLightboxIndex(null)}
          onCompare={(image) => {
            setLightboxIndex(null);
            setSelectedImage(image);
          }}
          onDownload={handleDownloadSingle}
          onEdit={(image) => {
            setLightboxIndex(null);
            startEditing(image);
          }}
          onNavigate={setLightboxIndex}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog onOpenChange={setDeleteDialogOpen} open={deleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selectedImageIds.size} image
              {selectedImageIds.size !== 1 ? "s" : ""}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The selected images and all their
              versions will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 text-white hover:bg-red-600"
              onClick={handleDeleteSelected}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
