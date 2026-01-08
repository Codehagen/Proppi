import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HelpArticlePage } from "@/components/landing/help-article-page";
import {
  getAllHelpArticlePaths,
  getCategoryBySlug,
  getHelpArticle,
  getRelatedArticles,
} from "@/lib/help";

interface HelpArticlePageProps {
  params: Promise<{ category: string; slug: string }>;
}

export function generateStaticParams() {
  const paths = getAllHelpArticlePaths();
  return paths.map(({ category, slug }) => ({
    category,
    slug,
  }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: HelpArticlePageProps): Promise<Metadata> {
  const { category: categorySlug, slug } = await params;
  const article = await getHelpArticle(categorySlug, slug);

  if (!article) {
    return {
      title: "Article Not Found | Proppi Help",
    };
  }

  return {
    title: `${article.title} | Proppi Help`,
    description: article.description,
  };
}

export default async function HelpArticle({ params }: HelpArticlePageProps) {
  const { category: categorySlug, slug } = await params;

  const article = await getHelpArticle(categorySlug, slug);
  const category = getCategoryBySlug(categorySlug);

  if (!article || !category) {
    notFound();
  }

  const relatedArticles = getRelatedArticles(slug, categorySlug, 3);

  return (
    <HelpArticlePage
      article={article}
      category={category}
      relatedArticles={relatedArticles}
    />
  );
}
