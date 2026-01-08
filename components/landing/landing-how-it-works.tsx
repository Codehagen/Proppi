"use client";

import { IconDownload, IconUpload, IconWand } from "@tabler/icons-react";

const steps = [
  {
    step: "01",
    icon: IconUpload,
    title: "Upload Your Photos",
    description:
      "Drag and drop your property photos or select them from your device. We support all common image formats.",
  },
  {
    step: "02",
    icon: IconWand,
    title: "Choose a Style",
    description:
      "Select from our collection of professional style templates designed for different property types and aesthetics.",
  },
  {
    step: "03",
    icon: IconDownload,
    title: "Download & Share",
    description:
      "Get your enhanced photos instantly. Download in high resolution, ready for your listings and marketing.",
  },
];

export function LandingHowItWorks() {
  return (
    <section
      className="px-6 py-24 md:py-32"
      id="how-it-works"
      style={{ backgroundColor: "var(--landing-bg)" }}
    >
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p
            className="font-semibold text-sm uppercase tracking-wider"
            style={{ color: "var(--landing-accent)" }}
          >
            How It Works
          </p>
          <h2
            className="mt-3 font-bold text-3xl tracking-tight sm:text-4xl md:text-5xl"
            style={{ color: "var(--landing-text)" }}
          >
            Three simple steps to
            <br />
            perfect photos
          </h2>
          <p
            className="mt-4 text-lg leading-relaxed"
            style={{ color: "var(--landing-text-muted)" }}
          >
            No complicated software or design experience required. Just upload,
            select, and download.
          </p>
        </div>

        {/* Steps */}
        <div className="relative mt-16">
          {/* Connecting line - desktop only */}
          <div
            className="absolute top-16 right-0 left-0 hidden h-0.5 lg:block"
            style={{ backgroundColor: "var(--landing-border)" }}
          />

          <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
            {steps.map((step) => (
              <div className="relative text-center" key={step.step}>
                {/* Step Number Circle */}
                <div className="relative mx-auto mb-6">
                  <div
                    className="relative z-10 mx-auto flex size-32 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: "var(--landing-card)",
                      boxShadow: "0 8px 32px -8px var(--landing-shadow)",
                      border: "1px solid var(--landing-border)",
                    }}
                  >
                    <step.icon
                      className="size-12"
                      style={{ color: "var(--landing-accent)" }}
                    />
                  </div>

                  {/* Step number badge */}
                  <div
                    className="absolute -top-2 -right-2 flex size-10 items-center justify-center rounded-full font-bold text-sm"
                    style={{
                      backgroundColor: "var(--landing-accent)",
                      color: "var(--landing-accent-foreground)",
                    }}
                  >
                    {step.step}
                  </div>
                </div>

                {/* Content */}
                <h3
                  className="font-semibold text-xl"
                  style={{ color: "var(--landing-text)" }}
                >
                  {step.title}
                </h3>
                <p
                  className="mx-auto mt-3 max-w-xs text-sm leading-relaxed"
                  style={{ color: "var(--landing-text-muted)" }}
                >
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Demo Card */}
        <div
          className="mx-auto mt-20 max-w-3xl overflow-hidden rounded-2xl md:rounded-3xl"
          style={{
            backgroundColor: "var(--landing-card)",
            boxShadow: "0 25px 50px -12px var(--landing-shadow)",
            border: "1px solid var(--landing-border)",
          }}
        >
          <div className="grid md:grid-cols-2">
            {/* Before */}
            <div className="relative p-6 md:p-8">
              <span
                className="absolute top-6 left-6 rounded-full px-3 py-1 font-medium text-xs md:top-8 md:left-8"
                style={{
                  backgroundColor: "var(--landing-bg-alt)",
                  color: "var(--landing-text-muted)",
                  border: "1px solid var(--landing-border)",
                }}
              >
                Before
              </span>
              <div
                className="aspect-[4/3] rounded-xl"
                style={{ backgroundColor: "var(--landing-bg-alt)" }}
              >
                <div className="flex h-full items-center justify-center">
                  <p
                    className="text-sm"
                    style={{ color: "var(--landing-text-muted)" }}
                  >
                    Original Photo
                  </p>
                </div>
              </div>
            </div>

            {/* After */}
            <div
              className="relative p-6 md:p-8"
              style={{ backgroundColor: "var(--landing-bg-alt)" }}
            >
              <span
                className="absolute top-6 left-6 rounded-full px-3 py-1 font-medium text-xs md:top-8 md:left-8"
                style={{
                  backgroundColor: "var(--landing-accent)",
                  color: "var(--landing-accent-foreground)",
                }}
              >
                After
              </span>
              <div
                className="aspect-[4/3] rounded-xl"
                style={{
                  backgroundColor: "var(--landing-card)",
                  border: "1px solid var(--landing-border)",
                }}
              >
                <div className="flex h-full items-center justify-center">
                  <p
                    className="text-sm"
                    style={{ color: "var(--landing-text-muted)" }}
                  >
                    Enhanced Photo
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
