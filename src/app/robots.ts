import type { MetadataRoute } from "next";
import { absoluteUrl, siteOrigin } from "@/lib/site/origin";
import { privatePaths } from "@/lib/site/public-paths";

export default function robots(): MetadataRoute.Robots {
  const origin = siteOrigin();
  return {
    rules: { userAgent: "*", allow: "/", disallow: [...privatePaths] },
    sitemap: absoluteUrl("/sitemap.xml", origin),
    ...(origin.startsWith("https://") ? { host: new URL(origin).host } : {}),
  };
}
