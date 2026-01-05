"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ALL_STATUSES,
  ALL_TAGS,
  type PropertyStatus,
  type PropertyTag,
} from "@/lib/mock/properties"
import { usePropertyFilters } from "@/hooks/use-property-filters"
import { IconSearch, IconX, IconFilter } from "@tabler/icons-react"

const statusLabels: Record<PropertyStatus, string> = {
  active: "Active",
  pending: "Pending",
  completed: "Completed",
  archived: "Archived",
}

const tagLabels: Record<PropertyTag, string> = {
  residential: "Residential",
  commercial: "Commercial",
  luxury: "Luxury",
  staging: "Staging",
  exterior: "Exterior",
  interior: "Interior",
  renovation: "Renovation",
}

export function TableToolbar() {
  const {
    filters,
    hasActiveFilters,
    setSearch,
    setStatus,
    toggleTag,
    clearFilter,
    clearAll,
  } = usePropertyFilters()

  return (
    <div className="space-y-3">
      {/* Filters row with visual grouping */}
      <div className="flex flex-col gap-3 rounded-xl bg-muted/30 p-3 ring-1 ring-foreground/5 sm:flex-row sm:items-center">
        {/* Search input */}
        <div className="relative flex-1 sm:max-w-[320px]">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search properties..."
            value={filters.q || ""}
            onChange={(e) => setSearch(e.target.value || null)}
            className="pl-9 bg-background/80 border-foreground/10 focus-ring transition-shadow"
          />
        </div>

        {/* Filter controls group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <Select
            value={filters.status || "all"}
            onValueChange={(value) => setStatus(value === "all" ? null : (value as PropertyStatus))}
          >
            <SelectTrigger className="w-full bg-background/80 border-foreground/10 sm:w-[150px]">
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
              <Button variant="outline" className="gap-2 bg-background/80 border-foreground/10">
                <IconFilter className="h-4 w-4" />
                Tags
                {filters.tags && filters.tags.length > 0 && (
                  <span
                    className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium text-white"
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
                  key={tag}
                  checked={filters.tags?.includes(tag) || false}
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
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              <IconX className="mr-1 h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Active filters pills with animation */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 animate-fade-in">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Active filters:
          </span>
          {filters.q && (
            <Badge
              variant="secondary"
              className="gap-1.5 pr-1.5 animate-scale-in"
              style={{ animationDelay: "0ms" }}
            >
              <span className="text-muted-foreground">Search:</span> {filters.q}
              <button
                onClick={() => clearFilter("q")}
                className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10 transition-colors"
              >
                <IconX className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.status && (
            <Badge
              variant="secondary"
              className="gap-1.5 pr-1.5 animate-scale-in"
              style={{ animationDelay: "50ms" }}
            >
              <span className="text-muted-foreground">Status:</span> {statusLabels[filters.status]}
              <button
                onClick={() => clearFilter("status")}
                className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10 transition-colors"
              >
                <IconX className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.tags?.map((tag, index) => (
            <Badge
              key={tag}
              variant="secondary"
              className="gap-1.5 pr-1.5 animate-scale-in"
              style={{ animationDelay: `${100 + index * 50}ms` }}
            >
              {tagLabels[tag]}
              <button
                onClick={() => toggleTag(tag)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10 transition-colors"
              >
                <IconX className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
