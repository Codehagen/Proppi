"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import {
  createVideoProject as dbCreateVideoProject,
  createVideoClips,
  updateVideoProject,
  updateVideoClip,
  deleteVideoProject as dbDeleteVideoProject,
  getVideoProjectById,
  getVideoClips,
  updateClipSequenceOrders,
  getMusicTracks as dbGetMusicTracks,
  updateVideoProjectCounts,
} from "@/lib/db/queries"
import { getUserWithWorkspace } from "@/lib/db/queries"
import { deleteVideoProjectFiles, uploadVideoSourceImage, getVideoSourceImagePath, getExtensionFromContentType } from "@/lib/supabase"
import { auth as triggerAuth } from "@trigger.dev/sdk/v3"
import { generateVideoTask } from "@/trigger/video-orchestrator"
import { calculateVideoCost, costToCents, VIDEO_DEFAULTS } from "@/lib/video/video-constants"
import { getMotionPrompt } from "@/lib/video/motion-prompts"
import type { VideoRoomType, VideoAspectRatio, NewVideoClip } from "@/lib/db/schema"

// ============================================================================
// Types
// ============================================================================

export interface CreateVideoInput {
  name: string
  aspectRatio?: VideoAspectRatio
  musicTrackId?: string | null
  musicVolume?: number
  clips: Array<{
    sourceImageUrl: string
    imageGenerationId?: string | null
    roomType: VideoRoomType
    roomLabel?: string | null
    sequenceOrder: number
    durationSeconds?: number
  }>
}

export interface UpdateClipInput {
  clipId: string
  roomType?: VideoRoomType
  roomLabel?: string | null
  motionPrompt?: string | null
}

// ============================================================================
// Actions
// ============================================================================

export async function createVideoProject(input: CreateVideoInput) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const userData = await getUserWithWorkspace(session.user.id)
  if (!userData) {
    throw new Error("User or workspace not found")
  }

  const { user, workspace } = userData

  // Calculate estimated cost
  const estimatedCost = costToCents(calculateVideoCost(input.clips.length))

  // Create video project
  const videoProject = await dbCreateVideoProject({
    workspaceId: workspace.id,
    userId: user.id,
    name: input.name,
    aspectRatio: input.aspectRatio ?? VIDEO_DEFAULTS.ASPECT_RATIO,
    musicTrackId: input.musicTrackId ?? null,
    musicVolume: input.musicVolume ?? VIDEO_DEFAULTS.MUSIC_VOLUME,
    status: "draft",
    clipCount: input.clips.length,
    completedClipCount: 0,
    estimatedCost,
  })

  // Create clips
  const clipsData: Omit<NewVideoClip, "id" | "createdAt" | "updatedAt">[] = input.clips.map(
    (clip) => ({
      videoProjectId: videoProject.id,
      sourceImageUrl: clip.sourceImageUrl,
      imageGenerationId: clip.imageGenerationId ?? null,
      roomType: clip.roomType,
      roomLabel: clip.roomLabel ?? null,
      sequenceOrder: clip.sequenceOrder,
      motionPrompt: getMotionPrompt(clip.roomType),
      durationSeconds: clip.durationSeconds ?? VIDEO_DEFAULTS.CLIP_DURATION,
      status: "pending" as const,
    })
  )

  await createVideoClips(clipsData)

  revalidatePath("/video")

  return { success: true, videoProjectId: videoProject.id }
}

export async function triggerVideoGeneration(videoProjectId: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const projectData = await getVideoProjectById(videoProjectId)
  if (!projectData) {
    throw new Error("Video project not found")
  }

  // Verify ownership
  const userData = await getUserWithWorkspace(session.user.id)
  if (!userData || projectData.videoProject.workspaceId !== userData.workspace.id) {
    throw new Error("Unauthorized")
  }

  // Trigger the video generation task
  const handle = await generateVideoTask.trigger({
    videoProjectId,
  })

  // Generate public access token for real-time updates
  const publicAccessToken = await triggerAuth.createPublicToken({
    scopes: {
      read: { runs: [handle.id] }
    }
  })

  // Update project with run ID AND access token for real-time tracking
  await updateVideoProject(videoProjectId, {
    status: "generating",
    triggerRunId: handle.id,
    triggerAccessToken: publicAccessToken,
  })

  revalidatePath(`/video/${videoProjectId}`)

  return { success: true, runId: handle.id }
}

