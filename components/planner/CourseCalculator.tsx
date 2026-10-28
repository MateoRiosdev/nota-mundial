"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Award, Plus, Pencil, RotateCcw, BookOpen } from "lucide-react";
import { Course, Evaluation, courseResult } from "@/lib/planner";
function GradeInput({
  evaluation,
  course,
  onChange,
  focus,
}: {
  evaluation: Evaluation;
  course: Course;
  onChange: (grade: number | null) => void;
  focus: boolean;
}) {
  const t = useTranslations("planner");
  const [draft, setDraft] = useState(String(evaluation.grade ?? ""));
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => setDraft(String(evaluation.grade ?? "")), [evaluation.grade]);
  useEffect(() => {
    if (focus) {
      ref.current?.focus();
      ref.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [focus]);
  const invalid =
    draft !== "" &&
    (!Number.isFinite(Number(draft)) ||
      Number(draft) < course.min ||
      Number(draft) > course.max);
  return (
    <div>
      <input
        ref={ref}
        className="field text-center font-semibold"
        type="number"
        aria-label={`${t("grade")}: ${evaluation.title}`}
        aria-invalid={invalid}
        min={course.min}
        max={course.max}
        step="any"
        placeholder="—"
        value={draft}
        onChange={(e) => {
          const value = e.target.value;
          setDraft(value);
          if (value === "") onChange(null);
          else if (
            Number.isFinite(Number(value)) &&
            Number(value) >= course.min &&
            Number(value) <= course.max
          )
            onChange(Number(value));
        }}
      />
      {invalid && (
        <span
          className="mt-1 block text-xs text-red-600 dark:text-red-400"
          role="alert"
        >
          {t("invalidGrade", { min: course.min, max: course.max })}
        </span>
      )}
    </div>
  );
}
export function CourseCalculator({
  course,
  courses,
  onGrade,
  onEdit,
  onAdd,
  onSelect,
  focusId,
  onClear,
}: {
  course: Course;
  courses: Course[];
  onGrade: (id: string, grade: number | null) => void;
  onEdit: (e: Evaluation) => void;
  onAdd: () => void;
  onSelect: (id: string) => void;
  focusId: string | null;
  onClear: () => void;
}) {
  const t = useTranslations("planner"),
    calc = useTranslations("calculator");
  const result = courseResult(course),
    hasGrades = course.evaluations.some((e) => e.grade !== null);
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1.5fr_1fr]">
      <section className="surface overflow-hidden">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 sm:p-6 dark:border-slate-700">
          <div>
            <span
              className="mb-2 inline-flex rounded-md px-2 py-1 text-xs font-bold"
              style={{ background: `${course.color}18`, color: course.color }}
            >
              {course.code || t("course")}
            </span>
            <h2 className="text-lg font-bold">{course.name}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t("gradeScale")}: {course.min}–{course.max}
            </p>
          </div>
          <BookOpen
            size={23}
            style={{ color: course.color }}
            className="shrink-0"
          />
        </div>
        <div className="p-4 sm:p-6">
          <div className="mb-3 hidden grid-cols-[1fr_110px_80px_32px] gap-3 text-xs font-semibold text-slate-500 sm:grid dark:text-slate-400">
            <span>{t("evaluationName")}</span>
            <span>{t("grade")}</span>
            <span>{t("weight")}</span>
            <span />
          </div>
          <div className="space-y-3">
            {course.evaluations.map((e) => (
              <div
                key={e.id}
                className={`grid grid-cols-[1fr_90px_65px_32px] items-center gap-2 rounded-xl border p-3 sm:grid-cols-[1fr_110px_80px_32px] sm:gap-3 ${focusId === e.id ? "border-blue-400 bg-blue-50/50 dark:bg-blue-950/30" : "border-slate-200 dark:border-slate-700"}`}
              >
                <div className="col-span-4 flex items-center justify-between gap-2 sm:col-span-1 sm:block">
                  <p className="text-sm font-semibold break-words">{e.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t(e.kind)}
                  </p>
                </div>
                <span className="text-xs text-slate-500 sm:hidden">
                  {t("grade")}
                </span>
                <GradeInput
                  course={course}
                  evaluation={e}
                  onChange={(grade) => onGrade(e.id, grade)}
                  focus={focusId === e.id}
                />
                <span className="text-center text-sm font-semibold">
                  {e.weight}%
                </span>
                <button
                  className="icon-button !h-8 !w-8"
                  onClick={() => onEdit(e)}
                  aria-label={`${t("editEvaluation")}: ${e.title}`}
                >
                  <Pencil size={14} />
                </button>
              </div>
            ))}
          </div>
          {!course.evaluations.length && (
            <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
              {t("noEvaluations")}
            </p>
          )}
          <button type="button" className="button-primary mt-5" onClick={onAdd}>
            <Plus size={17} />
            {calc("addEvaluation")}
          </button>
          <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 text-sm dark:border-slate-700">
            <strong>{calc("totalPercentage")}</strong>
            <strong
              className={
                Math.abs(result.total - 100) < 0.001
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-amber-600 dark:text-amber-400"
              }
            >
              {Number(result.total.toFixed(2))}%
            </strong>
          </div>
          {Math.abs(result.total - 100) >= 0.001 && (
            <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
              {calc("percentageWarning")}
            </p>
          )}
          {hasGrades && (
            <button className="button-secondary mt-5 text-xs" onClick={onClear}>
              <RotateCcw size={14} />
              {t("clearGrades")}
            </button>
          )}
        </div>
      </section>
      <aside className="space-y-5">
        <section className="surface p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-sm font-bold">
            <Award size={20} className="text-blue-600" />
            {t("gradeResult")}
          </h2>
          <div className="my-5 rounded-2xl bg-blue-50/70 p-6 text-center dark:bg-blue-950/30">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t(result.complete ? "finalGrade" : "provisionalGrade")}
            </p>
            <p className="my-3 text-5xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
              {hasGrades ? result.points.toFixed(2) : "—"}
              <span className="ml-1 text-lg font-medium text-slate-400">
                / {course.max}
              </span>
            </p>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {t(result.complete ? "completeGrades" : "partialHint")}
            </p>
          </div>
          <div className="mb-2 flex justify-between text-xs">
            <span>{t("gradedWeight")}</span>
            <strong>{Number(result.gradedWeight.toFixed(2))}%</strong>
          </div>
          <progress
            className="planner-progress"
            max={100}
            value={Math.min(result.gradedWeight, 100)}
            aria-label={t("gradedWeight")}
          />
          <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            {t("formula")}
          </p>
        </section>
        <section className="surface p-5">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t("courseOverview")}
          </h3>
          <div className="space-y-2">
            {courses.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelect(c.id)}
                className={`flex w-full items-center gap-2 rounded-xl p-3 text-left text-sm ${c.id === course.id ? "bg-blue-50 dark:bg-blue-950/40" : "hover:bg-slate-50 dark:hover:bg-slate-700/50"}`}
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: c.color }}
                />
                <span className="truncate">{c.name}</span>
                <strong className="ml-auto">
                  {c.evaluations.some((e) => e.grade !== null)
                    ? courseResult(c).points.toFixed(2)
                    : "—"}
                </strong>
              </button>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
