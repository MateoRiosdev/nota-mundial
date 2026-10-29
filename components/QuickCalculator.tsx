"use client";
import { useLocale, useTranslations } from "next-intl";
import { CountrySelector } from "@/components/CountrySelector";
import { GradeCalculator } from "@/components/GradeCalculator";
import { getCountryName } from "@/lib/countries";
export function QuickCalculator({
  countryCode,
  onSelect,
}: {
  countryCode: string | null;
  onSelect: (code: string) => void;
}) {
  const t = useTranslations("hero"),
    locale = useLocale();
  const countryName = countryCode ? getCountryName(countryCode, locale) : null;
  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {t("subtitle")}
      </p>
      <CountrySelector selected={countryCode} onSelect={onSelect} />
      <GradeCalculator
        key={countryCode}
        countryCode={countryCode}
        countryName={countryName}
      />
    </div>
  );
}
