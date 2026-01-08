import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import html from "remark-html";

const HELP_DIRECTORY = path.join(process.cwd(), "content/help");

// Category configuration
export const helpCategories = [
  {
    slug: "getting-started",
    title: "Getting Started",
    description: "Learn the basics of Proppi",
    icon: "IconRocket",
  },
  {
    slug: "editing",
    title: "Editing & Enhancement",
    description: "Style templates and processing options",
    icon: "IconWand",
  },
  {
    slug: "billing",
    title: "Billing & Credits",
    description: "Pricing, credits, and payments",
    icon: "IconCreditCard",
  },
  {
    slug: "account",
    title: "Account & Workspace",
    description: "Settings and team management",
    icon: "IconUser",
  },
] as const;

export type HelpCategory = (typeof helpCategories)[number];

export interface HelpArticle {
  slug: string;
  category: string;
  title: string;
  description: string;
  order: number;
  popular: boolean;
  content: string;
  readingTime: number;
}

export interface HelpArticleMeta {
  slug: string;
  category: string;
  title: string;
  description: string;
  order: number;
  popular: boolean;
  readingTime: number;
}

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export function getAllHelpArticles(): HelpArticleMeta[] {
  if (!fs.existsSync(HELP_DIRECTORY)) {
    return [];
  }

  const articles: HelpArticleMeta[] = [];

  // Read each category directory
  for (const category of helpCategories) {
    const categoryPath = path.join(HELP_DIRECTORY, category.slug);
    if (!fs.existsSync(categoryPath)) {
      continue;
    }

    const files = fs.readdirSync(categoryPath);
    for (const file of files) {
      if (!file.endsWith(".md")) continue;

      const slug = file.replace(/\.md$/, "");
      const fullPath = path.join(categoryPath, file);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);

      articles.push({
        slug,
        category: category.slug,
        title: data.title || "Untitled",
        description: data.description || "",
        order: data.order ?? 99,
        popular: data.popular ?? false,
        readingTime: calculateReadingTime(content),
      });
    }
  }

  // Sort by order within category
  return articles.sort((a, b) => a.order - b.order);
}

export function getPopularArticles(): HelpArticleMeta[] {
  return getAllHelpArticles().filter((article) => article.popular);
}

export function getArticlesByCategory(categorySlug: string): HelpArticleMeta[] {
  return getAllHelpArticles()
    .filter((article) => article.category === categorySlug)
    .sort((a, b) => a.order - b.order);
}

export function getCategoryBySlug(slug: string): HelpCategory | undefined {
  return helpCategories.find((cat) => cat.slug === slug);
}

export async function getHelpArticle(
  categorySlug: string,
  articleSlug: string
): Promise<HelpArticle | null> {
  const fullPath = path.join(HELP_DIRECTORY, categorySlug, `${articleSlug}.md`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const processedContent = await remark()
    .use(remarkGfm)
    .use(html, { sanitize: false })
    .process(content);
  const contentHtml = processedContent.toString();

  return {
    slug: articleSlug,
    category: categorySlug,
    title: data.title || "Untitled",
    description: data.description || "",
    order: data.order ?? 99,
    popular: data.popular ?? false,
    content: contentHtml,
    readingTime: calculateReadingTime(content),
  };
}

export function getAllHelpArticlePaths(): { category: string; slug: string }[] {
  const articles = getAllHelpArticles();
  return articles.map((article) => ({
    category: article.category,
    slug: article.slug,
  }));
}

export function getRelatedArticles(
  currentSlug: string,
  categorySlug: string,
  limit = 3
): HelpArticleMeta[] {
  return getArticlesByCategory(categorySlug)
    .filter((article) => article.slug !== currentSlug)
    .slice(0, limit);
}

export function searchHelpArticles(query: string): HelpArticleMeta[] {
  if (!query.trim()) return [];

  const searchLower = query.toLowerCase();
  return getAllHelpArticles().filter((article) => {
    const matchesTitle = article.title.toLowerCase().includes(searchLower);
    const matchesDescription = article.description
      .toLowerCase()
      .includes(searchLower);
    return matchesTitle || matchesDescription;
  });
}
