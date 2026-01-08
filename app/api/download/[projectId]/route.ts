import archiver from "archiver";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getImageGenerationById,
  getLatestVersionImages,
  getProjectById,
} from "@/lib/db/queries";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    // Verify authentication
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;

    // Check for specific image IDs in query params
    const { searchParams } = new URL(request.url);
    const imageIdsParam = searchParams.get("imageIds");
    const selectedImageIds = imageIdsParam
      ? imageIdsParam.split(",").filter(Boolean)
      : null;

    // Get project
    const projectData = await getProjectById(projectId);
    if (!projectData) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Get images - either specific ones or all latest versions
    let images;
    if (selectedImageIds && selectedImageIds.length > 0) {
      // Fetch specific images by ID
      const imagePromises = selectedImageIds.map((id) =>
        getImageGenerationById(id)
      );
      const fetchedImages = await Promise.all(imagePromises);
      images = fetchedImages.filter(
        (img) => img !== null && img.projectId === projectId
      );
    } else {
      // Get latest version of each image
      images = await getLatestVersionImages(projectId);
    }

    if (images.length === 0) {
      return NextResponse.json(
        { error: "No images to download" },
        { status: 404 }
      );
    }

    // Create a readable stream for the ZIP
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    // Create archiver instance
    const archive = archiver("zip", { zlib: { level: 5 } });

    // Pipe archiver output to our writable stream
    archive.on("data", (chunk) => writer.write(chunk));
    archive.on("end", () => writer.close());
    archive.on("error", (err) => {
      console.error("Archive error:", err);
      writer.abort(err);
    });

    // Add images to archive (async)
    (async () => {
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const imageUrl = image.resultImageUrl || image.originalImageUrl;
        if (!imageUrl) continue;

        try {
          const response = await fetch(imageUrl);
          if (!response.ok) {
            console.error(
              `Failed to fetch image ${image.id}: ${response.status}`
            );
            continue;
          }

          const buffer = await response.arrayBuffer();

          // Get filename from metadata or generate one
          const metadata = image.metadata as {
            originalFileName?: string;
          } | null;
          const originalName = metadata?.originalFileName || `image-${i + 1}`;
          const extension = imageUrl.split(".").pop()?.split("?")[0] || "jpg";

          // Create filename with index for ordering
          const paddedIndex = String(i + 1).padStart(3, "0");
          const baseName = originalName.replace(/\.[^/.]+$/, ""); // Remove extension if present
          const fileName = `${paddedIndex}-${baseName}.${extension}`;

          archive.append(Buffer.from(buffer), { name: fileName });
        } catch (err) {
          console.error(`Error processing image ${image.id}:`, err);
        }
      }

      // Finalize the archive
      archive.finalize();
    })();

    // Create safe filename for the ZIP
    const projectName = projectData.project.name
      .replace(/[^a-zA-Z0-9-_\s]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase();
    const date = new Date().toISOString().split("T")[0];
    const zipFileName = `${projectName}-${date}.zip`;

    return new NextResponse(readable, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${zipFileName}"`,
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
