"use client";

import {
  IconLoader2,
  IconPhoto,
  IconSparkles,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useImageUpload } from "@/hooks/use-image-upload";
import { ROOM_TYPES } from "@/lib/style-templates";
import { cn } from "@/lib/utils";

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  name: string;
  roomType: string | null;
}

interface AddImagesDialogProps {
  projectId: string;
  projectName: string;
  currentImageCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddImagesDialog({
  projectId,
  projectName,
  currentImageCount,
  open,
  onOpenChange,
}: AddImagesDialogProps) {
  const router = useRouter();
  const imageUpload = useImageUpload();
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const maxImages = 10 - currentImageCount;
  const canAddMore = images.length < maxImages;

  const handleReset = useCallback(() => {
    images.forEach((img) => URL.revokeObjectURL(img.preview));
    setImages([]);
    imageUpload.reset();
    setIsSubmitting(false);
  }, [images, imageUpload]);

  const handleClose = useCallback(() => {
    handleReset();
    onOpenChange(false);
  }, [handleReset, onOpenChange]);

  const addImages = useCallback(
    (files: File[]) => {
      const remaining = maxImages - images.length;
      const filesToAdd = files.slice(0, remaining);

      const newImages: UploadedImage[] = filesToAdd.map((file, index) => ({
        id: `img_${Date.now()}_${index}`,
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        roomType: null,
      }));

      setImages((prev) => [...prev, ...newImages]);
    },
    [images.length, maxImages]
  );

  const updateImageRoomType = useCallback((id: string, roomType: string) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, roomType } : img))
    );
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter((img) => img.id !== id);
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/")
      );
      if (files.length > 0) {
        addImages(files);
      }
    },
    [addImages]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        addImages(files);
      }
      e.target.value = "";
    },
    [addImages]
  );

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleSubmit = useCallback(async () => {
    if (images.length === 0) return;

    setIsSubmitting(true);

    try {
      const files = images.map((img) => img.file);
      const roomTypes = images.map((img) => img.roomType);
      const uploadSuccess = await imageUpload.uploadImages(
        projectId,
        files,
        roomTypes
      );

      if (uploadSuccess) {
        handleReset();
        onOpenChange(false);
        router.refresh();
      } else {
        console.error("Failed to upload images:", imageUpload.error);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setIsSubmitting(false);
    }
  }, [images, projectId, imageUpload, handleReset, onOpenChange, router]);

  return (
    <Dialog onOpenChange={handleClose} open={open}>
      <DialogContent
        className="flex max-h-[80vh] flex-col gap-0 overflow-hidden p-0"
        size="lg"
      >
        {/* Header */}
        <div className="border-b px-6 py-4">
          <DialogHeader>
            <DialogTitle>Add More Images</DialogTitle>
            <DialogDescription>
              Add images to &ldquo;{projectName}&rdquo; ({currentImageCount}/10
              images used)
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {maxImages <= 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <IconPhoto className="h-12 w-12 text-muted-foreground/30" />
              <p className="mt-4 text-muted-foreground text-sm">
                This project has reached the maximum of 10 images.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Drop zone */}
              <div
                className={cn(
                  "relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 transition-all duration-200",
                  isDragging
                    ? "border-[var(--accent-teal)] bg-[var(--accent-teal)]/5"
                    : "border-foreground/10 bg-muted/30 hover:border-foreground/20 hover:bg-muted/50"
                )}
                onClick={handleClick}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  accept="image/*"
                  className="hidden"
                  multiple
                  onChange={handleFileChange}
                  ref={inputRef}
                  type="file"
                />

                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200",
                    isDragging ? "scale-110" : ""
                  )}
                  style={{
                    backgroundColor: isDragging
                      ? "var(--accent-teal)"
                      : "color-mix(in oklch, var(--accent-teal) 15%, transparent)",
                  }}
                >
                  <IconUpload
                    className={cn(
                      "h-6 w-6 transition-colors",
                      isDragging ? "text-white" : ""
                    )}
                    style={{
                      color: isDragging ? undefined : "var(--accent-teal)",
                    }}
                  />
                </div>

                <div className="text-center">
                  <p className="font-medium text-foreground">
                    {isDragging
                      ? "Drop your images here"
                      : "Drag & drop images"}
                  </p>
                  <p className="mt-0.5 text-muted-foreground text-xs">
                    or click to browse • Up to {maxImages} more image
                    {maxImages !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Image preview grid */}
              {images.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground text-sm">
                      {images.length} image{images.length !== 1 ? "s" : ""}{" "}
                      selected
                    </p>
                    {canAddMore && (
                      <Button
                        className="gap-1.5 text-xs"
                        onClick={handleClick}
                        size="sm"
                        variant="ghost"
                      >
                        <IconPhoto className="h-3.5 w-3.5" />
                        Add more
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {images.map((image, index) => (
                      <div
                        className="group relative animate-fade-in-up overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/5"
                        key={image.id}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {/* Image preview */}
                        <div className="relative aspect-square">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            alt={image.name}
                            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                            src={image.preview}
                          />

                          {/* Remove button */}
                          <Button
                            className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage(image.id);
                            }}
                            size="icon-sm"
                            variant="secondary"
                          >
                            <IconX className="h-3.5 w-3.5" />
                          </Button>
                        </div>

                        {/* Room type dropdown */}
                        <div className="p-2">
                          <Select
                            onValueChange={(value) =>
                              updateImageRoomType(image.id, value)
                            }
                            value={image.roomType || ""}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select room type" />
                            </SelectTrigger>
                            <SelectContent>
                              {ROOM_TYPES.map((room) => (
                                <SelectItem
                                  className="text-xs"
                                  key={room.id}
                                  value={room.id}
                                >
                                  {room.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t bg-muted/30 px-6 py-4">
          <Button
            disabled={isSubmitting}
            onClick={handleClose}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            className="min-w-[120px] gap-2"
            disabled={images.length === 0 || isSubmitting}
            onClick={handleSubmit}
            style={{ backgroundColor: "var(--accent-teal)" }}
          >
            {isSubmitting ? (
              <>
                <IconLoader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <IconSparkles className="h-4 w-4" />
                Add & Process
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
