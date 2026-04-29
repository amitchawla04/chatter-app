import type { MetadataRoute } from "next";

const BASE = "https://chatter-ten-lemon.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/api/",
          "/auth/bypass",
          "/auth/bootstrap",
          "/auth/callback",
          "/founder",
          "/founder/invites",
          "/moderation",
          "/onboarding",
          "/settings",
          "/passes",
          "/saved",
          "/activity",
          "/v/",
          "/compose",
        ],
      },
      {
        // Crawler hints — block AI training bots per Pact 11 (no AI training on user content)
        userAgent: ["GPTBot", "ChatGPT-User", "Claude-Web", "anthropic-ai", "CCBot", "Google-Extended"],
        disallow: "/",
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
