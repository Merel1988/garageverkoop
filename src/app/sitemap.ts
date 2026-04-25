import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { registrationsOpen } from "@/lib/event";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const open = registrationsOpen();

  const entries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/kaart`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  ];

  if (open) {
    entries.push(
      { url: `${SITE_URL}/meedoen`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
      { url: `${SITE_URL}/aanmelden`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    );
  }

  return entries;
}
