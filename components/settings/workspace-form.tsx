"use client";

import {
  IconBuilding,
  IconDeviceFloppy,
  IconHash,
  IconLoader2,
  IconMail,
  IconUpload,
  IconUser,
} from "@tabler/icons-react";
import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  updateWorkspaceSettings,
  type WorkspaceActionResult,
} from "@/lib/actions";
import type { Workspace } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

interface WorkspaceFormProps {
  workspace: Workspace;
}

type FormState = WorkspaceActionResult | null;

export function WorkspaceForm({ workspace }: WorkspaceFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const lastResultRef = useRef<FormState>(null);

  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    async (_prevState, formData) => {
      const name = formData.get("name") as string;

      // Client-side validation
      if (!name.trim()) {
        return { success: false, error: "Workspace name is required" };
      }

      const result = await updateWorkspaceSettings(formData);
      return result;
    },
    null
  );

  // Show toast when state changes (only once per state change)
  useEffect(() => {
    if (state && state !== lastResultRef.current) {
      if (state.success) {
        toast.success("Changes saved successfully");
      } else if (state.error) {
        toast.error(state.error);
      }
      lastResultRef.current = state;
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-6" ref={formRef}>
      {/* Logo upload */}
      <div className="space-y-2">
        <Label className="font-medium text-sm">Workspace Logo</Label>
        <div className="flex items-center gap-4">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-xl bg-muted ring-1 ring-foreground/5"
            style={{
              background: workspace.logo
                ? `url(${workspace.logo}) center/cover`
                : "linear-gradient(135deg, color-mix(in oklch, var(--accent-teal) 20%, transparent) 0%, color-mix(in oklch, var(--accent-teal) 5%, transparent) 100%)",
            }}
          >
            {!workspace.logo && (
              <IconBuilding
                className="h-8 w-8"
                style={{ color: "var(--accent-teal)" }}
              />
            )}
          </div>
          <div className="space-y-1">
            <Button className="gap-2" size="sm" type="button" variant="outline">
              <IconUpload className="h-4 w-4" />
              Upload Logo
            </Button>
            <p className="text-muted-foreground text-xs">
              PNG, JPG up to 2MB. Recommended 200x200px.
            </p>
          </div>
        </div>
      </div>

      {/* Form fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Workspace Name */}
        <div className="space-y-2">
          <Label className="font-medium text-sm" htmlFor="workspace-name">
            Workspace Name
          </Label>
          <div className="relative">
            <IconBuilding className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10"
              defaultValue={workspace.name}
              disabled={isPending}
              id="workspace-name"
              name="name"
              placeholder="Your company name"
            />
          </div>
        </div>

        {/* Organization Number */}
        <div className="space-y-2">
          <Label className="font-medium text-sm" htmlFor="org-number">
            Organization Number
          </Label>
          <div className="relative">
            <IconHash className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10"
              defaultValue={workspace.organizationNumber || ""}
              disabled={isPending}
              id="org-number"
              name="organizationNumber"
              placeholder="123456789"
            />
          </div>
        </div>

        {/* Contact Email */}
        <div className="space-y-2">
          <Label className="font-medium text-sm" htmlFor="contact-email">
            Contact Email
          </Label>
          <div className="relative">
            <IconMail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10"
              defaultValue={workspace.contactEmail || ""}
              disabled={isPending}
              id="contact-email"
              name="contactEmail"
              placeholder="contact@company.com"
              type="email"
            />
          </div>
        </div>

        {/* Contact Person */}
        <div className="space-y-2">
          <Label className="font-medium text-sm" htmlFor="contact-person">
            Contact Person
          </Label>
          <div className="relative">
            <IconUser className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10"
              defaultValue={workspace.contactPerson || ""}
              disabled={isPending}
              id="contact-person"
              name="contactPerson"
              placeholder="Full name"
            />
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="flex items-center justify-end border-t pt-4">
        <Button
          className={cn("gap-2 shadow-sm transition-all")}
          disabled={isPending}
          style={{
            backgroundColor: "var(--accent-teal)",
          }}
          type="submit"
        >
          {isPending ? (
            <>
              <IconLoader2 className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <IconDeviceFloppy className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
