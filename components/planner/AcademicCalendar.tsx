"use client";
import { CustomSelect } from "./CustomSelect";
import { useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { CalendarEntry, dayKey, monthWeeks, weekSegments } from "@/lib/planner";
export function AcademicCalendar({
  entries,
  onEdit,
  onDay,
}: {
  entries: CalendarEntry[];
  onEdit: (entry: CalendarEntry) => void;
  onDay: (day: string) => void;
}) {
  const t = useTranslations("planner"),
    locale = useLocale();
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [monday, setMonday] = useState(true);
  const weeks = monthWeeks(month, monday),
    today = dayKey(new Date());
  const format = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  });
  return (
    <section className="surface overflow-hidden" aria-label={t("calendar")}>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-4 sm:p-6 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <button
            className="icon-button"
            aria-label={t("previousMonth")}
            onClick={() =>
              setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
            }
          >
            <ChevronLeft size={18} />
          </button>
          <button
            className="icon-button"
            aria-label={t("nextMonth")}
            onClick={() =>
              setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
            }
          >
            <ChevronRight size={18} />
          </button>
          <h2
            className="ml-2 text-lg font-bold capitalize sm:text-xl"
            aria-live="polite"
          >
            {format.format(month)}
          </h2>
          <button
            className="button-secondary ml-2 hidden text-xs sm:inline-flex"
            onClick={() =>
              setMonth(
                new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              )
            }
          >
            {t("today")}
          </button>
        </div>
        <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          {t("weekStarts")}
          <CustomSelect
            label={t("weekStarts")}
            value={String(monday)}
            options={[
              { value: "true", label: t("monday") },
              { value: "false", label: t("sunday") },
            ]}
            onChange={(v) => setMonday(v === "true")}
          />
        </label>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-0 sm:min-w-[700px]">
          <div className="grid grid-cols-7 bg-slate-50/80 dark:bg-slate-900/40">
            {weeks[0].map((d) => (
              <div
                key={d.getDay()}
                className="px-0.5 py-3 text-center text-[10px] sm:px-3 sm:text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >
                {new Intl.DateTimeFormat(locale, { weekday: "short" }).format(
                  d,
                )}
              </div>
            ))}
          </div>
          {weeks.map((week) => {
            const segments = weekSegments(week, entries);
            const lanes = Math.max(0, ...segments.map((s) => s.lane + 1));
            return (
              <div
                key={dayKey(week[0])}
                className="relative border-t border-slate-200 dark:border-slate-700"
                style={{ minHeight: Math.max(116, 48 + lanes * 34) }}
              >
                <div className="absolute inset-0 grid grid-cols-7">
                  {week.map((d) => (
                    <button
                      type="button"
                      key={dayKey(d)}
                      onClick={() => onDay(dayKey(d))}
                      aria-label={`${t("newEvaluation")}: ${new Intl.DateTimeFormat(locale, { dateStyle: "full" }).format(d)}`}
                      className={`calendar-day ${d.getMonth() !== month.getMonth() ? "calendar-outside" : ""} ${dayKey(d) === today ? "calendar-today" : ""}`}
                    >
                      <span
                        className={dayKey(d) === today ? "today-number" : ""}
                      >
                        {d.getDate()}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="pointer-events-none relative grid grid-cols-7 gap-y-1 px-1 pb-3 pt-10">
                  {segments.map(
                    ({ course, evaluation, column, span, lane }) => (
                      <button
                        type="button"
                        key={evaluation.id}
                        onClick={() => onEdit({ course, evaluation })}
                        className={`calendar-event pointer-events-auto ${evaluation.completed ? "opacity-60" : ""}`}
                        style={{
                          gridColumn: `${column + 1} / span ${span}`,
                          gridRow: lane + 1,
                          borderLeftColor: course.color,
                          backgroundColor: `${course.color}18`,
                        }}
                        title={`${course.name} · ${evaluation.title}`}
                      >
                        <span
                          className="mr-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ background: course.color }}
                        />
                        <span
                          className={evaluation.completed ? "line-through" : ""}
                        >
                          {evaluation.title}
                        </span>
                      </button>
                    ),
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-2 border-t border-slate-200 px-5 py-3 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
        <CalendarDays size={15} className="shrink-0 text-blue-600" />
        {t("calendarHint")}
      </div>
    </section>
  );
}
