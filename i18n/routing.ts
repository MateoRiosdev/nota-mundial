import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const locales = ['es', 'en', 'pt', 'fr', 'de', 'it', 'ja', 'ko', 'zh'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'es';

export const comingSoonLocales: readonly string[] = [];

export const localeMeta: Record<string, { label: string; countryCode: string }> = {
  es: { label: 'Español',   countryCode: 'es' },
  en: { label: 'English',   countryCode: 'us' },
  pt: { label: 'Português', countryCode: 'br' },
  fr: { label: 'Français',  countryCode: 'fr' },
  de: { label: 'Deutsch',   countryCode: 'de' },
  it: { label: 'Italiano',  countryCode: 'it' },
  ja: { label: '日本語',     countryCode: 'jp' },
  ko: { label: '한국어',     countryCode: 'kr' },
  zh: { label: '中文',       countryCode: 'cn' },
};

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);