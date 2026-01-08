"use client";

import {
  IconAlertTriangle,
  IconCalendar,
  IconCpu,
  IconCurrencyDollar,
  IconPercentage,
  IconReceipt,
  IconTrendingUp,
} from "@tabler/icons-react";
import { useEffect, useState, useTransition } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type FalUsageResponse, getFalUsageStats } from "@/lib/actions/admin";
import type { RevenueStats } from "@/lib/db/queries";

type TimePeriod = "this-month" | "last-30-days" | "this-year";

// Skeleton components that mirror final content to avoid layout shift
function StatCardSkeleton() {
  return (
    <div className="rounded-xl bg-card p-4 shadow-xs ring-1 ring-foreground/10">
      <div className="flex items-center gap-3">
        <div className="skeleton h-10 w-10 rounded-lg" />
        <div className="space-y-2">
          <div className="skeleton h-3 w-16 rounded" />
          <div className="skeleton h-7 w-24 rounded" />
        </div>
      </div>
    </div>
  );
}

function CostBreakdownSkeleton() {
  return (
    <div className="rounded-xl bg-card p-6 shadow-xs ring-1 ring-foreground/10">
      <div className="skeleton mb-4 h-6 w-48 rounded" />
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div className="flex items-center gap-4" key={i}>
            <div className="skeleton h-9 w-9 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div className="skeleton h-4 w-28 rounded" />
                <div className="skeleton h-4 w-16 rounded" />
              </div>
              <div className="flex items-center gap-2">
                <div className="skeleton h-1.5 flex-1 rounded-full" />
                <div className="skeleton h-3 w-20 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface RevenueContentProps {
  initialRevenueStats: RevenueStats;
  initialFalUsage: FalUsageResponse | null;
  initialError: string | null;
}

function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatNOK(amountOre: number): string {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amountOre / 100);
}

function getDateRange(period: TimePeriod): {
  startDate: string;
  endDate: string;
} {
  const now = new Date();
  const endDate = now.toISOString().split("T")[0];

  switch (period) {
    case "this-month": {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        startDate: startOfMonth.toISOString().split("T")[0],
        endDate,
      };
    }
    case "last-30-days": {
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return {
        startDate: thirtyDaysAgo.toISOString().split("T")[0],
        endDate,
      };
    }
    case "this-year": {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      return {
        startDate: startOfYear.toISOString().split("T")[0],
        endDate,
      };
    }
  }
}

function getRevenueForPeriod(stats: RevenueStats, period: TimePeriod): number {
  switch (period) {
    case "this-month":
      return stats.thisMonthRevenueOre;
    case "last-30-days":
      return stats.last30DaysRevenueOre;
    case "this-year":
      return stats.thisYearRevenueOre;
  }
}

