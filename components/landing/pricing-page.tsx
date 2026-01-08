"use client";

import {
  IconArrowRight,
  IconCheck,
  IconMinus,
  IconMovie,
  IconPhoto,
  IconPlus,
} from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import { LandingFooter } from "./landing-footer";
import { LandingNav } from "./landing-nav";

const photoFeatures = [
  "Up to 20 images per property",
  "AI-powered enhancement",
  "Multiple style templates",
  "High-resolution downloads",
  "Ready in under 30 seconds",
];

const videoFeatures = [
  "Professional property video",
  "AI-powered editing",
  "Music and transitions included",
  "Portrait or landscape format",
  "Ready in minutes",
];

const faqs = [
  {
    question: "How does the pricing work?",
    answer:
      "We charge per project, not per month. For photo enhancement, you pay 1000 NOK per property (up to 20 images). For video creation, you pay 1000 NOK per video. No subscriptions, no hidden fees.",
  },
  {
    question: "What image formats do you support?",
    answer:
      "We support all common image formats including JPG, PNG, and WEBP. Maximum file size is 10MB per image. Enhanced images are delivered in high-resolution JPG format.",
  },
  {
    question: "How long does processing take?",
    answer:
      "Photo enhancement typically takes under 30 seconds per image. Video creation usually takes 5-10 minutes depending on the number of images and selected options.",
  },
  {
    question: "Can I try before I buy?",
    answer:
      "Yes! New users get free credits to try out the platform. You can enhance a few images to see the quality before committing to a full property project.",
  },
  {
    question: "What if I have more than 20 images?",
    answer:
      "If your property has more than 20 images, you can create multiple projects or contact us for custom pricing on larger shoots.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "If you're not satisfied with the results, contact us within 24 hours of processing and we'll work with you to make it right or provide a refund.",
  },
];

