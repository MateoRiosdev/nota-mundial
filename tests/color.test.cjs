const { test } = require("node:test");
const assert = require("node:assert/strict");
const ts = require("typescript");
const fs = require("node:fs");
const Module = require("node:module");
const path = require("node:path");
const filename = path.resolve("lib/color.ts");
const mod = new Module(filename);
mod.filename = filename;
mod.paths = Module._nodeModulePaths(path.dirname(filename));
mod._compile(
  ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText,
  filename,
);
const { hexToHSV, hsvToHex } = mod.exports;
test("palette converts primary hues to their expected RGB colors", () => {
  assert.equal(hsvToHex(0, 100, 100), "#FF0000");
  assert.equal(hsvToHex(120, 100, 100), "#00FF00");
  assert.equal(hsvToHex(240, 100, 100), "#0000FF");
});
test("palette handles white, black and grayscale without NaN", () => {
  for (const hex of ["#000000", "#FFFFFF", "#777777"]) {
    const { h, s, v } = hexToHSV(hex);
    assert(Number.isFinite(h));
    assert.equal(s, 0);
    assert.equal(hsvToHex(h, s, v), hex);
  }
});
test("custom colors retain all RGB channels through picker conversion", () => {
  for (const hex of [
    "#2563EB",
    "#AABBCC",
    "#F15A24",
    "#7C3AED",
    "#059669",
    "#010203",
    "#FA01E2",
  ]) {
    const { h, s, v } = hexToHSV(hex);
    assert.equal(hsvToHex(h, s, v), hex);
  }
});
