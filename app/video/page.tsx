import {
  IconClock,
  IconMovie,
  IconPhoto,
  IconPlayerPlay,
  IconPlus,
} from "@tabler/icons-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import {
  getUserWithWorkspace,
  getVideoProjectStats,
  getVideoProjects,
} from "@/lib/db/queries";
import { cn } from "@/lib/utils";
import { formatVideoCost } from "@/lib/video/video-constants";

const statusConfig = {
  draft: { label: "Draft", variant: "status-pending" as const },
  generating: { label: "Generating", variant: "status-active" as const },
  compiling: { label: "Compiling", variant: "status-active" as const },
  completed: { label: "Completed", variant: "status-completed" as const },
  failed: { label: "Failed", variant: "destructive" as const },
};

export default async function VideoPage() {
  // Get session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  // Get user with workspace
  const data = await getUserWithWorkspace(session.user.id);

  if (!data) {
    redirect("/onboarding");
  }

  // Fetch video projects and stats
  const videos = await getVideoProjects(data.workspace.id);
  const stats = await getVideoProjectStats(data.workspace.id);

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-2xl tracking-tight">Videos</h1>
            <p className="mt-1 text-muted-foreground">
              Create cinematic property tour videos from your images
            </p>
          </div>
          <Button
            asChild
            className="gap-2"
            style={{ backgroundColor: "var(--accent-teal)" }}
          >
            <Link href="/video/new">
              <IconPlus className="h-4 w-4" />
              Create Video
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <IconMovie className="h-4 w-4" />
              <span>Total Videos</span>
            </div>
            <div className="mt-2 font-bold text-2xl">{stats.totalVideos}</div>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <IconPlayerPlay className="h-4 w-4" />
              <span>Completed</span>
            </div>
            <div className="mt-2 font-bold text-2xl text-[var(--accent-green)]">
              {stats.completedVideos}
            </div>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <IconClock className="h-4 w-4" />
              <span>Processing</span>
            </div>
            <div className="mt-2 font-bold text-2xl text-[var(--accent-teal)]">
              {stats.processingVideos}
            </div>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <span className="text-[var(--accent-amber)]">$</span>
              <span>Total Spent</span>
            </div>
            <div
              className="mt-2 font-bold text-2xl"
              style={{ color: "var(--accent-amber)" }}
            >
              {formatVideoCost(stats.totalCostCents / 100)}
            </div>
          </div>
        </div>

        {/* Video Grid */}
        {videos.length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <IconMovie className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 font-semibold text-lg">No videos yet</h3>
            <p className="mt-1 max-w-sm text-muted-foreground">
              Create your first property tour video by combining your enhanced
              images into a cinematic presentation.
            </p>
            <Button
              asChild
              className="mt-6 gap-2"
              style={{ backgroundColor: "var(--accent-teal)" }}
            >
              <Link href="/video/new">
                <IconPlus className="h-4 w-4" />
                Create Your First Video
              </Link>
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video, index) => {
              const status = statusConfig[video.status];
              return (
                <Link
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border bg-card transition-all duration-200",
                    "hover:-translate-y-0.5 hover:border-[var(--accent-teal)]/50 hover:shadow-lg",
                    "animate-fade-in-up"
                  )}
                  href={`/video/${video.id}`}
                  key={video.id}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-muted">
                    {video.thumbnailUrl ? (
                      <img
                        alt={video.name}
                        className="h-full w-full object-cover"
                        src={video.thumbnailUrl}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <IconMovie className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}

                    {/* Play overlay */}
                    {video.status === "completed" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg">
                          <IconPlayerPlay className="ml-1 h-6 w-6 text-black" />
                        </div>
                      </div>
                    )}

                    {/* Status badge */}
                    <div className="absolute top-3 right-3">
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>

                    {/* Duration */}
                    {video.durationSeconds && (
                      <div className="absolute right-3 bottom-3 rounded bg-black/70 px-2 py-0.5 font-medium text-white text-xs">
                        {Math.floor(video.durationSeconds / 60)}:
                        {(video.durationSeconds % 60)
                          .toString()
                          .padStart(2, "0")}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="truncate font-semibold">{video.name}</h3>
                    <div className="mt-2 flex items-center justify-between text-muted-foreground text-sm">
                      <div className="flex items-center gap-1">
                        <IconPhoto className="h-3.5 w-3.5" />
                        <span>{video.clipCount} clips</span>
                      </div>
                      <span>
                        {new Date(video.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Progress for generating videos */}
                    {(video.status === "generating" ||
                      video.status === "compiling") && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">
                            {video.status === "generating"
                              ? "Generating clips"
                              : "Compiling video"}
                          </span>
                          <span className="font-medium text-[var(--accent-teal)]">
                            {video.completedClipCount}/{video.clipCount}
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${video.status === "compiling" ? 100 : (video.completedClipCount / (video.clipCount || 1)) * 100}%`,
                              backgroundColor: "var(--accent-teal)",
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
