import {
  and,
  count,
  desc,
  eq,
  gt,
  inArray,
  max,
  or,
  sql,
  sum,
} from "drizzle-orm";
import { BILLING_DEFAULTS } from "@/lib/fiken-client";
import type {
  AdminWorkspaceFilters,
  AdminWorkspaceRow,
  AdminWorkspacesMeta,
  SortableWorkspaceColumn,
  SortDirection,
} from "@/lib/types/admin";
import { COST_PER_IMAGE } from "@/lib/types/admin";
import { db } from "./index";
import {
  type AffiliateEarning,
  type AffiliateEarningStatus,
  type AffiliateRelationship,
  affiliateEarning,
  affiliateRelationship,
  type ImageGeneration,
  type Invoice,
  type InvoiceLineItem,
  type InvoiceStatus,
  imageGeneration,
  invoice,
  invoiceLineItem,
  type LineItemStatus,
  type MusicTrack,
  musicTrack,
  type NewVideoClip,
  type Project,
  type ProjectStatus,
  project,
  type User,
  user,
  type VideoClip,
  type VideoProject,
  type VideoProjectStatus,
  videoClip,
  videoProject,
  type Workspace,
  type WorkspacePlan,
  type WorkspacePricing,
  type WorkspaceStatus,
  workspace,
  workspacePricing,
} from "./schema";

// ============================================================================
// User Queries
// ============================================================================

export async function getUserById(userId: string): Promise<User | null> {
  const result = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  return result[0] || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);
  return result[0] || null;
}

export async function updateUser(
  userId: string,
  data: Partial<Omit<User, "id" | "createdAt">>
): Promise<User | null> {
  const result = await db
    .update(user)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(user.id, userId))
    .returning();
  return result[0] || null;
}

// ============================================================================
// Workspace Queries
// ============================================================================

export async function getWorkspaceById(
  workspaceId: string
): Promise<Workspace | null> {
  const result = await db
    .select()
    .from(workspace)
    .where(eq(workspace.id, workspaceId))
    .limit(1);
  return result[0] || null;
}

export async function getWorkspaceBySlug(
  slug: string
): Promise<Workspace | null> {
  const result = await db
    .select()
    .from(workspace)
    .where(eq(workspace.slug, slug))
    .limit(1);
  return result[0] || null;
}

export async function updateWorkspace(
  workspaceId: string,
  data: Partial<Omit<Workspace, "id" | "createdAt">>
): Promise<Workspace | null> {
  const result = await db
    .update(workspace)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(workspace.id, workspaceId))
    .returning();
  return result[0] || null;
}

export async function getWorkspaceMembers(
  workspaceId: string
): Promise<User[]> {
  return db
    .select()
    .from(user)
    .where(eq(user.workspaceId, workspaceId))
    .orderBy(desc(user.createdAt));
}

// ============================================================================
// Image Generation Queries
// ============================================================================

export async function getImageGenerations(
  workspaceId: string,
  options?: { limit?: number; offset?: number }
): Promise<ImageGeneration[]> {
  const query = db
    .select()
    .from(imageGeneration)
    .where(eq(imageGeneration.workspaceId, workspaceId))
    .orderBy(desc(imageGeneration.createdAt));

  if (options?.limit) {
    query.limit(options.limit);
  }

  if (options?.offset) {
    query.offset(options.offset);
  }

  return query;
}

export async function getImageGenerationById(
  id: string
): Promise<ImageGeneration | null> {
  const result = await db
    .select()
    .from(imageGeneration)
    .where(eq(imageGeneration.id, id))
    .limit(1);
  return result[0] || null;
}

export async function getImageGenerationStats(workspaceId: string): Promise<{
  total: number;
  completed: number;
  processing: number;
  failed: number;
}> {
  const [totalResult] = await db
    .select({ count: count() })
    .from(imageGeneration)
    .where(eq(imageGeneration.workspaceId, workspaceId));

  const [completedResult] = await db
    .select({ count: count() })
    .from(imageGeneration)
    .where(
      and(
        eq(imageGeneration.workspaceId, workspaceId),
        eq(imageGeneration.status, "completed")
      )
    );

  const [processingResult] = await db
    .select({ count: count() })
    .from(imageGeneration)
    .where(
      and(
        eq(imageGeneration.workspaceId, workspaceId),
        eq(imageGeneration.status, "processing")
      )
    );

  const [failedResult] = await db
    .select({ count: count() })
    .from(imageGeneration)
    .where(
      and(
        eq(imageGeneration.workspaceId, workspaceId),
        eq(imageGeneration.status, "failed")
      )
    );

  return {
    total: totalResult?.count || 0,
    completed: completedResult?.count || 0,
    processing: processingResult?.count || 0,
    failed: failedResult?.count || 0,
  };
}

export async function createImageGeneration(
  data: Omit<ImageGeneration, "id" | "createdAt" | "updatedAt">
): Promise<ImageGeneration> {
  const id = crypto.randomUUID();
  const [result] = await db
    .insert(imageGeneration)
    .values({
      ...data,
      id,
    })
    .returning();
  return result;
}

export async function updateImageGeneration(
  id: string,
  data: Partial<Omit<ImageGeneration, "id" | "createdAt">>
): Promise<ImageGeneration | null> {
  const result = await db
    .update(imageGeneration)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(imageGeneration.id, id))
    .returning();
  return result[0] || null;
}

// ============================================================================
// User with Workspace (joined query)
// ============================================================================

export async function getUserWithWorkspace(userId: string): Promise<{
  user: User;
  workspace: Workspace;
} | null> {
  const userResult = await getUserById(userId);
  if (!(userResult && userResult.workspaceId)) {
    return null;
  }

  const workspaceResult = await getWorkspaceById(userResult.workspaceId);
  if (!workspaceResult) {
    return null;
  }

  return {
    user: userResult,
    workspace: workspaceResult,
  };
}

// ============================================================================
// Project Queries
// ============================================================================

export async function getProjects(
  workspaceId: string,
  options?: { limit?: number; offset?: number; status?: ProjectStatus }
): Promise<Project[]> {
  let query = db
    .select()
    .from(project)
    .where(
      options?.status
        ? and(
            eq(project.workspaceId, workspaceId),
            eq(project.status, options.status)
          )
        : eq(project.workspaceId, workspaceId)
    )
    .orderBy(desc(project.createdAt));

  if (options?.limit) {
    query = query.limit(options.limit) as typeof query;
  }

  if (options?.offset) {
    query = query.offset(options.offset) as typeof query;
  }

  return query;
}

export async function getProjectById(id: string): Promise<{
  project: Project;
  images: ImageGeneration[];
} | null> {
  const projectResult = await db
    .select()
    .from(project)
    .where(eq(project.id, id))
    .limit(1);

  if (!projectResult[0]) {
    return null;
  }

  const images = await db
    .select()
    .from(imageGeneration)
    .where(eq(imageGeneration.projectId, id))
    .orderBy(desc(imageGeneration.createdAt));

  return {
    project: projectResult[0],
    images,
  };
}

export async function getProjectStats(workspaceId: string): Promise<{
  totalProjects: number;
  completedProjects: number;
  processingProjects: number;
  totalImages: number;
}> {
  const [totalResult] = await db
    .select({ count: count() })
    .from(project)
    .where(eq(project.workspaceId, workspaceId));

  const [completedResult] = await db
    .select({ count: count() })
    .from(project)
    .where(
      and(eq(project.workspaceId, workspaceId), eq(project.status, "completed"))
    );

  const [processingResult] = await db
    .select({ count: count() })
    .from(project)
    .where(
      and(
        eq(project.workspaceId, workspaceId),
        eq(project.status, "processing")
      )
    );

  const [imagesResult] = await db
    .select({ total: sum(project.imageCount) })
    .from(project)
    .where(eq(project.workspaceId, workspaceId));

  return {
    totalProjects: totalResult?.count || 0,
    completedProjects: completedResult?.count || 0,
    processingProjects: processingResult?.count || 0,
    totalImages: Number(imagesResult?.total) || 0,
  };
}

export async function createProject(
  data: Omit<Project, "id" | "createdAt" | "updatedAt">
): Promise<Project> {
  const id = crypto.randomUUID();
  const [result] = await db
    .insert(project)
    .values({
      ...data,
      id,
    })
    .returning();
  return result;
}

export async function updateProject(
  id: string,
  data: Partial<Omit<Project, "id" | "createdAt">>
): Promise<Project | null> {
  const result = await db
    .update(project)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(project.id, id))
    .returning();
  return result[0] || null;
}

