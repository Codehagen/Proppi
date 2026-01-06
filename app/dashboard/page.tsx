import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getUserWithWorkspace, getProjects, getProjectStats } from "@/lib/db/queries"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export default async function DashboardPage() {
  // Get session
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/sign-in")
  }

  // Get user with workspace
  const data = await getUserWithWorkspace(session.user.id)

  if (!data) {
    redirect("/onboarding")
  }

  // Fetch real data from database
  const projects = await getProjects(data.workspace.id)
  const stats = await getProjectStats(data.workspace.id)

  return <DashboardContent projects={projects} stats={stats} />
}
