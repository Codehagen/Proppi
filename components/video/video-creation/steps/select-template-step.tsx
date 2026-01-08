"use client";

import {
  IconClock,
  IconLayout,
  IconPlayerPlay,
  IconPlus,
} from "@tabler/icons-react";
import Image from "next/image";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  VIDEO_TEMPLATES,
  type VideoTemplate,
} from "@/lib/video/video-templates";

interface SelectTemplateStepProps {
  selectedTemplateId: string | null;
  onSelectTemplate: (templateId: string) => void;
  onSelectCustom: () => void;
}

export function SelectTemplateStep({
  selectedTemplateId,
  onSelectTemplate,
  onSelectCustom,
}: SelectTemplateStepProps) {
  const [hoveredTemplateId, setHoveredTemplateId] = React.useState<
    string | null
  >(null);

  return (
    <div className="space-y-6">
      <div className="mx-auto mb-8 max-w-2xl text-center">
        <h2 className="font-bold text-2xl tracking-tight">Choose a Style</h2>
        <p className="mt-2 text-muted-foreground">
          Start with a professionally curated template or build your video from
          scratch.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Templates */}
        {VIDEO_TEMPLATES.map((template) => (
          <TemplateCard
            isHovered={hoveredTemplateId === template.id}
            isSelected={selectedTemplateId === template.id}
            key={template.id}
            onHover={setHoveredTemplateId}
            onSelect={() => onSelectTemplate(template.id)}
            template={template}
          />
        ))}

        {/* Custom Option */}
        <button
          className={cn(
            "group relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-8 transition-all duration-300",
            "hover:border-(--accent-teal) hover:bg-(--accent-teal)/5",
            selectedTemplateId === null
              ? "border-muted-foreground/20" // We don't really have a "selected" state for custom in this view as it navigates away immediately usually, but good to have styles
              : "border-muted-foreground/20"
          )}
          onClick={onSelectCustom}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted transition-colors group-hover:bg-(--accent-teal)/10 group-hover:text-(--accent-teal)">
            <IconPlus className="h-8 w-8" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-lg">Start from Scratch</h3>
            <p className="mt-1 text-muted-foreground text-sm">
              Manually select images and arrange your own sequence
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}

function TemplateCard({
  template,
  isSelected,
  isHovered,
  onHover,
  onSelect,
}: {
  template: VideoTemplate;
  isSelected: boolean;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  onSelect: () => void;
}) {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (isHovered && template.previewVideoUrl && videoRef.current) {
      videoRef.current.play().catch(() => {});
    } else if (!isHovered && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isHovered, template.previewVideoUrl]);

  return (
    <div
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-xl border-2 bg-card text-card-foreground shadow-sm transition-all duration-300",
        isSelected
          ? "border-(--accent-teal) ring-(--accent-teal)/20 ring-2"
          : "border-transparent hover:-translate-y-1 hover:border-(--accent-teal)/50 hover:shadow-lg"
      )}
      onClick={onSelect}
      onMouseEnter={() => onHover(template.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Thumbnail / Video Container */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        {/* Static Image */}
        <Image
          alt={template.name}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
            isHovered && template.previewVideoUrl ? "opacity-0" : "opacity-100"
          )}
          fill
          src={template.thumbnailUrl}
        />

        {/* Video Preview */}
        {template.previewVideoUrl &&
          (template.previewVideoUrl.endsWith(".mp4") ||
            template.previewVideoUrl.includes("cdn.coverr.co")) && (
            <video
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
                isHovered ? "opacity-100" : "opacity-0"
              )}
              loop
              muted
              playsInline
              ref={videoRef}
              src={template.previewVideoUrl}
            />
          )}

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity group-hover:opacity-40" />

        {/* Play Icon (visible when not hovering) */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-all duration-300",
            isHovered ? "scale-110 opacity-0" : "scale-100 opacity-100"
          )}
        >
          <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
            <IconPlayerPlay className="h-6 w-6 fill-white text-white" />
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <Badge
            className="border-0 bg-black/50 font-normal text-white text-xs backdrop-blur-md"
            variant="secondary"
          >
            <IconClock className="mr-1 h-3 w-3" />
            {template.estimatedDuration}s
          </Badge>
          <Badge
            className="border-0 bg-black/50 font-normal text-white text-xs backdrop-blur-md"
            variant="secondary"
          >
            <IconLayout className="mr-1 h-3 w-3" />
            {template.slots.length} shots
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-lg transition-colors group-hover:text-(--accent-teal)">
          {template.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-muted-foreground text-sm">
          {template.description}
        </p>

        {/* Slot Preview */}
        <div className="mt-4 flex items-center gap-1.5 overflow-hidden opacity-70 transition-opacity group-hover:opacity-100">
          {template.slots.slice(0, 5).map((slot, i) => (
            <div
              className="h-1.5 flex-1 rounded-full bg-muted-foreground/30"
              key={i}
            />
          ))}
          {template.slots.length > 5 && (
            <span className="ml-1 text-[10px] text-muted-foreground">
              +{template.slots.length - 5}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
