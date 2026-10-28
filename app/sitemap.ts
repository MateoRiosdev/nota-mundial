import type { MetadataRoute } from "next";
import { siteURL, siteLocales } from "@/lib/site";
export default function sitemap(): MetadataRoute.Sitemap {
  const languages = {
    ...Object.fromEntries(
      siteLocales.map((locale) => [locale, `${siteURL}/${locale}`]),
    ),
    "x-default": siteURL,
  };
  return [
    {
      url: siteURL,
      changeFrequency: "monthly",
      priority: 1,
      alternates: { languages },
    },
    ...siteLocales.map((locale) => ({
      url: `${siteURL}/${locale}`,
      changeFrequency: "monthly" as const,
      priority: 0.9,
      alternates: { languages },
    })),
  ];
}
