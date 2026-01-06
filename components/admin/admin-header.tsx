"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { IconChartBar, IconBuilding, IconUsers, IconFileInvoice, IconLogout } from "@tabler/icons-react"

const navItems = [
  { href: "/admin", label: "Overview", icon: IconChartBar, exact: true as const },
  { href: "/admin/workspaces", label: "Workspaces", icon: IconBuilding, exact: false as const },
  { href: "/admin/users", label: "Users", icon: IconUsers, exact: false as const },
  { href: "/admin/billing", label: "Betalinger", icon: IconFileInvoice, exact: false as const },
]

export function AdminHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-900">
      <div className="w-full px-4 md:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* Left side: Logo + Admin Badge + Navigation */}
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex items-center gap-2.5">
              <Link
                href="/admin"
                className="font-semibold tracking-tight text-zinc-100 hover:text-white transition-colors truncate"
              >
                AI Studio
              </Link>
              <Badge
                className="h-5 rounded-md border-0 px-1.5 text-[10px] font-bold uppercase tracking-widest"
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
                  : pathname.startsWith(item.href)

                const Icon = item.icon

                return (
                  <Button
                    key={item.href}
                    asChild
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-8 gap-2 transition-all text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800",
                      isActive && "text-zinc-100 bg-zinc-800 font-medium"
                    )}
                    style={isActive ? {
                      boxShadow: "inset 0 -2px 0 var(--accent-violet)",
                    } : undefined}
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

          {/* Right side: Admin info + Sign out */}
          <div className="flex items-center gap-3">
            <span className="hidden md:block text-sm text-zinc-400 max-w-[200px] truncate">
              admin@aistudio.com
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
              asChild
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
  )
}
