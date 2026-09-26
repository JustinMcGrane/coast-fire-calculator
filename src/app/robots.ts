import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const disallow = ["/api/", "/dashboard", "/auth/"];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow,
      },
      // Explicit allow rules for AI answer-engine crawlers, so this site can
      // be cited by ChatGPT, Claude, and Perplexity. GPTBot and
      // Google-Extended are intentionally left with no dedicated rule here —
      // they fall through to the wildcard rule above, unchanged.
      { userAgent: "OAI-SearchBot", allow: "/", disallow },
      { userAgent: "ChatGPT-User", allow: "/", disallow },
      { userAgent: "ClaudeBot", allow: "/", disallow },
      { userAgent: "PerplexityBot", allow: "/", disallow },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
