"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { HomeGrid } from "./motion-system";
import { navItems } from "./site-header";
import { contactItems } from "./site-footer-links";
import "./footer-design.css";

export function Brand({ white = false }: { white?: boolean }) {
  return (
    <Link href="/" aria-label="BinPar · Inicio" className="ft-brand">
      {!white && (
        <Image
          src="/logos/binpar-brand/binpar-logo-light.svg"
          alt=""
          width={430}
          height={132}
          className="dark:hidden"
        />
      )}
      <Image
        src="/logos/binpar-brand/binpar-logo-dark.svg"
        alt=""
        width={430}
        height={132}
        className={white ? "" : "hidden dark:block"}
      />
    </Link>
  );
}

export function ProductLinks({ numbered = false }: { numbered?: boolean }) {
  return (
    <nav aria-label="Producto · Pie de página" className="ft-product-links">
      {navItems.map((item, index) => (
        <Link href={item.href} key={item.href}>
          {numbered && <span className="ft-index">0{index + 1}</span>}
          <span>{item.label}</span>
          {numbered && (
            <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
          )}
        </Link>
      ))}
    </nav>
  );
}

export function ContactLinks() {
  return (
    <nav aria-label="Contacto · Pie de página" className="ft-contact-links">
      {contactItems.map((item) => (
        <Link href={item.href} key={item.href}>
          {item.label}
          <ArrowUpRight size={15} strokeWidth={1.8} aria-hidden="true" />
        </Link>
      ))}
    </nav>
  );
}

export function Bottom() {
  return (
    <div className="ft-bottom">
      <p>© BinPar · Todos los derechos reservados</p>
      <Link href="/privacidad">Política de privacidad</Link>
    </div>
  );
}

export function Description({ extended = false }: { extended?: boolean }) {
  return (
    <p className="ft-description">
      {extended
        ? "IA médica institucional para conectar conocimiento clínico y respuestas trazables."
        : "IA médica institucional."}
    </p>
  );
}

export function ContrastFooter({
  palette = "teal",
}: {
  palette?: "teal" | "original";
}) {
  const reduced = useReducedMotion();
  return (
    <motion.footer
      data-footer-direction="contrast"
      data-footer-palette={palette}
      className="ft-proposal ft-contrast font-body"
      initial={{ opacity: reduced ? 1 : 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: reduced ? 0 : 0.35 }}
    >
      <div className="ft-grid-window" aria-hidden="true">
        <HomeGrid className="ft-home-grid" />
      </div>
      <div className="ft-container">
        <div className="ft-panel-shell">
          <div className="ft-panel-brand">
            <Brand white />
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
        <Bottom />
      </div>
    </motion.footer>
  );
}
