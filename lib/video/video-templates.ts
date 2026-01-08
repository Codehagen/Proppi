import type { VideoRoomType } from "@/lib/db/schema";

export interface VideoTemplateSlot {
  roomType: VideoRoomType;
  label: string;
  description?: string;
  icon?: string; // Optional icon override
  placeholderImage?: string; // URL to example image for this slot
}

export interface VideoTemplate {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  previewVideoUrl?: string; // For hover autoplay
  slots: VideoTemplateSlot[];
  defaultMusicTrackId?: string;
  estimatedDuration: number; // in seconds
}

export const VIDEO_TEMPLATES = [
  {
    id: "classic-tour",
    name: "Classic Home Tour",
    description:
      "A comprehensive walkthrough perfect for most residential properties.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    previewVideoUrl:
      "https://cdn.coverr.co/videos/coverr-interior-design-living-room-2646/1080p.mp4", // Placeholder
    estimatedDuration: 35,
    slots: [
      {
        roomType: "exterior",
        label: "Front Exterior",
        description: "The hero shot of the home from the street",
      },
      {
        roomType: "hallway",
        label: "Entryway",
        description: "Welcome viewers into the home",
      },
      {
        roomType: "living-room",
        label: "Living Room",
        description: "The main gathering space",
      },
      {
        roomType: "kitchen",
        label: "Kitchen",
        description: "Show off the heart of the home",
      },
      {
        roomType: "dining-room",
        label: "Dining Room",
        description: "Where meals are shared",
      },
      {
        roomType: "bedroom",
        label: "Primary Bedroom",
        description: "A relaxing retreat",
      },
      {
        roomType: "bathroom",
        label: "Primary Bathroom",
        description: "Spa-like features",
      },
      {
        roomType: "terrace",
        label: "Backyard / Patio",
        description: "Outdoor living space",
      },
    ],
  },
  {
    id: "highlight-reel",
    name: "Quick Highlights",
    description: "Fast-paced teaser focusing on the property's best features.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80", // Placeholder
    previewVideoUrl:
      "https://cdn.coverr.co/videos/coverr-interior-design-living-room-2646/1080p.mp4", // Placeholder (using same for now)
    estimatedDuration: 20,
    slots: [
      {
        roomType: "exterior",
        label: "Exterior",
        description: "Catch attention immediately",
      },
      {
        roomType: "living-room",
        label: "Living Space",
        description: "The most impressive room",
      },
      {
        roomType: "kitchen",
        label: "Kitchen",
        description: "Modern appliances and finishes",
      },
      {
        roomType: "bedroom",
        label: "Bedroom",
        description: "Comfort and style",
      },
    ],
  },
  {
    id: "room-tour",
    name: "Detailed Room Tour",
    description: "A focused look at a single room from multiple angles.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
    previewVideoUrl:
      "https://cdn.coverr.co/videos/coverr-interior-design-living-room-2646/1080p.mp4",
    estimatedDuration: 15,
    slots: [
      {
        roomType: "other",
        label: "The Hero Shot",
        description: "The best angle of the room",
      },
      {
        roomType: "other",
        label: "Feature Detail",
        description: "Close-up of a key architectural feature or finish",
      },
      {
        roomType: "other",
        label: "Wide Angle",
        description: "Showing the full layout and connection to other spaces",
      },
    ],
  },
  {
    id: "exterior-special",
    name: "Exterior Showcase",
    description: "Highlighting the property's curb appeal and outdoor living.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
    previewVideoUrl:
      "https://cdn.coverr.co/videos/coverr-interior-design-living-room-2646/1080p.mp4",
    estimatedDuration: 15,
    slots: [
      {
        roomType: "exterior",
        label: "Curb Appeal",
        description: "The classic front-on hero shot",
      },
      {
        roomType: "garden",
        label: "Outdoor Living",
        description: "Patio, deck, or landscaping detail",
      },
      {
        roomType: "exterior",
        label: "Entrance Flow",
        description: "Moving towards the front door",
      },
    ],
  },
  {
    id: "social-teaser",
    name: "Social Media Teaser",
    description:
      "Fast-paced, high-impact edit perfect for Instagram or TikTok.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
    previewVideoUrl:
      "https://cdn.coverr.co/videos/coverr-interior-design-living-room-2646/1080p.mp4",
    estimatedDuration: 10,
    slots: [
      {
        roomType: "living-room",
        label: "The Hook",
        description: "The most visually striking interior feature",
      },
      {
        roomType: "exterior",
        label: "Final Reveal",
        description: "The classic money shot of the exterior",
      },
    ],
  },
] satisfies VideoTemplate[];

export function getVideoTemplateById(id: string): VideoTemplate | undefined {
  return VIDEO_TEMPLATES.find((t) => t.id === id);
}
