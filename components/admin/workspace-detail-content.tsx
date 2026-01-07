"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  IconUsers,
  IconPhoto,
  IconMovie,
  IconCurrencyDollar,
  IconMail,
  IconBuilding,
  IconUser,
  IconCalendar,
  IconUserCircle,
  IconLoader2,
  IconAlertTriangle,
  IconEdit,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EditWorkspaceDialog } from "@/components/admin/edit-workspace-dialog";
import type { AdminWorkspaceDetail } from "@/lib/db/queries";
import type { WorkspaceStatus, WorkspacePlan, Workspace } from "@/lib/db/schema";
import { useImpersonation } from "@/hooks/use-impersonation";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface WorkspaceDetailContentProps {
  workspace: AdminWorkspaceDetail;
}

// Status badge variants
const statusVariantMap: Record<
  WorkspaceStatus,
  "status-active" | "status-suspended" | "status-trial"
> = {
  active: "status-active",
  suspended: "status-suspended",
  trial: "status-trial",
};

const statusLabelMap: Record<WorkspaceStatus, string> = {
  active: "Active",
  suspended: "Suspended",
  trial: "Trial",
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

const planLabelMap: Record<WorkspacePlan, string> = {
  free: "Free",
  pro: "Pro",
  enterprise: "Enterprise",
};

// Role badge variants
const roleVariantMap: Record<string, "role-owner" | "role-admin" | "role-member"> = {
  owner: "role-owner",
  admin: "role-admin",
  member: "role-member",
};

// Stats card component matching admin-stats-bar.tsx pattern
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
  value: string;
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

export function WorkspaceDetailContent({
  workspace: data,
}: WorkspaceDetailContentProps) {
  const router = useRouter();
  const { impersonateUser, isPending } = useImpersonation();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { workspace, owner, members, stats, recentProjects, recentVideos } = data;

  const totalSpend = stats.totalImageSpend + stats.totalVideoSpend;

  // Create a Workspace object for the edit dialog
  const workspaceForEdit: Workspace = {
    id: workspace.id,
    name: workspace.name,
    slug: workspace.slug,
    organizationNumber: workspace.organizationNumber,
    contactEmail: workspace.contactEmail,
    contactPerson: workspace.contactPerson,
    logo: null,
    primaryColor: null,
    secondaryColor: null,
    onboardingCompleted: true,
    status: workspace.status,
    plan: workspace.plan,
    suspendedAt: workspace.suspendedAt ? new Date(workspace.suspendedAt) : null,
    suspendedReason: workspace.suspendedReason,
    createdAt: new Date(workspace.createdAt),
    updatedAt: new Date(),
  };

  return (
    <div className="space-y-6 px-4 md:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in-up">
        <div className="flex items-center gap-4">
          {/* Workspace avatar */}
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-bold"
            style={{
              backgroundColor: "color-mix(in oklch, var(--accent-violet) 15%, transparent)",
              color: "var(--accent-violet)",
            }}
          >
            {workspace.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{workspace.name}</h1>
            <p className="text-sm text-muted-foreground font-mono">
              /{workspace.slug}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={statusVariantMap[workspace.status]}>
            {statusLabelMap[workspace.status]}
          </Badge>
          <Badge variant={planVariantMap[workspace.plan]}>
            {planLabelMap[workspace.plan]}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditDialogOpen(true)}
          >
            <IconEdit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          {owner && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => impersonateUser(owner.id)}
              disabled={isPending}
            >
              {isPending ? (
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <IconUserCircle className="mr-2 h-4 w-4" />
              )}
              Impersonate Owner
            </Button>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatItem
          icon={<IconUsers className="h-4 w-4" />}
          label="Members"
          value={stats.memberCount}
          accentColor="var(--accent-teal)"
          delay={0}
        />
        <StatItem
          icon={<IconPhoto className="h-4 w-4" />}
          label="Images"
          value={stats.imagesGenerated.toLocaleString()}
          subValue={`$${stats.totalImageSpend.toFixed(2)} spent`}
          accentColor="var(--accent-violet)"
          delay={50}
        />
        <StatItem
          icon={<IconMovie className="h-4 w-4" />}
          label="Videos"
          value={stats.videosGenerated}
          subValue={`${stats.videosCompleted} completed`}
          accentColor="var(--accent-green)"
          delay={100}
        />
        <StatItem
          icon={<IconCurrencyDollar className="h-4 w-4" />}
          label="Total Spend"
          value={`$${totalSpend.toFixed(2)}`}
          accentColor="var(--accent-amber)"
          delay={150}
        />
      </div>

      {/* Workspace Info + Members Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Workspace Info */}
        <Section title="Workspace Info" className="stagger-1">
          <div className="space-y-4">
            {/* Owner */}
            {owner && (
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    {owner.image && (
                      <AvatarImage src={owner.image} alt={owner.name} />
                    )}
                    <AvatarFallback
                      style={{
                        backgroundColor: "color-mix(in oklch, var(--accent-violet) 20%, transparent)",
                        color: "var(--accent-violet)",
                      }}
                    >
                      {owner.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{owner.name}</p>
                    <p className="text-sm text-muted-foreground">{owner.email}</p>
                  </div>
                </div>
                <Badge variant="role-owner">Owner</Badge>
              </div>
            )}

            {/* Info Rows */}
            <div className="grid gap-3">
              {workspace.organizationNumber && (
                <InfoRow
                  icon={<IconBuilding className="h-4 w-4" />}
                  label="Org Number:"
                  value={workspace.organizationNumber}
                  mono
                />
              )}
              {workspace.contactEmail && (
                <InfoRow
                  icon={<IconMail className="h-4 w-4" />}
                  label="Contact:"
                  value={workspace.contactEmail}
                />
              )}
              {workspace.contactPerson && (
                <InfoRow
                  icon={<IconUser className="h-4 w-4" />}
                  label="Contact Person:"
                  value={workspace.contactPerson}
                />
              )}
              <InfoRow
                icon={<IconCalendar className="h-4 w-4" />}
                label="Created:"
                value={format(workspace.createdAt, "MMM d, yyyy")}
              />
            </div>

            {/* Suspension Alert */}
            {workspace.status === "suspended" && workspace.suspendedReason && (
              <div className="flex items-start gap-3 rounded-lg bg-destructive/10 p-3 text-sm">
                <IconAlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
                <div>
                  <p className="font-medium text-destructive">Suspension Reason</p>
                  <p className="text-muted-foreground">
                    {workspace.suspendedReason}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Section>

        {/* Members */}
        <Section
          title="Members"
          badge={
            <Badge variant="secondary" className="font-mono">
              {members.length}
            </Badge>
          }
          className="stagger-2"
        >
          <div className="max-h-[280px] space-y-2 overflow-y-auto scrollbar-thin">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    {member.image && (
                      <AvatarImage src={member.image} alt={member.name} />
                    )}
                    <AvatarFallback className="text-xs">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {member.email}
                    </p>
                  </div>
                </div>
                <Badge variant={roleVariantMap[member.role] || "secondary"}>
                  {member.role}
                </Badge>
              </div>
            ))}
            {members.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No members
              </p>
            )}
          </div>
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

      {/* Edit Workspace Dialog */}
      <EditWorkspaceDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        workspace={workspaceForEdit}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
