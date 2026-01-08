import { getTemplateById } from "@/lib/style-templates";

export type ProjectStatus = "pending" | "processing" | "completed" | "failed";

export interface ProjectImage {
  id: string;
  originalUrl: string;
  enhancedUrl?: string;
  status: "pending" | "processing" | "completed" | "failed";
}

export interface Project {
  id: string;
  name: string;
  styleTemplateId: string;
  status: ProjectStatus;
  images: ProjectImage[];
  imageCount: number;
  completedCount: number;
  thumbnailUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

// Sample property addresses for realistic project names
const projectNames = [
  "123 Oak Street",
  "456 Maple Avenue",
  "789 Cedar Boulevard",
  "321 Pine Drive",
  "654 Elm Lane",
  "987 Willow Way",
  "147 Birch Court",
  "258 Ash Place",
  "369 Cherry Road",
  "741 Walnut Circle",
  "852 Main Street",
  "963 Park Avenue",
  "159 Lake Drive",
  "357 River Lane",
  "486 Hill Road",
];

const styleTemplateIds = [
  "modern-minimalist",
  "luxury-high-end",
  "warm-cozy",
  "twilight-exterior",
  "professional-lighting",
];

function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 1_103_515_245 + 12_345) & 0x7f_ff_ff_ff;
    return seed / 0x7f_ff_ff_ff;
  };
}

function generateMockProjects(count: number): Project[] {
  const projects: Project[] = [];
  const random = seededRandom(42);

  for (let i = 0; i < count; i++) {
    const name = projectNames[i % projectNames.length];
    const styleTemplateId =
      styleTemplateIds[Math.floor(random() * styleTemplateIds.length)];
    const imageCount = Math.floor(random() * 8) + 1;

    // Weight status distribution: 60% completed, 15% processing, 15% pending, 10% failed
    const statusRoll = random();
    let status: ProjectStatus;
    let completedCount: number;

    if (statusRoll < 0.6) {
      status = "completed";
      completedCount = imageCount;
    } else if (statusRoll < 0.75) {
      status = "processing";
      completedCount = Math.floor(random() * imageCount);
    } else if (statusRoll < 0.9) {
      status = "pending";
      completedCount = 0;
    } else {
      status = "failed";
      completedCount = Math.floor(random() * imageCount);
    }

    // Generate images for the project
    const images: ProjectImage[] = [];
    for (let j = 0; j < imageCount; j++) {
      const imageStatus =
        j < completedCount
          ? "completed"
          : status === "processing" && j === completedCount
            ? "processing"
            : "pending";
      images.push({
        id: `img_${i}_${j}`,
        originalUrl: `https://picsum.photos/seed/${i * 10 + j}/800/600`,
        enhancedUrl:
          imageStatus === "completed"
            ? `https://picsum.photos/seed/${i * 10 + j + 100}/800/600`
            : undefined,
        status: imageStatus as ProjectImage["status"],
      });
    }

    // Generate dates
    const createdDaysAgo = Math.floor(random() * 90);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - createdDaysAgo);

    const updatedDaysAgo = Math.floor(random() * Math.min(createdDaysAgo, 7));
    const updatedAt = new Date();
    updatedAt.setDate(updatedAt.getDate() - updatedDaysAgo);

    projects.push({
      id: `proj_${String(i + 1).padStart(3, "0")}`,
      name: `${name}${i >= projectNames.length ? ` #${Math.floor(i / projectNames.length) + 1}` : ""}`,
      styleTemplateId,
      status,
      images,
      imageCount,
      completedCount,
      thumbnailUrl: `https://picsum.photos/seed/${i}/400/300`,
      createdAt,
      updatedAt,
    });
  }

  return projects;
}

// Generate 12 mock projects for the grid
const mockProjects = generateMockProjects(12);

export interface GetProjectsResponse {
  data: Project[];
  meta: {
    total: number;
  };
}

export function getProjects(): GetProjectsResponse {
  return {
    data: mockProjects,
    meta: {
      total: mockProjects.length,
    },
  };
}

export function getProjectById(id: string): Project | undefined {
  return mockProjects.find((p) => p.id === id);
}

export function getProjectStats() {
  const total = mockProjects.length;
  const completed = mockProjects.filter((p) => p.status === "completed").length;
  const processing = mockProjects.filter(
    (p) => p.status === "processing"
  ).length;
  const totalImages = mockProjects.reduce((sum, p) => sum + p.imageCount, 0);
  const totalCost = mockProjects.reduce((sum, p) => {
    const template = getTemplateById(p.styleTemplateId);
    return sum + (template?.estimatedCost || 0.039) * p.completedCount;
  }, 0);

  return {
    totalProjects: total,
    completedProjects: completed,
    processingProjects: processing,
    totalImages,
    totalCost: Math.round(totalCost * 100) / 100,
  };
}

export const ALL_PROJECT_STATUSES: ProjectStatus[] = [
  "pending",
  "processing",
  "completed",
  "failed",
];
