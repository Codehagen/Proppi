"use client";

import { IconEyeOff, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useImpersonation } from "@/hooks/use-impersonation";

export function ImpersonationBanner() {
  const { isImpersonating, targetUser, endImpersonation } = useImpersonation();

  if (!(isImpersonating && targetUser)) {
    return null;
  }

  return (
    <div className="sticky top-0 z-[60] flex animate-fade-in-down items-center justify-between gap-4 border-amber-500/30 border-b bg-amber-400 px-4 py-2 dark:bg-amber-500">
      <div className="flex items-center gap-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-600/20">
          <IconEyeOff className="size-4 text-amber-900" />
        </div>
        <div className="font-medium text-amber-950 text-sm">
          <span className="hidden sm:inline">Viewing as </span>
          <span className="font-semibold">{targetUser.name}</span>
          <span className="hidden text-amber-900/80 md:inline">
            {" "}
            ({targetUser.email})
          </span>
          <span className="hidden text-amber-900/70 lg:inline">
            {" "}
            &middot; {targetUser.workspaceName}
          </span>
        </div>
      </div>

      <Button
        className="h-7 gap-1.5 bg-amber-500/30 text-amber-950 hover:bg-amber-500/50 hover:text-amber-950"
        onClick={endImpersonation}
        size="sm"
        variant="ghost"
      >
        <IconX className="size-3.5" />
        <span className="hidden sm:inline">Exit</span>
      </Button>
    </div>
  );
}
