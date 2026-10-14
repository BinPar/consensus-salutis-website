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
import { ProductLab } from "./product-lab";
import { HomeLab } from "./home-lab";
import type { BlogPost } from "~/lib/blog";
import { VolumeLab } from "./volume-lab";
import { ContactLab } from "./contact-lab";
import { FooterLab } from "./footer-lab";
import { footerDirections, type FooterDirection } from "./footer-directions";
import { contactDirections, type ContactDirection } from "./contact-directions";
import { homeDirections, type HomeDirection } from "./home-directions";
import { productDirections, type ProductDirection } from "./product-directions";
import { volumeDirections, type VolumeDirection } from "./volume-directions";

const control =
  "font-body inline-flex min-h-9 items-center justify-center gap-2 rounded-full border border-cyan-800/15 px-3 text-xs font-medium text-slate-600 transition hover:border-primary-light/35 hover:bg-primary-light/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-light dark:border-cyan-300/15 dark:text-slate-300 dark:hover:border-primary-dark/35 dark:hover:bg-primary-dark/5 dark:focus-visible:outline-primary-dark";

type Lab = "cases" | "product" | "home" | "volume" | "contact" | "footer";

function scrollToPreview(lab: Lab, behavior: ScrollBehavior = "instant") {
  const section = document.getElementById(`${lab}-preview`);
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
  initialLab = "cases",
  initialProductDirection = "convergence",
  initialHomeDirection = "corpus",
  initialVolumeDirection = "editorial",
  initialContactDirection = "assistant",
  initialFooterDirection = "reference",
  blogPosts,
}: {
  initialDirection: CaseDirection;
  initialLab?: Lab;
  initialProductDirection?: ProductDirection;
  initialHomeDirection?: HomeDirection;
  initialVolumeDirection?: VolumeDirection;
  initialContactDirection?: ContactDirection;
  initialFooterDirection?: FooterDirection;
  blogPosts: BlogPost[];
}) {
  const [lab, setLab] = useState<Lab>(initialLab);
  const [direction, setDirection] = useState(initialDirection);
  const [productDirection, setProductDirection] = useState(
    initialProductDirection,
  );
  const [context, setContext] = useState(true);
  const [homeDirection, setHomeDirection] = useState(initialHomeDirection);
  const [volumeDirection, setVolumeDirection] = useState(
    initialVolumeDirection,
  );
  const [replay, setReplay] = useState(0);
  const [contactDirection, setContactDirection] = useState(
    initialContactDirection,
  );
  const [footerDirection, setFooterDirection] = useState(
    initialFooterDirection,
  );
  const root = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLElement>(null);
  const proposals = useRef<HTMLDivElement>(null);
  const current = caseDirections.find((item) => item.id === direction)!;
  const activeDirection = {
    cases: direction,
    product: productDirection,
    home: homeDirection,
    volume: volumeDirection,
    contact: contactDirection,
    footer: footerDirection,
  }[lab];
  const availableDirections = {
    cases: caseDirections,
    product: productDirections,
    home: homeDirections,
    volume: volumeDirections,
    contact: contactDirections,
    footer: footerDirections,
  }[lab];

  useEffect(() => {
    const container = proposals.current;
    const active = container?.querySelector<HTMLElement>("[aria-pressed=true]");
    if (!container || !active) return;
    container.scrollTo({
      left:
        active.offsetLeft - (container.clientWidth - active.offsetWidth) / 2,
      behavior: "instant",
    });
  }, [
    lab,
    direction,
    productDirection,
    homeDirection,
    volumeDirection,
    contactDirection,
    footerDirection,
  ]);

  useEffect(() => {
    if (window.location.hash !== `#${initialLab}-preview`) return;
    let cancelled = false;
    void document.fonts.ready.then(() => {
      window.requestAnimationFrame(() => {
        if (!cancelled) scrollToPreview(initialLab);
      });
    });
    return () => {
      cancelled = true;
    };
  }, [initialLab]);

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
      const params = new URL(window.location.href).searchParams;
      const variant = params.get("variant");
      const requestedLab = params.get("lab");
      setLab(
        requestedLab === "home"
          ? "home"
          : requestedLab === "product"
            ? "product"
            : requestedLab === "volume"
              ? "volume"
              : requestedLab === "contact"
                ? "contact"
                : requestedLab === "footer"
                  ? "footer"
                  : "cases",
      );
      setProductDirection(
        productDirections.find(
          (item) => item.id === params.get("productVariant"),
        )?.id ?? "convergence",
      );
      setHomeDirection(
        homeDirections.find((item) => item.id === params.get("homeVariant"))
          ?.id ?? "corpus",
      );
      setVolumeDirection(
        volumeDirections.find((item) => item.id === params.get("volumeVariant"))
          ?.id ?? "editorial",
      );
      setContactDirection(
        contactDirections.find(
          (item) => item.id === params.get("contactVariant"),
        )?.id ?? "assistant",
      );
      setFooterDirection(
        footerDirections.find((item) => item.id === params.get("footerVariant"))
          ?.id ?? "reference",
      );
      setDirection(
        caseDirections.find((item) => item.id === variant)?.id ??
          "trace-balanced",
      );
    };
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  const selectLab = (next: Lab) => {
    if (next === lab) return;
    setLab(next);
    const url = new URL(window.location.href);
    url.searchParams.set("variant", direction);
    if (next === "cases") url.searchParams.delete("lab");
    else url.searchParams.set("lab", next);
    url.searchParams.set("productVariant", productDirection);
    url.searchParams.set("homeVariant", homeDirection);
    url.searchParams.set("volumeVariant", volumeDirection);
    url.searchParams.set("contactVariant", contactDirection);
    url.searchParams.set("footerVariant", footerDirection);
    url.hash = `${next}-preview`;
    window.history.pushState(null, "", url);
    window.requestAnimationFrame(() => {
      scrollToPreview(next);
    });
  };

  const select = (next: CaseDirection) => {
    if (next === direction) return;
    setDirection(next);
    const url = new URL(window.location.href);
    url.searchParams.set("variant", next);
    url.hash = "cases-preview";
    window.history.pushState(null, "", url);
    window.requestAnimationFrame(() => scrollToPreview("cases"));
  };

  const selectProduct = (next: ProductDirection) => {
    if (next === productDirection) return;
    setProductDirection(next);
    const url = new URL(window.location.href);
    url.searchParams.set("productVariant", next);
    url.hash = "product-preview";
    window.history.pushState(null, "", url);
    window.requestAnimationFrame(() => scrollToPreview("product"));
  };

  const selectHome = (next: HomeDirection) => {
    if (next === homeDirection) return;
    setHomeDirection(next);
    const url = new URL(window.location.href);
    url.searchParams.set("homeVariant", next);
    url.hash = "home-preview";
    window.history.pushState(null, "", url);
    window.requestAnimationFrame(() => scrollToPreview("home"));
  };

  const selectVolume = (next: VolumeDirection) => {
    if (next === volumeDirection) return;
    setVolumeDirection(next);
    const url = new URL(window.location.href);
    url.searchParams.set("volumeVariant", next);
    url.hash = "volume-preview";
    window.history.pushState(null, "", url);
    window.requestAnimationFrame(() => scrollToPreview("volume"));
  };

  const selectContact = (next: ContactDirection) => {
    if (next === contactDirection) return;
    setContactDirection(next);
    const url = new URL(window.location.href);
    url.searchParams.set("contactVariant", next);
    url.hash = "contact-preview";
    window.history.pushState(null, "", url);
    window.requestAnimationFrame(() => scrollToPreview("contact"));
  };

  const selectFooter = (next: FooterDirection) => {
    if (next === footerDirection) return;
    setFooterDirection(next);
    const url = new URL(window.location.href);
    url.searchParams.set("footerVariant", next);
    url.hash = "footer-preview";
    window.history.pushState(null, "", url);
    window.requestAnimationFrame(() => scrollToPreview("footer"));
  };

  const selectProposal = (id: string) => {
    switch (lab) {
      case "cases":
        select(id as CaseDirection);
        break;
      case "product":
        selectProduct(id as ProductDirection);
        break;
      case "home":
        selectHome(id as HomeDirection);
        break;
      case "volume":
        selectVolume(id as VolumeDirection);
        break;
      case "contact":
        selectContact(id as ContactDirection);
        break;
      case "footer":
        selectFooter(id as FooterDirection);
        break;
    }
  };

  return (
    <div
      ref={root}
      className="relative isolate min-h-screen bg-[#fbfdff] dark:bg-[#06111f]"
    >
      {(lab !== "cases" || context) && <HomeMotionBackground />}
      <header
        ref={header}
        data-cases-lab-header=""
        className="sticky top-0 z-40 [scrollbar-width:none] overflow-x-auto border-b border-cyan-800/10 bg-[#fbfdff]/95 backdrop-blur-xl dark:border-cyan-300/10 dark:bg-[#06111f]/95 [&::-webkit-scrollbar]:hidden"
      >
        <div className="mx-auto flex max-w-[1440px] min-w-[520px] items-center gap-3 px-3 py-4 sm:gap-5 sm:px-10">
          <div className="flex shrink-0 items-center gap-3">
            <Link
              href="/"
              title="Volver a la home"
              aria-label="Volver a la home"
              className="focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark rounded-full focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              <Mark className="size-7" />
            </Link>
            <div className="hidden lg:block">
              <p className="font-display text-xs font-semibold text-[#05215e] dark:text-slate-100">
                Laboratorio visual
              </p>
              <p className="font-body mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                {lab === "cases"
                  ? "Casos · Composición"
                  : lab === "home"
                    ? "Home"
                    : lab === "volume"
                      ? "Volumen"
                      : lab === "contact"
                        ? "Contacto"
                        : lab === "footer"
                          ? "Footer"
                          : "Producto"}
              </p>
            </div>
          </div>
          <label className="flex shrink-0 items-center gap-2">
            <select
              aria-label="Elegir laboratorio"
              value={lab}
              onChange={(event) => selectLab(event.target.value as Lab)}
              className={`${control} bg-white pr-7 dark:bg-[#06111f]`}
            >
              <option value="cases">Casos</option>
              <option value="product">Producto</option>
              <option value="home">Home</option>
              <option value="volume">Volumen</option>
              <option value="contact">Contacto</option>
              <option value="footer">Footer</option>
            </select>
          </label>
          <div
            ref={proposals}
            className="relative flex min-w-0 flex-1 [scrollbar-width:none] gap-1.5 overflow-x-auto py-1 [&::-webkit-scrollbar]:hidden"
            role="group"
            aria-label="Elegir propuesta"
          >
            {availableDirections.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectProposal(item.id)}
                aria-pressed={activeDirection === item.id}
                className={`font-body focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark inline-flex min-h-9 shrink-0 items-center gap-2 rounded-full px-3 text-xs font-medium whitespace-nowrap transition focus-visible:outline-2 focus-visible:outline-offset-2 ${activeDirection === item.id ? "bg-primary-light dark:bg-primary-dark text-white dark:text-[#06111f]" : "bg-slate-100 text-slate-600 hover:bg-slate-200/75 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10"}`}
              >
                <span className="text-[10px] opacity-65">{item.number}</span>
                {item.label}
              </button>
            ))}
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() =>
                scrollToPreview(
                  lab,
                  window.matchMedia("(prefers-reduced-motion: reduce)").matches
                    ? "instant"
                    : "smooth",
                )
              }
              className={control}
              title="Ir a la propuesta"
              aria-label="Ir a la propuesta"
            >
              <ArrowDown size={14} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={() => {
                setContext(!context);
                window.requestAnimationFrame(() => scrollToPreview(lab));
              }}
              aria-pressed={context}
              className={control}
              title="Ver la propuesta en la secuencia de la home"
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

      {lab === "home" ? (
        <HomeLab
          direction={homeDirection}
          context={context}
          replay={replay}
          onExplore={() => setContext(true)}
        />
      ) : lab === "product" ? (
        <ProductLab
          direction={productDirection}
          context={context}
          replay={replay}
        />
      ) : lab === "volume" ? (
        <VolumeLab
          posts={blogPosts}
          direction={volumeDirection}
          context={context}
          replay={replay}
        />
      ) : lab === "footer" ? (
        <FooterLab
          context={context}
          replay={replay}
          direction={footerDirection}
          contactDirection={contactDirection}
        />
      ) : lab === "contact" ? (
        <ContactLab
          posts={blogPosts}
          context={context}
          replay={replay}
          direction={contactDirection}
        />
      ) : (
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
                Siete variantes de Trazado dentro de la secuencia hero → casos →
                proceso. Se mantiene la composición elegida y se exploran la
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
      )}
    </div>
  );
}
