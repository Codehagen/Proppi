import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user, workspace } from "@/lib/db/schema";

export const metadata = {
  title: "Complete your profile | AI Studio",
  description: "Complete your profile to get started with AI Studio",
};

export default async function OnboardingPage() {
  // Get session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect to sign-in if not authenticated
  if (!session) {
    redirect("/sign-in");
  }

  // Get user with workspace
  const currentUser = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  if (!(currentUser.length && currentUser[0].workspaceId)) {
    // This shouldn't happen, but handle gracefully
    redirect("/sign-in");
  }

  // Get workspace
  const currentWorkspace = await db
    .select()
    .from(workspace)
    .where(eq(workspace.id, currentUser[0].workspaceId))
    .limit(1);

  if (!currentWorkspace.length) {
    redirect("/sign-in");
  }

  // If onboarding is already completed, redirect to dashboard
  if (currentWorkspace[0].onboardingCompleted) {
    redirect("/dashboard");
  }

  return (
    <OnboardingForm
      initialEmail={session.user.email}
      initialName={session.user.name}
      initialWorkspaceName={currentWorkspace[0].name}
    />
  );
}