export async function deleteProject(id: string): Promise<void> {
  await db.delete(project).where(eq(project.id, id));
}

export async function updateProjectCounts(projectId: string): Promise<void> {
  // Get current project state to check if this is the first completed image
  const [currentProject] = await db
    .select({
      completedCount: project.completedCount,
      workspaceId: project.workspaceId,
      name: project.name,
    })
    .from(project)
    .where(eq(project.id, projectId))
    .limit(1);

  const previousCompletedCount = currentProject?.completedCount ?? 0;

  // Count total images for the project
  const [totalResult] = await db
    .select({ count: count() })
    .from(imageGeneration)
    .where(eq(imageGeneration.projectId, projectId));

  // Count completed images
  const [completedResult] = await db
    .select({ count: count() })
    .from(imageGeneration)
    .where(
      and(
        eq(imageGeneration.projectId, projectId),
        eq(imageGeneration.status, "completed")
      )
    );

  const imageCount = totalResult?.count || 0;
  const completedCount = completedResult?.count || 0;

  // Determine project status based on image statuses
  let status: ProjectStatus = "pending";

  if (completedCount === imageCount && imageCount > 0) {
    status = "completed";
  } else if (completedCount > 0) {
    status = "processing";
  } else {
    // Check if any images are processing
    const [processingResult] = await db
      .select({ count: count() })
      .from(imageGeneration)
      .where(
        and(
          eq(imageGeneration.projectId, projectId),
          eq(imageGeneration.status, "processing")
        )
      );

    if ((processingResult?.count || 0) > 0) {
      status = "processing";
    }

    // Check if any images failed
    const [failedResult] = await db
      .select({ count: count() })
      .from(imageGeneration)
      .where(
        and(
          eq(imageGeneration.projectId, projectId),
          eq(imageGeneration.status, "failed")
        )
      );

    if ((failedResult?.count || 0) > 0 && completedCount === 0) {
      status = "failed";
    }
  }

  // Update project
  await db
    .update(project)
    .set({
      imageCount,
      completedCount,
      status,
      updatedAt: new Date(),
    })
    .where(eq(project.id, projectId));

  // Create invoice line item if this is the first completed image
  // This triggers billing when a project gets its first successful generation
  if (previousCompletedCount === 0 && completedCount > 0 && currentProject) {
    try {
      // Check if invoice line item already exists for this project
      const existingLineItem = await db
        .select({ id: invoiceLineItem.id })
        .from(invoiceLineItem)
        .where(eq(invoiceLineItem.projectId, projectId))
        .limit(1);

      if (!existingLineItem[0]) {
        const pricing = await getWorkspacePricing(currentProject.workspaceId);
        await createInvoiceLineItem({
          workspaceId: currentProject.workspaceId,
          projectId,
          description: `AI Photo Editing - ${currentProject.name}`,
          amountOre: pricing.imageProjectPriceOre,
        });
      }
    } catch (error) {
      // Log but don't fail the project update if billing fails
      console.error(
        "[updateProjectCounts] Failed to create invoice line item:",
        error
      );
    }
  }
}

// Get images for a project
export async function getProjectImages(
  projectId: string
): Promise<ImageGeneration[]> {
  return db
    .select()
    .from(imageGeneration)
    .where(eq(imageGeneration.projectId, projectId))
    .orderBy(desc(imageGeneration.createdAt));
}

// Get all versions of an image (including the original)
export async function getImageVersions(
  imageId: string
): Promise<ImageGeneration[]> {
  // First get the image to find its root
  const image = await getImageGenerationById(imageId);
  if (!image) return [];

  // The root is either the parentId or the image itself
  const rootId = image.parentId || image.id;

  // Get all versions: the root + all images with parentId = rootId
  const versions = await db.select().from(imageGeneration).where(
    // Either the root image itself OR any image with this parentId
    eq(imageGeneration.id, rootId)
  );

  const children = await db
    .select()
    .from(imageGeneration)
    .where(eq(imageGeneration.parentId, rootId));

  // Combine and sort by version
  const allVersions = [...versions, ...children].sort(
    (a, b) => (a.version || 1) - (b.version || 1)
  );

  return allVersions;
}

// Get the latest version of an image
export async function getLatestImageVersion(
  imageId: string
): Promise<ImageGeneration | null> {
  const versions = await getImageVersions(imageId);
  if (versions.length === 0) return null;
  return versions[versions.length - 1];
}

// Get the highest version number for a root image
export async function getLatestVersionNumber(
  rootImageId: string
): Promise<number> {
  // Get max version from: the root image itself OR any image with this parentId
  const [rootResult] = await db
    .select({ version: imageGeneration.version })
    .from(imageGeneration)
    .where(eq(imageGeneration.id, rootImageId))
    .limit(1);

  const [childResult] = await db
    .select({ maxVersion: max(imageGeneration.version) })
    .from(imageGeneration)
    .where(eq(imageGeneration.parentId, rootImageId));

  const rootVersion = rootResult?.version || 1;
  const childMaxVersion = childResult?.maxVersion || 0;

  return Math.max(rootVersion, childMaxVersion);
}

// Delete all versions after a specific version number
export async function deleteVersionsAfter(
  rootImageId: string,
  afterVersion: number
): Promise<number> {
  // Delete images where:
  // - parentId = rootImageId AND version > afterVersion
  // - OR id = rootImageId AND version > afterVersion (edge case for root)
  const result = await db
    .delete(imageGeneration)
    .where(
      and(
        or(
          eq(imageGeneration.parentId, rootImageId),
          eq(imageGeneration.id, rootImageId)
        ),
        gt(imageGeneration.version, afterVersion)
      )
    )
    .returning();

  return result.length;
}

// Get project images grouped by root (for version display)
export async function getProjectImagesGrouped(
  projectId: string
): Promise<Map<string, ImageGeneration[]>> {
  const images = await getProjectImages(projectId);

  // Group by root image ID
  const grouped = new Map<string, ImageGeneration[]>();

  for (const img of images) {
    const rootId = img.parentId || img.id;
    if (!grouped.has(rootId)) {
      grouped.set(rootId, []);
    }
    grouped.get(rootId)!.push(img);
  }

  // Sort each group by version
  for (const [, versions] of grouped) {
    versions.sort((a, b) => (a.version || 1) - (b.version || 1));
  }

  return grouped;
}

