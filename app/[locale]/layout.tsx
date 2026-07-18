import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
import { Metadata } from 'next';
import { routing, locales } from '@/i18n/routing';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import '../globals.css';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  const languages = Object.fromEntries(
    locales.map((l) => [l, `https://nota-mundial.vercel.app/${l}`])
  );

  return {
    title: t('title'),
    description: t('description'),

    // ═══ Favicons ═══
    icons: {
      icon: [
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/favicon.ico', sizes: 'any' },
      ],
      shortcut: '/favicon.svg',
      apple: '/favicon.svg',
    },

    // ═══ Open Graph ═══
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `https://nota-mundial.vercel.app/${locale}`,
      siteName: 'Nota Mundial',
      locale,
      type: 'website',
    },

    // ═══ SEO ═══
    metadataBase: new URL('https://nota-mundial.vercel.app'),
    alternates: {
      canonical: `/${locale}`,
      languages: { ...languages, 'x-default': '/es' },
    },
  };
}

export default async function LocaleLayout({
  children,
  params
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
          <Header />
          {/* max-w-7xl para consistencia con Header */}
          <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}