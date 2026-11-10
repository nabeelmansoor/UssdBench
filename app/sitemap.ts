import type { MetadataRoute } from "next";
import { SITE_PAGES, siteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return SITE_PAGES.map(({ path, changeFrequency, priority }) => ({
    url: siteUrl(path),
    changeFrequency,
    priority,
  }));
}
