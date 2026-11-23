"use client";

import { HomePaintPanel } from "~/app/_components/home-paint-panel";
import { SignalField, Reveal } from "~/app/_components/motion-system";
import { ProductSignalLeft } from "~/app/_components/product-signal-left";
import { surfaceMask } from "~/app/_components/success-cases/success-cases-surfaces";
import { LabPlatformClaudePreview } from "./preview/platform-claude-preview";
import "./platform-claude-lab.css";
import type { PlatformClaudeDirection } from "./platform-claude-directions";
import { PlatformFeatures } from "./features/feature-sections";

const sectionFadeOut = surfaceMask("clamp(160px, 22vw, 360px)").replace(
  "to bottom",
  "to top",
);

export function PlatformClaudeLab({
  direction = "reference",
}: {
  direction?: PlatformClaudeDirection;
}) {
  return (
    <main
      aria-label="Laboratorio de plataforma Claude"
      data-platform-claude-lab={direction}
      className="visual-lab-platform-claude-layout relative z-10"
    >
      <HomePaintPanel>
        {(painted, panelRef) => (
          <section
            id="platform-claude-preview"
            tabIndex={-1}
            data-section-anchor
            ref={panelRef}
            data-platform-claude-painted={painted}
            className="section-navigation-inset relative z-10 overflow-hidden px-5 pt-36 pb-16 [clip-path:inset(0)] sm:px-8 sm:pt-44 sm:pb-20 lg:px-10"
          >
            <div
              aria-hidden="true"
              data-platform-claude-intro-background=""
              className="pointer-events-none absolute inset-0 z-0"
              style={{
                maskImage: sectionFadeOut,
              }}
            >
              <div
                className="fixed inset-0 -right-50 z-0"
                data-platform-claude-wave="right"
              >
                <SignalField
                  className="-top-48 h-[calc(100%+12rem)]"
                  intensity="hero"
                  opacity={0.72}
                />
              </div>
              <div data-platform-claude-wave="left">
                <ProductSignalLeft className="fixed -bottom-80 -left-200 w-250 rotate-20 sm:-left-155" />
              </div>
            </div>
            <div className="relative z-10 mx-auto w-full max-w-7xl">
              <div className="relative mx-auto mb-16 max-w-3xl text-center lg:mb-24">
                <Reveal visible={painted}>
                  <p className="font-display text-primary-light dark:text-primary-dark mb-6 text-xs leading-4 font-bold tracking-[0.22em] text-balance uppercase">
                    Nuestra plataforma
                  </p>
                  <h1 className="font-display text-navy text-[32px] leading-[1.08] font-extrabold tracking-tight sm:text-[40px] lg:text-[54px] dark:text-slate-50">
                    De la consulta clínica
                    <br />
                    <span className="text-primary-light dark:text-primary-dark">
                      a la evidencia.
                    </span>
                  </h1>
                </Reveal>
                <Reveal visible={painted} delay={0.1}>
                  <p className="font-body mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600 lg:mt-6 dark:text-slate-400">
                    Explora la interfaz, los paneles y tu área de usuario con
                    una consulta de ejemplo. Descubre cómo se presenta la
                    respuesta y revisa las fuentes que la respaldan para
                    profundizar en el contexto clínico.
                  </p>
                </Reveal>
              </div>
              <Reveal
                visible={painted}
                delay={0.2}
                className="mx-auto w-full lg:w-[90%]"
              >
                <LabPlatformClaudePreview />
              </Reveal>
            </div>
          </section>
        )}
      </HomePaintPanel>
      {direction !== "reference" && (
        <PlatformFeatures key={direction} layout={direction} />
      )}
    </main>
  );
}
