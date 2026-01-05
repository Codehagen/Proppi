"use client"

import { Button } from "@/components/ui/button"
import {
  IconBuilding,
  IconSearch,
  IconPhotoPlus,
  IconSparkles,
} from "@tabler/icons-react"

export function EmptyState() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 shadow-xs">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative flex flex-col items-center justify-center px-6 py-20">
        {/* Animated icon container */}
        <div className="relative mb-6 animate-fade-in-up">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-2xl shadow-lg ring-1 ring-white/10"
            style={{ backgroundColor: "var(--accent-teal)" }}
          >
            <IconBuilding className="h-10 w-10 text-white" />
          </div>
          {/* Floating sparkle */}
          <div
            className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background shadow-md ring-1 ring-foreground/10 animate-pulse-subtle"
          >
            <IconSparkles className="h-4 w-4" style={{ color: "var(--accent-amber)" }} />
          </div>
        </div>

        <h3 className="mb-2 text-xl font-semibold tracking-tight animate-fade-in-up stagger-1">
          No properties yet
        </h3>
        <p className="mb-8 max-w-md text-center text-muted-foreground animate-fade-in-up stagger-2">
          Transform your real estate photos with AI-powered enhancements.
          Upload your first photo to get started.
        </p>

        <Button
          size="lg"
          className="gap-2 hover-lift animate-fade-in-up stagger-3"
          style={{ backgroundColor: "var(--accent-teal)" }}
        >
          <IconPhotoPlus className="h-5 w-5" />
          Upload your first photo
        </Button>
      </div>
    </div>
  )
}

export function NoResults() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 shadow-xs">
      {/* Subtle gradient overlay */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background: "radial-gradient(ellipse at center, color-mix(in oklch, var(--accent-teal) 5%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="relative flex flex-col items-center justify-center px-6 py-16">
        {/* Icon with animation */}
        <div className="relative mb-5 animate-fade-in-up">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted/80 ring-1 ring-foreground/5">
            <IconSearch className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>

        <h3 className="mb-2 text-lg font-semibold tracking-tight animate-fade-in-up stagger-1">
          No results found
        </h3>
        <p className="max-w-sm text-center text-sm text-muted-foreground animate-fade-in-up stagger-2">
          We couldn&apos;t find any properties matching your search criteria.
          Try adjusting your filters or search terms.
        </p>
      </div>
    </div>
  )
}
