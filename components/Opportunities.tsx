'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowUpRight, Compass, GraduationCap, BriefcaseBusiness, ChevronDown } from 'lucide-react';
import { getCountryName } from '@/lib/countries';
import { opportunitiesFor } from '@/lib/opportunities';

export function Opportunities({ countryCode }: { countryCode: string | null }) {
  const t = useTranslations('opportunities');
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'study' | 'work'>('all');
  const [query, setQuery] = useState('');
  const countryName = countryCode ? getCountryName(countryCode, locale) : '';
  const resources = countryCode ? opportunitiesFor(countryCode).filter(item =>
    (filter === 'all' || item.kind === filter) && `${item.name} ${locale === 'es' ? item.es : item.en}`.toLocaleLowerCase(locale).includes(query.trim().toLocaleLowerCase(locale))
  ) : [];
  return (
    <details className="surface group" onToggle={event => setOpen(event.currentTarget.open)}>
      <summary className="flex cursor-pointer list-none items-center gap-3 p-4 sm:p-5 [&::-webkit-details-marker]:hidden">
        <span className="rounded-xl bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-950 dark:text-blue-300"><Compass size={22} /></span>
        <span className="min-w-0 flex-1"><span className="block font-bold">{t('title')}</span><span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{countryCode ? t('subtitle', { country: countryName }) : t('chooseCountry')}</span></span>
        <ChevronDown size={18} className="shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      {open && <div className="border-t border-slate-200 p-4 dark:border-slate-700 sm:p-5">
        {!countryCode ? <p className="text-sm text-slate-500 dark:text-slate-400">{t('chooseCountry')}</p> : <>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input type="search" value={query} onChange={event => setQuery(event.target.value)} aria-label={t('search')} placeholder={t('search')} className="field min-w-0 sm:flex-1" />
              <div className="flex flex-wrap gap-2" aria-label={t('filter')}>
                {(['all', 'study', 'work'] as const).map(id => <button type="button" key={id} onClick={() => setFilter(id)} aria-pressed={filter === id} className={`course-chip ${filter === id ? 'active' : ''}`}>{t(id)}</button>)}
              </div>
            </div>
            <p className="mb-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{t('directoryHint')}</p>
            <div className="grid gap-3 md:grid-cols-2">
              {resources.map(item => <article key={item.url} className="flex flex-col rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                <div className="mb-3 flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">{item.kind === 'study' ? <GraduationCap size={16} /> : <BriefcaseBusiness size={16} />}{t(item.kind)}<span className="ml-auto text-slate-500 dark:text-slate-400">{item.country ? countryName : t('international')}</span></div>
                <h3 className="font-semibold">{item.name}</h3>
                <p className="mb-4 mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{locale === 'es' ? item.es : item.en}</p>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400">{t('official')}<ArrowUpRight size={16} /><span className="sr-only"> · {item.name} · {t('newTab')}</span></a>
              </article>)}
            </div>
            {!resources.length && <p role="status" className="py-5 text-sm text-slate-500">{t('noResources')}</p>}
        </>}
      </div>}
    </details>
  );
}
