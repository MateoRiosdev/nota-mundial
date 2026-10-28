const { test } = require("node:test");
const assert = require("node:assert/strict");
const ts = require("typescript");
const fs = require("node:fs");
const Module = require("node:module");
const filename = require("node:path").resolve("lib/planner.ts");
const compiled = new Module(filename);
compiled.filename = filename;
compiled.paths = Module._nodeModulePaths(
  require("node:path").dirname(filename),
);
compiled._compile(
  ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText,
  filename,
);
const {
  courseResult,
  parsePlanner,
  initialPlanner,
  calendarFile,
  googleCalendarURL,
  monthWeeks,
  weekSegments,
  dayKey,
  validRange,
} = compiled.exports;
const evaluation = (patch = {}) => ({
  id: "exam-1",
  title: "Examen parcial",
  kind: "exam",
  weight: 100,
  grade: 18,
  start: "2026-10-28T14:00:00.000Z",
  end: "2026-11-04T04:59:00.000Z",
  completed: false,
  ...patch,
});
const course = (evaluations = [evaluation()]) => ({
  id: "math",
  name: "Matemática",
  code: "MAT-101",
  color: "#2563EB",
  min: 0,
  max: 20,
  evaluations,
});
const data = (c = course()) => ({
  version: 1,
  pages: [{ id: "semester", name: "Semestre", courses: [c] }],
});
test("weighted grades match the reference and distinguish missing grades from zero", () => {
  const c = course(
    [18, 17, 19, 18, 19].map((grade, i) =>
      evaluation({ id: String(i), grade, weight: i === 4 ? 40 : 15 }),
    ),
  );
  assert.equal(courseResult(c).points, 18.4);
  assert.equal(courseResult(c).complete, true);
  const result = courseResult(
    course([
      evaluation({ grade: 0, weight: 50 }),
      evaluation({ id: "second", grade: null, weight: 50 }),
    ]),
  );
  assert.equal(result.points, 0);
  assert.equal(result.gradedWeight, 50);
  assert.equal(result.complete, false);
  assert.equal(
    courseResult(course([evaluation({ weight: 90 })])).complete,
    false,
  );
  assert.equal(
    courseResult(
      course([
        evaluation({ weight: 100 }),
        evaluation({ id: "second", weight: 20 }),
      ]),
    ).complete,
    false,
  );
});
test("planner storage validates nested data and preserves independent pages", () => {
  const d = data();
  d.pages.push({ id: "second-page", name: "Proyecto", courses: [] });
  assert.deepEqual(parsePlanner(JSON.stringify(d)), d);
  for (const mutate of [
    (d) => (d.version = 2),
    (d) => (d.pages = []),
    (d) => (d.pages[0].courses[0].max = 0),
    (d) => (d.pages[0].courses[0].color = "red"),
    (d) => (d.pages[0].courses[0].evaluations[0].grade = 21),
    (d) => (d.pages[0].courses[0].evaluations[0].weight = -1),
    (d) => (d.pages[0].courses[0].evaluations[0].id = "math"),
    (d) => (d.pages[0].courses[0].evaluations[0].start = "invalid"),
  ]) {
    const broken = data();
    mutate(broken);
    assert.throws(() => parsePlanner(JSON.stringify(broken)));
  }
  assert.throws(() => parsePlanner("{broken"));
  assert.deepEqual(
    parsePlanner(JSON.stringify(initialPlanner("Mi semestre"))),
    initialPlanner("Mi semestre"),
  );
});
test("optional dates are valid in storage, but reversed and incomplete ranges are rejected", () => {
  assert.doesNotThrow(() =>
    parsePlanner(
      JSON.stringify(data(course([evaluation({ start: "", end: "" })]))),
    ),
  );
  assert.throws(() =>
    parsePlanner(
      JSON.stringify(
        data(course([evaluation({ start: "", end: evaluation().end })])),
      ),
    ),
  );
  assert.equal(
    validRange("2026-10-29T10:00:00Z", "2026-10-28T10:00:00Z"),
    false,
  );
  assert.equal(
    googleCalendarURL({
      course: course(),
      evaluation: evaluation({ start: "", end: "" }),
    }),
    null,
  );
});
test("ICS preserves exact UTC times, stable event IDs, escaping and CRLF", () => {
  const entry = {
    course: course(),
    evaluation: evaluation({ title: "Examen, final; A\\B\nSala 2" }),
  };
  const ics = calendarFile([entry], new Date("2026-10-28T12:00:00Z"));
  assert.match(ics, /DTSTART:20261028T140000Z\r\n/);
  assert.match(ics, /DTEND:20261104T045900Z\r\n/);
  assert.match(ics, /UID:exam-1@nota-mundial\r\n/);
  assert(ics.includes("Examen\\, final\\; A\\\\B\\nSala 2"));
  assert(ics.endsWith("END:VCALENDAR\r\n"));
  assert.equal(
    (
      calendarFile([
        { course: course(), evaluation: evaluation({ start: "", end: "" }) },
      ]).match(/BEGIN:VEVENT/g) || []
    ).length,
    0,
  );
});
test("ICS folds Unicode at 75 UTF-8 bytes without corrupting text", () => {
  const title = "日本語の試験 🌍 ".repeat(25);
  const ics = calendarFile([
    { course: course(), evaluation: evaluation({ title }) },
  ]);
  for (const line of ics.split("\r\n"))
    assert(Buffer.byteLength(line, "utf8") <= 75);
  assert(ics.replace(/\r\n /g, "").includes(title));
});
test("Google Calendar links use the same UTC interval and encode arbitrary names", () => {
  const entry = {
    course: { ...course(), name: "Curso & Ciencia #1" },
    evaluation: evaluation(),
  };
  const url = new URL(googleCalendarURL(entry));
  assert.equal(url.origin, "https://calendar.google.com");
  assert.equal(url.searchParams.get("action"), "TEMPLATE");
  assert.equal(
    url.searchParams.get("text"),
    "Curso & Ciencia #1 · Examen parcial",
  );
  assert.equal(
    url.searchParams.get("dates"),
    "20261028T140000Z/20261104T045900Z",
  );
});
test("zero-duration assessments export as one minute, consistently in both formats", () => {
  const e = evaluation({ end: evaluation().start });
  const entry = { course: course(), evaluation: e };
  assert.match(calendarFile([entry]), /DTEND:20261028T140100Z/);
  assert(
    new URL(googleCalendarURL(entry)).searchParams
      .get("dates")
      .endsWith("/20261028T140100Z"),
  );
});
test("calendar weeks handle leap years, month boundaries and week preferences", () => {
  const feb = monthWeeks(new Date(2028, 1, 1));
  assert(feb.flat().some((d) => dayKey(d) === "2028-02-29"));
  assert.equal(feb[0][0].getDay(), 1);
  assert.equal(monthWeeks(new Date(2026, 10, 1), false)[0][0].getDay(), 0);
  assert.equal(monthWeeks(new Date(2026, 1, 1), false).length, 4);
  const december = monthWeeks(new Date(2026, 11, 1));
  assert(december.flat().some((d) => dayKey(d) === "2027-01-03"));
});
test("multi-day calendar bars split across weeks and do not overlap in a lane", () => {
  const week = Array.from({ length: 7 }, (_, i) => new Date(2026, 9, 26 + i));
  const entries = [
    {
      course: course(),
      evaluation: evaluation({
        start: new Date(2026, 9, 24, 9).toISOString(),
        end: new Date(2026, 9, 28, 23).toISOString(),
      }),
    },
    {
      course: course(),
      evaluation: evaluation({
        id: "overlap",
        start: new Date(2026, 9, 27, 9).toISOString(),
        end: new Date(2026, 10, 4, 23).toISOString(),
      }),
    },
    {
      course: course(),
      evaluation: evaluation({
        id: "later",
        start: new Date(2026, 9, 29, 9).toISOString(),
        end: new Date(2026, 9, 30, 23).toISOString(),
      }),
    },
  ];
  const bars = weekSegments(week, entries);
  assert.deepEqual(
    bars.map(({ column, span, lane }) => ({ column, span, lane })),
    [
      { column: 0, span: 3, lane: 0 },
      { column: 1, span: 6, lane: 1 },
      { column: 3, span: 2, lane: 0 },
    ],
  );
});
test("planner translations expose the same keys and required interpolation tokens", () => {
  const es = require("../messages/planner/es.json"),
    en = require("../messages/planner/en.json");
  assert.deepEqual(Object.keys(es).sort(), Object.keys(en).sort());
  for (const key of Object.keys(en)) assert(es[key].length > 0);
  for (const lang of [es, en]) {
    assert(
      lang.invalidGrade.includes("{min}") &&
        lang.invalidGrade.includes("{max}"),
    );
    assert(lang.overdueCount.includes("{count,"));
  }
});
