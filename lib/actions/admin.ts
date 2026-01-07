"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { verifySystemAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { workspace, session, user, type WorkspaceStatus, type WorkspacePlan, type Workspace, type User } from "@/lib/db/schema";
import { getAdminWorkspaces, getAdminUsers } from "@/lib/db/queries";
import type {
  AdminWorkspaceRow,
  AdminWorkspaceFilters,
  AdminWorkspacesMeta,
  AdminUserRow,
  AdminUserFilters,
  AdminUsersMeta,
  SortableWorkspaceColumn,
  SortableUserColumn,
  SortDirection,
} from "@/lib/types/admin";

// ============================================================================
// Types
// ============================================================================

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// ============================================================================
// Fetch Workspaces (for pagination)
// ============================================================================

export async function fetchAdminWorkspacesAction(
  cursor: string | null,
  limit: number,
  filters: AdminWorkspaceFilters,
  sort?: [SortableWorkspaceColumn, SortDirection]
): Promise<
  ActionResult<{
    data: AdminWorkspaceRow[];
    meta: AdminWorkspacesMeta;
  }>
> {
  const adminCheck = await verifySystemAdmin();
  if (adminCheck.error) {
    return { success: false, error: adminCheck.error };
  }

  try {
    const result = await getAdminWorkspaces({
      cursor,
      limit,
      filters,
      sort,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("[admin:fetchWorkspaces] Error:", error);
    return { success: false, error: "Failed to fetch workspaces" };
  }
}

// ============================================================================
// Update Workspace Status
// ============================================================================

export async function updateWorkspaceStatusAction(
  workspaceId: string,
  status: WorkspaceStatus,
  reason?: string
): Promise<ActionResult<Workspace>> {
  const adminCheck = await verifySystemAdmin();
  if (adminCheck.error) {
    return { success: false, error: adminCheck.error };
  }

  try {
    const updateData: Partial<Workspace> = {
      status,
      updatedAt: new Date(),
    };

    // Set suspension metadata if suspending
    if (status === "suspended") {
      updateData.suspendedAt = new Date();
      updateData.suspendedReason = reason || null;
    } else {
      // Clear suspension metadata if activating
      updateData.suspendedAt = null;
      updateData.suspendedReason = null;
    }

    const [updated] = await db
      .update(workspace)
      .set(updateData)
      .where(eq(workspace.id, workspaceId))
      .returning();

    if (!updated) {
      return { success: false, error: "Workspace not found" };
    }

    revalidatePath("/admin/workspaces");
    return { success: true, data: updated };
  } catch (error) {
    console.error("[admin:updateWorkspaceStatus] Error:", error);
    return { success: false, error: "Failed to update workspace status" };
  }
}

// ============================================================================
// Update Workspace Plan
// ============================================================================

export async function updateWorkspacePlanAction(
  workspaceId: string,
  plan: WorkspacePlan
): Promise<ActionResult<Workspace>> {
  const adminCheck = await verifySystemAdmin();
  if (adminCheck.error) {
    return { success: false, error: adminCheck.error };
  }

  try {
    const [updated] = await db
      .update(workspace)
      .set({
        plan,
        updatedAt: new Date(),
      })
      .where(eq(workspace.id, workspaceId))
      .returning();

    if (!updated) {
      return { success: false, error: "Workspace not found" };
    }

    revalidatePath("/admin/workspaces");
    return { success: true, data: updated };
  } catch (error) {
    console.error("[admin:updateWorkspacePlan] Error:", error);
    return { success: false, error: "Failed to update workspace plan" };
  }
}

// ============================================================================
// Delete Workspace
// ============================================================================

export async function deleteWorkspaceAction(
  workspaceId: string
): Promise<ActionResult<void>> {
  const adminCheck = await verifySystemAdmin();
  if (adminCheck.error) {
    return { success: false, error: adminCheck.error };
  }

  try {
    // Delete workspace (cascades to users, projects, etc. due to FK constraints)
    const [deleted] = await db
      .delete(workspace)
      .where(eq(workspace.id, workspaceId))
      .returning({ id: workspace.id });

    if (!deleted) {
      return { success: false, error: "Workspace not found" };
    }

    revalidatePath("/admin/workspaces");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("[admin:deleteWorkspace] Error:", error);
    return { success: false, error: "Failed to delete workspace" };
  }
}

// ============================================================================
// Update Workspace Details
// ============================================================================

export async function updateWorkspaceDetailsAction(
  workspaceId: string,
  data: {
    name?: string;
    organizationNumber?: string;
    contactEmail?: string;
    contactPerson?: string;
  }
): Promise<ActionResult<Workspace>> {
  const adminCheck = await verifySystemAdmin();
  if (adminCheck.error) {
    return { success: false, error: adminCheck.error };
  }

  try {
    const [updated] = await db
      .update(workspace)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(workspace.id, workspaceId))
      .returning();

    if (!updated) {
      return { success: false, error: "Workspace not found" };
    }

    revalidatePath("/admin/workspaces");
    return { success: true, data: updated };
  } catch (error) {
    console.error("[admin:updateWorkspaceDetails] Error:", error);
    return { success: false, error: "Failed to update workspace details" };
  }
}

// ============================================================================
// Impersonation
// ============================================================================

export async function impersonateUserAction(
  userId: string
): Promise<ActionResult<{ redirectTo: string }>> {
  const adminCheck = await verifySystemAdmin();
  if (adminCheck.error) {
    return { success: false, error: adminCheck.error };
  }

  try {
    // Verify target user exists
    const [targetUser] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!targetUser) {
      return { success: false, error: "User not found" };
    }

    // Create impersonation session directly in database
    // This bypasses better-auth's role-based permission check
    // since we've already verified system admin access
    const sessionToken = nanoid(32);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day

    await db.insert(session).values({
      id: nanoid(),
      userId: userId,
      token: sessionToken,
      expiresAt,
      impersonatedBy: adminCheck.user!.id, // Track who is impersonating
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set("better-auth.session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });

    return { success: true, data: { redirectTo: "/dashboard" } };
  } catch (error) {
    console.error("[admin:impersonateUser] Error:", error);
    return { success: false, error: "Failed to impersonate user" };
  }
}

export async function stopImpersonatingAction(): Promise<
  ActionResult<{ redirectTo: string }>
> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("better-auth.session_token")?.value;

    if (sessionToken) {
      // Delete the impersonation session
      await db.delete(session).where(eq(session.token, sessionToken));

      // Clear the session cookie
      cookieStore.delete("better-auth.session_token");
    }

    return { success: true, data: { redirectTo: "/admin/users" } };
  } catch (error) {
    console.error("[admin:stopImpersonating] Error:", error);
    return { success: false, error: "Failed to stop impersonating" };
  }
}

// ============================================================================
// Fetch Users (for pagination)
// ============================================================================

export async function fetchAdminUsersAction(
  cursor: string | null,
  limit: number,
  filters: AdminUserFilters,
  sort?: [SortableUserColumn, SortDirection]
): Promise<
  ActionResult<{
    data: AdminUserRow[];
    meta: AdminUsersMeta;
  }>
> {
  const adminCheck = await verifySystemAdmin();
  if (adminCheck.error) {
    return { success: false, error: adminCheck.error };
  }

  try {
    const result = await getAdminUsers({
      cursor,
      limit,
      filters,
      sort,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("[admin:fetchUsers] Error:", error);
    return { success: false, error: "Failed to fetch users" };
  }
}

// ============================================================================
// Update User Role
// ============================================================================

export async function updateUserRoleAction(
  userId: string,
  role: import("@/lib/types/admin").UserRole
): Promise<ActionResult<User>> {
  const adminCheck = await verifySystemAdmin();
  if (adminCheck.error) {
    return { success: false, error: adminCheck.error };
  }

  try {
    // Prevent changing own role
    if (adminCheck.user?.id === userId) {
      return { success: false, error: "Cannot change your own role" };
    }

    const [updated] = await db
      .update(user)
      .set({
        role,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId))
      .returning();

    if (!updated) {
      return { success: false, error: "User not found" };
    }

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);
    return { success: true, data: updated };
  } catch (error) {
    console.error("[admin:updateUserRole] Error:", error);
    return { success: false, error: "Failed to update user role" };
  }
}

// ============================================================================
// Toggle System Admin
// ============================================================================

export async function toggleSystemAdminAction(
  userId: string,
  isSystemAdmin: boolean
): Promise<ActionResult<User>> {
  const adminCheck = await verifySystemAdmin();
  if (adminCheck.error) {
    return { success: false, error: adminCheck.error };
  }

  try {
    // Prevent removing own admin status
    if (adminCheck.user?.id === userId && !isSystemAdmin) {
      return { success: false, error: "Cannot remove your own system admin status" };
    }

    const [updated] = await db
      .update(user)
      .set({
        isSystemAdmin,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId))
      .returning();

    if (!updated) {
      return { success: false, error: "User not found" };
    }

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);
    return { success: true, data: updated };
  } catch (error) {
    console.error("[admin:toggleSystemAdmin] Error:", error);
    return { success: false, error: "Failed to update system admin status" };
  }
}

// ============================================================================
// Delete User
// ============================================================================

export async function deleteUserAction(
  userId: string
): Promise<ActionResult<void>> {
  const adminCheck = await verifySystemAdmin();
  if (adminCheck.error) {
    return { success: false, error: adminCheck.error };
  }

  try {
    // Prevent deleting self
    if (adminCheck.user?.id === userId) {
      return { success: false, error: "Cannot delete yourself" };
    }

    // Check if user is an owner - they shouldn't be deleted without handling workspace
    const [targetUser] = await db
      .select({ role: user.role, workspaceId: user.workspaceId })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!targetUser) {
      return { success: false, error: "User not found" };
    }

    if (targetUser.role === "owner" && targetUser.workspaceId) {
      return {
        success: false,
        error: "Cannot delete workspace owner. Delete or transfer the workspace first."
      };
    }

    // Delete user (sessions cascade due to FK constraints)
    const [deleted] = await db
      .delete(user)
      .where(eq(user.id, userId))
      .returning({ id: user.id });

    if (!deleted) {
      return { success: false, error: "User not found" };
    }

    revalidatePath("/admin/users");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("[admin:deleteUser] Error:", error);
    return { success: false, error: "Failed to delete user" };
  }
}
