"use client";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { PlannerDialog } from "./PlannerDialog";
export function ConfirmDialog({
  title,
  message,
  onCancel,
  onConfirm,
}: {
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const t = useTranslations("planner");
  return (
    <PlannerDialog title={title} onClose={onCancel}>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
        <Trash2 size={23} />
      </div>
      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {message}
      </p>
      <div className="mt-6 flex justify-end gap-3">
        <button
          autoFocus
          type="button"
          className="button-secondary"
          onClick={onCancel}
        >
          {t("cancel")}
        </button>
        <button
          type="button"
          className="button-primary !bg-rose-600 hover:!bg-rose-700"
          onClick={onConfirm}
        >
          <Trash2 size={16} />
          {t("confirmDelete")}
        </button>
      </div>
    </PlannerDialog>
  );
}
