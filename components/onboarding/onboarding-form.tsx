"use client";

import { IconLoader } from "@tabler/icons-react";
import { useActionState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { completeOnboarding } from "@/lib/actions";

interface OnboardingFormProps {
  initialName: string;
  initialEmail: string;
  initialWorkspaceName: string;
}

type FormState = {
  error?: string;
} | null;

export function OnboardingForm({
  initialName,
  initialEmail,
  initialWorkspaceName,
}: OnboardingFormProps) {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    async (_prevState, formData) => {
      const name = formData.get("name") as string;
      const workspaceName = formData.get("workspaceName") as string;
      const organizationNumber = formData.get("organizationNumber") as string;

      // Client-side validation
      if (!name.trim()) {
        return { error: "Please enter your name" };
      }

      if (!workspaceName.trim()) {
        return { error: "Please enter a workspace name" };
      }

      // Validate Norwegian org number format if provided (9 digits)
      if (organizationNumber && !/^\d{9}$/.test(organizationNumber)) {
        return { error: "Organization number must be 9 digits" };
      }

      try {
        // Server action will redirect on success
        await completeOnboarding(formData);
        return null;
      } catch (error) {
        return {
          error:
            error instanceof Error ? error.message : "Something went wrong",
        };
      }
    },
    null
  );

  // Show toast on error
  if (state?.error) {
    toast.error(state.error);
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Complete your profile</CardTitle>
        <CardDescription>
          Tell us a bit more about you and your company
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your name</Label>
            <Input
              defaultValue={initialName}
              disabled={isPending}
              id="name"
              name="name"
              placeholder="John Doe"
              type="text"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workspaceName">Company / Workspace name</Label>
            <Input
              defaultValue={initialWorkspaceName}
              disabled={isPending}
              id="workspaceName"
              name="workspaceName"
              placeholder="Acme Real Estate"
              type="text"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organizationNumber">
              Organization number{" "}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              disabled={isPending}
              id="organizationNumber"
              maxLength={9}
              name="organizationNumber"
              placeholder="123456789"
              type="text"
            />
            <p className="text-muted-foreground text-xs">
              Norwegian organization number (9 digits)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactEmail">
              Contact email{" "}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              defaultValue={initialEmail}
              disabled={isPending}
              id="contactEmail"
              name="contactEmail"
              placeholder="contact@company.com"
              type="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPerson">
              Contact person{" "}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              defaultValue={initialName}
              disabled={isPending}
              id="contactPerson"
              name="contactPerson"
              placeholder="John Doe"
              type="text"
            />
          </div>

          <Button className="w-full" disabled={isPending} type="submit">
            {isPending ? (
              <>
                <IconLoader className="mr-2 size-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Continue to dashboard"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
