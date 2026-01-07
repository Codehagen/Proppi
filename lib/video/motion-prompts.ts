import type { VideoRoomType } from "@/lib/db/schema"

/**
 * Default motion prompts for Kling Video v2.6 Pro generation
 *
 * Best practices from Kling 2.6 Pro Prompt Guide:
 * @see https://fal.ai/learn/devs/kling-2-6-pro-prompt-guide
 *
 * Structure: [Camera action] + [Direction/Speed] + [Distance/Framing] + [Subject focus] + [Style]
 *
 * Key principles:
 * - Use consistent motion language: "camera tracks", "camera pushes forward"
 * - Specify camera distance and framing for visual coherence
 * - Break complex movements into simpler instructions
 * - Avoid multiple simultaneous camera transformations
 */

export const DEFAULT_MOTION_PROMPTS: Record<VideoRoomType, string> = {
  exterior:
    "Camera performs a slow, cinematic dolly-in towards the front facade at eye-level. Natural daylight highlights architectural textures, professional landscaping, and the driveway. Steady movement, luxury real estate style, 4k high resolution.",

  hallway:
    "Camera pushes forward smoothly through the entrance and into the hallway. Warm ambient lighting creates a welcoming atmosphere, revealing the transition into the main living spaces. Stable motion, professional real estate cinematography, 4k high resolution.",

  "living-room":
    "Camera performs a slow, sweeping pan from left to right across the living room at eye-level. Natural sunlight streams through windows, illuminating hardwood floors and plush furniture textures. Steady, professional real estate cinematography, 4k high resolution, serene atmosphere.",

  kitchen:
    "Camera tracks slowly along the kitchen island and countertops at medium distance. Highlights the clean lines of the cabinetry, modern stainless steel appliances, and premium finishes. Bright, clear lighting, professional real estate style, 4k high resolution.",

  "dining-room":
    "Camera slowly pulls back from the dining table at eye-level, revealing the elegant setting and connection to adjacent rooms. Warm, soft lighting creates an inviting atmosphere for entertaining. Steady motion, professional cinematography, 4k high resolution.",

  "tv-room":
    "Camera pans slowly across the cozy media room, highlighting the comfortable seating arrangement and large screen. Dim, moody lighting creates a perfect cinematic experience. Steady, professional real estate cinematography, 4k high resolution.",

  bedroom:
    "Camera tracks gently across the primary bedroom, showcasing the spacious layout and soft bedding textures. Natural light from windows creates a calm, tranquil retreat. Smooth horizontal movement, professional real estate style, 4k high resolution.",

  "childrens-room":
    "Camera tracks right across the bright and playful children's room. Highlights the organized toys, creative wall decor, and natural window light. Warm, cheerful atmosphere, 4k high resolution.",

  bathroom:
    "Camera pushes forward slowly into the spa-like bathroom. Steady motion highlights the premium fixtures, glass shower details, and clean surfaces. Bright, clean lighting, professional real estate cinematography, 4k high resolution.",

  toilet:
    "Camera performs a slow, steady pan across the modern restroom, highlighting premium tile work and sleek fixtures. Clean, bright lighting, 4k high resolution.",

  "walk-in-closet":
    "Camera tracks slowly through the spacious walk-in closet, showcasing custom cabinetry and organized storage. Bright, even lighting highlights the premium finishes. 4k high resolution.",

  "laundry-room":
    "Camera pans across the functional laundry room, highlighting the modern appliances, storage solutions, and clean workspace. Bright, practical lighting, 4k high resolution.",

  office:
    "Camera tracks right across the quiet office space at eye-level. Steady movement reveals the organized workspace, natural window light, and productive environment. Modern professional style, 4k high resolution.",

  library:
    "Camera tracks slowly across the built-in bookshelves and cozy reading area. Soft, warm lighting creates a peaceful, intellectual atmosphere. 4k high resolution.",

  gym:
    "Camera performs a slow pan across the home gym area, highlighting the fitness equipment and professional flooring. Bright, energetic lighting, 4k high resolution.",

  sauna:
    "Camera tracks slowly across the wooden sauna interior. Soft, warm lighting highlights the cedar textures and peaceful atmosphere. Steady motion, 4k high resolution.",

  "pool-area":
    "Camera performs a cinematic sweep across the indoor pool area, highlighting the sparkling water and surrounding lounge space. Bright, expansive lighting, 4k high resolution.",

  "hobby-room":
    "Camera tracks right across the workshop or hobby space, revealing the organized tools and creative workspace. Practical lighting, 4k high resolution.",

  pantry:
    "Camera pans across the organized pantry shelves, highlighting the custom storage and ample space. Bright, clear lighting, 4k high resolution.",

  "storage-room":
    "Camera tracks slowly through the storage area, highlighting the clean, organized space and shelving. Practical lighting, 4k high resolution.",

  "utility-room":
    "Camera pans across the utility room, highlighting the clean installation of home systems and equipment. Bright, practical lighting, 4k high resolution.",

  conservatory:
    "Camera performs a slow, sweeping pan across the sunlit conservatory. Abundant natural light highlights the lush plants and connection to the garden. 4k high resolution.",

  garage:
    "Camera tracks slowly through the clean, spacious garage, highlighting the professional flooring and storage possibilities. Bright, practical lighting, 4k high resolution.",

  terrace:
    "Camera pans slowly across the outdoor terrace or balcony, highlighting the seating area and view. Natural daylight or golden hour lighting creates a relaxing atmosphere. 4k high resolution.",

  garden:
    "Camera performs a slow, cinematic sweep across the landscaped garden. Natural sunlight highlights the lush greenery and peaceful outdoor environment. 4k high resolution.",

  landscape:
    "Camera performs a wide, sweeping pan across the surrounding property landscape. Captures the expansive views and natural beauty of the setting. 4k high resolution.",

  other:
    "Camera tracks slowly across the space at medium distance, maintaining a steady horizontal movement. Highlights the room's unique features, textures, and natural lighting. Professional real estate cinematography style, 4k high resolution.",
}