// Get only the latest version of each image in a project (for bulk download)
export async function getLatestVersionImages(
  projectId: string
): Promise<ImageGeneration[]> {
  const grouped = await getProjectImagesGrouped(projectId);
  const latestVersions: ImageGeneration[] = [];

  for (const [, versions] of grouped) {
    // Get the last (highest version) from each group
    const latest = versions[versions.length - 1];
    if (latest && latest.status === "completed") {
      latestVersions.push(latest);
    }
  }

  // Sort by creation date (oldest first for consistent ordering)
  return latestVersions.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

// ============================================================================
// Video Project Queries
// ============================================================================

export async function getVideoProjects(
  workspaceId: string,
  options?: { limit?: number; offset?: number; status?: VideoProjectStatus }
): Promise<VideoProject[]> {
  let query = db
    .select()
    .from(videoProject)
    .where(
      options?.status
        ? and(
            eq(videoProject.workspaceId, workspaceId),
            eq(videoProject.status, options.status)
          )
        : eq(videoProject.workspaceId, workspaceId)
    )
    .orderBy(desc(videoProject.createdAt));

  if (options?.limit) {
    query = query.limit(options.limit) as typeof query;
  }

  if (options?.offset) {
    query = query.offset(options.offset) as typeof query;
  }

  return query;
}

export async function getVideoProjectById(id: string): Promise<{
  videoProject: VideoProject;
  clips: VideoClip[];
  musicTrack: MusicTrack | null;
} | null> {
  if (process.env.DEBUG_VIDEO === "1") {
    console.log(`[db:queries] getVideoProjectById starting for ID: ${id}`);
  }

  try {
    const result = await db
      .select()
      .from(videoProject)
      .where(eq(videoProject.id, id))
      .limit(1);

    if (!result[0]) {
      if (process.env.DEBUG_VIDEO === "1") {
        console.warn(
          `[db:queries] getVideoProjectById: No project found with ID: ${id}`
        );
      }
      return null;
    }

    if (process.env.DEBUG_VIDEO === "1") {
      console.log(
        `[db:queries] getVideoProjectById: Found project "${result[0].name}"`
      );
    }

    const clips = await db
      .select()
      .from(videoClip)
      .where(eq(videoClip.videoProjectId, id))
      .orderBy(videoClip.sequenceOrder);

    if (process.env.DEBUG_VIDEO === "1") {
      console.log(
        `[db:queries] getVideoProjectById: Found ${clips.length} clips for project ${id}`
      );
    }

    let music: MusicTrack | null = null;
    if (result[0].musicTrackId) {
      const musicResult = await db
        .select()
        .from(musicTrack)
        .where(eq(musicTrack.id, result[0].musicTrackId))
        .limit(1);
      music = musicResult[0] || null;
      if (process.env.DEBUG_VIDEO === "1") {
        console.log(
          `[db:queries] getVideoProjectById: Music track ${result[0].musicTrackId} found: ${!!music}`
        );
      }
    }

    return {
      videoProject: result[0],
      clips,
      musicTrack: music,
    };
  } catch (error) {
    console.error(
      `[db:queries] getVideoProjectById error for ID ${id}:`,
      error
    );
    throw error;
  }
}

export async function createVideoProject(
  data: Omit<VideoProject, "id" | "createdAt" | "updatedAt">
): Promise<VideoProject> {
  const id = crypto.randomUUID();
  const [result] = await db
    .insert(videoProject)
    .values({
      ...data,
      id,
    })
    .returning();
  return result;
}

export async function updateVideoProject(
  id: string,
  data: Partial<Omit<VideoProject, "id" | "createdAt">>
): Promise<VideoProject | null> {
  if (process.env.DEBUG_VIDEO === "1") {
    console.log(`[db:queries] updateVideoProject starting for ID: ${id}`, {
      status: data.status,
    });
  }

  try {
    const result = await db
      .update(videoProject)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(videoProject.id, id))
      .returning();

    if (!result[0]) {
      if (process.env.DEBUG_VIDEO === "1") {
        console.warn(
          `[db:queries] updateVideoProject: No project found to update with ID: ${id}`
        );
      }
      return null;
    }

    if (process.env.DEBUG_VIDEO === "1") {
      console.log(`[db:queries] updateVideoProject successful for ID: ${id}`);
    }
    return result[0];
  } catch (error) {
    console.error(`[db:queries] updateVideoProject error for ID ${id}:`, error);
    throw error;
  }
}

export async function deleteVideoProject(id: string): Promise<void> {
  await db.delete(videoProject).where(eq(videoProject.id, id));
}

export async function updateVideoProjectCounts(
  videoProjectId: string
): Promise<void> {
  // Count total clips
  const [totalResult] = await db
    .select({ count: count() })
    .from(videoClip)
    .where(eq(videoClip.videoProjectId, videoProjectId));

  // Count completed clips
  const [completedResult] = await db
    .select({ count: count() })
    .from(videoClip)
    .where(
      and(
        eq(videoClip.videoProjectId, videoProjectId),
        eq(videoClip.status, "completed")
      )
    );

  const clipCount = totalResult?.count || 0;
  const completedClipCount = completedResult?.count || 0;

  // Update project
  await db
    .update(videoProject)
    .set({
      clipCount,
      completedClipCount,
      updatedAt: new Date(),
    })
    .where(eq(videoProject.id, videoProjectId));
}

// ============================================================================
// Video Clip Queries
// ============================================================================

export async function getVideoClipById(id: string): Promise<VideoClip | null> {
  const result = await db
    .select()
    .from(videoClip)
    .where(eq(videoClip.id, id))
    .limit(1);
  return result[0] || null;
}

export async function getVideoClips(
  videoProjectId: string
): Promise<VideoClip[]> {
  return db
    .select()
    .from(videoClip)
    .where(eq(videoClip.videoProjectId, videoProjectId))
    .orderBy(videoClip.sequenceOrder);
}

export async function createVideoClip(
  data: Omit<VideoClip, "id" | "createdAt" | "updatedAt">
): Promise<VideoClip> {
  const id = crypto.randomUUID();
  const [result] = await db
    .insert(videoClip)
    .values({
      ...data,
      id,
    })
    .returning();
  return result;
}

export async function createVideoClips(
  clips: Array<Omit<NewVideoClip, "id" | "createdAt" | "updatedAt">>
): Promise<VideoClip[]> {
  const clipsWithIds = clips.map((clip) => ({
    ...clip,
    id: crypto.randomUUID(),
  }));
  const result = await db
    .insert(videoClip)
    .values(clipsWithIds as NewVideoClip[])
    .returning();
  return result;
}

export async function updateVideoClip(
  id: string,
  data: Partial<Omit<VideoClip, "id" | "createdAt">>
): Promise<VideoClip | null> {
  const result = await db
    .update(videoClip)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(videoClip.id, id))
    .returning();
  return result[0] || null;
}

export async function deleteVideoClip(id: string): Promise<void> {
  await db.delete(videoClip).where(eq(videoClip.id, id));
}

export async function updateClipSequenceOrders(
  clips: Array<{ id: string; sequenceOrder: number }>
): Promise<void> {
  for (const clip of clips) {
    await db
      .update(videoClip)
      .set({ sequenceOrder: clip.sequenceOrder, updatedAt: new Date() })
      .where(eq(videoClip.id, clip.id));
  }
}

// ============================================================================
// Music Track Queries
// ============================================================================

export async function getMusicTracks(options?: {
  category?: string;
  activeOnly?: boolean;
}): Promise<MusicTrack[]> {
  let query = db.select().from(musicTrack);

  if (options?.category) {
    query = query.where(
      eq(musicTrack.category, options.category)
    ) as typeof query;
  }

  if (options?.activeOnly !== false) {
    query = query.where(eq(musicTrack.isActive, true)) as typeof query;
  }

  return query.orderBy(musicTrack.name);
}

export async function getMusicTrackById(
  id: string
): Promise<MusicTrack | null> {
  const result = await db
    .select()
    .from(musicTrack)
    .where(eq(musicTrack.id, id))
    .limit(1);
  return result[0] || null;
}

export async function createMusicTrack(
  data: Omit<MusicTrack, "id" | "createdAt">
): Promise<MusicTrack> {
  const id = crypto.randomUUID();
  const [result] = await db
    .insert(musicTrack)
    .values({
      ...data,
      id,
    })
    .returning();
  return result;
}

// ============================================================================
// Video Stats
// ============================================================================

export async function getVideoProjectStats(workspaceId: string): Promise<{
  totalVideos: number;
  completedVideos: number;
  processingVideos: number;
  totalCostCents: number;
}> {
  const [totalResult] = await db
    .select({ count: count() })
    .from(videoProject)
    .where(eq(videoProject.workspaceId, workspaceId));

  const [completedResult] = await db
    .select({ count: count() })
    .from(videoProject)
    .where(
      and(
        eq(videoProject.workspaceId, workspaceId),
        eq(videoProject.status, "completed")
      )
    );

  const [processingResult] = await db
    .select({ count: count() })
    .from(videoProject)
    .where(
      and(
        eq(videoProject.workspaceId, workspaceId),
        or(
          eq(videoProject.status, "generating"),
          eq(videoProject.status, "compiling")
        )
      )
    );

  const [costResult] = await db
    .select({ total: sum(videoProject.actualCost) })
    .from(videoProject)
    .where(eq(videoProject.workspaceId, workspaceId));

  return {
    totalVideos: totalResult?.count || 0,
    completedVideos: completedResult?.count || 0,
    processingVideos: processingResult?.count || 0,
    totalCostCents: Number(costResult?.total) || 0,
  };
}

// ============================================================================
// Admin Queries (System Admin Only)
// ============================================================================

interface AdminWorkspaceQueryRow {
  [key: string]: unknown;
  id: string;
  name: string;
  slug: string;
  status: string;
  plan: string;
  created_at: string | Date;
  updated_at: string | Date;
  owner_id: string | null;
  owner_name: string | null;
  owner_email: string | null;
  owner_image: string | null;
  member_count: string;
  images_generated: string;
  videos_generated: string;
  videos_completed: string;
  video_cost_cents: string;
  last_activity_at: string | Date;
}

