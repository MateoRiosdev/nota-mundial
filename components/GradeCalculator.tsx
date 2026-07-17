'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Save, Calculator, RotateCcw, Plus, Trash2, BookOpen } from 'lucide-react';
import { AnimatedModal } from './AnimatedModal';
import { SavedGradesPanel } from './SavedGradesPanel';
import { getGradingSystem } from '@/lib/gradingSystems';
import { useSavedGrades, SavedGrade } from '@/lib/useSavedGrades';
import { FlagIcon } from './FlagIcon';

type EvalRow = { id: string; label: string; percentage: number; grade: number };

function defaultCustomRows(min: number): EvalRow[] {
  return [
    { id: crypto.randomUUID(), label: '', percentage: 50, grade: min },
    { id: crypto.randomUUID(), label: '', percentage: 50, grade: min },
  ];
}

function englishRows(t: (k: string) => string, min: number): EvalRow[] {
  const keys = ['pa1', 'pa2', 'pa3', 'pa4', 'pa5', 'pa6'];
  const rows = keys.map((k) => ({
    id: k,
    label: t(`calculator.englishEvaluations.${k}`),
    percentage: 10,
    grade: min,
  }));
  rows.push({
    id: 'final',
    label: t('calculator.englishEvaluations.final'),
    percentage: 40,
    grade: min,
  });
  return rows;
}

