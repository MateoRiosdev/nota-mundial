"use client";
import { useState, type FormEvent } from "react";
import { Check, CalendarDays, Palette, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Course,
  Evaluation,
  COURSE_COLORS,
  newId,
  localInput,
  validRange,
} from "@/lib/planner";
import { PlannerDialog } from "./PlannerDialog";

export function CourseForm({
  course,
  onSave,
  onClose,
  onDelete,
}: {
  course?: Course;
  onSave: (course: Course) => void;
  onClose: () => void;
  onDelete?: () => void;
}) {
  const t = useTranslations("planner");
  const [color, setColor] = useState(course?.color ?? COURSE_COLORS[0]);
  const [error, setError] = useState("");
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const min = Number(f.get("min")),
      max = Number(f.get("max"));
    if (
      min >= max ||
      course?.evaluations.some(
        (e) => e.grade !== null && (e.grade < min || e.grade > max),
      )
    ) {
      setError(t("invalidScale"));
      return;
    }
    const name = String(f.get("name")).trim();
    if (!name) return;
    onSave({
      id: course?.id ?? newId(),
      name,
      code: String(f.get("code")).trim(),
      color,
      min,
      max,
      evaluations: course?.evaluations ?? [],
    });
  }
  return (
    <PlannerDialog
      title={t(course ? "editCourse" : "newCourse")}
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-5">
        <label className="field-label">
          {t("courseName")}
          <input
            name="name"
            autoFocus
            required
            maxLength={160}
            defaultValue={course?.name}
            placeholder={t("coursePlaceholder")}
            className="field"
          />
        </label>
        <label className="field-label">
          {t("courseCode")}
          <input
            name="code"
            maxLength={30}
            defaultValue={course?.code}
            placeholder="MAT-101"
            className="field"
          />
        </label>
        <fieldset>
          <legend className="field-label mb-3">
            <Palette size={16} />
            {t("courseColor")}
          </legend>
          <div className="flex flex-wrap items-center gap-3">
            {COURSE_COLORS.map((c) => (
              <button
                type="button"
                key={c}
                className="color-swatch"
                style={{ background: c }}
                aria-label={`${t("courseColor")} ${c}`}
                aria-pressed={color.toUpperCase() === c}
                onClick={() => setColor(c)}
              >
                {color.toUpperCase() === c && <Check size={18} />}
              </button>
            ))}
            <label className="flex items-center gap-2 text-sm">
              {t("customColor")}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                aria-label={t("customColor")}
                className="h-9 w-10 cursor-pointer rounded border-0 bg-transparent"
              />
            </label>
          </div>
        </fieldset>
        <fieldset>
          <legend className="field-label mb-3">{t("gradeScale")}</legend>
          <div className="grid grid-cols-2 gap-4">
            <label className="field-label">
              {t("minimum")}
              <input
                name="min"
                className="field"
                type="number"
                step="any"
                required
                defaultValue={course?.min ?? 0}
              />
            </label>
            <label className="field-label">
              {t("maximum")}
              <input
                name="max"
                className="field"
                type="number"
                step="any"
                required
                defaultValue={course?.max ?? 20}
              />
            </label>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {t("scaleHint")}
          </p>
        </fieldset>
        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        <div className="flex flex-wrap justify-between gap-3 border-t border-slate-200 pt-5 dark:border-slate-700">
          {onDelete && (
            <button type="button" className="button-danger" onClick={onDelete}>
              <Trash2 size={16} />
              {t("deleteCourse")}
            </button>
          )}
          <button className="button-primary ml-auto" type="submit">
            <Check size={17} />
            {t("saveChanges")}
          </button>
        </div>
      </form>
    </PlannerDialog>
  );
}

