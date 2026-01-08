"use client";

import {
  IconBuilding,
  IconCalendar,
  IconCheck,
  IconCurrencyDollar,
  IconEdit,
  IconExternalLink,
  IconFolder,
  IconLoader2,
  IconMail,
  IconMovie,
  IconPhoto,
  IconShieldCheck,
  IconUserCircle,
  IconX,
} from "@tabler/icons-react";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { EditUserDialog } from "@/components/admin/edit-user-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useImpersonation } from "@/hooks/use-impersonation";
import type { WorkspacePlan, WorkspaceStatus } from "@/lib/db/schema";
import type { AdminUserDetail } from "@/lib/types/admin";
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
const roleVariantMap: Record<
  string,
  "role-owner" | "role-admin" | "role-member"
> = {
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
        isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
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
        <p className="font-medium text-[11px] text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        <div className="flex items-baseline gap-1.5">
          <p
            className="font-mono font-semibold text-lg tabular-nums"
            style={{ color: accentColor }}
          >
            {value}
          </p>
          {subValue && (
            <span className="text-muted-foreground text-xs">{subValue}</span>
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
    <div
      className={cn(
        "animate-fade-in-up rounded-xl bg-card ring-1 ring-foreground/5",
        className
      )}
    >
      <div className="flex items-center justify-between border-border border-b px-4 py-3">
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

export function UserDetailContent({ user: data }: UserDetailContentProps) {
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
      <div className="flex animate-fade-in-up flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {/* User avatar */}
          <Avatar className="h-14 w-14">
            {user.image && <AvatarImage alt={user.name} src={user.image} />}
            <AvatarFallback
              className="font-bold text-lg"
              style={{
                backgroundColor:
                  "color-mix(in oklch, var(--accent-teal) 15%, transparent)",
                color: "var(--accent-teal)",
              }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-bold text-2xl">{user.name}</h1>
            <p className="text-muted-foreground text-sm">{user.email}</p>
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
            <Badge className="gap-1" variant="default">
              <IconShieldCheck className="h-3 w-3" />
              System Admin
            </Badge>
          )}
          <Button
            onClick={() => setEditDialogOpen(true)}
            size="sm"
            variant="outline"
          >
            <IconEdit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          {user.workspaceId && (
            <Button
              disabled={isPending}
              onClick={() => impersonateUser(user.id)}
              size="sm"
              variant="outline"
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
          accentColor="var(--accent-violet)"
          delay={0}
          icon={<IconPhoto className="h-4 w-4" />}
          label="Images"
          value={stats.imagesGenerated.toLocaleString()}
        />
        <StatItem
          accentColor="var(--accent-teal)"
          delay={50}
          icon={<IconFolder className="h-4 w-4" />}
          label="Projects"
          value={stats.projectsCreated}
        />
        <StatItem
          accentColor="var(--accent-green)"
          delay={100}
          icon={<IconMovie className="h-4 w-4" />}
          label="Videos"
          value={stats.videosCreated}
        />
        <StatItem
          accentColor="var(--accent-amber)"
          delay={150}
          icon={<IconCurrencyDollar className="h-4 w-4" />}
          label="Total Spend"
          value={`$${stats.totalSpend.toFixed(2)}`}
        />
      </div>

      {/* User Info + Workspace Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Info */}
        <Section className="stagger-1" title="User Info">
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
              <p className="mb-1 text-muted-foreground text-xs">User ID</p>
              <p className="break-all font-mono text-sm">{user.id}</p>
            </div>
          </div>
        </Section>

        {/* Workspace Card */}
        <Section className="stagger-2" title="Workspace">
          {workspace ? (
            <Link
              className="block rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted"
              href={`/admin/workspaces/${workspace.id}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-sm"
                    style={{
                      backgroundColor:
                        "color-mix(in oklch, var(--accent-violet) 15%, transparent)",
                      color: "var(--accent-violet)",
                    }}
                  >
                    {workspace.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{workspace.name}</p>
                    <p className="font-mono text-muted-foreground text-sm">
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
              <p className="text-muted-foreground text-sm">
                No workspace assigned
              </p>
            </div>
          )}
        </Section>
      </div>

      {/* Recent Projects + Recent Videos Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Projects */}
        <Section className="stagger-3" title="Recent Projects">
          <div className="space-y-3">
            {recentProjects.map((project) => (
              <Link
                className="block space-y-2 rounded-lg p-3 transition-colors hover:bg-muted/50"
                href={`/dashboard/${project.id}`}
                key={project.id}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{project.name}</p>
                    <p className="text-muted-foreground text-xs">
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
                    color={
                      project.status === "completed"
                        ? "var(--accent-green)"
                        : "var(--accent-teal)"
                    }
                    current={project.completedCount}
                    total={project.imageCount}
                  />
                  <span className="shrink-0 font-mono text-muted-foreground text-xs">
                    {project.completedCount}/{project.imageCount}
                  </span>
                </div>
              </Link>
            ))}
            {recentProjects.length === 0 && (
              <p className="py-4 text-center text-muted-foreground text-sm">
                No projects yet
              </p>
            )}
          </div>
        </Section>

        {/* Recent Videos */}
        <Section className="stagger-4" title="Recent Videos">
          <div className="space-y-3">
            {recentVideos.map((video) => (
              <Link
                className="block space-y-2 rounded-lg p-3 transition-colors hover:bg-muted/50"
                href={`/video/${video.id}`}
                key={video.id}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{video.name}</p>
                    <p className="text-muted-foreground text-xs">
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
                    color={
                      video.status === "completed"
                        ? "var(--accent-green)"
                        : video.status === "failed"
                          ? "var(--accent-red)"
                          : "var(--accent-teal)"
                    }
                    current={video.completedClipCount}
                    total={video.clipCount}
                  />
                  <span className="shrink-0 font-mono text-muted-foreground text-xs">
                    {video.completedClipCount}/{video.clipCount}
                  </span>
                </div>
              </Link>
            ))}
            {recentVideos.length === 0 && (
              <p className="py-4 text-center text-muted-foreground text-sm">
                No videos yet
              </p>
            )}
          </div>
        </Section>
      </div>

      {/* Edit User Dialog */}
      <EditUserDialog
        onOpenChange={setEditDialogOpen}
        onSuccess={() => router.refresh()}
        open={editDialogOpen}
        user={user}
      />
    </div>
  );
}
