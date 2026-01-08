"use client";

import { IconArrowDown, IconArrowUp } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type {
  SortableUserColumn,
  SortDirection,
} from "@/hooks/use-admin-user-filters";

interface SortButtonProps {
  label: string;
  sortField: SortableUserColumn;
  currentSortColumn: SortableUserColumn | null;
  currentSortDirection: SortDirection | null;
  onSort: (column: SortableUserColumn) => void;
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
  sortField?: SortableUserColumn;
  width: number;
  minWidth?: number;
  maxWidth?: number;
}

const columnConfigs: ColumnConfig[] = [
  { id: "user", label: "User", sortField: "name", width: 240, minWidth: 200 },
  {
    id: "workspace",
    label: "Workspace",
    width: 180,
    minWidth: 140,
    maxWidth: 220,
  },
  {
    id: "role",
    label: "Role",
    sortField: "role",
    width: 100,
    minWidth: 80,
    maxWidth: 120,
  },
  {
    id: "status",
    label: "Status",
    sortField: "status",
    width: 100,
    minWidth: 80,
    maxWidth: 120,
  },
  {
    id: "imagesGenerated",
    label: "Images",
    sortField: "imagesGenerated",
    width: 90,
    minWidth: 70,
    maxWidth: 100,
  },
  {
    id: "lastActiveAt",
    label: "Last Active",
    sortField: "lastActiveAt",
    width: 110,
    minWidth: 90,
    maxWidth: 130,
  },
  {
    id: "joinedAt",
    label: "Joined",
    sortField: "joinedAt",
    width: 120,
    minWidth: 100,
    maxWidth: 140,
  },
  { id: "actions", label: "", width: 60, minWidth: 60, maxWidth: 60 },
];

interface UsersTableHeaderProps {
  sortColumn: SortableUserColumn | null;
  sortDirection: SortDirection | null;
  onSort: (column: SortableUserColumn) => void;
}

export function UsersTableHeader({
  sortColumn,
  sortDirection,
  onSort,
}: UsersTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow className="flex hover:bg-transparent">
        {columnConfigs.map((column) => {
          const isFlexColumn = column.id === "user";
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
