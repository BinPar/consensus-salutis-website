"use client";

import { ClinicalProcessShowcase } from "~/app/_components/clinical-process-showcase";
import { FixedSignalLayer } from "~/app/_components/horizontal-home";
import { ProductSignalLeft } from "~/app/_components/product-signal-left";
import { SuccessCasesSection } from "~/app/_components/success-cases/success-cases-section";
import { ProcessBackground } from "~/app/_components/success-cases/success-cases-surfaces";
import { ProductProposal } from "./product-proposals";
import type { ProductDirection } from "./product-directions";

export function ProductLab({
  direction,
  context,
  replay,
}: {
  direction: ProductDirection;
  context: boolean;
  replay: number;
}) {
  return (
    <main
      aria-label="Laboratorio de producto"
      className="relative z-10 [clip-path:inset(0)]"
    >
      <FixedSignalLayer />
      <ProductSignalLeft className="fixed -bottom-80 -left-200 w-250 rotate-20 sm:-left-155 lg:hidden" />
      {context && (
        <>
          <SuccessCasesSection />
          <section
            aria-label="Proceso de consulta"
            className="relative px-5 pt-8 pb-10 sm:px-10 sm:pt-12 sm:pb-16 lg:pt-14 lg:pb-20"
          >
            <ProcessBackground />
            <div className="relative z-10 mx-auto w-full max-w-7xl">
              <ClinicalProcessShowcase />
            </div>
          </section>
        </>
      )}
      <ProductProposal key={`${direction}-${replay}`} direction={direction} />
    </main>
  );
}
