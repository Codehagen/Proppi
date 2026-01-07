"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import {
  IconPlus,
  IconLoader2,
  IconCheck,
  IconBuilding,
  IconMail,
  IconCopy,
  IconLink,
} from "@tabler/icons-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { WorkspacePlan } from "@/lib/db/schema";
import { createWorkspaceWithInviteAction } from "@/lib/actions/invitations";

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const planOptions: {
  value: WorkspacePlan;
  label: string;
  description: string;
}[] = [
  {
    value: "free",
    label: "Free",
    description: "Basic features for small teams",
  },
  {
    value: "pro",
    label: "Pro",
    description: "Advanced features and priority support",
  },
  {
    value: "enterprise",
    label: "Enterprise",
    description: "Custom solutions for large organizations",
  },
];

export function CreateWorkspaceDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateWorkspaceDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [createdEmail, setCreatedEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState<WorkspacePlan>("free");

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success("Invite link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    startTransition(async () => {
      const result = await createWorkspaceWithInviteAction(
        name.trim(),
        email.trim(),
        plan
      );

      if (result.success) {
        setCreatedEmail(email);
        setInviteLink(result.data.inviteLink);
        setSent(true);
        toast.success(`Workspace created and invitation sent to ${email}`);
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleDone = () => {
    setSent(false);
    setName("");
    setEmail("");
    setPlan("free");
    setCreatedEmail("");
    setInviteLink("");
    setCopied(false);
    onOpenChange(false);
    onSuccess?.();
  };

  const handleClose = () => {
    if (!isPending && !sent) {
      setName("");
      setEmail("");
      setPlan("free");
      setSent(false);
      setCreatedEmail("");
      setInviteLink("");
      setCopied(false);
      onOpenChange(false);
    }
  };

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
                    "color-mix(in oklch, var(--accent-green) 15%, transparent)",
                }}
              >
                <IconPlus
                  className="h-4 w-4"
                  style={{ color: "var(--accent-green)" }}
                />
              </div>
              New Workspace
            </DialogTitle>
            <DialogDescription>
              Create a workspace and send an invitation to the owner
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Success state */}
          {sent ? (
            <div className="animate-fade-in-up flex flex-col items-center gap-4 py-6 text-center">
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
                <p className="text-lg font-semibold">Workspace Created!</p>
                <p className="text-sm text-muted-foreground">
                  Invitation sent to {createdEmail}
                </p>
              </div>

              {/* Invite Link Copy Section */}
              <div className="w-full space-y-2 rounded-lg bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <IconLink className="h-4 w-4 text-muted-foreground" />
                  Invite Link
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 truncate rounded bg-background px-2 py-1.5 text-xs">
                    {inviteLink}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyLink}
                    className="shrink-0 gap-1.5"
                  >
                    {copied ? (
                      <>
                        <IconCheck className="h-3.5 w-3.5" />
                        Copied
                      </>
                    ) : (
                      <>
                        <IconCopy className="h-3.5 w-3.5" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Share this link if the email doesn&apos;t arrive
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Workspace Name */}
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
                    placeholder="Acme Real Estate"
                    className="pl-10"
                    required
                    disabled={isPending}
                  />
                </div>
              </div>

              {/* Owner Email */}
              <div className="space-y-2">
                <Label htmlFor="owner-email" className="text-sm font-medium">
                  Owner Email
                </Label>
                <div className="relative">
                  <IconMail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="owner-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@company.com"
                    className="pl-10"
                    required
                    disabled={isPending}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  An invitation will be sent to this email address
                </p>
              </div>

              {/* Plan Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Plan</Label>
                <div className="grid gap-3">
                  {planOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setPlan(option.value)}
                      disabled={isPending}
                      className={cn(
                        "flex items-start gap-3 rounded-xl p-4 text-left ring-2 transition-all duration-200",
                        plan === option.value
                          ? "ring-[var(--accent-green)] bg-[var(--accent-green)]/5"
                          : "ring-foreground/5 hover:ring-foreground/10 hover:bg-muted/30"
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">
                            {option.label}
                          </p>
                          {plan === option.value && (
                            <IconCheck
                              className="h-4 w-4"
                              style={{ color: "var(--accent-green)" }}
                            />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t bg-muted/30 px-6 py-4">
          {sent ? (
            <Button
              onClick={handleDone}
              className="min-w-[100px] gap-2"
              style={{ backgroundColor: "var(--accent-green)" }}
            >
              <IconCheck className="h-4 w-4" />
              Done
            </Button>
          ) : (
            <>
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
                disabled={!name.trim() || !email.trim() || isPending}
                className="min-w-[160px] gap-2"
                style={{ backgroundColor: "var(--accent-green)" }}
              >
                {isPending ? (
                  <>
                    <IconLoader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <IconPlus className="h-4 w-4" />
                    Create & Send Invite
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
