"use client";

import {
  IconAlertTriangle,
  IconBuilding,
  IconFileInvoice,
  IconLoader2,
  IconPhoto,
  IconSend,
  IconVideo,
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
import {
  createInvoiceFromLineItemsAction,
  sendInvoiceToFikenAction,
} from "@/lib/actions/billing";
import type { UninvoicedLineItemRow } from "@/lib/db/queries";

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

interface UninvoicedTableProps {
  items: UninvoicedLineItemRow[];
}

export function UninvoicedTable({ items }: UninvoicedTableProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSendingBatch, setIsSendingBatch] = useState(false);
  const [sendingSingleId, setSendingSingleId] = useState<string | null>(null);

  const allSelected = items.length > 0 && selectedIds.size === items.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((p) => p.id)));
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

  // Group selected items by workspace
  const selectedByWorkspace = useMemo(() => {
    const grouped = new Map<
      string,
      {
        workspaceName: string;
        orgNumber: string | null;
        items: UninvoicedLineItemRow[];
      }
    >();

    items
      .filter((p) => selectedIds.has(p.id))
      .forEach((p) => {
        const existing = grouped.get(p.workspaceId);
        if (existing) {
          existing.items.push(p);
        } else {
          grouped.set(p.workspaceId, {
            workspaceName: p.workspaceName,
            orgNumber: p.workspaceOrgNumber,
            items: [p],
          });
        }
      });

    return grouped;
  }, [items, selectedIds]);

  // Check if any selected workspace is missing org number
  const hasMissingOrgNumber = useMemo(() => {
    for (const ws of selectedByWorkspace.values()) {
      if (!ws.orgNumber) return true;
    }
    return false;
  }, [selectedByWorkspace]);

  const selectedTotal = useMemo(() => {
    return items
      .filter((p) => selectedIds.has(p.id))
      .reduce((sum, p) => sum + p.amountOre, 0);
  }, [items, selectedIds]);

  const handleSendInvoices = async () => {
    if (hasMissingOrgNumber) {
      toast.error("Mangler org.nr", {
        description: "En eller flere kunder mangler organisasjonsnummer",
      });
      return;
    }

    setIsSendingBatch(true);

    try {
      // Create invoices from selected line items
      const result = await createInvoiceFromLineItemsAction(
        Array.from(selectedIds)
      );

      if (!result.success) {
        toast.error("Feil", { description: result.error });
        return;
      }

      // Send each invoice to Fiken
      let sentCount = 0;
      for (const invoiceId of result.data.invoiceIds) {
        const sendResult = await sendInvoiceToFikenAction(invoiceId);
        if (sendResult.success) {
          sentCount++;
        }
      }

      toast.success("Fakturaer sendt", {
        description: `${sentCount} faktura(er) til ${selectedByWorkspace.size} kunde(r) for totalt ${formatNOK(selectedTotal)}`,
      });

      setSelectedIds(new Set());
      router.refresh();
    } catch (error) {
      toast.error("Feil", {
        description: "Kunne ikke sende fakturaer",
      });
    } finally {
      setIsSendingBatch(false);
    }
  };

  const handleSendSingle = async (item: UninvoicedLineItemRow) => {
    if (!item.workspaceOrgNumber) {
      toast.error("Mangler org.nr", {
        description: "Kunden mangler organisasjonsnummer",
      });
      return;
    }

    setSendingSingleId(item.id);

    try {
      // Create invoice from single line item
      const result = await createInvoiceFromLineItemsAction([item.id]);

      if (!result.success) {
        toast.error("Feil", { description: result.error });
        return;
      }

      // Send to Fiken
      const sendResult = await sendInvoiceToFikenAction(
        result.data.invoiceIds[0]
      );

      if (!sendResult.success) {
        toast.error("Feil", { description: sendResult.error });
        return;
      }

      toast.success("Faktura sendt", {
        description: `${item.workspaceName} – ${formatNOK(item.amountOre)}`,
      });

      router.refresh();
    } catch (error) {
      toast.error("Feil", {
        description: "Kunne ikke sende faktura",
      });
    } finally {
      setSendingSingleId(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <div
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
          style={{
            backgroundColor:
              "color-mix(in oklch, var(--accent-green) 15%, transparent)",
          }}
        >
          <IconFileInvoice
            className="h-6 w-6"
            style={{ color: "var(--accent-green)" }}
          />
        </div>
        <h3 className="font-semibold text-lg">Alt er fakturert!</h3>
        <p className="mt-1 text-muted-foreground text-sm">
          Det er ingen prosjekter som venter på fakturering.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Action Bar - Always visible to prevent layout shift */}
      <Alert className="border-border bg-muted/30">
        <IconFileInvoice className="h-4 w-4" />
        {selectedIds.size > 0 ? (
          <>
            <AlertTitle className="flex items-center gap-2">
              {selectedIds.size} prosjekt{selectedIds.size !== 1 ? "er" : ""}{" "}
              valgt
              <Badge className="font-mono font-normal" variant="outline">
                {formatNOK(selectedTotal)}
              </Badge>
            </AlertTitle>
            <AlertDescription>
              {selectedByWorkspace.size} faktura
              {selectedByWorkspace.size !== 1 ? "er" : ""} vil bli opprettet
            </AlertDescription>
          </>
        ) : (
          <>
            <AlertTitle>Velg prosjekter</AlertTitle>
            <AlertDescription>
              Klikk på en rad eller bruk avkrysningsboksene for å velge
              prosjekter
            </AlertDescription>
          </>
        )}
        <AlertAction>
          <Button
            disabled={selectedIds.size === 0 || isSendingBatch}
            onClick={handleSendInvoices}
            size="sm"
          >
            {isSendingBatch ? (
              <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <IconSend className="mr-2 h-4 w-4" />
            )}
            {selectedIds.size > 0
              ? `Send ${selectedByWorkspace.size} faktura${selectedByWorkspace.size !== 1 ? "er" : ""}`
              : "Send faktura"}
          </Button>
        </AlertAction>
      </Alert>

      {/* Table */}
      <TooltipProvider>
        <div className="rounded-xl bg-card shadow-xs ring-1 ring-foreground/10">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    aria-label="Velg alle"
                    checked={
                      allSelected || (someSelected ? "indeterminate" : false)
                    }
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead>Prosjekt</TableHead>
                <TableHead>Kunde</TableHead>
                <TableHead className="text-center">Type</TableHead>
                <TableHead className="text-right">Beløp</TableHead>
                <TableHead>Opprettet</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const isVideo = !!item.videoProjectId;
                const itemName =
                  item.projectName || item.videoProjectName || "Ukjent";
                const hasMissingOrg = !item.workspaceOrgNumber;

                return (
                  <TableRow
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${selectedIds.has(item.id) ? "bg-muted/30" : ""}`}
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        aria-label={`Velg ${itemName}`}
                        checked={selectedIds.has(item.id)}
                        onCheckedChange={() => toggleItem(item.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{itemName}</div>
                      <div className="text-muted-foreground text-xs">
                        {item.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="flex h-7 w-7 items-center justify-center rounded-md"
                          style={{
                            backgroundColor: hasMissingOrg
                              ? "color-mix(in oklch, var(--accent-red) 15%, transparent)"
                              : "color-mix(in oklch, var(--accent-violet) 15%, transparent)",
                          }}
                        >
                          {hasMissingOrg ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <IconAlertTriangle
                                  className="h-4 w-4"
                                  style={{ color: "var(--accent-red)" }}
                                />
                              </TooltipTrigger>
                              <TooltipContent>
                                Mangler org.nr – kan ikke faktureres
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <IconBuilding
                              className="h-4 w-4"
                              style={{ color: "var(--accent-violet)" }}
                            />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            {item.workspaceName}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {item.workspaceOrgNumber
                              ? `Org: ${item.workspaceOrgNumber}`
                              : "Mangler org.nr"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {isVideo ? (
                          <IconVideo className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <IconPhoto className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-muted-foreground text-xs">
                          {isVideo ? "Video" : "Foto"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className="font-mono font-semibold"
                        style={{ color: "var(--accent-amber)" }}
                      >
                        {formatNOK(item.amountOre)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground text-sm">
                        {item.createdAt.toLocaleDateString("nb-NO", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button
                        className="h-8"
                        disabled={sendingSingleId === item.id || hasMissingOrg}
                        onClick={() => handleSendSingle(item)}
                        size="sm"
                        variant="ghost"
                      >
                        {sendingSingleId === item.id ? (
                          <IconLoader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <IconSend className="h-4 w-4" />
                        )}
                      </Button>
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
              {items.length}
            </span>{" "}
            prosjekter venter på fakturering
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
}