export async function updateVideoSettings(
  videoProjectId: string,
  data: {
    name?: string
    aspectRatio?: VideoAspectRatio
    musicTrackId?: string | null
    musicVolume?: number
  }
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const projectData = await getVideoProjectById(videoProjectId)
  if (!projectData) {
    throw new Error("Video project not found")
  }

  // Verify ownership
  const userData = await getUserWithWorkspace(session.user.id)
  if (!userData || projectData.videoProject.workspaceId !== userData.workspace.id) {
    throw new Error("Unauthorized")
  }

  await updateVideoProject(videoProjectId, data)

  revalidatePath(`/video/${videoProjectId}`)

  return { success: true }
}

export async function updateClip(input: UpdateClipInput) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  // Update motion prompt if room type changed
  const updateData: Parameters<typeof updateVideoClip>[1] = {}

  if (input.roomType) {
    updateData.roomType = input.roomType
    updateData.motionPrompt = input.motionPrompt ?? getMotionPrompt(input.roomType)
  }

  if (input.roomLabel !== undefined) {
    updateData.roomLabel = input.roomLabel
  }

  if (input.motionPrompt !== undefined) {
    updateData.motionPrompt = input.motionPrompt
  }

  await updateVideoClip(input.clipId, updateData)

  return { success: true }
}

export async function reorderClips(
  videoProjectId: string,
  clipOrders: Array<{ id: string; sequenceOrder: number }>
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const projectData = await getVideoProjectById(videoProjectId)
  if (!projectData) {
    throw new Error("Video project not found")
  }

  // Verify ownership
  const userData = await getUserWithWorkspace(session.user.id)
  if (!userData || projectData.videoProject.workspaceId !== userData.workspace.id) {
    throw new Error("Unauthorized")
  }

  await updateClipSequenceOrders(clipOrders)

  revalidatePath(`/video/${videoProjectId}`)

  return { success: true }
}

export async function deleteVideoProject(videoProjectId: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const projectData = await getVideoProjectById(videoProjectId)
  if (!projectData) {
    throw new Error("Video project not found")
  }

  // Verify ownership
  const userData = await getUserWithWorkspace(session.user.id)
  if (!userData || projectData.videoProject.workspaceId !== userData.workspace.id) {
    throw new Error("Unauthorized")
  }

  // Delete files from storage
  try {
    await deleteVideoProjectFiles(
      projectData.videoProject.workspaceId,
      videoProjectId
    )
  } catch (error) {
    console.error("Failed to delete video files:", error)
    // Continue with database deletion even if file deletion fails
  }

  // Delete from database (cascades to clips)
  await dbDeleteVideoProject(videoProjectId)

  revalidatePath("/video")

  return { success: true }
}

export async function getMusicTracks(category?: string) {
  return dbGetMusicTracks({ category, activeOnly: true })
}

export async function retryFailedClip(clipId: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  // Import here to avoid circular dependency
  const { generateVideoClipTask } = await import("@/trigger/generate-video-clip")

  // Reset clip status and trigger regeneration
  await updateVideoClip(clipId, {
    status: "pending",
    errorMessage: null,
    clipUrl: null,
  })

  const handle = await generateVideoClipTask.trigger({ clipId })

  await updateVideoClip(clipId, {
    status: "processing",
    metadata: { runId: handle.id },
  })

  return { success: true, runId: handle.id }
}

export async function getVideoProjectWithClips(videoProjectId: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const projectData = await getVideoProjectById(videoProjectId)
  if (!projectData) {
    return null
  }

  // Verify ownership
  const userData = await getUserWithWorkspace(session.user.id)
  if (!userData || projectData.videoProject.workspaceId !== userData.workspace.id) {
    return null
  }

  return projectData
}

// Upload a video source image to Supabase storage
export async function uploadVideoSourceImageAction(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const userData = await getUserWithWorkspace(session.user.id)
  if (!userData) {
    throw new Error("User or workspace not found")
  }

  const file = formData.get("file") as File
  if (!file) {
    throw new Error("No file provided")
  }

  // Validate file type
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
  if (!validTypes.includes(file.type)) {
    throw new Error("Invalid file type. Please use JPEG, PNG, or WebP images.")
  }

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error("File too large. Maximum size is 10MB.")
  }

  // Generate unique ID for the image
  const imageId = crypto.randomUUID()
  const extension = getExtensionFromContentType(file.type)
  const path = getVideoSourceImagePath(userData.workspace.id, `${imageId}.${extension}`)

  // Convert file to buffer
  const arrayBuffer = await file.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)

  // Upload to Supabase
  const publicUrl = await uploadVideoSourceImage(buffer, path, file.type)

  return { success: true, url: publicUrl, imageId }
}
