"use client";

import {
  IconArrowUp,
  IconBuilding,
  IconMail,
  IconPhoto,
  IconUserPlus,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import type { RecentActivity } from "@/lib/mock/admin-stats";

const activityIcons = {
  user_joined: IconUserPlus,
  workspace_created: IconBuilding,
  image_generated: IconPhoto,
  plan_upgraded: IconArrowUp,
  user_invited: IconMail,
};

const activityColors = {
  user_joined: "var(--accent-green)",
  workspace_created: "var(--accent-violet)",
  image_generated: "var(--accent-teal)",
  plan_upgraded: "var(--accent-amber)",
  user_invited: "var(--accent-teal)",
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

type RecentActivityListProps = {
  activities: RecentActivity[];
};

export function RecentActivityList({ activities }: RecentActivityListProps) {
  return (
    <div className="space-y-1">
      {activities.map((activity, index) => {
        const Icon = activityIcons[activity.type];
        const color = activityColors[activity.type];

        return (
          <div
            className="flex animate-fade-in-up items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50"
            key={activity.id}
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{
                backgroundColor: `color-mix(in oklch, ${color} 15%, transparent)`,
              }}
            >
              <Icon className="h-4 w-4" style={{ color }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-foreground text-sm">
                {activity.description}
              </p>
              {activity.metadata.workspaceName && (
                <p className="truncate text-muted-foreground text-xs">
                  {activity.metadata.workspaceName}
                </p>
              )}
            </div>
            <Badge
              className="shrink-0 text-muted-foreground text-xs"
              variant="outline"
            >
              {formatTimeAgo(activity.timestamp)}
            </Badge>
          </div>
        );
      })}
    </div>
  );
}
