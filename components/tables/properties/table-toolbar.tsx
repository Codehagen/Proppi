"use client";

import { IconFilter, IconSearch, IconX } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePropertyFilters } from "@/hooks/use-property-filters";
import {
  ALL_STATUSES,
  ALL_TAGS,
  type PropertyStatus,
  type PropertyTag,
} from "@/lib/mock/properties";

const statusLabels: Record<PropertyStatus, string> = {
  active: "Active",
  pending: "Pending",
  completed: "Completed",
  archived: "Archived",
};

const tagLabels: Record<PropertyTag, string> = {
  residential: "Residential",
  commercial: "Commercial",
  luxury: "Luxury",
  staging: "Staging",
  exterior: "Exterior",
  interior: "Interior",
  renovation: "Renovation",
};

export function TableToolbar() {
  const {
    filters,
    hasActiveFilters,
    setSearch,
    setStatus,
    toggleTag,
    clearFilter,
    clearAll,
  } = usePropertyFilters();

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
            placeholder="Search properties..."
            value={filters.q || ""}
          />
        </div>

        {/* Filter controls group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <Select
            onValueChange={(value) =>
              setStatus(value === "all" ? null : (value as PropertyStatus))
            }
            value={filters.status || "all"}
          >
            <SelectTrigger className="w-full border-foreground/10 bg-background/80 sm:w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {ALL_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {statusLabels[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Tags filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="gap-2 border-foreground/10 bg-background/80"
                variant="outline"
              >
                <IconFilter className="h-4 w-4" />
                Tags
                {filters.tags && filters.tags.length > 0 && (
                  <span
                    className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 font-medium text-white text-xs"
                    style={{ backgroundColor: "var(--accent-teal)" }}
                  >
                    {filters.tags.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
              <DropdownMenuLabel>Filter by tags</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ALL_TAGS.map((tag) => (
                <DropdownMenuCheckboxItem
                  checked={filters.tags?.includes(tag)}
                  key={tag}
                  onCheckedChange={() => toggleTag(tag)}
                >
                  {tagLabels[tag]}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

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
              >
                <IconX className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.tags?.map((tag, index) => (
            <Badge
              className="animate-scale-in gap-1.5 pr-1.5"
              key={tag}
              style={{ animationDelay: `${100 + index * 50}ms` }}
              variant="secondary"
            >
              {tagLabels[tag]}
              <button
                className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-foreground/10"
                onClick={() => toggleTag(tag)}
              >
                <IconX className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
