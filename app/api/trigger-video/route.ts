import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { triggerVideoGeneration } from "@/lib/actions/video";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { videoProjectId } = await request.json();

    if (!videoProjectId) {
      return NextResponse.json(
        { error: "videoProjectId is required" },
        { status: 400 }
      );
    }

    const result = await triggerVideoGeneration(videoProjectId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to trigger video generation:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to trigger video",
      },
      { status: 500 }
    );
  }
}
