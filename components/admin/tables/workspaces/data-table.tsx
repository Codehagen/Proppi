"use client";

import { IconBuildingOff, IconLoader2 } from "@tabler/icons-react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useAdminWorkspaceFilters } from "@/hooks/use-admin-workspace-filters";
import { useImpersonation } from "@/hooks/use-impersonation";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import {
  deleteWorkspaceAction,
  fetchAdminWorkspacesAction,
  updateWorkspaceStatusAction,
} from "@/lib/actions/admin";
import type { AdminWorkspaceRow, AdminWorkspacesMeta } from "@/lib/types/admin";
import { createWorkspaceColumns } from "./columns";
import { WorkspacesTableHeader } from "./table-header";
import { WorkspacesTableToolbar } from "./table-toolbar";
import { WorkspaceVirtualRow } from "./virtual-row";

const ROW_HEIGHT = 64;

interface WorkspacesDataTableProps {
  initialData: AdminWorkspaceRow[];
  initialMeta: AdminWorkspacesMeta;
}

export function WorkspacesDataTable({
  initialData,
  initialMeta,
}: WorkspacesDataTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { startImpersonation } = useImpersonation();

  // Get filters from URL state
  const {
    workspaceFilters,
    hasActiveFilters,
    sortColumn,
    sortDirection,
    toggleSort,
  } = useAdminWorkspaceFilters();

  // Defer search to debounce filtering
  const deferredFilters = useDeferredValue(workspaceFilters);
  const [isPending, startTransition] = useTransition();

  // Pagination state - initialize with SSR data
  const [pages, setPages] = useState<AdminWorkspaceRow[][]>([initialData]);
  const [cursor, setCursor] = useState<string | null>(initialMeta.cursor);
  const [hasNextPage, setHasNextPage] = useState(initialMeta.hasMore);
  const [filteredTotal, setFilteredTotal] = useState(initialMeta.total);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(false); // Already loaded via SSR

  // Handlers for workspace actions
  const handleSuspend = useCallback(
    async (workspaceId: string, workspaceName: string) => {
      const reason = window.prompt(
        `Enter reason for suspending "${workspaceName}" (optional):`
      );
      if (reason === null) return; // User cancelled

      const result = await updateWorkspaceStatusAction(
        workspaceId,
        "suspended",
        reason || undefined
      );

      if (result.success) {
        toast.success(`Workspace "${workspaceName}" has been suspended`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    },
    [router]
  );

  const handleActivate = useCallback(
    async (workspaceId: string, workspaceName: string) => {
      const result = await updateWorkspaceStatusAction(workspaceId, "active");

      if (result.success) {
        toast.success(`Workspace "${workspaceName}" has been activated`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    },
    [router]
  );

  const handleDelete = useCallback(
    async (workspaceId: string, workspaceName: string) => {
      const confirmed = window.confirm(
        `Are you sure you want to delete "${workspaceName}"?\n\nThis will permanently delete all data including users, projects, and images. This action cannot be undone.`
      );
      if (!confirmed) return;

      const result = await deleteWorkspaceAction(workspaceId);

      if (result.success) {
        toast.success(`Workspace "${workspaceName}" has been deleted`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    },
    [router]
  );

  // Create columns with handlers
  const columns = useMemo(
    () =>
      createWorkspaceColumns({
        onImpersonate: (user) => startImpersonation(user),
        onSuspend: handleSuspend,
        onActivate: handleActivate,
        onDelete: handleDelete,
      }),
    [startImpersonation, handleSuspend, handleActivate, handleDelete]
  );

  // Reset pagination when filters change
  useEffect(() => {
    // Skip if this is the initial render (SSR data already loaded)
    const filtersChanged =
      deferredFilters.search !== workspaceFilters.search ||
      deferredFilters.status !== workspaceFilters.status ||
      deferredFilters.plan !== workspaceFilters.plan;

    if (!filtersChanged && pages[0] === initialData) {
      return;
    }

    startTransition(async () => {
      const result = await fetchAdminWorkspacesAction(
        null,
        20,
        {
          search: deferredFilters.search || undefined,
          status: deferredFilters.status || undefined,
          plan: deferredFilters.plan || undefined,
        },
        sortColumn && sortDirection ? [sortColumn, sortDirection] : undefined
      );

      if (result.success) {
        setPages([result.data.data]);
        setCursor(result.data.meta.cursor);
        setHasNextPage(result.data.meta.hasMore);
        setFilteredTotal(result.data.meta.total);
      }
    });
  }, [deferredFilters, sortColumn, sortDirection]);

  // Flatten all pages into single array
  const tableData = useMemo(() => pages.flat(), [pages]);

  // Fetch next page function
  const fetchNextPage = useCallback(async () => {
    if (isFetchingNextPage || !hasNextPage) return;

    setIsFetchingNextPage(true);

    const result = await fetchAdminWorkspacesAction(
      cursor,
      20,
      {
        search: deferredFilters.search || undefined,
        status: deferredFilters.status || undefined,
        plan: deferredFilters.plan || undefined,
      },
      sortColumn && sortDirection ? [sortColumn, sortDirection] : undefined
    );

    if (result.success) {
      setPages((prev) => [...prev, result.data.data]);
      setCursor(result.data.meta.cursor);
      setHasNextPage(result.data.meta.hasMore);
      setFilteredTotal(result.data.meta.total);
    }

    setIsFetchingNextPage(false);
  }, [
    cursor,
    hasNextPage,
    isFetchingNextPage,
    deferredFilters,
    sortColumn,
    sortDirection,
  ]);

  // Set up TanStack Table
  const table = useReactTable({
    data: tableData,
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

  // Infinite scroll hook
  useInfiniteScroll({
    scrollRef: parentRef,
    rowVirtualizer,
    rowCount: rows.length,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    threshold: 10,
  });

  // Loading skeleton state
  if (isInitialLoad) {
    return (
      <div className="space-y-4">
        <WorkspacesTableToolbar />
        <div className="relative overflow-hidden rounded-xl bg-card shadow-xs ring-1 ring-foreground/10">
          {/* Skeleton Header */}
          <div className="flex items-center gap-4 border-b px-4 py-3">
            <div className="skeleton h-4 w-32" />
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-4 w-16" />
            <div className="skeleton h-4 w-16" />
            <div className="skeleton h-4 w-20" />
            <div className="skeleton h-4 w-20" />
          </div>
          {/* Skeleton Rows */}
          <div className="divide-y">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                className="flex items-center gap-4 px-4 py-4"
                key={i}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex flex-1 flex-col gap-1.5">
                  <div className="skeleton h-4 w-40" />
                  <div className="skeleton h-3 w-28" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="skeleton h-7 w-7 rounded-full" />
                  <div className="flex flex-col gap-1">
                    <div className="skeleton h-3.5 w-24" />
                    <div className="skeleton h-3 w-32" />
                  </div>
                </div>
                <div className="skeleton h-5 w-8 rounded-full" />
                <div className="skeleton h-4 w-12" />
                <div className="skeleton h-5 w-16 rounded-full" />
                <div className="skeleton h-5 w-16 rounded-full" />
                <div className="skeleton h-4 w-14" />
                <div className="skeleton h-4 w-20" />
                <div className="skeleton h-8 w-8 rounded-md" />
              </div>
            ))}
          </div>
          {/* Skeleton Footer */}
          <div className="border-t px-4 py-3">
            <div className="skeleton h-4 w-32" />
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (tableData.length === 0 && !hasActiveFilters) {
    return (
      <div className="space-y-4">
        <WorkspacesTableToolbar />
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <div
            className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
            style={{
              backgroundColor:
                "color-mix(in oklch, var(--accent-violet) 15%, transparent)",
            }}
          >
            <IconBuildingOff
              className="h-6 w-6"
              style={{ color: "var(--accent-violet)" }}
            />
          </div>
          <h3 className="font-semibold text-lg">No workspaces yet</h3>
          <p className="mt-1 text-muted-foreground text-sm">
            Workspaces will appear here once users create them.
          </p>
        </div>
      </div>
    );
  }

  // No results with filters
  if (tableData.length === 0 && hasActiveFilters) {
    return (
      <div className="space-y-4">
        <WorkspacesTableToolbar />
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
            <IconBuildingOff className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg">No matching workspaces</h3>
          <p className="mt-1 text-muted-foreground text-sm">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      </div>
    );
  }

  const virtualItems = rowVirtualizer.getVirtualItems();

  return (
    <div className="space-y-4">
      <WorkspacesTableToolbar />

      <div className="relative overflow-hidden rounded-xl bg-card shadow-xs ring-1 ring-foreground/10">
        {/* Table Header */}
        <div className="border-border border-b">
          <Table>
            <WorkspacesTableHeader
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
                    <WorkspaceVirtualRow
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

          {/* Loading indicator */}
          {isFetchingNextPage && (
            <div className="flex items-center justify-center py-4">
              <IconLoader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground text-sm">
                Loading more...
              </span>
            </div>
          )}
        </div>

        {/* Footer with count */}
        <div className="border-t px-4 py-3 text-muted-foreground text-sm">
          <span
            className="font-mono font-semibold"
            style={{ color: "var(--accent-violet)" }}
          >
            {tableData.length}
          </span>{" "}
          of {filteredTotal} workspaces
          {hasNextPage && " (scroll for more)"}
        </div>
      </div>
    </div>
  );
}
