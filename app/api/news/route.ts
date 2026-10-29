import { NextRequest, NextResponse } from 'next/server';
import { countries } from '@/lib/countries';
import { createNewsService } from '@/lib/news';

const getNews = createNewsService(() => process.env.NEWSDATA_API_KEY);
const codes = new Set(countries.map(country => country.cca2));
export async function GET(request: NextRequest) {
  const country = (request.nextUrl.searchParams.get('country') || '').toUpperCase();
  if (!codes.has(country)) return NextResponse.json({ error: 'Invalid country' }, { status: 400 });
  const result = await getNews(country);
  return NextResponse.json(result, { headers: { 'Cache-Control': 'private, no-store' } });
}
