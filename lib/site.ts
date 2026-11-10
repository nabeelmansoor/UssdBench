// Public origin of the deployed site. NEXT_PUBLIC_SITE_URL is read at build time, so set it in the Cloudflare Pages
// build variables to build for a custom domain.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://ussdbench.pages.dev").replace(/\/+$/, "");

// Every page that renders content. Redirect-only paths (public/_redirects) and verification files are not pages.
export const SITE_PAGES = [
  { path: "/", changeFrequency: "monthly", priority: 1 },
  { path: "/ussd", changeFrequency: "monthly", priority: 0.9 },
  { path: "/sms", changeFrequency: "monthly", priority: 0.9 },
  { path: "/about", changeFrequency: "yearly", priority: 0.5 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.3 },
] as const;

export type SitePath = (typeof SITE_PAGES)[number]["path"];

export function siteUrl(path: SitePath): string {
  return path === "/" ? SITE_URL : `${SITE_URL}${path}`;
}
