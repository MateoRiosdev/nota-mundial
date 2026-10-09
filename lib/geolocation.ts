// Hosting providers derive these headers from the visitor IP, not the server IP.
export function getVisitorCountry(headers: Pick<Headers, 'get'>): string | null {
  const country = (headers.get('x-vercel-ip-country') ?? headers.get('cf-ipcountry'))?.toUpperCase();
  return country && /^[A-Z]{2}$/.test(country) && !['XX', 'T1'].includes(country) ? country : null;
}

const languageCountries: Record<string, string[]> = {
  es: 'ES MX GT HN SV NI CR PA CU DO PR CO VE EC PE BO PY CL AR UY GQ'.split(' '),
  pt: 'BR PT CV AO MZ GW ST TL'.split(' '),
  fr: 'FR MC BE LU CD CG CI SN ML BF NE TG BJ GA GN TD CF CM DJ KM MG HT RE GP MQ GF PF NC'.split(' '),
  de: 'DE AT CH LI'.split(' '),
  it: 'IT SM VA'.split(' '),
  ja: ['JP'], ko: ['KR'], zh: ['CN', 'TW', 'HK', 'MO'],
};

export function getCountryLocale(country: string | null): string {
  return Object.entries(languageCountries).find(([, countries]) => countries.includes(country ?? ''))?.[0] ?? 'en';
}
