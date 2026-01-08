import { getAllWorkspaces } from "./admin-workspaces";

export type UserRole = "owner" | "admin" | "member";
export type UserStatus = "active" | "pending" | "inactive";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  workspaceId: string;
  workspaceName: string;
  workspaceSlug: string;
  role: UserRole;
  status: UserStatus;
  imagesGenerated: number;
  lastActiveAt: Date;
  joinedAt: Date;
}

const firstNames = [
  "James",
  "Sarah",
  "Michael",
  "Emily",
  "David",
  "Jessica",
  "Robert",
  "Ashley",
  "William",
  "Amanda",
  "John",
  "Melissa",
  "Christopher",
  "Nicole",
  "Daniel",
  "Stephanie",
  "Matthew",
  "Jennifer",
  "Anthony",
  "Elizabeth",
  "Mark",
  "Rachel",
  "Steven",
  "Lauren",
  "Andrew",
  "Samantha",
  "Joshua",
  "Michelle",
  "Ryan",
  "Heather",
  "Kevin",
  "Kimberly",
  "Brian",
  "Christina",
  "Justin",
  "Amber",
  "Brandon",
  "Brittany",
  "Jason",
  "Angela",
  "Eric",
  "Megan",
  "Tyler",
  "Tiffany",
  "Aaron",
  "Natalie",
  "Adam",
  "Rebecca",
  "Nathan",
  "Danielle",
  "Zachary",
  "Kayla",
  "Patrick",
  "Victoria",
  "Sean",
  "Katherine",
];

const lastNames = [
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Anderson",
  "Taylor",
  "Thomas",
  "Moore",
  "Jackson",
  "Martin",
  "Lee",
  "Thompson",
  "White",
  "Harris",
  "Clark",
  "Lewis",
  "Robinson",
  "Walker",
  "Young",
  "Allen",
  "King",
  "Wright",
  "Scott",
  "Torres",
  "Nguyen",
  "Hill",
  "Flores",
  "Green",
  "Adams",
  "Nelson",
  "Baker",
  "Hall",
  "Rivera",
  "Campbell",
  "Mitchell",
  "Carter",
  "Roberts",
  "Gomez",
  "Phillips",
  "Evans",
  "Turner",
  "Diaz",
  "Parker",
];

function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 1_103_515_245 + 12_345) & 0x7f_ff_ff_ff;
    return seed / 0x7f_ff_ff_ff;
  };
}

function generateMockUsers(): AdminUser[] {
  const users: AdminUser[] = [];
  const workspaces = getAllWorkspaces();
  const random = seededRandom(456); // Different seed

  let userId = 1;

  for (const workspace of workspaces) {
    // First, add the owner
    users.push({
      id: workspace.ownerId,
      name: workspace.ownerName,
      email: workspace.ownerEmail,
      image: workspace.ownerImage,
      workspaceId: workspace.id,
      workspaceName: workspace.name,
      workspaceSlug: workspace.slug,
      role: "owner",
      status: "active",
      imagesGenerated: Math.floor(
        workspace.imagesGenerated * (0.3 + random() * 0.3)
      ),
      lastActiveAt: workspace.lastActivityAt,
      joinedAt: workspace.createdAt,
    });

    // Add additional members based on memberCount
    const additionalMembers = workspace.memberCount - 1;
    for (let i = 0; i < additionalMembers; i++) {
      const firstName = firstNames[Math.floor(random() * firstNames.length)];
      const lastName = lastNames[Math.floor(random() * lastNames.length)];
      const emailDomain = workspace.slug.split("-")[0];

      // Role distribution: 20% admin, 80% member (owner already added)
      const role: UserRole = random() < 0.2 ? "admin" : "member";

      // Status distribution: 70% active, 20% pending (invited), 10% inactive
      const statusRoll = random();
      const status: UserStatus =
        statusRoll < 0.7 ? "active" : statusRoll < 0.9 ? "pending" : "inactive";

      // Images generated for this user
      const userImages =
        status === "active"
          ? Math.floor(
              random() *
                (workspace.imagesGenerated / workspace.memberCount) *
                1.5
            )
          : 0;

      // Joined after workspace was created
      const joinedDaysAfterWorkspace = Math.floor(random() * 60);
      const joinedAt = new Date(workspace.createdAt);
      joinedAt.setDate(joinedAt.getDate() + joinedDaysAfterWorkspace);

      // Last active
      const lastActiveDaysAgo =
        status === "active"
          ? Math.floor(random() * 7)
          : Math.floor(random() * 60) + 30;
      const lastActiveAt = new Date();
      lastActiveAt.setDate(lastActiveAt.getDate() - lastActiveDaysAgo);

      // Avatar
      const hasImage = random() > 0.4;
      const image = hasImage
        ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}${userId}`
        : null;

      users.push({
        id: `usr_${String(userId++).padStart(4, "0")}`,
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${emailDomain}.com`,
        image,
        workspaceId: workspace.id,
        workspaceName: workspace.name,
        workspaceSlug: workspace.slug,
        role,
        status,
        imagesGenerated: userImages,
        lastActiveAt,
        joinedAt,
      });
    }
  }

  return users;
}

