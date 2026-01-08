"use client";

import {
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import type { WorkspacePlan, WorkspaceStatus } from "@/lib/db/schema";
import {
  ALL_WORKSPACE_PLANS,
  ALL_WORKSPACE_STATUSES,
  type SortableWorkspaceColumn,
  type SortDirection,
} from "@/lib/types/admin";

// Parsers for URL state
const workspaceFiltersParsers = {
  q: parseAsString,
  status: parseAsStringLiteral(ALL_WORKSPACE_STATUSES),
  plan: parseAsStringLiteral(ALL_WORKSPACE_PLANS),
  sort: parseAsArrayOf(parseAsString), // [column, direction]
};

export function useAdminWorkspaceFilters() {
  const [filters, setFilters] = useQueryStates(workspaceFiltersParsers, {
    history: "push",
    shallow: true,
  });

  // Parse sort state
  const sortColumn = filters.sort?.[0] as SortableWorkspaceColumn | null;
  const sortDirection = filters.sort?.[1] as SortDirection | null;

  // Convert to WorkspaceFilters format for the data layer
  const workspaceFilters = {
    search: filters.q || undefined,
    status: filters.status as WorkspaceStatus | null,
    plan: filters.plan as WorkspacePlan | null,
    sort:
      sortColumn && sortDirection
        ? ([sortColumn, sortDirection] as [
            SortableWorkspaceColumn,
            SortDirection,
          ])
        : undefined,
  };

  // Helper to check if any filters are active
  const hasActiveFilters = !!(filters.q || filters.status || filters.plan);

  // Update search
  const setSearch = (value: string | null) => {
    setFilters({ q: value || null });
  };

  // Update status
  const setStatus = (value: WorkspaceStatus | null) => {
    setFilters({ status: value });
  };

  // Update plan
  const setPlan = (value: WorkspacePlan | null) => {
    setFilters({ plan: value });
  };

  // Clear a specific filter
  const clearFilter = (key: "q" | "status" | "plan") => {
    setFilters({ [key]: null });
  };

  // Clear all filters
  const clearAll = () => {
    setFilters({ q: null, status: null, plan: null });
  };

  // Cycle sort: null -> asc -> desc -> null
  const toggleSort = (column: SortableWorkspaceColumn) => {
    if (sortColumn === column) {
      if (sortDirection === "asc") {
        setFilters({ sort: [column, "desc"] });
      } else if (sortDirection === "desc") {
        setFilters({ sort: null });
      } else {
        setFilters({ sort: [column, "asc"] });
      }
    } else {
      setFilters({ sort: [column, "asc"] });
    }
  };

  return {
    // Raw URL state
    filters,
    setFilters,
    // Formatted for data layer
    workspaceFilters,
    // Sort state
    sortColumn,
    sortDirection,
    toggleSort,
    // Helpers
    hasActiveFilters,
    setSearch,
    setStatus,
    setPlan,
    clearFilter,
    clearAll,
  };
}

export type { SortableWorkspaceColumn, SortDirection };
