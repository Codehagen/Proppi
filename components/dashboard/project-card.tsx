"use client";

import {
  IconAlertTriangle,
  IconCheck,
  IconClock,
  IconLoader2,
  IconPhoto,
  IconPhotoOff,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import type * as React from "react";
import { Badge } from "@/components/ui/badge";
import type { Project, ProjectStatus } from "@/lib/db/schema";
import { getTemplateById } from "@/lib/style-templates";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  className?: string;
  style?: React.CSSProperties;
}

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

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

export function ProjectCard({ project, className, style }: ProjectCardProps) {
  const template = getTemplateById(project.styleTemplateId);
  const status =
    statusConfig[project.status as ProjectStatus] || statusConfig.pending;

  return (
    <Link
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/5 transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-lg hover:ring-foreground/10",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        className
      )}
      href={`/dashboard/${project.id}`}
      style={
        {
          ...style,
          "--focus-ring": "var(--accent-teal)",
        } as React.CSSProperties
      }
    >
      {/* Thumbnail with overlay */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {project.thumbnailUrl ? (
          <Image
            alt={project.name}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            src={project.thumbnailUrl}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <IconPhotoOff className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}

        {/* Gradient overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <Badge
            className="gap-1 shadow-sm backdrop-blur-sm"
            variant={status.variant}
          >
            {status.icon}
            {status.label}
          </Badge>
        </div>

        {/* Progress indicator for processing */}
        {project.status === "processing" && (
          <div className="absolute right-0 bottom-0 left-0 h-1 bg-black/30">
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${(project.completedCount / project.imageCount) * 100}%`,
                backgroundColor: "var(--accent-teal)",
              }}
            />
          </div>
        )}

        {/* Image count overlay */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white/90">
          <IconPhoto className="h-4 w-4" />
          <span className="font-mono text-sm tabular-nums">
            {project.completedCount}/{project.imageCount}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="line-clamp-1 font-semibold text-foreground leading-tight tracking-tight">
          {project.name}
        </h3>

        <div className="flex items-center justify-between gap-2">
          <p className="line-clamp-1 text-muted-foreground text-sm">
            {template?.name || "Unknown Style"}
          </p>
          <span className="shrink-0 text-muted-foreground/70 text-xs">
            {formatRelativeDate(project.createdAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}
