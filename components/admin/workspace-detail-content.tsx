"use client";

import {
  IconAlertTriangle,
  IconBuilding,
  IconCalendar,
  IconCurrencyDollar,
  IconEdit,
  IconLoader2,
  IconMail,
  IconMovie,
  IconPhoto,
  IconUser,
  IconUserCircle,
  IconUsers,
} from "@tabler/icons-react";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { EditWorkspaceDialog } from "@/components/admin/edit-workspace-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useImpersonation } from "@/hooks/use-impersonation";
import type { AdminWorkspaceDetail } from "@/lib/db/queries";
import type {
  Workspace,
  WorkspacePlan,
  WorkspaceStatus,
} from "@/lib/db/schema";
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
const roleVariantMap: Record<
  string,
  "role-owner" | "role-admin" | "role-member"
> = {
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
  const { workspace, owner, members, stats, recentProjects, recentVideos } =
    data;

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
      <div className="flex animate-fade-in-up flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {/* Workspace avatar */}
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-bold text-xl"
            style={{
              backgroundColor:
                "color-mix(in oklch, var(--accent-violet) 15%, transparent)",
              color: "var(--accent-violet)",
            }}
          >
            {workspace.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-bold text-2xl">{workspace.name}</h1>
            <p className="font-mono text-muted-foreground text-sm">
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
            onClick={() => setEditDialogOpen(true)}
            size="sm"
            variant="outline"
          >
            <IconEdit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          {owner && (
            <Button
              disabled={isPending}
              onClick={() => impersonateUser(owner.id)}
              size="sm"
              variant="outline"
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
          accentColor="var(--accent-teal)"
          delay={0}
          icon={<IconUsers className="h-4 w-4" />}
          label="Members"
          value={stats.memberCount}
        />
        <StatItem
          accentColor="var(--accent-violet)"
          delay={50}
          icon={<IconPhoto className="h-4 w-4" />}
          label="Images"
          subValue={`$${stats.totalImageSpend.toFixed(2)} spent`}
          value={stats.imagesGenerated.toLocaleString()}
        />
        <StatItem
          accentColor="var(--accent-green)"
          delay={100}
          icon={<IconMovie className="h-4 w-4" />}
          label="Videos"
          subValue={`${stats.videosCompleted} completed`}
          value={stats.videosGenerated}
        />
        <StatItem
          accentColor="var(--accent-amber)"
          delay={150}
          icon={<IconCurrencyDollar className="h-4 w-4" />}
          label="Total Spend"
          value={`$${totalSpend.toFixed(2)}`}
        />
      </div>

      {/* Workspace Info + Members Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Workspace Info */}
        <Section className="stagger-1" title="Workspace Info">
          <div className="space-y-4">
            {/* Owner */}
            {owner && (
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    {owner.image && (
                      <AvatarImage alt={owner.name} src={owner.image} />
                    )}
                    <AvatarFallback
                      style={{
                        backgroundColor:
                          "color-mix(in oklch, var(--accent-violet) 20%, transparent)",
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
                    <p className="text-muted-foreground text-sm">
                      {owner.email}
                    </p>
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
                  mono
                  value={workspace.organizationNumber}
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
                  <p className="font-medium text-destructive">
                    Suspension Reason
                  </p>
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
          badge={
            <Badge className="font-mono" variant="secondary">
              {members.length}
            </Badge>
          }
          className="stagger-2"
          title="Members"
        >
          <div className="scrollbar-thin max-h-[280px] space-y-2 overflow-y-auto">
            {members.map((member) => (
              <div
                className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted/50"
                key={member.id}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    {member.image && (
                      <AvatarImage alt={member.name} src={member.image} />
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
                    <p className="font-medium text-sm">{member.name}</p>
                    <p className="text-muted-foreground text-xs">
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
              <p className="py-4 text-center text-muted-foreground text-sm">
                No members
              </p>
            )}
          </div>
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

      {/* Edit Workspace Dialog */}
      <EditWorkspaceDialog
        onOpenChange={setEditDialogOpen}
        onSuccess={() => router.refresh()}
        open={editDialogOpen}
        workspace={workspaceForEdit}
      />
    </div>
  );
}
