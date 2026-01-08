"use client";

import {
  IconChevronDown,
  IconGripVertical,
  IconWand,
} from "@tabler/icons-react";
import Image from "next/image";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { VideoImageItem } from "@/hooks/use-video-creation";
import type { VideoRoomType } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { VIDEO_ROOM_TYPES } from "@/lib/video/room-sequence";

interface AssignRoomsStepProps {
  images: VideoImageItem[];
  onUpdateImage: (
    id: string,
    updates: Partial<Omit<VideoImageItem, "id" | "url">>
  ) => void;
  onReorderImages: (fromIndex: number, toIndex: number) => void;
  onAutoArrange: () => void;
}

export function AssignRoomsStep({
  images,
  onUpdateImage,
  onReorderImages,
  onAutoArrange,
}: AssignRoomsStepProps) {
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    if (
      draggedIndex !== null &&
      dragOverIndex !== null &&
      draggedIndex !== dragOverIndex
    ) {
      onReorderImages(draggedIndex, dragOverIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground text-sm">
          <span className="font-medium text-foreground">{images.length}</span>{" "}
          clips in sequence
        </div>
        <Button
          className="gap-2"
          onClick={onAutoArrange}
          size="sm"
          variant="outline"
        >
          <IconWand className="h-4 w-4" />
          Auto-arrange by room type
        </Button>
      </div>

      {/* Image List */}
      <div className="space-y-3">
        {images.map((image, index) => (
          <div
            className={cn(
              "group flex items-center gap-4 rounded-xl border bg-card p-3 transition-all duration-200",
              "hover:border-(--accent-teal)/30 hover:shadow-md",
              draggedIndex === index && "scale-[0.98] opacity-50",
              dragOverIndex === index &&
                "border-(--accent-teal) bg-(--accent-teal)/5",
              "animate-fade-in-up"
            )}
            draggable
            key={image.id}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragStart={() => handleDragStart(index)}
            style={{ animationDelay: `${index * 30}ms` }}
          >
            {/* Drag Handle */}
            <div className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing">
              <IconGripVertical className="h-5 w-5" />
            </div>

            {/* Sequence Number */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted font-bold text-sm">
              {index + 1}
            </div>

            {/* Image Thumbnail */}
            <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
              <Image
                alt={`Clip ${index + 1}`}
                className="object-cover"
                fill
                sizes="96px"
                src={image.url}
              />
            </div>

            {/* Room Type Selector */}
            <div className="flex flex-1 items-center gap-3">
              <div className="relative min-w-[180px]">
                <select
                  className={cn(
                    "w-full appearance-none rounded-lg border bg-background px-3 py-2 pr-10 text-sm",
                    "focus:border-(--accent-teal) focus:outline-none focus:ring-(--accent-teal)/20 focus:ring-2"
                  )}
                  onChange={(e) =>
                    onUpdateImage(image.id, {
                      roomType: e.target.value as VideoRoomType,
                    })
                  }
                  value={image.roomType}
                >
                  {VIDEO_ROOM_TYPES.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.label}
                    </option>
                  ))}
                </select>
                <IconChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>

              {/* Custom Label */}
              <Input
                className="max-w-[200px] text-sm"
                onChange={(e) =>
                  onUpdateImage(image.id, { roomLabel: e.target.value })
                }
                placeholder="Custom label (optional)"
                value={image.roomLabel}
              />
            </div>

            {/* Duration Badge */}
            <div className="shrink-0 rounded-full bg-muted px-3 py-1 font-medium text-muted-foreground text-xs">
              5 sec
            </div>
          </div>
        ))}
      </div>

      {/* Sequence Preview */}
      <div className="mt-8 rounded-xl border bg-muted/30 p-4">
        <h4 className="mb-3 font-medium text-sm">Sequence Preview</h4>
        <div className="flex flex-wrap gap-2">
          {images.map((image, index) => {
            const roomConfig = VIDEO_ROOM_TYPES.find(
              (r) => r.id === image.roomType
            );
            return (
              <div
                className="flex items-center gap-1.5 rounded-full bg-background px-3 py-1.5 font-medium text-xs shadow-sm"
                key={image.id}
              >
                <span className="text-muted-foreground">{index + 1}.</span>
                <span>{image.roomLabel || roomConfig?.label || "Unknown"}</span>
                {index < images.length - 1 && (
                  <span className="ml-1 text-muted-foreground">→</span>
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-muted-foreground text-xs">
          Total duration: {images.length * 5} seconds ({images.length} clips × 5
          sec)
        </p>
      </div>
    </div>
  );
}
