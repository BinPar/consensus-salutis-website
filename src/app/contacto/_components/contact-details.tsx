"use client";

import { ArrowUpRight, Mail, MapPin, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Reveal } from "~/app/_components/motion-system";
import { Eyebrow } from "~/app/_components/eyebrow";
import { OfficeMap } from "./office-map";

export function ContactDetails({
  visible = true,
  panelRef,
}: {
  visible?: boolean;
  panelRef?: (node: HTMLElement | null) => void;
}) {
  return (
    <section
      ref={panelRef}
      id="donde-estamos"
      tabIndex={-1}
      data-section-anchor
      data-contact-details-painted={visible}
      aria-labelledby="contact-details-heading"
      className="relative border-t border-cyan-800/10 bg-[#e8f2f7]/80 dark:border-primary-dark/10 dark:bg-[#081827]/80"
    >
      <Reveal visible={visible} className="grid w-full lg:grid-cols-2">
        <div className="px-5 py-14 sm:px-10 sm:py-18 lg:pr-16 lg:pl-[max(40px,calc((100vw-var(--section-content-max,1280px))/2))]">
          <Eyebrow>Dónde encontrarnos</Eyebrow>
          <h2
            id="contact-details-heading"
            className="font-display mt-4 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl lg:text-5xl dark:text-slate-50"
          >
            Estamos en Madrid.
          </h2>
          <p className="font-body mt-5 max-w-md text-base leading-7 text-slate-600 sm:text-lg sm:leading-8 dark:text-slate-400">
            Escríbenos o consulta cómo llegar a nuestras oficinas.
          </p>

          <address className="font-body mt-7 max-w-md divide-y divide-cyan-800/12 border-y border-cyan-800/12 text-sm leading-6 text-slate-600 not-italic dark:divide-cyan-300/12 dark:border-primary-dark/12 dark:text-slate-400">
            <ContactDetailRow icon={MapPin}>
              <p>
                Paseo de la Castellana, 43, 4.ª planta · 121. Chamberí, 28046
                Madrid, España.
              </p>
              <a
                href="https://g.page/binpar-sl?share"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-light dark:text-primary-dark mt-2 inline-flex items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline"
              >
                Cómo llegar
                <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
                <span className="sr-only"> (Google Maps, pestaña nueva)</span>
              </a>
            </ContactDetailRow>
            <ContactDetailRow icon={Mail}>
              <a
                href="mailto:info@binpar.com"
                className="text-primary-light dark:text-primary-dark inline-flex items-center gap-2 text-base font-semibold underline-offset-4 hover:underline"
              >
                info@binpar.com
                <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
              </a>
            </ContactDetailRow>
          </address>
        </div>

        <div className="relative min-h-80 lg:min-h-96">
          <OfficeMap active={visible} />
        </div>
      </Reveal>
    </section>
  );
}

function ContactDetailRow({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[20px_minmax(0,1fr)] gap-4 py-4">
      <Icon
        size={20}
        strokeWidth={1.8}
        aria-hidden="true"
        className="text-primary-light dark:text-primary-dark mt-0.5"
      />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
