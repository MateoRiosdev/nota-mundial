'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { CustomSelect } from './planner/CustomSelect';
import { Skeleton } from './Skeleton';
import { FlagIcon } from './FlagIcon';
import { getCountryName } from '@/lib/countries';
import { getGradingSystem, supportedCountryOrder } from '@/lib/gradingSystems';

type RestCountry = {
  cca2: string;
  name: { common: string; nativeName?: Record<string, { common: string }> };
  translations?: Record<string, { common: string; official: string }>;
  region: string;
  flags: { svg: string; png: string };
};

const CONTINENTS = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania'] as const;
const PAGE_SIZE = 12;

function getLocalName(country: RestCountry, locale: string): string {
  return getCountryName(country.cca2, locale);
}

export function CountrySelector({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (cca2: string, localName: string) => void;
}) {
  const t  = useTranslations('countrySelector');
  const locale = useLocale();

  const [countries, setCountries]   = useState<RestCountry[]>([]);
  const [status, setStatus]         = useState<'loading' | 'ready' | 'error'>('loading');
  const [query, setQuery]           = useState('');
  const [continent, setContinent]   = useState('all');
  const [page, setPage]             = useState(0);
  const [retryKey, setRetryKey]     = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setCountries([]);

    // Pedimos también el campo translations para tener nombres localizados
    fetch('/api/countries')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: unknown) => {
        if (cancelled) return;
        if (!Array.isArray(data)) { setStatus('error'); return; }
        setCountries(data as RestCountry[]);
        setStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('[CountrySelector]', err);
        setStatus('error');
      });

    return () => { cancelled = true; };
  }, [retryKey]);

  useEffect(() => { setPage(0); }, [query, continent]);

  const supportedSet = useMemo(() => new Set(supportedCountryOrder), []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return countries
      .filter((c) => continent === 'all' || c.region === continent)
      .filter((c) => {
        const localName = getLocalName(c, locale).toLowerCase();
        return localName.includes(q) || c.name.common.toLowerCase().includes(q) || c.cca2.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        const sa = supportedSet.has(a.cca2) ? 0 : 1;
        const sb = supportedSet.has(b.cca2) ? 0 : 1;
        if (sa !== sb) return sa - sb;
        return getLocalName(a, locale).localeCompare(getLocalName(b, locale));
      });
  }, [countries, continent, query, locale, supportedSet]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
          {/* Info país seleccionado */}
          {selected && (
            <div className="mb-4 flex items-center gap-3 rounded-lg bg-slate-50 dark:bg-slate-700/40 p-3">
              <FlagIcon code={selected} size="lg" />
              <div>
                {/* Nombre en idioma local */}
                <p className="text-sm font-semibold">
                  {getLocalName(
                    countries.find((c) => c.cca2 === selected) ?? {
                      cca2: selected,
                      name: { common: selected },
                      region: '',
                      flags: { svg: '', png: '' },
                    },
                    locale
                  )}
                </p>
                {/* Escala del país */}
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('scaleLabel')}:{' '}
                  <strong className="text-slate-700 dark:text-slate-200">
                    {getGradingSystem(selected).scaleLabel}
                    {!supportedSet.has(selected) && ` (${t('genericScale')})`}
                  </strong>
                </p>
              </div>
            </div>
          )}
      <h3 className="mb-3 text-lg font-semibold">{t('title')}</h3>

      {/* ── Filtros ── */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        {/* Buscador */}
        <div className="relative flex-1">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
          <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent py-2 pl-9 pr-10 text-sm outline-none focus:ring-2 focus:ring-brand-500"
        />
        
        {query && (
        <button
          type="button"
          onClick={() => setQuery('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          aria-label={t('clearSearch')}
        >
          <X size={16} />
        </button>
      )}
    </div>

        {/* Select de continente — ancho fijo para que la flecha no se vaya lejos */}
        <CustomSelect label={t('continentAll')} value={continent} onChange={setContinent} options={[{value:'all',label:t('continentAll')},...CONTINENTS.map(c=>({value:c,label:t(`continents.${c}`)}))]} className="w-full sm:w-52"/>

      </div>

      {/* ── Loading ── */}
      {status === 'loading' && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      )}

      {/* ── Error ── */}
      {status === 'error' && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 text-center">
          <p className="text-sm text-red-600 dark:text-red-400">{t('error')}</p>
          <button
            type="button"
            onClick={() => setRetryKey((k) => k + 1)}
            className="mt-2 text-xs text-red-500 underline hover:no-underline"
          >
            {t('retry')}
          </button>
        </div>
      )}

      {/* ── Ready ── */}
      {status === 'ready' && (
        <>
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              {t('noResults')}
            </p>
          ) : (
            <>
              {/* Grid de países */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {paginated.map((c) => {
                  const gs        = getGradingSystem(c.cca2);
                  const hasScale  = supportedSet.has(c.cca2);
                  const localName = getLocalName(c, locale);

                  return (
                    <button
                      key={c.cca2}
                      type="button"
                      onClick={() => onSelect(c.cca2, getLocalName(c, locale))}
                      className={`flex items-center gap-2 rounded-lg border px-2 py-2 text-left text-xs transition-colors ${
                        selected === c.cca2
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-700/20 font-semibold'
                          : 'border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                      title={localName}
                    >
                      <FlagIcon code={c.cca2} size="sm" />

                      <span className="flex-1 truncate">{localName}</span>

                      {/* Badge de escala en lugar del punto verde */}
                      {(
                        <span className="flex-shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700 dark:text-emerald-300 leading-tight whitespace-nowrap">
                          {gs.scaleLabel}{!hasScale ? '*' : ''}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {t('pagination', { start: page * PAGE_SIZE + 1, end: Math.min((page + 1) * PAGE_SIZE, filtered.length), total: filtered.length })}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="rounded-lg border border-slate-300 dark:border-slate-600 p-1.5 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <ChevronLeft size={14} />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i)
                      .filter((i) => Math.abs(i - page) <= 2)
                      .map((i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setPage(i)}
                          className={`min-w-[28px] rounded-lg border px-2 py-1 text-xs transition-colors ${
                            i === page
                              ? 'border-brand-500 bg-brand-500 text-white font-bold'
                              : 'border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}

                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page === totalPages - 1}
                      className="rounded-lg border border-slate-300 dark:border-slate-600 p-1.5 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}


        </>
      )}
    </div>
  );
}