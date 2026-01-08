import { logger, metadata, task } from "@trigger.dev/sdk/v3";
import sharp from "sharp";
import {
  createImageGeneration,
  deleteVersionsAfter,
  getImageGenerationById,
  updateProjectCounts,
} from "@/lib/db/queries";
import {
  FLUX_FILL_PRO,
  type FluxFillOutput,
  fal,
  NANO_BANANA_PRO_EDIT,
  type NanoBananaProOutput,
} from "@/lib/fal";
import {
  getExtensionFromContentType,
  getImagePath,
  uploadImage,
} from "@/lib/supabase";

export type EditMode = "remove" | "add";

export interface InpaintImagePayload {
  imageId: string;
  maskDataUrl?: string;
  prompt: string;
  mode: EditMode;
  replaceNewerVersions?: boolean;
}

export interface InpaintImageStatus {
  step:
    | "fetching"
    | "preparing"
    | "processing"
    | "saving"
    | "completed"
    | "failed";
  label: string;
  progress?: number;
}

export const inpaintImageTask = task({
  id: "inpaint-image",
  maxDuration: 300, // 5 minutes
  retry: {
    maxAttempts: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 10_000,
    factor: 2,
  },
  run: async (payload: InpaintImagePayload) => {
    const {
      imageId,
      maskDataUrl,
      prompt,
      mode = "remove",
      replaceNewerVersions = false,
    } = payload;

    try {
      // Step 1: Fetch image record
      metadata.set("status", {
        step: "fetching",
        label: "Loading image…",
        progress: 10,
      } satisfies InpaintImageStatus);

      logger.info("Fetching image record for inpainting", { imageId, mode });

      const image = await getImageGenerationById(imageId);
      if (!image) {
        throw new Error(`Image not found: ${imageId}`);
      }

      // Use the result image if available, otherwise use original
      const sourceImageUrl = image.resultImageUrl || image.originalImageUrl;

      // Step 2: Prepare images
      metadata.set("status", {
        step: "preparing",
        label: mode === "remove" ? "Processing mask…" : "Preparing edit…",
        progress: 25,
      } satisfies InpaintImageStatus);

      logger.info("Fetching source image", { sourceImageUrl });

      const imageResponse = await fetch(sourceImageUrl);
      if (!imageResponse.ok) {
        throw new Error(
          `Failed to fetch source image: ${imageResponse.status}`
        );
      }

      const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
      const imageMetadata = await sharp(imageBuffer).metadata();
      const imageWidth = imageMetadata.width!;
      const imageHeight = imageMetadata.height!;

      logger.info("Source image dimensions", {
        width: imageWidth,
        height: imageHeight,
      });

      // Upload source image to Fal.ai storage
      const imageBlob = new Blob([imageBuffer], {
        type: imageResponse.headers.get("content-type") || "image/jpeg",
      });
      const falImageUrl = await fal.storage.upload(
        new File([imageBlob], "input.jpg", { type: imageBlob.type })
      );

      logger.info("Uploaded image to Fal.ai storage", { falImageUrl });

      let resultImageUrl: string;
      let contentType: string;

      // Step 3: Process with AI
      metadata.set("status", {
        step: "processing",
        label:
          mode === "remove" ? "Removing selected area…" : "Generating edit…",
        progress: 50,
      } satisfies InpaintImageStatus);

      if (mode === "remove") {
        // REMOVE MODE: Use FLUX Fill Pro (inpainting)
        if (!maskDataUrl) {
          throw new Error("Mask is required for remove mode");
        }

        // Convert base64 mask data URL to buffer
        const maskBase64 = maskDataUrl.split(",")[1];
        const maskBuffer = Buffer.from(maskBase64, "base64");

        // Resize mask to match source image dimensions
        const resizedMaskBuffer = await sharp(maskBuffer)
          .resize(imageWidth, imageHeight, { fit: "fill" })
          .png()
          .toBuffer();

        logger.info("Resized mask to match source image dimensions");

        // Upload resized mask to Fal.ai storage
        const maskBlob = new Blob([new Uint8Array(resizedMaskBuffer)], {
          type: "image/png",
        });
        const falMaskUrl = await fal.storage.upload(
          new File([maskBlob], "mask.png", { type: "image/png" })
        );

        logger.info("Uploaded mask to Fal.ai storage", { falMaskUrl });

        // Call FLUX Fill Pro API
        const result = (await fal.subscribe(FLUX_FILL_PRO, {
          input: {
            image_url: falImageUrl,
            mask_url: falMaskUrl,
            prompt,
            output_format: "jpeg",
          },
        })) as unknown as FluxFillOutput;

        logger.info("FLUX Fill result received");

        // Check for result - handle both direct and wrapped response
        const output = (result as { data?: FluxFillOutput }).data || result;
        if (!output.images?.[0]?.url) {
          logger.error("No images in response", { result });
          throw new Error("No image returned from FLUX Fill");
        }

        resultImageUrl = output.images[0].url;
        contentType = output.images[0].content_type || "image/jpeg";
      } else {
        // ADD MODE: Use Nano Banana Pro (image-to-image)
        logger.info("Using Nano Banana Pro for add mode");

        const result = (await fal.subscribe(NANO_BANANA_PRO_EDIT, {
          input: {
            prompt,
            image_urls: [falImageUrl],
            num_images: 1,
            output_format: "jpeg",
          },
        })) as unknown as NanoBananaProOutput;

        logger.info("Nano Banana result received");

        // Check for result - handle both direct and wrapped response
        const output =
          (result as { data?: NanoBananaProOutput }).data || result;
        if (!output.images?.[0]?.url) {
          logger.error("No images in response", { result });
          throw new Error("No image returned from Nano Banana");
        }

        resultImageUrl = output.images[0].url;
        contentType = output.images[0].content_type || "image/jpeg";
      }

      // Step 4: Save result
      metadata.set("status", {
        step: "saving",
        label: "Saving new version…",
        progress: 80,
      } satisfies InpaintImageStatus);

      logger.info("Downloading result image", { resultImageUrl });

      const resultImageResponse = await fetch(resultImageUrl);
      if (!resultImageResponse.ok) {
        throw new Error("Failed to download result image");
      }

      const resultImageBuffer = await resultImageResponse.arrayBuffer();
      const extension = getExtensionFromContentType(contentType);

      // Upload to Supabase storage with unique name for new version
      const newImageId = crypto.randomUUID();
      const resultPath = getImagePath(
        image.workspaceId,
        image.projectId,
        `${newImageId}.${extension}`,
        "result"
      );

      logger.info("Uploading to Supabase", { resultPath });

      const storedResultUrl = await uploadImage(
        new Uint8Array(resultImageBuffer),
        resultPath,
        contentType
      );

      // Calculate version info
      const rootImageId = image.parentId || image.id;
      const currentVersion = image.version || 1;

      // If replacing newer versions, delete them first
      if (replaceNewerVersions) {
        const deletedCount = await deleteVersionsAfter(
          rootImageId,
          currentVersion
        );
        if (deletedCount > 0) {
          logger.info(
            `Deleted ${deletedCount} newer version(s) before creating new edit`
          );
        }
      }

      const newVersion = currentVersion + 1;

      // Create new image record as a new version
      const newImage = await createImageGeneration({
        workspaceId: image.workspaceId,
        userId: image.userId,
        projectId: image.projectId,
        originalImageUrl: image.originalImageUrl,
        resultImageUrl: storedResultUrl,
        prompt,
        version: newVersion,
        parentId: rootImageId,
        status: "completed",
        errorMessage: null,
        metadata: {
          editedFrom: image.id,
          editedAt: new Date().toISOString(),
          editMode: mode,
          model: mode === "remove" ? "flux-fill-pro" : "nano-banana-pro",
        },
      });

      // Update project counts
      await updateProjectCounts(image.projectId);

      metadata.set("status", {
        step: "completed",
        label: "Complete",
        progress: 100,
      } satisfies InpaintImageStatus);

      logger.info("Inpainting completed", {
        imageId,
        newImageId: newImage.id,
        version: newVersion,
      });

      return {
        success: true,
        resultUrl: storedResultUrl,
        newImageId: newImage.id,
        version: newVersion,
      };
    } catch (error) {
      logger.error("Inpainting failed", {
        imageId,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      metadata.set("status", {
        step: "failed",
        label: "Edit failed",
        progress: 0,
      } satisfies InpaintImageStatus);

      throw error;
    }
  },
});
