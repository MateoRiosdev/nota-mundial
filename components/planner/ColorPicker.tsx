"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { hexToHSV, hsvToHex } from "@/lib/color";
export function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const t = useTranslations("planner");
  const [open, setOpen] = useState(false),
    [hex, setHex] = useState(value);
  const [hsv, setHSV] = useState(() => hexToHSV(value));
  useEffect(() => {
    setHex(value);
    setHSV(hexToHSV(value));
  }, [value]);
  function update(h: number, s: number, v: number) {
    setHSV({ h, s, v });
    const next = hsvToHex(h, s, v);
    setHex(next);
    onChange(next);
  }
  return (
    <div className="w-full">
      <button
        type="button"
        className="button-secondary !py-2 text-xs"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span
          className="h-4 w-4 rounded-full border border-black/10"
          style={{ background: value }}
        />
        {t("customColor")}
      </button>
      {open && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-900/50">
          <div
            className="relative h-32 touch-none cursor-crosshair overflow-hidden rounded-lg"
            aria-hidden="true"
            style={{
              background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent), hsl(${hsv.h} 100% 50%)`,
            }}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              const r = e.currentTarget.getBoundingClientRect();
              update(
                hsv.h,
                Math.max(
                  0,
                  Math.min(100, ((e.clientX - r.left) / r.width) * 100),
                ),
                Math.max(
                  0,
                  Math.min(100, 100 - ((e.clientY - r.top) / r.height) * 100),
                ),
              );
            }}
            onPointerMove={(e) => {
              if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
              const r = e.currentTarget.getBoundingClientRect();
              update(
                hsv.h,
                Math.max(
                  0,
                  Math.min(100, ((e.clientX - r.left) / r.width) * 100),
                ),
                Math.max(
                  0,
                  Math.min(100, 100 - ((e.clientY - r.top) / r.height) * 100),
                ),
              );
            }}
          >
            <span
              className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
              style={{ left: `${hsv.s}%`, top: `${100 - hsv.v}%` }}
            />
          </div>
          <div className="mt-3 space-y-2">
            {(["h", "s", "v"] as const).map((key, i) => (
              <label
                key={key}
                className="flex items-center gap-3 text-xs font-medium"
              >
                <span className="w-20">
                  {t(["hue", "saturation", "brightness"][i])}
                </span>
                <input
                  type="range"
                  min={0}
                  max={i === 0 ? 359 : 100}
                  value={hsv[key]}
                  className={`min-w-0 flex-1 accent-blue-600 ${i === 0 ? "hue-slider" : ""}`}
                  onChange={(e) =>
                    update(
                      key === "h" ? Number(e.target.value) : hsv.h,
                      key === "s" ? Number(e.target.value) : hsv.s,
                      key === "v" ? Number(e.target.value) : hsv.v,
                    )
                  }
                />
              </label>
            ))}
          </div>
          <label className="mt-3 flex items-center gap-3 text-xs font-bold">
            HEX
            <input
              className="field !mt-0 !py-2 font-mono uppercase"
              value={hex}
              maxLength={7}
              aria-invalid={!/^#[\da-f]{6}$/i.test(hex)}
              onChange={(e) => {
                setHex(e.target.value);
                if (/^#[\da-f]{6}$/i.test(e.target.value))
                  onChange(e.target.value.toUpperCase());
              }}
              onBlur={() => setHex(value)}
            />
            <span
              className="h-9 w-9 shrink-0 rounded-lg border border-slate-200"
              style={{ background: value }}
            />
          </label>
        </div>
      )}
    </div>
  );
}