export function EvaluationForm({
  courses,
  courseId,
  evaluation,
  day,
  onSave,
  onClose,
  onDelete,
}: {
  courses: Course[];
  courseId: string;
  evaluation?: Evaluation;
  day?: string;
  onSave: (courseId: string, e: Evaluation) => void;
  onClose: () => void;
  onDelete?: () => void;
}) {
  const t = useTranslations("planner");
  const [selected, setSelected] = useState(courseId);
  const [start, setStart] = useState(
    evaluation?.start
      ? localInput(evaluation.start)
      : day
        ? `${day}T09:00`
        : "",
  );
  const [end, setEnd] = useState(
    evaluation?.end ? localInput(evaluation.end) : day ? `${day}T23:59` : "",
  );
  const [error, setError] = useState("");
  const course = courses.find((c) => c.id === selected)!;
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if ((start || end) && !validRange(start, end)) {
      setError(t("invalidDates"));
      return;
    }
    const title = String(f.get("title")).trim();
    if (!title) return;
    const grade = String(f.get("grade") ?? "");
    onSave(selected, {
      id: evaluation?.id ?? newId(),
      title,
      kind: f.get("kind") as Evaluation["kind"],
      weight: Number(f.get("weight")),
      grade: grade === "" ? null : Number(grade),
      start: start ? new Date(start).toISOString() : "",
      end: end ? new Date(end).toISOString() : "",
      completed: evaluation?.completed ?? false,
    });
  }
  function extend(days: number) {
    const date = start ? new Date(start) : new Date();
    setStart(localInput(date));
    date.setDate(date.getDate() + days);
    setEnd(localInput(date));
  }
  return (
    <PlannerDialog
      title={t(evaluation ? "editEvaluation" : "newEvaluation")}
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-5">
        <label className="field-label">
          {t("course")}
          <select
            aria-label={t("course")}
            className="field"
            value={selected}
            disabled={!!evaluation}
            onChange={(e) => setSelected(e.target.value)}
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field-label">
          {t("evaluationName")}
          <input
            autoFocus
            required
            name="title"
            maxLength={160}
            defaultValue={evaluation?.title}
            className="field"
            placeholder={t("evaluationPlaceholder")}
          />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="field-label">
            {t("type")}
            <select
              className="field"
              name="kind"
              defaultValue={evaluation?.kind ?? "task"}
            >
              <option value="task">{t("task")}</option>
              <option value="exam">{t("exam")}</option>
            </select>
          </label>
          <label className="field-label">
            {t("weight")} (%)
            <input
              className="field"
              type="number"
              name="weight"
              min={0}
              max={100}
              step="any"
              required
              defaultValue={evaluation?.weight ?? 0}
            />
          </label>
        </div>
        <label className="field-label">
          {t("grade")} ({course.min}–{course.max})
          <input
            className="field"
            name="grade"
            type="number"
            min={course.min}
            max={course.max}
            step="any"
            defaultValue={evaluation?.grade ?? ""}
            placeholder={t("ungraded")}
          />
        </label>
        <fieldset className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
          <legend className="field-label">
            <CalendarDays size={17} />
            {t("scheduleOptional")}
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="field-label">
              {t("startDate")}
              <input
                className="field"
                type="datetime-local"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                required={!!end}
              />
            </label>
            <label className="field-label">
              {t("endDate")}
              <input
                className="field"
                type="datetime-local"
                value={end}
                min={start || undefined}
                onChange={(e) => setEnd(e.target.value)}
                required={!!start}
              />
            </label>
          </div>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            {t("localTimezone")}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {[3, 7, 14].map((days) => (
              <button
                className="button-secondary text-xs"
                type="button"
                key={days}
                onClick={() => extend(days)}
              >
                +{days} {t("days")}
              </button>
            ))}
            <button
              type="button"
              className="button-secondary text-xs"
              onClick={() => {
                setStart("");
                setEnd("");
              }}
            >
              {t("clearDates")}
            </button>
          </div>
        </fieldset>
        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        <div className="flex flex-wrap justify-between gap-3 border-t border-slate-200 pt-5 dark:border-slate-700">
          {onDelete && (
            <button type="button" className="button-danger" onClick={onDelete}>
              <Trash2 size={16} />
              {t("delete")}
            </button>
          )}
          <button className="button-primary ml-auto" type="submit">
            <Check size={17} />
            {t("saveChanges")}
          </button>
        </div>
      </form>
    </PlannerDialog>
  );
}
