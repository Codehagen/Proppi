import { fal } from "@fal-ai/client";

// Configure Fal.ai client with API key
fal.config({
  credentials: process.env.FAL_API_KEY!,
});

export { fal };

// Correct model endpoint for Nano Banana Pro image editing
export const NANO_BANANA_PRO_EDIT = "fal-ai/nano-banana-pro/edit";

// Input type for Nano Banana Pro edit endpoint
export interface NanoBananaProInput {
  prompt: string;
  image_urls: string[]; // NOTE: Array, not single string!
  num_images?: number; // 1-4, default 1
  aspect_ratio?:
    | "21:9"
    | "16:9"
    | "3:2"
    | "4:3"
    | "5:4"
    | "1:1"
    | "4:5"
    | "3:4"
    | "2:3"
    | "9:16";
  resolution?: "1K" | "2K" | "4K";
  output_format?: "jpeg" | "png" | "webp";
  sync_mode?: boolean;
}

// Output type for Nano Banana Pro
export interface NanoBananaProOutput {
  images: Array<{
    url: string;
    file_name: string;
    content_type: string;
    file_size: number;
    width: number;
    height: number;
  }>;
  description?: string;
}

// FLUX Fill Pro - Inpainting/Outpainting model
export const FLUX_FILL_PRO = "fal-ai/flux-pro/v1/fill";

// Input type for FLUX Fill Pro
export interface FluxFillInput {
  image_url: string; // Original image URL
  mask_url: string; // Black/white mask (white = area to edit)
  prompt: string; // What to generate in masked area
  num_inference_steps?: number; // Default 28
  guidance_scale?: number; // Balance between prompt adherence and quality
  output_format?: "jpeg" | "png";
  safety_tolerance?: "1" | "2" | "3" | "4" | "5" | "6";
}

// Output type for FLUX Fill Pro
export interface FluxFillOutput {
  images: Array<{
    url: string;
    width: number;
    height: number;
    content_type: string;
  }>;
  seed?: number;
  has_nsfw_concepts?: boolean[];
  prompt?: string;
}

// ============================================================================
// Kling Video v2.6 Pro - Image to Video
// ============================================================================

export const KLING_VIDEO_PRO = "fal-ai/kling-video/v2.6/pro/image-to-video";

// Input type for Kling Video Pro
export interface KlingVideoInput {
  image_url: string; // Source image URL
  tail_image_url?: string; // Optional end frame image URL
  prompt: string; // Motion description
  duration?: "5" | "10"; // Video duration in seconds
  aspect_ratio?: "16:9" | "9:16" | "1:1";
  generate_audio?: boolean; // Whether to generate native audio
  negative_prompt?: string; // Terms to avoid
  cfg_scale?: number; // 0-1, how closely to follow prompt
}

// Output type for Kling Video Pro
export interface KlingVideoOutput {
  video: {
    url: string;
    content_type?: string;
    file_size?: number;
  };
  seed?: number;
}
