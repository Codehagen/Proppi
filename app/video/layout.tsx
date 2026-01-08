import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { auth } from "@/lib/auth";
import { getUserWithWorkspace } from "@/lib/db/queries";

export const metadata: Metadata = {
  title: "Videos | Proppi",
  description: "Create and manage property tour videos",
};

export default async function VideoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Validate session server-side
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  // Get user with workspace
  const data = await getUserWithWorkspace(session.user.id);

  // If no workspace or onboarding not completed, redirect to onboarding
  if (!(data && data.workspace.onboardingCompleted)) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader userLabel={session.user.email} />

      {/* Main content - full width with consistent padding */}
      <main className="w-full">{children}</main>
    </div>
  );
}
