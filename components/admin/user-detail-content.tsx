"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  IconPhoto,
  IconFolder,
  IconMovie,
  IconCurrencyDollar,
  IconMail,
  IconBuilding,
  IconCalendar,
  IconUserCircle,
  IconLoader2,
  IconShieldCheck,
  IconEdit,
  IconExternalLink,
  IconCheck,
  IconX,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EditUserDialog } from "@/components/admin/edit-user-dialog";
import type { AdminUserDetail } from "@/lib/types/admin";
import type { WorkspaceStatus, WorkspacePlan } from "@/lib/db/schema";
import { useImpersonation } from "@/hooks/use-impersonation";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface UserDetailContentProps {
  user: AdminUserDetail;
}

// Status badge variants
const statusVariantMap: Record<
  string,
  "status-active" | "status-pending" | "status-inactive"
> = {
  active: "status-active",
  pending: "status-pending",
  inactive: "status-inactive",
};

const statusLabelMap: Record<string, string> = {
  active: "Active",
  pending: "Pending",
  inactive: "Inactive",
};

// Role badge variants
const roleVariantMap: Record<string, "role-owner" | "role-admin" | "role-member"> = {
  owner: "role-owner",
  admin: "role-admin",
  member: "role-member",
};

const roleLabelMap: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
};

// Workspace status badge variants
const workspaceStatusVariantMap: Record<
  WorkspaceStatus,
  "status-active" | "status-suspended" | "status-trial"
> = {
  active: "status-active",
  suspended: "status-suspended",
  trial: "status-trial",
};

// Plan badge variants
const planVariantMap: Record<
  WorkspacePlan,
  "plan-free" | "plan-pro" | "plan-enterprise"
> = {
  free: "plan-free",
  pro: "plan-pro",
  enterprise: "plan-enterprise",
};

