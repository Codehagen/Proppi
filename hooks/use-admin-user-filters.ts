"use client";

import {
  parseAsString,
  parseAsStringLiteral,
  parseAsArrayOf,
  useQueryStates,
} from "nuqs";
import {
  ALL_USER_ROLES,
  ALL_USER_STATUSES,
  type UserRole,
  type UserStatus,
  type SortableUserColumn,
  type SortDirection,
} from "@/lib/types/admin";

// Parsers for URL state
const userFiltersParsers = {
  q: parseAsString,
  workspaceId: parseAsString,
  role: parseAsStringLiteral(ALL_USER_ROLES),
  status: parseAsStringLiteral(ALL_USER_STATUSES),
  sort: parseAsArrayOf(parseAsString), // [column, direction]
};

export function useAdminUserFilters() {
  const [filters, setFilters] = useQueryStates(userFiltersParsers, {
    history: "push",
    shallow: true,
  });

  // Parse sort state
  const sortColumn = filters.sort?.[0] as SortableUserColumn | null;
  const sortDirection = filters.sort?.[1] as SortDirection | null;

  // Convert to UserFilters format for the data layer
  const userFilters = {
    search: filters.q || undefined,
    workspaceId: filters.workspaceId || undefined,
    role: filters.role as UserRole | null,
    status: filters.status as UserStatus | null,
    sort:
      sortColumn && sortDirection
        ? ([sortColumn, sortDirection] as [SortableUserColumn, SortDirection])
        : undefined,
  };

  // Helper to check if any filters are active
  const hasActiveFilters = !!(
    filters.q ||
    filters.workspaceId ||
    filters.role ||
    filters.status
  );

  // Update search
  const setSearch = (value: string | null) => {
    setFilters({ q: value || null });
  };

  // Update workspace
  const setWorkspace = (value: string | null) => {
    setFilters({ workspaceId: value });
  };

  // Update role
  const setRole = (value: UserRole | null) => {
    setFilters({ role: value });
  };

  // Update status
  const setStatus = (value: UserStatus | null) => {
    setFilters({ status: value });
  };

  // Clear a specific filter
  const clearFilter = (key: "q" | "workspaceId" | "role" | "status") => {
    setFilters({ [key]: null });
  };

  // Clear all filters
  const clearAll = () => {
    setFilters({ q: null, workspaceId: null, role: null, status: null });
  };

  // Cycle sort: null -> asc -> desc -> null
  const toggleSort = (column: SortableUserColumn) => {
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
    userFilters,
    // Sort state
    sortColumn,
    sortDirection,
    toggleSort,
    // Helpers
    hasActiveFilters,
    setSearch,
    setWorkspace,
    setRole,
    setStatus,
    clearFilter,
    clearAll,
  };
}

export type { SortableUserColumn, SortDirection };
