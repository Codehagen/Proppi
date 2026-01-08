import { getAllUsers } from "./admin-users";
import { getAllWorkspaces } from "./admin-workspaces";

export interface AdminStats {
  totalWorkspaces: number;
  activeWorkspaces: number;
  suspendedWorkspaces: number;
  trialWorkspaces: number;
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  inactiveUsers: number;
  totalImages: number;
  totalRevenue: number;
  activeSessions: number;
  imagesThisMonth: number;
  revenueThisMonth: number;
}

export interface RecentActivity {
  id: string;
  type:
    | "user_joined"
    | "workspace_created"
    | "image_generated"
    | "plan_upgraded"
    | "user_invited";
  description: string;
  timestamp: Date;
  metadata: {
    userId?: string;
    userName?: string;
    workspaceId?: string;
    workspaceName?: string;
    planFrom?: string;
    planTo?: string;
    imageCount?: number;
  };
}

function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 1_103_515_245 + 12_345) & 0x7f_ff_ff_ff;
    return seed / 0x7f_ff_ff_ff;
  };
}

export function getAdminStats(): AdminStats {
  const workspaces = getAllWorkspaces();
  const users = getAllUsers();

  const totalImages = workspaces.reduce((sum, w) => sum + w.imagesGenerated, 0);
  const totalRevenue = workspaces.reduce((sum, w) => sum + w.totalSpend, 0);

  // Simulate this month's data (roughly 30% of total)
  const imagesThisMonth = Math.floor(totalImages * 0.3);
  const revenueThisMonth = Math.round(imagesThisMonth * 0.039 * 100) / 100;

  // Simulate active sessions (random subset of active users)
  const activeUserCount = users.filter((u) => u.status === "active").length;
  const activeSessions = Math.floor(activeUserCount * 0.15); // 15% of active users online

  return {
    totalWorkspaces: workspaces.length,
    activeWorkspaces: workspaces.filter((w) => w.status === "active").length,
    suspendedWorkspaces: workspaces.filter((w) => w.status === "suspended")
      .length,
    trialWorkspaces: workspaces.filter((w) => w.status === "trial").length,
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.status === "active").length,
    pendingUsers: users.filter((u) => u.status === "pending").length,
    inactiveUsers: users.filter((u) => u.status === "inactive").length,
    totalImages,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    activeSessions,
    imagesThisMonth,
    revenueThisMonth,
  };
}

export function getRecentActivity(limit = 10): RecentActivity[] {
  const workspaces = getAllWorkspaces();
  const users = getAllUsers();
  const random = seededRandom(789);
  const activities: RecentActivity[] = [];

  // Generate realistic recent activities
  const activityTypes: RecentActivity["type"][] = [
    "user_joined",
    "workspace_created",
    "image_generated",
    "plan_upgraded",
    "user_invited",
  ];

  for (let i = 0; i < limit * 2; i++) {
    const type = activityTypes[Math.floor(random() * activityTypes.length)];
    const workspace = workspaces[Math.floor(random() * workspaces.length)];
    const user = users[Math.floor(random() * users.length)];

    const hoursAgo = Math.floor(random() * 72); // Last 3 days
    const timestamp = new Date();
    timestamp.setHours(timestamp.getHours() - hoursAgo);

    let description = "";
    let metadata: RecentActivity["metadata"] = {};

    switch (type) {
      case "user_joined":
        description = `${user.name} joined ${workspace.name}`;
        metadata = {
          userId: user.id,
          userName: user.name,
          workspaceId: workspace.id,
          workspaceName: workspace.name,
        };
        break;
      case "workspace_created":
        description = `${workspace.name} workspace was created`;
        metadata = { workspaceId: workspace.id, workspaceName: workspace.name };
        break;
      case "image_generated": {
        const imageCount = Math.floor(random() * 10) + 1;
        description = `${user.name} generated ${imageCount} image${imageCount > 1 ? "s" : ""}`;
        metadata = {
          userId: user.id,
          userName: user.name,
          workspaceId: workspace.id,
          workspaceName: workspace.name,
          imageCount,
        };
        break;
      }
      case "plan_upgraded": {
        const plans = ["free", "pro", "enterprise"];
        const fromIndex = Math.floor(random() * 2);
        const toIndex = fromIndex + 1;
        description = `${workspace.name} upgraded to ${plans[toIndex]}`;
        metadata = {
          workspaceId: workspace.id,
          workspaceName: workspace.name,
          planFrom: plans[fromIndex],
          planTo: plans[toIndex],
        };
        break;
      }
      case "user_invited":
        description = `${user.name} was invited to ${workspace.name}`;
        metadata = {
          userId: user.id,
          userName: user.name,
          workspaceId: workspace.id,
          workspaceName: workspace.name,
        };
        break;
    }

    activities.push({
      id: `act_${String(i + 1).padStart(4, "0")}`,
      type,
      description,
      timestamp,
      metadata,
    });
  }

  // Sort by timestamp (newest first) and limit
  return activities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
}
