"use client";

import type { Row } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import type { CSSProperties } from "react";
import { memo } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface VirtualRowProps<TData> {
  row: Row<TData>;
  virtualStart: number;
  rowHeight: number;
}

function VirtualRowInner<TData>({
  row,
  virtualStart,
  rowHeight,
}: VirtualRowProps<TData>) {
  const cells = row.getVisibleCells();

  return (
    <TableRow
      className={cn(
        "group cursor-pointer select-text",
        "hover:bg-muted/50",
        "flex items-center border-0",
        "absolute top-0 left-0 w-full"
      )}
      data-index={row.index}
      style={
        {
          height: rowHeight,
          transform: `translateY(${virtualStart}px)`,
          contain: "layout style paint",
        } as CSSProperties
      }
    >
      {cells.map((cell) => {
        const isFlexColumn = cell.column.id === "address";
        const cellStyle: CSSProperties = isFlexColumn
          ? {
              flex: 1,
              minWidth: cell.column.columnDef.minSize,
            }
          : {
              width: cell.column.getSize(),
              minWidth: cell.column.columnDef.minSize,
              maxWidth: cell.column.columnDef.maxSize,
            };

        return (
          <TableCell
            className={cn(
              "flex h-full items-center border-border border-b px-4",
              cell.column.id === "actions" && "justify-center"
            )}
            key={cell.id}
            style={cellStyle}
          >
            <div className="w-full overflow-hidden">
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </div>
          </TableCell>
        );
      })}
    </TableRow>
  );
}

// Custom comparison for memo - re-render when row data or position changes
function arePropsEqual<TData>(
  prevProps: VirtualRowProps<TData>,
  nextProps: VirtualRowProps<TData>
): boolean {
  return (
    prevProps.row.id === nextProps.row.id &&
    prevProps.virtualStart === nextProps.virtualStart &&
    prevProps.rowHeight === nextProps.rowHeight &&
    prevProps.row.original === nextProps.row.original
  );
}

// Export memoized component with generics
export const VirtualRow = memo(VirtualRowInner, arePropsEqual) as <TData>(
  props: VirtualRowProps<TData>
) => React.ReactNode;
