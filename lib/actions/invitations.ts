"use server";

import { addDays } from "date-fns";
import { and, eq, gt, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import type { ActionResult } from "@/lib/actions/admin";
import { verifySystemAdmin } from "@/lib/admin-auth";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  type Invitation,
  invitation,
  type UserRole,
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
  sendEmail = true,
  options?: {
    organizationNumber?: string;
    invoiceEligible?: boolean;
  }
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
    // Validate organization number if provided
    if (
      options?.organizationNumber &&
      !/^\d{9}$/.test(options.organizationNumber)
    ) {
      return {
        success: false,
        error: "Organization number must be exactly 9 digits",
      };
    }

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
        // B2B fields
        organizationNumber: options?.organizationNumber || null,
        invoiceEligible: options?.invoiceEligible,
        invoiceEligibleAt: options?.invoiceEligible ? new Date() : null,
        invitedByAdmin: true,
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
          "Proppi Admin",
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
      "Proppi Admin",
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

// ============================================================================
// Workspace Member Invitations (Owner/Admin of workspace)
// ============================================================================

/**
 * Create an invitation for a team member to join the workspace
 * Returns a shareable link that can be sent to the invitee
 */
export async function createWorkspaceMemberInvitation(
  email: string,
  role: UserRole
): Promise<ActionResult<{ token: string; inviteUrl: string }>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    // Get current user with workspace
    const [currentUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, session.user.id));

    if (!currentUser?.workspaceId) {
      return { success: false, error: "Workspace not found" };
    }

    // Check if user is owner or admin
    if (currentUser.role !== "owner" && currentUser.role !== "admin") {
      return {
        success: false,
        error: "Only owners and admins can invite members",
      };
    }

    const workspaceId = currentUser.workspaceId;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user is already a member of this workspace
    const [existingMember] = await db
      .select()
      .from(user)
      .where(
        and(eq(user.email, normalizedEmail), eq(user.workspaceId, workspaceId))
      );

    if (existingMember) {
      return {
        success: false,
        error: "This user is already a member of your workspace",
      };
    }

    // Check if there's already a pending invitation for this email
    const [existingInvitation] = await db
      .select()
      .from(invitation)
      .where(
        and(
          eq(invitation.email, normalizedEmail),
          eq(invitation.workspaceId, workspaceId),
          isNull(invitation.acceptedAt),
          gt(invitation.expiresAt, new Date())
        )
      );

    if (existingInvitation) {
      // Return existing invitation link and resend email
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const inviteUrl = `${baseUrl}/invite/${existingInvitation.token}`;

      // Fetch workspace name for email
      const [workspaceData] = await db
        .select({ name: workspace.name })
        .from(workspace)
        .where(eq(workspace.id, workspaceId))
        .limit(1);

      // Resend invite email
      if (workspaceData) {
        try {
          await sendInviteEmail(
            normalizedEmail,
            currentUser.name,
            workspaceData.name,
            inviteUrl
          );
        } catch (emailError) {
          console.error(
            "[invitations:createWorkspaceMember] Email failed:",
            emailError
          );
          // Don't fail the action if email fails
        }
      }

      return {
        success: true,
        data: {
          token: existingInvitation.token,
          inviteUrl,
        },
      };
    }

    // Create new invitation (expires in 7 days)
    const token = nanoid(32);
    const expiresAt = addDays(new Date(), 7);

    await db.insert(invitation).values({
      id: nanoid(),
      email: normalizedEmail,
      workspaceId,
      role,
      token,
      expiresAt,
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const inviteUrl = `${baseUrl}/invite/${token}`;

    // Fetch workspace name and inviter name for email
    const [workspaceData] = await db
      .select({ name: workspace.name })
      .from(workspace)
      .where(eq(workspace.id, workspaceId))
      .limit(1);

    // Send invite email automatically
    if (workspaceData) {
      try {
        await sendInviteEmail(
          normalizedEmail,
          currentUser.name,
          workspaceData.name,
          inviteUrl
        );
      } catch (emailError) {
        console.error(
          "[invitations:createWorkspaceMember] Email failed:",
          emailError
        );
        // Don't fail the action if email fails - user can copy the link
      }
    }

    revalidatePath("/dashboard/settings");

    return {
      success: true,
      data: { token, inviteUrl },
    };
  } catch (error) {
    console.error("[invitations:createWorkspaceMember] Error:", error);
    return { success: false, error: "Failed to create invitation" };
  }
}

/**
 * Get pending invitations for the current user's workspace
 */
export async function getWorkspacePendingInvitations(): Promise<
  ActionResult<
    {
      id: string;
      email: string;
      role: UserRole;
      token: string;
      expiresAt: Date;
      createdAt: Date;
    }[]
  >
> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    const [currentUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, session.user.id));

    if (!currentUser?.workspaceId) {
      return { success: false, error: "Workspace not found" };
    }

    const invitations = await db
      .select({
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        token: invitation.token,
        expiresAt: invitation.expiresAt,
        createdAt: invitation.createdAt,
      })
      .from(invitation)
      .where(
        and(
          eq(invitation.workspaceId, currentUser.workspaceId),
          isNull(invitation.acceptedAt),
          gt(invitation.expiresAt, new Date())
        )
      )
      .orderBy(invitation.createdAt);

    return {
      success: true,
      data: invitations.map((inv) => ({
        ...inv,
        role: inv.role as UserRole,
      })),
    };
  } catch (error) {
    console.error("[invitations:getWorkspacePending] Error:", error);
    return { success: false, error: "Failed to get invitations" };
  }
}

