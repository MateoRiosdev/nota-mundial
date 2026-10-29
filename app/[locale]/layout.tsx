import { NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { notFound } from "next/navigation";
import { ReactNode } from "react";
import { Metadata } from "next";
import { siteURL } from "@/lib/site";
import { routing, locales } from "@/i18n/routing";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "../globals.css";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  const languages = Object.fromEntries(
    locales.map((l) => [l, `${siteURL}/${l}`]),
  );

  return {
    title: t("title"),
    description: t("description"),

    // ═══ Favicons ═══
    icons: { icon: { url: "/favicon.svg", type: "image/svg+xml" }, shortcut: "/favicon.svg", apple: "/logo.png" },

    // ═══ Open Graph ═══
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: `${siteURL}/${locale}`,
      siteName: "Nota Mundial",
      locale,
      type: "website",
      images: [{ url: "/logo.png", alt: "Nota Mundial" }],
    },

    twitter: {
      card: "summary",
      title: t("title"),
      description: t("description"),
      images: ["/logo.png"],
    },
    robots: { index: true, follow: true },

    // ═══ SEO ═══
    metadataBase: new URL(siteURL),
    alternates: {
      canonical: `/${locale}`,
      languages: { ...languages, "x-default": "/" },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as (typeof locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebApplication",
                name: "Nota Mundial",
                url: `${siteURL}/${locale}`,
                applicationCategory: "EducationalApplication",
                operatingSystem: "Web",
                inLanguage: locale,
                offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
              }).replace(/</g, "\\u003c"),
            }}
          />
          <Header />
          {/* max-w-7xl para consistencia con Header */}
          <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-3">
            {children}
          </main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