// Generate mock users based on workspaces
const mockUsers = generateMockUsers();

export type SortableUserColumn =
  | "name"
  | "email"
  | "role"
  | "status"
  | "imagesGenerated"
  | "lastActiveAt"
  | "joinedAt";
export type SortDirection = "asc" | "desc";

export interface UserFilters {
  search?: string;
  workspaceId?: string | null;
  role?: UserRole | null;
  status?: UserStatus | null;
  sort?: [SortableUserColumn, SortDirection];
}

export interface GetUsersResponse {
  data: AdminUser[];
  meta: {
    cursor: string | null;
    hasMore: boolean;
    total: number;
    filteredTotal: number;
  };
}

function filterUsers(users: AdminUser[], filters: UserFilters): AdminUser[] {
  return users.filter((user) => {
    // Search filter (name, email)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.workspaceName.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Workspace filter
    if (filters.workspaceId && user.workspaceId !== filters.workspaceId) {
      return false;
    }

    // Role filter
    if (filters.role && user.role !== filters.role) {
      return false;
    }

    // Status filter
    if (filters.status && user.status !== filters.status) {
      return false;
    }

    return true;
  });
}

function sortUsers(
  users: AdminUser[],
  sort?: [SortableUserColumn, SortDirection]
): AdminUser[] {
  if (!sort) return users;

  const [column, direction] = sort;
  const multiplier = direction === "asc" ? 1 : -1;

  return [...users].sort((a, b) => {
    let comparison = 0;

    switch (column) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "email":
        comparison = a.email.localeCompare(b.email);
        break;
      case "role": {
        const roleOrder = { owner: 0, admin: 1, member: 2 };
        comparison = roleOrder[a.role] - roleOrder[b.role];
        break;
      }
      case "status":
        comparison = a.status.localeCompare(b.status);
        break;
      case "imagesGenerated":
        comparison = a.imagesGenerated - b.imagesGenerated;
        break;
      case "lastActiveAt":
        comparison = a.lastActiveAt.getTime() - b.lastActiveAt.getTime();
        break;
      case "joinedAt":
        comparison = a.joinedAt.getTime() - b.joinedAt.getTime();
        break;
    }

    return comparison * multiplier;
  });
}

export function getUsersPage(
  cursor: string | null = null,
  limit = 20,
  filters: UserFilters = {}
): GetUsersResponse {
  const filteredUsers = filterUsers(mockUsers, filters);
  const sortedUsers = sortUsers(filteredUsers, filters.sort);

  const startIndex = cursor ? Number.parseInt(cursor, 10) : 0;
  const endIndex = Math.min(startIndex + limit, sortedUsers.length);
  const data = sortedUsers.slice(startIndex, endIndex);
  const hasMore = endIndex < sortedUsers.length;

  return {
    data,
    meta: {
      cursor: hasMore ? String(endIndex) : null,
      hasMore,
      total: mockUsers.length,
      filteredTotal: sortedUsers.length,
    },
  };
}

export function getAllUsers(): AdminUser[] {
  return mockUsers;
}

export function getUserById(id: string): AdminUser | undefined {
  return mockUsers.find((u) => u.id === id);
}

export function getUsersByWorkspace(workspaceId: string): AdminUser[] {
  return mockUsers.filter((u) => u.workspaceId === workspaceId);
}

// Export constants for filters
export const ALL_USER_ROLES: UserRole[] = ["owner", "admin", "member"];
export const ALL_USER_STATUSES: UserStatus[] = [
  "active",
  "pending",
  "inactive",
];
