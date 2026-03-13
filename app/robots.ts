import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://patra-digital-hub.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Allow all public content
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/dashboard"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
