"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AdminUserRow, UserRole, UserStatus } from "@/lib/types/admin";
import { IconDotsVertical, IconEye, IconUserCircle } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import { memo } from "react";

// Role badge variants
const roleVariantMap: Record<
  UserRole,
  "role-owner" | "role-admin" | "role-member"
> = {
  owner: "role-owner",
  admin: "role-admin",
  member: "role-member",
};

const roleLabelMap: Record<UserRole, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
};

// Status badge variants
const statusVariantMap: Record<
  UserStatus,
  "status-active" | "status-pending" | "status-inactive"
> = {
  active: "status-active",
  pending: "status-pending",
  inactive: "status-inactive",
};

const statusLabelMap: Record<UserStatus, string> = {
  active: "Active",
  pending: "Pending",
  inactive: "Inactive",
};

// Memoized cell components
const UserCell = memo(
  ({
    name,
    email,
    image,
  }: {
    name: string;
    email: string;
    image: string | null;
  }) => {
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    return (
      <div className="flex items-center gap-2.5 min-w-0">
        <Avatar className="h-8 w-8 shrink-0">
          {image && <AvatarImage src={image} alt={name} />}
          <AvatarFallback className="text-[10px] font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <span className="font-medium truncate">{name}</span>
          <span className="text-xs text-muted-foreground truncate">
            {email}
          </span>
        </div>
      </div>
    );
  },
);
UserCell.displayName = "UserCell";

const WorkspaceCell = memo(({ name }: { name: string | null }) => (
  <span className="text-sm truncate">{name || "No workspace"}</span>
));
WorkspaceCell.displayName = "WorkspaceCell";

const RoleCell = memo(({ role }: { role: UserRole }) => (
  <Badge variant={roleVariantMap[role]}>{roleLabelMap[role]}</Badge>
));
RoleCell.displayName = "RoleCell";

const StatusCell = memo(({ status }: { status: UserStatus }) => (
  <Badge variant={statusVariantMap[status]}>{statusLabelMap[status]}</Badge>
));
StatusCell.displayName = "StatusCell";

const ImagesCell = memo(({ count }: { count: number }) => (
  <span className="font-mono text-sm">{count.toLocaleString()}</span>
));
ImagesCell.displayName = "ImagesCell";

const DateCell = memo(
  ({ date, relative }: { date: Date | null; relative?: boolean }) => {
    if (!date) {
      return <span className="text-sm text-muted-foreground">Never</span>;
    }

    if (relative) {
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      let formatted: string;
      if (diffMins < 1) formatted = "just now";
      else if (diffMins < 60) formatted = `${diffMins}m ago`;
      else if (diffHours < 24) formatted = `${diffHours}h ago`;
      else if (diffDays < 7) formatted = `${diffDays}d ago`;
      else {
        formatted = new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
        }).format(date);
      }
      return <span className="text-sm text-muted-foreground">{formatted}</span>;
    }

    const formatted = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
    return <span className="text-sm text-muted-foreground">{formatted}</span>;
  },
);
DateCell.displayName = "DateCell";

const ActionsCell = memo(
  ({
    userId,
    userName,
    userEmail,
    workspaceId,
    workspaceName,
    onImpersonate,
  }: {
    userId: string;
    userName: string;
    userEmail: string;
    workspaceId: string | null;
    workspaceName: string | null;
    onImpersonate?: (user: {
      id: string;
      name: string;
      email: string;
      workspaceId: string;
      workspaceName: string;
    }) => void;
  }) => {
    const canImpersonate = workspaceId && workspaceName;

    return (
      <div className="flex items-center justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <IconDotsVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/users/${userId}`}>
                <IconEye className="mr-2 h-4 w-4" />
                View details
              </Link>
            </DropdownMenuItem>
            {canImpersonate && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    if (onImpersonate) {
                      onImpersonate({
                        id: userId,
                        name: userName,
                        email: userEmail,
                        workspaceId,
                        workspaceName,
                      });
                    }
                  }}
                >
                  <IconUserCircle className="mr-2 h-4 w-4" />
                  Impersonate user
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  },
);
ActionsCell.displayName = "ActionsCell";

export function createUserColumns(
  onImpersonate?: (user: {
    id: string;
    name: string;
    email: string;
    workspaceId: string;
    workspaceName: string;
  }) => void,
): ColumnDef<AdminUserRow>[] {
  return [
    {
      id: "user",
      accessorKey: "name",
      header: "User",
      size: 240,
      minSize: 200,
      cell: ({ row }) => (
        <UserCell
          name={row.original.name}
          email={row.original.email}
          image={row.original.image}
        />
      ),
    },
    {
      id: "workspace",
      accessorKey: "workspaceName",
      header: "Workspace",
      size: 180,
      minSize: 140,
      maxSize: 220,
      cell: ({ row }) => <WorkspaceCell name={row.original.workspaceName} />,
    },
    {
      id: "role",
      accessorKey: "role",
      header: "Role",
      size: 100,
      minSize: 80,
      maxSize: 120,
      cell: ({ row }) => <RoleCell role={row.original.role} />,
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      size: 100,
      minSize: 80,
      maxSize: 120,
      cell: ({ row }) => <StatusCell status={row.original.status} />,
    },
    {
      id: "imagesGenerated",
      accessorKey: "imagesGenerated",
      header: "Images",
      size: 90,
      minSize: 70,
      maxSize: 100,
      cell: ({ row }) => <ImagesCell count={row.original.imagesGenerated} />,
    },
    {
      id: "lastActiveAt",
      accessorKey: "lastActiveAt",
      header: "Last Active",
      size: 110,
      minSize: 90,
      maxSize: 130,
      cell: ({ row }) => <DateCell date={row.original.lastActiveAt} relative />,
    },
    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: "Joined",
      size: 120,
      minSize: 100,
      maxSize: 140,
      cell: ({ row }) => <DateCell date={row.original.createdAt} />,
    },
    {
      id: "actions",
      header: "",
      size: 60,
      minSize: 60,
      maxSize: 60,
      enableResizing: false,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <ActionsCell
          userId={row.original.id}
          userName={row.original.name}
          userEmail={row.original.email}
          workspaceId={row.original.workspaceId}
          workspaceName={row.original.workspaceName}
          onImpersonate={onImpersonate}
        />
      ),
    },
  ];
}
