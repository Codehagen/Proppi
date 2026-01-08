"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  createProject as createProjectQuery,
  deleteProject as deleteProjectQuery,
  getProjectById,
  updateProject as updateProjectQuery,
} from "@/lib/db/queries";
import { type Project, type ProjectStatus, user } from "@/lib/db/schema";
import { deleteProjectImages } from "@/lib/supabase";

export type ActionResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
    };

// CREATE - Create new project
export async function createProjectAction(
  formData: FormData
): Promise<ActionResult<Project>> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  // Get user's workspace
  const currentUser = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  if (!currentUser[0]?.workspaceId) {
    return { success: false, error: "Workspace not found" };
  }

  const name = formData.get("name") as string;
  const styleTemplateId = formData.get("styleTemplateId") as string;
  const roomType = formData.get("roomType") as string | null;

  if (!(name && styleTemplateId)) {
    return { success: false, error: "Name and style template are required" };
  }

  try {
    const newProject = await createProjectQuery({
      workspaceId: currentUser[0].workspaceId,
      userId: session.user.id,
      name,
      styleTemplateId,
      roomType: roomType || null,
      thumbnailUrl: null,
      status: "pending",
      imageCount: 0,
      completedCount: 0,
    });

    revalidatePath("/dashboard");
    return { success: true, data: newProject };
  } catch (error) {
    console.error("Failed to create project:", error);
    return { success: false, error: "Failed to create project" };
  }
}

// UPDATE - Update project name
export async function updateProjectAction(
  projectId: string,
  formData: FormData
): Promise<ActionResult<Project>> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  // Get user's workspace
  const currentUser = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  if (!currentUser[0]?.workspaceId) {
    return { success: false, error: "Workspace not found" };
  }

  // Check project belongs to user's workspace
  const projectData = await getProjectById(projectId);
  if (
    !projectData ||
    projectData.project.workspaceId !== currentUser[0].workspaceId
  ) {
    return { success: false, error: "Project not found" };
  }

  const name = formData.get("name") as string;
  const status = formData.get("status") as ProjectStatus | null;

  try {
    const updateData: Partial<Pick<Project, "name" | "status">> = {};
    if (name) updateData.name = name;
    if (status) updateData.status = status;

    const updated = await updateProjectQuery(projectId, updateData);
    if (!updated) {
      return { success: false, error: "Failed to update project" };
    }

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/${projectId}`);
    return { success: true, data: updated };
  } catch (error) {
    console.error("Failed to update project:", error);
    return { success: false, error: "Failed to update project" };
  }
}

// DELETE - Delete project and all associated images
export async function deleteProjectAction(
  projectId: string
): Promise<ActionResult<void>> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  // Get user's workspace
  const currentUser = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  if (!currentUser[0]?.workspaceId) {
    return { success: false, error: "Workspace not found" };
  }

  // Check project belongs to user's workspace
  const projectData = await getProjectById(projectId);
  if (
    !projectData ||
    projectData.project.workspaceId !== currentUser[0].workspaceId
  ) {
    return { success: false, error: "Project not found" };
  }

  try {
    // Delete images from Supabase storage
    await deleteProjectImages(currentUser[0].workspaceId, projectId);

    // Delete project from database (cascade deletes imageGeneration records)
    await deleteProjectQuery(projectId);

    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to delete project:", error);
    return { success: false, error: "Failed to delete project" };
  }
}
