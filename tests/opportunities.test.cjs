const { test } = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const filename = path.resolve('lib/opportunities.ts');
const compiled = new Module(filename);
compiled.paths = Module._nodeModulePaths(path.dirname(filename));
compiled._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, filename);
const { opportunities, opportunitiesFor } = compiled.exports;

test('directories show local resources for the selected country and international alternatives', () => {
  assert(opportunitiesFor('PE').some(item => item.name === 'PRONABEC'));
  assert(opportunitiesFor('PE').some(item => item.name === 'Empleos Perú'));
  assert(!opportunitiesFor('ES').some(item => item.name === 'PRONABEC'));
  assert(opportunitiesFor('ES').some(item => item.name === 'Becas de Educación'));
  assert(opportunitiesFor('JP').length > 0);
  assert(opportunitiesFor('JP').every(item => item.country === null));
});

test('resources have unique HTTPS links and both translations provide all required labels', () => {
  assert.equal(new Set(opportunities.map(item => item.url)).size, opportunities.length);
  for (const item of opportunities) {
    const url = new URL(item.url);
    assert.equal(url.protocol, 'https:');
    assert.equal(url.username, '');
    assert.equal(url.password, '');
    assert(item.es && item.en && ['study', 'work'].includes(item.kind));
  }
  const es = require('../messages/opportunities/es.json');
  const en = require('../messages/opportunities/en.json');
  assert.deepEqual(Object.keys(es).sort(), Object.keys(en).sort());
  for (const label of ['title', 'subtitle', 'chooseCountry', 'search', 'all', 'study', 'work', 'official', 'directoryHint', 'noResources']) assert(es[label] && en[label]);
});
