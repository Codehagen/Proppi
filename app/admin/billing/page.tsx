import { IconFileInvoice } from "@tabler/icons-react";
import { BillingStatsBar } from "@/components/admin/billing/billing-stats-bar";
import { BillingTabs } from "@/components/admin/billing/billing-tabs";
import { requireSystemAdmin } from "@/lib/admin-auth";
import {
  getBillingStats,
  getInvoiceHistory,
  getUninvoicedLineItems,
} from "@/lib/db/queries";

export default async function AdminBillingPage() {
  // Ensure user is system admin
  await requireSystemAdmin();

  // Fetch billing data in parallel
  const [stats, uninvoicedItems, invoices] = await Promise.all([
    getBillingStats(),
    getUninvoicedLineItems(),
    getInvoiceHistory(),
  ]);

  // Transform stats for the stats bar component (convert ore to NOK)
  const formattedStats = {
    uninvoicedCount: stats.uninvoicedCount,
    uninvoicedAmount: stats.uninvoicedAmountOre / 100,
    pendingPayment: stats.pendingPaymentCount,
    pendingPaymentAmount: stats.pendingPaymentAmountOre / 100,
    invoicedThisMonth: stats.invoicedThisMonthCount,
    invoicedAmountThisMonth: stats.invoicedThisMonthAmountOre / 100,
    invoicedCount: stats.totalInvoicedCount,
    invoicedAmount: stats.totalInvoicedAmountOre / 100,
  };

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
            <h1 className="font-bold text-2xl tracking-tight">Betalinger</h1>
            <p className="text-muted-foreground text-sm">
              Administrer fakturaer og spor inntekter fra fullførte prosjekter
            </p>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="stagger-1 animate-fade-in-up">
        <BillingStatsBar stats={formattedStats} />
      </div>

      {/* Tabs: Uninvoiced / History */}
      <div className="stagger-2 animate-fade-in-up">
        <BillingTabs invoices={invoices} uninvoicedItems={uninvoicedItems} />
      </div>
    </div>
  );
}
