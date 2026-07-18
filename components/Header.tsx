import { useTranslations } from 'next-intl';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSelector } from './LanguageSelector';

// Logo SVG inline — globo azul + medalla dorada
function Logo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      className="h-9 w-9 flex-shrink-0"
      aria-hidden="true"
    >
      {/* Fondo circular azul */}
      <circle cx="32" cy="32" r="32" fill="#2563eb" />

      {/* Globo terráqueo */}
      <circle cx="26" cy="34" r="16" fill="none" stroke="#93c5fd" strokeWidth="2" />
      <ellipse cx="26" cy="34" rx="7" ry="16" fill="none" stroke="#93c5fd" strokeWidth="1.5" />
      <line x1="10" y1="34" x2="42" y2="34" stroke="#93c5fd" strokeWidth="1.5" />
      <path d="M12 27 Q26 24 40 27" fill="none" stroke="#93c5fd" strokeWidth="1.2" />
      <path d="M12 41 Q26 44 40 41" fill="none" stroke="#93c5fd" strokeWidth="1.2" />

      {/* Medalla dorada */}
      <circle cx="48" cy="18" r="10" fill="#f59e0b" />
      <text
        x="48"
        y="22"
        textAnchor="middle"
        fontSize="13"
        fontWeight="bold"
        fill="white"
        fontFamily="Arial, sans-serif"
      >
        ★
      </text>
      <line x1="45" y1="27" x2="43" y2="34" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="51" y1="27" x2="53" y2="34" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function Header() {
  const t = useTranslations('header');

  return (
    <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3">

        {/* Logo + nombre */}
        <div className="flex items-center gap-3">
          <Logo />
          <div>
            <p className="text-lg font-bold text-brand-600 leading-tight">
              {t('appName')}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
              {t('tagline')}
            </p>
          </div>
        </div>

        {/* Controles */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSelector />
        </div>

      </div>
    </header>
  );
}