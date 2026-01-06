"use client"

import { useState, useMemo } from "react"
import {
  IconSend,
  IconFileInvoice,
  IconPhoto,
  IconBuilding,
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
  getUninvoicedProjects,
  getUninvoicedByWorkspace,
  formatNOK,
  type UninvoicedProject,
} from "@/lib/mock/admin-billing"

export function UninvoicedTable() {
  const projects = useMemo(() => getUninvoicedProjects(), [])
  const byWorkspace = useMemo(() => getUninvoicedByWorkspace(), [])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const allSelected =
    projects.length > 0 && selectedIds.size === projects.length
  const someSelected = selectedIds.size > 0 && !allSelected

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(projects.map((p) => p.id)))
    }
  }

  const toggleProject = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedIds(newSet)
  }

  // Group selected projects by workspace
  const selectedByWorkspace = useMemo(() => {
    const grouped = new Map<
      string,
      { workspaceName: string; orgNumber: string; projects: UninvoicedProject[] }
    >()

    projects
      .filter((p) => selectedIds.has(p.id))
      .forEach((p) => {
        const existing = grouped.get(p.workspaceId)
        if (existing) {
          existing.projects.push(p)
        } else {
          grouped.set(p.workspaceId, {
            workspaceName: p.workspaceName,
            orgNumber: p.workspaceOrgNumber,
            projects: [p],
          })
        }
      })

    return grouped
  }, [projects, selectedIds])

  const selectedTotal = useMemo(() => {
    return projects
      .filter((p) => selectedIds.has(p.id))
      .reduce((sum, p) => sum + p.amount, 0)
  }, [projects, selectedIds])

  const handleSendInvoices = () => {
    // For now, just log what would be sent
    console.log("Sending invoices for:", selectedByWorkspace)
    alert(
      `Sender ${selectedIds.size} faktura(er) til ${selectedByWorkspace.size} kunde(r) for totalt ${formatNOK(selectedTotal)}`
    )
  }

  const handleSendSingle = (project: UninvoicedProject) => {
    console.log("Sending single invoice for:", project)
    alert(
      `Sender faktura til ${project.workspaceName} for ${formatNOK(project.amount)}`
    )
  }

  if (projects.length === 0) {
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
        <h3 className="text-lg font-semibold">Alt er fakturert!</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Det er ingen prosjekter som venter på fakturering.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">
              {selectedIds.size} valgt
            </span>
            <span className="text-sm text-muted-foreground">
              ({selectedByWorkspace.size} kunde
              {selectedByWorkspace.size !== 1 ? "r" : ""})
            </span>
            <Badge variant="outline" className="font-mono">
              {formatNOK(selectedTotal)}
            </Badge>
          </div>
          <Button onClick={handleSendInvoices} size="sm">
            <IconSend className="mr-2 h-4 w-4" />
            Send {selectedByWorkspace.size} faktura
            {selectedByWorkspace.size !== 1 ? "er" : ""}
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl bg-card shadow-xs ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Velg alle"
                />
              </TableHead>
              <TableHead>Prosjekt</TableHead>
              <TableHead>Kunde</TableHead>
              <TableHead className="text-center">Bilder</TableHead>
              <TableHead className="text-right">Beløp</TableHead>
              <TableHead>Fullført</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow
                key={project.id}
                className={selectedIds.has(project.id) ? "bg-muted/30" : ""}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(project.id)}
                    onCheckedChange={() => toggleProject(project.id)}
                    aria-label={`Velg ${project.name}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="font-medium">{project.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {project.id}
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
                        {project.workspaceName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Org: {project.workspaceOrgNumber}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <IconPhoto className="h-4 w-4 text-muted-foreground" />
                    <span className="tabular-nums">{project.imageCount}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className="font-mono font-semibold"
                    style={{ color: "var(--accent-amber)" }}
                  >
                    {formatNOK(project.amount)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {project.completedAt.toLocaleDateString("nb-NO", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSendSingle(project)}
                    className="h-8"
                  >
                    <IconSend className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Footer */}
        <div className="border-t px-4 py-3 text-sm text-muted-foreground">
          <span className="font-mono font-semibold" style={{ color: "var(--accent-amber)" }}>
            {projects.length}
          </span>{" "}
          prosjekter venter på fakturering
        </div>
      </div>
    </div>
  )
}
