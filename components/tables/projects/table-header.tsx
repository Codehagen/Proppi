"use client";

import { IconArrowDown, IconArrowUp } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type {
  ProjectSortableColumn,
  SortDirection,
} from "@/hooks/use-project-filters";

interface SortButtonProps {
  label: string;
  sortField: ProjectSortableColumn;
  currentSortColumn: ProjectSortableColumn | null;
  currentSortDirection: SortDirection | null;
  onSort: (column: ProjectSortableColumn) => void;
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
  sortField?: ProjectSortableColumn;
  width: number;
  minWidth?: number;
  maxWidth?: number;
}

const columnConfigs: ColumnConfig[] = [
  {
    id: "name",
    label: "Name",
    sortField: "name",
    width: 200,
    minWidth: 150,
  },
  {
    id: "status",
    label: "Status",
    sortField: "status",
    width: 130,
    minWidth: 110,
  },
  {
    id: "style",
    label: "Style",
    width: 140,
    minWidth: 100,
  },
  {
    id: "progress",
    label: "Progress",
    width: 130,
    minWidth: 110,
  },
  {
    id: "roomType",
    label: "Room",
    width: 120,
    minWidth: 90,
  },
  {
    id: "createdAt",
    label: "Created",
    sortField: "createdAt",
    width: 110,
    minWidth: 90,
  },
  {
    id: "updatedAt",
    label: "Updated",
    sortField: "updatedAt",
    width: 110,
    minWidth: 90,
  },
  {
    id: "actions",
    label: "",
    width: 60,
    minWidth: 60,
    maxWidth: 60,
  },
];

interface ProjectsTableHeaderProps {
  sortColumn: ProjectSortableColumn | null;
  sortDirection: SortDirection | null;
  onSort: (column: ProjectSortableColumn) => void;
}

export function ProjectsTableHeader({
  sortColumn,
  sortDirection,
  onSort,
}: ProjectsTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow className="flex hover:bg-transparent">
        {columnConfigs.map((column) => {
          const isFlexColumn = column.id === "name";
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
