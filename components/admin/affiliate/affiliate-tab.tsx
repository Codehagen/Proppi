"use client";

import {
  IconArrowRight,
  IconBuilding,
  IconCash,
  IconCheck,
  IconLoader2,
  IconPercentage,
  IconUsers,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { markEarningsAsPaidOutAction } from "@/lib/actions/affiliate";
import type {
  AffiliateEarningRow,
  AffiliateRelationshipRow,
  AffiliateStats,
} from "@/lib/db/queries";

// Format Norwegian currency
function formatNOK(amountOre: number): string {
  const nok = amountOre / 100;
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(nok);
}

interface AffiliateTabProps {
  relationships: AffiliateRelationshipRow[];
  earnings: AffiliateEarningRow[];
  stats: AffiliateStats;
}

export function AffiliateTab({
  relationships,
  earnings,
  stats,
}: AffiliateTabProps) {
  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <AffiliateStatsBar stats={stats} />

      {/* Relationships Table */}
      <div className="space-y-3">
        <h3 className="font-medium text-muted-foreground text-sm">
          Affiliate-relasjoner
        </h3>
        <AffiliateRelationshipsTable relationships={relationships} />
      </div>

      {/* Earnings Table */}
      <div className="space-y-3">
        <h3 className="font-medium text-muted-foreground text-sm">
          Provisjoner
        </h3>
        <AffiliateEarningsTable earnings={earnings} />
      </div>
    </div>
  );
}

// Stats Bar Component
function AffiliateStatsBar({ stats }: { stats: AffiliateStats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl bg-card p-4 shadow-xs ring-1 ring-foreground/10">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{
              backgroundColor:
                "color-mix(in oklch, var(--accent-amber) 15%, transparent)",
            }}
          >
            <IconCash
              className="h-5 w-5"
              style={{ color: "var(--accent-amber)" }}
            />
          </div>
          <div>
            <p className="text-muted-foreground text-xs">
              Venter pa utbetaling
            </p>
            <p
              className="font-semibold text-lg tabular-nums"
              style={{ color: "var(--accent-amber)" }}
            >
              {formatNOK(stats.totalPendingEarningsOre)}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-card p-4 shadow-xs ring-1 ring-foreground/10">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{
              backgroundColor:
                "color-mix(in oklch, var(--accent-green) 15%, transparent)",
            }}
          >
            <IconCheck
              className="h-5 w-5"
              style={{ color: "var(--accent-green)" }}
            />
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Utbetalt totalt</p>
            <p
              className="font-semibold text-lg tabular-nums"
              style={{ color: "var(--accent-green)" }}
            >
              {formatNOK(stats.totalPaidOutEarningsOre)}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-card p-4 shadow-xs ring-1 ring-foreground/10">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{
              backgroundColor:
                "color-mix(in oklch, var(--accent-teal) 15%, transparent)",
            }}
          >
            <IconUsers
              className="h-5 w-5"
              style={{ color: "var(--accent-teal)" }}
            />
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Aktive affiliates</p>
            <p
              className="font-semibold text-lg tabular-nums"
              style={{ color: "var(--accent-teal)" }}
            >
              {stats.activeAffiliatesCount}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-card p-4 shadow-xs ring-1 ring-foreground/10">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{
              backgroundColor:
                "color-mix(in oklch, var(--accent-violet) 15%, transparent)",
            }}
          >
            <IconPercentage
              className="h-5 w-5"
              style={{ color: "var(--accent-violet)" }}
            />
          </div>
          <div>
            <p className="text-muted-foreground text-xs">
              Ventende utbetalinger
            </p>
            <p
              className="font-semibold text-lg tabular-nums"
              style={{ color: "var(--accent-violet)" }}
            >
              {stats.pendingPayoutsCount}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Relationships Table Component
