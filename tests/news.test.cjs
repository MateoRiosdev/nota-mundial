const { test } = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
function load(file) {
  const filename = path.resolve(file);
  const module = new Module(filename);
  module.paths = Module._nodeModulePaths(path.dirname(filename));
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, filename);
  return module.exports;
}
const { createNewsService, normalizeArticles, newsURL } = load('lib/news.ts');
const { opportunitiesFor } = load('lib/opportunities.ts');
const payload = { status: 'success', results: [{ title: 'Becas para estudiantes', link: 'https://example.org/becas', pubDate: '2026-10-28 12:00:00', source_name: 'Fuente' }] };
test('news query uses selected country, encoded keywords and no unsupported education category', () => {
  const url = newsURL('PE', 'test-only');
  assert.equal(url.origin, 'https://newsdata.io');
  assert.equal(url.searchParams.get('country'), 'pe');
  assert.match(url.searchParams.get('q'), /becas/);
  assert.equal(url.searchParams.has('category'), false);
});
test('normalization excludes unsafe links, deduplicates and handles dates without inventing metadata', () => {
  const result = normalizeArticles({ ...payload, results: [...payload.results, ...payload.results, { title: 'unsafe', link: 'javascript:alert(1)' }, { title: 'credentials', link: 'https://user:pass@example.org/' }, { title: 'No date', link: 'https://example.org/other', pubDate: 'bad-date' }] });
  assert.equal(result.length, 2);
  assert.equal(result[0].publishedAt, '2026-10-28T12:00:00.000Z');
  assert.equal(result[1].publishedAt, null);
  assert.throws(() => normalizeArticles({ status: 'error', results: [] }));
});
test('missing key does not contact provider; installing a key enables requests', async () => {
  let key, calls = 0;
  const get = createNewsService(() => key, async () => { calls++; return Response.json(payload); });
  assert.equal((await get('PE')).status, 'unavailable'); assert.equal(calls, 0);
  key = 'test-only'; assert.equal((await get('PE')).status, 'ok'); assert.equal(calls, 1);
});
test('cache coalesces calls, isolates countries and refreshes after one hour', async () => {
  let calls = 0, now = 0;
  const get = createNewsService(() => 'test-only', async () => { calls++; return Response.json(payload); }, () => now);
  await Promise.all([get('PE'), get('PE'), get('PE')]); assert.equal(calls, 1);
  await get('PE'); assert.equal(calls, 1);
  await get('ES'); assert.equal(calls, 2);
  now += 3600001; await get('PE'); assert.equal(calls, 3);
});
test('quota errors and malformed responses degrade safely with cooldown and recovery', async () => {
  let calls = 0, now = 0;
  const get = createNewsService(() => 'never-expose-me', async () => { calls++; return calls === 1 ? new Response('private provider error', { status: 429 }) : Response.json(payload); }, () => now);
  const result = await get('PE'); assert.deepEqual(result, { status: 'unavailable', articles: [] });
  await get('PE'); assert.equal(calls, 1);
  now = 300001; assert.equal((await get('PE')).status, 'ok');
  const broken = createNewsService(() => 'test-only', async () => Response.json({ status: 'error' }));
  assert.equal((await broken('PE')).status, 'unavailable');
  const timeout = createNewsService(() => 'test-only', async () => { throw new DOMException('Timed out', 'TimeoutError'); });
  assert.equal((await timeout('PE')).status, 'unavailable');
});
test('directories match country, retain international options and have matching translations', () => {
  assert(opportunitiesFor('PE').some(item => item.name === 'PRONABEC'));
  assert(!opportunitiesFor('ES').some(item => item.name === 'PRONABEC'));
  assert(opportunitiesFor('JP').every(item => item.country === null));
  for (const item of opportunitiesFor('PE')) assert.equal(new URL(item.url).protocol, 'https:');
  assert.deepEqual(Object.keys(require('../messages/opportunities/es.json')).sort(), Object.keys(require('../messages/opportunities/en.json')).sort());
});
