import { auth as triggerAuth } from "@trigger.dev/sdk/v3";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { runIds } = await request.json();

    if (!(runIds && Array.isArray(runIds)) || runIds.length === 0) {
      return NextResponse.json(
        { error: "runIds array is required" },
        { status: 400 }
      );
    }

    // Create a public access token with read access to specific runs
    const publicToken = await triggerAuth.createPublicToken({
      scopes: {
        read: {
          runs: runIds,
        },
      },
      expirationTime: "1h", // Token expires in 1 hour
    });

    return NextResponse.json({ token: publicToken });
  } catch (error) {
    console.error("Failed to create trigger token:", error);
    return NextResponse.json(
      { error: "Failed to create token" },
      { status: 500 }
    );
  }
}
