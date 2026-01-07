import { notFound } from "next/navigation";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { requireSystemAdmin } from "@/lib/admin-auth";
import { getAdminUserDetail } from "@/lib/db/queries";
import { UserDetailContent } from "@/components/admin/user-detail-content";

interface AdminUserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminUserDetailPage({
  params,
}: AdminUserDetailPageProps) {
  await requireSystemAdmin();
  const { id } = await params;

  const userDetail = await getAdminUserDetail(id);
  if (!userDetail) {
    notFound();
  }

  return (
    <div className="space-y-6 px-4 md:px-6 lg:px-8">
      {/* Back Button */}
      <div className="animate-fade-in-up">
        <Link href="/admin/users">
          <Button variant="ghost" size="sm" className="gap-2">
            <IconArrowLeft className="h-4 w-4" />
            Back to Users
          </Button>
        </Link>
      </div>

      {/* User Detail Content */}
      <UserDetailContent user={userDetail} />
    </div>
  );
}
