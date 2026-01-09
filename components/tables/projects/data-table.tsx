"use client";

import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useDeferredValue, useMemo, useRef } from "react";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useProjectFilters } from "@/hooks/use-project-filters";
import type { Project } from "@/lib/db/schema";
import { columns } from "./columns";
import { EmptyProjectsState, NoProjectResults } from "./empty-states";
import { ProjectsTableHeader } from "./table-header";
import { ProjectsTableToolbar } from "./table-toolbar";
import { VirtualRow } from "./virtual-row";

const ROW_HEIGHT = 56;

interface ProjectsDataTableProps {
  projects: Project[];
}

export function ProjectsDataTable({ projects }: ProjectsDataTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Get filters from URL state
  const { filters, hasActiveFilters, sortColumn, sortDirection, toggleSort } =
    useProjectFilters();

  // Defer search to debounce filtering
  const deferredSearch = useDeferredValue(filters.q);
  const deferredStatus = useDeferredValue(filters.status);

  // Filter and sort projects client-side
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    // Apply search filter
    if (deferredSearch) {
      const searchLower = deferredSearch.toLowerCase();
      result = result.filter((project) =>
        project.name.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (deferredStatus) {
      result = result.filter((project) => project.status === deferredStatus);
    }

    // Apply sorting
    if (sortColumn && sortDirection) {
      result.sort((a, b) => {
        let comparison = 0;

        switch (sortColumn) {
          case "name":
            comparison = a.name.localeCompare(b.name);
            break;
          case "status":
            comparison = a.status.localeCompare(b.status);
            break;
          case "createdAt":
            comparison = a.createdAt.getTime() - b.createdAt.getTime();
            break;
          case "updatedAt":
            comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
            break;
        }

        return sortDirection === "desc" ? -comparison : comparison;
      });
    }

    return result;
  }, [projects, deferredSearch, deferredStatus, sortColumn, sortDirection]);

  // Set up TanStack Table
  const table = useReactTable({
    data: filteredProjects,
    getRowId: (row) => row.id,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const rows = table.getRowModel().rows;

  // Set up row virtualization
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  // Empty state (no data at all)
  if (projects.length === 0 && !hasActiveFilters) {
    return (
      <div className="space-y-4">
        <ProjectsTableToolbar />
        <EmptyProjectsState />
      </div>
    );
  }

  // No results (filters applied but no matches)
  if (filteredProjects.length === 0 && hasActiveFilters) {
    return (
      <div className="space-y-4">
        <ProjectsTableToolbar />
        <NoProjectResults />
      </div>
    );
  }

  const virtualItems = rowVirtualizer.getVirtualItems();

  return (
    <div className="space-y-4">
      <ProjectsTableToolbar />

      <div className="relative overflow-hidden rounded-xl bg-card shadow-xs ring-1 ring-foreground/10">
        {/* Table Header */}
        <div className="border-border border-b">
          <Table>
            <ProjectsTableHeader
              onSort={toggleSort}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
            />
          </Table>
        </div>

        {/* Scrollable body with virtualization */}
        <div
          className="scrollbar-thin overflow-auto"
          ref={parentRef}
          style={{ height: "calc(100vh - 400px)", minHeight: "300px" }}
        >
          <Table>
            <TableBody
              className="relative block"
              style={{ height: rowVirtualizer.getTotalSize() }}
            >
              {virtualItems.length > 0 ? (
                virtualItems.map((virtualRow) => {
                  const row = rows[virtualRow.index];
                  if (!row) return null;

                  return (
                    <VirtualRow
                      key={row.id}
                      row={row}
                      rowHeight={ROW_HEIGHT}
                      virtualStart={virtualRow.start}
                    />
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    className="h-24 text-center"
                    colSpan={columns.length}
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer with count */}
        <div className="border-t px-4 py-3 text-muted-foreground text-sm">
          <span
            className="font-mono font-semibold tabular-nums"
            style={{ color: "var(--accent-teal)" }}
          >
            {filteredProjects.length}
          </span>{" "}
          {filteredProjects.length === 1 ? "project" : "projects"}
          {hasActiveFilters && ` (filtered from ${projects.length})`}
        </div>
      </div>
    </div>
  );
}
