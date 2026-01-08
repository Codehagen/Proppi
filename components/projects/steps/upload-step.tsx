"use client";

import {
  IconGripVertical,
  IconPhoto,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import * as React from "react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import type { UploadedImage } from "@/hooks/use-project-creation";
import { cn } from "@/lib/utils";

interface UploadStepProps {
  images: UploadedImage[];
  onAddImages: (files: File[]) => void;
  onRemoveImage: (id: string) => void;
}

export function UploadStep({
  images,
  onAddImages,
  onRemoveImage,
}: UploadStepProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

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
        onAddImages(files);
      }
    },
    [onAddImages]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        onAddImages(files);
      }
      // Reset input so same file can be selected again
      e.target.value = "";
    },
    [onAddImages]
  );

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        className={cn(
          "relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-8 transition-all duration-200",
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
            "flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-200",
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
              "h-8 w-8 transition-colors",
              isDragging ? "text-white" : ""
            )}
            style={{ color: isDragging ? undefined : "var(--accent-teal)" }}
          />
        </div>

        <div className="text-center">
          <p className="font-medium text-foreground">
            {isDragging ? "Drop your images here" : "Drag & drop images here"}
          </p>
          <p className="mt-1 text-muted-foreground text-sm">
            or click to browse • JPEG, PNG, WebP up to 10MB
          </p>
        </div>
      </div>

      {/* Image preview grid */}
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-medium text-foreground text-sm">
              {images.length} image{images.length !== 1 ? "s" : ""} selected
            </p>
            <Button
              className="gap-1.5 text-xs"
              onClick={handleClick}
              size="sm"
              variant="ghost"
            >
              <IconPhoto className="h-3.5 w-3.5" />
              Add more
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {images.map((image, index) => (
              <div
                className="group relative aspect-square animate-fade-in-up overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/5"
                key={image.id}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={image.name}
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                  src={image.preview}
                />

                {/* Overlay with actions */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/40 group-hover:opacity-100">
                  <Button
                    className="h-7 w-7 rounded-full bg-white/90 text-foreground hover:bg-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveImage(image.id);
                    }}
                    size="icon-sm"
                    variant="secondary"
                  >
                    <IconX className="h-4 w-4" />
                  </Button>
                </div>

                {/* Drag handle hint */}
                <div className="absolute top-1 left-1 rounded bg-black/50 p-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <IconGripVertical className="h-3 w-3 text-white/70" />
                </div>

                {/* Image number */}
                <div className="absolute right-1 bottom-1 rounded bg-black/50 px-1.5 py-0.5 font-medium text-[10px] text-white">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