/**
 * Accept an invitation as a logged-in user
 * User must be logged in and email must match the invitation
 */
export async function acceptInvitationAsLoggedInUser(
  token: string
): Promise<ActionResult<{ redirectTo: string }>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return {
        success: false,
        error: "You must be logged in to accept an invitation",
      };
    }

    // Get the invitation
    const [result] = await db
      .select({
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        workspaceId: invitation.workspaceId,
        expiresAt: invitation.expiresAt,
        acceptedAt: invitation.acceptedAt,
      })
      .from(invitation)
      .where(eq(invitation.token, token));

    if (!result) {
      return { success: false, error: "Invitation not found" };
    }

    // Check if already accepted
    if (result.acceptedAt) {
      return {
        success: false,
        error: "This invitation has already been accepted",
      };
    }

    // Check if expired
    if (result.expiresAt < new Date()) {
      return { success: false, error: "This invitation has expired" };
    }

    // Verify email matches
    if (session.user.email.toLowerCase() !== result.email.toLowerCase()) {
      return {
        success: false,
        error: `This invitation was sent to ${result.email}. Please log in with that email address.`,
      };
    }

    // Update user to join the workspace
    await db
      .update(user)
      .set({
        workspaceId: result.workspaceId,
        role: result.role,
        updatedAt: new Date(),
      })
      .where(eq(user.id, session.user.id));

    // Mark invitation as accepted
    await db
      .update(invitation)
      .set({ acceptedAt: new Date() })
      .where(eq(invitation.id, result.id));

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");

    return {
      success: true,
      data: { redirectTo: "/dashboard" },
    };
  } catch (error) {
    console.error("[invitations:acceptAsLoggedIn] Error:", error);
    return { success: false, error: "Failed to accept invitation" };
  }
}

/**
 * Cancel/revoke a workspace invitation
 */
export async function cancelWorkspaceInvitation(
  invitationId: string
): Promise<ActionResult<void>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    const [currentUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, session.user.id));

    if (!currentUser?.workspaceId) {
      return { success: false, error: "Workspace not found" };
    }

    // Check if user is owner or admin
    if (currentUser.role !== "owner" && currentUser.role !== "admin") {
      return {
        success: false,
        error: "Only owners and admins can cancel invitations",
      };
    }

    // Verify invitation belongs to this workspace
    const [inv] = await db
      .select()
      .from(invitation)
      .where(
        and(
          eq(invitation.id, invitationId),
          eq(invitation.workspaceId, currentUser.workspaceId)
        )
      );

    if (!inv) {
      return { success: false, error: "Invitation not found" };
    }

    // Delete the invitation
    await db.delete(invitation).where(eq(invitation.id, invitationId));

    revalidatePath("/dashboard/settings");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[invitations:cancelWorkspace] Error:", error);
    return { success: false, error: "Failed to cancel invitation" };
  }
}

/**
 * Resend a workspace invitation email
 * Workspace owners and admins can resend invitations for their workspace
 */
export async function resendWorkspaceInvitation(
  invitationId: string
): Promise<ActionResult<{ expiresAt: Date }>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    const [currentUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, session.user.id));

    if (!currentUser?.workspaceId) {
      return { success: false, error: "Workspace not found" };
    }

    // Check if user is owner or admin
    if (currentUser.role !== "owner" && currentUser.role !== "admin") {
      return {
        success: false,
        error: "Only owners and admins can resend invitations",
      };
    }

    // Get existing invitation with workspace
    const [existingInvite] = await db
      .select({
        invitation,
        workspaceName: workspace.name,
      })
      .from(invitation)
      .innerJoin(workspace, eq(invitation.workspaceId, workspace.id))
      .where(
        and(
          eq(invitation.id, invitationId),
          eq(invitation.workspaceId, currentUser.workspaceId)
        )
      );

    if (!existingInvite) {
      return { success: false, error: "Invitation not found" };
    }

    if (existingInvite.invitation.acceptedAt) {
      return { success: false, error: "Invitation has already been accepted" };
    }

    // Check if invitation is expired - if so, generate new token and extend expiry
    const isExpired = new Date() > existingInvite.invitation.expiresAt;
    let token = existingInvite.invitation.token;
    let expiresAt = existingInvite.invitation.expiresAt;

    if (isExpired) {
      token = nanoid(32);
      expiresAt = addDays(new Date(), 7);

      // Update invitation with new token and expiry
      await db
        .update(invitation)
        .set({
          token,
          expiresAt,
        })
        .where(eq(invitation.id, invitationId));
    }

    // Send invite email
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/invite/${token}`;
    try {
      await sendInviteEmail(
        existingInvite.invitation.email,
        currentUser.name,
        existingInvite.workspaceName,
        inviteLink
      );
    } catch (emailError) {
      console.error("[invitations:resendWorkspace] Email failed:", emailError);
      return {
        success: false,
        error:
          "Failed to send email. Please try again or copy the invite link.",
      };
    }

    revalidatePath("/dashboard/settings");

    return { success: true, data: { expiresAt } };
  } catch (error) {
    console.error("[invitations:resendWorkspace] Error:", error);
    return { success: false, error: "Failed to resend invitation" };
  }
}
