"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconBuilding, IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { CreateWorkspaceDialog } from "@/components/admin/create-workspace-dialog";

export function WorkspacesPageHeader() {
  const router = useRouter();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl shadow-sm ring-1 ring-white/10"
            style={{ backgroundColor: "var(--accent-violet)" }}
          >
            <IconBuilding className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Workspaces</h1>
            <p className="text-sm text-muted-foreground">
              Manage and monitor all workspaces on the platform
            </p>
          </div>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="gap-2"
          style={{ backgroundColor: "var(--accent-green)" }}
        >
          <IconPlus className="h-4 w-4" />
          New Workspace
        </Button>
      </div>

      <CreateWorkspaceDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => router.refresh()}
      />
    </>
  );
}
