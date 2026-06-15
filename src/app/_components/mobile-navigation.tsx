"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function MobileNavigation({
  items,
}: {
  items: Array<{ href: string; label: string }>;
}) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 768px)");
    const handleChange = () => {
      if (desktopQuery.matches) setOpen(false);
    };

    desktopQuery.addEventListener("change", handleChange);

    return () => desktopQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    window.requestAnimationFrame(() => firstLinkRef.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-label={open ? "Cerrar navegación" : "Abrir navegación"}
        aria-expanded={open}
        aria-controls="mobile-navigation-panel"
        onClick={() => setOpen((current) => !current)}
        className="border-primary-light/20 hover:border-primary-light/40 relative grid size-9 shrink-0 place-items-center rounded-full border bg-white/70 text-slate-700 shadow-sm transition hover:bg-cyan-50 hover:text-cyan-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 dark:border-cyan-300/20 dark:bg-cyan-300/8 dark:text-cyan-100 dark:shadow-none dark:hover:border-cyan-200/45 dark:hover:bg-cyan-300/15 dark:hover:text-white dark:focus-visible:outline-cyan-300"
      >
        <span className="relative block size-4" aria-hidden="true">
          <motion.span
            className="absolute top-1 left-0 h-px w-4 bg-current"
            animate={open ? { rotate: 45, y: 3.5 } : { rotate: 0, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.14 }}
          />
          <motion.span
            className="absolute top-2 left-0 h-px w-4 bg-current"
            animate={open ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: reducedMotion ? 0 : 0.1 }}
          />
          <motion.span
            className="absolute top-3 left-0 h-px w-4 bg-current"
            animate={open ? { rotate: -45, y: -4.5 } : { rotate: 0, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.14 }}
          />
        </span>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.nav
            id="mobile-navigation-panel"
            aria-label="Navegación móvil"
            className="fixed inset-x-0 top-16 z-50 flex h-[calc(100dvh-4rem)] flex-col border-t border-cyan-800/10 bg-[#f4f9fc] px-5 py-7 shadow-xl sm:px-8 dark:border-cyan-300/10 dark:bg-[#06111f]"
            initial={{
              x: reducedMotion ? 0 : "-100%",
              opacity: reducedMotion ? 1 : 0,
            }}
            animate={{ x: 0, opacity: 1 }}
            exit={{
              x: reducedMotion ? 0 : "-100%",
              opacity: reducedMotion ? 1 : 0,
            }}
            transition={{
              duration: reducedMotion ? 0 : 0.18,
              ease: "easeInOut",
            }}
          >
            <p className="text-primary-light text-base font-semibold tracking-[0.18em] uppercase dark:text-cyan-300">
              Navegación
            </p>
            <div className="mt-5 max-w-xl border-t border-cyan-800/12 dark:border-cyan-300/12">
              {items.map((item, index) => {
                const active = pathname === item.href;

                return (
                  <Link
                    ref={index === 0 ? firstLinkRef : undefined}
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative block border-b border-cyan-800/12 py-3 text-sm font-semibold transition dark:border-cyan-300/12 ${
                      active
                        ? "text-primary-light dark:text-cyan-200"
                        : "text-[#05215e] hover:text-cyan-800 dark:text-slate-100 dark:hover:text-cyan-100"
                    }`}
                  >
                    {item.label}
                    {active ? (
                      <span
                        aria-hidden="true"
                        className="bg-primary-light absolute bottom-0 left-0 h-px w-8 dark:bg-cyan-300"
                      />
                    ) : null}
                  </Link>
                );
              })}
            </div>
            <Link
              href="/contacto"
              className="dark:bg-secondary focus-visible:outline-secondary mt-auto inline-flex min-h-11 w-fit items-center rounded-full bg-amber-300 px-5 py-2.5 text-sm font-semibold text-[#06111f] transition-transform hover:scale-[1.01] focus-visible:scale-[1.01] focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transform-none"
            >
              Solicitar reunión
            </Link>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
