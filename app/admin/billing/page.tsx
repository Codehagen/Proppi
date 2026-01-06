import { IconFileInvoice } from "@tabler/icons-react"
import { BillingStatsBar } from "@/components/admin/billing/billing-stats-bar"
import { BillingTabs } from "@/components/admin/billing/billing-tabs"
import { getBillingStats } from "@/lib/mock/admin-billing"

export default function AdminBillingPage() {
  const stats = getBillingStats()

  return (
    <div className="space-y-6 px-4 md:px-6 lg:px-8">
      {/* Page Header */}
      <div className="animate-fade-in-up space-y-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl shadow-sm ring-1 ring-white/10"
            style={{ backgroundColor: "var(--accent-amber)" }}
          >
            <IconFileInvoice className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Betalinger</h1>
            <p className="text-sm text-muted-foreground">
              Administrer fakturaer og spor inntekter fra fullførte prosjekter
            </p>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="animate-fade-in-up stagger-1">
        <BillingStatsBar stats={stats} />
      </div>

      {/* Tabs: Uninvoiced / History */}
      <div className="animate-fade-in-up stagger-2">
        <BillingTabs />
      </div>
    </div>
  )
}
