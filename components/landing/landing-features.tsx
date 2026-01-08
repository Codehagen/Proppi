"use client";

import {
  IconClockHour4,
  IconDeviceDesktop,
  IconPalette,
  IconPhoto,
  IconShieldCheck,
  IconWand,
} from "@tabler/icons-react";

const features = [
  {
    icon: IconWand,
    title: "AI-Powered Enhancement",
    description:
      "Our advanced AI transforms ordinary photos into stunning, professional-quality images automatically.",
  },
  {
    icon: IconPalette,
    title: "Multiple Style Templates",
    description:
      "Choose from a variety of professionally designed styles to match your brand and property type.",
  },
  {
    icon: IconClockHour4,
    title: "Results in Seconds",
    description:
      "No waiting around. Get your enhanced photos back in seconds, not hours or days.",
  },
  {
    icon: IconPhoto,
    title: "Batch Processing",
    description:
      "Upload multiple photos at once and process entire property shoots in one go.",
  },
  {
    icon: IconDeviceDesktop,
    title: "No Software Required",
    description:
      "Everything runs in your browser. No downloads, no installations, no technical skills needed.",
  },
  {
    icon: IconShieldCheck,
    title: "Secure & Private",
    description:
      "Your photos are encrypted and automatically deleted after processing. Your data stays yours.",
  },
];

export function LandingFeatures() {
  return (
    <section
      className="px-6 py-24 md:py-32"
      id="features"
      style={{ backgroundColor: "var(--landing-bg-alt)" }}
    >
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p
            className="font-semibold text-sm uppercase tracking-wider"
            style={{ color: "var(--landing-accent)" }}
          >
            Features
          </p>
          <h2
            className="mt-3 font-bold text-3xl tracking-tight sm:text-4xl md:text-5xl"
            style={{ color: "var(--landing-text)" }}
          >
            Everything you need to
            <br />
            create stunning listings
          </h2>
          <p
            className="mt-4 text-lg leading-relaxed"
            style={{ color: "var(--landing-text-muted)" }}
          >
            Powerful features designed specifically for real estate
            professionals who want to save time and impress clients.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              className="group relative rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 md:p-8"
              key={feature.title}
              style={{
                backgroundColor: "var(--landing-card)",
                boxShadow: "0 4px 24px -4px var(--landing-shadow)",
                border: "1px solid var(--landing-border)",
              }}
            >
              {/* Icon */}
              <div
                className="mb-5 inline-flex size-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                style={{
                  backgroundColor: "var(--landing-accent)",
                  opacity: 0.1,
                }}
              >
                <feature.icon
                  className="size-6"
                  style={{ color: "var(--landing-accent)" }}
                />
              </div>

              {/* Actual icon overlay for proper color */}
              <div className="absolute top-6 left-6 flex size-12 items-center justify-center rounded-xl md:top-8 md:left-8">
                <feature.icon
                  className="size-6"
                  style={{ color: "var(--landing-accent)" }}
                />
              </div>

              {/* Content */}
              <h3
                className="font-semibold text-lg"
                style={{ color: "var(--landing-text)" }}
              >
                {feature.title}
              </h3>
              <p
                className="mt-2 text-sm leading-relaxed"
                style={{ color: "var(--landing-text-muted)" }}
              >
                {feature.description}
              </p>

              {/* Hover accent line */}
              <div
                className="absolute right-6 bottom-0 left-6 h-0.5 origin-left scale-x-0 rounded-full transition-transform duration-300 group-hover:scale-x-100 md:right-8 md:left-8"
                style={{ backgroundColor: "var(--landing-accent)" }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
