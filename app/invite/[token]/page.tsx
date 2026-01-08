import { notFound } from "next/navigation";
import { getInvitationByTokenAction } from "@/lib/actions/invitations";
import { InviteAcceptForm } from "./invite-accept-form";

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;

  const result = await getInvitationByTokenAction(token);

  if (!result.success) {
    notFound();
  }

  const { invitation, workspaceName, isExpired, isAccepted } = result.data;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <InviteAcceptForm
          email={invitation.email}
          isAccepted={isAccepted}
          isExpired={isExpired}
          token={token}
          workspaceName={workspaceName}
        />
      </div>
    </div>
  );
}