function PricingCard({
  icon: Icon,
  title,
  price,
  per,
  features,
  popular,
}: {
  icon: typeof IconPhoto;
  title: string;
  price: string;
  per: string;
  features: string[];
  popular?: boolean;
}) {
  return (
    <div
      className="relative flex flex-col rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1"
      style={{
        backgroundColor: popular ? "var(--landing-card)" : "var(--landing-bg)",
        boxShadow: popular
          ? "0 20px 40px -12px var(--landing-shadow)"
          : "0 4px 24px -4px var(--landing-shadow)",
        border: popular
          ? "2px solid var(--landing-accent)"
          : "1px solid var(--landing-border)",
      }}
    >
      {popular && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 font-semibold text-xs"
          style={{
            backgroundColor: "var(--landing-accent)",
            color: "var(--landing-accent-foreground)",
          }}
        >
          Most Popular
        </div>
      )}

      {/* Icon */}
      <div
        className="relative mb-6 inline-flex size-14 items-center justify-center rounded-xl"
        style={{
          backgroundColor: popular
            ? "var(--landing-accent)"
            : "var(--landing-bg-alt)",
          border: popular ? "none" : "1px solid var(--landing-border)",
        }}
      >
        <Icon
          className="size-7"
          style={{
            color: popular
              ? "var(--landing-accent-foreground)"
              : "var(--landing-accent)",
          }}
        />
      </div>

      {/* Title */}
      <h3
        className="font-semibold text-xl"
        style={{ color: "var(--landing-text)" }}
      >
        {title}
      </h3>

      {/* Price */}
      <div className="mt-4 flex items-baseline gap-2">
        <span
          className="font-bold text-4xl tabular-nums"
          style={{ color: "var(--landing-text)" }}
        >
          {price}
        </span>
        <span
          className="text-sm"
          style={{ color: "var(--landing-text-muted)" }}
        >
          {per}
        </span>
      </div>

      {/* Features */}
      <ul className="mt-8 flex-1 space-y-4">
        {features.map((feature) => (
          <li className="flex items-start gap-3" key={feature}>
            <IconCheck
              className="mt-0.5 size-5 shrink-0"
              style={{ color: "var(--landing-accent)" }}
            />
            <span
              className="text-sm"
              style={{ color: "var(--landing-text-muted)" }}
            >
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full font-medium text-base transition-all duration-200 hover:scale-[1.02]"
        href="/sign-in"
        style={{
          backgroundColor: popular
            ? "var(--landing-accent)"
            : "var(--landing-bg-alt)",
          color: popular
            ? "var(--landing-accent-foreground)"
            : "var(--landing-text)",
          border: popular ? "none" : "1px solid var(--landing-border-strong)",
        }}
      >
        Get Started
        <IconArrowRight className="size-5" />
      </Link>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="rounded-xl transition-colors"
      style={{
        backgroundColor: isOpen ? "var(--landing-card)" : "transparent",
        border: "1px solid var(--landing-border)",
      }}
    >
      <button
        className="flex w-full items-center justify-between p-5 text-left"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span className="font-medium" style={{ color: "var(--landing-text)" }}>
          {question}
        </span>
        {isOpen ? (
          <IconMinus
            className="size-5 shrink-0"
            style={{ color: "var(--landing-text-muted)" }}
          />
        ) : (
          <IconPlus
            className="size-5 shrink-0"
            style={{ color: "var(--landing-text-muted)" }}
          />
        )}
      </button>
      {isOpen && (
        <div
          className="px-5 pb-5 text-sm leading-relaxed"
          style={{ color: "var(--landing-text-muted)" }}
        >
          {answer}
        </div>
      )}
    </div>
  );
}

export function PricingPage() {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--landing-bg)" }}
    >
      <LandingNav />

      <main>
        {/* Hero Section */}
        <section className="px-6 pt-20 pb-16 text-center md:pt-28 md:pb-24">
          <div className="mx-auto max-w-3xl">
            <p
              className="font-semibold text-sm uppercase tracking-wider"
              style={{ color: "var(--landing-accent)" }}
            >
              Pricing
            </p>
            <h1
              className="mt-3 font-bold text-4xl tracking-tight sm:text-5xl md:text-6xl"
              style={{ color: "var(--landing-text)" }}
            >
              Simple, transparent
              <br />
              pricing
            </h1>
            <p
              className="mt-4 text-lg leading-relaxed md:text-xl"
              style={{ color: "var(--landing-text-muted)" }}
            >
              Pay per project. No subscriptions, no hidden fees.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="px-6 pb-24">
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
            <PricingCard
              features={photoFeatures}
              icon={IconPhoto}
              per="per property"
              popular
              price="1000 NOK"
              title="Photo Enhancement"
            />
            <PricingCard
              features={videoFeatures}
              icon={IconMovie}
              per="per video"
              price="1000 NOK"
              title="Video Creation"
            />
          </div>
        </section>

        {/* FAQ Section */}
        <section
          className="px-6 py-24"
          style={{ backgroundColor: "var(--landing-bg-alt)" }}
        >
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <p
                className="font-semibold text-sm uppercase tracking-wider"
                style={{ color: "var(--landing-accent)" }}
              >
                FAQ
              </p>
              <h2
                className="mt-3 font-bold text-3xl tracking-tight sm:text-4xl"
                style={{ color: "var(--landing-text)" }}
              >
                Frequently asked questions
              </h2>
            </div>

            <div className="mt-12 space-y-4">
              {faqs.map((faq) => (
                <FaqItem
                  answer={faq.answer}
                  key={faq.question}
                  question={faq.question}
                />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-24">
          <div
            className="mx-auto max-w-4xl rounded-3xl px-8 py-16 text-center md:px-16"
            style={{
              backgroundColor: "var(--landing-card)",
              boxShadow: "0 25px 50px -12px var(--landing-shadow)",
              border: "1px solid var(--landing-border)",
            }}
          >
            <h2
              className="font-bold text-3xl tracking-tight sm:text-4xl"
              style={{ color: "var(--landing-text)" }}
            >
              Ready to get started?
            </h2>
            <p
              className="mx-auto mt-4 max-w-lg text-lg leading-relaxed"
              style={{ color: "var(--landing-text-muted)" }}
            >
              Transform your property photos today. No credit card required to
              try.
            </p>
            <div className="mt-8">
              <Link
                className="inline-flex h-12 items-center gap-2 rounded-full px-8 font-medium text-base transition-all duration-200 hover:scale-[1.03]"
                href="/sign-in"
                style={{
                  backgroundColor: "var(--landing-accent)",
                  color: "var(--landing-accent-foreground)",
                }}
              >
                Start for Free
                <IconArrowRight className="size-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
