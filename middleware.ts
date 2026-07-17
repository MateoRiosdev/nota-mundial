import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// next-intl aplica esta prioridad automáticamente:
// 1) cookie NEXT_LOCALE (elección guardada por el usuario)
// 2) header Accept-Language del navegador
// 3) routing.defaultLocale
export default createMiddleware(routing);

export const config = {
  // No interceptar assets estáticos, API routes ni archivos de SEO.
  matcher: [
    '/((?!api|_next|_vercel|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)'
  ]
};
