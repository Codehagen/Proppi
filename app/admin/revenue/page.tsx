import { IconChartLine } from "@tabler/icons-react";
import { RevenueContent } from "@/components/admin/revenue/revenue-content";
import { getFalUsageStats } from "@/lib/actions/admin";
import { requireSystemAdmin } from "@/lib/admin-auth";
import { getRevenueStats } from "@/lib/db/queries";

function getDefaultDateRange() {
  const now = new Date();
  const endDate = now.toISOString().split("T")[0];
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startDate = startOfMonth.toISOString().split("T")[0];
  return { startDate, endDate };
}

export default async function AdminRevenuePage() {
  // Ensure user is system admin
  await requireSystemAdmin();

  // Fetch default period (this-month) data server-side
  const { startDate, endDate } = getDefaultDateRange();

  const [revenueStats, falUsageResult] = await Promise.all([
    getRevenueStats(),
    getFalUsageStats(startDate, endDate),
  ]);

  const initialFalUsage = falUsageResult.success ? falUsageResult.data : null;
  const initialError = falUsageResult.success ? null : falUsageResult.error;

  return (
    <div className="space-y-6 px-4 md:px-6 lg:px-8">
      {/* Page Header */}
      <div className="animate-fade-in-up space-y-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl shadow-sm ring-1 ring-white/10"
            style={{ backgroundColor: "var(--accent-green)" }}
          >
            <IconChartLine className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-2xl tracking-tight">Revenue</h1>
            <p className="text-muted-foreground text-sm">
              Track Fal.ai costs, revenue, and profit margins
            </p>
          </div>
        </div>
      </div>

      {/* Revenue Content - Client Component */}
      <RevenueContent
        initialError={initialError}
        initialFalUsage={initialFalUsage}
        initialRevenueStats={revenueStats}
      />
    </div>
  );
}
