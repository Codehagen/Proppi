"use client";

import { IconLoader, IconLogout } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/sign-in");
        },
      },
    });
  };

  return (
    <Button
      className="gap-2 text-muted-foreground hover:text-foreground"
      disabled={isLoading}
      onClick={handleSignOut}
      size="sm"
      variant="ghost"
    >
      {isLoading ? (
        <IconLoader className="size-4 animate-spin" />
      ) : (
        <IconLogout className="size-4" />
      )}
      <span className="hidden sm:inline">Sign out</span>
    </Button>
  );
}
