"use client";

import Link from "next/link";
import { ArrowDown, ArrowLeft, Check, Layers2, RotateCcw } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ThemeToggle } from "~/app/_components/theme-toggle";
import { Mark } from "~/app/_components/clinical-process-visuals";
import { ClinicalProcessShowcase } from "~/app/_components/clinical-process-showcase";
import { HomeMotionBackground } from "~/app/_components/motion-system";
import {
  FixedSignalLayer,
  HeroPanel,
  MobileHeroContent,
} from "~/app/_components/horizontal-home";
import { ProductSignalLeft } from "~/app/_components/product-signal-left";
import {
  CasesBackground,
  ProcessBackground,
} from "~/app/_components/success-cases/success-cases-surfaces";
import { SuccessCasesProposal } from "./success-cases-proposals";
import { caseDirections, type CaseDirection } from "./case-directions";

const control =
  "font-body inline-flex min-h-9 items-center justify-center gap-2 rounded-full border border-cyan-800/15 px-3 text-xs font-medium text-slate-600 transition hover:border-primary-light/35 hover:bg-primary-light/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-light dark:border-cyan-300/15 dark:text-slate-300 dark:hover:border-primary-dark/35 dark:hover:bg-primary-dark/5 dark:focus-visible:outline-primary-dark";

function scrollToCases(behavior: ScrollBehavior = "instant") {
  const section = document.getElementById("cases-preview");
  const toolbar = document.querySelector("[data-cases-lab-header]");
  if (!section || !toolbar) return;
  window.scrollTo({
    top:
      window.scrollY +
      section.getBoundingClientRect().top -
      toolbar.getBoundingClientRect().height -
      24,
    behavior,
  });
}

