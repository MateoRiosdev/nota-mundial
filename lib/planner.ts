export const PLANNER_KEY = "nota-mundial:planner:v1";
export const AUTOSAVE_KEY = "nota-mundial:planner:autosave";
export const COURSE_COLORS = [
  "#2563EB",
  "#7C3AED",
  "#0891B2",
  "#059669",
  "#D97706",
  "#DB2777",
];
export type Evaluation = {
  id: string;
  title: string;
  kind: "task" | "exam";
  weight: number;
  grade: number | null;
  start: string;
  end: string;
  completed: boolean;
};
export type Course = {
  id: string;
  name: string;
  code: string;
  color: string;
  min: number;
  max: number;
  evaluations: Evaluation[];
};
export type AcademicPage = { id: string; name: string; courses: Course[] };
export type PlannerData = { version: 1; pages: AcademicPage[] };
export type CalendarEntry = { course: Course; evaluation: Evaluation };
export function initialPlanner(name: string): PlannerData {
  return { version: 1, pages: [{ id: "first-page", name, courses: [] }] };
}
export function newId() {
  return crypto.randomUUID();
}
export function courseResult(course: Course) {
  const total = course.evaluations.reduce((sum, e) => sum + e.weight, 0);
  const graded = course.evaluations.filter((e) => e.grade !== null);
  const gradedWeight = graded.reduce((sum, e) => sum + e.weight, 0);
  const points = graded.reduce(
    (sum, e) => sum + (e.grade! * e.weight) / 100,
    0,
  );
  return {
    total,
    gradedWeight,
    points,
    complete:
      course.evaluations.every((e) => e.weight === 0 || e.grade !== null) &&
      course.evaluations.length > 0 &&
      Math.abs(total - 100) < 0.001,
  };
}
export function validRange(start: string, end: string) {
  return (
    !!start &&
    !!end &&
    Number.isFinite(Date.parse(start)) &&
    Number.isFinite(Date.parse(end)) &&
    Date.parse(end) >= Date.parse(start)
  );
}
export function parsePlanner(raw: string): PlannerData {
  const data = JSON.parse(raw);
  const ids = new Set<string>();
  const id = (value: unknown) => {
    if (typeof value !== "string" || !value || ids.has(value))
      throw new Error("Invalid identifier");
    ids.add(value);
  };
  const text = (value: unknown, max: number) =>
    typeof value === "string" && value.length <= max;
  const number = (value: unknown) =>
    typeof value === "number" && Number.isFinite(value);
  if (data?.version !== 1 || !Array.isArray(data.pages) || !data.pages.length)
    throw new Error("Invalid planner");
  for (const page of data.pages) {
    id(page.id);
    if (
      !text(page.name, 100) ||
      !page.name.trim() ||
      !Array.isArray(page.courses)
    )
      throw new Error("Invalid page");
    for (const course of page.courses) {
      id(course.id);
      if (
        !text(course.name, 160) ||
        !course.name.trim() ||
        !text(course.code, 30) ||
        typeof course.color !== "string" ||
        !/^#[0-9a-f]{6}$/i.test(course.color) ||
        !number(course.min) ||
        !number(course.max) ||
        course.min >= course.max ||
        !Array.isArray(course.evaluations)
      )
        throw new Error("Invalid course");
      for (const e of course.evaluations) {
        id(e.id);
        if (
          !text(e.title, 160) ||
          !e.title.trim() ||
          !["task", "exam"].includes(e.kind) ||
          !number(e.weight) ||
          e.weight < 0 ||
          e.weight > 100 ||
          (e.grade !== null &&
            (!number(e.grade) ||
              e.grade < course.min ||
              e.grade > course.max)) ||
          typeof e.completed !== "boolean" ||
          !text(e.start, 40) ||
          !text(e.end, 40) ||
          ((e.start || e.end) && !validRange(e.start, e.end))
        )
          throw new Error("Invalid evaluation");
      }
    }
  }
  return data;
}
export function localInput(date: string | Date) {
  const d = new Date(date);
  if (!Number.isFinite(d.getTime())) return "";
  return `${dayKey(d)}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
export function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function monthWeeks(month: Date, monday = true): Date[][] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const offset = (first.getDay() + (monday ? 6 : 0)) % 7;
  first.setDate(first.getDate() - offset);
  const weeks: Date[][] = [];
  do {
    weeks.push(
      Array.from(
        { length: 7 },
        (_, i) =>
          new Date(first.getFullYear(), first.getMonth(), first.getDate() + i),
      ),
    );
    first.setDate(first.getDate() + 7);
  } while (first.getMonth() === month.getMonth());
  return weeks;
}
export function weekSegments(week: Date[], entries: CalendarEntry[]) {
  const occupied: number[] = [];
  const start = dayKey(week[0]),
    end = dayKey(week[6]);
  return entries
    .filter(
      ({ evaluation: e }) =>
        validRange(e.start, e.end) &&
        dayKey(new Date(e.start)) <= end &&
        dayKey(new Date(e.end)) >= start,
    )
    .sort((a, b) => a.evaluation.start.localeCompare(b.evaluation.start))
    .map((entry) => {
      const a = dayKey(new Date(entry.evaluation.start)),
        b = dayKey(new Date(entry.evaluation.end));
      const column = Math.max(
        0,
        week.findIndex((d) => dayKey(d) >= a),
      );
      let last = 6;
      while (last > 0 && dayKey(week[last]) > b) last--;
      let lane = occupied.findIndex((x) => x < column);
      if (lane < 0) lane = occupied.length;
      occupied[lane] = last;
      return { ...entry, column, span: last - column + 1, lane };
    });
}
function utcStamp(value: string | Date) {
  return new Date(value)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}
function escapeICS(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}
// RFC 5545 folds by UTF-8 octets, without splitting a multi-byte character.
function foldLine(line: string) {
  let result = "",
    width = 0;
  for (const char of line) {
    const size = new TextEncoder().encode(char).length;
    if (width + size > 75) {
      result += "\r\n ";
      width = 1;
    }
    result += char;
    width += size;
  }
  return result;
}
export function calendarFile(
  entries: CalendarEntry[],
  now = new Date(),
): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Nota Mundial//Academic Planner//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];
  for (const { course, evaluation: e } of entries) {
    if (!validRange(e.start, e.end)) continue;
    const end =
      Date.parse(e.end) > Date.parse(e.start)
        ? e.end
        : new Date(Date.parse(e.end) + 60000).toISOString();
    lines.push(
      "BEGIN:VEVENT",
      `UID:${escapeICS(e.id)}@nota-mundial`,
      `DTSTAMP:${utcStamp(now)}`,
      `DTSTART:${utcStamp(e.start)}`,
      `DTEND:${utcStamp(end)}`,
      `SUMMARY:${escapeICS(`${course.name} · ${e.title}`)}`,
      `DESCRIPTION:${escapeICS(`${course.code} · ${e.weight}%`)}`,
      "END:VEVENT",
    );
  }
  return [...lines, "END:VCALENDAR"].map(foldLine).join("\r\n") + "\r\n";
}
export function googleCalendarURL({ course, evaluation: e }: CalendarEntry) {
  if (!validRange(e.start, e.end)) return null;
  const end =
    Date.parse(e.end) > Date.parse(e.start)
      ? e.end
      : new Date(Date.parse(e.end) + 60000).toISOString();
  return `https://calendar.google.com/calendar/render?${new URLSearchParams({ action: "TEMPLATE", text: `${course.name} · ${e.title}`, dates: `${utcStamp(e.start)}/${utcStamp(end)}`, details: `${course.code} · ${e.weight}% · Nota Mundial` })}`;
}
export function downloadCalendar(
  entries: CalendarEntry[],
  filename = "nota-mundial.ics",
) {
  const url = URL.createObjectURL(
    new Blob([calendarFile(entries)], { type: "text/calendar;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
