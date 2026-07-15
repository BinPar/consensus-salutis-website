import Image from "next/image";
import Link from "next/link";

import { navItems } from "~/app/_components/site-header";

export const contactItems = [
  { href: "/contacto", label: "Solicitar reunión" },
  {
    href: "mailto:info@binpar.com?subject=Consensus%20Salutis",
    label: "info@binpar.com",
  },
];

const legalItems = [{ href: "/privacidad", label: "Política de privacidad" }];

export function VerticalFooter() {
  return (
    <footer className="relative z-10 border-t border-cyan-800/10 bg-[#e8f2f7] text-slate-600 dark:border-cyan-300/10 dark:bg-[#030916] dark:text-slate-400">
      <div className="mx-auto w-full max-w-7xl px-5 pt-10 sm:px-8 lg:pt-12">
        <div className="grid gap-10 md:grid-cols-[1.25fr_0.75fr]">
          <div>
            <Link href="/" className="flex items-center gap-3" aria-label="Inicio">
              <Image
                src="/logos/consensus-brand/consensus-light.svg"
                alt=""
                width={618}
                height={88}
                className="h-7 w-auto dark:hidden sm:h-8"
              />
              <Image
                src="/logos/consensus-brand/consensus-dark.svg"
                alt=""
                width={618}
                height={88}
                className="hidden h-7 w-auto dark:block sm:h-8"
              />
            </Link>
            <p className="font-body mt-5 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              IA médica institucional para convertir conocimiento clínico en
              decisión trazable, gobernada y segura.
            </p>
          </div>

          <nav
            aria-label="Enlaces del pie"
            className="grid grid-cols-2 gap-8 text-sm"
          >
            <div className="space-y-1">
              <p className="font-display mb-2 font-semibold text-slate-900 dark:text-slate-100">
                Producto
              </p>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="font-body block text-slate-600 transition hover:text-cyan-800 dark:text-slate-400 dark:hover:text-cyan-100"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="space-y-1">
              <p className="font-display mb-2 font-semibold text-slate-900 dark:text-slate-100">
                Contacto
              </p>
              {contactItems.map((item) =>
                item.href.startsWith("mailto:") ? (
                  <a
                    key={item.href}
                    href={item.href}
                    className="font-body block text-slate-600 transition hover:text-cyan-800 dark:text-slate-400 dark:hover:text-cyan-100"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="font-body block text-slate-600 transition hover:text-cyan-800 dark:text-slate-400 dark:hover:text-cyan-100"
                  >
                    {item.label}
                  </Link>
                ),
              )}
              <div className="mt-3 space-y-1">
                <p className="font-display mb-2 font-semibold text-slate-900 dark:text-slate-100">
                  Legal
                </p>
                {legalItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="font-body block text-slate-600 transition hover:text-cyan-800 dark:text-slate-400 dark:hover:text-cyan-100"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-5 border-t border-cyan-800/10 py-5 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between dark:border-cyan-300/10 dark:text-slate-500">
          <div className="flex items-center gap-3">
            <Image
              src="/logos/BinparSquare.svg"
              alt="BinPar"
              width={112}
              height={54}
              className="h-7 w-auto opacity-70 brightness-75 contrast-125 grayscale dark:opacity-80 dark:brightness-0 dark:invert"
            />
            <span className="text-slate-600 dark:text-slate-400">
              Una iniciativa tecnológica de binpar para instituciones sanitarias
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-400">© Consensus Salutis all rights reserved</p>
        </div>
      </div>
    </footer>
  );
}
