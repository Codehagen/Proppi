export type PropertyStatus = "active" | "pending" | "completed" | "archived";
export type PropertyTag =
  | "residential"
  | "commercial"
  | "luxury"
  | "staging"
  | "exterior"
  | "interior"
  | "renovation";

export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  status: PropertyStatus;
  tags: PropertyTag[];
  editCount: number;
  totalCost: number;
  createdAt: Date;
  updatedAt: Date;
}

// Sample addresses for realistic mock data
const streetNames = [
  "Oak",
  "Maple",
  "Cedar",
  "Pine",
  "Elm",
  "Willow",
  "Birch",
  "Ash",
  "Cherry",
  "Walnut",
  "Main",
  "Park",
  "Lake",
  "River",
  "Hill",
  "Valley",
  "Mountain",
  "Forest",
  "Ocean",
  "Beach",
];

const streetTypes = [
  "St",
  "Ave",
  "Blvd",
  "Dr",
  "Ln",
  "Way",
  "Ct",
  "Pl",
  "Rd",
  "Cir",
];

const cities = [
  { city: "Los Angeles", state: "CA", zip: "900" },
  { city: "San Francisco", state: "CA", zip: "941" },
  { city: "San Diego", state: "CA", zip: "921" },
  { city: "Seattle", state: "WA", zip: "981" },
  { city: "Portland", state: "OR", zip: "972" },
  { city: "Denver", state: "CO", zip: "802" },
  { city: "Austin", state: "TX", zip: "787" },
  { city: "Dallas", state: "TX", zip: "752" },
  { city: "Miami", state: "FL", zip: "331" },
  { city: "Tampa", state: "FL", zip: "336" },
  { city: "Chicago", state: "IL", zip: "606" },
  { city: "New York", state: "NY", zip: "100" },
  { city: "Boston", state: "MA", zip: "021" },
  { city: "Phoenix", state: "AZ", zip: "850" },
  { city: "Las Vegas", state: "NV", zip: "891" },
];

const statuses: PropertyStatus[] = [
  "active",
  "pending",
  "completed",
  "archived",
];
const allTags: PropertyTag[] = [
  "residential",
  "commercial",
  "luxury",
  "staging",
  "exterior",
  "interior",
  "renovation",
];

function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 1_103_515_245 + 12_345) & 0x7f_ff_ff_ff;
    return seed / 0x7f_ff_ff_ff;
  };
}

function generateMockProperties(count: number): Property[] {
  const properties: Property[] = [];
  const random = seededRandom(42); // Consistent seed for reproducible data

  for (let i = 0; i < count; i++) {
    const streetNum = Math.floor(random() * 9999) + 1;
    const streetName = streetNames[Math.floor(random() * streetNames.length)];
    const streetType = streetTypes[Math.floor(random() * streetTypes.length)];
    const location = cities[Math.floor(random() * cities.length)];
    const zipSuffix = String(Math.floor(random() * 99)).padStart(2, "0");

    // Generate 1-3 random tags
    const tagCount = Math.floor(random() * 3) + 1;
    const shuffledTags = [...allTags].sort(() => random() - 0.5);
    const tags = shuffledTags.slice(0, tagCount) as PropertyTag[];

    // Generate dates within the last year
    const createdDaysAgo = Math.floor(random() * 365);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - createdDaysAgo);

    const updatedDaysAgo = Math.floor(random() * createdDaysAgo);
    const updatedAt = new Date();
    updatedAt.setDate(updatedAt.getDate() - updatedDaysAgo);

    properties.push({
      id: `prop_${String(i + 1).padStart(4, "0")}`,
      address: `${streetNum} ${streetName} ${streetType}`,
      city: location.city,
      state: location.state,
      zipCode: `${location.zip}${zipSuffix}`,
      status: statuses[Math.floor(random() * statuses.length)],
      tags,
      editCount: Math.floor(random() * 25),
      totalCost: Math.round(random() * 50 * 100) / 100, // $0.00 - $50.00
      createdAt,
      updatedAt,
    });
  }

  return properties;
}

// Generate 150 mock properties
const mockProperties = generateMockProperties(150);

export type SortableColumn =
  | "address"
  | "status"
  | "editCount"
  | "totalCost"
  | "createdAt";
export type SortDirection = "asc" | "desc";

export interface PropertyFilters {
  search?: string;
  status?: PropertyStatus | null;
  tags?: PropertyTag[];
  sort?: [SortableColumn, SortDirection];
}

export interface GetPropertiesResponse {
  data: Property[];
  meta: {
    cursor: string | null;
    hasMore: boolean;
    total: number;
    filteredTotal: number;
  };
}

function filterProperties(
  properties: Property[],
  filters: PropertyFilters
): Property[] {
  return properties.filter((property) => {
    // Search filter (address, city, state)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        property.address.toLowerCase().includes(searchLower) ||
        property.city.toLowerCase().includes(searchLower) ||
        property.state.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filters.status && property.status !== filters.status) {
      return false;
    }

    // Tags filter (match any)
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some((tag) =>
        property.tags.includes(tag)
      );
      if (!hasMatchingTag) return false;
    }

    return true;
  });
}

function sortProperties(
  properties: Property[],
  sort?: [SortableColumn, SortDirection]
): Property[] {
  if (!sort) return properties;

  const [column, direction] = sort;
  const multiplier = direction === "asc" ? 1 : -1;

  return [...properties].sort((a, b) => {
    let comparison = 0;

    switch (column) {
      case "address":
        comparison = a.address.localeCompare(b.address);
        break;
      case "status":
        comparison = a.status.localeCompare(b.status);
        break;
      case "editCount":
        comparison = a.editCount - b.editCount;
        break;
      case "totalCost":
        comparison = a.totalCost - b.totalCost;
        break;
      case "createdAt":
        comparison = a.createdAt.getTime() - b.createdAt.getTime();
        break;
    }

    return comparison * multiplier;
  });
}

export function getPropertiesPage(
  cursor: string | null = null,
  limit = 20,
  filters: PropertyFilters = {}
): GetPropertiesResponse {
  // Apply filters first, then sort
  const filteredProperties = filterProperties(mockProperties, filters);
  const sortedProperties = sortProperties(filteredProperties, filters.sort);

  const startIndex = cursor ? Number.parseInt(cursor, 10) : 0;
  const endIndex = Math.min(startIndex + limit, sortedProperties.length);
  const data = sortedProperties.slice(startIndex, endIndex);
  const hasMore = endIndex < sortedProperties.length;

  return {
    data,
    meta: {
      cursor: hasMore ? String(endIndex) : null,
      hasMore,
      total: mockProperties.length,
      filteredTotal: sortedProperties.length,
    },
  };
}

export function getAllProperties(): Property[] {
  return mockProperties;
}

// Export constants for filters
export const ALL_STATUSES: PropertyStatus[] = [
  "active",
  "pending",
  "completed",
  "archived",
];
export const ALL_TAGS: PropertyTag[] = [
  "residential",
  "commercial",
  "luxury",
  "staging",
  "exterior",
  "interior",
  "renovation",
];
