"use client";
import { useEffect, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  CalendarDays,
  CalendarPlus,
  ListTodo,
  Calculator,
  Plus,
  Download,
  Check,
  Clock3,
  BookOpen,
  Settings2,
  Search,
  Save,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  Layers,
  Pencil,
  Trash2,
} from "lucide-react";
import { usePlanner } from "@/lib/usePlanner";
import {
  AcademicPage,
  Course,
  Evaluation,
  CalendarEntry,
  newId,
  validRange,
  googleCalendarURL,
  downloadCalendar,
} from "@/lib/planner";
import { AcademicCalendar } from "./AcademicCalendar";
import { CourseCalculator } from "./CourseCalculator";
import { CourseForm, EvaluationForm } from "./PlannerForms";
import { PlannerDialog } from "./PlannerDialog";

type Dialog =
  | { kind: "course"; course?: Course }
  | {
      kind: "evaluation";
      courseId: string;
      evaluation?: Evaluation;
      day?: string;
    }
  | { kind: "page"; editing: boolean }
  | null;
type View = "calendar" | "schedule" | "calculator";
export function AcademicPlanner({
  quickCalculator,
}: {
  quickCalculator: ReactNode;
}) {
  const t = useTranslations("planner"),
    locale = useLocale();
  const {
    data,
    setData,
    hydrated,
    autosave,
    toggleAutosave,
    dirty,
    save,
    error,
  } = usePlanner(t("defaultPage"), t("leaveWarning"));
  const [pageId, setPageId] = useState("first-page"),
    [filter, setFilter] = useState("all"),
    [view, setView] = useState<View>("calendar");
  const [dialog, setDialog] = useState<Dialog>(null),
    [calcId, setCalcId] = useState(""),
    [focusId, setFocusId] = useState<string | null>(null);
  const [search, setSearch] = useState(""),
    [status, setStatus] = useState<"all" | "pending" | "completed">("all");
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  const page = data.pages.find((p) => p.id === pageId) ?? data.pages[0];
  const courses = page.courses;
  const entries: CalendarEntry[] = courses.flatMap((course) =>
    course.evaluations.map((evaluation) => ({ course, evaluation })),
  );
  const filtered = entries.filter(
    (e) => filter === "all" || e.course.id === filter,
  );
  const dated = filtered.filter((e) =>
    validRange(e.evaluation.start, e.evaluation.end),
  );
  const completed = filtered.filter((e) => e.evaluation.completed).length;
  const upcoming = dated
    .filter(
      (e) =>
        !e.evaluation.completed &&
        new Date(e.evaluation.end).getTime() >= (now?.getTime() ?? 0),
    )
    .sort((a, b) => a.evaluation.end.localeCompare(b.evaluation.end))[0];
  const overdue = dated.filter(
    (e) =>
      !e.evaluation.completed &&
      new Date(e.evaluation.end).getTime() < (now?.getTime() ?? 0),
  ).length;
  const selectedCourse =
    courses.find((c) => c.id === calcId) ??
    courses.find((c) => c.id === filter) ??
    courses[0];
  const dateFormat = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  function updatePage(fn: (p: AcademicPage) => AcademicPage) {
    setData((prev) => ({
      ...prev,
      pages: prev.pages.map((p) => (p.id === page.id ? fn(p) : p)),
    }));
  }
  function updateCourse(id: string, fn: (c: Course) => Course) {
    updatePage((p) => ({
      ...p,
      courses: p.courses.map((c) => (c.id === id ? fn(c) : c)),
    }));
  }
  function updateEvaluation(
    courseId: string,
    id: string,
    patch: Partial<Evaluation>,
  ) {
    updateCourse(courseId, (c) => ({
      ...c,
      evaluations: c.evaluations.map((e) =>
        e.id === id ? { ...e, ...patch } : e,
      ),
    }));
  }
  function changePage(id: string) {
    setPageId(id);
    setFilter("all");
    setCalcId("");
    setFocusId(null);
    setSearch("");
  }
  function showGrade(entry: CalendarEntry) {
    setCalcId(entry.course.id);
    setFilter(entry.course.id);
    setFocusId(entry.evaluation.id);
    setView("calculator");
  }
  function addEvaluation(day?: string) {
    if (!courses.length) {
      setDialog({ kind: "course" });
      return;
    }
    setDialog({
      kind: "evaluation",
      courseId: filter === "all" ? selectedCourse.id : filter,
      day,
    });
  }
  const visible = filtered
    .filter(
      ({ course, evaluation: e }) =>
        (status === "all" || (status === "completed") === e.completed) &&
        `${course.name} ${course.code} ${e.title}`
          .toLocaleLowerCase(locale)
          .includes(search.toLocaleLowerCase(locale)),
    )
    .sort((a, b) =>
      (a.evaluation.end || "9999").localeCompare(b.evaluation.end || "9999"),
    );
  return (
    <div className="academic-planner space-y-6">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            {t("eyebrow")}
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {t("subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <CalendarDays size={16} />
          {now
            ? new Intl.DateTimeFormat(locale, {
                day: "numeric",
                month: "long",
                year: "numeric",
              }).format(now)
            : "—"}
        </div>
      </section>
      <div className="surface flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <Layers size={19} className="shrink-0 text-blue-600" />
          <select
            aria-label={t("pages")}
            className="min-w-0 max-w-64 rounded-lg bg-transparent py-2 pr-2 text-sm font-semibold outline-offset-4"
            value={page.id}
            onChange={(e) => changePage(e.target.value)}
          >
            {data.pages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="icon-button shrink-0"
            aria-label={t("editPage")}
            disabled={!hydrated}
            onClick={() => setDialog({ kind: "page", editing: true })}
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            className="icon-button shrink-0"
            aria-label={t("newPage")}
            disabled={!hydrated}
            onClick={() => setDialog({ kind: "page", editing: false })}
          >
            <Plus size={17} />
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span
            aria-live="polite"
            className={`flex items-center gap-1.5 text-xs ${dirty ? "text-amber-700 dark:text-amber-400" : "text-slate-500 dark:text-slate-400"}`}
          >
            {!dirty && <Check size={14} />}
            {t(dirty ? "unsaved" : "saved")}
          </span>
          <button
            role="switch"
            aria-checked={autosave}
            onClick={toggleAutosave}
            disabled={!hydrated}
            className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-semibold"
          >
            <span
              className={`relative h-5 w-9 rounded-full transition-colors ${autosave ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"}`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${autosave ? "translate-x-4" : "translate-x-0"}`}
              />
            </span>
            {t("autosave")}
          </button>
          <button
            className="button-secondary !px-3 !py-2 text-xs"
            onClick={save}
            disabled={!hydrated}
          >
            <Save size={14} />
            {t("save")}
          </button>
        </div>
      </div>
      {error ? (
        <div role="alert" className="planner-warning">
          <AlertTriangle size={18} />
          <span>{t(error)}</span>
        </div>
      ) : (
        !autosave && (
          <div role="status" className="planner-warning">
            <AlertTriangle size={17} />
            <span>{t("autosaveOff")}</span>
          </div>
        )
      )}
      <div className="grid grid-cols-3 gap-3 sm:gap-5">
        {[
          {
            label: "courses",
            value: courses.length,
            icon: BookOpen,
            color: "stat-blue",
          },
          {
            label: "pending",
            value: entries.filter((e) => !e.evaluation.completed).length,
            icon: Clock3,
            color: "stat-amber",
          },
          {
            label: "completed",
            value: entries.filter((e) => e.evaluation.completed).length,
            icon: Check,
            color: "stat-emerald",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="surface flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:p-5"
          >
            <div className={`stat-icon ${color}`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none">
                {value.toString().padStart(2, "0")}
              </p>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {t(label)}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <nav aria-label={t("views")} className="view-tabs">
          {(
            [
              { id: "calendar", icon: CalendarDays },
              { id: "schedule", icon: ListTodo },
              { id: "calculator", icon: Calculator },
            ] as const
          ).map(({ id, icon: Icon }) => (
            <button
              key={id}
              type="button"
              aria-pressed={view === id}
              onClick={() => setView(id)}
              className={view === id ? "view-tab selected" : "view-tab"}
            >
              <Icon size={17} />
              <span>{t(id)}</span>
            </button>
          ))}
        </nav>
        <div className="flex flex-wrap gap-2">
          <button
            className="button-secondary"
            onClick={() => downloadCalendar(dated)}
            disabled={!dated.length}
          >
            <Download size={16} />
            <span>{t("exportICS")}</span>
          </button>
          <button
            className="button-primary"
            disabled={!hydrated}
            onClick={() => setDialog({ kind: "course" })}
          >
            <Plus size={17} />
            {t("newCourse")}
          </button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-medium text-slate-500 dark:text-slate-400">
          {t("filterCourse")}
        </span>
        <button
          className={`course-chip ${filter === "all" ? "active" : ""}`}
          onClick={() => {
            setFilter("all");
            setFocusId(null);
          }}
        >
          {t("all")} ({courses.length})
        </button>
        {courses.map((c) => (
          <div
            key={c.id}
            className={`course-chip-group ${filter === c.id ? "active" : ""}`}
          >
            <button
              className="flex min-w-0 items-center gap-2 px-3 py-2"
              aria-pressed={filter === c.id}
              onClick={() => {
                setFilter(c.id);
                setCalcId(c.id);
                setFocusId(null);
              }}
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: c.color }}
              />
              <span className="max-w-[160px] truncate sm:max-w-[210px]">
                {c.code && `${c.code} · `}
                {c.name}
              </span>
            </button>
            <button
              className="px-2 text-slate-400 hover:text-blue-600"
              aria-label={`${t("editCourse")}: ${c.name}`}
              onClick={() => setDialog({ kind: "course", course: c })}
            >
              <Settings2 size={14} />
            </button>
          </div>
        ))}
      </div>
      {!hydrated ? (
        <div className="surface p-10 text-center text-sm text-slate-500">
          {t("loading")}
        </div>
      ) : (
        <>
          {!courses.length && (
            <section className="empty-planner surface">
              <div className="empty-orbit">
                <BookOpen size={30} />
                <span>
                  <Plus size={15} />
                </span>
              </div>
              <h2 className="mt-5 text-xl font-bold">{t("emptyTitle")}</h2>
              <p className="mx-auto mb-5 mt-2 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {t("emptyHint")}
              </p>
              <button
                className="button-primary"
                disabled={!hydrated}
                onClick={() => setDialog({ kind: "course" })}
              >
                <Plus size={17} />
                {t("firstCourse")}
              </button>
              <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                <ShieldCheck size={14} />
                {t("localPrivacy")}
              </p>
            </section>
          )}
          {!!courses.length && (
            <div className="surface flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
              <div className="flex items-start gap-4">
                <div className="stat-icon stat-amber shrink-0">
                  <Clock3 size={21} />
                </div>
                <div>
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {t("nextDeadline")}
                  </p>
                  <p className="font-semibold">
                    {upcoming ? upcoming.evaluation.title : t("noUpcoming")}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {upcoming
                      ? `${upcoming.course.name} · ${dateFormat.format(new Date(upcoming.evaluation.end))}`
                      : t("addDatesHint")}
                  </p>
                  {overdue > 0 && (
                    <p className="mt-2 text-xs font-semibold text-rose-600 dark:text-rose-400">
                      {t("overdueCount", { count: overdue })}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-24">
                  <p className="mb-2 text-xs font-semibold">
                    {completed} / {filtered.length} {t("completed")}
                  </p>
                  <progress
                    className="planner-progress"
                    max={Math.max(filtered.length, 1)}
                    value={completed}
                    aria-label={t("completed")}
                  />
                </div>
                <button
                  className="button-primary text-xs"
                  onClick={() => addEvaluation()}
                >
                  <Plus size={16} />
                  {t("newEvaluation")}
                </button>
              </div>
            </div>
          )}
          {view === "calendar" && (
            <AcademicCalendar
              entries={dated}
              onEdit={(e) =>
                setDialog({
                  kind: "evaluation",
                  courseId: e.course.id,
                  evaluation: e.evaluation,
                })
              }
              onDay={addEvaluation}
            />
          )}
          {view === "schedule" && (
            <section className="space-y-4" aria-label={t("schedule")}>
              <div className="surface flex flex-col justify-between gap-4 p-4 sm:flex-row">
                <div className="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-900">
                  {(["all", "pending", "completed"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(s)}
                      aria-pressed={status === s}
                      className={`rounded-lg px-3 py-2 text-xs font-semibold ${status === s ? "bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}`}
                    >
                      {t(s)}
                    </button>
                  ))}
                </div>
                <label className="relative sm:w-72">
                  <Search
                    className="absolute left-3 top-3 text-slate-400"
                    size={17}
                  />
                  <input
                    className="field !pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t("search")}
                    aria-label={t("search")}
                  />
                </label>
              </div>
              {!visible.length && (
                <div className="surface p-12 text-center">
                  <ListTodo size={30} className="mx-auto mb-3 text-slate-300" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {t("noResults")}
                  </p>
                </div>
              )}
              {visible.map((entry) => {
                const { course, evaluation: e } = entry;
                const link = googleCalendarURL(entry);
                const late =
                  !e.completed &&
                  !!e.end &&
                  Date.parse(e.end) < (now?.getTime() ?? 0);
                return (
                  <article
                    key={e.id}
                    className={`schedule-card surface ${e.completed ? "completed-card" : ""}`}
                  >
                    <label className="mt-1 shrink-0">
                      <input
                        type="checkbox"
                        className="h-5 w-5 cursor-pointer accent-blue-600"
                        checked={e.completed}
                        onChange={(event) =>
                          updateEvaluation(course.id, e.id, {
                            completed: event.target.checked,
                          })
                        }
                        aria-label={`${t("completed")}: ${e.title}`}
                      />
                    </label>
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: course.color }}
                        />
                        <span className="font-semibold text-slate-500 dark:text-slate-400">
                          {course.code && `${course.code} · `}
                          {course.name}
                        </span>
                        <span className="rounded-md bg-slate-100 px-2 py-1 font-semibold dark:bg-slate-700">
                          {e.weight}%
                        </span>
                        <span className="text-slate-400">{t(e.kind)}</span>
                      </div>
                      <h3
                        className={`font-bold ${e.completed ? "text-slate-500 line-through" : ""}`}
                      >
                        {e.title}
                      </h3>
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                        {e.start ? (
                          <>
                            <span>
                              {t("startDate")}:{" "}
                              {dateFormat.format(new Date(e.start))}
                            </span>
                            <span
                              className={
                                late
                                  ? "font-semibold text-rose-600 dark:text-rose-400"
                                  : ""
                              }
                            >
                              {t("endDate")}:{" "}
                              {dateFormat.format(new Date(e.end))}
                            </span>
                          </>
                        ) : (
                          <span>{t("noDate")}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`mr-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${e.completed ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : late ? "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300" : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300"}`}
                      >
                        {t(
                          e.completed
                            ? "completed"
                            : late
                              ? "overdue"
                              : "pending",
                        )}
                      </span>
                      <button
                        className="icon-button"
                        aria-label={`${t("editDates")}: ${e.title}`}
                        title={t("editDates")}
                        onClick={() =>
                          setDialog({
                            kind: "evaluation",
                            courseId: course.id,
                            evaluation: e,
                          })
                        }
                      >
                        <CalendarDays size={17} />
                      </button>
                      {link ? (
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="icon-button"
                          aria-label={`${t("googleCalendar")}: ${e.title}`}
                          title={t("googleCalendar")}
                        >
                          <CalendarPlus size={17} />
                        </a>
                      ) : (
                        <button
                          disabled
                          className="icon-button"
                          aria-label={t("dateRequired")}
                          title={t("dateRequired")}
                        >
                          <CalendarPlus size={17} />
                        </button>
                      )}
                      <button
                        className="icon-button"
                        disabled={!link}
                        aria-label={`${t("downloadICS")}: ${e.title}`}
                        title={link ? t("downloadICS") : t("dateRequired")}
                        onClick={() => downloadCalendar([entry])}
                      >
                        <Download size={17} />
                      </button>
                      <button
                        className="button-primary !px-3 !py-2 text-xs"
                        onClick={() => showGrade(entry)}
                      >
                        <Calculator size={15} />
                        {t("grade")}
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </section>
          )}
          {view === "calculator" && (
            <div className="space-y-6">
              {selectedCourse && (
                <CourseCalculator
                  key={selectedCourse.id}
                  course={selectedCourse}
                  courses={courses}
                  onGrade={(id, grade) =>
                    updateEvaluation(selectedCourse.id, id, { grade })
                  }
                  onEdit={(evaluation) =>
                    setDialog({
                      kind: "evaluation",
                      courseId: selectedCourse.id,
                      evaluation,
                    })
                  }
                  onAdd={() =>
                    setDialog({
                      kind: "evaluation",
                      courseId: selectedCourse.id,
                    })
                  }
                  onSelect={(id) => {
                    setCalcId(id);
                    setFilter(id);
                    setFocusId(null);
                  }}
                  focusId={focusId}
                  onClear={() => {
                    if (window.confirm(t("confirmClear")))
                      updateCourse(selectedCourse.id, (c) => ({
                        ...c,
                        evaluations: c.evaluations.map((e) => ({
                          ...e,
                          grade: null,
                        })),
                      }));
                  }}
                />
              )}
              <details className="surface p-5" open={!selectedCourse}>
                <summary className="cursor-pointer text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {t("quickCalculator")}
                </summary>
                <div className="mt-6">{quickCalculator}</div>
              </details>
            </div>
          )}
          {!!courses.length && (
            <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} />
                {t("localPrivacy")}
              </span>
              <span>{t("calendarOptional")}</span>
            </div>
          )}
        </>
      )}
      {dialog?.kind === "course" && (
        <CourseForm
          course={dialog.course}
          onClose={() => setDialog(null)}
          onSave={(course) => {
            updatePage((p) => ({
              ...p,
              courses: dialog.course
                ? p.courses.map((c) => (c.id === course.id ? course : c))
                : [...p.courses, course],
            }));
            setCalcId(course.id);
            setDialog(null);
          }}
          onDelete={
            dialog.course
              ? () => {
                  if (window.confirm(t("confirmDeleteCourse"))) {
                    updatePage((p) => ({
                      ...p,
                      courses: p.courses.filter(
                        (c) => c.id !== dialog.course!.id,
                      ),
                    }));
                    setFilter("all");
                    setDialog(null);
                  }
                }
              : undefined
          }
        />
      )}
      {dialog?.kind === "evaluation" && (
        <EvaluationForm
          courses={courses}
          courseId={dialog.courseId}
          evaluation={dialog.evaluation}
          day={dialog.day}
          onClose={() => setDialog(null)}
          onSave={(courseId, evaluation) => {
            updateCourse(courseId, (c) => ({
              ...c,
              evaluations: dialog.evaluation
                ? c.evaluations.map((e) =>
                    e.id === evaluation.id ? evaluation : e,
                  )
                : [...c.evaluations, evaluation],
            }));
            setDialog(null);
          }}
          onDelete={
            dialog.evaluation
              ? () => {
                  if (window.confirm(t("confirmDeleteEvaluation"))) {
                    updateCourse(dialog.courseId, (c) => ({
                      ...c,
                      evaluations: c.evaluations.filter(
                        (e) => e.id !== dialog.evaluation!.id,
                      ),
                    }));
                    setDialog(null);
                  }
                }
              : undefined
          }
        />
      )}
      {dialog?.kind === "page" && (
        <PlannerDialog
          title={t(dialog.editing ? "editPage" : "newPage")}
          onClose={() => setDialog(null)}
        >
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              const name = String(
                new FormData(e.currentTarget).get("name"),
              ).trim();
              if (!name) return;
              if (dialog.editing) updatePage((p) => ({ ...p, name }));
              else {
                const id = newId();
                setData((prev) => ({
                  ...prev,
                  pages: [...prev.pages, { id, name, courses: [] }],
                }));
                changePage(id);
              }
              setDialog(null);
            }}
          >
            <label className="field-label">
              {t("pageName")}
              <input
                className="field"
                name="name"
                required
                maxLength={100}
                autoFocus
                defaultValue={dialog.editing ? page.name : ""}
                placeholder={t("pagePlaceholder")}
              />
            </label>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("pageHint")}
            </p>
            <div className="flex flex-wrap justify-between gap-3">
              {dialog.editing && (
                <button
                  className="button-danger"
                  type="button"
                  disabled={data.pages.length === 1}
                  onClick={() => {
                    if (window.confirm(t("confirmDeletePage"))) {
                      const remaining = data.pages.filter(
                        (p) => p.id !== page.id,
                      );
                      setData((prev) => ({ ...prev, pages: remaining }));
                      changePage(remaining[0].id);
                      setDialog(null);
                    }
                  }}
                >
                  <Trash2 size={15} />
                  {t("deletePage")}
                </button>
              )}
              <button className="button-primary ml-auto" type="submit">
                <Check size={16} />
                {t("saveChanges")}
              </button>
            </div>
          </form>
        </PlannerDialog>
      )}
    </div>
  );
}
