import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WorkspaceDetailContent } from "@/components/admin/workspace-detail-content";
import { Button } from "@/components/ui/button";
import { requireSystemAdmin } from "@/lib/admin-auth";
import { getAdminWorkspaceDetail } from "@/lib/db/queries";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminWorkspaceDetailPage({ params }: PageProps) {
  await requireSystemAdmin();
  const { id } = await params;

  const data = await getAdminWorkspaceDetail(id);

  if (!data) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center gap-4">
        <Button asChild size="sm" variant="ghost">
          <Link href="/admin/workspaces">
            <IconArrowLeft className="mr-2 h-4 w-4" />
            Back to Workspaces
          </Link>
        </Button>
      </div>

      <WorkspaceDetailContent workspace={data} />
    </div>
  );
}
