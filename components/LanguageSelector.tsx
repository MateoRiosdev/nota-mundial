'use client';

import { useState, useRef, useEffect } from 'react';
import { Globe2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import { locales, localeMeta } from '@/i18n/routing';
import { FlagIcon } from './FlagIcon';

function persistLocaleCookie(locale: string) {
  document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
}

export function LanguageSelector() {
  const locale = useLocale();
  const t = useTranslations('language');
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const currentMeta = localeMeta[locale] ?? localeMeta.en;

  function switchLocale(next: string) {
    persistLocaleCookie(next);
    // @ts-expect-error -- pathname/params tipados dinámicamente por next-intl
    router.replace({ pathname, params }, { locale: next });
    setOpen(false);
  }

  return (
    <div className="flex items-center gap-1.5" ref={ref}>
      {/* Bandera del idioma activo — FlagIcon SVG real */}
      <div
        className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
        title={currentMeta.label}
      >
        <FlagIcon code={currentMeta.countryCode} size="md" />
      </div>

      {/* Botón planeta */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={t('changeLanguage')}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <Globe2 size={18} />
        </button>

        {open && (
          <ul
            role="listbox"
            className="absolute right-0 z-50 mt-2 w-52 max-h-80 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 shadow-lg"
          >
            {locales.map((code) => (
              <li key={code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={code === locale}
                  onClick={() => switchLocale(code)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                    code === locale
                      ? 'font-semibold text-brand-600 bg-brand-50 dark:bg-brand-700/20'
                      : ''
                  }`}
                >
                  <FlagIcon code={localeMeta[code].countryCode} size="sm" />
                  <span>{localeMeta[code].label}</span>
                  {code === locale && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-brand-500" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}