"use client";

import { IconMovie, IconSettings, IconSparkles } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { SignOutButton } from "./sign-out-button";

type DashboardHeaderProps = {
  userLabel?: string;
};

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Projects", icon: IconSparkles },
  {
    href: "/video",
    label: "Video (coming soon)",
    icon: IconMovie,
    disabled: true,
  },
  { href: "/dashboard/settings", label: "Settings", icon: IconSettings },
];

export function DashboardHeader({ userLabel }: DashboardHeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="w-full px-4 md:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* Left side: Logo + Navigation */}
          <div className="flex min-w-0 items-center gap-4">
            <Link
              className="truncate font-semibold text-foreground tracking-tight transition-colors hover:text-foreground/80"
              href="/"
            >
              AI Studio
            </Link>

            <Separator className="h-6" orientation="vertical" />

            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive =
                  !item.disabled &&
                  (item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href));

                const Icon = item.icon;

                return (
                  <Button
                    asChild={!item.disabled}
                    className={cn(
                      "h-8 gap-2 transition-all",
                      isActive && "font-medium",
                      item.disabled && "cursor-not-allowed opacity-60"
                    )}
                    disabled={item.disabled}
                    key={item.href}
                    size="sm"
                    variant={isActive ? "secondary" : "ghost"}
                  >
                    {item.disabled ? (
                      <div className="flex items-center gap-2">
                        <Icon className="size-4" />
                        <span className="hidden sm:inline">{item.label}</span>
                      </div>
                    ) : (
                      <Link href={item.href}>
                        <Icon className="size-4" />
                        <span className="hidden sm:inline">{item.label}</span>
                      </Link>
                    )}
                  </Button>
                );
              })}
            </nav>
          </div>

          {/* Right side: User info + Sign out */}
          <div className="flex items-center gap-3">
            {userLabel && (
              <span className="hidden max-w-[200px] truncate text-muted-foreground text-sm md:block">
                {userLabel}
              </span>
            )}
            <SignOutButton />
          </div>
        </div>
      </div>
    </header>
  );
}
