import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HelpCategoryPage } from "@/components/landing/help-category-page";
import {
  getArticlesByCategory,
  getCategoryBySlug,
  helpCategories,
} from "@/lib/help";

interface HelpCategoryProps {
  params: Promise<{ category: string }>;
}

export function generateStaticParams() {
  return helpCategories.map((category) => ({
    category: category.slug,
  }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: HelpCategoryProps): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);

  if (!category) {
    return {
      title: "Category Not Found | Proppi Help",
    };
  }

  return {
    title: `${category.title} | Proppi Help`,
    description: category.description,
  };
}

export default async function HelpCategory({ params }: HelpCategoryProps) {
  const { category: categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);

  if (!category) {
    notFound();
  }

  const articles = getArticlesByCategory(categorySlug);

  return <HelpCategoryPage articles={articles} category={category} />;
}
