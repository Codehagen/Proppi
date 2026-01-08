import {
  IconArrowLeft,
  IconCalendar,
  IconClock,
  IconUser,
} from "@tabler/icons-react";
import Link from "next/link";
import type { BlogPost, BlogPostMeta } from "@/lib/blog";
import { BlogCard } from "./blog-card";
import { LandingFooter } from "./landing-footer";
import { LandingNav } from "./landing-nav";

interface BlogPostPageProps {
  post: BlogPost;
  relatedPosts: BlogPostMeta[];
}

export function BlogPostPage({ post, relatedPosts }: BlogPostPageProps) {
  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--landing-bg)" }}
    >
      <LandingNav />

      <main>
        {/* Hero Section */}
        <section className="px-6 pt-20 pb-12 md:pt-28 md:pb-16">
          <div className="mx-auto max-w-3xl">
            {/* Back link */}
            <Link
              className="mb-8 inline-flex items-center gap-2 text-sm transition-colors hover:opacity-70"
              href="/blog"
              style={{ color: "var(--landing-text-muted)" }}
            >
              <IconArrowLeft className="size-4" />
              Back to blog
            </Link>

            {/* Category */}
            <div className="mb-4">
              <span
                className="rounded-full px-3 py-1 font-medium text-xs"
                style={{
                  backgroundColor: "var(--landing-accent)",
                  color: "var(--landing-accent-foreground)",
                }}
              >
                {post.category}
              </span>
            </div>

            {/* Title */}
            <h1
              className="font-bold text-3xl leading-tight tracking-tight sm:text-4xl md:text-5xl"
              style={{ color: "var(--landing-text)" }}
            >
              {post.title}
            </h1>

            {/* Description */}
            <p
              className="mt-6 text-lg leading-relaxed md:text-xl"
              style={{ color: "var(--landing-text-muted)" }}
            >
              {post.description}
            </p>

            {/* Meta */}
            <div
              className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t pt-6 text-sm"
              style={{
                color: "var(--landing-text-muted)",
                borderColor: "var(--landing-border)",
              }}
            >
              <span className="flex items-center gap-2">
                <IconUser className="size-4" />
                {post.author}
              </span>
              <span className="flex items-center gap-2">
                <IconCalendar className="size-4" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-2">
                <IconClock className="size-4" />
                {post.readingTime}&nbsp;min read
              </span>
            </div>
          </div>
        </section>

        {/* Featured Image Placeholder */}
        <section className="px-6 pb-12">
          <div className="mx-auto max-w-4xl">
            <div
              className="flex aspect-[21/9] items-center justify-center rounded-3xl"
              style={{
                backgroundColor: "var(--landing-bg-alt)",
                border: "1px solid var(--landing-border)",
              }}
            >
              <div
                className="font-bold text-6xl opacity-10"
                style={{ color: "var(--landing-accent)" }}
              >
                Proppi
              </div>
            </div>
          </div>
        </section>

        {/* Article Content */}
        <section className="px-6 pb-16">
          <article className="mx-auto max-w-3xl">
            <div
              className="prose prose-lg max-w-none"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: Sanitized markdown content
              dangerouslySetInnerHTML={{ __html: post.content }}
              style={
                {
                  "--tw-prose-body": "var(--landing-text-muted)",
                  "--tw-prose-headings": "var(--landing-text)",
                  "--tw-prose-links": "var(--landing-accent)",
                  "--tw-prose-bold": "var(--landing-text)",
                  "--tw-prose-bullets": "var(--landing-accent)",
                  "--tw-prose-counters": "var(--landing-accent)",
                  "--tw-prose-quotes": "var(--landing-text)",
                  "--tw-prose-quote-borders": "var(--landing-accent)",
                  "--tw-prose-code": "var(--landing-text)",
                  "--tw-prose-pre-code": "var(--landing-text-muted)",
                  "--tw-prose-pre-bg": "var(--landing-bg-alt)",
                } as React.CSSProperties
              }
            />
          </article>
        </section>

        {/* Author Section */}
        <section className="px-6 pb-16">
          <div className="mx-auto max-w-3xl">
            <div
              className="rounded-2xl p-6 md:p-8"
              style={{
                backgroundColor: "var(--landing-card)",
                border: "1px solid var(--landing-border)",
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="flex size-14 shrink-0 items-center justify-center rounded-full font-semibold text-lg"
                  style={{
                    backgroundColor: "var(--landing-bg-alt)",
                    color: "var(--landing-accent)",
                  }}
                >
                  {post.author
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <p
                    className="font-semibold"
                    style={{ color: "var(--landing-text)" }}
                  >
                    {post.author}
                  </p>
                  <p
                    className="mt-1 text-sm leading-relaxed"
                    style={{ color: "var(--landing-text-muted)" }}
                  >
                    Helping real estate professionals create stunning property
                    listings with AI-powered photo enhancement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section
            className="px-6 py-16"
            style={{ backgroundColor: "var(--landing-bg-alt)" }}
          >
            <div className="mx-auto max-w-5xl">
              <h2
                className="mb-8 text-center font-bold text-2xl tracking-tight sm:text-3xl"
                style={{ color: "var(--landing-text)" }}
              >
                Related Articles
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map((relatedPost) => (
                  <BlogCard key={relatedPost.slug} post={relatedPost} />
                ))}
              </div>
            </div>
          </section>
        )}

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
              Ready to transform your listings?
            </h2>
            <p
              className="mx-auto mt-4 max-w-lg text-lg leading-relaxed"
              style={{ color: "var(--landing-text-muted)" }}
            >
              Join thousands of real estate professionals who use Proppi to
              create stunning property photos.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                className="inline-flex h-12 items-center rounded-full px-8 font-medium text-base transition-all duration-200 hover:scale-[1.03]"
                href="/dashboard"
                style={{
                  backgroundColor: "var(--landing-accent)",
                  color: "var(--landing-accent-foreground)",
                }}
              >
                Try Proppi Free
              </Link>
              <Link
                className="inline-flex h-12 items-center rounded-full px-8 font-medium text-base transition-colors hover:opacity-80"
                href="/blog"
                style={{
                  backgroundColor: "var(--landing-bg)",
                  color: "var(--landing-text)",
                  border: "1px solid var(--landing-border)",
                }}
              >
                Read More Articles
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