function AffiliateRelationshipsTable({
  relationships,
}: {
  relationships: AffiliateRelationshipRow[];
}) {
  if (relationships.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
        <div
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
          style={{
            backgroundColor:
              "color-mix(in oklch, var(--accent-teal) 15%, transparent)",
          }}
        >
          <IconUsers
            className="h-6 w-6"
            style={{ color: "var(--accent-teal)" }}
          />
        </div>
        <h3 className="font-semibold text-lg">Ingen affiliates enna</h3>
        <p className="mt-1 text-muted-foreground text-sm">
          Affiliate-relasjoner vil vises her nar de opprettes.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-card shadow-xs ring-1 ring-foreground/10">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Affiliate</TableHead>
            <TableHead />
            <TableHead>Henvist kunde</TableHead>
            <TableHead className="text-center">Provisjon</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Opprettet</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {relationships.map((rel) => (
            <TableRow key={rel.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-md"
                    style={{
                      backgroundColor:
                        "color-mix(in oklch, var(--accent-teal) 15%, transparent)",
                    }}
                  >
                    <IconBuilding
                      className="h-4 w-4"
                      style={{ color: "var(--accent-teal)" }}
                    />
                  </div>
                  <span className="font-medium">
                    {rel.affiliateWorkspaceName}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <IconArrowRight className="h-4 w-4 text-muted-foreground" />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-md"
                    style={{
                      backgroundColor:
                        "color-mix(in oklch, var(--accent-violet) 15%, transparent)",
                    }}
                  >
                    <IconBuilding
                      className="h-4 w-4"
                      style={{ color: "var(--accent-violet)" }}
                    />
                  </div>
                  <span className="text-sm">{rel.referredWorkspaceName}</span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Badge
                  className="font-mono"
                  style={{
                    borderColor:
                      "color-mix(in oklch, var(--accent-amber) 30%, transparent)",
                    backgroundColor:
                      "color-mix(in oklch, var(--accent-amber) 10%, transparent)",
                    color: "var(--accent-amber)",
                  }}
                  variant="outline"
                >
                  {rel.commissionPercent}%
                </Badge>
              </TableCell>
              <TableCell>
                {rel.isActive ? (
                  <Badge
                    className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    variant="outline"
                  >
                    Aktiv
                  </Badge>
                ) : (
                  <Badge
                    className="border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-400"
                    variant="outline"
                  >
                    Inaktiv
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <span className="text-muted-foreground text-sm">
                  {rel.createdAt.toLocaleDateString("nb-NO", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Footer */}
      <div className="border-t px-4 py-3 text-muted-foreground text-sm">
        <span
          className="font-mono font-semibold"
          style={{ color: "var(--accent-teal)" }}
        >
          {relationships.length}
        </span>{" "}
        affiliate-relasjoner
      </div>
    </div>
  );
}

// Earnings Table Component
function AffiliateEarningsTable({
  earnings,
}: {
  earnings: AffiliateEarningRow[];
}) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPaying, setIsPaying] = useState(false);

  const pendingEarnings = useMemo(
    () => earnings.filter((e) => e.status === "pending"),
    [earnings]
  );

  const allSelected =
    pendingEarnings.length > 0 && selectedIds.size === pendingEarnings.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingEarnings.map((e) => e.id)));
    }
  };

  const toggleItem = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const selectedTotal = useMemo(() => {
    return earnings
      .filter((e) => selectedIds.has(e.id))
      .reduce((sum, e) => sum + e.earningAmountOre, 0);
  }, [earnings, selectedIds]);

  const handleMarkAsPaid = async () => {
    if (selectedIds.size === 0) return;

    setIsPaying(true);
    try {
      const result = await markEarningsAsPaidOutAction({
        earningIds: Array.from(selectedIds),
        reference: `Utbetalt ${new Date().toLocaleDateString("nb-NO")}`,
      });

      if (result.success) {
        toast.success("Provisjoner utbetalt", {
          description: `${result.data?.count ?? selectedIds.size} provisjoner markert som utbetalt`,
        });
        setSelectedIds(new Set());
        router.refresh();
      } else {
        toast.error("Feil", { description: result.error });
      }
    } catch {
      toast.error("Feil", { description: "Kunne ikke markere som utbetalt" });
    } finally {
      setIsPaying(false);
    }
  };

  if (earnings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
        <div
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
          style={{
            backgroundColor:
              "color-mix(in oklch, var(--accent-amber) 15%, transparent)",
          }}
        >
          <IconCash
            className="h-6 w-6"
            style={{ color: "var(--accent-amber)" }}
          />
        </div>
        <h3 className="font-semibold text-lg">Ingen provisjoner enna</h3>
        <p className="mt-1 text-muted-foreground text-sm">
          Provisjoner vil vises her nar fakturaer blir betalt.
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Action Bar */}
        {pendingEarnings.length > 0 && (
          <Alert className="border-border bg-muted/30">
            <IconCash className="h-4 w-4" />
            {selectedIds.size > 0 ? (
              <>
                <AlertTitle className="flex items-center gap-2">
                  {selectedIds.size} provisjon
                  {selectedIds.size !== 1 ? "er" : ""} valgt
                  <Badge className="font-mono font-normal" variant="outline">
                    {formatNOK(selectedTotal)}
                  </Badge>
                </AlertTitle>
                <AlertDescription>
                  Marker som utbetalt for a fullfoere utbetalingen
                </AlertDescription>
              </>
            ) : (
              <>
                <AlertTitle>Ventende provisjoner</AlertTitle>
                <AlertDescription>
                  Velg provisjoner for a markere dem som utbetalt
                </AlertDescription>
              </>
            )}
            <AlertAction>
              <Button
                disabled={selectedIds.size === 0 || isPaying}
                onClick={handleMarkAsPaid}
                size="sm"
              >
                {isPaying ? (
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <IconCheck className="mr-2 h-4 w-4" />
                )}
                {selectedIds.size > 0
                  ? `Marker ${selectedIds.size} som utbetalt`
                  : "Marker som utbetalt"}
              </Button>
            </AlertAction>
          </Alert>
        )}

        {/* Table */}
        <div className="rounded-xl bg-card shadow-xs ring-1 ring-foreground/10">
          <Table>
            <TableHeader>
              <TableRow>
                {pendingEarnings.length > 0 && (
                  <TableHead className="w-12">
                    <Checkbox
                      aria-label="Velg alle ventende"
                      checked={
                        allSelected || (someSelected ? "indeterminate" : false)
                      }
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                )}
                <TableHead>Affiliate</TableHead>
                <TableHead>Fra kunde</TableHead>
                <TableHead>Faktura</TableHead>
                <TableHead className="text-right">Fakturabelop</TableHead>
                <TableHead className="text-center">Sats</TableHead>
                <TableHead className="text-right">Provisjon</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {earnings.map((earning) => {
                const isPending = earning.status === "pending";

                return (
                  <TableRow
                    className={`${isPending ? "cursor-pointer hover:bg-muted/50" : ""} ${selectedIds.has(earning.id) ? "bg-muted/30" : ""}`}
                    key={earning.id}
                    onClick={() => isPending && toggleItem(earning.id)}
                  >
                    {pendingEarnings.length > 0 && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        {isPending ? (
                          <Checkbox
                            aria-label={`Velg provisjon for ${earning.affiliateWorkspaceName}`}
                            checked={selectedIds.has(earning.id)}
                            onCheckedChange={() => toggleItem(earning.id)}
                          />
                        ) : (
                          <div className="h-4 w-4" />
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      <span className="font-medium">
                        {earning.affiliateWorkspaceName}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground text-sm">
                        {earning.referredWorkspaceName}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">
                        {earning.invoiceNumber
                          ? `#${earning.invoiceNumber}`
                          : "-"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-mono text-sm">
                        {formatNOK(earning.invoiceAmountOre)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-mono text-muted-foreground text-sm">
                        {earning.commissionPercent}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className="font-mono font-semibold"
                        style={{ color: "var(--accent-amber)" }}
                      >
                        {formatNOK(earning.earningAmountOre)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {earning.status === "paid_out" ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                              variant="outline"
                            >
                              Utbetalt
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            {earning.paidOutAt
                              ? earning.paidOutAt.toLocaleDateString("nb-NO")
                              : ""}
                            {earning.paidOutReference && (
                              <>
                                <br />
                                {earning.paidOutReference}
                              </>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <Badge
                          className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                          variant="outline"
                        >
                          Venter
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Footer */}
          <div className="border-t px-4 py-3 text-muted-foreground text-sm">
            <span
              className="font-mono font-semibold"
              style={{ color: "var(--accent-amber)" }}
            >
              {earnings.length}
            </span>{" "}
            provisjoner totalt
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
