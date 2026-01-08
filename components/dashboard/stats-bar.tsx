"use client";

import {
  IconBuilding,
  IconSparkles,
  IconTrendingUp,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";

type StatItemProps = {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accentColor: string;
  delay: number;
};

function StatItem({ icon, label, value, accentColor, delay }: StatItemProps) {
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
        <p
          className="font-mono font-semibold text-lg tabular-nums"
          style={{ color: accentColor }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

type StatsBarProps = {
  totalProperties: number;
  activeProperties: number;
  totalEdits: number;
};

export function StatsBar({
  totalProperties,
  activeProperties,
  totalEdits,
}: StatsBarProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <StatItem
        accentColor="var(--accent-teal)"
        delay={0}
        icon={<IconBuilding className="h-4 w-4" />}
        label="Total Properties"
        value={totalProperties.toLocaleString()}
      />
      <StatItem
        accentColor="var(--accent-green)"
        delay={100}
        icon={<IconTrendingUp className="h-4 w-4" />}
        label="Active"
        value={activeProperties.toLocaleString()}
      />
      <StatItem
        accentColor="var(--accent-teal)"
        delay={200}
        icon={<IconSparkles className="h-4 w-4" />}
        label="AI Edits"
        value={totalEdits.toLocaleString()}
      />
    </div>
  );
}
