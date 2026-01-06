"use client"

import { useMemo } from "react"
import {
  IconExternalLink,
  IconFileInvoice,
  IconBuilding,
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  getInvoiceHistory,
  formatNOK,
  type InvoiceStatus,
} from "@/lib/mock/admin-billing"

function StatusBadge({ status }: { status: InvoiceStatus }) {
  switch (status) {
    case "paid":
      return (
        <Badge
          variant="outline"
          className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
        >
          Betalt
        </Badge>
      )
    case "sent":
      return (
        <Badge
          variant="outline"
          className="border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400"
        >
          Sendt
        </Badge>
      )
    case "pending":
      return (
        <Badge
          variant="outline"
          className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
        >
          Venter
        </Badge>
      )
  }
}

export function InvoiceHistoryTable() {
  const invoices = useMemo(() => getInvoiceHistory(), [])

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
        <h3 className="text-lg font-semibold">Ingen fakturaer ennå</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Fakturaer vil vises her når du begynner å fakturere.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-card shadow-xs ring-1 ring-foreground/10">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fakturanr.</TableHead>
            <TableHead>Kunde</TableHead>
            <TableHead className="text-center">Prosjekter</TableHead>
            <TableHead className="text-right">Beløp</TableHead>
            <TableHead className="text-right">Med MVA</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Utstedt</TableHead>
            <TableHead>Forfall</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell>
                <div className="font-mono font-medium">
                  #{invoice.fikenInvoiceNumber}
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
                    <div className="text-sm font-medium">
                      {invoice.workspaceName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {invoice.workspaceOrgNumber}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <span className="tabular-nums">{invoice.projectCount}</span>
              </TableCell>
              <TableCell className="text-right">
                <span className="font-mono">{formatNOK(invoice.amount)}</span>
              </TableCell>
              <TableCell className="text-right">
                <span
                  className="font-mono font-semibold"
                  style={{ color: "var(--accent-green)" }}
                >
                  {formatNOK(invoice.amountWithVat)}
                </span>
              </TableCell>
              <TableCell>
                <StatusBadge status={invoice.status} />
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {invoice.issueDate.toLocaleDateString("nb-NO", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {invoice.dueDate.toLocaleDateString("nb-NO", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8"
                  asChild
                >
                  <a
                    href={`https://fiken.no/foretak/fiken-demo-mulig-hytte-as2/handel/salg/${invoice.fikenInvoiceId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IconExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Footer */}
      <div className="border-t px-4 py-3 text-sm text-muted-foreground">
        <span
          className="font-mono font-semibold"
          style={{ color: "var(--accent-violet)" }}
        >
          {invoices.length}
        </span>{" "}
        fakturaer totalt
      </div>
    </div>
  )
}
