"use client";

import {
  IconBuilding,
  IconChartBar,
  IconChartLine,
  IconFileInvoice,
  IconLogout,
  IconPercentage,
  IconUsers,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/admin",
    label: "Overview",
    icon: IconChartBar,
    exact: true as const,
  },
  {
    href: "/admin/workspaces",
    label: "Workspaces",
    icon: IconBuilding,
    exact: false as const,
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: IconUsers,
    exact: false as const,
  },
  {
    href: "/admin/billing",
    label: "Betalinger",
    icon: IconFileInvoice,
    exact: false as const,
  },
  {
    href: "/admin/revenue",
    label: "Revenue",
    icon: IconChartLine,
    exact: false as const,
  },
  {
    href: "/admin/affiliates",
    label: "Affiliates",
    icon: IconPercentage,
    exact: false as const,
  },
];

export function AdminHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-zinc-800 border-b bg-zinc-900">
      <div className="w-full px-4 md:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* Left side: Logo + Admin Badge + Navigation */}
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex items-center gap-2.5">
              <Link
                className="truncate font-semibold text-zinc-100 tracking-tight transition-colors hover:text-white"
                href="/admin"
              >
                AI Studio
              </Link>
              <Badge
                className="h-5 rounded-md border-0 px-1.5 font-bold text-[10px] uppercase tracking-widest"
                style={{
                  backgroundColor: "var(--accent-violet)",
                  color: "white",
                }}
              >
                Admin
              </Badge>
            </div>

            <div className="h-6 w-px bg-zinc-700" />

            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

                const Icon = item.icon;

                return (
                  <Button
                    asChild
                    className={cn(
                      "h-8 gap-2 text-zinc-400 transition-all hover:bg-zinc-800 hover:text-zinc-100",
                      isActive && "bg-zinc-800 font-medium text-zinc-100"
                    )}
                    key={item.href}
                    size="sm"
                    style={
                      isActive
                        ? {
                            boxShadow: "inset 0 -2px 0 var(--accent-violet)",
                          }
                        : undefined
                    }
                    variant="ghost"
                  >
                    <Link href={item.href}>
                      <Icon className="size-4" />
                      <span className="hidden sm:inline">{item.label}</span>
                    </Link>
                  </Button>
                );
              })}
            </nav>
          </div>

          {/* Right side: Admin info + Sign out */}
          <div className="flex items-center gap-3">
            <span className="hidden max-w-[200px] truncate text-sm text-zinc-400 md:block">
              admin@aistudio.com
            </span>
            <Button
              asChild
              className="h-8 gap-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              size="sm"
              variant="ghost"
            >
              <Link href="/dashboard">
                <IconLogout className="size-4" />
                <span className="hidden sm:inline">Exit Admin</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
