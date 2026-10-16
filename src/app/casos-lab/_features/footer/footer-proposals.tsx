"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { FooterDirection } from "./footer-directions";
import {
  ContrastFooter,
  Brand,
  ProductLinks,
  ContactLinks,
  Bottom,
  Description,
} from "~/app/_components/contrast-footer";

type Proposal = Exclude<FooterDirection, "reference">;

export function FooterProposal({ direction }: { direction: Proposal }) {
  if (direction === "contrast-original") {
    return <ContrastFooter palette="original" />;
  }
  return direction === "contrast" ? (
    <ContrastFooter />
  ) : (
    <OtherFooterProposal direction={direction} />
  );
}

function OtherFooterProposal({
  direction,
}: {
  direction: Exclude<Proposal, "contrast" | "contrast-original">;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.footer
      data-footer-direction={direction}
      className={`ft-proposal ft-${direction} font-body`}
      initial={{ opacity: reduced ? 1 : 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: reduced ? 0 : 0.35 }}
    >
      <div className="ft-container">
        {direction === "editorial" && (
          <div className="ft-editorial-layout">
            <div>
              <Brand />
              <Description />
              <ContactLinks />
            </div>
            <ProductLinks numbered />
          </div>
        )}
        {direction === "horizon" && (
          <>
            <div className="ft-horizon-heading">
              <Brand />
              <Description />
            </div>
            <div className="ft-horizon-nav">
              <ProductLinks />
              <ContactLinks />
            </div>
          </>
        )}
        {direction === "panels" && (
          <div className="ft-panel-shell">
            <div className="ft-panel-brand">
              <Brand />
              <Description extended />
            </div>
            <div className="ft-panel-navigation">
              <p className="ft-eyebrow font-display">Explorar</p>
              <ProductLinks />
            </div>
            <div className="ft-panel-contact">
              <p className="ft-eyebrow font-display">Conectemos</p>
              <ContactLinks />
            </div>
          </div>
        )}
        {direction === "essential" && (
          <>
            <div className="ft-essential-top">
              <div>
                <Brand />
                <Description />
              </div>
              <ProductLinks />
            </div>
            <div className="ft-essential-contact">
              <ContactLinks />
            </div>
          </>
        )}
        {direction !== "panels" && <Bottom />}
      </div>
      {direction === "panels" && (
        <div className="ft-legal-band">
          <div className="ft-container">
            <Bottom />
          </div>
        </div>
      )}
    </motion.footer>
  );
}
