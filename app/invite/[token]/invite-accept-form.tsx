"use client";

import {
  IconAlertTriangle,
  IconBuilding,
  IconCheck,
  IconClock,
  IconLoader2,
  IconLock,
  IconUser,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
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
        <h1 className="mb-2 font-bold text-xl">Invitation Expired</h1>
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
        <h1 className="mb-2 font-bold text-xl">Already Accepted</h1>
        <p className="mb-4 text-muted-foreground">
          This invitation has already been accepted. You can sign in to access
          your workspace.
        </p>
        <Button className="gap-2" onClick={() => router.push("/sign-in")}>
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
        <h1 className="font-bold text-xl">Join {workspaceName}</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          You&apos;ve been invited to join as the workspace owner
        </p>
      </div>

      {/* Form */}
      <form className="space-y-4 p-6" onSubmit={handleSubmit}>
        {/* Email (read-only) */}
        <div className="space-y-2">
          <Label className="font-medium text-sm">Email</Label>
          <Input className="bg-muted/50" disabled value={email} />
          <p className="text-muted-foreground text-xs">
            This is the email address your invitation was sent to
          </p>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label className="font-medium text-sm" htmlFor="name">
            Your Name
          </Label>
          <div className="relative">
            <IconUser className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10"
              disabled={isPending}
              id="name"
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              value={name}
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label className="font-medium text-sm" htmlFor="password">
            Create Password
          </Label>
          <div className="relative">
            <IconLock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10"
              disabled={isPending}
              id="password"
              minLength={8}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              type="password"
              value={password}
            />
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label className="font-medium text-sm" htmlFor="confirm-password">
            Confirm Password
          </Label>
          <div className="relative">
            <IconLock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10"
              disabled={isPending}
              id="confirm-password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              type="password"
              value={confirmPassword}
            />
          </div>
          {password && confirmPassword && password !== confirmPassword && (
            <p className="flex items-center gap-1 text-destructive text-xs">
              <IconAlertTriangle className="h-3 w-3" />
              Passwords do not match
            </p>
          )}
        </div>

        <Button
          className="w-full gap-2"
          disabled={
            isPending ||
            !name.trim() ||
            password.length < 8 ||
            password !== confirmPassword
          }
          style={{ backgroundColor: "var(--accent-violet)" }}
          type="submit"
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
      <div className="border-t bg-muted/30 px-6 py-4 text-center text-muted-foreground text-xs">
        By accepting, you agree to our Terms of Service and Privacy Policy
      </div>
    </div>
  );
}
