import { logger, metadata, task } from "@trigger.dev/sdk/v3";
import { getVideoClipById, updateVideoClip } from "@/lib/db/queries";
import {
  fal,
  KLING_VIDEO_PRO,
  type KlingVideoInput,
  type KlingVideoOutput,
} from "@/lib/fal";
import { getVideoPath, uploadVideo } from "@/lib/supabase";
import { DEFAULT_NEGATIVE_PROMPT } from "@/lib/video/motion-prompts";

export interface GenerateTransitionClipPayload {
  clipId: string;
  fromImageUrl: string; // End frame of previous clip
  toImageUrl: string; // Start frame of next clip
  videoProjectId: string;
  workspaceId: string;
  aspectRatio: "16:9" | "9:16" | "1:1";
}

export interface TransitionClipStatus {
  step:
    | "fetching"
    | "uploading"
    | "generating"
    | "saving"
    | "completed"
    | "failed";
  label: string;
  progress?: number;
}

export const generateTransitionClipTask = task({
  id: "generate-transition-clip",
  maxDuration: 300, // 5 minutes
  retry: {
    maxAttempts: 2,
    minTimeoutInMs: 2000,
    maxTimeoutInMs: 30_000,
    factor: 2,
  },
  run: async (payload: GenerateTransitionClipPayload) => {
    const {
      clipId,
      fromImageUrl,
      toImageUrl,
      videoProjectId,
      workspaceId,
      aspectRatio,
    } = payload;

    try {
      // Step 1: Fetch clip record
      metadata.set("status", {
        step: "fetching",
        label: "Loading transition data…",
        progress: 10,
      } satisfies TransitionClipStatus);

      logger.info("Generating transition clip", {
        clipId,
        fromImageUrl,
        toImageUrl,
      });

      const clip = await getVideoClipById(clipId);
      if (!clip) {
        throw new Error(`Video clip not found: ${clipId}`);
      }

      // Step 2: Upload images to Fal.ai storage
      metadata.set("status", {
        step: "uploading",
        label: "Preparing transition images…",
        progress: 20,
      } satisfies TransitionClipStatus);

      // Fetch and upload from image (end of previous clip)
      const fromResponse = await fetch(fromImageUrl);
      if (!fromResponse.ok) {
        throw new Error(`Failed to fetch from image: ${fromResponse.status}`);
      }
      const fromBlob = await fromResponse.blob();
      const falFromUrl = await fal.storage.upload(
        new File([fromBlob], "from.jpg", { type: fromBlob.type })
      );

      // Fetch and upload to image (start of next clip)
      const toResponse = await fetch(toImageUrl);
      if (!toResponse.ok) {
        throw new Error(`Failed to fetch to image: ${toResponse.status}`);
      }
      const toBlob = await toResponse.blob();
      const falToUrl = await fal.storage.upload(
        new File([toBlob], "to.jpg", { type: toBlob.type })
      );

      logger.info("Uploaded transition images to Fal.ai storage", {
        falFromUrl,
        falToUrl,
      });

      // Step 3: Generate transition prompt
      const transitionPrompt =
        "Smooth, seamless morphing transition between two scenes. Professional cinematic blend with natural motion. Elegant and fluid transformation.";

      // Step 4: Call Kling Video API
      metadata.set("status", {
        step: "generating",
        label: "Generating transition…",
        progress: 40,
      } satisfies TransitionClipStatus);

      logger.info("Calling Kling Video for transition", {
        clipId,
        prompt: transitionPrompt,
        duration: "5",
        aspectRatio,
      });

      // Prepare Kling input - use from image as source, to image as tail
      // Note: Kling only supports 5 or 10 seconds, so we use 5 for transitions
      const klingInput: KlingVideoInput = {
        image_url: falFromUrl,
        tail_image_url: falToUrl,
        prompt: transitionPrompt,
        duration: "5" as "5" | "10", // Kling minimum is 5 seconds
        aspect_ratio: aspectRatio,
        generate_audio: false, // Transitions don't need audio
        negative_prompt: DEFAULT_NEGATIVE_PROMPT,
      };

      const result = (await fal.subscribe(KLING_VIDEO_PRO, {
        input: klingInput,
        onQueueUpdate: (update) => {
          logger.info("Kling processing update", { update });
          if (update.status === "IN_PROGRESS") {
            metadata.set("status", {
              step: "generating",
              label: "Generating transition…",
              progress: 50,
            } satisfies TransitionClipStatus);
          }
        },
      })) as unknown as KlingVideoOutput;

      logger.info("Kling transition result received", { result });

      // Check for result
      const output = (result as { data?: KlingVideoOutput }).data || result;
      if (!output.video?.url) {
        logger.error("No video in transition response", { result });
        throw new Error("No video returned from Kling API for transition");
      }

      const resultVideoUrl = output.video.url;

      // Step 5: Save to Supabase
      metadata.set("status", {
        step: "saving",
        label: "Saving transition…",
        progress: 80,
      } satisfies TransitionClipStatus);

      logger.info("Downloading transition video", { resultVideoUrl });

      const resultVideoResponse = await fetch(resultVideoUrl);
      if (!resultVideoResponse.ok) {
        throw new Error("Failed to download transition video");
      }

      const resultVideoBuffer = await resultVideoResponse.arrayBuffer();

      const videoPath = getVideoPath(
        workspaceId,
        videoProjectId,
        `transition_${clipId}.mp4`
      );

      logger.info("Uploading transition to Supabase", { videoPath });

      const storedVideoUrl = await uploadVideo(
        new Uint8Array(resultVideoBuffer),
        videoPath,
        "video/mp4"
      );

      // Update clip record with transition URL
      await updateVideoClip(clipId, {
        transitionClipUrl: storedVideoUrl,
      });

      metadata.set("status", {
        step: "completed",
        label: "Complete",
        progress: 100,
      } satisfies TransitionClipStatus);

      logger.info("Transition clip generation completed", {
        clipId,
        transitionClipUrl: storedVideoUrl,
      });

      return {
        success: true,
        transitionClipUrl: storedVideoUrl,
        clipId,
      };
    } catch (error) {
      logger.error("Transition clip generation failed", {
        clipId,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      metadata.set("status", {
        step: "failed",
        label: "Generation failed",
        progress: 0,
      } satisfies TransitionClipStatus);

      throw error;
    }
  },
});
