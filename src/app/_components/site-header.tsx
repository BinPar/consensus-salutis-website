import Link from "next/link";
import Image from "next/image";

import { MobileNavigation } from "~/app/_components/mobile-navigation";
import { ScrollHeaderFrame } from "~/app/_components/scroll-header-frame";
import { ThemeToggle } from "~/app/_components/theme-toggle";
import { LanguageSelector } from "~/app/_components/language-selector";
import { SiteNavigation } from "~/app/_components/site-navigation";

export const navItems: Array<{
  href: string;
  label: string;
  disabled?: boolean;
}> = [
  { href: "/", label: "Inicio" },
  { href: "/plataforma", label: "Plataforma" },
  { href: "/equipo", label: "Equipo" },
  { href: "/blog", label: "Blog" },
  { href: "/contacto", label: "Contacto" },
];

export function SiteHeader({
  deferUntilCover = false,
}: {
  deferUntilCover?: boolean;
}) {
  return (
    <ScrollHeaderFrame deferUntilCover={deferUntilCover}>
      <div className="mx-auto grid h-16 w-full max-w-425 grid-cols-[1fr_auto] items-center md:grid-cols-[auto_minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <Link
          href="/"
          className="flex w-fit items-center gap-3"
          aria-label="Inicio"
        >
          <Image
            src="/logos/binpar-brand/binpar-logo-light.svg"
            alt=""
            width={430.04}
            height={131.79}
            priority
            className="h-6 w-auto sm:h-8 dark:hidden"
          />
          <Image
            src="/logos/binpar-brand/binpar-logo-dark.svg"
            alt=""
            width={430.04}
            height={131.79}
            priority
            className="hidden h-6 w-auto sm:h-8 dark:block"
          />
        </Link>
        <SiteNavigation items={navItems} />
        <div className="flex items-center gap-2 justify-self-end sm:gap-3 lg:gap-4">
          <LanguageSelector />
          <ThemeToggle />
          <Link
            href="/contacto"
            className="dark:bg-secondary-dark focus-visible:outline-secondary-dark font-body bg-secondary-light hidden rounded-full px-3 py-2 text-xs font-semibold text-[#06111f] transition-transform hover:scale-102 focus-visible:scale-102 focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transform-none md:block lg:text-sm"
          >
            Solicitar reunión
          </Link>
          <MobileNavigation items={navItems} />
        </div>
      </div>
      {/* <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,hsl(185.87deg_100%_28.04%),transparent)] opacity-45 dark:bg-[linear-gradient(90deg,transparent,var(--color-primary),transparent)]"
      /> */}
    </ScrollHeaderFrame>
  );
}
