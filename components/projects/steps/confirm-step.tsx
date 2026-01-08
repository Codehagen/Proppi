"use client";

import { IconPhoto } from "@tabler/icons-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UploadedImage } from "@/hooks/use-project-creation";
import type { StyleTemplate } from "@/lib/style-templates";
import { cn } from "@/lib/utils";

interface ConfirmStepProps {
  images: UploadedImage[];
  selectedTemplate: StyleTemplate | null;
  projectName: string;
  onProjectNameChange: (name: string) => void;
}

export function ConfirmStep({
  images,
  selectedTemplate,
  projectName,
  onProjectNameChange,
}: ConfirmStepProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {/* Left: Image stack preview */}
      <div className="space-y-3">
        <h3 className="font-medium text-foreground text-sm">Images</h3>
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
          {/* Stacked image preview */}
          {images.slice(0, 3).map((image, index) => (
            <div
              className={cn(
                "absolute inset-0 overflow-hidden rounded-xl shadow-lg ring-1 ring-white/10 transition-transform duration-300"
              )}
              key={image.id}
              style={{
                transform: `rotate(${(index - 1) * 3}deg) scale(${1 - index * 0.05})`,
                zIndex: 3 - index,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={image.name}
                className="h-full w-full object-cover"
                src={image.preview}
              />
            </div>
          ))}

          {/* Image count badge */}
          <div className="absolute right-3 bottom-3 z-10 flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 font-medium text-sm text-white backdrop-blur-sm">
            <IconPhoto className="h-4 w-4" />
            {images.length} image{images.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Right: Summary */}
      <div className="space-y-4">
        {/* Project name */}
        <div className="space-y-2">
          <Label className="font-medium text-sm" htmlFor="project-name">
            Project Name
          </Label>
          <Input
            className="h-10"
            id="project-name"
            onChange={(e) => onProjectNameChange(e.target.value)}
            placeholder="e.g., 123 Main Street"
            value={projectName}
          />
        </div>

        {/* Style */}
        <div className="space-y-2">
          <Label className="font-medium text-sm">Style</Label>
          {selectedTemplate && (
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3 ring-1 ring-foreground/5">
              <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                <Image
                  alt={selectedTemplate.name}
                  className="object-cover"
                  fill
                  src={selectedTemplate.thumbnail}
                />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-foreground">
                  {selectedTemplate.name}
                </p>
                <p className="line-clamp-1 text-muted-foreground text-xs">
                  {selectedTemplate.description}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Summary info */}
        <div className="rounded-lg bg-muted/50 p-4 ring-1 ring-foreground/5">
          <p className="text-muted-foreground text-sm">
            {images.length} image{images.length !== 1 ? "s" : ""} will be
            transformed using the{" "}
            <span className="font-medium text-foreground">
              {selectedTemplate?.name}
            </span>{" "}
            style.
          </p>
        </div>
      </div>
    </div>
  );
}
