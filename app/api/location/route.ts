import { NextRequest, NextResponse } from 'next/server';
import { getCountryLocale, getVisitorCountry } from '@/lib/geolocation';

export function GET(request: NextRequest) {
  const country = getVisitorCountry(request.headers);
  return NextResponse.json({ country, locale: getCountryLocale(country) }, {
    headers: { 'Cache-Control': 'private, no-store' }
  });
}
