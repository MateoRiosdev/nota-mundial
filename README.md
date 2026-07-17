# Nota Mundial (ex "Calculadora de Notas a nivel Global")

Calculadora de promedio de calificaciones global, internacionalización profesional (`next-intl`), búsqueda
de países vía `restcountries.com` y guardado local de calificaciones.

## Instalación

```bash
npm install
npm run dev
```

Abre `http://localhost:3000` — el middleware te redirige automáticamente a
`/es` o `/en` según tu cookie guardada o el header `Accept-Language` de tu
navegador.

## Qué incluye

- **i18n con next-intl**: rutas localizadas `/es` y `/en`, detección por
  `Accept-Language`, selector manual, cookie `NEXT_LOCALE` con prioridad sobre
  la detección automática, mensajes 100% en JSON (`messages/es.json`,
  `messages/en.json`), carga perezosa de traducciones, `generateStaticParams`
  + Server Components para SEO y rendimiento.
- **Selector de idioma**: bandera del idioma activo + icono de planeta que
  abre un listado accesible (ARIA) con `es`/`en` activos y `pt/fr/de/it/ja/ko/zh`
  ya listados como "próximamente" — agregar un idioma nuevo solo requiere
  crear su `messages/<locale>.json` y sumarlo a `i18n/routing.ts`.
- **SEO**: `public/robots.txt`, `public/sitemap.xml` (con hreflang `es`/`en`),
  metadatos dinámicos y `alternates.languages` por locale en
  `app/[locale]/layout.tsx`.
- **Calculadora**: modo "Promedio Actual" (evaluaciones editables, agregar/quitar
  filas, porcentaje libre).
  Todo se calcula internamente en escala 0-100 y se convierte a la escala del
  país seleccionado (`lib/gradingSystems.ts`, ya incluye MX, ES, AR, CO, PE,
  CL, VE, EC, CR, GT — agregar un país nuevo es una entrada más en ese archivo).
- **Países**: `CountrySelector` consume `https://restcountries.com/v3.1`
  con buscador + filtro de continente, mostrando un skeleton (`components/Skeleton.tsx`,
  inspirado en el patrón de `0xGF/boneyard`) mientras carga.
- **Guardado de calificaciones**: `lib/useSavedGrades.ts` persiste en
  `localStorage`, sobrevive a refrescos de página y muestra el contador
  (`Guardadas (1)`, `(2)`, ...).
- **Modal animado**: `components/AnimatedModal.tsx` con `framer-motion`
  (entrada y salida animadas al presionar "Calcular Calificación Final").
- **Footer**: crédito enlazado a
  `https://www.linkedin.com/in/mateojuliogomerorios/`.

## Notas honestas sobre el alcance

Este es un proyecto de gran alcance (i18n completo + SEO + API externa +
persistencia + animaciones). `npm install` y `npm run build` ya se
ejecutaron y compilaron con éxito en el entorno de desarrollo (Next.js
14.2.35, generando `/es` y `/en` estáticos), así que puedes clonarlo y
correr `npm run dev` directamente.

La librería `boneyard` (https://github.com/0xGF/boneyard) no está publicada
en npm, así que se replicó su patrón de "skeleton por bloques con shimmer"
como componente propio (`components/Skeleton.tsx`) en vez de instalarla
directo desde GitHub.

Los 10 países pedidos (México, España, Argentina, Colombia, Perú, Chile,
Venezuela, Ecuador, Costa Rica, Guatemala) tienen su conversión de escala
lista; el resto de los ~250 países de `restcountries.com` se pueden
seleccionar igual y usan una escala genérica 0-100 hasta que les agregues su
conversión específica en `lib/gradingSystems.ts`.