export function RevenueContent({
  initialRevenueStats,
  initialFalUsage,
  initialError,
}: RevenueContentProps) {
  const [period, setPeriod] = useState<TimePeriod>("this-month");
  const [falUsage, setFalUsage] = useState<FalUsageResponse | null>(
    initialFalUsage
  );
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(initialError);

  // Fetch Fal.ai usage data when period changes (skip initial mount)
  useEffect(() => {
    // Skip on initial mount since we have SSR data for "this-month"
    if (period === "this-month" && falUsage === initialFalUsage) {
      return;
    }

    const { startDate, endDate } = getDateRange(period);

    startTransition(async () => {
      setError(null);
      const result = await getFalUsageStats(startDate, endDate);

      if (result.success) {
        setFalUsage(result.data);
      } else {
        setError(result.error);
        setFalUsage(null);
      }
    });
  }, [period, initialFalUsage]);

  // Calculate metrics from time_series format
  const falCost =
    falUsage?.time_series?.reduce((total, bucket) => {
      return total + bucket.results.reduce((sum, r) => sum + r.cost, 0);
    }, 0) ?? 0;

  const revenueOre = getRevenueForPeriod(initialRevenueStats, period);
  const revenueUSD = revenueOre / 100 / 10; // Rough NOK to USD conversion (1 USD ≈ 10 NOK)
  const profit = revenueUSD - falCost;
  const margin = revenueUSD > 0 ? (profit / revenueUSD) * 100 : 0;

  // Aggregate costs by date from time_series buckets
  const costByDate: Record<
    string,
    { cost: number; quantity: number; icon: typeof IconCalendar }
  > = {};
  if (falUsage?.time_series) {
    for (const bucket of falUsage.time_series) {
      if (bucket.results.length === 0) continue;
      const date = new Date(bucket.bucket).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      if (!costByDate[date]) {
        costByDate[date] = { cost: 0, quantity: 0, icon: IconCalendar };
      }
      for (const result of bucket.results) {
        costByDate[date].cost += result.cost;
        costByDate[date].quantity += result.quantity;
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="stagger-1 animate-fade-in-up">
        <Tabs onValueChange={(v) => setPeriod(v as TimePeriod)} value={period}>
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="this-month">This Month</TabsTrigger>
            <TabsTrigger value="last-30-days">Last 30 Days</TabsTrigger>
            <TabsTrigger value="this-year">This Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Stats Cards */}
      {isPending ? (
        <div className="stagger-2 grid animate-fade-in-up grid-cols-2 gap-4 md:grid-cols-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      ) : (
        <div className="stagger-2 grid animate-fade-in-up grid-cols-2 gap-4 md:grid-cols-4">
          {/* Fal.ai Cost */}
          <div className="rounded-xl bg-card p-4 shadow-xs ring-1 ring-foreground/10">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{
                  backgroundColor:
                    "color-mix(in oklch, var(--accent-amber) 15%, transparent)",
                }}
              >
                <IconCurrencyDollar
                  className="h-5 w-5"
                  style={{ color: "var(--accent-amber)" }}
                />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Fal.ai Cost</p>
                <span
                  className="font-bold text-2xl tabular-nums"
                  style={{ color: "var(--accent-amber)" }}
                >
                  {formatUSD(falCost)}
                </span>
              </div>
            </div>
          </div>

          {/* Revenue */}
          <div className="rounded-xl bg-card p-4 shadow-xs ring-1 ring-foreground/10">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{
                  backgroundColor:
                    "color-mix(in oklch, var(--accent-green) 15%, transparent)",
                }}
              >
                <IconReceipt
                  className="h-5 w-5"
                  style={{ color: "var(--accent-green)" }}
                />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Revenue</p>
                <span
                  className="font-bold text-2xl tabular-nums"
                  style={{ color: "var(--accent-green)" }}
                >
                  {formatNOK(revenueOre)}
                </span>
                <p className="text-muted-foreground text-xs">
                  ~{formatUSD(revenueUSD)}
                </p>
              </div>
            </div>
          </div>

          {/* Profit */}
          <div className="rounded-xl bg-card p-4 shadow-xs ring-1 ring-foreground/10">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{
                  backgroundColor:
                    "color-mix(in oklch, var(--accent-violet) 15%, transparent)",
                }}
              >
                <IconTrendingUp
                  className="h-5 w-5"
                  style={{ color: "var(--accent-violet)" }}
                />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Profit</p>
                <span
                  className="font-bold text-2xl tabular-nums"
                  style={{
                    color:
                      profit >= 0
                        ? "var(--accent-violet)"
                        : "var(--accent-red)",
                  }}
                >
                  {formatUSD(profit)}
                </span>
              </div>
            </div>
          </div>

          {/* Margin */}
          <div className="rounded-xl bg-card p-4 shadow-xs ring-1 ring-foreground/10">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{
                  backgroundColor:
                    "color-mix(in oklch, var(--accent-teal) 15%, transparent)",
                }}
              >
                <IconPercentage
                  className="h-5 w-5"
                  style={{ color: "var(--accent-teal)" }}
                />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Margin</p>
                <span
                  className="font-bold text-2xl tabular-nums"
                  style={{
                    color:
                      margin >= 0 ? "var(--accent-teal)" : "var(--accent-red)",
                  }}
                >
                  {margin.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="stagger-3 animate-fade-in-up rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <div className="flex items-center gap-3">
            <IconAlertTriangle className="h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">
                Failed to load Fal.ai usage
              </p>
              <p className="text-muted-foreground text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Cost Breakdown */}
      {isPending ? (
        <CostBreakdownSkeleton />
      ) : (
        <div className="stagger-3 animate-fade-in-up rounded-xl bg-card p-6 shadow-xs ring-1 ring-foreground/10">
          <h3 className="mb-4 font-semibold text-lg">Cost Breakdown by Date</h3>

          {Object.keys(costByDate).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(costByDate)
                .sort(
                  ([a], [b]) => new Date(b).getTime() - new Date(a).getTime()
                )
                .map(([date, data]) => {
                  const Icon = data.icon;
                  const percentage =
                    falCost > 0 ? (data.cost / falCost) * 100 : 0;

                  return (
                    <div className="flex items-center gap-4" key={date}>
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                        style={{
                          backgroundColor:
                            "color-mix(in oklch, var(--accent-teal) 10%, transparent)",
                        }}
                      >
                        <Icon
                          className="h-4 w-4"
                          style={{ color: "var(--accent-teal)" }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="truncate font-medium">{date}</span>
                          <span className="ml-2 shrink-0 font-mono font-semibold text-sm tabular-nums">
                            {formatUSD(data.cost)}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: "var(--accent-teal)",
                              }}
                            />
                          </div>
                          <span className="shrink-0 text-muted-foreground text-xs tabular-nums">
                            {data.quantity.toLocaleString()} units
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <IconCpu className="mx-auto mb-2 h-8 w-8 opacity-50" />
              <p>No usage data for this period</p>
            </div>
          )}
        </div>
      )}

      {/* Summary Footer */}
      <div className="stagger-4 animate-fade-in-up rounded-xl border border-dashed p-4">
        <div className="flex flex-wrap items-center justify-between gap-4 text-muted-foreground text-sm">
          <span>
            Total invoices:{" "}
            <strong className="text-foreground">
              {initialRevenueStats.invoiceCount}
            </strong>
          </span>
          <span>
            Paid revenue:{" "}
            <strong className="text-foreground">
              {formatNOK(initialRevenueStats.paidRevenueOre)}
            </strong>
          </span>
          <span>
            Total revenue (all time):{" "}
            <strong className="text-foreground">
              {formatNOK(initialRevenueStats.totalRevenueOre)}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
}
