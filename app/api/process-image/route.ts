import { type NextRequest, NextResponse } from "next/server";
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

export async function POST(request: NextRequest) {
  try {
    const { imageId } = await request.json();

    if (!imageId) {
      return NextResponse.json({ error: "Missing imageId" }, { status: 400 });
    }

    // Get image record from database
    const image = await getImageGenerationById(imageId);
    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Skip if already completed
    if (image.status === "completed") {
      return NextResponse.json({ success: true, message: "Already processed" });
    }

    // Update status to processing
    await updateImageGeneration(imageId, { status: "processing" });

    try {
      console.log("Processing image:", {
        imageId,
        originalImageUrl: image.originalImageUrl,
        prompt: image.prompt,
      });

      // Fetch image from Supabase and upload to Fal.ai storage
      // This ensures Fal.ai can access the image reliably
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

      console.log("Uploaded to Fal.ai storage:", falImageUrl);

      // Call Fal.ai Nano Banana Pro API with Fal.ai storage URL
      const result = (await fal.subscribe(NANO_BANANA_PRO_EDIT, {
        input: {
          prompt: image.prompt,
          image_urls: [falImageUrl], // Use Fal.ai storage URL
          num_images: 1,
          output_format: "jpeg",
        },
      })) as NanoBananaProOutput;

      console.log("Fal.ai result:", JSON.stringify(result, null, 2));

      // Check for result - handle both direct and wrapped response
      const output = (result as { data?: NanoBananaProOutput }).data || result;
      if (!output.images?.[0]?.url) {
        console.error("No images in response. Full result:", result);
        throw new Error("No image returned from Fal.ai");
      }

      const resultImageUrl = output.images[0].url;
      const contentType = output.images[0].content_type || "image/jpeg";

      // Download the result image and upload to Supabase
      const resultImageResponse = await fetch(resultImageUrl);
      if (!resultImageResponse.ok) {
        throw new Error("Failed to download result image");
      }

      const resultImageBuffer = await resultImageResponse.arrayBuffer();
      const extension = getExtensionFromContentType(contentType);

      // Upload to Supabase storage
      const resultPath = getImagePath(
        image.workspaceId,
        image.projectId,
        `${imageId}.${extension}`,
        "result"
      );
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

      return NextResponse.json({
        success: true,
        resultUrl: storedResultUrl,
      });
    } catch (processingError) {
      console.error("Image processing error:", processingError);

      // Update status to failed
      await updateImageGeneration(imageId, {
        status: "failed",
        errorMessage:
          processingError instanceof Error
            ? processingError.message
            : "Processing failed",
      });

      // Update project counts
      await updateProjectCounts(image.projectId);

      return NextResponse.json(
        {
          error: "Processing failed",
          details:
            processingError instanceof Error
              ? processingError.message
              : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({ status: "ok" });
}
