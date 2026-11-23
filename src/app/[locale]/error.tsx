"use client";

import { useTranslations } from "next-intl";

import { Eyebrow } from "~/app/_components/eyebrow";
import { Link } from "~/i18n/navigation";

/*
  Error de render en una página pública. Va sin cabecera ni pie a propósito:
  si lo que ha fallado es uno de ellos, volver a pintarlos fallaría otra vez.
*/
export default function LocaleError({ reset }: { reset: () => void }) {
  const t = useTranslations("common.error");

  return (
    <main className="flex min-h-screen items-center bg-[#fbfdff] dark:bg-[#06111f]">
      <div className="mx-auto w-full max-w-4xl px-5 py-20 sm:px-8">
        <Eyebrow>{t("eyebrow")}</Eyebrow>
        <h1 className="font-display text-navy mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl dark:text-slate-50">
          {t("title")}
        </h1>
        <p className="font-body mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400">
          {t("body")}
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="bg-primary-light font-body dark:bg-primary-dark dark:hover:bg-primary-dark/85 min-h-10 cursor-pointer rounded-full px-5 py-2 text-center text-sm font-semibold text-white shadow-md transition hover:bg-cyan-800 dark:text-[#04111e]"
          >
            {t("retry")}
          </button>
          <Link
            href="/"
            className="border-primary-light/25 font-body hover:border-primary-light/45 dark:border-primary-dark/30 dark:hover:border-primary-dark/50 dark:hover:bg-primary-dark/10 min-h-10 rounded-full border bg-white/65 px-5 py-2 text-center text-sm font-semibold text-cyan-800 backdrop-blur-sm transition hover:bg-cyan-50 dark:bg-white/3 dark:text-slate-100"
          >
            {t("home")}
          </Link>
        </div>
      </div>
    </main>
  );
}