export async function getAdminWorkspaces(options: {
  cursor?: string | null;
  limit?: number;
  filters?: AdminWorkspaceFilters;
  sort?: [SortableWorkspaceColumn, SortDirection];
}): Promise<{
  data: AdminWorkspaceRow[];
  meta: AdminWorkspacesMeta;
}> {
  const { cursor, limit = 20, filters, sort } = options;

  // Get total count (for status/plan filters only, not cursor)
  const countConditions: ReturnType<typeof eq>[] = [];
  if (filters?.status) {
    countConditions.push(eq(workspace.status, filters.status));
  }
  if (filters?.plan) {
    countConditions.push(eq(workspace.plan, filters.plan));
  }

  const [totalResult] = await db
    .select({ count: count() })
    .from(workspace)
    .where(countConditions.length > 0 ? and(...countConditions) : undefined);

  // Build the main query with raw SQL for complex aggregations
  // We need to join user (for owner), count members, sum images, and sum videos
  const workspacesResult = await db.execute<AdminWorkspaceQueryRow>(sql`
    SELECT
      w.id,
      w.name,
      w.slug,
      w.status,
      w.plan,
      w.created_at,
      w.updated_at,
      owner.id as owner_id,
      owner.name as owner_name,
      owner.email as owner_email,
      owner.image as owner_image,
      COALESCE(member_counts.member_count, 0)::text as member_count,
      COALESCE(image_counts.images_generated, 0)::text as images_generated,
      COALESCE(video_counts.videos_generated, 0)::text as videos_generated,
      COALESCE(video_counts.videos_completed, 0)::text as videos_completed,
      COALESCE(video_counts.video_cost_cents, 0)::text as video_cost_cents,
      GREATEST(
        w.updated_at,
        COALESCE(project_activity.last_project_update, w.updated_at),
        COALESCE(video_activity.last_video_update, w.updated_at)
      ) as last_activity_at
    FROM workspace w
    LEFT JOIN "user" owner ON owner.workspace_id = w.id AND owner.role = 'owner'
    LEFT JOIN (
      SELECT workspace_id, COUNT(*)::int as member_count
      FROM "user"
      GROUP BY workspace_id
    ) member_counts ON member_counts.workspace_id = w.id
    LEFT JOIN (
      SELECT workspace_id, SUM(completed_count)::int as images_generated
      FROM project
      GROUP BY workspace_id
    ) image_counts ON image_counts.workspace_id = w.id
    LEFT JOIN (
      SELECT workspace_id,
        COUNT(*)::int as videos_generated,
        COUNT(*) FILTER (WHERE status = 'completed')::int as videos_completed,
        COALESCE(SUM(actual_cost), 0)::int as video_cost_cents
      FROM video_project
      GROUP BY workspace_id
    ) video_counts ON video_counts.workspace_id = w.id
    LEFT JOIN (
      SELECT workspace_id, MAX(updated_at) as last_project_update
      FROM project
      GROUP BY workspace_id
    ) project_activity ON project_activity.workspace_id = w.id
    LEFT JOIN (
      SELECT workspace_id, MAX(updated_at) as last_video_update
      FROM video_project
      GROUP BY workspace_id
    ) video_activity ON video_activity.workspace_id = w.id
    WHERE 1=1
    ${filters?.status ? sql`AND w.status = ${filters.status}` : sql``}
    ${filters?.plan ? sql`AND w.plan = ${filters.plan}` : sql``}
    ${
      filters?.search
        ? sql`AND (
      w.name ILIKE ${"%" + filters.search + "%"} OR
      w.slug ILIKE ${"%" + filters.search + "%"} OR
      owner.email ILIKE ${"%" + filters.search + "%"} OR
      owner.name ILIKE ${"%" + filters.search + "%"}
    )`
        : sql``
    }
    ${cursor ? sql`AND w.id > ${cursor}` : sql``}
    ORDER BY ${
      sort?.[0] === "name"
        ? sort[1] === "asc"
          ? sql`w.name ASC`
          : sql`w.name DESC`
        : sort?.[0] === "memberCount"
          ? (sort[1] === "asc" ? sql`member_count ASC` : sql`member_count DESC`)
          : sort?.[0] === "imagesGenerated"
            ? sort[1] === "asc"
              ? sql`images_generated ASC`
              : sql`images_generated DESC`
            : sort?.[0] === "totalSpend"
              ? sort[1] === "asc"
                ? sql`images_generated ASC`
                : sql`images_generated DESC`
              : sort?.[0] === "lastActivityAt"
                ? sort[1] === "asc"
                  ? sql`last_activity_at ASC`
                  : sql`last_activity_at DESC`
                : sort?.[0] === "createdAt"
                  ? sort[1] === "asc"
                    ? sql`w.created_at ASC`
                    : sql`w.created_at DESC`
                  : sql`w.created_at DESC`
    }
    LIMIT ${limit + 1}
  `);

  // postgres-js returns the result directly as an array
  const rows = workspacesResult as unknown as AdminWorkspaceQueryRow[];
  const hasMore = rows.length > limit;
  const data = rows.slice(0, limit);

  const result: AdminWorkspaceRow[] = data.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    status: row.status as WorkspaceStatus,
    plan: row.plan as WorkspacePlan,
    memberCount: Number(row.member_count) || 0,
    imagesGenerated: Number(row.images_generated) || 0,
    videosGenerated: Number(row.videos_generated) || 0,
    videosCompleted: Number(row.videos_completed) || 0,
    totalSpend:
      Math.round(Number(row.images_generated) * COST_PER_IMAGE * 100) / 100,
    totalVideoSpend: (Number(row.video_cost_cents) || 0) / 100,
    ownerId: row.owner_id,
    ownerName: row.owner_name,
    ownerEmail: row.owner_email,
    ownerImage: row.owner_image,
    createdAt: new Date(row.created_at),
    lastActivityAt: new Date(row.last_activity_at),
  }));

  return {
    data: result,
    meta: {
      cursor: hasMore && data.length > 0 ? data[data.length - 1].id : null,
      hasMore,
      total: totalResult?.count || 0,
    },
  };
}

export async function getAdminWorkspaceById(
  workspaceId: string
): Promise<AdminWorkspaceRow | null> {
  // Use a direct query for single workspace
  const workspaceData = await db
    .select()
    .from(workspace)
    .where(eq(workspace.id, workspaceId))
    .limit(1);

  if (!workspaceData[0]) {
    return null;
  }

  // Get owner
  const ownerData = await db
    .select()
    .from(user)
    .where(and(eq(user.workspaceId, workspaceId), eq(user.role, "owner")))
    .limit(1);

  // Get member count
  const [memberCount] = await db
    .select({ count: count() })
    .from(user)
    .where(eq(user.workspaceId, workspaceId));

  // Get image count
  const [imageCount] = await db
    .select({ total: sum(project.completedCount) })
    .from(project)
    .where(eq(project.workspaceId, workspaceId));

  // Get last activity
  const [lastActivity] = await db
    .select({ lastUpdate: max(project.updatedAt) })
    .from(project)
    .where(eq(project.workspaceId, workspaceId));

  const w = workspaceData[0];
  const owner = ownerData[0];
  const imagesGenerated = Number(imageCount?.total) || 0;

  return {
    id: w.id,
    name: w.name,
    slug: w.slug,
    status: w.status as WorkspaceStatus,
    plan: w.plan as WorkspacePlan,
    memberCount: memberCount?.count || 0,
    imagesGenerated,
    totalSpend: Math.round(imagesGenerated * COST_PER_IMAGE * 100) / 100,
    ownerId: owner?.id || null,
    ownerName: owner?.name || null,
    ownerEmail: owner?.email || null,
    ownerImage: owner?.image || null,
    createdAt: w.createdAt,
    lastActivityAt: lastActivity?.lastUpdate || w.updatedAt,
  };
}

export async function getAdminWorkspaceStats(): Promise<{
  total: number;
  active: number;
  suspended: number;
  trial: number;
  byPlan: { free: number; pro: number; enterprise: number };
}> {
  const [totalResult] = await db.select({ count: count() }).from(workspace);

  const [activeResult] = await db
    .select({ count: count() })
    .from(workspace)
    .where(eq(workspace.status, "active"));

  const [suspendedResult] = await db
    .select({ count: count() })
    .from(workspace)
    .where(eq(workspace.status, "suspended"));

  const [trialResult] = await db
    .select({ count: count() })
    .from(workspace)
    .where(eq(workspace.status, "trial"));

  const [freeResult] = await db
    .select({ count: count() })
    .from(workspace)
    .where(eq(workspace.plan, "free"));

  const [proResult] = await db
    .select({ count: count() })
    .from(workspace)
    .where(eq(workspace.plan, "pro"));

  const [enterpriseResult] = await db
    .select({ count: count() })
    .from(workspace)
    .where(eq(workspace.plan, "enterprise"));

  return {
    total: totalResult?.count || 0,
    active: activeResult?.count || 0,
    suspended: suspendedResult?.count || 0,
    trial: trialResult?.count || 0,
    byPlan: {
      free: freeResult?.count || 0,
      pro: proResult?.count || 0,
      enterprise: enterpriseResult?.count || 0,
    },
  };
}

