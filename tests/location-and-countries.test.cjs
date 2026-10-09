const { test } = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const fs = require('node:fs');
const Module = require('node:module');
function load(path) {
  const filename = require('node:path').resolve(path);
  const module = new Module(filename);
  module.filename = filename;
  module.paths = Module._nodeModulePaths(require('node:path').dirname(filename));
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true }
  }).outputText, filename);
  return module.exports;
}
const geo = load('lib/geolocation.ts');
const { countries } = load('lib/countries.ts');
const { gradingSystems } = load('lib/gradingSystems.ts');
test('IP country maps to all supported languages and English fallback', () => {
  for (const [code, locale] of Object.entries({US:'en',PE:'es',MX:'es',AR:'es',BR:'pt',CV:'pt',PT:'pt',AO:'pt',FR:'fr',DE:'de',IT:'it',JP:'ja',KR:'ko',CN:'zh',IN:'en',SA:'en'})) {
    assert.equal(geo.getCountryLocale(code), locale, code);
  }
  assert.equal(geo.getCountryLocale(null), 'en');
});
test('Vercel and Cloudflare geolocation, invalid and absent headers', () => {
  assert.equal(geo.getVisitorCountry(new Headers({'x-vercel-ip-country':'us'})), 'US');
  assert.equal(geo.getVisitorCountry(new Headers({'cf-ipcountry':'CV'})), 'CV');
  for(const code of ['XX','T1','USA','']) assert.equal(geo.getVisitorCountry(new Headers({'cf-ipcountry':code})), null);
  assert.equal(geo.getVisitorCountry(new Headers()), null);
});
test('complete ISO catalog and names for nine locales', () => {
  assert.equal(countries.length, 249);
  assert.equal(new Set(countries.map(c=>c.cca2)).size,249);
  for(const code of ['CV','PT','BR','US','BZ','LU','RW']) assert(countries.some(c=>c.cca2===code));
  for(const locale of ['es','en','pt','fr','de','it','ja','ko','zh']) {
    const names=new Intl.DisplayNames([locale],{type:'region'});
    for(const country of countries) assert(names.of(country.cca2));
    const messages=JSON.parse(fs.readFileSync(`messages/${locale}.json`));
    for(const key of ['clearSearch','retry','noResults','pagination','genericScale']) assert(messages.countrySelector[key]);
  }
});
test('configured grade scales normalize endpoints and round trip averages', () => {
  for(const scale of Object.values(gradingSystems)) {
    assert.equal(scale.normalize(scale.min),0);
    assert.equal(scale.normalize(scale.max),100);
    assert(Math.abs(scale.normalize(scale.convert(75))-75)<1e-8,scale.countryCode);
  }
  for(const code of ['CV','PT','AO','MZ','ST','GW']) assert.equal(gradingSystems[code].max,20);
});
