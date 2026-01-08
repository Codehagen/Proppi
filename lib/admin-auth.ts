import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";

/**
 * Verify that the current user is a system admin.
 * Redirects to sign-in if not authenticated, or to dashboard if not an admin.
 * Use this in server components (layouts, pages) that require admin access.
 */
export async function requireSystemAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in?callbackUrl=/admin");
  }

  const [currentUser] = await db
    .select({ isSystemAdmin: user.isSystemAdmin, id: user.id })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  if (!currentUser?.isSystemAdmin) {
    redirect("/dashboard");
  }

  return { session, userId: currentUser.id };
}

/**
 * Check if the current user is a system admin without redirecting.
 * Returns the user data if admin, null otherwise.
 * Use this in server actions where you need to return an error instead of redirecting.
 */
export async function verifySystemAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: "Unauthorized", user: null };
  }

  const [currentUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  if (!currentUser?.isSystemAdmin) {
    return { error: "Forbidden: System admin access required", user: null };
  }

  return { error: null, user: currentUser, session };
}
