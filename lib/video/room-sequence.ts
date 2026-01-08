import type { VideoRoomType } from "@/lib/db/schema";

/**
 * Room type definitions and sequencing logic for property tour videos
 */

// Room type display configuration (Unified English labels)
export const VIDEO_ROOM_TYPES: Array<{
  id: VideoRoomType;
  label: string;
  icon: string;
  emoji: string;
  order: number;
}> = [
  {
    id: "exterior",
    label: "Exterior",
    icon: "IconBuildingSkyscraper",
    emoji: "🏠",
    order: 1,
  },
  {
    id: "hallway",
    label: "Hallway/Entrance",
    icon: "IconDoor",
    emoji: "🚪",
    order: 2,
  },
  {
    id: "living-room",
    label: "Living Room",
    icon: "IconSofa",
    emoji: "🛋️",
    order: 3,
  },
  {
    id: "kitchen",
    label: "Kitchen",
    icon: "IconToolsKitchen2",
    emoji: "🍳",
    order: 4,
  },
  {
    id: "dining-room",
    label: "Dining Room",
    icon: "IconArmchair",
    emoji: "🍽️",
    order: 5,
  },
  {
    id: "tv-room",
    label: "TV Room/Media Room",
    icon: "IconDeviceTv",
    emoji: "📺",
    order: 6,
  },
  { id: "bedroom", label: "Bedroom", icon: "IconBed", emoji: "🛏️", order: 7 },
  {
    id: "childrens-room",
    label: "Children's Room",
    icon: "IconMoodBoy",
    emoji: "🧸",
    order: 8,
  },
  {
    id: "bathroom",
    label: "Bathroom",
    icon: "IconBath",
    emoji: "🚿",
    order: 9,
  },
  {
    id: "toilet",
    label: "Toilet",
    icon: "IconToiletPaper",
    emoji: "🚽",
    order: 10,
  },
  {
    id: "walk-in-closet",
    label: "Walk-in Closet",
    icon: "IconHanger",
    emoji: "👕",
    order: 11,
  },
  {
    id: "laundry-room",
    label: "Laundry Room",
    icon: "IconWashMachine",
    emoji: "🧺",
    order: 12,
  },
  {
    id: "office",
    label: "Office/Workspace",
    icon: "IconDesk",
    emoji: "💼",
    order: 13,
  },
  {
    id: "library",
    label: "Library/Reading Room",
    icon: "IconBooks",
    emoji: "📚",
    order: 14,
  },
  {
    id: "gym",
    label: "Gym/Exercise Room",
    icon: "IconBarbell",
    emoji: "🏋️",
    order: 15,
  },
  { id: "sauna", label: "Sauna", icon: "IconSteam", emoji: "🧖", order: 16 },
  {
    id: "pool-area",
    label: "Pool Area",
    icon: "IconSwimming",
    emoji: "🏊",
    order: 17,
  },
  {
    id: "hobby-room",
    label: "Hobby Room/Workshop",
    icon: "IconTools",
    emoji: "🛠️",
    order: 18,
  },
  {
    id: "pantry",
    label: "Pantry",
    icon: "IconBuildingStore",
    emoji: "🥫",
    order: 19,
  },
  {
    id: "storage-room",
    label: "Storage Room",
    icon: "IconBox",
    emoji: "📦",
    order: 20,
  },
  {
    id: "utility-room",
    label: "Utility Room",
    icon: "IconSettings",
    emoji: "⚙️",
    order: 21,
  },
  {
    id: "conservatory",
    label: "Conservatory/Sunroom",
    icon: "IconLeaf",
    emoji: "🌱",
    order: 22,
  },
  { id: "garage", label: "Garage", icon: "IconCar", emoji: "🚗", order: 23 },
  {
    id: "terrace",
    label: "Terrace/Balcony",
    icon: "IconSun",
    emoji: "🌤️",
    order: 24,
  },
  { id: "garden", label: "Garden", icon: "IconTree", emoji: "🌳", order: 25 },
  {
    id: "landscape",
    label: "Landscape",
    icon: "IconMountain",
    emoji: "🌄",
    order: 26,
  },
  { id: "other", label: "Other", icon: "IconPhoto", emoji: "🏠", order: 27 },
];

// Room sequence order for property tours
export const ROOM_SEQUENCE_ORDER: Record<VideoRoomType, number> = {
  exterior: 1,
  hallway: 2,
  "living-room": 3,
  kitchen: 4,
  "dining-room": 5,
  "tv-room": 6,
  bedroom: 7,
  "childrens-room": 8,
  bathroom: 9,
  toilet: 10,
  "walk-in-closet": 11,
  "laundry-room": 12,
  office: 13,
  library: 14,
  gym: 15,
  sauna: 16,
  "pool-area": 17,
  "hobby-room": 18,
  pantry: 19,
  "storage-room": 20,
  "utility-room": 21,
  conservatory: 22,
  garage: 23,
  terrace: 24,
  garden: 25,
  landscape: 26,
  other: 27,
};

// Get room type config by ID
export function getRoomTypeConfig(roomType: VideoRoomType) {
  return VIDEO_ROOM_TYPES.find((rt) => rt.id === roomType);
}

// Get room type label
export function getRoomTypeLabel(roomType: VideoRoomType): string {
  return getRoomTypeConfig(roomType)?.label ?? roomType;
}

// Sort clips by room type sequence order
export interface ClipWithRoom {
  id: string;
  roomType: VideoRoomType;
  sequenceOrder: number;
}

export function autoSequenceClips<T extends ClipWithRoom>(clips: T[]): T[] {
  return [...clips].sort((a, b) => {
    const orderA = ROOM_SEQUENCE_ORDER[a.roomType] ?? 100;
    const orderB = ROOM_SEQUENCE_ORDER[b.roomType] ?? 100;

    // Primary sort: by room type order
    if (orderA !== orderB) {
      return orderA - orderB;
    }

    // Secondary sort: by original sequence order (for same room types)
    return a.sequenceOrder - b.sequenceOrder;
  });
}

// Update sequence orders after auto-sorting
export function reindexSequenceOrders<T extends ClipWithRoom>(clips: T[]): T[] {
  return clips.map(
    (clip, index) =>
      ({
        ...clip,
        sequenceOrder: index + 1,
      }) as T
  );
}

// Get room type from common image project room types
export function mapProjectRoomType(
  projectRoomType: string | null
): VideoRoomType {
  const mapping: Record<string, VideoRoomType> = {
    "living-room": "living-room",
    bedroom: "bedroom",
    kitchen: "kitchen",
    bathroom: "bathroom",
    "dining-room": "dining-room",
    office: "office",
    stue: "living-room",
    kjokken: "kitchen",
    soverom: "bedroom",
    bad: "bathroom",
    toalett: "toilet",
    gang: "hallway",
    vaskerom: "laundry-room",
    bod: "storage-room",
    garderobe: "walk-in-closet",
    badstue: "sauna",
    treningsrom: "gym",
    barnerom: "childrens-room",
    bassengområde: "pool-area",
    tvstue: "tv-room",
    bibliotek: "library",
    hobbyrom: "hobby-room",
    tekniskrom: "utility-room",
    matbod: "pantry",
    vinterhage: "conservatory",
    garasje: "garage",
    terrasse: "terrace",
    hage: "garden",
    landskap: "landscape",
    eksterior: "exterior",
  };
  return mapping[projectRoomType ?? ""] ?? "other";
}
