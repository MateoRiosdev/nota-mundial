export const siteURL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://nota-mundial.vercel.app"
).replace(/\/$/, "");
export const siteLocales = [
  "es",
  "en",
  "pt",
  "fr",
  "de",
  "it",
  "ja",
  "ko",
  "zh",
] as const;
