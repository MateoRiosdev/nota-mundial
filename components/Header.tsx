import Image from "next/image";
import logo from "@/public/logo.png";
import { useTranslations } from "next-intl";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSelector } from "./LanguageSelector";

export function Header() {
  const t = useTranslations("header");

  return (
    <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
        {/* Logo + nombre */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Image
            src={logo}
            alt=""
            width={44}
            height={44}
            priority
            className="h-11 w-11 shrink-0 rounded-full object-cover"
          />
          <div>
            <p className="text-base sm:text-lg font-bold text-brand-600 dark:text-blue-400 leading-tight">
              {t("appName")}
            </p>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 leading-tight">
              {t("tagline")}
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
