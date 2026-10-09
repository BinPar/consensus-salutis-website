"use client";
import type { CaseDirection } from "./case-directions";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { TerritorialCaseVariant } from "./territorial-case-variants";
import { DefinitiveTwoVariant } from "~/app/_components/success-cases/territorial-case-definitive-two";
import {
  institutionalCases,
  type InstitutionalCase,
} from "~/app/_components/success-cases/success-cases-data";
export { InstitutionalLogo } from "~/app/_components/success-cases/success-cases-brand";

export function SuccessCasesProposal({
  direction,
  cases = institutionalCases,
}: {
  direction: CaseDirection;
  cases?: readonly InstitutionalCase[];
}) {
  const ref = useRef<HTMLElement>(null);
  // A growing catalogue can be taller than the viewport: reveal it as soon as
  // any part enters, instead of requiring a fraction of the entire section.
  const inView = useInView(ref, { amount: "some" });
  const reduced = !!useReducedMotion();
  const [tabVisible, setTabVisible] = useState(true);
  useEffect(() => {
    const update = () => setTabVisible(!document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  return (
    <motion.section
      ref={ref}
      aria-label="Casos de éxito en el sistema sanitario"
      data-case-direction={direction}
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: reduced || inView ? 1 : 0 }}
      transition={{ duration: reduced ? 0 : 0.36 }}
      className="case-proposal relative isolate z-10 mx-auto w-full max-w-7xl"
      style={
        {
          "--case-motion":
            !reduced && inView && tabVisible ? "running" : "paused",
        } as CSSProperties
      }
    >
      {direction === "trace-definitive-2" ? (
        <DefinitiveTwoVariant
          cases={cases}
          motionEnabled={!reduced && inView && tabVisible}
        />
      ) : (
        <TerritorialCaseVariant
          direction={direction}
          cases={cases}
          motionEnabled={!reduced && inView && tabVisible}
        />
      )}
    </motion.section>
  );
}
