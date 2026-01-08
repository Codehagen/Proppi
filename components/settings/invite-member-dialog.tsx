"use client";

import {
  IconCheck,
  IconLoader2,
  IconMail,
  IconShield,
  IconUser,
  IconUserPlus,
} from "@tabler/icons-react";
import type * as React from "react";
import { useState } from "react";
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
import type { UserRole } from "@/lib/mock/workspace";
import { cn } from "@/lib/utils";

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const roleOptions: {
  value: UserRole;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "admin",
    label: "Admin",
    description: "Can manage workspace settings and invite members",
    icon: <IconShield className="h-5 w-5" />,
  },
  {
    value: "member",
    label: "Member",
    description: "Can create and manage their own projects",
    icon: <IconUser className="h-5 w-5" />,
  },
];

export function InviteMemberDialog({
  open,
  onOpenChange,
}: InviteMemberDialogProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("member");
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSending(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSending(false);
    setSent(true);

    // Reset after showing success
    setTimeout(() => {
      setSent(false);
      setEmail("");
      setRole("member");
      onOpenChange(false);
    }, 1500);
  };

  const handleClose = () => {
    if (!isSending) {
      setEmail("");
      setRole("member");
      setSent(false);
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
                    "color-mix(in oklch, var(--accent-teal) 15%, transparent)",
                }}
              >
                <IconUserPlus
                  className="h-4 w-4"
                  style={{ color: "var(--accent-teal)" }}
                />
              </div>
              Invite Team Member
            </DialogTitle>
            <DialogDescription>
              Send an invitation to join your workspace
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content */}
        <form className="space-y-6 p-6" onSubmit={handleSubmit}>
          {/* Success state */}
          {sent ? (
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
                <p className="font-semibold text-lg">Invitation Sent!</p>
                <p className="text-muted-foreground text-sm">
                  We&apos;ve sent an invite to {email}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Email input */}
              <div className="space-y-2">
                <Label className="font-medium text-sm" htmlFor="invite-email">
                  Email Address
                </Label>
                <div className="relative">
                  <IconMail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-10"
                    disabled={isSending}
                    id="invite-email"
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="colleague@company.com"
                    required
                    type="email"
                    value={email}
                  />
                </div>
              </div>

              {/* Role selection */}
              <div className="space-y-3">
                <Label className="font-medium text-sm">Role</Label>
                <div className="grid gap-3">
                  {roleOptions.map((option) => (
                    <button
                      className={cn(
                        "flex items-start gap-3 rounded-xl p-4 text-left ring-2 transition-all duration-200",
                        role === option.value
                          ? "bg-[var(--accent-teal)]/5 ring-[var(--accent-teal)]"
                          : "ring-foreground/5 hover:bg-muted/30 hover:ring-foreground/10"
                      )}
                      disabled={isSending}
                      key={option.value}
                      onClick={() => setRole(option.value)}
                      type="button"
                    >
                      <div
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors",
                          role === option.value
                            ? "bg-[var(--accent-teal)]/15 text-[var(--accent-teal)]"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {option.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">
                            {option.label}
                          </p>
                          {role === option.value && (
                            <IconCheck
                              className="h-4 w-4"
                              style={{ color: "var(--accent-teal)" }}
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
            </>
          )}
        </form>

        {/* Footer */}
        {!sent && (
          <div className="flex items-center justify-end gap-3 border-t bg-muted/30 px-6 py-4">
            <Button
              disabled={isSending}
              onClick={handleClose}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              className="min-w-[120px] gap-2"
              disabled={!email || isSending}
              onClick={handleSubmit}
              style={{ backgroundColor: "var(--accent-teal)" }}
            >
              {isSending ? (
                <>
                  <IconLoader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <IconMail className="h-4 w-4" />
                  Send Invite
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
