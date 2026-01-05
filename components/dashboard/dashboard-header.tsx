"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { SignOutButton } from "./sign-out-button"
import { IconBuilding } from "@tabler/icons-react"

type DashboardHeaderProps = {
  userLabel?: string
}

const navItems = [
  { href: "/dashboard", label: "Properties", icon: IconBuilding },
  // Add more nav items here as pages are built
  // { href: "/dashboard/editor", label: "Editor", icon: IconPhoto },
  // { href: "/dashboard/history", label: "History", icon: IconHistory },
  // { href: "/dashboard/settings", label: "Settings", icon: IconSettings },
] as const

export function DashboardHeader({ userLabel }: DashboardHeaderProps) {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="w-full px-4 md:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* Left side: Logo + Navigation */}
          <div className="flex items-center gap-4 min-w-0">
            <Link
              href="/dashboard"
              className="font-semibold tracking-tight text-foreground hover:text-foreground/80 transition-colors truncate"
            >
              AI Studio
            </Link>

            <Separator orientation="vertical" className="h-6" />

            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href)

                const Icon = item.icon

                return (
                  <Button
                    key={item.href}
                    asChild
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "h-8 gap-2 transition-all",
                      isActive && "font-medium"
                    )}
                  >
                    <Link href={item.href}>
                      <Icon className="size-4" />
                      <span className="hidden sm:inline">{item.label}</span>
                    </Link>
                  </Button>
                )
              })}
            </nav>
          </div>

          {/* Right side: User info + Sign out */}
          <div className="flex items-center gap-3">
            {userLabel && (
              <span className="hidden md:block text-sm text-muted-foreground max-w-[200px] truncate">
                {userLabel}
              </span>
            )}
            <SignOutButton />
          </div>
        </div>
      </div>
    </header>
  )
}
