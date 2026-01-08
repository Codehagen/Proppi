export type WorkspaceStatus = "active" | "suspended" | "trial";
export type WorkspacePlan = "free" | "pro" | "enterprise";

export interface AdminWorkspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerImage: string | null;
  memberCount: number;
  imagesGenerated: number;
  totalSpend: number;
  status: WorkspaceStatus;
  plan: WorkspacePlan;
  createdAt: Date;
  lastActivityAt: Date;
}

// Realistic real estate company names
const companyNames = [
  "Sunset Realty",
  "Metro Properties",
  "Coastal Living Homes",
  "Mountain View Estates",
  "Urban Edge Realty",
  "Pacific Northwest Properties",
  "Golden State Real Estate",
  "Lakeside Homes Group",
  "Premier Property Partners",
  "Horizon Real Estate",
  "Skyline Realty Co",
  "Riverfront Properties",
  "Heritage Homes",
  "Pinnacle Real Estate",
  "Evergreen Property Group",
  "Oak & Stone Realty",
  "Blue Ocean Properties",
  "Summit Real Estate",
  "Valley View Homes",
  "Downtown Properties LLC",
  "Compass Point Realty",
  "Sterling Home Group",
  "Trailhead Properties",
  "Parkside Real Estate",
  "Vista Property Management",
];

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
];

function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 1_103_515_245 + 12_345) & 0x7f_ff_ff_ff;
    return seed / 0x7f_ff_ff_ff;
  };
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+$/, "");
}

function generateMockWorkspaces(count: number): AdminWorkspace[] {
  const workspaces: AdminWorkspace[] = [];
  const random = seededRandom(123); // Different seed from properties

  for (let i = 0; i < count; i++) {
    const companyName = companyNames[i % companyNames.length];
    const firstName = firstNames[Math.floor(random() * firstNames.length)];
    const lastName = lastNames[Math.floor(random() * lastNames.length)];
    const ownerName = `${firstName} ${lastName}`;
    const emailDomain = generateSlug(companyName).split("-")[0];

    // Status distribution: 80% active, 10% trial, 10% suspended
    const statusRoll = random();
    const status: WorkspaceStatus =
      statusRoll < 0.8 ? "active" : statusRoll < 0.9 ? "trial" : "suspended";

    // Plan distribution: 40% free, 40% pro, 20% enterprise
    const planRoll = random();
    const plan: WorkspacePlan =
      planRoll < 0.4 ? "free" : planRoll < 0.8 ? "pro" : "enterprise";

    // Member count varies by plan
    const baseMemberCount = plan === "enterprise" ? 8 : plan === "pro" ? 4 : 1;
    const memberCount = baseMemberCount + Math.floor(random() * 7);

    // Images generated varies by plan and activity
    const baseImages = plan === "enterprise" ? 200 : plan === "pro" ? 50 : 10;
    const imagesGenerated = Math.floor(baseImages + random() * baseImages * 3);

    // Total spend at $0.039 per image
    const totalSpend = Math.round(imagesGenerated * 0.039 * 100) / 100;

    // Generate dates
    const createdDaysAgo = Math.floor(random() * 365) + 30; // At least 30 days old
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - createdDaysAgo);

    const lastActivityDaysAgo = Math.floor(random() * 14); // Within last 2 weeks
    const lastActivityAt = new Date();
    lastActivityAt.setDate(lastActivityAt.getDate() - lastActivityDaysAgo);

    // Generate avatar (some have images, some don't)
    const hasImage = random() > 0.3;
    const ownerImage = hasImage
      ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}`
      : null;

    workspaces.push({
      id: `ws_${String(i + 1).padStart(4, "0")}`,
      name: companyName,
      slug: `${generateSlug(companyName)}-${String(i + 1).padStart(2, "0")}`,
      ownerId: `usr_${String(i + 1).padStart(4, "0")}_owner`,
      ownerName,
      ownerEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${emailDomain}.com`,
      ownerImage,
      memberCount,
      imagesGenerated,
      totalSpend,
      status,
      plan,
      createdAt,
      lastActivityAt,
    });
  }

  return workspaces;
}

// Generate 25 mock workspaces
const mockWorkspaces = generateMockWorkspaces(25);

export type SortableWorkspaceColumn =
  | "name"
  | "memberCount"
  | "imagesGenerated"
  | "totalSpend"
  | "createdAt"
  | "lastActivityAt";
export type SortDirection = "asc" | "desc";

export interface WorkspaceFilters {
  search?: string;
  status?: WorkspaceStatus | null;
  plan?: WorkspacePlan | null;
  sort?: [SortableWorkspaceColumn, SortDirection];
}

export interface GetWorkspacesResponse {
  data: AdminWorkspace[];
  meta: {
    cursor: string | null;
    hasMore: boolean;
    total: number;
    filteredTotal: number;
  };
}

function filterWorkspaces(
  workspaces: AdminWorkspace[],
  filters: WorkspaceFilters
): AdminWorkspace[] {
  return workspaces.filter((workspace) => {
    // Search filter (name, slug, owner email)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        workspace.name.toLowerCase().includes(searchLower) ||
        workspace.slug.toLowerCase().includes(searchLower) ||
        workspace.ownerEmail.toLowerCase().includes(searchLower) ||
        workspace.ownerName.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filters.status && workspace.status !== filters.status) {
      return false;
    }

    // Plan filter
    if (filters.plan && workspace.plan !== filters.plan) {
      return false;
    }

    return true;
  });
}

function sortWorkspaces(
  workspaces: AdminWorkspace[],
  sort?: [SortableWorkspaceColumn, SortDirection]
): AdminWorkspace[] {
  if (!sort) return workspaces;

  const [column, direction] = sort;
  const multiplier = direction === "asc" ? 1 : -1;

  return [...workspaces].sort((a, b) => {
    let comparison = 0;

    switch (column) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "memberCount":
        comparison = a.memberCount - b.memberCount;
        break;
      case "imagesGenerated":
        comparison = a.imagesGenerated - b.imagesGenerated;
        break;
      case "totalSpend":
        comparison = a.totalSpend - b.totalSpend;
        break;
      case "createdAt":
        comparison = a.createdAt.getTime() - b.createdAt.getTime();
        break;
      case "lastActivityAt":
        comparison = a.lastActivityAt.getTime() - b.lastActivityAt.getTime();
        break;
    }

    return comparison * multiplier;
  });
}

export function getWorkspacesPage(
  cursor: string | null = null,
  limit = 20,
  filters: WorkspaceFilters = {}
): GetWorkspacesResponse {
  const filteredWorkspaces = filterWorkspaces(mockWorkspaces, filters);
  const sortedWorkspaces = sortWorkspaces(filteredWorkspaces, filters.sort);

  const startIndex = cursor ? Number.parseInt(cursor, 10) : 0;
  const endIndex = Math.min(startIndex + limit, sortedWorkspaces.length);
  const data = sortedWorkspaces.slice(startIndex, endIndex);
  const hasMore = endIndex < sortedWorkspaces.length;

  return {
    data,
    meta: {
      cursor: hasMore ? String(endIndex) : null,
      hasMore,
      total: mockWorkspaces.length,
      filteredTotal: sortedWorkspaces.length,
    },
  };
}

export function getAllWorkspaces(): AdminWorkspace[] {
  return mockWorkspaces;
}

export function getWorkspaceById(id: string): AdminWorkspace | undefined {
  return mockWorkspaces.find((w) => w.id === id);
}

// Export constants for filters
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