// Types for admin workspace detail
export interface AdminWorkspaceDetail {
  workspace: {
    id: string;
    name: string;
    slug: string;
    status: WorkspaceStatus;
    plan: WorkspacePlan;
    organizationNumber: string | null;
    contactEmail: string | null;
    contactPerson: string | null;
    onboardingCompleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    suspendedAt: Date | null;
    suspendedReason: string | null;
  };
  owner: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  } | null;
  members: Array<{
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: string;
    createdAt: Date;
  }>;
  stats: {
    memberCount: number;
    imagesGenerated: number;
    videosGenerated: number;
    videosCompleted: number;
    totalImageSpend: number;
    totalVideoSpend: number;
  };
  recentProjects: Array<{
    id: string;
    name: string;
    status: string;
    imageCount: number;
    completedCount: number;
    createdAt: Date;
  }>;
  recentVideos: Array<{
    id: string;
    name: string;
    status: string;
    clipCount: number;
    completedClipCount: number;
    createdAt: Date;
  }>;
}

export async function getAdminWorkspaceDetail(
  workspaceId: string
): Promise<AdminWorkspaceDetail | null> {
  // Get workspace
  const workspaceData = await db
    .select()
    .from(workspace)
    .where(eq(workspace.id, workspaceId))
    .limit(1);

  if (!workspaceData[0]) {
    return null;
  }

  const w = workspaceData[0];

  // Get all members
  const membersData = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(eq(user.workspaceId, workspaceId))
    .orderBy(desc(user.createdAt));

  // Find owner
  const owner = membersData.find((m) => m.role === "owner");

  // Get image stats
  const [imageStats] = await db
    .select({ total: sum(project.completedCount) })
    .from(project)
    .where(eq(project.workspaceId, workspaceId));

  // Get video stats
  const [videoStats] = await db
    .select({
      total: count(),
      completed: sum(
        sql`CASE WHEN ${videoProject.status} = 'completed' THEN 1 ELSE 0 END`
      ),
      totalCost: sum(videoProject.actualCost),
    })
    .from(videoProject)
    .where(eq(videoProject.workspaceId, workspaceId));

  // Get recent projects (last 5)
  const recentProjectsData = await db
    .select({
      id: project.id,
      name: project.name,
      status: project.status,
      imageCount: project.imageCount,
      completedCount: project.completedCount,
      createdAt: project.createdAt,
    })
    .from(project)
    .where(eq(project.workspaceId, workspaceId))
    .orderBy(desc(project.createdAt))
    .limit(5);

  // Get recent videos (last 5)
  const recentVideosData = await db
    .select({
      id: videoProject.id,
      name: videoProject.name,
      status: videoProject.status,
      clipCount: videoProject.clipCount,
      completedClipCount: videoProject.completedClipCount,
      createdAt: videoProject.createdAt,
    })
    .from(videoProject)
    .where(eq(videoProject.workspaceId, workspaceId))
    .orderBy(desc(videoProject.createdAt))
    .limit(5);

  const imagesGenerated = Number(imageStats?.total) || 0;

  return {
    workspace: {
      id: w.id,
      name: w.name,
      slug: w.slug,
      status: w.status as WorkspaceStatus,
      plan: w.plan as WorkspacePlan,
      organizationNumber: w.organizationNumber,
      contactEmail: w.contactEmail,
      contactPerson: w.contactPerson,
      onboardingCompleted: w.onboardingCompleted,
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
      suspendedAt: w.suspendedAt,
      suspendedReason: w.suspendedReason,
    },
    owner: owner
      ? {
          id: owner.id,
          name: owner.name,
          email: owner.email,
          image: owner.image,
        }
      : null,
    members: membersData,
    stats: {
      memberCount: membersData.length,
      imagesGenerated,
      videosGenerated: Number(videoStats?.total) || 0,
      videosCompleted: Number(videoStats?.completed) || 0,
      totalImageSpend: Math.round(imagesGenerated * COST_PER_IMAGE * 100) / 100,
      totalVideoSpend: (Number(videoStats?.totalCost) || 0) / 100,
    },
    recentProjects: recentProjectsData,
    recentVideos: recentVideosData,
  };
}

// ============================================================================
// Admin User Queries
// ============================================================================

interface AdminUserQueryRow {
  [key: string]: unknown;
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  is_system_admin: boolean;
  workspace_id: string | null;
  workspace_name: string | null;
  images_generated: string;
  status: string;
  created_at: string | Date;
  updated_at: string | Date;
}

export async function getAdminUsers(options: {
  cursor?: string | null;
  limit?: number;
  filters?: import("@/lib/types/admin").AdminUserFilters;
  sort?: [import("@/lib/types/admin").SortableUserColumn, SortDirection];
}): Promise<{
  data: import("@/lib/types/admin").AdminUserRow[];
  meta: import("@/lib/types/admin").AdminUsersMeta;
}> {
  const { cursor, limit = 20, filters, sort } = options;

  // Get total count with filters (excluding cursor)
  const countConditions: ReturnType<typeof eq>[] = [];
  if (filters?.role) {
    countConditions.push(eq(user.role, filters.role));
  }
  if (filters?.workspaceId) {
    countConditions.push(eq(user.workspaceId, filters.workspaceId));
  }

  const [totalResult] = await db
    .select({ count: count() })
    .from(user)
    .where(countConditions.length > 0 ? and(...countConditions) : undefined);

  // Build the main query with raw SQL for computed status field
  const usersResult = await db.execute<AdminUserQueryRow>(sql`
    SELECT
      u.id,
      u.name,
      u.email,
      u.image,
      u.role,
      u.is_system_admin,
      u.workspace_id,
      w.name as workspace_name,
      COALESCE(image_counts.images_generated, 0)::text as images_generated,
      CASE
        WHEN u.email_verified = false THEN 'pending'
        WHEN u.updated_at < NOW() - INTERVAL '30 days' THEN 'inactive'
        ELSE 'active'
      END as status,
      u.created_at,
      u.updated_at
    FROM "user" u
    LEFT JOIN workspace w ON w.id = u.workspace_id
    LEFT JOIN (
      SELECT user_id, SUM(completed_count)::int as images_generated
      FROM project
      GROUP BY user_id
    ) image_counts ON image_counts.user_id = u.id
    WHERE 1=1
    ${
      filters?.search
        ? sql`AND (
      u.name ILIKE ${"%" + filters.search + "%"} OR
      u.email ILIKE ${"%" + filters.search + "%"} OR
      w.name ILIKE ${"%" + filters.search + "%"}
    )`
        : sql``
    }
    ${filters?.role ? sql`AND u.role = ${filters.role}` : sql``}
    ${filters?.workspaceId ? sql`AND u.workspace_id = ${filters.workspaceId}` : sql``}
    ${
      filters?.status
        ? sql`AND CASE
      WHEN u.email_verified = false THEN 'pending'
      WHEN u.updated_at < NOW() - INTERVAL '30 days' THEN 'inactive'
      ELSE 'active'
    END = ${filters.status}`
        : sql``
    }
    ${cursor ? sql`AND u.id > ${cursor}` : sql``}
    ORDER BY ${
      sort?.[0] === "name"
        ? sort[1] === "asc"
          ? sql`u.name ASC`
          : sql`u.name DESC`
        : sort?.[0] === "email"
          ? (sort[1] === "asc" ? sql`u.email ASC` : sql`u.email DESC`)
          : sort?.[0] === "role"
            ? sort[1] === "asc"
              ? sql`u.role ASC`
              : sql`u.role DESC`
            : sort?.[0] === "imagesGenerated"
              ? sort[1] === "asc"
                ? sql`images_generated ASC`
                : sql`images_generated DESC`
              : sort?.[0] === "lastActiveAt"
                ? sort[1] === "asc"
                  ? sql`u.updated_at ASC`
                  : sql`u.updated_at DESC`
                : sort?.[0] === "createdAt"
                  ? sort[1] === "asc"
                    ? sql`u.created_at ASC`
                    : sql`u.created_at DESC`
                  : sql`u.created_at DESC`
    }
    LIMIT ${limit + 1}
  `);

  // postgres-js returns the result directly as an array
  const rows = usersResult as unknown as AdminUserQueryRow[];
  const hasMore = rows.length > limit;
  const data = rows.slice(0, limit);

  type AdminUserRow = import("@/lib/types/admin").AdminUserRow;
  type UserRole = import("@/lib/types/admin").UserRole;
  type UserStatus = import("@/lib/types/admin").UserStatus;

  const result: AdminUserRow[] = data.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    image: row.image,
    role: row.role as UserRole,
    status: row.status as UserStatus,
    isSystemAdmin: row.is_system_admin,
    workspaceId: row.workspace_id,
    workspaceName: row.workspace_name,
    imagesGenerated: Number(row.images_generated) || 0,
    lastActiveAt: row.updated_at ? new Date(row.updated_at) : null,
    createdAt: new Date(row.created_at),
  }));

  return {
    data: result,
    meta: {
      cursor: hasMore && data.length > 0 ? data[data.length - 1].id : null,
      hasMore,
      total: totalResult?.count || 0,
    },
  };
}

