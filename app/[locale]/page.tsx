'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { CountrySelector } from '@/components/CountrySelector';
import { GradeCalculator } from '@/components/GradeCalculator';
import { getCountryName } from '@/lib/countries';

export default function HomePage() {
  const t = useTranslations('hero');

  const locale = useLocale();
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const manualSelection = useRef(false);
  const countryName = countryCode ? getCountryName(countryCode, locale) : null;

  useEffect(() => {
    const controller = new AbortController();
    const saved = localStorage.getItem('selectedCountry');
    if (saved && /^[A-Z]{2}$/.test(saved)) {
      setCountryCode(saved);
      return;
    }
    fetch('/api/location', { signal: controller.signal })
      .then(response => response.ok ? response.json() : null)
      .then(data => {
        if (!manualSelection.current && data?.country) setCountryCode(data.country);
      })
      .catch(() => { /* Without geolocation, let the visitor select a country. */ });
    return () => controller.abort();
  }, []);

  function handleSelect(code: string) {
    setCountryCode(code);
    manualSelection.current = true;
    localStorage.setItem('selectedCountry', code);
  }

  return (
    <div className="space-y-6">

      {/* Título */}
      <section className="text-center">
        <h1 className="text-2xl font-bold sm:text-3xl">{t('title')}</h1>
      </section>

      {/* Calculadora */}
      <GradeCalculator key={countryCode} countryCode={countryCode} countryName={countryName} />

      {/* Subtítulo encima del selector */}
      <p className="text-sm text-slate-600 dark:text-slate-300 text-center px-2 font-medium">
        {t('subtitle')}
      </p>

      {/* Selector de país */}
      <CountrySelector
        selected={countryCode}
        onSelect={handleSelect}
      />

    </div>
  );
}