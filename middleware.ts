import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';
import { routing, locales } from './i18n/routing';
import { getCountryLocale, getVisitorCountry } from './lib/geolocation';

const handleI18n = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const hasLocale = locales.some(locale => request.nextUrl.pathname === `/${locale}` || request.nextUrl.pathname.startsWith(`/${locale}/`));
  if (hasLocale) return handleI18n(request);

  // Manual choices survive IP changes; automatic choices are recalculated on entry.
  const manual = request.cookies.get('USER_LOCALE')?.value;
  const locale = locales.includes(manual as typeof locales[number])
    ? manual! : getCountryLocale(getVisitorCountry(request.headers));
  request.cookies.set('NEXT_LOCALE', locale);
  const headers = new Headers(request.headers);
  headers.set('accept-language', locale);
  headers.set('cookie', request.cookies.toString());
  return handleI18n(new NextRequest(request, { headers }));
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)']
};
