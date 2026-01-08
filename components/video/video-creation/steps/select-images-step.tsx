"use client";

import {
  IconAlertCircle,
  IconCheck,
  IconLoader2,
  IconPhoto,
  IconPlus,
  IconX,
} from "@tabler/icons-react";
import Image from "next/image";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { VideoImageItem } from "@/hooks/use-video-creation";
import { uploadVideoSourceImageAction } from "@/lib/actions/video";
import { cn } from "@/lib/utils";
import { VIDEO_LIMITS } from "@/lib/video/video-constants";

interface UploadingImage {
  id: string;
  file: File;
  previewUrl: string;
  progress: "uploading" | "done" | "error";
  error?: string;
}

interface SelectImagesStepProps {
  images: VideoImageItem[];
  onAddImages: (images: Omit<VideoImageItem, "sequenceOrder">[]) => void;
  onRemoveImage: (id: string) => void;
}

export function SelectImagesStep({
  images,
  onAddImages,
  onRemoveImage,
}: SelectImagesStepProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploadingImages, setUploadingImages] = React.useState<
    UploadingImage[]
  >([]);

  const handleFileSelect = React.useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Check remaining slots
      const remainingSlots = VIDEO_LIMITS.MAX_IMAGES_PER_VIDEO - images.length;
      const filesToUpload = files.slice(0, remainingSlots);

      if (filesToUpload.length < files.length) {
        toast.warning(
          `Only ${remainingSlots} slots remaining. Some images were not added.`
        );
      }

      // Create preview entries for all files
      const newUploading: UploadingImage[] = filesToUpload.map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        progress: "uploading" as const,
      }));

      setUploadingImages((prev) => [...prev, ...newUploading]);

      // Upload each file
      const uploadPromises = newUploading.map(async (item) => {
        try {
          const formData = new FormData();
          formData.append("file", item.file);

          const result = await uploadVideoSourceImageAction(formData);

          if (result.success) {
            // Mark as done
            setUploadingImages((prev) =>
              prev.map((img) =>
                img.id === item.id ? { ...img, progress: "done" as const } : img
              )
            );

            // Add to main images list with Supabase URL
            onAddImages([
              {
                id: result.imageId,
                url: result.url,
                roomType: "other" as const,
                roomLabel: "",
              },
            ]);

            // Remove from uploading list after a short delay
            setTimeout(() => {
              setUploadingImages((prev) =>
                prev.filter((img) => img.id !== item.id)
              );
              // Revoke the blob URL
              URL.revokeObjectURL(item.previewUrl);
            }, 500);
          }
        } catch (error) {
          console.error("Upload failed:", error);
          setUploadingImages((prev) =>
            prev.map((img) =>
              img.id === item.id
                ? {
                    ...img,
                    progress: "error" as const,
                    error:
                      error instanceof Error ? error.message : "Upload failed",
                  }
                : img
            )
          );
          toast.error(
            `Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`
          );
        }
      });

      await Promise.all(uploadPromises);
    },
    [images.length, onAddImages]
  );

  const removeUploadingImage = React.useCallback((id: string) => {
    setUploadingImages((prev) => {
      const item = prev.find((img) => img.id === id);
      if (item) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return prev.filter((img) => img.id !== id);
    });
  }, []);

  const remainingSlots =
    VIDEO_LIMITS.MAX_IMAGES_PER_VIDEO - images.length - uploadingImages.length;
  const isUploading = uploadingImages.some(
    (img) => img.progress === "uploading"
  );

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="flex items-start gap-3 rounded-xl border border-[var(--accent-teal)]/20 bg-[var(--accent-teal)]/5 p-4">
        <IconAlertCircle className="mt-0.5 h-5 w-5 text-[var(--accent-teal)]" />
        <div className="text-sm">
          <p className="font-medium text-[var(--accent-teal)]">How it works</p>
          <p className="mt-1 text-muted-foreground">
            Each image becomes a 5-second cinematic video clip. The clips are
            then combined into a single property tour video with smooth
            transitions and background music.
          </p>
        </div>
      </div>

      {/* Image Count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="font-bold text-2xl"
            style={{
              color:
                images.length >= VIDEO_LIMITS.MIN_IMAGES_PER_VIDEO
                  ? "var(--accent-teal)"
                  : "inherit",
            }}
          >
            {images.length}
          </span>
          <span className="text-muted-foreground">
            / {VIDEO_LIMITS.MAX_IMAGES_PER_VIDEO} images selected
          </span>
          {isUploading && (
            <span className="flex items-center gap-1.5 text-muted-foreground text-sm">
              <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
              Uploading…
            </span>
          )}
        </div>
        {images.length >= VIDEO_LIMITS.MIN_IMAGES_PER_VIDEO && !isUploading && (
          <div className="flex items-center gap-1.5 text-[var(--accent-green)] text-sm">
            <IconCheck className="h-4 w-4" />
            Ready to continue
          </div>
        )}
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {/* Uploaded Images */}
        {images.map((image, index) => (
          <div
            className={cn(
              "group relative aspect-[4/3] overflow-hidden rounded-xl border-2 border-transparent",
              "bg-muted transition-all duration-200",
              "hover:border-[var(--accent-teal)]/50 hover:shadow-lg",
              "animate-scale-in"
            )}
            key={image.id}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <Image
              alt={`Image ${index + 1}`}
              className="object-cover"
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              src={image.url}
            />

            {/* Sequence Number Badge */}
            <div className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 font-bold text-white text-xs backdrop-blur-sm">
              {index + 1}
            </div>

            {/* Remove Button */}
            <button
              className={cn(
                "absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full",
                "bg-black/60 text-white backdrop-blur-sm",
                "opacity-0 transition-opacity group-hover:opacity-100",
                "hover:bg-red-500"
              )}
              onClick={() => onRemoveImage(image.id)}
              type="button"
            >
              <IconX className="h-4 w-4" />
            </button>

            {/* Gradient Overlay */}
            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        ))}

        {/* Uploading Images */}
        {uploadingImages.map((item) => (
          <div
            className={cn(
              "group relative aspect-[4/3] overflow-hidden rounded-xl border-2",
              item.progress === "uploading" && "border-[var(--accent-teal)]",
              item.progress === "done" && "border-[var(--accent-green)]",
              item.progress === "error" && "border-destructive",
              "bg-muted transition-all duration-200"
            )}
            key={item.id}
          >
            <Image
              alt="Uploading"
              className={cn(
                "object-cover transition-opacity",
                item.progress === "uploading" && "opacity-60"
              )}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              src={item.previewUrl}
            />

            {/* Upload Status Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              {item.progress === "uploading" && (
                <div className="flex flex-col items-center gap-2">
                  <IconLoader2 className="h-8 w-8 animate-spin text-white" />
                  <span className="font-medium text-white text-xs">
                    Uploading…
                  </span>
                </div>
              )}
              {item.progress === "done" && (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-green)]">
                  <IconCheck className="h-6 w-6 text-white" />
                </div>
              )}
              {item.progress === "error" && (
                <div className="flex flex-col items-center gap-2">
                  <IconAlertCircle className="h-8 w-8 text-destructive" />
                  <span className="font-medium text-white text-xs">Failed</span>
                </div>
              )}
            </div>

            {/* Remove Button for failed uploads */}
            {item.progress === "error" && (
              <button
                className={cn(
                  "absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full",
                  "bg-black/60 text-white backdrop-blur-sm",
                  "hover:bg-red-500"
                )}
                onClick={() => removeUploadingImage(item.id)}
                type="button"
              >
                <IconX className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}

        {/* Add Image Button */}
        {remainingSlots > 0 && (
          <button
            className={cn(
              "flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-xl",
              "border-2 border-muted-foreground/30 border-dashed",
              "bg-muted/30 text-muted-foreground",
              "transition-all duration-200",
              "hover:border-[var(--accent-teal)] hover:bg-[var(--accent-teal)]/5 hover:text-[var(--accent-teal)]",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "animate-fade-in"
            )}
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            <IconPlus className="h-8 w-8" />
            <span className="font-medium text-sm">Add Images</span>
            <span className="text-xs opacity-70">
              {remainingSlots} slots left
            </span>
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        multiple
        onChange={handleFileSelect}
        ref={fileInputRef}
        type="file"
      />

      {/* Empty State */}
      {images.length === 0 && uploadingImages.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
            <IconPhoto className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg">No images selected</h3>
          <p className="mt-1 max-w-sm text-muted-foreground text-sm">
            Add at least {VIDEO_LIMITS.MIN_IMAGES_PER_VIDEO} images to create
            your property video. You can add up to{" "}
            {VIDEO_LIMITS.MAX_IMAGES_PER_VIDEO} images.
          </p>
          <Button
            className="mt-6 gap-2"
            onClick={() => fileInputRef.current?.click()}
            style={{ backgroundColor: "var(--accent-teal)" }}
          >
            <IconPlus className="h-4 w-4" />
            Select Images
          </Button>
        </div>
      )}
    </div>
  );
}
