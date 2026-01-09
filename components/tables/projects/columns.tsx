"use client";

import {
  IconAlertTriangle,
  IconCheck,
  IconClock,
  IconDotsVertical,
  IconEye,
  IconLoader2,
  IconTrash,
} from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Project, ProjectStatus, RoomType } from "@/lib/db/schema";
import { getRoomTypeById, getTemplateById } from "@/lib/style-templates";

// Status styling
const statusConfig: Record<
  ProjectStatus,
  {
    label: string;
    color: string;
    icon: React.ReactNode;
  }
> = {
  completed: {
    label: "Completed",
    color: "var(--accent-green)",
    icon: <IconCheck className="h-3 w-3" />,
  },
  processing: {
    label: "Processing",
    color: "var(--accent-teal)",
    icon: <IconLoader2 className="h-3 w-3 animate-spin" />,
  },
  pending: {
    label: "Pending",
    color: "var(--accent-amber)",
    icon: <IconClock className="h-3 w-3" />,
  },
  failed: {
    label: "Failed",
    color: "var(--accent-red)",
    icon: <IconAlertTriangle className="h-3 w-3" />,
  },
};

// Room type labels (English)
const roomTypeLabels: Partial<Record<RoomType, string>> = {
  "living-room": "Living Room",
  kitchen: "Kitchen",
  bedroom: "Bedroom",
  bathroom: "Bathroom",
  office: "Office",
  "dining-room": "Dining Room",
  hallway: "Hallway",
  exterior: "Exterior",
  garden: "Garden",
  terrace: "Terrace",
  garage: "Garage",
  other: "Other",
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

// Memoized cell components
const NameCell = memo(({ name, id }: { name: string; id: string }) => (
  <Link
    className="truncate font-medium text-foreground hover:underline"
    href={`/dashboard/${id}`}
  >
    {name}
  </Link>
));
NameCell.displayName = "NameCell";

const StatusCell = memo(({ status }: { status: ProjectStatus }) => {
  const config = statusConfig[status] || statusConfig.pending;
  return (
    <Badge
      className="gap-1 border-transparent"
      style={{
        backgroundColor: `color-mix(in oklch, ${config.color} 15%, transparent)`,
        color: config.color,
      }}
      variant="outline"
    >
      {config.icon}
      {config.label}
    </Badge>
  );
});
StatusCell.displayName = "StatusCell";

const StyleCell = memo(({ styleTemplateId }: { styleTemplateId: string }) => {
  const template = getTemplateById(styleTemplateId);
  return (
    <span className="truncate text-muted-foreground text-sm">
      {template?.name || "Unknown"}
    </span>
  );
});
StyleCell.displayName = "StyleCell";

const ProgressCell = memo(
  ({
    completedCount,
    imageCount,
  }: {
    completedCount: number;
    imageCount: number;
  }) => {
    const percentage = imageCount > 0 ? (completedCount / imageCount) * 100 : 0;
    return (
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${percentage}%`,
              backgroundColor: "var(--accent-teal)",
            }}
          />
        </div>
        <span className="font-mono text-muted-foreground text-xs tabular-nums">
          {completedCount}/{imageCount}
        </span>
      </div>
    );
  }
);
ProgressCell.displayName = "ProgressCell";

const RoomTypeCell = memo(({ roomType }: { roomType: string | null }) => {
  if (!roomType) return <span className="text-muted-foreground/50">—</span>;
  const label =
    roomTypeLabels[roomType as RoomType] ||
    getRoomTypeById(roomType)?.label ||
    roomType;
  return <Badge variant="tag">{label}</Badge>;
});
RoomTypeCell.displayName = "RoomTypeCell";

const DateCell = memo(({ date }: { date: Date }) => (
  <span className="text-muted-foreground text-sm">
    {formatRelativeDate(date)}
  </span>
));
DateCell.displayName = "DateCell";

const ActionsCell = memo(({ projectId }: { projectId: string }) => (
  <div className="flex items-center justify-center">
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="h-8 w-8 p-0" variant="ghost">
          <IconDotsVertical className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/${projectId}`}>
            <IconEye className="mr-2 h-4 w-4" />
            View project
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => console.log("Delete", projectId)}
        >
          <IconTrash className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
));
ActionsCell.displayName = "ActionsCell";

export const columns: ColumnDef<Project>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Name",
    size: 200,
    minSize: 150,
    cell: ({ row }) => (
      <NameCell id={row.original.id} name={row.original.name} />
    ),
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    size: 130,
    minSize: 110,
    cell: ({ row }) => (
      <StatusCell status={row.original.status as ProjectStatus} />
    ),
  },
  {
    id: "style",
    accessorKey: "styleTemplateId",
    header: "Style",
    size: 140,
    minSize: 100,
    cell: ({ row }) => (
      <StyleCell styleTemplateId={row.original.styleTemplateId} />
    ),
  },
  {
    id: "progress",
    header: "Progress",
    size: 130,
    minSize: 110,
    cell: ({ row }) => (
      <ProgressCell
        completedCount={row.original.completedCount}
        imageCount={row.original.imageCount}
      />
    ),
  },
  {
    id: "roomType",
    accessorKey: "roomType",
    header: "Room",
    size: 120,
    minSize: 90,
    cell: ({ row }) => <RoomTypeCell roomType={row.original.roomType} />,
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Created",
    size: 110,
    minSize: 90,
    cell: ({ row }) => <DateCell date={row.original.createdAt} />,
  },
  {
    id: "updatedAt",
    accessorKey: "updatedAt",
    header: "Updated",
    size: 110,
    minSize: 90,
    cell: ({ row }) => <DateCell date={row.original.updatedAt} />,
  },
  {
    id: "actions",
    header: "",
    size: 60,
    minSize: 60,
    maxSize: 60,
    enableResizing: false,
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => <ActionsCell projectId={row.original.id} />,
  },
];
