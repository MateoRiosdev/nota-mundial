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
    locales.map((l) => [l, `https://www.notamundial.com/${l}`])
  );

  return {
    title: t('title'),
    description: t('description'),
    metadataBase: new URL('https://www.notamundial.com'),
    alternates: {
      canonical: `https://www.notamundial.com/${locale}`,
      languages: { ...languages, 'x-default': 'https://www.notamundial.com/es' }
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      locale,
      url: `https://www.notamundial.com/${locale}`,
      type: 'website'
    }
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

  // Habilita renderizado estático para este locale (App Router + next-intl).
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Header />
          <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
