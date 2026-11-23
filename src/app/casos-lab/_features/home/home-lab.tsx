"use client";

import { useRef } from "react";
import {
  FixedSignalLayer,
  HeroPanel,
  MobileHeroContent,
} from "~/app/_components/horizontal-home";
import { ProductSignalLeft } from "~/app/_components/product-signal-left";
import { SuccessCasesSection } from "~/app/_components/success-cases/success-cases-section";
import { ProcessBackground } from "~/app/_components/success-cases/success-cases-surfaces";
import { ClinicalProcessShowcase } from "~/app/_components/clinical-process-showcase";
import { ProductStrataSection } from "~/app/_components/product-strata/product-strata-section";
import { HomeProposal } from "./home-proposals";
import { HomeAura } from "./home-aura";
import type { HomeDirection } from "./home-directions";

export function HomeLab({
  direction,
  context,
  replay,
  onExplore,
}: {
  direction: HomeDirection;
  context: boolean;
  replay: number;
  onExplore: () => void;
}) {
  const aura = direction === "aura";
  const auraSignal =
    direction === "aura-signal" || direction === "aura-particles";
  const sharedBackground = aura || auraSignal;
  const auraPointer = useRef({ x: 0, y: 0 });
  return (
    <main
      id="home-preview"
      aria-label="Laboratorio de home"
      className="relative z-10 [scroll-margin-top:calc(var(--lab-toolbar-height,80px)+24px)]"
    >
      <div className={sharedBackground ? "home-aura-sequence" : undefined}>
        {sharedBackground && (
          <div className="home-aura-sequence-background" aria-hidden="true">
            {aura ? (
              <HomeAura running={false} pointer={auraPointer} stationary />
            ) : (
              <>
                <FixedSignalLayer />
                <ProductSignalLeft className="fixed -bottom-80 -left-200 w-250 rotate-20 sm:-left-155" />
              </>
            )}
          </div>
        )}
        <HomeProposal
          key={`${direction}-${replay}`}
          direction={direction}
          onExplore={onExplore}
        />
        <div className="relative [clip-path:inset(0)]">
          {!sharedBackground && <FixedSignalLayer />}
          {context && (
            <>
              <div
                id="home-introduction"
                className="home-introduction-frame relative [scroll-margin-top:var(--lab-toolbar-height,80px)]"
              >
                <div className="hidden lg:block">
                  <HeroPanel
                    visible
                    panelRef={() => undefined}
                    layout="vertical"
                    showSignal={!sharedBackground}
                    presentation={auraSignal ? "section" : "hero"}
                  />
                </div>
                <section className="relative overflow-hidden px-5 py-10 sm:px-10 sm:py-16 lg:hidden">
                  {!sharedBackground && (
                    <ProductSignalLeft className="fixed -bottom-80 -left-200 w-250 rotate-20 sm:-left-155" />
                  )}
                  <MobileHeroContent
                    presentation={auraSignal ? "section" : "hero"}
                  />
                </section>
              </div>
              <SuccessCasesSection />
              <section
                aria-label="Proceso de consulta"
                className="relative px-5 pt-8 pb-10 sm:px-10 sm:pt-12 sm:pb-16 lg:pt-14 lg:pb-20"
              >
                <ProcessBackground fadeToProduct />
                <div className="relative z-30 mx-auto w-full max-w-7xl">
                  <ClinicalProcessShowcase />
                </div>
              </section>
            </>
          )}
        </div>
      </div>
      {context && <ProductStrataSection layout="mobile" />}
    </main>
  );
}
