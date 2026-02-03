"use client";

import {
  IconBuilding,
  IconCheck,
  IconCopy,
  IconLink,
  IconLoader2,
  IconMail,
  IconPlus,
  IconReceipt,
} from "@tabler/icons-react";
import type * as React from "react";
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
import { Switch } from "@/components/ui/switch";
import { createWorkspaceWithInviteAction } from "@/lib/actions/invitations";
import type { WorkspacePlan } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

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

  // B2B state
  const [invoiceEligible, setInvoiceEligible] = useState(false);
  const [organizationNumber, setOrganizationNumber] = useState("");
  const [orgNumberError, setOrgNumberError] = useState("");

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
    if (!(name.trim() && email.trim())) {
      return;
    }

    // Validate B2B fields
    if (invoiceEligible) {
      if (!organizationNumber.trim()) {
        setOrgNumberError("Organization number is required for B2B billing");
        return;
      }
      if (!/^\d{9}$/.test(organizationNumber.trim())) {
        setOrgNumberError("Organization number must be exactly 9 digits");
        return;
      }
    }
    setOrgNumberError("");

    startTransition(async () => {
      const result = await createWorkspaceWithInviteAction(
        name.trim(),
        email.trim(),
        plan,
        true,
        invoiceEligible
          ? {
              invoiceEligible: true,
              organizationNumber: organizationNumber.trim(),
            }
          : undefined
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
    setInvoiceEligible(false);
    setOrganizationNumber("");
    setOrgNumberError("");
    setCreatedEmail("");
    setInviteLink("");
    setCopied(false);
    onOpenChange(false);
    onSuccess?.();
  };

  const handleClose = () => {
    if (!(isPending || sent)) {
      setName("");
      setEmail("");
      setPlan("free");
      setInvoiceEligible(false);
      setOrganizationNumber("");
      setOrgNumberError("");
      setSent(false);
      setCreatedEmail("");
      setInviteLink("");
      setCopied(false);
      onOpenChange(false);
    }
  };

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
        <form className="space-y-6 p-6" onSubmit={handleSubmit}>
          {/* Success state */}
          {sent ? (
            <div className="flex animate-fade-in-up flex-col items-center gap-4 py-6 text-center">
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
                <p className="font-semibold text-lg">Workspace Created!</p>
                <p className="text-muted-foreground text-sm">
                  Invitation sent to {createdEmail}
                </p>
              </div>

              {/* Invite Link Copy Section */}
              <div className="w-full space-y-2 rounded-lg bg-muted/50 p-4">
                <div className="flex items-center gap-2 font-medium text-sm">
                  <IconLink className="h-4 w-4 text-muted-foreground" />
                  Invite Link
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 truncate rounded bg-background px-2 py-1.5 text-xs">
                    {inviteLink}
                  </code>
                  <Button
                    className="shrink-0 gap-1.5"
                    onClick={handleCopyLink}
                    size="sm"
                    variant="outline"
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
                <p className="text-muted-foreground text-xs">
                  Share this link if the email doesn&apos;t arrive
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Workspace Name */}
              <div className="space-y-2">
                <Label className="font-medium text-sm" htmlFor="workspace-name">
                  Workspace Name
                </Label>
                <div className="relative">
                  <IconBuilding className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-10"
                    disabled={isPending}
                    id="workspace-name"
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Acme Real Estate"
                    required
                    value={name}
                  />
                </div>
              </div>

              {/* Owner Email */}
              <div className="space-y-2">
                <Label className="font-medium text-sm" htmlFor="owner-email">
                  Owner Email
                </Label>
                <div className="relative">
                  <IconMail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-10"
                    disabled={isPending}
                    id="owner-email"
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@company.com"
                    required
                    type="email"
                    value={email}
                  />
                </div>
                <p className="text-muted-foreground text-xs">
                  An invitation will be sent to this email address
                </p>
              </div>

              {/* Plan Selection */}
              <div className="space-y-3">
                <Label className="font-medium text-sm">Plan</Label>
                <div className="grid gap-3">
                  {planOptions.map((option) => (
                    <button
                      className={cn(
                        "flex items-start gap-3 rounded-xl p-4 text-left ring-2 transition-all duration-200",
                        plan === option.value
                          ? "bg-[var(--accent-green)]/5 ring-[var(--accent-green)]"
                          : "ring-foreground/5 hover:bg-muted/30 hover:ring-foreground/10"
                      )}
                      disabled={isPending}
                      key={option.value}
                      onClick={() => setPlan(option.value)}
                      type="button"
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
                        <p className="text-muted-foreground text-sm">
                          {option.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Invoice Billing (B2B) */}
              <div className="space-y-3">
                <div
                  className={cn(
                    "rounded-xl p-4 ring-2 transition-all duration-200",
                    invoiceEligible
                      ? "bg-[var(--accent-green)]/5 ring-[var(--accent-green)]"
                      : "ring-foreground/5"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-lg"
                        style={{
                          backgroundColor: invoiceEligible
                            ? "color-mix(in oklch, var(--accent-green) 15%, transparent)"
                            : "color-mix(in oklch, var(--foreground) 5%, transparent)",
                        }}
                      >
                        <IconReceipt
                          className="h-4 w-4"
                          style={{
                            color: invoiceEligible
                              ? "var(--accent-green)"
                              : "var(--muted-foreground)",
                          }}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          Invoice Billing (B2B)
                        </p>
                        <p className="text-muted-foreground text-sm">
                          Enable for Norwegian business customers
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={invoiceEligible}
                      disabled={isPending}
                      onCheckedChange={(checked) => {
                        setInvoiceEligible(checked);
                        if (!checked) {
                          setOrganizationNumber("");
                          setOrgNumberError("");
                        }
                      }}
                    />
                  </div>

                  {invoiceEligible && (
                    <div className="mt-4 space-y-2">
                      <Label
                        className="font-medium text-sm"
                        htmlFor="organization-number"
                      >
                        Organization Number{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        className={cn(
                          orgNumberError &&
                            "border-destructive ring-destructive"
                        )}
                        disabled={isPending}
                        id="organization-number"
                        maxLength={9}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          setOrganizationNumber(value);
                          if (orgNumberError) {
                            setOrgNumberError("");
                          }
                        }}
                        placeholder="969026155"
                        value={organizationNumber}
                      />
                      {orgNumberError ? (
                        <p className="text-destructive text-xs">
                          {orgNumberError}
                        </p>
                      ) : (
                        <p className="text-muted-foreground text-xs">
                          Norwegian 9-digit organization number
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t bg-muted/30 px-6 py-4">
          {sent ? (
            <Button
              className="min-w-[100px] gap-2"
              onClick={handleDone}
              style={{ backgroundColor: "var(--accent-green)" }}
            >
              <IconCheck className="h-4 w-4" />
              Done
            </Button>
          ) : (
            <>
              <Button
                disabled={isPending}
                onClick={handleClose}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                className="min-w-[160px] gap-2"
                disabled={!(name.trim() && email.trim()) || isPending}
                onClick={handleSubmit}
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
