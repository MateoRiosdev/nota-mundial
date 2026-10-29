'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowUpRight, Compass, GraduationCap, BriefcaseBusiness, Newspaper, ChevronDown } from 'lucide-react';
import { getCountryName } from '@/lib/countries';
import { opportunitiesFor } from '@/lib/opportunities';
import type { NewsResult } from '@/lib/news';

export function Opportunities({ countryCode }: { countryCode: string | null }) {
  const t = useTranslations('opportunities');
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'resources' | 'news'>('resources');
  const [filter, setFilter] = useState<'all' | 'study' | 'work'>('all');
  const [query, setQuery] = useState('');
  const [retry, setRetry] = useState(0);
  const [news, setNews] = useState<{ country: string; result: NewsResult } | null>(null);
  const countryName = countryCode ? getCountryName(countryCode, locale) : '';
  useEffect(() => {
    if (!open || view !== 'news' || !countryCode) return;
    const controller = new AbortController();
    setNews(null);
    fetch(`/api/news?country=${encodeURIComponent(countryCode)}`, { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error('News unavailable');
        return response.json() as Promise<NewsResult>;
      })
      .then(result => { if (!controller.signal.aborted) setNews({ country: countryCode, result }); })
      .catch(() => { if (!controller.signal.aborted) setNews({ country: countryCode, result: { status: 'unavailable', articles: [] } }); });
    return () => controller.abort();
  }, [countryCode, open, view, retry]);
  const result = news?.country === countryCode ? news.result : null;
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
          <nav aria-label={t('navigation')} className="mb-5 flex flex-wrap gap-2">
            {(['resources', 'news'] as const).map(id => <button type="button" key={id} aria-pressed={view === id} onClick={() => setView(id)} className={view === id ? 'button-primary' : 'button-secondary'}>{id === 'resources' ? <GraduationCap size={17} /> : <Newspaper size={17} />}{t(id)}</button>)}
          </nav>
          {view === 'resources' ? <>
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
          </> : <div aria-live="polite" aria-busy={!result}>
            <p className="mb-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{t('newsHint', { country: countryName })}</p>
            {!result ? <p className="py-6 text-sm">{t('loading')}</p> : result.status === 'unavailable' ? <div className="rounded-xl bg-slate-50 p-5 dark:bg-slate-900"><p className="text-sm">{t('unavailable')}</p><button type="button" className="button-secondary mt-3" onClick={() => setRetry(value => value + 1)}>{t('retry')}</button></div> : !result.articles.length ? <p className="py-6 text-sm">{t('empty')}</p> : <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {result.articles.map(article => <article key={article.url} className="flex flex-col rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                <div className="mb-3 flex flex-wrap justify-between gap-2 text-xs text-slate-500 dark:text-slate-400"><span>{article.source}</span>{article.publishedAt && <time dateTime={article.publishedAt}>{new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(article.publishedAt))}</time>}</div>
                <h3 className="font-semibold leading-snug">{article.title}</h3>
                <p className="mb-4 mt-2 line-clamp-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{article.description}</p>
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400">{t('read')}<ArrowUpRight size={16} /><span className="sr-only"> · {article.title} · {t('newTab')}</span></a>
              </article>)}
            </div>}
            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">{t('poweredBy')} <a className="underline" href="https://newsdata.io/" target="_blank" rel="noopener noreferrer">NewsData.io</a></p>
          </div>}
        </>}
      </div>}
    </details>
  );
}
