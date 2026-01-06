import { eq, desc, count, and, sum } from "drizzle-orm";
import { db } from "./index";
import {
  user,
  workspace,
  project,
  imageGeneration,
  type User,
  type Workspace,
  type Project,
  type ImageGeneration,
  type ProjectStatus,
} from "./schema";

// ============================================================================
// User Queries
// ============================================================================

export async function getUserById(userId: string): Promise<User | null> {
  const result = await db.select().from(user).where(eq(user.id, userId)).limit(1);
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

export async function getWorkspaceMembers(workspaceId: string): Promise<User[]> {
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
  if (!userResult || !userResult.workspaceId) {
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
  totalCost: number;
}> {
  const [totalResult] = await db
    .select({ count: count() })
    .from(project)
    .where(eq(project.workspaceId, workspaceId));

  const [completedResult] = await db
    .select({ count: count() })
    .from(project)
    .where(
      and(
        eq(project.workspaceId, workspaceId),
        eq(project.status, "completed")
      )
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

  const [completedImagesResult] = await db
    .select({ total: sum(project.completedCount) })
    .from(project)
    .where(eq(project.workspaceId, workspaceId));

  // Calculate cost: $0.039 per completed image
  const completedImages = Number(completedImagesResult?.total) || 0;
  const totalCost = Math.round(completedImages * 0.039 * 100) / 100;

  return {
    totalProjects: totalResult?.count || 0,
    completedProjects: completedResult?.count || 0,
    processingProjects: processingResult?.count || 0,
    totalImages: Number(imagesResult?.total) || 0,
    totalCost,
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
  const versions = await db
    .select()
    .from(imageGeneration)
    .where(
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