// ============================================================================
// Admin User Detail Query
// ============================================================================

export async function getAdminUserDetail(
  userId: string
): Promise<import("@/lib/types/admin").AdminUserDetail | null> {
  type UserRole = import("@/lib/types/admin").UserRole;
  type UserStatus = import("@/lib/types/admin").UserStatus;

  // Get user
  const userData = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!userData[0]) {
    return null;
  }

  const u = userData[0];

  // Get workspace if user has one
  let workspaceData = null;
  if (u.workspaceId) {
    const [ws] = await db
      .select({
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        status: workspace.status,
        plan: workspace.plan,
      })
      .from(workspace)
      .where(eq(workspace.id, u.workspaceId))
      .limit(1);
    workspaceData = ws || null;
  }

  // Get image stats (sum of completedCount from projects by this user)
  const [imageStats] = await db
    .select({ total: sum(project.completedCount) })
    .from(project)
    .where(eq(project.userId, userId));

  // Get project count
  const [projectCount] = await db
    .select({ total: count() })
    .from(project)
    .where(eq(project.userId, userId));

  // Get video count and cost
  const [videoStats] = await db
    .select({
      total: count(),
      totalCost: sum(videoProject.actualCost),
    })
    .from(videoProject)
    .where(eq(videoProject.userId, userId));

  // Get recent projects (last 5)
  const recentProjectsData = await db
    .select({
      id: project.id,
      name: project.name,
      status: project.status,
      imageCount: project.imageCount,
      completedCount: project.completedCount,
      createdAt: project.createdAt,
    })
    .from(project)
    .where(eq(project.userId, userId))
    .orderBy(desc(project.createdAt))
    .limit(5);

  // Get recent videos (last 5)
  const recentVideosData = await db
    .select({
      id: videoProject.id,
      name: videoProject.name,
      status: videoProject.status,
      clipCount: videoProject.clipCount,
      completedClipCount: videoProject.completedClipCount,
      createdAt: videoProject.createdAt,
    })
    .from(videoProject)
    .where(eq(videoProject.userId, userId))
    .orderBy(desc(videoProject.createdAt))
    .limit(5);

  // Calculate stats
  const imagesGenerated = Number(imageStats?.total) || 0;
  const totalImageSpend =
    Math.round(imagesGenerated * COST_PER_IMAGE * 100) / 100;
  const totalVideoSpend = (Number(videoStats?.totalCost) || 0) / 100;

  // Derive status
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  let status: UserStatus = "active";
  if (!u.emailVerified) {
    status = "pending";
  } else if (u.updatedAt && u.updatedAt < thirtyDaysAgo) {
    status = "inactive";
  }

  return {
    user: {
      id: u.id,
      name: u.name,
      email: u.email,
      image: u.image,
      role: u.role as UserRole,
      status,
      isSystemAdmin: u.isSystemAdmin,
      emailVerified: u.emailVerified,
      workspaceId: u.workspaceId,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    },
    workspace: workspaceData
      ? {
          id: workspaceData.id,
          name: workspaceData.name,
          slug: workspaceData.slug,
          status:
            workspaceData.status as import("@/lib/db/schema").WorkspaceStatus,
          plan: workspaceData.plan as import("@/lib/db/schema").WorkspacePlan,
        }
      : null,
    stats: {
      imagesGenerated,
      projectsCreated: Number(projectCount?.total) || 0,
      videosCreated: Number(videoStats?.total) || 0,
      totalSpend: Math.round((totalImageSpend + totalVideoSpend) * 100) / 100,
    },
    recentProjects: recentProjectsData,
    recentVideos: recentVideosData,
  };
}

// ============================================================================
// Billing Queries - Workspace Pricing
// ============================================================================

export async function getWorkspacePricing(workspaceId: string): Promise<{
  imageProjectPriceOre: number;
  videoProjectPriceOre: number;
  fikenContactId: number | null;
}> {
  const result = await db
    .select()
    .from(workspacePricing)
    .where(eq(workspacePricing.workspaceId, workspaceId))
    .limit(1);

  const pricing = result[0];
  return {
    imageProjectPriceOre:
      pricing?.imageProjectPriceOre ?? BILLING_DEFAULTS.IMAGE_PROJECT_PRICE_ORE,
    videoProjectPriceOre:
      pricing?.videoProjectPriceOre ?? BILLING_DEFAULTS.VIDEO_PROJECT_PRICE_ORE,
    fikenContactId: pricing?.fikenContactId ?? null,
  };
}

export async function upsertWorkspacePricing(
  workspaceId: string,
  data: Partial<{
    imageProjectPriceOre: number | null;
    videoProjectPriceOre: number | null;
    fikenContactId: number | null;
  }>
): Promise<WorkspacePricing> {
  const existing = await db
    .select()
    .from(workspacePricing)
    .where(eq(workspacePricing.workspaceId, workspaceId))
    .limit(1);

  if (existing[0]) {
    const [updated] = await db
      .update(workspacePricing)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(workspacePricing.workspaceId, workspaceId))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(workspacePricing)
    .values({
      id: crypto.randomUUID(),
      workspaceId,
      ...data,
    })
    .returning();
  return created;
}

// ============================================================================
// Billing Queries - Invoice Line Items
// ============================================================================

export interface UninvoicedLineItemRow {
  id: string;
  workspaceId: string;
  workspaceName: string;
  workspaceOrgNumber: string | null;
  projectId: string | null;
  projectName: string | null;
  videoProjectId: string | null;
  videoProjectName: string | null;
  description: string;
  amountOre: number;
  quantity: number;
  createdAt: Date;
}

export async function getUninvoicedLineItems(filters?: {
  workspaceId?: string;
}): Promise<UninvoicedLineItemRow[]> {
  const conditions = [eq(invoiceLineItem.status, "pending")];

  if (filters?.workspaceId) {
    conditions.push(eq(invoiceLineItem.workspaceId, filters.workspaceId));
  }

  const results = await db
    .select({
      id: invoiceLineItem.id,
      workspaceId: invoiceLineItem.workspaceId,
      workspaceName: workspace.name,
      workspaceOrgNumber: workspace.organizationNumber,
      projectId: invoiceLineItem.projectId,
      projectName: project.name,
      videoProjectId: invoiceLineItem.videoProjectId,
      videoProjectName: videoProject.name,
      description: invoiceLineItem.description,
      amountOre: invoiceLineItem.amountOre,
      quantity: invoiceLineItem.quantity,
      createdAt: invoiceLineItem.createdAt,
    })
    .from(invoiceLineItem)
    .leftJoin(workspace, eq(invoiceLineItem.workspaceId, workspace.id))
    .leftJoin(project, eq(invoiceLineItem.projectId, project.id))
    .leftJoin(videoProject, eq(invoiceLineItem.videoProjectId, videoProject.id))
    .where(and(...conditions))
    .orderBy(desc(invoiceLineItem.createdAt));

  return results.map((r) => ({
    ...r,
    workspaceName: r.workspaceName ?? "Unknown",
  }));
}

export async function createInvoiceLineItem(data: {
  workspaceId: string;
  projectId?: string;
  videoProjectId?: string;
  description: string;
  amountOre: number;
}): Promise<InvoiceLineItem> {
  const [lineItem] = await db
    .insert(invoiceLineItem)
    .values({
      id: crypto.randomUUID(),
      workspaceId: data.workspaceId,
      projectId: data.projectId ?? null,
      videoProjectId: data.videoProjectId ?? null,
      description: data.description,
      amountOre: data.amountOre,
      quantity: 1,
      status: "pending",
    })
    .returning();
  return lineItem;
}

