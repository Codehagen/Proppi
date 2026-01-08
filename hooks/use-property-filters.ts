"use client";

import {
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import {
  ALL_STATUSES,
  ALL_TAGS,
  type PropertyStatus,
  type PropertyTag,
} from "@/lib/mock/properties";

export type SortDirection = "asc" | "desc";
export type SortableColumn =
  | "address"
  | "status"
  | "editCount"
  | "totalCost"
  | "createdAt";

// Parsers for URL state
const propertyFiltersParsers = {
  q: parseAsString,
  status: parseAsStringLiteral(ALL_STATUSES),
  tags: parseAsArrayOf(parseAsStringLiteral(ALL_TAGS)),
  sort: parseAsArrayOf(parseAsString), // [column, direction]
};

export function usePropertyFilters() {
  const [filters, setFilters] = useQueryStates(propertyFiltersParsers, {
    history: "push",
    shallow: true,
  });

  // Parse sort state
  const sortColumn = filters.sort?.[0] as SortableColumn | null;
  const sortDirection = filters.sort?.[1] as SortDirection | null;

  // Convert to PropertyFilters format for the data layer
  const propertyFilters = {
    search: filters.q || undefined,
    status: filters.status as PropertyStatus | null,
    tags: (filters.tags as PropertyTag[]) || undefined,
    sort:
      sortColumn && sortDirection
        ? ([sortColumn, sortDirection] as [SortableColumn, SortDirection])
        : undefined,
  };

  // Helper to check if any filters are active
  const hasActiveFilters = !!(
    filters.q ||
    filters.status ||
    (filters.tags && filters.tags.length > 0)
  );

  // Update search
  const setSearch = (value: string | null) => {
    setFilters({ q: value || null });
  };

  // Update status
  const setStatus = (value: PropertyStatus | null) => {
    setFilters({ status: value });
  };

  // Toggle a tag
  const toggleTag = (tag: PropertyTag) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];
    setFilters({ tags: newTags.length > 0 ? newTags : null });
  };

  // Clear a specific filter
  const clearFilter = (key: "q" | "status" | "tags") => {
    setFilters({ [key]: null });
  };

  // Clear all filters
  const clearAll = () => {
    setFilters({ q: null, status: null, tags: null });
  };

  // Cycle sort: null -> asc -> desc -> null
  const toggleSort = (column: SortableColumn) => {
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
    propertyFilters,
    // Sort state
    sortColumn,
    sortDirection,
    toggleSort,
    // Helpers
    hasActiveFilters,
    setSearch,
    setStatus,
    toggleTag,
    clearFilter,
    clearAll,
  };
}
