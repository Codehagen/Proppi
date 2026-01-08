"use client";

import { IconArrowRight, IconPlayerPlay } from "@tabler/icons-react";
import Link from "next/link";
import { Suspense } from "react";
import { useSession } from "@/lib/auth-client";

function HeroAuthButton() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div
        className="h-12 w-36 animate-pulse rounded-full"
        style={{ backgroundColor: "var(--landing-border)" }}
      />
    );
  }

  const href = session ? "/dashboard" : "/sign-in";
  const text = session ? "Go to Dashboard" : "Start for Free";

  return (
    <Link
      className="inline-flex h-12 items-center gap-2 rounded-full px-7 font-medium text-base transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
      href={href}
      style={{
        backgroundColor: "var(--landing-accent)",
        color: "var(--landing-accent-foreground)",
        boxShadow: "0 8px 24px -8px var(--landing-accent)",
      }}
    >
      {text}
      <IconArrowRight className="size-5" />
    </Link>
  );
}

export function LandingHero() {
  return (
    <section className="relative overflow-hidden px-6 pt-16 pb-24 md:pt-24 md:pb-32">
      {/* Subtle gradient accent */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--landing-accent) 0%, transparent 70%)",
          opacity: 0.08,
        }}
      />

      <div className="mx-auto max-w-4xl text-center">
        {/* Badge */}
        <div
          className="landing-stagger-1 mb-6 inline-flex animate-spring-up items-center gap-2 rounded-full px-4 py-1.5 font-semibold text-xs uppercase tracking-wider"
          style={{
            backgroundColor: "var(--landing-bg-alt)",
            color: "var(--landing-text-muted)",
            border: "1px solid var(--landing-border)",
          }}
        >
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: "var(--landing-accent)" }}
          />
          #1 AI Photo Editor for Real Estate
        </div>

        {/* Main Headline */}
        <h1
          className="landing-stagger-2 animate-spring-up font-bold text-4xl leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          style={{ color: "var(--landing-text)" }}
        >
          Create Stunning
          <br />
          <span style={{ color: "var(--landing-accent)" }}>
            Property Photos
          </span>
          <br />
          Instantly with AI
        </h1>

        {/* Subheadline */}
        <p
          className="landing-stagger-3 mx-auto mt-6 max-w-xl animate-spring-up text-lg leading-relaxed md:text-xl"
          style={{ color: "var(--landing-text-muted)" }}
        >
          Transform photos 10x faster. No design skills needed.
        </p>

        {/* CTA Buttons */}
        <div className="landing-stagger-4 mt-10 flex animate-spring-up flex-col items-center justify-center gap-4 sm:flex-row">
          <Suspense
            fallback={
              <div
                className="h-12 w-36 animate-pulse rounded-full"
                style={{ backgroundColor: "var(--landing-border)" }}
              />
            }
          >
            <HeroAuthButton />
          </Suspense>

          <button
            className="inline-flex h-12 items-center gap-2 rounded-full px-6 font-medium text-base transition-all duration-200 hover:scale-[1.02]"
            style={{
              backgroundColor: "var(--landing-card)",
              color: "var(--landing-text)",
              border: "1px solid var(--landing-border-strong)",
            }}
            type="button"
          >
            <IconPlayerPlay className="size-5" />
            Watch Demo
          </button>
        </div>

        {/* Stats Row */}
        <div className="landing-stagger-5 mt-12 flex animate-spring-up flex-wrap items-center justify-center gap-8 md:gap-12">
          <div className="text-center">
            <p
              className="font-bold text-2xl tabular-nums md:text-3xl"
              style={{ color: "var(--landing-text)" }}
            >
              50,000+
            </p>
            <p
              className="mt-1 text-sm"
              style={{ color: "var(--landing-text-muted)" }}
            >
              Photos enhanced
            </p>
          </div>
          <div
            className="hidden h-10 w-px md:block"
            style={{ backgroundColor: "var(--landing-border)" }}
          />
          <div className="text-center">
            <p
              className="font-bold text-2xl tabular-nums md:text-3xl"
              style={{ color: "var(--landing-text)" }}
            >
              30 sec
            </p>
            <p
              className="mt-1 text-sm"
              style={{ color: "var(--landing-text-muted)" }}
            >
              Average time
            </p>
          </div>
          <div
            className="hidden h-10 w-px md:block"
            style={{ backgroundColor: "var(--landing-border)" }}
          />
          <div className="text-center">
            <p
              className="font-bold text-2xl tabular-nums md:text-3xl"
              style={{ color: "var(--landing-accent)" }}
            >
              +85%
            </p>
            <p
              className="mt-1 text-sm"
              style={{ color: "var(--landing-text-muted)" }}
            >
              Listing engagement
            </p>
          </div>
        </div>
      </div>

      {/* Hero Image Preview */}
      <div className="landing-stagger-6 mx-auto mt-16 max-w-5xl animate-spring-up px-4">
        <div
          className="relative overflow-hidden rounded-2xl p-1.5 md:rounded-3xl"
          style={{
            backgroundColor: "var(--landing-card)",
            boxShadow:
              "0 25px 50px -12px var(--landing-shadow), 0 0 0 1px var(--landing-border)",
          }}
        >
          {/* Browser Chrome */}
          <div
            className="flex h-10 items-center gap-2 rounded-t-xl px-4 md:h-12"
            style={{ backgroundColor: "var(--landing-bg-alt)" }}
          >
            <div className="flex gap-1.5">
              <div
                className="size-3 rounded-full"
                style={{ backgroundColor: "var(--landing-border-strong)" }}
              />
              <div
                className="size-3 rounded-full"
                style={{ backgroundColor: "var(--landing-border-strong)" }}
              />
              <div
                className="size-3 rounded-full"
                style={{ backgroundColor: "var(--landing-border-strong)" }}
              />
            </div>
            <div
              className="ml-4 hidden h-6 max-w-xs flex-1 rounded-md sm:block"
              style={{ backgroundColor: "var(--landing-bg)" }}
            />
          </div>

          {/* Preview Content */}
          <div
            className="relative aspect-[16/9] overflow-hidden rounded-b-xl"
            style={{ backgroundColor: "var(--landing-bg-alt)" }}
          >
            {/* Placeholder for actual app screenshot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div
                  className="mx-auto mb-4 size-16 rounded-2xl"
                  style={{
                    backgroundColor: "var(--landing-accent)",
                    opacity: 0.2,
                  }}
                />
                <p
                  className="font-medium text-sm"
                  style={{ color: "var(--landing-text-muted)" }}
                >
                  App Preview
                </p>
              </div>
            </div>

            {/* Decorative Grid */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(var(--landing-border) 1px, transparent 1px), linear-gradient(90deg, var(--landing-border) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
