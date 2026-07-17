'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X, Trash2, Upload, BookOpen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SavedGrade } from '@/lib/useSavedGrades';
import { FlagIcon } from './FlagIcon';
import { localeMeta } from '@/i18n/routing';

// Mapeo cca2 → countryCode para FlagIcon
function getFlagCode(cca2: string | null): string | null {
  if (!cca2) return null;
  return cca2.toLowerCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

export function SavedGradesPanel({
  open,
  onClose,
  savedGrades,
  onLoad,
  onDelete,
  onClearAll,
}: {
  open: boolean;
  onClose: () => void;
  savedGrades: SavedGrade[];
  onLoad: (grade: SavedGrade) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}) {
  const t = useTranslations('savedGrades');

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel lateral derecho */}
          <motion.aside
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-white dark:bg-slate-800 shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          >
            {/* Header del panel */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-brand-500" />
                <h2 className="font-semibold text-base">{t('title')}</h2>
                {savedGrades.length > 0 && (
                  <span className="rounded-full bg-brand-500 px-2 py-0.5 text-xs font-bold text-white">
                    {savedGrades.length}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700"
                aria-label="close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Lista */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {savedGrades.length === 0 ? (
                <p className="text-center text-sm text-slate-400 mt-8">{t('empty')}</p>
              ) : (
                [...savedGrades].reverse().map((grade) => (
                  <div
                    key={grade.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/40 p-3"
                  >
                    {/* Fila superior: bandera + escala + fecha */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {grade.countryCode && (
                          <FlagIcon code={grade.countryCode} size="sm" />
                        )}
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {grade.countryCode ?? t('noCountry')} · {grade.scaleLabel}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {formatDate(grade.createdAt)}
                      </span>
                    </div>

                    {/* Nota grande */}
                    <p className="text-2xl font-bold text-brand-600 mb-1">
                      {grade.localGrade.toFixed(
                        grade.scaleLabel.includes('0-100') ? 1 : 2
                      )}
                      <span className="ml-1 text-xs font-normal text-slate-400">
                        / {grade.scaleLabel.split('-')[1]}
                      </span>
                    </p>

                    {/* Modo */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                      {grade.mode === 'custom' ? t('mode_custom') : t('mode_english')}
                      {' · '}
                      {grade.score0to100.toFixed(1)} / 100
                    </p>

                    {/* Acciones */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => { onLoad(grade); onClose(); }}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600"
                      >
                        <Upload size={12} /> {t('load')}
                      </button>
                      <button
                        onClick={() => onDelete(grade.id)}
                        className="flex items-center justify-center gap-1.5 rounded-lg border border-red-300 dark:border-red-700 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 size={12} /> {t('delete')}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer con "Limpiar todo" */}
            {savedGrades.length > 0 && (
              <div className="border-t border-slate-200 dark:border-slate-700 p-4">
                <button
                  onClick={onClearAll}
                  className="w-full rounded-lg border border-red-300 dark:border-red-700 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  {t('clearAll')}
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}