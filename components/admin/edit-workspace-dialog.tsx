"use client";

import {
  IconAlertTriangle,
  IconBuilding,
  IconCheck,
  IconEdit,
  IconLoader2,
  IconMail,
  IconUser,
} from "@tabler/icons-react";
import * as React from "react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  updateWorkspaceDetailsAction,
  updateWorkspacePlanAction,
  updateWorkspaceStatusAction,
} from "@/lib/actions/admin";
import type {
  Workspace,
  WorkspacePlan,
  WorkspaceStatus,
} from "@/lib/db/schema";
import { cn } from "@/lib/utils";

interface EditWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspace: Workspace;
  onSuccess?: () => void;
}

const statusOptions: {
  value: WorkspaceStatus;
  label: string;
  color: string;
}[] = [
  { value: "active", label: "Active", color: "var(--accent-green)" },
  { value: "trial", label: "Trial", color: "var(--accent-amber)" },
  { value: "suspended", label: "Suspended", color: "var(--accent-red)" },
];

const planOptions: { value: WorkspacePlan; label: string }[] = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "enterprise", label: "Enterprise" },
];

export function EditWorkspaceDialog({
  open,
  onOpenChange,
  workspace,
  onSuccess,
}: EditWorkspaceDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  // Form state
  const [name, setName] = useState(workspace.name);
  const [organizationNumber, setOrganizationNumber] = useState(
    workspace.organizationNumber || ""
  );
  const [contactEmail, setContactEmail] = useState(
    workspace.contactEmail || ""
  );
  const [contactPerson, setContactPerson] = useState(
    workspace.contactPerson || ""
  );
  const [status, setStatus] = useState<WorkspaceStatus>(
    workspace.status as WorkspaceStatus
  );
  const [plan, setPlan] = useState<WorkspacePlan>(
    workspace.plan as WorkspacePlan
  );
  const [suspendedReason, setSuspendedReason] = useState(
    workspace.suspendedReason || ""
  );

  // Reset form when workspace changes
  React.useEffect(() => {
    setName(workspace.name);
    setOrganizationNumber(workspace.organizationNumber || "");
    setContactEmail(workspace.contactEmail || "");
    setContactPerson(workspace.contactPerson || "");
    setStatus(workspace.status as WorkspaceStatus);
    setPlan(workspace.plan as WorkspacePlan);
    setSuspendedReason(workspace.suspendedReason || "");
  }, [workspace]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    startTransition(async () => {
      try {
        // Track what changed
        const detailsChanged =
          name !== workspace.name ||
          organizationNumber !== (workspace.organizationNumber || "") ||
          contactEmail !== (workspace.contactEmail || "") ||
          contactPerson !== (workspace.contactPerson || "");

        const statusChanged = status !== workspace.status;
        const planChanged = plan !== workspace.plan;

        // Update details if changed
        if (detailsChanged) {
          const result = await updateWorkspaceDetailsAction(workspace.id, {
            name: name.trim(),
            organizationNumber: organizationNumber.trim() || undefined,
            contactEmail: contactEmail.trim() || undefined,
            contactPerson: contactPerson.trim() || undefined,
          });
          if (!result.success) {
            toast.error(result.error);
            return;
          }
        }

        // Update status if changed
        if (statusChanged) {
          const result = await updateWorkspaceStatusAction(
            workspace.id,
            status,
            status === "suspended" ? suspendedReason.trim() : undefined
          );
          if (!result.success) {
            toast.error(result.error);
            return;
          }
        }

        // Update plan if changed
        if (planChanged) {
          const result = await updateWorkspacePlanAction(workspace.id, plan);
          if (!result.success) {
            toast.error(result.error);
            return;
          }
        }

        setSaved(true);
        toast.success("Workspace updated successfully");

        // Close after showing success
        setTimeout(() => {
          setSaved(false);
          onOpenChange(false);
          onSuccess?.();
        }, 1000);
      } catch {
        toast.error("Failed to update workspace");
      }
    });
  };

  const handleClose = () => {
    if (!isPending) {
      // Reset to original values
      setName(workspace.name);
      setOrganizationNumber(workspace.organizationNumber || "");
      setContactEmail(workspace.contactEmail || "");
      setContactPerson(workspace.contactPerson || "");
      setStatus(workspace.status as WorkspaceStatus);
      setPlan(workspace.plan as WorkspacePlan);
      setSuspendedReason(workspace.suspendedReason || "");
      setSaved(false);
      onOpenChange(false);
    }
  };

  const hasChanges =
    name !== workspace.name ||
    organizationNumber !== (workspace.organizationNumber || "") ||
    contactEmail !== (workspace.contactEmail || "") ||
    contactPerson !== (workspace.contactPerson || "") ||
    status !== workspace.status ||
    plan !== workspace.plan ||
    (status === "suspended" &&
      suspendedReason !== (workspace.suspendedReason || ""));

  return (
    <Dialog onOpenChange={handleClose} open={open}>
      <DialogContent className="overflow-hidden p-0" size="default">
        {/* Header */}
        <div className="border-b px-6 py-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{
                  backgroundColor:
                    "color-mix(in oklch, var(--accent-violet) 15%, transparent)",
                }}
              >
                <IconEdit
                  className="h-4 w-4"
                  style={{ color: "var(--accent-violet)" }}
                />
              </div>
              Edit Workspace
            </DialogTitle>
            <DialogDescription>
              Update workspace details and settings
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content */}
        <form className="space-y-6 p-6" onSubmit={handleSubmit}>
          {/* Success state */}
          {saved ? (
            <div className="flex animate-fade-in-up flex-col items-center gap-4 py-8 text-center">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full"
                style={{
                  backgroundColor:
                    "color-mix(in oklch, var(--accent-green) 15%, transparent)",
                }}
              >
                <IconCheck
                  className="h-8 w-8"
                  style={{ color: "var(--accent-green)" }}
                />
              </div>
              <div>
                <p className="font-semibold text-lg">Workspace Updated!</p>
                <p className="text-muted-foreground text-sm">
                  Changes have been saved successfully
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Basic Info Section */}
              <div className="space-y-4">
                <h4 className="font-medium text-[11px] text-muted-foreground uppercase tracking-wider">
                  Basic Information
                </h4>

                {/* Name */}
                <div className="space-y-2">
                  <Label
                    className="font-medium text-sm"
                    htmlFor="workspace-name"
                  >
                    Workspace Name
                  </Label>
                  <div className="relative">
                    <IconBuilding className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-10"
                      disabled={isPending}
                      id="workspace-name"
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Company Name"
                      required
                      value={name}
                    />
                  </div>
                </div>

                {/* Organization Number */}
                <div className="space-y-2">
                  <Label className="font-medium text-sm" htmlFor="org-number">
                    Organization Number
                  </Label>
                  <Input
                    className="font-mono"
                    disabled={isPending}
                    id="org-number"
                    onChange={(e) => setOrganizationNumber(e.target.value)}
                    placeholder="123456789"
                    value={organizationNumber}
                  />
                </div>

                {/* Contact Email */}
                <div className="space-y-2">
                  <Label
                    className="font-medium text-sm"
                    htmlFor="contact-email"
                  >
                    Contact Email
                  </Label>
                  <div className="relative">
                    <IconMail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-10"
                      disabled={isPending}
                      id="contact-email"
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="contact@company.com"
                      type="email"
                      value={contactEmail}
                    />
                  </div>
                </div>

                {/* Contact Person */}
                <div className="space-y-2">
                  <Label
                    className="font-medium text-sm"
                    htmlFor="contact-person"
                  >
                    Contact Person
                  </Label>
                  <div className="relative">
                    <IconUser className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-10"
                      disabled={isPending}
                      id="contact-person"
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="John Doe"
                      value={contactPerson}
                    />
                  </div>
                </div>
              </div>

              {/* Status & Plan Section */}
              <div className="space-y-4">
                <h4 className="font-medium text-[11px] text-muted-foreground uppercase tracking-wider">
                  Status & Plan
                </h4>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Status */}
                  <div className="space-y-2">
                    <Label className="font-medium text-sm">Status</Label>
                    <Select
                      disabled={isPending}
                      onValueChange={(value) =>
                        setStatus(value as WorkspaceStatus)
                      }
                      value={status}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <span className="flex items-center gap-2">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: option.color }}
                              />
                              {option.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Plan */}
                  <div className="space-y-2">
                    <Label className="font-medium text-sm">Plan</Label>
                    <Select
                      disabled={isPending}
                      onValueChange={(value) => setPlan(value as WorkspacePlan)}
                      value={plan}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {planOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Suspension Reason (only shown when suspended) */}
                {status === "suspended" && (
                  <div
                    className={cn(
                      "space-y-2 rounded-lg border border-destructive/20 bg-destructive/5 p-4",
                      "animate-fade-in-up"
                    )}
                  >
                    <div className="flex items-center gap-2 font-medium text-destructive text-sm">
                      <IconAlertTriangle className="h-4 w-4" />
                      Suspension Details
                    </div>
                    <Textarea
                      className="resize-none"
                      disabled={isPending}
                      onChange={(e) => setSuspendedReason(e.target.value)}
                      placeholder="Reason for suspension (visible to workspace owner)..."
                      rows={3}
                      value={suspendedReason}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </form>

        {/* Footer */}
        {!saved && (
          <div className="flex items-center justify-end gap-3 border-t bg-muted/30 px-6 py-4">
            <Button
              disabled={isPending}
              onClick={handleClose}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              className="min-w-[120px] gap-2"
              disabled={!(name.trim() && hasChanges) || isPending}
              onClick={handleSubmit}
              style={{ backgroundColor: "var(--accent-violet)" }}
            >
              {isPending ? (
                <>
                  <IconLoader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <IconCheck className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
