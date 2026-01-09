"use client";

import { IconSearch, IconX } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ALL_PROJECT_STATUSES_LIST,
  useProjectFilters,
} from "@/hooks/use-project-filters";
import type { ProjectStatus } from "@/lib/db/schema";

const statusLabels: Record<ProjectStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  completed: "Completed",
  failed: "Failed",
};

export function ProjectsTableToolbar() {
  const {
    filters,
    hasActiveFilters,
    setSearch,
    setStatus,
    clearFilter,
    clearAll,
  } = useProjectFilters();

  return (
    <div className="space-y-3">
      {/* Filters row with visual grouping */}
      <div className="flex flex-col gap-3 rounded-xl bg-muted/30 p-3 ring-1 ring-foreground/5 sm:flex-row sm:items-center">
        {/* Search input */}
        <div className="relative flex-1 sm:max-w-[320px]">
          <IconSearch className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="focus-ring border-foreground/10 bg-background/80 pl-9 transition-shadow"
            onChange={(e) => setSearch(e.target.value || null)}
            placeholder="Search projects…"
            value={filters.q || ""}
          />
        </div>

        {/* Filter controls group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <Select
            onValueChange={(value) =>
              setStatus(value === "all" ? null : (value as ProjectStatus))
            }
            value={filters.status || "all"}
          >
            <SelectTrigger className="w-full border-foreground/10 bg-background/80 sm:w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {ALL_PROJECT_STATUSES_LIST.map((status) => (
                <SelectItem key={status} value={status}>
                  {statusLabels[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear all button */}
          {hasActiveFilters && (
            <Button
              className="text-muted-foreground transition-colors hover:text-destructive"
              onClick={clearAll}
              size="sm"
              variant="ghost"
            >
              <IconX className="mr-1 h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Active filters pills with animation */}
      {hasActiveFilters && (
        <div className="flex animate-fade-in flex-wrap items-center gap-2">
          <span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
            Active filters:
          </span>
          {filters.q && (
            <Badge
              className="animate-scale-in gap-1.5 pr-1.5"
              style={{ animationDelay: "0ms" }}
              variant="secondary"
            >
              <span className="text-muted-foreground">Search:</span> {filters.q}
              <button
                className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-foreground/10"
                onClick={() => clearFilter("q")}
                type="button"
              >
                <IconX className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.status && (
            <Badge
              className="animate-scale-in gap-1.5 pr-1.5"
              style={{ animationDelay: "50ms" }}
              variant="secondary"
            >
              <span className="text-muted-foreground">Status:</span>{" "}
              {statusLabels[filters.status]}
              <button
                className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-foreground/10"
                onClick={() => clearFilter("status")}
                type="button"
              >
                <IconX className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
