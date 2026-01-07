"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import {
  IconEdit,
  IconLoader2,
  IconCheck,
  IconBuilding,
  IconMail,
  IconUser,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Workspace, WorkspaceStatus, WorkspacePlan } from "@/lib/db/schema";
import {
  updateWorkspaceDetailsAction,
  updateWorkspaceStatusAction,
  updateWorkspacePlanAction,
} from "@/lib/actions/admin";

interface EditWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspace: Workspace;
  onSuccess?: () => void;
}

const statusOptions: { value: WorkspaceStatus; label: string; color: string }[] = [
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
  const [contactEmail, setContactEmail] = useState(workspace.contactEmail || "");
  const [contactPerson, setContactPerson] = useState(workspace.contactPerson || "");
  const [status, setStatus] = useState<WorkspaceStatus>(workspace.status as WorkspaceStatus);
  const [plan, setPlan] = useState<WorkspacePlan>(workspace.plan as WorkspacePlan);
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
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent size="default" className="overflow-hidden p-0">
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
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Success state */}
          {saved ? (
            <div className="animate-fade-in-up flex flex-col items-center gap-4 py-8 text-center">
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
                <p className="text-lg font-semibold">Workspace Updated!</p>
                <p className="text-sm text-muted-foreground">
                  Changes have been saved successfully
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Basic Info Section */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Basic Information
                </h4>

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="workspace-name" className="text-sm font-medium">
                    Workspace Name
                  </Label>
                  <div className="relative">
                    <IconBuilding className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="workspace-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Company Name"
                      className="pl-10"
                      required
                      disabled={isPending}
                    />
                  </div>
                </div>

                {/* Organization Number */}
                <div className="space-y-2">
                  <Label htmlFor="org-number" className="text-sm font-medium">
                    Organization Number
                  </Label>
                  <Input
                    id="org-number"
                    value={organizationNumber}
                    onChange={(e) => setOrganizationNumber(e.target.value)}
                    placeholder="123456789"
                    disabled={isPending}
                    className="font-mono"
                  />
                </div>

                {/* Contact Email */}
                <div className="space-y-2">
                  <Label htmlFor="contact-email" className="text-sm font-medium">
                    Contact Email
                  </Label>
                  <div className="relative">
                    <IconMail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="contact-email"
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="contact@company.com"
                      className="pl-10"
                      disabled={isPending}
                    />
                  </div>
                </div>

                {/* Contact Person */}
                <div className="space-y-2">
                  <Label htmlFor="contact-person" className="text-sm font-medium">
                    Contact Person
                  </Label>
                  <div className="relative">
                    <IconUser className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="contact-person"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="John Doe"
                      className="pl-10"
                      disabled={isPending}
                    />
                  </div>
                </div>
              </div>

              {/* Status & Plan Section */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Status & Plan
                </h4>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Status */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Status</Label>
                    <Select
                      value={status}
                      onValueChange={(value) => setStatus(value as WorkspaceStatus)}
                      disabled={isPending}
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
                    <Label className="text-sm font-medium">Plan</Label>
                    <Select
                      value={plan}
                      onValueChange={(value) => setPlan(value as WorkspacePlan)}
                      disabled={isPending}
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
                    <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                      <IconAlertTriangle className="h-4 w-4" />
                      Suspension Details
                    </div>
                    <Textarea
                      value={suspendedReason}
                      onChange={(e) => setSuspendedReason(e.target.value)}
                      placeholder="Reason for suspension (visible to workspace owner)..."
                      rows={3}
                      disabled={isPending}
                      className="resize-none"
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
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!name.trim() || !hasChanges || isPending}
              className="min-w-[120px] gap-2"
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
