"use client";

import {
  IconDotsVertical,
  IconEye,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
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
import type { Property, PropertyStatus } from "@/lib/mock/properties";

// Status color mapping using CSS custom properties
const statusColorMap: Record<PropertyStatus, string> = {
  active: "var(--accent-green)",
  pending: "var(--accent-amber)",
  completed: "var(--accent-teal)",
  archived: "var(--accent-red)",
};

const statusLabelMap: Record<PropertyStatus, string> = {
  active: "Active",
  pending: "Pending",
  completed: "Completed",
  archived: "Archived",
};

// Memoized cell components for performance
const AddressCell = memo(
  ({
    address,
    city,
    state,
  }: {
    address: string;
    city: string;
    state: string;
  }) => (
    <div className="flex min-w-0 flex-col">
      <span className="truncate font-medium">{address}</span>
      <span className="truncate text-muted-foreground text-xs">
        {city}, {state}
      </span>
    </div>
  )
);
AddressCell.displayName = "AddressCell";

const StatusCell = memo(({ status }: { status: PropertyStatus }) => (
  <Badge
    className="border-transparent"
    style={{
      backgroundColor: `color-mix(in oklch, ${statusColorMap[status]} 15%, transparent)`,
      color: statusColorMap[status],
    }}
    variant="outline"
  >
    {statusLabelMap[status]}
  </Badge>
));
StatusCell.displayName = "StatusCell";

const TagsCell = memo(({ tags }: { tags: string[] }) => (
  <div className="scrollbar-hide flex items-center gap-1 overflow-x-auto">
    {tags.map((tag) => (
      <Badge className="shrink-0 capitalize" key={tag} variant="tag">
        {tag}
      </Badge>
    ))}
  </div>
));
TagsCell.displayName = "TagsCell";

const ActionsCell = memo(({ propertyId }: { propertyId: string }) => (
  <div className="flex items-center justify-center">
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="h-8 w-8 p-0" variant="ghost">
          <IconDotsVertical className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => console.log("View", propertyId)}>
          <IconEye className="mr-2 h-4 w-4" />
          View details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => console.log("Edit", propertyId)}>
          <IconPencil className="mr-2 h-4 w-4" />
          Edit property
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => console.log("Delete", propertyId)}
        >
          <IconTrash className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
));
ActionsCell.displayName = "ActionsCell";

export const columns: ColumnDef<Property>[] = [
  {
    id: "address",
    accessorKey: "address",
    header: "Address",
    size: 280,
    minSize: 200,
    cell: ({ row }) => (
      <AddressCell
        address={row.original.address}
        city={row.original.city}
        state={row.original.state}
      />
    ),
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    size: 120,
    minSize: 100,
    cell: ({ row }) => <StatusCell status={row.original.status} />,
  },
  {
    id: "tags",
    accessorKey: "tags",
    header: "Tags",
    size: 220,
    minSize: 150,
    cell: ({ row }) => <TagsCell tags={row.original.tags} />,
  },
  {
    id: "editCount",
    accessorKey: "editCount",
    header: "Edits",
    size: 80,
    minSize: 60,
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.editCount}</span>
    ),
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
    cell: ({ row }) => <ActionsCell propertyId={row.original.id} />,
  },
];
