"use client";

import {
  IconArrowRight,
  IconLoader2,
  IconPhoto,
  IconPlus,
  IconScissors,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import Image from "next/image";
import * as React from "react";
import { toast } from "sonner";
import type { VideoImageItem } from "@/hooks/use-video-creation";
import { uploadVideoSourceImageAction } from "@/lib/actions/video";
import { cn } from "@/lib/utils";
import { getVideoTemplateById } from "@/lib/video/video-templates";

interface StoryboardStepProps {
  selectedTemplateId: string;
  images: VideoImageItem[];
  onAddImageToSlot: (
    image: Omit<
      VideoImageItem,
      | "sequenceOrder"
      | "startImageUrl"
      | "startImageId"
      | "startImageGenerationId"
      | "endImageUrl"
      | "endImageId"
      | "endImageGenerationId"
    >,
    slotIndex: number
  ) => void;
  onUpdateSlotImage: (
    slotIndex: number,
    type: "start" | "end",
    image: { id: string; url: string; imageGenerationId?: string | null }
  ) => void;
  onUpdateTransitionType: (
    slotIndex: number,
    transitionType: "cut" | "seamless"
  ) => void;
  onRemoveImage: (id: string) => void;
}

export function StoryboardStep({
  selectedTemplateId,
  images,
  onAddImageToSlot,
  onUpdateSlotImage,
  onUpdateTransitionType,
  onRemoveImage,
}: StoryboardStepProps) {
  const template = getVideoTemplateById(selectedTemplateId);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [activeSlotIndex, setActiveSlotIndex] = React.useState<number | null>(
    null
  );
  const [activeFrameType, setActiveFrameType] = React.useState<
    "start" | "end" | "both"
  >("both");
  const [uploadingSlotIndex, setUploadingSlotIndex] = React.useState<
    number | null
  >(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);
  const [dragOverFrame, setDragOverFrame] = React.useState<
    "start" | "end" | "both"
  >("both");

  const uploadFile = React.useCallback(
    async (
      file: File,
      index: number,
      frameType: "start" | "end" | "both" = "both"
    ) => {
      if (!template) return;

      setUploadingSlotIndex(index);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const result = await uploadVideoSourceImageAction(formData);

        if (result.success) {
          if (frameType === "both") {
            const slot = template.slots[index];
            onAddImageToSlot(
              {
                id: result.imageId,
                url: result.url,
                roomType: slot?.roomType || "other",
                roomLabel: slot?.label || "",
              },
              index
            );
          } else {
            onUpdateSlotImage(index, frameType, {
              id: result.imageId,
              url: result.url,
            });
          }
        } else {
          toast.error("Failed to upload image");
        }
      } catch (error) {
        console.error("Upload failed:", error);
        toast.error("Failed to upload image");
      } finally {
        setUploadingSlotIndex(null);
      }
    },
    [template, onAddImageToSlot, onUpdateSlotImage]
  );

  const handleAddClick = (
    index: number,
    frameType: "start" | "end" | "both" = "both"
  ) => {
    setActiveSlotIndex(index);
    setActiveFrameType(frameType);
    // Small timeout to ensure state is set before click (safeguard)
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 0);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || activeSlotIndex === null) return;

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    await uploadFile(file, activeSlotIndex, activeFrameType);
    setActiveSlotIndex(null);
  };

  const handleDragOver = (
    e: React.DragEvent,
    index: number,
    frameType: "start" | "end" | "both" = "both"
  ) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
    setDragOverIndex(index);
    setDragOverFrame(frameType);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverIndex(null);
    setDragOverFrame("both");
  };

  const handleDrop = async (
    e: React.DragEvent,
    index: number,
    frameType: "start" | "end" | "both" = "both"
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIndex(null);
    setDragOverFrame("both");

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are supported");
      return;
    }

    await uploadFile(file, index, frameType);
  };

  if (!template) {
    return <div>Template not found</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 border-b pb-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-bold text-2xl tracking-tight">{template.name}</h2>
          <p className="mt-1 text-muted-foreground">{template.description}</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3 rounded-full border bg-muted/50 px-4 py-2">
          <div className="flex flex-col items-end">
            <span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
              Completion
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "font-bold text-lg",
                  images.length === template.slots.length
                    ? "text-(--accent-green)"
                    : "text-foreground"
                )}
              >
                {images.length}
              </span>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground">
                {template.slots.length} shots
              </span>
            </div>
          </div>

          {/* Circular Progress */}
          <div className="relative h-10 w-10">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-muted"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="transition-all duration-500 ease-out"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={
                  images.length === template.slots.length
                    ? "var(--accent-green)"
                    : "var(--accent-teal)"
                }
                strokeDasharray={`${(images.length / template.slots.length) * 100}, 100`}
                strokeWidth="4"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Slots Grid */}
      <div className="grid grid-cols-1 gap-x-28 gap-y-12 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {template.slots.map((slot, index) => {
          // Find image for this slot (sequenceOrder is 1-based)
          const image = images.find((img) => img.sequenceOrder === index + 1);
          const nextImage = images.find(
            (img) => img.sequenceOrder === index + 2
          );
          const isUploading = uploadingSlotIndex === index;

          return (
            <div className="group relative space-y-3" key={index}>
              {/* Transition Bridge (To Next Shot) */}
              {index < template.slots.length - 1 && (
                <div
                  className={cn(
                    "pointer-events-none absolute top-0 -right-22 bottom-10 z-40 hidden w-20 flex-col items-center justify-center md:flex",
                    (index + 1) % 4 === 0 && "xl:hidden", // End of row at 4 cols
                    (index + 1) % 3 === 0 && "lg:hidden xl:flex", // End of row at 3 cols
                    (index + 1) % 2 === 0 && "md:hidden lg:flex" // End of row at 2 cols
                  )}
                >
                  <div className="group/match pointer-events-auto mb-2 flex items-center -space-x-2.5">
                    <div className="relative h-14 w-10 overflow-hidden rounded-l-xl border-y border-l bg-muted/30 shadow-xs ring-1 ring-black/5 transition-transform group-hover/match:-translate-x-1">
                      {image && (
                        <Image
                          alt="End frame"
                          className="object-cover opacity-40"
                          fill
                          src={image.endImageUrl || image.url}
                        />
                      )}
                    </div>
                    <div className="z-10 flex h-7 w-7 items-center justify-center rounded-full border bg-background shadow-md transition-all group-hover/match:rotate-12 group-hover/match:scale-110 group-hover/match:border-(--accent-teal)">
                      <IconScissors
                        className="h-3.5 w-3.5 text-muted-foreground group-hover/match:text-(--accent-teal)"
                        title="Continuity Match"
                      />
                    </div>
                    <div className="relative h-14 w-10 overflow-hidden rounded-r-xl border-y border-r bg-muted/30 shadow-xs ring-1 ring-black/5 transition-transform group-hover/match:translate-x-1">
                      {nextImage && (
                        <Image
                          alt="Start frame"
                          className="object-cover opacity-40"
                          fill
                          src={nextImage.startImageUrl || nextImage.url}
                        />
                      )}
                    </div>

                    {/* Tooltip Label */}
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 transition-opacity group-hover/match:opacity-100">
                      <span className="rounded-sm border bg-background/80 px-1.5 py-0.5 font-bold text-[8px] text-muted-foreground uppercase tracking-widest">
                        Continuity match
                      </span>
                    </div>
                  </div>

                  {/* Transition Toggle - Right below transition UI */}
                  {image && nextImage && (
                    <div className="pointer-events-auto mt-1">
                      <button
                        className={cn(
                          "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-bold text-[9px] uppercase tracking-wider transition-all",
                          (image.transitionType || "cut") === "seamless"
                            ? "border-(--accent-teal)/30 bg-(--accent-teal)/10 text-(--accent-teal) shadow-sm"
                            : "border-muted-foreground/20 bg-background/80 text-muted-foreground hover:border-muted-foreground/40"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          const currentType = image.transitionType || "cut";
                          onUpdateTransitionType(
                            index,
                            currentType === "cut" ? "seamless" : "cut"
                          );
                        }}
                        title={
                          (image.transitionType || "cut") === "seamless"
                            ? "Seamless transition enabled"
                            : "Cut transition (click for seamless)"
                        }
                      >
                        {(image.transitionType || "cut") === "seamless" ? (
                          <>
                            <IconArrowRight className="h-3 w-3" />
                            <span>Seamless</span>
                          </>
                        ) : (
                          <>
                            <IconScissors className="h-3 w-3" />
                            <span>Cut</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Slot Header */}
              <div className="mb-1 flex items-center justify-between px-1.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-muted/80 font-bold text-muted-foreground text-xs ring-1 ring-black/5">
                    {index + 1}
                  </div>
                  <span className="font-bold text-sm tracking-tight">
                    {slot.label}
                  </span>
                </div>
                {image && (
                  <div className="flex items-center gap-1.5 rounded-full border border-(--accent-green)/20 bg-(--accent-green)/10 px-2 py-1">
                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-(--accent-green)" />
                    <span className="font-bold text-(--accent-green) text-[10px] uppercase tracking-wider">
                      Ready
                    </span>
                  </div>
                )}
              </div>

              <div
                className={cn(
                  "relative aspect-video overflow-hidden rounded-xl border-2 bg-muted/30 transition-all duration-200",
                  image
                    ? "border-transparent shadow-sm"
                    : "border-muted-foreground/20 border-dashed hover:border-(--accent-teal) hover:bg-(--accent-teal)/5",
                  dragOverIndex === index &&
                    dragOverFrame === "both" &&
                    "scale-[1.02] border-(--accent-teal) bg-(--accent-teal)/5 ring-(--accent-teal)/20 ring-2",
                  isUploading && "cursor-wait border-(--accent-teal)"
                )}
                onDragLeave={handleDragLeave}
              >
                {/* Split View (Always Split now) */}
                <div className="flex h-full w-full">
                  {/* Start Frame Area */}
                  <div
                    className={cn(
                      "group/start relative flex-1 cursor-pointer border-white/10 border-r transition-colors",
                      !image && "hover:bg-foreground/5"
                    )}
                    onClick={() =>
                      image
                        ? handleAddClick(index, "start")
                        : handleAddClick(index, "both")
                    }
                    onDragOver={(e) =>
                      handleDragOver(e, index, image ? "start" : "both")
                    }
                    onDrop={(e) =>
                      handleDrop(e, index, image ? "start" : "both")
                    }
                  >
                    {image ? (
                      <Image
                        alt={`${slot.label} start`}
                        className="object-cover"
                        fill
                        src={image.startImageUrl || image.url}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center p-4">
                        <div className="flex flex-col items-center gap-1.5 opacity-40 transition-opacity group-hover/start:opacity-100">
                          <IconPhoto className="h-5 w-5" />
                          <span className="font-medium text-[10px] uppercase tracking-tighter">
                            Add Start
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="absolute top-2 left-2 z-10 rounded-md bg-black/60 px-1.5 py-0.5 font-bold text-[9px] text-white uppercase tracking-wider backdrop-blur-sm transition-colors group-hover/start:bg-(--accent-teal)">
                      Start
                    </div>

                    {image && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover/start:opacity-100">
                        <div className="flex flex-col items-center gap-3">
                          <button
                            className="group/btn flex flex-col items-center gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddClick(index, "start");
                            }}
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white backdrop-blur-md transition-colors group-hover/btn:bg-white/40">
                              <IconPlus className="h-5 w-5" />
                            </div>
                            <span className="font-bold text-[9px] text-white uppercase tracking-tighter">
                              Change
                            </span>
                          </button>

                          {image.startImageUrl !== image.endImageUrl && (
                            <button
                              className="group/btn flex flex-col items-center gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateSlotImage(index, "start", {
                                  id: image.endImageId,
                                  url: image.endImageUrl,
                                  imageGenerationId: image.endImageGenerationId,
                                });
                              }}
                            >
                              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-red-500/30 bg-red-500/40 text-white backdrop-blur-md transition-colors group-hover/btn:bg-red-500/60">
                                <IconTrash className="h-4 w-4" />
                              </div>
                              <span className="font-bold text-[9px] text-white uppercase tracking-tighter">
                                Remove
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {dragOverIndex === index &&
                      (dragOverFrame === "start" ||
                        (dragOverFrame === "both" && !image)) && (
                        <div className="fade-in absolute inset-0 z-20 flex animate-in flex-col items-center justify-center bg-(--accent-teal)/80 duration-200">
                          <IconPlus className="h-8 w-8 animate-bounce text-white" />
                          <span className="mt-2 font-bold text-white text-xs">
                            Drop image
                          </span>
                        </div>
                      )}
                  </div>

                  {/* Transition Arrow */}
                  <div className="absolute top-1/2 left-1/2 z-30 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border bg-background shadow-sm transition-transform group-hover:scale-110">
                    <IconArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>

                  {/* End Frame Area */}
                  <div
                    className={cn(
                      "group/end relative flex-1 cursor-pointer transition-colors",
                      !image && "hover:bg-foreground/5"
                    )}
                    onClick={() =>
                      image
                        ? handleAddClick(index, "end")
                        : handleAddClick(index, "both")
                    }
                    onDragOver={(e) =>
                      handleDragOver(e, index, image ? "end" : "both")
                    }
                    onDrop={(e) => handleDrop(e, index, image ? "end" : "both")}
                  >
                    {image ? (
                      <Image
                        alt={`${slot.label} end`}
                        className="object-cover"
                        fill
                        src={image.endImageUrl || image.url}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center p-4">
                        <div className="flex flex-col items-center gap-1.5 opacity-40 transition-opacity group-hover/end:opacity-100">
                          <IconPhoto className="h-5 w-5" />
                          <span className="font-medium text-[10px] uppercase tracking-tighter">
                            Add End
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="absolute top-2 right-2 z-10 rounded-md bg-black/60 px-1.5 py-0.5 font-bold text-[9px] text-white uppercase tracking-wider backdrop-blur-sm transition-colors group-hover/end:bg-(--accent-teal)">
                      End
                    </div>

                    {image && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover/end:opacity-100">
                        <div className="flex flex-col items-center gap-3">
                          <button
                            className="group/btn flex flex-col items-center gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddClick(index, "end");
                            }}
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white backdrop-blur-md transition-colors group-hover/btn:bg-white/40">
                              <IconPlus className="h-5 w-5" />
                            </div>
                            <span className="font-bold text-[9px] text-white uppercase tracking-tighter">
                              Change
                            </span>
                          </button>

                          {image.startImageUrl !== image.endImageUrl && (
                            <button
                              className="group/btn flex flex-col items-center gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateSlotImage(index, "end", {
                                  id: image.startImageId,
                                  url: image.startImageUrl,
                                  imageGenerationId:
                                    image.startImageGenerationId,
                                });
                              }}
                            >
                              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-red-500/30 bg-red-500/40 text-white backdrop-blur-md transition-colors group-hover/btn:bg-red-500/60">
                                <IconTrash className="h-4 w-4" />
                              </div>
                              <span className="font-bold text-[9px] text-white uppercase tracking-tighter">
                                Remove
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {dragOverIndex === index && dragOverFrame === "end" && (
                      <div className="fade-in absolute inset-0 z-20 flex animate-in flex-col items-center justify-center bg-(--accent-teal)/80 duration-200">
                        <IconPlus className="h-8 w-8 animate-bounce text-white" />
                        <span className="mt-2 font-bold text-white text-xs">
                          Drop image
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Loading Overlay */}
                  {isUploading && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm">
                      <IconLoader2 className="h-8 w-8 animate-spin text-(--accent-teal)" />
                      <span className="mt-2 font-medium text-foreground text-xs">
                        Uploading...
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons Below Clip */}
              <div className="flex items-center justify-between gap-3 px-1.5 pt-1">
                <p className="max-w-[60%] font-medium text-[11px] text-muted-foreground/80 italic leading-snug">
                  {slot.description}
                </p>

                {image && (
                  <button
                    className="flex h-8 items-center gap-2 rounded-xl border bg-background px-3 font-bold text-[10px] text-muted-foreground shadow-xs ring-1 ring-black/5 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveImage(image.id);
                    }}
                  >
                    <IconX className="h-3.5 w-3.5" />
                    Clear
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hidden File Input */}
      <input
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
        ref={fileInputRef}
        type="file"
      />
    </div>
  );
}
