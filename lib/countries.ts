import countryData from 'flag-icons/country.json';

// Bundled ISO catalog: available even when external services are unavailable.
export const countries = countryData.filter(country => country.iso).map(country => ({
  cca2: country.code.toUpperCase(),
  name: { common: country.name },
  region: ['North America', 'South America'].includes(country.continent ?? '') ? 'Americas' : country.continent ?? 'Antarctica',
}));

export function getCountryName(code: string, locale: string): string {
  return new Intl.DisplayNames([locale], { type: 'region' }).of(code) ?? code;
}
