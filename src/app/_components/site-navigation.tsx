"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function isNavigationItemActive(pathname: string | null, href: string) {
  return (
    pathname === href ||
    (href !== "/" && Boolean(pathname?.startsWith(`${href}/`)))
  );
}

export function SiteNavigation({
  items,
}: {
  items: readonly { href: string; label: string; disabled?: boolean }[];
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación principal"
      className="hidden items-center gap-2 text-xs font-medium text-slate-600 md:flex md:justify-self-center lg:gap-7 lg:text-sm dark:text-slate-400"
    >
      {items.map((item) => {
        if (item.disabled)
          return (
            <span
              key={item.href}
              role="link"
              aria-disabled="true"
              className="font-body cursor-not-allowed font-medium opacity-45"
            >
              {item.label}
            </span>
          );
        const active = isNavigationItemActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={
              active
                ? pathname === item.href
                  ? "page"
                  : "location"
                : undefined
            }
            className={`font-body focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark relative rounded-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 ${active ? "text-primary-light dark:text-primary-dark font-semibold" : "font-medium hover:text-cyan-800 dark:hover:text-primary-dark"}`}
          >
            {item.label}
            {active && (
              <span
                aria-hidden="true"
                className="bg-primary-light dark:bg-primary-dark absolute -bottom-2 left-0 h-0.5 w-5 rounded-full"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
