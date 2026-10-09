import { NextResponse } from 'next/server';
import { countries } from '@/lib/countries';

export function GET() {
  return NextResponse.json(countries, {
    headers: { 'Cache-Control': 'public, max-age=3600' }
  });
}
