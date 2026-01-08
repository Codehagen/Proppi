"use client";

import { IconArrowDown, IconArrowUp } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type {
  SortableWorkspaceColumn,
  SortDirection,
} from "@/hooks/use-admin-workspace-filters";

interface SortButtonProps {
  label: string;
  sortField: SortableWorkspaceColumn;
  currentSortColumn: SortableWorkspaceColumn | null;
  currentSortDirection: SortDirection | null;
  onSort: (column: SortableWorkspaceColumn) => void;
}

function SortButton({
  label,
  sortField,
  currentSortColumn,
  currentSortDirection,
  onSort,
}: SortButtonProps) {
  const isActive = sortField === currentSortColumn;

  return (
    <Button
      className="h-auto gap-1.5 p-0 font-medium text-muted-foreground hover:bg-transparent hover:text-foreground"
      onClick={() => onSort(sortField)}
      variant="ghost"
    >
      <span>{label}</span>
      {isActive && currentSortDirection === "asc" && (
        <IconArrowUp className="h-4 w-4" />
      )}
      {isActive && currentSortDirection === "desc" && (
        <IconArrowDown className="h-4 w-4" />
      )}
    </Button>
  );
}

interface ColumnConfig {
  id: string;
  label: string;
  sortField?: SortableWorkspaceColumn;
  width: number;
  minWidth?: number;
  maxWidth?: number;
}

const columnConfigs: ColumnConfig[] = [
  {
    id: "workspace",
    label: "Workspace",
    sortField: "name",
    width: 220,
    minWidth: 180,
  },
  { id: "owner", label: "Owner", width: 220, minWidth: 180 },
  {
    id: "memberCount",
    label: "Members",
    sortField: "memberCount",
    width: 90,
    minWidth: 70,
    maxWidth: 100,
  },
  {
    id: "imagesGenerated",
    label: "Images",
    sortField: "imagesGenerated",
    width: 90,
    minWidth: 70,
    maxWidth: 100,
  },
  { id: "status", label: "Status", width: 110, minWidth: 90, maxWidth: 130 },
  { id: "plan", label: "Plan", width: 110, minWidth: 90, maxWidth: 130 },
  {
    id: "totalSpend",
    label: "Spend",
    sortField: "totalSpend",
    width: 100,
    minWidth: 80,
    maxWidth: 120,
  },
  {
    id: "createdAt",
    label: "Created",
    sortField: "createdAt",
    width: 120,
    minWidth: 100,
    maxWidth: 140,
  },
  { id: "actions", label: "", width: 60, minWidth: 60, maxWidth: 60 },
];

interface WorkspacesTableHeaderProps {
  sortColumn: SortableWorkspaceColumn | null;
  sortDirection: SortDirection | null;
  onSort: (column: SortableWorkspaceColumn) => void;
}

export function WorkspacesTableHeader({
  sortColumn,
  sortDirection,
  onSort,
}: WorkspacesTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow className="flex hover:bg-transparent">
        {columnConfigs.map((column) => {
          const isFlexColumn = column.id === "workspace";
          return (
            <TableHead
              className="flex items-center"
              key={column.id}
              style={
                isFlexColumn
                  ? { flex: 1, minWidth: column.minWidth }
                  : {
                      width: column.width,
                      minWidth: column.minWidth,
                      maxWidth: column.maxWidth,
                    }
              }
            >
              {column.sortField ? (
                <SortButton
                  currentSortColumn={sortColumn}
                  currentSortDirection={sortDirection}
                  label={column.label}
                  onSort={onSort}
                  sortField={column.sortField}
                />
              ) : (
                <span className="font-medium text-muted-foreground">
                  {column.label}
                </span>
              )}
            </TableHead>
          );
        })}
      </TableRow>
    </TableHeader>
  );
}