export async function updateInvoiceLineItemStatus(
  lineItemIds: string[],
  status: LineItemStatus,
  invoiceId?: string
): Promise<void> {
  await db
    .update(invoiceLineItem)
    .set({
      status,
      invoiceId: invoiceId ?? null,
      updatedAt: new Date(),
    })
    .where(inArray(invoiceLineItem.id, lineItemIds));
}

export async function getLineItemsByInvoiceId(
  invoiceId: string
): Promise<InvoiceLineItem[]> {
  return db
    .select()
    .from(invoiceLineItem)
    .where(eq(invoiceLineItem.invoiceId, invoiceId))
    .orderBy(invoiceLineItem.createdAt);
}

// ============================================================================
// Billing Queries - Invoices
// ============================================================================

export interface InvoiceHistoryRow {
  id: string;
  workspaceId: string;
  workspaceName: string;
  workspaceOrgNumber: string | null;
  fikenInvoiceId: number | null;
  fikenInvoiceNumber: string | null;
  totalAmountOre: number;
  totalAmountWithVatOre: number;
  status: InvoiceStatus;
  lineItemCount: number;
  issueDate: Date | null;
  dueDate: Date | null;
  paidAt: Date | null;
  createdAt: Date;
}

export async function getInvoiceHistory(filters?: {
  workspaceId?: string;
  status?: InvoiceStatus;
}): Promise<InvoiceHistoryRow[]> {
  const conditions: ReturnType<typeof eq>[] = [];

  if (filters?.workspaceId) {
    conditions.push(eq(invoice.workspaceId, filters.workspaceId));
  }
  if (filters?.status) {
    conditions.push(eq(invoice.status, filters.status));
  }

  const invoices = await db
    .select({
      id: invoice.id,
      workspaceId: invoice.workspaceId,
      workspaceName: workspace.name,
      workspaceOrgNumber: workspace.organizationNumber,
      fikenInvoiceId: invoice.fikenInvoiceId,
      fikenInvoiceNumber: invoice.fikenInvoiceNumber,
      totalAmountOre: invoice.totalAmountOre,
      status: invoice.status,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      paidAt: invoice.paidAt,
      createdAt: invoice.createdAt,
    })
    .from(invoice)
    .leftJoin(workspace, eq(invoice.workspaceId, workspace.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(invoice.createdAt));

  // Get line item counts for each invoice
  const lineItemCounts = await db
    .select({
      invoiceId: invoiceLineItem.invoiceId,
      count: count(),
    })
    .from(invoiceLineItem)
    .where(
      inArray(
        invoiceLineItem.invoiceId,
        invoices.map((i) => i.id)
      )
    )
    .groupBy(invoiceLineItem.invoiceId);

  const countMap = new Map(lineItemCounts.map((c) => [c.invoiceId, c.count]));

  return invoices.map((inv) => ({
    ...inv,
    workspaceName: inv.workspaceName ?? "Unknown",
    status: inv.status as InvoiceStatus,
    totalAmountWithVatOre: Math.round(
      inv.totalAmountOre * (1 + BILLING_DEFAULTS.VAT_RATE)
    ),
    lineItemCount: countMap.get(inv.id) ?? 0,
  }));
}

export async function getInvoiceById(
  invoiceId: string
): Promise<Invoice | null> {
  const result = await db
    .select()
    .from(invoice)
    .where(eq(invoice.id, invoiceId))
    .limit(1);
  return result[0] ?? null;
}

export async function createInvoice(data: {
  workspaceId: string;
  totalAmountOre: number;
  notes?: string;
}): Promise<Invoice> {
  const [inv] = await db
    .insert(invoice)
    .values({
      id: crypto.randomUUID(),
      workspaceId: data.workspaceId,
      totalAmountOre: data.totalAmountOre,
      status: "draft",
      notes: data.notes,
    })
    .returning();
  return inv;
}

export async function updateInvoice(
  invoiceId: string,
  data: Partial<{
    fikenInvoiceId: number;
    fikenInvoiceNumber: string;
    fikenContactId: number;
    status: InvoiceStatus;
    issueDate: Date;
    dueDate: Date;
    paidAt: Date;
    notes: string;
  }>
): Promise<Invoice | null> {
  const [updated] = await db
    .update(invoice)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(invoice.id, invoiceId))
    .returning();
  return updated ?? null;
}

// ============================================================================
// Billing Queries - Stats
// ============================================================================

export interface BillingStats {
  uninvoicedCount: number;
  uninvoicedAmountOre: number;
  pendingPaymentCount: number;
  pendingPaymentAmountOre: number;
  invoicedThisMonthCount: number;
  invoicedThisMonthAmountOre: number;
  totalInvoicedCount: number;
  totalInvoicedAmountOre: number;
}

export async function getBillingStats(): Promise<BillingStats> {
  // Uninvoiced line items
  const [uninvoiced] = await db
    .select({
      count: count(),
      amount: sum(invoiceLineItem.amountOre),
    })
    .from(invoiceLineItem)
    .where(eq(invoiceLineItem.status, "pending"));

  // Pending payment invoices (sent but not paid)
  const [pendingPayment] = await db
    .select({
      count: count(),
      amount: sum(invoice.totalAmountOre),
    })
    .from(invoice)
    .where(eq(invoice.status, "sent"));

  // Invoiced this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [thisMonth] = await db
    .select({
      count: count(),
      amount: sum(invoice.totalAmountOre),
    })
    .from(invoice)
    .where(
      and(
        gt(invoice.createdAt, startOfMonth),
        or(eq(invoice.status, "sent"), eq(invoice.status, "paid"))
      )
    );

  // Total invoiced (sent + paid)
  const [total] = await db
    .select({
      count: count(),
      amount: sum(invoice.totalAmountOre),
    })
    .from(invoice)
    .where(or(eq(invoice.status, "sent"), eq(invoice.status, "paid")));

  return {
    uninvoicedCount: uninvoiced?.count ?? 0,
    uninvoicedAmountOre: Number(uninvoiced?.amount) || 0,
    pendingPaymentCount: pendingPayment?.count ?? 0,
    pendingPaymentAmountOre: Number(pendingPayment?.amount) || 0,
    invoicedThisMonthCount: thisMonth?.count ?? 0,
    invoicedThisMonthAmountOre: Number(thisMonth?.amount) || 0,
    totalInvoicedCount: total?.count ?? 0,
    totalInvoicedAmountOre: Number(total?.amount) || 0,
  };
}

// ============================================================================
// Revenue Stats for Admin Dashboard
// ============================================================================

export interface RevenueStats {
  totalRevenueOre: number;
  thisMonthRevenueOre: number;
  last30DaysRevenueOre: number;
  thisYearRevenueOre: number;
  paidRevenueOre: number;
  invoiceCount: number;
}

export async function getRevenueStats(): Promise<RevenueStats> {
  const now = new Date();

  // Start of current month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // 30 days ago
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Start of year
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  // Total revenue (sent + paid invoices)
  const [total] = await db
    .select({
      count: count(),
      amount: sum(invoice.totalAmountOre),
    })
    .from(invoice)
    .where(or(eq(invoice.status, "sent"), eq(invoice.status, "paid")));

  // This month revenue
  const [thisMonth] = await db
    .select({
      amount: sum(invoice.totalAmountOre),
    })
    .from(invoice)
    .where(
      and(
        gt(invoice.createdAt, startOfMonth),
        or(eq(invoice.status, "sent"), eq(invoice.status, "paid"))
      )
    );

  // Last 30 days revenue
  const [last30Days] = await db
    .select({
      amount: sum(invoice.totalAmountOre),
    })
    .from(invoice)
    .where(
      and(
        gt(invoice.createdAt, thirtyDaysAgo),
        or(eq(invoice.status, "sent"), eq(invoice.status, "paid"))
      )
    );

  // This year revenue
  const [thisYear] = await db
    .select({
      amount: sum(invoice.totalAmountOre),
    })
    .from(invoice)
    .where(
      and(
        gt(invoice.createdAt, startOfYear),
        or(eq(invoice.status, "sent"), eq(invoice.status, "paid"))
      )
    );

  // Paid revenue only
  const [paid] = await db
    .select({
      amount: sum(invoice.totalAmountOre),
    })
    .from(invoice)
    .where(eq(invoice.status, "paid"));

  return {
    totalRevenueOre: Number(total?.amount) || 0,
    thisMonthRevenueOre: Number(thisMonth?.amount) || 0,
    last30DaysRevenueOre: Number(last30Days?.amount) || 0,
    thisYearRevenueOre: Number(thisYear?.amount) || 0,
    paidRevenueOre: Number(paid?.amount) || 0,
    invoiceCount: total?.count ?? 0,
  };
}

