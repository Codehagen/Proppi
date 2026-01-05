export const siteConfig = {
  name: "AI Studio",
  description: "AI-powered real estate photo editor",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://aistudio.com",

  // Email settings
  email: {
    from: "noreply@aistudio.com",
    replyTo: "support@aistudio.com",
  },

  // Links
  links: {
    dashboard: "/dashboard",
    settings: "/dashboard/settings",
    help: "/help",
  },
} as const;

export type SiteConfig = typeof siteConfig;
