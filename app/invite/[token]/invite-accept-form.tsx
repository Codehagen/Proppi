"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  IconBuilding,
  IconUser,
  IconLock,
  IconLoader2,
  IconCheck,
  IconAlertTriangle,
  IconClock,
} from "@tabler/icons-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { acceptInvitationAction } from "@/lib/actions/invitations";

interface InviteAcceptFormProps {
  token: string;
  email: string;
  workspaceName: string;
  isExpired: boolean;
  isAccepted: boolean;
}

export function InviteAcceptForm({
  token,
  email,
  workspaceName,
  isExpired,
  isAccepted,
}: InviteAcceptFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    startTransition(async () => {
      const result = await acceptInvitationAction(token, name.trim(), password);

      if (result.success) {
        toast.success("Welcome! Your account has been created.");
        router.push(result.data.redirectTo);
      } else {
        toast.error(result.error);
      }
    });
  };

  // Show expired state
  if (isExpired) {
    return (
      <div className="rounded-2xl bg-card p-8 text-center ring-1 ring-foreground/5">
        <div
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
          style={{
            backgroundColor:
              "color-mix(in oklch, var(--accent-amber) 15%, transparent)",
          }}
        >
          <IconClock
            className="h-8 w-8"
            style={{ color: "var(--accent-amber)" }}
          />
        </div>
        <h1 className="mb-2 text-xl font-bold">Invitation Expired</h1>
        <p className="text-muted-foreground">
          This invitation link has expired. Please contact the workspace
          administrator to request a new invitation.
        </p>
      </div>
    );
  }

  // Show already accepted state
  if (isAccepted) {
    return (
      <div className="rounded-2xl bg-card p-8 text-center ring-1 ring-foreground/5">
        <div
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
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
        <h1 className="mb-2 text-xl font-bold">Already Accepted</h1>
        <p className="mb-4 text-muted-foreground">
          This invitation has already been accepted. You can sign in to access
          your workspace.
        </p>
        <Button onClick={() => router.push("/sign-in")} className="gap-2">
          Go to Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card ring-1 ring-foreground/5">
      {/* Header */}
      <div className="border-b p-6 text-center">
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl"
          style={{
            backgroundColor:
              "color-mix(in oklch, var(--accent-violet) 15%, transparent)",
          }}
        >
          <IconBuilding
            className="h-7 w-7"
            style={{ color: "var(--accent-violet)" }}
          />
        </div>
        <h1 className="text-xl font-bold">Join {workspaceName}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          You&apos;ve been invited to join as the workspace owner
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        {/* Email (read-only) */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Email</Label>
          <Input value={email} disabled className="bg-muted/50" />
          <p className="text-xs text-muted-foreground">
            This is the email address your invitation was sent to
          </p>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Your Name
          </Label>
          <div className="relative">
            <IconUser className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="pl-10"
              required
              disabled={isPending}
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Create Password
          </Label>
          <div className="relative">
            <IconLock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="pl-10"
              required
              minLength={8}
              disabled={isPending}
            />
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirm-password" className="text-sm font-medium">
            Confirm Password
          </Label>
          <div className="relative">
            <IconLock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="pl-10"
              required
              disabled={isPending}
            />
          </div>
          {password && confirmPassword && password !== confirmPassword && (
            <p className="flex items-center gap-1 text-xs text-destructive">
              <IconAlertTriangle className="h-3 w-3" />
              Passwords do not match
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full gap-2"
          style={{ backgroundColor: "var(--accent-violet)" }}
          disabled={
            isPending ||
            !name.trim() ||
            password.length < 8 ||
            password !== confirmPassword
          }
        >
          {isPending ? (
            <>
              <IconLoader2 className="h-4 w-4 animate-spin" />
              Creating Account...
            </>
          ) : (
            <>
              <IconCheck className="h-4 w-4" />
              Accept Invitation
            </>
          )}
        </Button>
      </form>

      {/* Footer */}
      <div className="border-t bg-muted/30 px-6 py-4 text-center text-xs text-muted-foreground">
        By accepting, you agree to our Terms of Service and Privacy Policy
      </div>
    </div>
  );
}