export function SuccessCasesLab({
  initialDirection,
}: {
  initialDirection: CaseDirection;
}) {
  const [direction, setDirection] = useState(initialDirection);
  const [context, setContext] = useState(true);
  const [replay, setReplay] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLElement>(null);
  const current = caseDirections.find((item) => item.id === direction)!;

  useEffect(() => {
    if (window.location.hash !== "#cases-preview") return;
    let cancelled = false;
    void document.fonts.ready.then(() => {
      window.requestAnimationFrame(() => {
        if (!cancelled) scrollToCases();
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useLayoutEffect(() => {
    const element = header.current;
    if (!element) return;
    const measure = () =>
      root.current?.style.setProperty(
        "--lab-toolbar-height",
        `${element.getBoundingClientRect().height}px`,
      );
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const sync = () => {
      const variant = new URL(window.location.href).searchParams.get("variant");
      setDirection(
        caseDirections.find((item) => item.id === variant)?.id ??
          "trace-balanced",
      );
    };
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  const select = (next: CaseDirection) => {
    if (next === direction) return;
    setDirection(next);
    const url = new URL(window.location.href);
    url.searchParams.set("variant", next);
    url.hash = "cases-preview";
    window.history.pushState(null, "", url);
    window.requestAnimationFrame(() => scrollToCases());
  };

  return (
    <div
      ref={root}
      className="relative isolate min-h-screen bg-[#fbfdff] dark:bg-[#06111f]"
    >
      {context && <HomeMotionBackground />}
      <header
        ref={header}
        data-cases-lab-header=""
        className="sticky top-0 z-40 border-b border-cyan-800/10 bg-[#fbfdff]/95 backdrop-blur-xl dark:border-cyan-300/10 dark:bg-[#06111f]/95"
      >
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-x-6 gap-y-4 px-5 py-4 sm:px-10">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              title="Volver a la home"
              aria-label="Volver a la home"
              className="focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark rounded-full focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              <Mark className="size-7" />
            </Link>
            <div>
              <p className="font-display text-xs font-semibold text-[#05215e] dark:text-slate-100">
                Casos de éxito
              </p>
              <p className="font-body mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                Trazado · Laboratorio de composición
              </p>
            </div>
          </div>
          <div
            className="order-3 flex w-full flex-wrap gap-1.5 sm:order-2 sm:w-auto"
            role="group"
            aria-label="Elegir propuesta"
          >
            {caseDirections.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => select(item.id)}
                aria-pressed={direction === item.id}
                className={`font-body focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark inline-flex min-h-9 items-center gap-2 rounded-full px-3 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 ${direction === item.id ? "bg-primary-light dark:bg-primary-dark text-white dark:text-[#06111f]" : "bg-slate-100 text-slate-600 hover:bg-slate-200/75 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10"}`}
              >
                <span className="text-[10px] opacity-65">{item.number}</span>
                {item.label}
              </button>
            ))}
          </div>
          <div className="order-2 flex items-center gap-2 sm:order-3">
            <button
              type="button"
              onClick={() =>
                scrollToCases(
                  window.matchMedia("(prefers-reduced-motion: reduce)").matches
                    ? "instant"
                    : "smooth",
                )
              }
              className={control}
              title="Ir a la sección de casos"
              aria-label="Ir a la sección de casos"
            >
              <ArrowDown size={14} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={() => {
                setContext(!context);
                window.requestAnimationFrame(() => scrollToCases());
              }}
              aria-pressed={context}
              className={control}
              title="Ver hero, casos y proceso en la secuencia real de la home"
            >
              {context ? (
                <Check size={14} strokeWidth={1.5} />
              ) : (
                <Layers2 size={14} strokeWidth={1.5} />
              )}
              <span className="hidden lg:inline">Contexto</span>
              <span className="sr-only lg:hidden">Vista de contexto</span>
            </button>
            <button
              type="button"
              onClick={() => setReplay((value) => value + 1)}
              className={control}
              title="Repetir entrada"
              aria-label="Repetir animación de entrada"
            >
              <RotateCcw size={14} strokeWidth={1.5} />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {!context && (
          <div className="mx-auto flex max-w-[1440px] items-start justify-between gap-6 px-5 pt-7 sm:px-10">
            <div className="max-w-2xl">
              <p className="font-display text-primary-light dark:text-primary-dark text-[10px] font-bold tracking-[0.18em] uppercase">
                {current.id === "territorial-trace"
                  ? "Referencia"
                  : `Dirección ${current.number}`}{" "}
                · {current.label}
              </p>
              <p className="font-body mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                {current.description}
              </p>
            </div>
            <span className="font-body hidden shrink-0 rounded-full border border-cyan-800/10 px-3 py-1.5 text-[10px] text-slate-400 sm:block dark:border-cyan-300/10">
              Home sin modificar
            </span>
          </div>
        )}

        <div className="relative [clip-path:inset(0)]">
          {context && (
            <>
              <FixedSignalLayer />
              <div className="hidden lg:block">
                <HeroPanel
                  visible={true}
                  panelRef={() => undefined}
                  layout="vertical"
                />
              </div>
              <section className="relative overflow-hidden border-b border-cyan-800/10 px-5 py-10 sm:px-10 sm:py-16 lg:hidden dark:border-cyan-300/10">
                <ProductSignalLeft className="fixed -bottom-80 -left-200 w-250 rotate-20 sm:-left-155" />
                <MobileHeroContent />
              </section>
            </>
          )}

          <div
            id="cases-preview"
            className={`relative [scroll-margin-top:calc(var(--lab-toolbar-height,80px)+24px)] overflow-hidden px-5 pb-20 sm:px-10 ${direction === "trace-definitive-2" ? "pt-28 sm:pt-32" : "bg-white pt-20 dark:bg-transparent dark:bg-linear-to-br dark:from-[#030916]/80 dark:to-[#030916]/40"}`}
          >
            {direction === "trace-definitive-2" && <CasesBackground />}
            <SuccessCasesProposal
              key={`${direction}-${replay}`}
              direction={direction}
            />
          </div>

          {context && (
            <section
              aria-label="Contexto: sección del proceso de consulta"
              className={`relative px-5 py-10 sm:px-10 sm:py-16 lg:py-20 ${direction === "trace-definitive-2" ? "" : "bg-linear-to-br from-[#deedf3]/90 to-[#edf6f9]/30 dark:from-[#030916]/70 dark:to-[#030916]/30"}`}
            >
              {direction === "trace-definitive-2" && <ProcessBackground />}
              <div className="relative z-10 mx-auto w-full max-w-7xl">
                <ClinicalProcessShowcase />
              </div>
            </section>
          )}
        </div>

        <footer className="relative border-t border-cyan-800/10 bg-[#f4f9fc]/80 dark:border-cyan-300/10 dark:bg-[#081827]/70">
          <div className="mx-auto grid w-full max-w-7xl gap-5 px-5 py-7 sm:px-10 md:grid-cols-[1fr_auto] md:items-center">
            <p className="font-body max-w-3xl text-xs leading-6 text-slate-500 dark:text-slate-400">
              Cinco refinamientos de Trazado dentro de la secuencia hero → casos
              → proceso. Se mantiene la composición elegida y se exploran la
              precisión del mapa, las llamadas de marca y la lectura de las
              instituciones. La referencia conserva el diseño anterior con los
              contornos corregidos.
            </p>
            <Link href="/" className={`${control} justify-self-start`}>
              <ArrowLeft size={14} strokeWidth={1.5} />
              Volver a la home
            </Link>
            <p className="font-body text-[10px] leading-5 text-slate-400 md:col-span-2">
              Cartografía: Instituto Geográfico Nacional ·{" "}
              <a
                href="https://www.geoboundaries.org/api/current/gbOpen/ESP/ADM1/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-primary-light dark:hover:text-primary-dark underline decoration-slate-300 underline-offset-2 dark:decoration-slate-600"
              >
                geoBoundaries, España ADM1 (2017)
              </a>{" "}
              · CC BY 4.0. Geometría simplificada.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
