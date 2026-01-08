import { IconShieldCheck } from "@tabler/icons-react";
import { AdminStatsBar } from "@/components/admin/admin-stats-bar";
import { RecentActivityList } from "@/components/admin/recent-activity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminStats, getRecentActivity } from "@/lib/mock/admin-stats";

export default function AdminOverviewPage() {
  const stats = getAdminStats();
  const recentActivity = getRecentActivity(12);

  return (
    <div className="space-y-6 px-4 md:px-6 lg:px-8">
      {/* Page Header */}
      <div className="animate-fade-in-up space-y-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl shadow-sm ring-1 ring-white/10"
            style={{ backgroundColor: "var(--accent-violet)" }}
          >
            <IconShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-2xl tracking-tight">
              Platform Administration
            </h1>
            <p className="text-muted-foreground text-sm">
              Monitor and manage all workspaces, users, and platform activity
            </p>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="stagger-1 animate-fade-in-up">
        <AdminStatsBar
          activeSessions={stats.activeSessions}
          activeUsers={stats.activeUsers}
          activeWorkspaces={stats.activeWorkspaces}
          imagesThisMonth={stats.imagesThisMonth}
          revenueThisMonth={stats.revenueThisMonth}
          totalImages={stats.totalImages}
          totalRevenue={stats.totalRevenue}
          totalUsers={stats.totalUsers}
          totalWorkspaces={stats.totalWorkspaces}
        />
      </div>

      {/* Recent Activity */}
      <div className="stagger-2 animate-fade-in-up">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-semibold text-base">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <RecentActivityList activities={recentActivity} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
