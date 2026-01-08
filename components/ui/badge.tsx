import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-4xl border border-transparent px-2 py-0.5 font-medium text-xs transition-all transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
        // Status variants for property table
        "status-active":
          "border-emerald-500/20 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
        "status-pending":
          "border-amber-500/20 bg-amber-500/15 text-amber-700 dark:text-amber-400",
        "status-completed":
          "border-blue-500/20 bg-blue-500/15 text-blue-700 dark:text-blue-400",
        "status-archived":
          "border-zinc-500/20 bg-zinc-500/15 text-zinc-600 dark:text-zinc-400",
        // Admin status variants
        "status-suspended":
          "border-red-500/20 bg-red-500/15 text-red-700 dark:text-red-400",
        "status-trial":
          "border-violet-500/20 bg-violet-500/15 text-violet-700 dark:text-violet-400",
        "status-inactive":
          "border-zinc-500/20 bg-zinc-500/15 text-zinc-600 dark:text-zinc-400",
        // Plan variants
        "plan-free":
          "border-zinc-500/20 bg-zinc-500/15 text-zinc-600 dark:text-zinc-400",
        "plan-pro":
          "border-blue-500/20 bg-blue-500/15 text-blue-700 dark:text-blue-400",
        "plan-enterprise":
          "border-amber-500/20 bg-amber-500/15 text-amber-700 dark:text-amber-400",
        // Role variants
        "role-owner":
          "border-violet-500/20 bg-violet-500/15 text-violet-700 dark:text-violet-400",
        "role-admin":
          "border-blue-500/20 bg-blue-500/15 text-blue-700 dark:text-blue-400",
        "role-member":
          "border-zinc-500/20 bg-zinc-500/15 text-zinc-600 dark:text-zinc-400",
        // Tag variant for property tags
        tag: "rounded-md bg-muted px-2.5 py-0.5 text-[11px] text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp
      className={cn(badgeVariants({ variant }), className)}
      data-slot="badge"
      data-variant={variant}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