// ============================================================================
// Affiliate Queries
// ============================================================================

export interface AffiliateRelationshipRow {
  id: string;
  affiliateWorkspaceId: string;
  affiliateWorkspaceName: string;
  referredWorkspaceId: string;
  referredWorkspaceName: string;
  commissionPercent: number;
  isActive: boolean;
  notes: string | null;
  createdAt: Date;
}

export async function getAffiliateRelationships(): Promise<
  AffiliateRelationshipRow[]
> {
  const results = await db
    .select({
      id: affiliateRelationship.id,
      affiliateWorkspaceId: affiliateRelationship.affiliateWorkspaceId,
      affiliateWorkspaceName: sql<string>`(SELECT name FROM workspace WHERE id = ${affiliateRelationship.affiliateWorkspaceId})`,
      referredWorkspaceId: affiliateRelationship.referredWorkspaceId,
      referredWorkspaceName: sql<string>`(SELECT name FROM workspace WHERE id = ${affiliateRelationship.referredWorkspaceId})`,
      commissionPercent: affiliateRelationship.commissionPercent,
      isActive: affiliateRelationship.isActive,
      notes: affiliateRelationship.notes,
      createdAt: affiliateRelationship.createdAt,
    })
    .from(affiliateRelationship)
    .orderBy(desc(affiliateRelationship.createdAt));

  return results.map((r) => ({
    ...r,
    affiliateWorkspaceName: r.affiliateWorkspaceName ?? "Unknown",
    referredWorkspaceName: r.referredWorkspaceName ?? "Unknown",
  }));
}

export async function getAffiliateRelationshipByReferred(
  referredWorkspaceId: string
): Promise<AffiliateRelationship | null> {
  const result = await db
    .select()
    .from(affiliateRelationship)
    .where(
      and(
        eq(affiliateRelationship.referredWorkspaceId, referredWorkspaceId),
        eq(affiliateRelationship.isActive, true)
      )
    )
    .limit(1);
  return result[0] ?? null;
}

export async function createAffiliateRelationship(data: {
  affiliateWorkspaceId: string;
  referredWorkspaceId: string;
  commissionPercent: number;
  notes?: string;
}): Promise<AffiliateRelationship> {
  const [relationship] = await db
    .insert(affiliateRelationship)
    .values({
      id: crypto.randomUUID(),
      affiliateWorkspaceId: data.affiliateWorkspaceId,
      referredWorkspaceId: data.referredWorkspaceId,
      commissionPercent: data.commissionPercent,
      notes: data.notes ?? null,
      isActive: true,
    })
    .returning();
  return relationship;
}

export async function updateAffiliateRelationship(
  relationshipId: string,
  data: Partial<{
    commissionPercent: number;
    isActive: boolean;
    notes: string | null;
  }>
): Promise<AffiliateRelationship | null> {
  const [updated] = await db
    .update(affiliateRelationship)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(affiliateRelationship.id, relationshipId))
    .returning();
  return updated ?? null;
}

export async function deleteAffiliateRelationship(
  relationshipId: string
): Promise<void> {
  await db
    .delete(affiliateRelationship)
    .where(eq(affiliateRelationship.id, relationshipId));
}

// ============================================================================
// Affiliate Earnings Queries
// ============================================================================

export interface AffiliateEarningRow {
  id: string;
  affiliateWorkspaceId: string;
  affiliateWorkspaceName: string;
  invoiceId: string;
  invoiceNumber: string | null;
  referredWorkspaceName: string;
  invoiceAmountOre: number;
  commissionPercent: number;
  earningAmountOre: number;
  status: AffiliateEarningStatus;
  paidOutAt: Date | null;
  paidOutReference: string | null;
  createdAt: Date;
}

export async function getAffiliateEarnings(filters?: {
  affiliateWorkspaceId?: string;
  status?: AffiliateEarningStatus;
}): Promise<AffiliateEarningRow[]> {
  const conditions: ReturnType<typeof eq>[] = [];

  if (filters?.affiliateWorkspaceId) {
    conditions.push(
      eq(affiliateEarning.affiliateWorkspaceId, filters.affiliateWorkspaceId)
    );
  }
  if (filters?.status) {
    conditions.push(eq(affiliateEarning.status, filters.status));
  }

  const results = await db
    .select({
      id: affiliateEarning.id,
      affiliateWorkspaceId: affiliateEarning.affiliateWorkspaceId,
      affiliateWorkspaceName: sql<string>`(SELECT name FROM workspace WHERE id = ${affiliateEarning.affiliateWorkspaceId})`,
      invoiceId: affiliateEarning.invoiceId,
      invoiceNumber: invoice.fikenInvoiceNumber,
      referredWorkspaceName: sql<string>`(SELECT name FROM workspace WHERE id = ${invoice.workspaceId})`,
      invoiceAmountOre: affiliateEarning.invoiceAmountOre,
      commissionPercent: affiliateEarning.commissionPercent,
      earningAmountOre: affiliateEarning.earningAmountOre,
      status: affiliateEarning.status,
      paidOutAt: affiliateEarning.paidOutAt,
      paidOutReference: affiliateEarning.paidOutReference,
      createdAt: affiliateEarning.createdAt,
    })
    .from(affiliateEarning)
    .leftJoin(invoice, eq(affiliateEarning.invoiceId, invoice.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(affiliateEarning.createdAt));

  return results.map((r) => ({
    ...r,
    affiliateWorkspaceName: r.affiliateWorkspaceName ?? "Unknown",
    referredWorkspaceName: r.referredWorkspaceName ?? "Unknown",
    status: r.status as AffiliateEarningStatus,
  }));
}

export async function createAffiliateEarning(data: {
  affiliateWorkspaceId: string;
  affiliateRelationshipId: string;
  invoiceId: string;
  invoiceAmountOre: number;
  commissionPercent: number;
}): Promise<AffiliateEarning> {
  const earningAmountOre = Math.round(
    (data.invoiceAmountOre * data.commissionPercent) / 100
  );

  const [earning] = await db
    .insert(affiliateEarning)
    .values({
      id: crypto.randomUUID(),
      affiliateWorkspaceId: data.affiliateWorkspaceId,
      affiliateRelationshipId: data.affiliateRelationshipId,
      invoiceId: data.invoiceId,
      invoiceAmountOre: data.invoiceAmountOre,
      commissionPercent: data.commissionPercent,
      earningAmountOre,
      status: "pending",
    })
    .returning();
  return earning;
}

export async function markEarningsAsPaidOut(
  earningIds: string[],
  reference: string
): Promise<void> {
  await db
    .update(affiliateEarning)
    .set({
      status: "paid_out",
      paidOutAt: new Date(),
      paidOutReference: reference,
      updatedAt: new Date(),
    })
    .where(inArray(affiliateEarning.id, earningIds));
}

export interface AffiliateStats {
  totalPendingEarningsOre: number;
  totalPaidOutEarningsOre: number;
  activeAffiliatesCount: number;
  pendingPayoutsCount: number;
}

export async function getAffiliateStats(): Promise<AffiliateStats> {
  // Pending earnings
  const [pending] = await db
    .select({
      total: sum(affiliateEarning.earningAmountOre),
      count: count(),
    })
    .from(affiliateEarning)
    .where(eq(affiliateEarning.status, "pending"));

  // Paid out earnings
  const [paidOut] = await db
    .select({
      total: sum(affiliateEarning.earningAmountOre),
    })
    .from(affiliateEarning)
    .where(eq(affiliateEarning.status, "paid_out"));

  // Active affiliates
  const [activeAffiliates] = await db
    .select({ count: count() })
    .from(affiliateRelationship)
    .where(eq(affiliateRelationship.isActive, true));

  return {
    totalPendingEarningsOre: Number(pending?.total) || 0,
    totalPaidOutEarningsOre: Number(paidOut?.total) || 0,
    activeAffiliatesCount: activeAffiliates?.count ?? 0,
    pendingPayoutsCount: pending?.count ?? 0,
  };
}
