import type { WorkspacePlan, WorkspaceStatus } from "@/lib/db/schema";

// ============================================================================
// Admin Workspace Types
// ============================================================================

export interface AdminWorkspaceRow {
  id: string;
  name: string;
  slug: string;
  status: WorkspaceStatus;
  plan: WorkspacePlan;
  memberCount: number;
  imagesGenerated: number;
  videosGenerated: number;
  videosCompleted: number;
  totalSpend: number;
  totalVideoSpend: number;
  ownerId: string | null;
  ownerName: string | null;
  ownerEmail: string | null;
  ownerImage: string | null;
  createdAt: Date;
  lastActivityAt: Date;
}

export interface AdminWorkspaceFilters {
  search?: string;
  status?: WorkspaceStatus | null;
  plan?: WorkspacePlan | null;
}

export type SortableWorkspaceColumn =
  | "name"
  | "memberCount"
  | "imagesGenerated"
  | "totalSpend"
  | "createdAt"
  | "lastActivityAt";

export type SortDirection = "asc" | "desc";

export interface AdminWorkspacesMeta {
  cursor: string | null;
  hasMore: boolean;
  total: number;
}

// ============================================================================
// Admin User Types
// ============================================================================

export type UserRole = "owner" | "admin" | "member";
export type UserStatus = "active" | "pending" | "inactive";

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: UserRole;
  status: UserStatus;
  isSystemAdmin: boolean;
  workspaceId: string | null;
  workspaceName: string | null;
  imagesGenerated: number;
  lastActiveAt: Date | null;
  createdAt: Date;
}

export interface AdminUserFilters {
  search?: string;
  role?: UserRole | null;
  status?: UserStatus | null;
  workspaceId?: string | null;
}

export type SortableUserColumn =
  | "name"
  | "email"
  | "role"
  | "imagesGenerated"
  | "lastActiveAt"
  | "createdAt";

export interface AdminUsersMeta {
  cursor: string | null;
  hasMore: boolean;
  total: number;
}

// ============================================================================
// Admin User Detail (for /admin/users/[id] page)
// ============================================================================

export interface AdminUserDetail {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: UserRole;
    status: UserStatus;
    isSystemAdmin: boolean;
    emailVerified: boolean;
    workspaceId: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  workspace: {
    id: string;
    name: string;
    slug: string;
    status: WorkspaceStatus;
    plan: WorkspacePlan;
  } | null;
  stats: {
    imagesGenerated: number;
    projectsCreated: number;
    videosCreated: number;
    totalSpend: number;
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

// ============================================================================
// Constants
// ============================================================================

export const ALL_WORKSPACE_STATUSES: WorkspaceStatus[] = [
  "active",
  "suspended",
  "trial",
];

export const ALL_WORKSPACE_PLANS: WorkspacePlan[] = [
  "free",
  "pro",
  "enterprise",
];

export const COST_PER_IMAGE = 0.039; // USD per image

export const ALL_USER_ROLES: UserRole[] = ["owner", "admin", "member"];
export const ALL_USER_STATUSES: UserStatus[] = [
  "active",
  "pending",
  "inactive",
];
