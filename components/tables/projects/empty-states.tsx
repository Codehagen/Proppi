"use client";

import { IconPhotoPlus, IconSearch, IconSparkles } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

export function EmptyProjectsState() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-card shadow-xs ring-1 ring-foreground/10">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              height="32"
              id="grid"
              patternUnits="userSpaceOnUse"
              width="32"
            >
              <path
                d="M 32 0 L 0 0 0 32"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect fill="url(#grid)" height="100%" width="100%" />
        </svg>
      </div>

      <div className="relative flex flex-col items-center justify-center px-6 py-20">
        {/* Animated icon container */}
        <div className="relative mb-6 animate-fade-in-up">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-2xl shadow-lg ring-1 ring-white/10"
            style={{ backgroundColor: "var(--accent-teal)" }}
          >
            <IconSparkles className="h-10 w-10 text-white" />
          </div>
        </div>

        <h3 className="stagger-1 mb-2 animate-fade-in-up font-semibold text-xl tracking-tight">
          No projects yet
        </h3>
        <p className="stagger-2 mb-8 max-w-md animate-fade-in-up text-center text-muted-foreground">
          Transform your real estate photos with AI-powered enhancements. Create
          your first project to get started.
        </p>

        <Button
          className="hover-lift stagger-3 animate-fade-in-up gap-2"
          size="lg"
          style={{ backgroundColor: "var(--accent-teal)" }}
        >
          <IconPhotoPlus className="h-5 w-5" />
          Create your first project
        </Button>
      </div>
    </div>
  );
}

export function NoProjectResults() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-card shadow-xs ring-1 ring-foreground/10">
      {/* Subtle gradient overlay */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse at center, color-mix(in oklch, var(--accent-teal) 5%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="relative flex flex-col items-center justify-center px-6 py-16">
        {/* Icon with animation */}
        <div className="relative mb-5 animate-fade-in-up">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted/80 ring-1 ring-foreground/5">
            <IconSearch className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>

        <h3 className="stagger-1 mb-2 animate-fade-in-up font-semibold text-lg tracking-tight">
          No results found
        </h3>
        <p className="stagger-2 max-w-sm animate-fade-in-up text-center text-muted-foreground text-sm">
          We couldn&apos;t find any projects matching your search criteria. Try
          adjusting your filters or search terms.
        </p>
      </div>
    </div>
  );
}
