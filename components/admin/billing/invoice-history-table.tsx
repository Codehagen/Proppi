"use client";

import {
  IconBuilding,
  IconCheck,
  IconExternalLink,
  IconFileInvoice,
  IconLoader2,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { markInvoiceAsPaidAction } from "@/lib/actions/billing";
import type { InvoiceHistoryRow } from "@/lib/db/queries";

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

type InvoiceStatus = "draft" | "sent" | "paid" | "cancelled" | "overdue";

function StatusBadge({ status }: { status: InvoiceStatus }) {
  switch (status) {
    case "paid":
      return (
        <Badge
          className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          variant="outline"
        >
          Betalt
        </Badge>
      );
    case "sent":
      return (
        <Badge
          className="border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400"
          variant="outline"
        >
          Sendt
        </Badge>
      );
    case "draft":
      return (
        <Badge
          className="border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-400"
          variant="outline"
        >
          Utkast
        </Badge>
      );
    case "overdue":
      return (
        <Badge
          className="border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400"
          variant="outline"
        >
          Forfalt
        </Badge>
      );
    case "cancelled":
      return (
        <Badge
          className="border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-400"
          variant="outline"
        >
          Kansellert
        </Badge>
      );
    default:
      return (
        <Badge
          className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
          variant="outline"
        >
          Venter
        </Badge>
      );
  }
}

interface InvoiceHistoryTableProps {
  invoices: InvoiceHistoryRow[];
}

export function InvoiceHistoryTable({ invoices }: InvoiceHistoryTableProps) {
  const router = useRouter();
  const [markingPaidId, setMarkingPaidId] = useState<string | null>(null);

  const handleMarkAsPaid = async (invoiceId: string) => {
    setMarkingPaidId(invoiceId);
    try {
      const result = await markInvoiceAsPaidAction(invoiceId);
      if (result.success) {
        toast.success("Faktura markert som betalt", {
          description: result.affiliateEarningCreated
            ? "Affiliate-provisjon er også opprettet"
            : undefined,
        });
        router.refresh();
      } else {
        toast.error("Feil", { description: result.error });
      }
    } catch {
      toast.error("Feil", { description: "Kunne ikke markere som betalt" });
    } finally {
      setMarkingPaidId(null);
    }
  };

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <div
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
          style={{
            backgroundColor:
              "color-mix(in oklch, var(--accent-violet) 15%, transparent)",
          }}
        >
          <IconFileInvoice
            className="h-6 w-6"
            style={{ color: "var(--accent-violet)" }}
          />
        </div>
        <h3 className="font-semibold text-lg">Ingen fakturaer enna</h3>
        <p className="mt-1 text-muted-foreground text-sm">
          Fakturaer vil vises her nar du begynner a fakturere.
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="rounded-xl bg-card shadow-xs ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fakturanr.</TableHead>
              <TableHead>Kunde</TableHead>
              <TableHead className="text-center">Prosjekter</TableHead>
              <TableHead className="text-right">Belop</TableHead>
              <TableHead className="text-right">Med MVA</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Utstedt</TableHead>
              <TableHead>Forfall</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => {
              const canMarkAsPaid =
                invoice.status === "sent" && invoice.fikenInvoiceId;

              return (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <div className="font-medium font-mono">
                      {invoice.fikenInvoiceNumber
                        ? `#${invoice.fikenInvoiceNumber}`
                        : "-"}
                    </div>
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
                      <div>
                        <div className="font-medium text-sm">
                          {invoice.workspaceName}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {invoice.workspaceOrgNumber
                            ? `Org: ${invoice.workspaceOrgNumber}`
                            : "Mangler org.nr"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="tabular-nums">
                      {invoice.lineItemCount}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-mono">
                      {formatNOK(invoice.totalAmountOre)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className="font-mono font-semibold"
                      style={{ color: "var(--accent-green)" }}
                    >
                      {formatNOK(invoice.totalAmountWithVatOre)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={invoice.status} />
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground text-sm">
                      {invoice.issueDate
                        ? invoice.issueDate.toLocaleDateString("nb-NO", {
                            day: "numeric",
                            month: "short",
                          })
                        : "-"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground text-sm">
                      {invoice.dueDate
                        ? invoice.dueDate.toLocaleDateString("nb-NO", {
                            day: "numeric",
                            month: "short",
                          })
                        : "-"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {canMarkAsPaid && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              className="h-8"
                              disabled={markingPaidId === invoice.id}
                              onClick={() => handleMarkAsPaid(invoice.id)}
                              size="sm"
                              variant="ghost"
                            >
                              {markingPaidId === invoice.id ? (
                                <IconLoader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <IconCheck className="h-4 w-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Marker som betalt</TooltipContent>
                        </Tooltip>
                      )}
                      {invoice.fikenInvoiceId && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              asChild
                              className="h-8"
                              size="sm"
                              variant="ghost"
                            >
                              <a
                                href={`https://fiken.no/foretak/fiken-demo-mulig-hytte-as2/handel/salg/${invoice.fikenInvoiceId}`}
                                rel="noopener noreferrer"
                                target="_blank"
                              >
                                <IconExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Apne i Fiken</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
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
            style={{ color: "var(--accent-violet)" }}
          >
            {invoices.length}
          </span>{" "}
          fakturaer totalt
        </div>
      </div>
    </TooltipProvider>
  );
}
