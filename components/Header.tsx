import { useTranslations } from 'next-intl';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSelector } from './LanguageSelector';

export function Header() {
  const t = useTranslations('header');
  return (
    <header className="border-b border-slate-200 dark:border-slate-700">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <div>
          <p className="text-lg font-bold text-brand-600">{t('appName')}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t('tagline')}</p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSelector />
        </div>
      </div>
    </header>
  );
}