// Get motion prompt for a room type
export function getMotionPrompt(roomType: VideoRoomType): string {
  return DEFAULT_MOTION_PROMPTS[roomType] ?? DEFAULT_MOTION_PROMPTS.other
}

// Generate a custom motion prompt with room-specific base + user additions
export function generateMotionPrompt(
  roomType: VideoRoomType,
  customAdditions?: string
): string {
  const basePrompt = getMotionPrompt(roomType)

  if (!customAdditions?.trim()) {
    return basePrompt
  }

  return `${basePrompt} ${customAdditions.trim()}`
}

// Common negative prompts to avoid issues
export const DEFAULT_NEGATIVE_PROMPT =
  "blurry, low resolution, distorted, shaky camera, jerky motion, flickering, morphing, unstable geometry, warped textures, overexposed, underexposed, watermark, text overlay, extra limbs, floating objects"

/**
 * Prompt enhancement tips for real estate videos
 * Based on Kling 2.6 Pro Prompt Guide best practices
 * @see https://fal.ai/learn/devs/kling-2-6-pro-prompt-guide
 */
export const PROMPT_TIPS = [
  "Use 'camera tracks left/right' for horizontal movement",
  "Use 'camera pushes forward' for walking/entering effect",
  "Use 'camera pulls back' to reveal a space",
  "Specify 'eye-level framing' for natural perspective",
  "Add 'steady movement' or 'smooth motion' for stability",
  "Include '4k high resolution' to improve detail and reduce artifacts",
  "Mention specific textures like 'hardwood floors' or 'marble countertops' for realism",
  "Use 'golden hour lighting' for exteriors to create a premium feel",
  "Avoid combining multiple camera movements (e.g., 'pan while zooming')",
  "Include 'professional real estate cinematography' for polished style",
]
