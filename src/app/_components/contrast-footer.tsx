"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

import { Link } from "~/i18n/navigation";

import { HomeGrid } from "./motion-system";
import {
  useContactItems,
  useLegalItems,
  useNavItems,
} from "./site-footer-links";
import "./footer-design.css";

export function Brand({ white = false }: { white?: boolean }) {
  const t = useTranslations("layout.footer");

  return (
    <Link href="/" aria-label={t("brandHome")} className="ft-brand">
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
  const t = useTranslations("layout.footer");
  const navItems = useNavItems();

  return (
    <nav aria-label={t("productNav")} className="ft-product-links">
      {navItems.map((item, index) =>
        item.disabled ? (
          <span
            key={item.href}
            role="link"
            aria-disabled="true"
            className="inline-flex cursor-not-allowed items-center gap-2 opacity-45"
          >
            {numbered && <span className="ft-index">0{index + 1}</span>}
            <span>{item.label}</span>
          </span>
        ) : (
          <Link href={item.href} key={item.href}>
            {numbered && <span className="ft-index">0{index + 1}</span>}
            <span>{item.label}</span>
            {numbered && (
              <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
            )}
          </Link>
        ),
      )}
    </nav>
  );
}

export function ContactLinks() {
  const t = useTranslations("layout.footer");
  const contactItems = useContactItems();

  return (
    <nav aria-label={t("contactNav")} className="ft-contact-links">
      {contactItems.map((item) => {
        const content = (
          <>
            {item.label}
            <ArrowUpRight size={15} strokeWidth={1.8} aria-hidden="true" />
          </>
        );

        return item.kind === "mail" ? (
          <a href={item.href} key={item.href}>
            {content}
          </a>
        ) : (
          <Link href={item.href} key={item.href}>
            {content}
          </Link>
        );
      })}
    </nav>
  );
}

export function Bottom() {
  const t = useTranslations("layout.footer");
  const legalItems = useLegalItems();

  return (
    <div className="ft-bottom">
      <p>{t("rights")}</p>
      <nav
        aria-label={t("legalNav")}
        className="flex flex-wrap justify-end gap-x-4 gap-y-1"
      >
        {legalItems.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function Description({ extended = false }: { extended?: boolean }) {
  const t = useTranslations("layout.footer");

  return (
    <p className="ft-description">
      {extended ? t("descriptionExtended") : t("description")}
    </p>
  );
}

export function ContrastFooter({
  palette = "teal",
}: {
  palette?: "teal" | "original";
}) {
  const t = useTranslations("layout.footer");
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
            <p className="ft-eyebrow font-display">{t("explore")}</p>
            <ProductLinks />
          </div>
          <div className="ft-panel-contact">
            <p className="ft-eyebrow font-display">{t("connect")}</p>
            <ContactLinks />
          </div>
        </div>
        <Bottom />
      </div>
    </motion.footer>
  );
}
