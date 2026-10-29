"use client";
import { useId, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { dayKey, localInput, monthWeeks } from "@/lib/planner";
import { CustomSelect } from "./CustomSelect";
export function DateTimePicker({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  const t = useTranslations("planner"),
    locale = useLocale(),
    id = useId();
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => new Date(value || new Date()));
  const valid = Number.isFinite(Date.parse(value));
  const time = valid ? value.slice(11, 16) : "09:00";
  const weeks = monthWeeks(month);
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: String(i),
    label: new Intl.DateTimeFormat(locale, { month: "long" }).format(
      new Date(2026, i, 1),
    ),
  }));
  function selectDate(day: string) {
    onChange(`${day}T${time}`);
  }
  function changeTime(part: number, raw: string) {
    if (raw === "") return;
    const n = Number(raw);
    if (n < 0 || n > (part ? 59 : 23)) return;
    const bits = time.split(":");
    bits[part] = String(n).padStart(2, "0");
    onChange(
      `${valid ? value.slice(0, 10) : dayKey(new Date())}T${bits.join(":")}`,
    );
  }
  return (
    <div className="min-w-0">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          className="field !pr-12"
          value={value.replace("T", " ")}
          onChange={(e) => onChange(e.target.value.replace(" ", "T"))}
          placeholder="YYYY-MM-DD HH:mm"
          pattern="[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}"
          required={required}
        />
        <button
          type="button"
          className="absolute right-1 top-1.5 rounded-lg p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950"
          aria-label={`${t("chooseDate")}: ${label}`}
          aria-expanded={open}
          onClick={() => {
            if (!open) setMonth(new Date(valid ? value : new Date()));
            setOpen(!open);
          }}
        >
          <CalendarDays size={18} />
        </button>
      </div>
      {open && (
        <div
          className="date-picker-panel"
          role="region"
          aria-label={`${t("chooseDate")}: ${label}`}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
            }
          }}
        >
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="icon-button !h-7 !w-7"
              aria-label={t("previousMonth")}
              onClick={() =>
                setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
              }
            >
              <ChevronLeft size={14} />
            </button>
            <CustomSelect
              label={`${t("month")}: ${label}`}
              value={String(month.getMonth())}
              options={months}
              onChange={(v) =>
                setMonth(new Date(month.getFullYear(), Number(v), 1))
              }
              className="min-w-0 flex-1"
            />
            <input
              type="number"
              aria-label={`${t("year")}: ${label}`}
              min={1900}
              max={9999}
              className="field !mt-0 !w-[4.5rem] !px-1 !py-2 !text-xs"
              value={month.getFullYear()}
              onChange={(e) => {
                const y = Number(e.target.value);
                if (y >= 1900 && y <= 9999)
                  setMonth(new Date(y, month.getMonth(), 1));
              }}
            />
            <button
              type="button"
              className="icon-button !h-7 !w-7"
              aria-label={t("nextMonth")}
              onClick={() =>
                setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
              }
            >
              <ChevronRight size={14} />
            </button>
          </div>
          <div className="mt-3 grid grid-cols-7 gap-0.5 text-center">
            {weeks[0].map((d) => (
              <span
                key={d.getDay()}
                className="py-1 text-[10px] font-bold uppercase text-slate-400"
              >
                {new Intl.DateTimeFormat(locale, { weekday: "narrow" }).format(
                  d,
                )}
              </span>
            ))}
            {weeks.flat().map((d) => (
              <button
                type="button"
                key={dayKey(d)}
                aria-label={dayKey(d)}
                aria-pressed={value.startsWith(dayKey(d))}
                className={`date-picker-day ${value.startsWith(dayKey(d)) ? "chosen" : ""} ${d.getMonth() !== month.getMonth() ? "opacity-35" : ""}`}
                onClick={() => selectDate(dayKey(d))}
              >
                {d.getDate()}
              </button>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-200 pt-3 dark:border-slate-700">
            {[t("hour"), t("minute")].map((text, i) => (
              <label
                key={text}
                className="text-xs font-medium text-slate-500 dark:text-slate-400"
              >
                {text}
                <input
                  aria-label={`${text}: ${label}`}
                  className="field !py-1.5 text-center"
                  type="number"
                  min={0}
                  max={i ? 59 : 23}
                  value={Number(time.split(":")[i])}
                  onChange={(e) => changeTime(i, e.target.value)}
                />
              </label>
            ))}
          </div>
          <div className="mt-3 flex justify-between gap-1">
            <button
              type="button"
              className="button-secondary !px-2 !py-1.5 text-xs"
              onClick={() => {
                onChange(localInput(new Date()));
                setMonth(new Date());
              }}
            >
              {t("today")}
            </button>
            <button
              type="button"
              className="button-primary !px-3 !py-1.5 text-xs"
              onClick={() => setOpen(false)}
            >
              {t("done")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
