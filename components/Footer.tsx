import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('footer');
  const year = new Date().getFullYear();
  return (
    <footer className="mt-10 border-t border-slate-200 dark:border-slate-700 py-6">
      <div className="mx-auto max-w-4xl px-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>
          © {year}{' '}
          <a
            href="https://www.linkedin.com/in/mateojuliogomerorios/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand-600 hover:underline"
          >
            {t('author')}
          </a>
          . {t('rights')}
        </p>
      </div>
    </footer>
  );
}
