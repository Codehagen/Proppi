import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { IconArrowLeft, IconPhoto } from "@tabler/icons-react"

import { auth } from "@/lib/auth"
import { getUserWithWorkspace, getProjectById } from "@/lib/db/queries"
import { Button } from "@/components/ui/button"
import { ProjectDetailContent } from "@/components/dashboard/project-detail-content"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params

  // Get session
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/sign-in")
  }

  // Get user with workspace
  const userData = await getUserWithWorkspace(session.user.id)

  if (!userData) {
    redirect("/onboarding")
  }

  // Get project with images
  const projectData = await getProjectById(id)

  // Check if project exists and belongs to user's workspace
  if (!projectData || projectData.project.workspaceId !== userData.workspace.id) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 px-4 text-center">
        <IconPhoto className="h-16 w-16 text-muted-foreground/50" />
        <div>
          <h2 className="text-xl font-semibold">Project Not Found</h2>
          <p className="mt-1 text-muted-foreground">
            This project doesn&apos;t exist or has been deleted.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard">
            <IconArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <ProjectDetailContent
      project={projectData.project}
      images={projectData.images}
    />
  )
}
