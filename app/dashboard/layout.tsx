import type { Metadata } from "next"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export const metadata: Metadata = {
  title: "Dashboard | AI Studio",
  description: "Manage your property photos and AI edits",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      {/* Main content - full width with consistent padding */}
      <main className="w-full py-6">{children}</main>
    </div>
  )
}
