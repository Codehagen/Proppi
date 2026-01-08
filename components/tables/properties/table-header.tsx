"use client";

import { IconArrowDown, IconArrowUp } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type {
  SortableColumn,
  SortDirection,
} from "@/hooks/use-property-filters";

interface SortButtonProps {
  label: string;
  sortField: SortableColumn;
  currentSortColumn: SortableColumn | null;
  currentSortDirection: SortDirection | null;
  onSort: (column: SortableColumn) => void;
  width: number;
  minWidth?: number;
  maxWidth?: number;
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
  sortField?: SortableColumn;
  width: number;
  minWidth?: number;
  maxWidth?: number;
}

const columnConfigs: ColumnConfig[] = [
  {
    id: "address",
    label: "Address",
    sortField: "address",
    width: 280,
    minWidth: 200,
  },
  {
    id: "status",
    label: "Status",
    sortField: "status",
    width: 120,
    minWidth: 100,
    maxWidth: 140,
  },
  { id: "tags", label: "Tags", width: 200, minWidth: 150 },
  {
    id: "editCount",
    label: "Edits",
    sortField: "editCount",
    width: 80,
    minWidth: 60,
    maxWidth: 100,
  },
  { id: "actions", label: "", width: 60, minWidth: 60, maxWidth: 60 },
];

interface DataTableHeaderProps {
  sortColumn: SortableColumn | null;
  sortDirection: SortDirection | null;
  onSort: (column: SortableColumn) => void;
}

export function DataTableHeader({
  sortColumn,
  sortDirection,
  onSort,
}: DataTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow className="flex hover:bg-transparent">
        {columnConfigs.map((column) => {
          const isFlexColumn = column.id === "address";
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
                  maxWidth={column.maxWidth}
                  minWidth={column.minWidth}
                  onSort={onSort}
                  sortField={column.sortField}
                  width={column.width}
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
