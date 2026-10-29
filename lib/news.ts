export type NewsArticle = { title: string; description: string; url: string; source: string; publishedAt: string | null };
export type NewsResult = { status: 'ok' | 'unavailable'; articles: NewsArticle[] };

const queries: Record<string, string> = {
  PE: 'educación OR becas OR empleo', ES: 'educación OR becas OR empleo',
  MX: 'educación OR becas OR empleo', CO: 'educación OR becas OR empleo',
  CL: 'educación OR becas OR empleo', AR: 'educación OR becas OR empleo',
  EC: 'educación OR becas OR empleo', BO: 'educación OR becas OR empleo',
  BR: 'educação OR bolsas OR emprego', PT: 'educação OR bolsas OR emprego',
  FR: 'éducation OR bourses OR emploi', DE: 'Bildung OR Stipendium OR Ausbildung',
  IT: 'istruzione OR borse OR lavoro', JP: '教育 OR 奨学金 OR 就職',
  KR: '교육 OR 장학금 OR 취업', CN: '教育 OR 奖学金 OR 就业',
};
export function newsURL(country: string, key: string) {
  const url = new URL('https://newsdata.io/api/1/latest');
  url.search = new URLSearchParams({ apikey: key, country: country.toLowerCase(), q: queries[country] || 'education OR scholarship OR employment' }).toString();
  return url;
}
export function normalizeArticles(data: unknown): NewsArticle[] {
  if (!data || typeof data !== 'object' || !('status' in data) || data.status !== 'success' || !('results' in data) || !Array.isArray(data.results)) throw new Error('Invalid news response');
  const seen = new Set<string>();
  return data.results.flatMap((item): NewsArticle[] => {
    if (!item || typeof item.title !== 'string' || !item.title.trim() || typeof item.link !== 'string') return [];
    let url: URL;
    try { url = new URL(item.link); } catch { return []; }
    if (url.protocol !== 'https:' || url.username || url.password || seen.has(url.href)) return [];
    seen.add(url.href);
    const rawDate = typeof item.pubDate === 'string' ? item.pubDate.trim().replace(' ', 'T') : '';
    const date = rawDate ? new Date(/(?:Z|[+-]\d\d:\d\d)$/.test(rawDate) ? rawDate : `${rawDate}Z`) : null;
    return [{ title: item.title.trim().slice(0, 240), description: typeof item.description === 'string' ? item.description.slice(0, 350) : '', url: url.href, source: typeof item.source_name === 'string' ? item.source_name.slice(0, 80) : url.hostname, publishedAt: date && Number.isFinite(date.getTime()) ? date.toISOString() : null }];
  }).slice(0, 6);
}

// One request per country/hour per server instance, coalescing concurrent visitors.
// Failures get a shorter cooldown. Neither keys nor upstream errors are returned.
export function createNewsService(getKey: () => string | undefined, request: typeof fetch = fetch, now = Date.now) {
  const cache = new Map<string, { until: number; result: NewsResult }>();
  const pending = new Map<string, Promise<NewsResult>>();
  return async (country: string): Promise<NewsResult> => {
    const key = getKey();
    if (!key) return { status: 'unavailable', articles: [] };
    const hit = cache.get(country);
    if (hit && hit.until > now()) return hit.result;
    const existing = pending.get(country);
    if (existing) return existing;
    const work = (async (): Promise<NewsResult> => {
      let result: NewsResult;
      try {
        const response = await request(newsURL(country, key), { signal: AbortSignal.timeout(8000), cache: 'no-store', redirect: 'error' });
        if (!response.ok) throw new Error('News unavailable');
        result = { status: 'ok', articles: normalizeArticles(await response.json()) };
      } catch { result = { status: 'unavailable', articles: [] }; }
      cache.set(country, { until: now() + (result.status === 'ok' ? 3600000 : 300000), result });
      return result;
    })();
    pending.set(country, work);
    try { return await work; } finally { pending.delete(country); }
  };
}
