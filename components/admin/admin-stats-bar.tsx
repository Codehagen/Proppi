"use client";

import {
  IconActivity,
  IconBuilding,
  IconCalendar,
  IconCurrencyDollar,
  IconPhoto,
  IconUsers,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";

type StatItemProps = {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  accentColor: string;
  delay: number;
};

function StatItem({
  icon,
  label,
  value,
  subValue,
  accentColor,
  delay,
}: StatItemProps) {
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

type AdminStatsBarProps = {
  totalWorkspaces: number;
  activeWorkspaces: number;
  totalUsers: number;
  activeUsers: number;
  totalImages: number;
  imagesThisMonth: number;
  totalRevenue: number;
  revenueThisMonth: number;
  activeSessions: number;
};

export function AdminStatsBar({
  totalWorkspaces,
  activeWorkspaces,
  totalUsers,
  activeUsers,
  totalImages,
  imagesThisMonth,
  totalRevenue,
  revenueThisMonth,
  activeSessions,
}: AdminStatsBarProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      <StatItem
        accentColor="var(--accent-violet)"
        delay={0}
        icon={<IconBuilding className="h-4 w-4" />}
        label="Workspaces"
        subValue={`${activeWorkspaces} active`}
        value={totalWorkspaces.toLocaleString()}
      />
      <StatItem
        accentColor="var(--accent-teal)"
        delay={50}
        icon={<IconUsers className="h-4 w-4" />}
        label="Users"
        subValue={`${activeUsers} active`}
        value={totalUsers.toLocaleString()}
      />
      <StatItem
        accentColor="var(--accent-green)"
        delay={100}
        icon={<IconActivity className="h-4 w-4" />}
        label="Sessions"
        subValue="online now"
        value={activeSessions.toLocaleString()}
      />
      <StatItem
        accentColor="var(--accent-teal)"
        delay={150}
        icon={<IconPhoto className="h-4 w-4" />}
        label="Total Images"
        value={totalImages.toLocaleString()}
      />
      <StatItem
        accentColor="var(--accent-violet)"
        delay={200}
        icon={<IconCalendar className="h-4 w-4" />}
        label="This Month"
        subValue="images"
        value={imagesThisMonth.toLocaleString()}
      />
      <StatItem
        accentColor="var(--accent-amber)"
        delay={250}
        icon={<IconCurrencyDollar className="h-4 w-4" />}
        label="Revenue"
        subValue={`$${revenueThisMonth.toFixed(2)} MTD`}
        value={`$${totalRevenue.toFixed(2)}`}
      />
    </div>
  );
}
