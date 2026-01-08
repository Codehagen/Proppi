"use client";

import { IconSearch, IconX } from "@tabler/icons-react";
import { useMemo } from "react";
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
import { useAdminUserFilters } from "@/hooks/use-admin-user-filters";
import {
  ALL_USER_ROLES,
  ALL_USER_STATUSES,
  type UserRole,
  type UserStatus,
} from "@/lib/mock/admin-users";
import { getAllWorkspaces } from "@/lib/mock/admin-workspaces";

const roleLabels: Record<UserRole, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
};

const statusLabels: Record<UserStatus, string> = {
  active: "Active",
  pending: "Pending",
  inactive: "Inactive",
};

export function UsersTableToolbar() {
  const {
    filters,
    hasActiveFilters,
    setSearch,
    setWorkspace,
    setRole,
    setStatus,
    clearFilter,
    clearAll,
  } = useAdminUserFilters();

  // Get workspaces for dropdown
  const workspaces = useMemo(() => getAllWorkspaces(), []);
  const selectedWorkspace = workspaces.find(
    (w) => w.id === filters.workspaceId
  );

  return (
    <div className="space-y-3">
      {/* Filters row */}
      <div className="flex flex-col gap-3 rounded-xl bg-muted/30 p-3 ring-1 ring-foreground/5 sm:flex-row sm:flex-wrap sm:items-center">
        {/* Search input */}
        <div className="relative flex-1 sm:max-w-[280px]">
          <IconSearch className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="focus-ring border-foreground/10 bg-background/80 pl-9 transition-shadow"
            onChange={(e) => setSearch(e.target.value || null)}
            placeholder="Search users..."
            value={filters.q || ""}
          />
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Workspace filter */}
          <Select
            onValueChange={(value) =>
              setWorkspace(value === "all" ? null : value)
            }
            value={filters.workspaceId || "all"}
          >
            <SelectTrigger className="w-full border-foreground/10 bg-background/80 sm:w-[180px]">
              <SelectValue placeholder="Workspace" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All workspaces</SelectItem>
              {workspaces.map((workspace) => (
                <SelectItem key={workspace.id} value={workspace.id}>
                  {workspace.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Role filter */}
          <Select
            onValueChange={(value) =>
              setRole(value === "all" ? null : (value as UserRole))
            }
            value={filters.role || "all"}
          >
            <SelectTrigger className="w-full border-foreground/10 bg-background/80 sm:w-[120px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              {ALL_USER_ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {roleLabels[role]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status filter */}
          <Select
            onValueChange={(value) =>
              setStatus(value === "all" ? null : (value as UserStatus))
            }
            value={filters.status || "all"}
          >
            <SelectTrigger className="w-full border-foreground/10 bg-background/80 sm:w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {ALL_USER_STATUSES.map((status) => (
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

      {/* Active filters pills */}
      {hasActiveFilters && (
        <div className="flex animate-fade-in flex-wrap items-center gap-2">
          <span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
            Active filters:
          </span>
          {filters.q && (
            <Badge
              className="animate-scale-in gap-1.5 pr-1.5"
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

          {filters.workspaceId && selectedWorkspace && (
            <Badge
              className="animate-scale-in gap-1.5 pr-1.5"
              variant="secondary"
            >
              <span className="text-muted-foreground">Workspace:</span>{" "}
              {selectedWorkspace.name}
              <button
                className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-foreground/10"
                onClick={() => clearFilter("workspaceId")}
              >
                <IconX className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.role && (
            <Badge
              className="animate-scale-in gap-1.5 pr-1.5"
              variant="secondary"
            >
              <span className="text-muted-foreground">Role:</span>{" "}
              {roleLabels[filters.role]}
              <button
                className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-foreground/10"
                onClick={() => clearFilter("role")}
              >
                <IconX className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.status && (
            <Badge
              className="animate-scale-in gap-1.5 pr-1.5"
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
        </div>
      )}
    </div>
  );
}
