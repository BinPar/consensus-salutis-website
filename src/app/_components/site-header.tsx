import Link from "next/link";
import Image from "next/image";

import { MobileNavigation } from "~/app/_components/mobile-navigation";
import { ScrollHeaderFrame } from "~/app/_components/scroll-header-frame";
import { ThemeToggle } from "~/app/_components/theme-toggle";

export const navItems = [
  { href: "/plataforma", label: "Plataforma" },
  { href: "/evidencia", label: "Evidencia" },
  { href: "/seguridad", label: "Seguridad" },
  { href: "/casos", label: "Casos" },
  { href: "/blog", label: "Blog" },
];

export function SiteHeader() {
  return (
    <ScrollHeaderFrame>
      <div className="mx-auto flex h-16 w-full max-w-425 items-center justify-between">
        <Link href="/" className="flex items-center gap-3" aria-label="Inicio">
          <Image
            src="/logos/consensus-brand/consensus-light.svg"
            alt=""
            width={618}
            height={88}
            priority
            className="h-6 w-auto dark:hidden sm:h-8"
          />
          <Image
            src="/logos/consensus-brand/consensus-dark.svg"
            alt=""
            width={618}
            height={88}
            priority
            className="hidden h-6 w-auto dark:block sm:h-8"
          />
        </Link>
        <div className="flex gap-4 lg:gap-6">
          <nav className="hidden items-center gap-2 text-xs font-medium text-slate-600 md:flex lg:gap-7 lg:text-sm dark:text-slate-400">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-body font-medium transition hover:text-cyan-800 dark:hover:text-cyan-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4 lg:gap-6">
            <ThemeToggle />
            <Link
              href="/contacto"
              className="dark:bg-secondary focus-visible:outline-secondary font-body hidden rounded-full bg-amber-300 px-3 py-2 text-xs font-semibold text-[#06111f] transition-transform hover:scale-102 focus-visible:scale-102 focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transform-none md:block lg:text-sm"
            >
              Solicitar reunión
            </Link>
            <MobileNavigation
              items={[{ href: "/", label: "Inicio" }, ...navItems]}
            />
          </div>
        </div>
      </div>
      {/* <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,hsl(185.87deg_100%_28.04%),transparent)] opacity-45 dark:bg-[linear-gradient(90deg,transparent,var(--color-primary),transparent)]"
      /> */}
    </ScrollHeaderFrame>
  );
}