export function GradeCalculator({
  countryCode,
  countryName,
}: {
  countryCode: string | null;
  countryName: string | null;
}) {
  const t = useTranslations();
  const { savedGrades, saveGrade, deleteGrade, clearGrades, count, hydrated } =
    useSavedGrades();

  const gradingSystem = getGradingSystem(countryCode ?? 'XX');
  const { min, max, scaleLabel } = gradingSystem;

  const [mode, setMode]             = useState<'custom' | 'english'>('custom');
  const [customRows, setCustomRows] = useState<EvalRow[]>(() => defaultCustomRows(min));
  const [engRows, setEngRows]       = useState<EvalRow[]>(() => englishRows(t, min));
  const [modalOpen, setModalOpen]   = useState(false);
  const [panelOpen, setPanelOpen]   = useState(false);
  const [result, setResult]         = useState<{ score: number; local: number } | null>(null);
  const [justSaved, setJustSaved]   = useState(false);

  const rows    = mode === 'custom' ? customRows : engRows;
  const setRows = mode === 'custom'
    ? (fn: (p: EvalRow[]) => EvalRow[]) => setCustomRows(fn)
    : (fn: (p: EvalRow[]) => EvalRow[]) => setEngRows(fn);

  const totalPercentage = useMemo(
    () => rows.reduce((sum, r) => sum + (Number(r.percentage) || 0), 0),
    [rows]
  );

  function updateRow(id: string, patch: Partial<EvalRow>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }
  function addRow() {
    setCustomRows((prev) => [
      ...prev,
      { id: crypto.randomUUID(), label: '', percentage: 0, grade: min },
    ]);
  }
  function removeRow(id: string) {
    setCustomRows((prev) => prev.filter((r) => r.id !== id));
  }

  function calculate() {
    const score = rows.reduce((sum, r) => {
      const norm = gradingSystem.normalize(Number(r.grade) || min);
      return sum + (norm * (Number(r.percentage) || 0)) / 100;
    }, 0);
    setResult({ score, local: gradingSystem.convert(score) });
    setModalOpen(true);
    setJustSaved(false);
  }

  function handleSave() {
    if (!result) return;
    saveGrade({
      mode, countryCode,
      score0to100: result.score,
      localGrade:  result.local,
      scaleLabel:  gradingSystem.scaleLabel,
      rows: rows.map((r) => ({ label: r.label, percentage: r.percentage, grade: r.grade })),
    });
    setJustSaved(true);
  }

  function handleLoadGrade(grade: SavedGrade) {
    if (!grade.rows) return;
    const restored: EvalRow[] = grade.rows.map((r) => ({
      id: crypto.randomUUID(),
      label: r.label,
      percentage: r.percentage,
      grade: r.grade,
    }));
    if (grade.mode === 'custom') { setMode('custom'); setCustomRows(restored); }
    else                         { setMode('english'); setEngRows(restored);   }
  }

  function resetAll() {
    setCustomRows(defaultCustomRows(min));
    setEngRows(englishRows(t, min));
    setResult(null);
    setModalOpen(false);
  }

  const calculatorTitle = (() => {
    if (mode === 'english') return t('calculator.modeEnglish');
    if (countryName && countryCode) return `${t('calculator.countryGradeTitle')} ${countryName}`;
    return t('calculator.noCountrySelected');
  })();

  return (
    <>
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-5">

        {/* ════════════════════════════════════════
            HEADER — mobile: 2 filas / desktop: 1 fila
            ════════════════════════════════════════ */}
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

          {/* Fila 1 (siempre visible): bandera + título */}
          <div className="flex items-center gap-2 min-w-0">
            {countryCode && mode === 'custom' && (
              <FlagIcon code={countryCode} size="md" />
            )}
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">
              {calculatorTitle}
            </h2>
          </div>

          {/* Fila 2 (mobile) / mismo nivel (desktop): escala + guardadas */}
          <div className="flex items-center gap-2 flex-wrap">

            {/* Pill escala */}
            <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-700 px-2.5 py-1 text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
              <span>
                {t('countrySelector.scaleLabel')}:&nbsp;
                <strong className="text-slate-700 dark:text-slate-200">{scaleLabel}</strong>
              </span>
              <span>·&nbsp;{t('calculator.gradeHeader')} {scaleLabel}</span>
            </div>

            {/* Botón guardadas */}
            {hydrated && (
              <button
                type="button"
                onClick={() => setPanelOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 dark:border-slate-600 px-3 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
              >
                <BookOpen size={13} />
                <span>{t('calculator.savedBadge')}</span>
                {count > 0 && (
                  <span className="rounded-full bg-brand-500 px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
                    {count}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Aviso ISIL en modo english */}
        {mode === 'english' && (
          <div className="mb-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 p-3">
            <p className="text-sm text-amber-700 dark:text-amber-300">{t('hero.isilNote')}</p>
          </div>
        )}

        {/* ════════════════════════════════════════
            TABLA — mobile: cards apiladas / desktop: tabla
            ════════════════════════════════════════ */}

        {/* Vista MÓVIL: cards */}
        <div className="flex flex-col gap-3 sm:hidden">
          {rows.map((row, idx) => (
            <div
              key={row.id}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/40 p-3 space-y-2"
            >
              {/* Número + label */}
              <div className="flex items-start justify-between gap-2">
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-700/30 text-[10px] font-bold text-brand-600 dark:text-brand-300">
                  {idx + 1}
                </span>
                {mode === 'custom' ? (
                  <input
                    type="text"
                    value={row.label}
                    onChange={(e) => updateRow(row.id, { label: e.target.value })}
                    placeholder={t('calculator.evaluationsHeader')}
                    className="flex-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                  />
                ) : (
                  <span className="flex-1 text-sm font-medium">{row.label}</span>
                )}
                {mode === 'custom' && (
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    className="flex-shrink-0 text-slate-400 hover:text-red-500 mt-1"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>

              {/* Porcentaje + Nota en fila */}
              <div className="flex items-center gap-3">
                <div className="flex flex-1 flex-col gap-0.5">
                  <label className="text-[10px] uppercase tracking-wide text-slate-400">
                    {t('calculator.percentageHeader')}
                  </label>
                  <input
                    type="number"
                    min={0} max={100}
                    value={row.percentage}
                    disabled={mode === 'english'}
                    onChange={(e) => updateRow(row.id, { percentage: Number(e.target.value) })}
                    className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-0.5">
                  <label className="text-[10px] uppercase tracking-wide text-slate-400">
                    {t('calculator.gradeHeader')} ({scaleLabel})
                  </label>
                  <input
                    type="number"
                    min={min} max={max}
                    step={max <= 10 ? 0.1 : max <= 20 ? 0.5 : 1}
                    value={row.grade}
                    onChange={(e) => updateRow(row.id, { grade: Number(e.target.value) })}
                    className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Vista DESKTOP: tabla clásica */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-left text-slate-500 dark:text-slate-400">
                <th className="py-2 pr-2 w-full">{t('calculator.evaluationsHeader')}</th>
                <th className="py-2 pr-2 w-28 whitespace-nowrap">{t('calculator.percentageHeader')}</th>
                <th className="py-2 pr-2 w-32 whitespace-nowrap">
                  {t('calculator.gradeHeader')} ({scaleLabel})
                </th>
                {mode === 'custom' && <th className="w-8" />}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 dark:border-slate-700/60">
                  <td className="py-2 pr-2">
                    {mode === 'custom' ? (
                      <input
                        type="text"
                        value={row.label}
                        onChange={(e) => updateRow(row.id, { label: e.target.value })}
                        placeholder={t('calculator.evaluationsHeader')}
                        className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-transparent px-2 py-1 outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    ) : (
                      <span className="font-medium">{row.label}</span>
                    )}
                  </td>
                  <td className="py-2 pr-2">
                    <input
                      type="number"
                      min={0} max={100}
                      value={row.percentage}
                      disabled={mode === 'english'}
                      onChange={(e) => updateRow(row.id, { percentage: Number(e.target.value) })}
                      className="w-20 rounded-md border border-slate-300 dark:border-slate-600 bg-transparent px-2 py-1 outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60"
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <input
                      type="number"
                      min={min} max={max}
                      step={max <= 10 ? 0.1 : max <= 20 ? 0.5 : 1}
                      value={row.grade}
                      onChange={(e) => updateRow(row.id, { grade: Number(e.target.value) })}
                      className="w-24 rounded-md border border-slate-300 dark:border-slate-600 bg-transparent px-2 py-1 outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </td>
                  {mode === 'custom' && (
                    <td className="py-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Agregar fila */}
        {mode === 'custom' && (
          <button
            type="button"
            onClick={addRow}
            className="mt-3 inline-flex items-center gap-1 text-sm text-brand-600 hover:underline"
          >
            <Plus size={14} /> {t('calculator.addEvaluation')}
          </button>
        )}

        {/* Total porcentaje */}
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400">{t('calculator.totalPercentage')}</span>
          <span className={totalPercentage === 100 ? 'font-semibold text-emerald-600' : 'font-semibold text-amber-500'}>
            {totalPercentage}%
          </span>
        </div>
        {totalPercentage !== 100 && (
          <p className="mt-1 text-xs text-amber-500">{t('calculator.percentageWarning')}</p>
        )}

        {/* Botones */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
          <button
            type="button"
            onClick={calculate}
            disabled={totalPercentage !== 100}
            className="order-first sm:order-none inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Calculator size={16} /> {t('calculator.calculateButton')}
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!result}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2.5 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Save size={16} /> {t('calculator.saveButton')}
          </button>

          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2.5 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <RotateCcw size={16} /> {t('calculator.newCalcButton')}
          </button>
        </div>

        {/* Modal resultado */}
        <AnimatedModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={t('resultModal.title')}
        >
          {result && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {countryCode && <FlagIcon code={countryCode} size="lg" />}
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t('resultModal.yourGrade')}
                </p>
              </div>
              <p className="text-5xl font-bold text-brand-600">
                {result.local.toFixed(gradingSystem.decimals)}
                <span className="ml-2 text-base font-normal text-slate-400">
                  {t('resultModal.onScale')} {gradingSystem.scaleLabel}
                </span>
              </p>
              <p className="text-xs text-slate-400">
                {t('resultModal.internalScore')}: {result.score.toFixed(2)} / 100
              </p>
              <button
                type="button"
                onClick={handleSave}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
              >
                <Save size={16} />
                {justSaved
                  ? `${t('calculator.savedBadge')} (${count})`
                  : t('resultModal.saveNow')}
              </button>
            </div>
          )}
        </AnimatedModal>
      </div>

      <SavedGradesPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        savedGrades={savedGrades}
        onLoad={handleLoadGrade}
        onDelete={deleteGrade}
        onClearAll={clearGrades}
      />
    </>
  );
}