// Stats card component
function StatItem({
  icon,
  label,
  value,
  subValue,
  accentColor,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  accentColor: string;
  delay: number;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`stats-card flex items-center gap-3 rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/5 transition-all duration-500 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        style={{
          backgroundColor: `color-mix(in oklch, ${accentColor} 15%, transparent)`,
        }}
      >
        <div style={{ color: accentColor }}>{icon}</div>
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <div className="flex items-baseline gap-1.5">
          <p
            className="font-mono text-lg font-semibold tabular-nums"
            style={{ color: accentColor }}
          >
            {value}
          </p>
          {subValue && (
            <span className="text-xs text-muted-foreground">{subValue}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// Section component for card sections
function Section({
  title,
  badge,
  children,
  className,
}: {
  title: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl bg-card ring-1 ring-foreground/5 animate-fade-in-up", className)}>
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="font-semibold">{title}</h3>
        {badge}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// Info row component
function InfoRow({
  icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-muted-foreground">{label}</span>
      <span className={mono ? "font-mono" : ""}>{value}</span>
    </div>
  );
}

// Progress bar component
function ProgressBar({
  current,
  total,
  color,
}: {
  current: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{
          width: `${percentage}%`,
          backgroundColor: color,
        }}
      />
    </div>
  );
}

export function UserDetailContent({
  user: data,
}: UserDetailContentProps) {
  const router = useRouter();
  const { impersonateUser, isPending } = useImpersonation();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { user, workspace, stats, recentProjects, recentVideos } = data;

  // Get initials for avatar
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in-up">
        <div className="flex items-center gap-4">
          {/* User avatar */}
          <Avatar className="h-14 w-14">
            {user.image && <AvatarImage src={user.image} alt={user.name} />}
            <AvatarFallback
              className="text-lg font-bold"
              style={{
                backgroundColor: "color-mix(in oklch, var(--accent-teal) 15%, transparent)",
                color: "var(--accent-teal)",
              }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={statusVariantMap[user.status]}>
            {statusLabelMap[user.status]}
          </Badge>
          <Badge variant={roleVariantMap[user.role]}>
            {roleLabelMap[user.role]}
          </Badge>
          {user.isSystemAdmin && (
            <Badge variant="default" className="gap-1">
              <IconShieldCheck className="h-3 w-3" />
              System Admin
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditDialogOpen(true)}
          >
            <IconEdit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          {user.workspaceId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => impersonateUser(user.id)}
              disabled={isPending}
            >
              {isPending ? (
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <IconUserCircle className="mr-2 h-4 w-4" />
              )}
              Impersonate
            </Button>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatItem
          icon={<IconPhoto className="h-4 w-4" />}
          label="Images"
          value={stats.imagesGenerated.toLocaleString()}
          accentColor="var(--accent-violet)"
          delay={0}
        />
        <StatItem
          icon={<IconFolder className="h-4 w-4" />}
          label="Projects"
          value={stats.projectsCreated}
          accentColor="var(--accent-teal)"
          delay={50}
        />
        <StatItem
          icon={<IconMovie className="h-4 w-4" />}
          label="Videos"
          value={stats.videosCreated}
          accentColor="var(--accent-green)"
          delay={100}
        />
        <StatItem
          icon={<IconCurrencyDollar className="h-4 w-4" />}
          label="Total Spend"
          value={`$${stats.totalSpend.toFixed(2)}`}
          accentColor="var(--accent-amber)"
          delay={150}
        />
      </div>

      {/* User Info + Workspace Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Info */}
        <Section title="User Info" className="stagger-1">
          <div className="space-y-4">
            {/* Info Rows */}
            <div className="grid gap-3">
              <InfoRow
                icon={<IconMail className="h-4 w-4" />}
                label="Email Verified:"
                value={
                  user.emailVerified ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <IconCheck className="h-4 w-4" /> Yes
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-600">
                      <IconX className="h-4 w-4" /> No
                    </span>
                  )
                }
              />
              <InfoRow
                icon={<IconCalendar className="h-4 w-4" />}
                label="Joined:"
                value={format(user.createdAt, "MMM d, yyyy")}
              />
              <InfoRow
                icon={<IconCalendar className="h-4 w-4" />}
                label="Last Active:"
                value={format(user.updatedAt, "MMM d, yyyy 'at' h:mm a")}
              />
              <InfoRow
                icon={<IconShieldCheck className="h-4 w-4" />}
                label="System Admin:"
                value={
                  user.isSystemAdmin ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <IconCheck className="h-4 w-4" /> Yes
                    </span>
                  ) : (
                    <span className="text-muted-foreground">No</span>
                  )
                }
              />
            </div>

            {/* User ID */}
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground mb-1">User ID</p>
              <p className="font-mono text-sm break-all">{user.id}</p>
            </div>
          </div>
        </Section>

        {/* Workspace Card */}
        <Section title="Workspace" className="stagger-2">
          {workspace ? (
            <Link
              href={`/admin/workspaces/${workspace.id}`}
              className="block rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
                    style={{
                      backgroundColor: "color-mix(in oklch, var(--accent-violet) 15%, transparent)",
                      color: "var(--accent-violet)",
                    }}
                  >
                    {workspace.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{workspace.name}</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      /{workspace.slug}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={workspaceStatusVariantMap[workspace.status]}>
                    {workspace.status}
                  </Badge>
                  <Badge variant={planVariantMap[workspace.plan]}>
                    {workspace.plan}
                  </Badge>
                  <IconExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </Link>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                <IconBuilding className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No workspace assigned
              </p>
            </div>
          )}
        </Section>
      </div>

      {/* Recent Projects + Recent Videos Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Projects */}
        <Section title="Recent Projects" className="stagger-3">
          <div className="space-y-3">
            {recentProjects.map((project) => (
              <Link
                href={`/dashboard/${project.id}`}
                key={project.id}
                className="block space-y-2 rounded-lg p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{project.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(project.createdAt, "MMM d, yyyy")}
                    </p>
                  </div>
                  <Badge
                    variant={
                      project.status === "completed"
                        ? "status-completed"
                        : project.status === "processing"
                          ? "status-active"
                          : "status-pending"
                    }
                  >
                    {project.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <ProgressBar
                    current={project.completedCount}
                    total={project.imageCount}
                    color={
                      project.status === "completed"
                        ? "var(--accent-green)"
                        : "var(--accent-teal)"
                    }
                  />
                  <span className="shrink-0 text-xs font-mono text-muted-foreground">
                    {project.completedCount}/{project.imageCount}
                  </span>
                </div>
              </Link>
            ))}
            {recentProjects.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No projects yet
              </p>
            )}
          </div>
        </Section>

        {/* Recent Videos */}
        <Section title="Recent Videos" className="stagger-4">
          <div className="space-y-3">
            {recentVideos.map((video) => (
              <Link
                href={`/video/${video.id}`}
                key={video.id}
                className="block space-y-2 rounded-lg p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{video.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(video.createdAt, "MMM d, yyyy")}
                    </p>
                  </div>
                  <Badge
                    variant={
                      video.status === "completed"
                        ? "status-completed"
                        : video.status === "generating" ||
                            video.status === "compiling"
                          ? "status-active"
                          : video.status === "failed"
                            ? "destructive"
                            : "status-pending"
                    }
                  >
                    {video.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <ProgressBar
                    current={video.completedClipCount}
                    total={video.clipCount}
                    color={
                      video.status === "completed"
                        ? "var(--accent-green)"
                        : video.status === "failed"
                          ? "var(--accent-red)"
                          : "var(--accent-teal)"
                    }
                  />
                  <span className="shrink-0 text-xs font-mono text-muted-foreground">
                    {video.completedClipCount}/{video.clipCount}
                  </span>
                </div>
              </Link>
            ))}
            {recentVideos.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No videos yet
              </p>
            )}
          </div>
        </Section>
      </div>

      {/* Edit User Dialog */}
      <EditUserDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        user={user}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
