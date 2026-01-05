import { DataTable } from "@/components/tables/properties/data-table"
import { StatsBar } from "@/components/dashboard/stats-bar"
import { IconBuilding } from "@tabler/icons-react"

// Mock stats - in production, these would come from your data source
const mockStats = {
  totalProperties: 150,
  activeProperties: 47,
  totalEdits: 892,
  totalCost: 34.79,
}

export default function DashboardPage() {
  return (
    <div className="space-y-6 px-4 md:px-6 lg:px-8">
      {/* Page header with icon badge */}
      <div className="animate-fade-in-up space-y-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl shadow-sm ring-1 ring-white/10"
            style={{ backgroundColor: "var(--accent-teal)" }}
          >
            <IconBuilding className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Properties</h1>
            <p className="text-sm text-muted-foreground">
              Manage your property listings and AI edits
            </p>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <StatsBar
        totalProperties={mockStats.totalProperties}
        activeProperties={mockStats.activeProperties}
        totalEdits={mockStats.totalEdits}
        totalCost={mockStats.totalCost}
      />

      {/* Data table */}
      <div className="animate-fade-in-up stagger-3">
        <DataTable />
      </div>
    </div>
  )
}
