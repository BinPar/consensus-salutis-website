"use client";

import { motion, useMotionValue } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";
import { useProductEntrance } from "~/app/_components/product-strata/product-strata-section";
import { galleryMembers } from "./team-data";
import { TeamPortrait } from "./team-portrait";
import { teamContentWidth } from "./team-layout";

function Reveal({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  const { ref, painted, reduced } = useProductEntrance();
  return (
    <motion.div
      ref={(node) => {
        ref.current = node;
      }}
      data-team-painted={painted}
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: painted ? 1 : 0 }}
      transition={{
        duration: reduced ? 0 : 0.42,
        delay: painted && !reduced ? delay : 0,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
}

export function TeamGallery() {
  const directoryRef = useRef<HTMLDivElement>(null);
  const asideRef = useRef<HTMLDivElement>(null);
  const backgroundOpacity = useMotionValue(0);

  useEffect(() => {
    const directory = directoryRef.current;
    const aside = asideRef.current;
    if (!directory || !aside) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = directory.getBoundingClientRect();
      const stickyTop = parseFloat(getComputedStyle(aside).top) || 0;
      const travel = Math.max(1, rect.height - aside.offsetHeight);
      const progress = Math.max(
        0,
        Math.min(1, (stickyTop - rect.top) / travel),
      );
      backgroundOpacity.set(
        preference.matches ? 0 : progress * progress * (3 - 2 * progress),
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const resize = new ResizeObserver(schedule);
    resize.observe(directory);
    resize.observe(aside);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    preference.addEventListener("change", schedule);
    update();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      preference.removeEventListener("change", schedule);
    };
  }, [backgroundOpacity]);

  return (
    <section
      id="equipo-galeria"
      tabIndex={-1}
      aria-labelledby="equipo-galeria-title"
      data-team-gallery=""
      className="relative isolate scroll-mt-[88px] pt-[45px] pb-24 focus:outline-none [@media(width<=639px)]:pb-16"
    >
      <motion.div
        aria-hidden="true"
        data-team-gallery-background=""
        style={{ opacity: backgroundOpacity }}
        className="pointer-events-none absolute inset-0 -z-1 bg-[#deedf3] dark:bg-[#030916]"
      />
      <div
        ref={directoryRef}
        data-team-directory=""
        className={`${teamContentWidth} grid grid-cols-[320px_minmax(0,1fr)] items-start gap-16 [@media(768px<=width<=1100px)]:grid-cols-[260px_minmax(0,1fr)] [@media(768px<=width<=1100px)]:gap-8 [@media(width<=767px)]:grid-cols-1 [@media(width<=767px)]:gap-10`}
      >
        <div
          ref={asideRef}
          data-team-gallery-aside=""
          className="sticky top-[104px] max-md:text-center [@media(width<=767px)]:static"
        >
          <Reveal>
            <h2
              id="equipo-galeria-title"
              className="font-display m-0 text-4xl leading-tight font-extrabold tracking-tight text-balance text-(--team-ink) xl:text-5xl"
            >
              Las personas
              <br />
              <span className="text-(--team-accent)">detrás de BinPar.</span>
            </h2>
            <p className="mt-6 text-lg leading-8 text-pretty text-slate-600 dark:text-slate-400 [@media(width<=639px)]:text-base [@media(width<=639px)]:leading-7">
              Cada persona aporta una forma de pensar, de crear y de resolver.
              Conoce al equipo que da forma a BinPar cada día.
            </p>
          </Reveal>
        </div>
        <ul
          aria-label="Miembros del equipo"
          className="m-0 grid list-none grid-cols-3 gap-1 p-0 [@media(width<=1100px)]:grid-cols-2"
        >
          {galleryMembers.map((person, index) => (
            <li key={person.slug}>
              <Reveal delay={(index % 3) * 0.08}>
                <figure
                  tabIndex={0}
                  data-team-member={person.slug}
                  className="relative m-0 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--team-accent)"
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-(--team-panel)">
                    <div className="absolute inset-y-0 -left-[12.5%] w-[125%]">
                      <TeamPortrait person={person} />
                    </div>
                  </div>
                  <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 z-1 flex items-baseline justify-between gap-3 rounded-b-lg bg-[linear-gradient(transparent,rgb(3_17_29/42%))] px-3.5 pt-9 pb-3 [text-shadow:0_1px_3px_rgb(3_17_29/25%)] [@media(width<=767px)]:gap-1.5 [@media(width<=767px)]:px-2.5 [@media(width<=767px)]:pt-7 [@media(width<=767px)]:pb-2.5">
                    <h3 className="font-body m-0 min-w-0 truncate text-[clamp(11px,0.85vw,13px)] leading-5 font-medium text-[rgb(255_255_255/90%)]">
                      {person.name}
                    </h3>
                    <p className="m-0 shrink-0 text-right text-[clamp(10px,0.75vw,12px)] leading-5 whitespace-nowrap text-[rgb(255_255_255/75%)]">
                      {person.role}
                    </p>
                  </figcaption>
                </figure>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
