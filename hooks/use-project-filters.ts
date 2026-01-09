"use client";

import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";
import type { ProjectStatus } from "@/lib/db/schema";

export type SortDirection = "asc" | "desc";
export type ProjectSortableColumn =
  | "name"
  | "status"
  | "createdAt"
  | "updatedAt";

const ALL_PROJECT_STATUSES = [
  "pending",
  "processing",
  "completed",
  "failed",
] as const;

// Parsers for URL state
const projectFiltersParsers = {
  q: parseAsString,
  status: parseAsStringLiteral(ALL_PROJECT_STATUSES),
  sortBy: parseAsString,
  sortDir: parseAsStringLiteral(["asc", "desc"] as const),
};

export function useProjectFilters() {
  const [filters, setFilters] = useQueryStates(projectFiltersParsers, {
    history: "push",
    shallow: true,
  });

  // Parse sort state
  const sortColumn = filters.sortBy as ProjectSortableColumn | null;
  const sortDirection = filters.sortDir as SortDirection | null;

  // Helper to check if any filters are active
  const hasActiveFilters = !!(filters.q || filters.status);

  // Update search
  const setSearch = (value: string | null) => {
    setFilters({ q: value || null });
  };

  // Update status
  const setStatus = (value: ProjectStatus | null) => {
    setFilters({ status: value });
  };

  // Clear a specific filter
  const clearFilter = (key: "q" | "status") => {
    setFilters({ [key]: null });
  };

  // Clear all filters
  const clearAll = () => {
    setFilters({ q: null, status: null });
  };

  // Cycle sort: null -> asc -> desc -> null
  const toggleSort = (column: ProjectSortableColumn) => {
    if (sortColumn === column) {
      if (sortDirection === "asc") {
        setFilters({ sortBy: column, sortDir: "desc" });
      } else if (sortDirection === "desc") {
        setFilters({ sortBy: null, sortDir: null });
      } else {
        setFilters({ sortBy: column, sortDir: "asc" });
      }
    } else {
      setFilters({ sortBy: column, sortDir: "asc" });
    }
  };

  return {
    // Raw URL state
    filters,
    setFilters,
    // Sort state
    sortColumn,
    sortDirection,
    toggleSort,
    // Helpers
    hasActiveFilters,
    setSearch,
    setStatus,
    clearFilter,
    clearAll,
  };
}

export const ALL_PROJECT_STATUSES_LIST = ALL_PROJECT_STATUSES;
