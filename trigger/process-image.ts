import { logger, metadata, task } from "@trigger.dev/sdk/v3";
import {
  getImageGenerationById,
  updateImageGeneration,
  updateProjectCounts,
} from "@/lib/db/queries";
import { fal, NANO_BANANA_PRO_EDIT, type NanoBananaProOutput } from "@/lib/fal";
import {
  getExtensionFromContentType,
  getImagePath,
  uploadImage,
} from "@/lib/supabase";

export interface ProcessImagePayload {
  imageId: string;
}

export interface ProcessImageStatus {
  step:
    | "fetching"
    | "uploading"
    | "processing"
    | "saving"
    | "completed"
    | "failed";
  label: string;
  progress?: number;
}

export const processImageTask = task({
  id: "process-image",
  maxDuration: 300, // 5 minutes
  retry: {
    maxAttempts: 3,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 10_000,
    factor: 2,
  },
  run: async (payload: ProcessImagePayload) => {
    const { imageId } = payload;

    try {
      // Step 1: Fetch image record
      metadata.set("status", {
        step: "fetching",
        label: "Loading image…",
        progress: 10,
      } satisfies ProcessImageStatus);

      logger.info("Fetching image record", { imageId });

      const image = await getImageGenerationById(imageId);
      if (!image) {
        throw new Error(`Image not found: ${imageId}`);
      }

      // Skip if already completed
      if (image.status === "completed") {
        logger.info("Image already processed, skipping", { imageId });
        metadata.set("status", {
          step: "completed",
          label: "Already processed",
          progress: 100,
        } satisfies ProcessImageStatus);
        return { success: true, message: "Already processed" };
      }

      // Update status to processing
      await updateImageGeneration(imageId, { status: "processing" });

      // Step 2: Upload to Fal.ai storage
      metadata.set("status", {
        step: "uploading",
        label: "Preparing for AI…",
        progress: 25,
      } satisfies ProcessImageStatus);

      logger.info("Fetching original image", {
        imageId,
        originalImageUrl: image.originalImageUrl,
      });

      const imageResponse = await fetch(image.originalImageUrl);
      if (!imageResponse.ok) {
        throw new Error(
          `Failed to fetch original image: ${imageResponse.status}`
        );
      }

      const imageBlob = await imageResponse.blob();
      const falImageUrl = await fal.storage.upload(
        new File([imageBlob], "input.jpg", { type: imageBlob.type })
      );

      logger.info("Uploaded to Fal.ai storage", { falImageUrl });

      // Step 3: Call Fal.ai API
      metadata.set("status", {
        step: "processing",
        label: "Enhancing image…",
        progress: 50,
      } satisfies ProcessImageStatus);

      logger.info("Calling Fal.ai Nano Banana Pro", {
        imageId,
        prompt: image.prompt,
      });

      const result = (await fal.subscribe(NANO_BANANA_PRO_EDIT, {
        input: {
          prompt: image.prompt,
          image_urls: [falImageUrl],
          num_images: 1,
          output_format: "jpeg",
        },
      })) as unknown as NanoBananaProOutput;

      logger.info("Fal.ai result received", { result });

      // Check for result - handle both direct and wrapped response
      const output = (result as { data?: NanoBananaProOutput }).data || result;
      if (!output.images?.[0]?.url) {
        logger.error("No images in response", { result });
        throw new Error("No image returned from Fal.ai");
      }

      const resultImageUrl = output.images[0].url;
      const contentType = output.images[0].content_type || "image/jpeg";

      // Step 4: Save to Supabase
      metadata.set("status", {
        step: "saving",
        label: "Saving result…",
        progress: 80,
      } satisfies ProcessImageStatus);

      logger.info("Downloading result image", { resultImageUrl });

      const resultImageResponse = await fetch(resultImageUrl);
      if (!resultImageResponse.ok) {
        throw new Error("Failed to download result image");
      }

      const resultImageBuffer = await resultImageResponse.arrayBuffer();
      const extension = getExtensionFromContentType(contentType);

      const resultPath = getImagePath(
        image.workspaceId,
        image.projectId,
        `${imageId}.${extension}`,
        "result"
      );

      logger.info("Uploading to Supabase", { resultPath });

      const storedResultUrl = await uploadImage(
        new Uint8Array(resultImageBuffer),
        resultPath,
        contentType
      );

      // Update image record with result
      await updateImageGeneration(imageId, {
        status: "completed",
        resultImageUrl: storedResultUrl,
        errorMessage: null,
      });

      // Update project counts
      await updateProjectCounts(image.projectId);

      metadata.set("status", {
        step: "completed",
        label: "Complete",
        progress: 100,
      } satisfies ProcessImageStatus);

      logger.info("Image processing completed", {
        imageId,
        resultUrl: storedResultUrl,
      });

      return {
        success: true,
        resultUrl: storedResultUrl,
        imageId,
      };
    } catch (error) {
      logger.error("Image processing failed", {
        imageId,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      metadata.set("status", {
        step: "failed",
        label: "Processing failed",
        progress: 0,
      } satisfies ProcessImageStatus);

      // Update status to failed
      await updateImageGeneration(imageId, {
        status: "failed",
        errorMessage:
          error instanceof Error ? error.message : "Processing failed",
      });

      // Get image to update project counts
      const image = await getImageGenerationById(imageId);
      if (image) {
        await updateProjectCounts(image.projectId);
      }

      throw error;
    }
  },
});
