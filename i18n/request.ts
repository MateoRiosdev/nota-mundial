import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale =
    requested && routing.locales.includes(requested as (typeof routing.locales)[number])
      ? requested
      : routing.defaultLocale;

  // Carga perezosa: solo se importa el JSON del idioma activo.
  const messages = (await import(`../messages/${locale}.json`)).default;

  return { locale, messages };
});
