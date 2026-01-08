"use server";

import { addDays } from "date-fns";
import { and, eq, gt } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/actions/admin";
import { verifySystemAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import {
  type Invitation,
  invitation,
  user,
  type WorkspacePlan,
  workspace,
} from "@/lib/db/schema";
import { sendInviteEmail } from "@/lib/email";

// ============================================================================
// Create Workspace with Invitation (Admin only)
// ============================================================================

export async function createWorkspaceWithInviteAction(
  name: string,
  email: string,
  plan: WorkspacePlan,
  sendEmail = true
): Promise<
  ActionResult<{
    workspace: { id: string; name: string };
    invitation: Invitation;
    inviteLink: string;
  }>
> {
  const adminCheck = await verifySystemAdmin();
  if (adminCheck.error) {
    return { success: false, error: adminCheck.error };
  }

  try {
    // Generate unique slug from name
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const slug = `${baseSlug}-${nanoid(6)}`;

    // Generate invitation token
    const token = nanoid(32);
    const expiresAt = addDays(new Date(), 7); // 7 days to accept

    // Create workspace
    const workspaceId = nanoid();
    const [newWorkspace] = await db
      .insert(workspace)
      .values({
        id: workspaceId,
        name: name.trim(),
        slug,
        plan,
        status: "active",
        onboardingCompleted: false,
      })
      .returning();

    // Create invitation
    const [newInvitation] = await db
      .insert(invitation)
      .values({
        id: nanoid(),
        email: email.toLowerCase().trim(),
        workspaceId: newWorkspace.id,
        role: "owner",
        token,
        expiresAt,
      })
      .returning();

    // Build invite link
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`;

    // Send invite email if requested
    if (sendEmail) {
      try {
        await sendInviteEmail(
          email,
          "AI Studio Admin",
          newWorkspace.name,
          inviteLink
        );
      } catch (emailError) {
        console.error(
          "[invitations:createWorkspaceWithInvite] Email failed:",
          emailError
        );
        // Don't fail the action if email fails - user can copy the link
      }
    }

    revalidatePath("/admin/workspaces");

    return {
      success: true,
      data: {
        workspace: { id: newWorkspace.id, name: newWorkspace.name },
        invitation: newInvitation,
        inviteLink,
      },
    };
  } catch (error) {
    console.error("[invitations:createWorkspaceWithInvite] Error:", error);
    return {
      success: false,
      error: "Failed to create workspace and send invitation",
    };
  }
}

// ============================================================================
// Resend Invitation (Admin only)
// ============================================================================

export async function resendInvitationAction(
  invitationId: string
): Promise<ActionResult<{ expiresAt: Date }>> {
  const adminCheck = await verifySystemAdmin();
  if (adminCheck.error) {
    return { success: false, error: adminCheck.error };
  }

  try {
    // Get existing invitation with workspace
    const [existingInvite] = await db
      .select({
        invitation,
        workspaceName: workspace.name,
      })
      .from(invitation)
      .innerJoin(workspace, eq(invitation.workspaceId, workspace.id))
      .where(eq(invitation.id, invitationId));

    if (!existingInvite) {
      return { success: false, error: "Invitation not found" };
    }

    if (existingInvite.invitation.acceptedAt) {
      return { success: false, error: "Invitation has already been accepted" };
    }

    // Generate new token and extend expiry
    const newToken = nanoid(32);
    const newExpiresAt = addDays(new Date(), 7);

    // Update invitation
    await db
      .update(invitation)
      .set({
        token: newToken,
        expiresAt: newExpiresAt,
      })
      .where(eq(invitation.id, invitationId));

    // Send new invite email
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${newToken}`;
    await sendInviteEmail(
      existingInvite.invitation.email,
      "AI Studio Admin",
      existingInvite.workspaceName,
      inviteLink
    );

    return { success: true, data: { expiresAt: newExpiresAt } };
  } catch (error) {
    console.error("[invitations:resendInvitation] Error:", error);
    return { success: false, error: "Failed to resend invitation" };
  }
}

// ============================================================================
// Get Invitation by Token (Public - for invite acceptance page)
// ============================================================================

export async function getInvitationByTokenAction(token: string): Promise<
  ActionResult<{
    invitation: Invitation;
    workspaceName: string;
    isExpired: boolean;
    isAccepted: boolean;
  }>
> {
  try {
    const [result] = await db
      .select({
        invitation,
        workspaceName: workspace.name,
      })
      .from(invitation)
      .innerJoin(workspace, eq(invitation.workspaceId, workspace.id))
      .where(eq(invitation.token, token));

    if (!result) {
      return { success: false, error: "Invitation not found or has expired" };
    }

    const isExpired = new Date() > result.invitation.expiresAt;
    const isAccepted = Boolean(result.invitation.acceptedAt);

    return {
      success: true,
      data: {
        invitation: result.invitation,
        workspaceName: result.workspaceName,
        isExpired,
        isAccepted,
      },
    };
  } catch (error) {
    console.error("[invitations:getInvitationByToken] Error:", error);
    return { success: false, error: "Failed to get invitation" };
  }
}

// ============================================================================
// Accept Invitation (Public - creates user and links to workspace)
// ============================================================================

export async function acceptInvitationAction(
  token: string,
  name: string,
  password: string
): Promise<ActionResult<{ redirectTo: string }>> {
  try {
    // Get invitation
    const [result] = await db
      .select({
        invitation,
        workspaceId: workspace.id,
      })
      .from(invitation)
      .innerJoin(workspace, eq(invitation.workspaceId, workspace.id))
      .where(
        and(eq(invitation.token, token), gt(invitation.expiresAt, new Date()))
      );

    if (!result) {
      return { success: false, error: "Invitation not found or has expired" };
    }

    if (result.invitation.acceptedAt) {
      return { success: false, error: "Invitation has already been accepted" };
    }

    // Check if user already exists with this email
    const [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, result.invitation.email));

    if (existingUser) {
      // User exists - just link them to the workspace
      await db
        .update(user)
        .set({
          workspaceId: result.workspaceId,
          role: result.invitation.role,
          updatedAt: new Date(),
        })
        .where(eq(user.id, existingUser.id));

      // Mark invitation as accepted
      await db
        .update(invitation)
        .set({ acceptedAt: new Date() })
        .where(eq(invitation.id, result.invitation.id));

      // Mark workspace onboarding as needing completion
      await db
        .update(workspace)
        .set({ onboardingCompleted: false })
        .where(eq(workspace.id, result.workspaceId));

      return { success: true, data: { redirectTo: "/onboarding" } };
    }

    // Create new user with better-auth
    const { auth } = await import("@/lib/auth");
    const { headers } = await import("next/headers");

    // Use better-auth to create account
    const signUpResult = await auth.api.signUpEmail({
      body: {
        email: result.invitation.email,
        password,
        name,
      },
      headers: await headers(),
    });

    if (!signUpResult) {
      return { success: false, error: "Failed to create account" };
    }

    // Update the created user with workspace info
    await db
      .update(user)
      .set({
        workspaceId: result.workspaceId,
        role: result.invitation.role,
      })
      .where(eq(user.email, result.invitation.email));

    // Mark invitation as accepted
    await db
      .update(invitation)
      .set({ acceptedAt: new Date() })
      .where(eq(invitation.id, result.invitation.id));

    return { success: true, data: { redirectTo: "/onboarding" } };
  } catch (error) {
    console.error("[invitations:acceptInvitation] Error:", error);
    return { success: false, error: "Failed to accept invitation" };
  }
}

// ============================================================================
// Delete Invitation (Admin only)
// ============================================================================

export async function deleteInvitationAction(
  invitationId: string
): Promise<ActionResult<void>> {
  const adminCheck = await verifySystemAdmin();
  if (adminCheck.error) {
    return { success: false, error: adminCheck.error };
  }

  try {
    const [deleted] = await db
      .delete(invitation)
      .where(eq(invitation.id, invitationId))
      .returning({ id: invitation.id });

    if (!deleted) {
      return { success: false, error: "Invitation not found" };
    }

    revalidatePath("/admin/workspaces");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("[invitations:deleteInvitation] Error:", error);
    return { success: false, error: "Failed to delete invitation" };
  }
}
