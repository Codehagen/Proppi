"use server";

import { revalidatePath } from "next/cache";
import { verifySystemAdmin } from "@/lib/admin-auth";
import {
  type AffiliateEarningRow,
  type AffiliateRelationshipRow,
  type AffiliateStats,
  createAffiliateRelationship,
  deleteAffiliateRelationship,
  getAffiliateEarnings,
  getAffiliateRelationships,
  getAffiliateStats,
  markEarningsAsPaidOut,
  updateAffiliateRelationship,
} from "@/lib/db/queries";
import type {
  AffiliateEarningStatus,
  AffiliateRelationship,
} from "@/lib/db/schema";

// ============================================================================
// Types
// ============================================================================

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// ============================================================================
// Affiliate Relationship Actions
// ============================================================================

/**
 * Get all affiliate relationships (admin only)
 */
export async function getAffiliateRelationshipsAction(): Promise<
  ActionResult<AffiliateRelationshipRow[]>
> {
  const adminCheck = await verifySystemAdmin();
  if (adminCheck.error) {
    return { success: false, error: adminCheck.error };
  }

  try {
    const relationships = await getAffiliateRelationships();
    return { success: true, data: relationships };
  } catch (error) {
    console.error("[affiliate:getRelationships] Error:", error);
    return { success: false, error: "Failed to get affiliate relationships" };
  }
}

/**
 * Create a new affiliate relationship (admin only)
 */
export async function createAffiliateRelationshipAction(params: {
  affiliateWorkspaceId: string;
  referredWorkspaceId: string;
  commissionPercent: number;
  notes?: string;
}): Promise<ActionResult<AffiliateRelationship>> {
  const adminCheck = await verifySystemAdmin();
  if (adminCheck.error) {
    return { success: false, error: adminCheck.error };
  }

  // Validate commission percentage
  if (params.commissionPercent < 1 || params.commissionPercent > 100) {
    return {
      success: false,
      error: "Commission percentage must be between 1 and 100",
    };
  }

  // Validate workspaces are different
  if (params.affiliateWorkspaceId === params.referredWorkspaceId) {
    return {
      success: false,
      error: "Affiliate and referred workspace cannot be the same",
    };
  }

  try {
    const relationship = await createAffiliateRelationship(params);
    revalidatePath("/admin/billing");
    return { success: true, data: relationship };
  } catch (error) {
    console.error("[affiliate:createRelationship] Error:", error);
    return { success: false, error: "Failed to create affiliate relationship" };
  }
}

/**
 * Update an affiliate relationship (admin only)
 */
export async function updateAffiliateRelationshipAction(
  relationshipId: string,
  data: {
    commissionPercent?: number;
    isActive?: boolean;
    notes?: string | null;
  }
): Promise<ActionResult<AffiliateRelationship>> {
  const adminCheck = await verifySystemAdmin();
  if (adminCheck.error) {
    return { success: false, error: adminCheck.error };
  }

  // Validate commission percentage if provided
  if (
    data.commissionPercent !== undefined &&
    (data.commissionPercent < 1 || data.commissionPercent > 100)
  ) {
    return {
      success: false,
      error: "Commission percentage must be between 1 and 100",
    };
  }

  try {
    const updated = await updateAffiliateRelationship(relationshipId, data);
    if (!updated) {
      return { success: false, error: "Affiliate relationship not found" };
    }
    revalidatePath("/admin/billing");
    return { success: true, data: updated };
  } catch (error) {
    console.error("[affiliate:updateRelationship] Error:", error);
    return { success: false, error: "Failed to update affiliate relationship" };
  }
}

/**
 * Delete an affiliate relationship (admin only)
 */
export async function deleteAffiliateRelationshipAction(
  relationshipId: string
): Promise<ActionResult<void>> {
  const adminCheck = await verifySystemAdmin();
  if (adminCheck.error) {
    return { success: false, error: adminCheck.error };
  }

  try {
    await deleteAffiliateRelationship(relationshipId);
    revalidatePath("/admin/billing");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("[affiliate:deleteRelationship] Error:", error);
    return { success: false, error: "Failed to delete affiliate relationship" };
  }
}

// ============================================================================
// Affiliate Earnings Actions
// ============================================================================

/**
 * Get affiliate earnings (admin only)
 */
export async function getAffiliateEarningsAction(params?: {
  affiliateWorkspaceId?: string;
  status?: AffiliateEarningStatus;
}): Promise<ActionResult<AffiliateEarningRow[]>> {
  const adminCheck = await verifySystemAdmin();
  if (adminCheck.error) {
    return { success: false, error: adminCheck.error };
  }

  try {
    const earnings = await getAffiliateEarnings(params);
    return { success: true, data: earnings };
  } catch (error) {
    console.error("[affiliate:getEarnings] Error:", error);
    return { success: false, error: "Failed to get affiliate earnings" };
  }
}

/**
 * Mark earnings as paid out (admin only)
 */
export async function markEarningsAsPaidOutAction(params: {
  earningIds: string[];
  reference: string;
}): Promise<ActionResult<void>> {
  const adminCheck = await verifySystemAdmin();
  if (adminCheck.error) {
    return { success: false, error: adminCheck.error };
  }

  if (!params.reference || params.reference.trim() === "") {
    return {
      success: false,
      error: "Payment reference is required",
    };
  }

  if (params.earningIds.length === 0) {
    return {
      success: false,
      error: "No earnings selected",
    };
  }

  try {
    await markEarningsAsPaidOut(params.earningIds, params.reference);
    revalidatePath("/admin/billing");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("[affiliate:markEarningsAsPaidOut] Error:", error);
    return { success: false, error: "Failed to mark earnings as paid out" };
  }
}

/**
 * Get affiliate stats (admin only)
 */
export async function getAffiliateStatsAction(): Promise<
  ActionResult<AffiliateStats>
> {
  const adminCheck = await verifySystemAdmin();
  if (adminCheck.error) {
    return { success: false, error: adminCheck.error };
  }

  try {
    const stats = await getAffiliateStats();
    return { success: true, data: stats };
  } catch (error) {
    console.error("[affiliate:getStats] Error:", error);
    return { success: false, error: "Failed to get affiliate stats" };
  }
}
