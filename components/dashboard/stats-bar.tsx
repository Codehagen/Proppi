"use client"

import { useEffect, useState } from "react"
import {
  IconBuilding,
  IconSparkles,
  IconCurrencyDollar,
  IconTrendingUp,
} from "@tabler/icons-react"

type StatItemProps = {
  icon: React.ReactNode
  label: string
  value: string | number
  accentColor: string
  delay: number
}

function StatItem({ icon, label, value, accentColor, delay }: StatItemProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={`stats-card flex items-center gap-3 rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/5 transition-all duration-500 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `color-mix(in oklch, ${accentColor} 15%, transparent)` }}
      >
        <div style={{ color: accentColor }}>{icon}</div>
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p
          className="font-mono text-lg font-semibold tabular-nums"
          style={{ color: accentColor }}
        >
          {value}
        </p>
      </div>
    </div>
  )
}

type StatsBarProps = {
  totalProperties: number
  activeProperties: number
  totalEdits: number
  totalCost: number
}

export function StatsBar({
  totalProperties,
  activeProperties,
  totalEdits,
  totalCost,
}: StatsBarProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatItem
        icon={<IconBuilding className="h-4 w-4" />}
        label="Total Properties"
        value={totalProperties.toLocaleString()}
        accentColor="var(--accent-teal)"
        delay={0}
      />
      <StatItem
        icon={<IconTrendingUp className="h-4 w-4" />}
        label="Active"
        value={activeProperties.toLocaleString()}
        accentColor="var(--accent-green)"
        delay={100}
      />
      <StatItem
        icon={<IconSparkles className="h-4 w-4" />}
        label="AI Edits"
        value={totalEdits.toLocaleString()}
        accentColor="var(--accent-teal)"
        delay={200}
      />
      <StatItem
        icon={<IconCurrencyDollar className="h-4 w-4" />}
        label="Total Cost"
        value={`$${totalCost.toFixed(2)}`}
        accentColor="var(--accent-amber)"
        delay={300}
      />
    </div>
  )
}
