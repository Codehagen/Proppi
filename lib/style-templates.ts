export type StyleCategory = "staging" | "lighting" | "exterior" | "atmosphere";

export interface StyleTemplate {
  id: string;
  name: string;
  description: string;
  category: StyleCategory;
  thumbnail: string;
  prompt: string;
  comingSoon?: boolean;
}

// Room types for context in prompts
export interface RoomTypeOption {
  id: string;
  label: string;
  icon: string; // Tabler icon name
  description: string;
}

export const ROOM_TYPES: RoomTypeOption[] = [
  {
    id: "living-room",
    label: "Living Room",
    icon: "IconSofa",
    description: "Living spaces, family rooms, lounges",
  },
  {
    id: "bedroom",
    label: "Bedroom",
    icon: "IconBed",
    description: "Bedrooms, master suites, guest rooms",
  },
  {
    id: "kitchen",
    label: "Kitchen",
    icon: "IconToolsKitchen2",
    description: "Kitchens and cooking areas",
  },
  {
    id: "bathroom",
    label: "Bathroom",
    icon: "IconBath",
    description: "Bathrooms, en-suites, powder rooms",
  },
  {
    id: "dining-room",
    label: "Dining Room",
    icon: "IconArmchair",
    description: "Dining areas and breakfast nooks",
  },
  {
    id: "office",
    label: "Office",
    icon: "IconDesk",
    description: "Home offices and study rooms",
  },
];

export function getRoomTypeById(id: string): RoomTypeOption | undefined {
  return ROOM_TYPES.find((r) => r.id === id);
}

// Generate a prompt with room type context and architectural preservation
export function generatePrompt(
  template: StyleTemplate,
  roomType: string | null
): string {
  const preserveStructure =
    "Do not move, remove, or modify windows, walls, doors, or any architectural elements. Keep the room layout exactly as shown.";

  let prompt = template.prompt;

  if (roomType) {
    const roomLabel = roomType.replace(/-/g, " ");
    prompt = `This is a ${roomLabel}. ${prompt}`;
  }

  return `${prompt} ${preserveStructure}`;
}

export const STYLE_TEMPLATES: StyleTemplate[] = [
  {
    id: "scandinavian",
    name: "Scandinavian",
    description: "Light, airy spaces with natural wood and minimal decor",
    category: "staging",
    thumbnail:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
    prompt:
      "Transform into a Scandinavian-style interior. Add light wooden furniture, white and neutral tones, natural textures like linen and wool, minimalist decor with clean lines. Include plants for freshness. The space should feel bright, calm, and inviting with excellent natural lighting.",
  },
  {
    id: "coming-soon",
    name: "More Styles Coming Soon",
    description: "New design templates are on the way",
    category: "staging",
    thumbnail:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&h=300&fit=crop",
    prompt: "",
    comingSoon: true,
  },
];

export function getTemplateById(id: string): StyleTemplate | undefined {
  return STYLE_TEMPLATES.find((t) => t.id === id);
}

export function getTemplatesByCategory(
  category: StyleCategory
): StyleTemplate[] {
  return STYLE_TEMPLATES.filter((t) => t.category === category);
}

export function getSelectableTemplates(): StyleTemplate[] {
  return STYLE_TEMPLATES.filter((t) => !t.comingSoon);
}

export const ALL_CATEGORIES: StyleCategory[] = [
  "staging",
  "lighting",
  "exterior",
  "atmosphere",
];
