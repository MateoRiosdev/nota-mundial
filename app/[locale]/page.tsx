'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CountrySelector } from '@/components/CountrySelector';
import { GradeCalculator } from '@/components/GradeCalculator';

export default function HomePage() {
  const t = useTranslations('hero');

  const [countryCode, setCountryCode] = useState<string | null>('PE');
  const [countryName, setCountryName] = useState<string | null>('Perú');

  function handleSelect(code: string, name: string) {
    setCountryCode(code);
    setCountryName(name);
  }

  return (
    <div className="space-y-6">

      {/* Título */}
      <section className="text-center">
        <h1 className="text-2xl font-bold sm:text-3xl">{t('title')}</h1>
      </section>

      {/* Calculadora */}
      <GradeCalculator countryCode={countryCode} countryName={countryName} />

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