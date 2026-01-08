import { IconArrowLeft, IconMovie } from "@tabler/icons-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { VideoDetailContent } from "@/components/video/video-detail-content";
import { auth } from "@/lib/auth";
import { getUserWithWorkspace, getVideoProjectById } from "@/lib/db/queries";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function VideoDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Get session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  // Get user with workspace
  const userData = await getUserWithWorkspace(session.user.id);

  if (!userData) {
    redirect("/onboarding");
  }

  // Get video project with clips
  const videoData = await getVideoProjectById(id);

  // Check if video exists and belongs to user's workspace
  if (
    !videoData ||
    videoData.videoProject.workspaceId !== userData.workspace.id
  ) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 px-4 text-center">
        <IconMovie className="h-16 w-16 text-muted-foreground/50" />
        <div>
          <h2 className="font-semibold text-xl">Video Not Found</h2>
          <p className="mt-1 text-muted-foreground">
            This video doesn&apos;t exist or has been deleted.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/video">
            <IconArrowLeft className="mr-2 h-4 w-4" />
            Back to Videos
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <VideoDetailContent
      clips={videoData.clips}
      musicTrack={videoData.musicTrack}
      videoProject={videoData.videoProject}
    />
  );
}
