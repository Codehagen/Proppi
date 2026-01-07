"use client";

import { cn } from "@/lib/utils";
import { TableCell, TableRow } from "@/components/ui/table";
import type { Row } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import type { CSSProperties } from "react";
import { memo } from "react";
import { useRouter } from "next/navigation";
import type { AdminUserRow } from "@/lib/types/admin";

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
  const router = useRouter();
  const cells = row.getVisibleCells();

  const handleRowClick = () => {
    const userId = (row.original as AdminUserRow).id;
    router.push(`/admin/users/${userId}`);
  };

  return (
    <TableRow
      data-index={row.index}
      onClick={handleRowClick}
      className={cn(
        "group cursor-pointer select-text",
        "hover:bg-muted/50",
        "flex items-center border-0",
        "absolute top-0 left-0 w-full",
      )}
      style={
        {
          height: rowHeight,
          transform: `translateY(${virtualStart}px)`,
          contain: "layout style paint",
        } as CSSProperties
      }
    >
      {cells.map((cell) => {
        const isFlexColumn = cell.column.id === "user";
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
            key={cell.id}
            className={cn(
              "h-full flex items-center border-b border-border px-4",
              cell.column.id === "actions" && "justify-center",
            )}
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

// Custom comparison for memo
function arePropsEqual<TData>(
  prevProps: VirtualRowProps<TData>,
  nextProps: VirtualRowProps<TData>,
): boolean {
  return (
    prevProps.row.id === nextProps.row.id &&
    prevProps.virtualStart === nextProps.virtualStart &&
    prevProps.rowHeight === nextProps.rowHeight &&
    prevProps.row.original === nextProps.row.original
  );
}

export const UserVirtualRow = memo(VirtualRowInner, arePropsEqual) as <TData>(
  props: VirtualRowProps<TData>,
) => React.ReactNode;
