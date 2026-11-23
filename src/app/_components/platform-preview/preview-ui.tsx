"use client";

import Image from "next/image";
import {
  Building2,
  Crown,
  Moon,
  Sun,
  LogOut,
  X,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, type ReactNode } from "react";
import { useEvidenceDocumentContext } from "../evidence-document-context";
import { cleanQuote, type PreviewCitation } from "./preview-data";

export function PreviewIconButton({
  icon: Icon,
  label,
  onClick,
  active,
  disabled,
  expanded,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  expanded?: boolean;
}) {
  return (
    <button
      type="button"
      className="pp-icon-button"
      aria-label={label}
      title={label}
      onClick={onClick}
      data-active={active ? true : undefined}
      disabled={disabled}
      aria-expanded={expanded}
    >
      <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
    </button>
  );
}
export function PreviewLogo({
  symbol = false,
  dark,
}: {
  symbol?: boolean;
  dark: boolean;
}) {
  const t = useTranslations("platform.preview");
  return (
    <Image
      src={
        "/logos/binpar-brand/binpar" +
        (symbol ? "-isotipo" : "-logo") +
        (dark ? "-dark.svg" : "-light.svg")
      }
      alt={t("logoAlt")}
      width={symbol ? 121.76 : 430.04}
      height={131.79}
      className={symbol ? "pp-isotype" : "pp-logo"}
      unoptimized
    />
  );
}
export function PreviewAvatar() {
  const t = useTranslations("platform.preview.user");
  return (
    <span className="pp-avatar" aria-hidden="true">
      {t("initial")}
      <span className="pp-crown">
        <Crown size={10} strokeWidth={1.8} />
      </span>
      <span className="pp-role">{t("role")}</span>
    </span>
  );
}
export function PreviewProfile({
  dark,
  onThemeChange,
  onClose,
  onReset,
  inline,
}: {
  dark: boolean;
  onThemeChange: () => void;
  onClose: () => void;
  onReset: () => void;
  inline: boolean;
}) {
  const t = useTranslations("platform.preview");
  return (
    <section
      className={
        "pp-profile " + (inline ? "pp-profile-inline" : "pp-profile-popover")
      }
      aria-label={t("profile.title")}
      data-preview-popover=""
    >
      <header className="pp-profile-heading">
        <span>{t("profile.title")}</span>
        <PreviewIconButton
          icon={X}
          label={t("profile.close")}
          onClick={onClose}
        />
      </header>
      <div className="pp-profile-body">
        <div className="pp-profile-card pp-profile-identity">
          <PreviewAvatar />
          <div>
            <strong>{t("user.name")}</strong>
            <p>{t("user.email")}</p>
          </div>
          <PreviewIconButton
            icon={dark ? Sun : Moon}
            label={dark ? t("profile.themeLight") : t("profile.themeDark")}
            onClick={onThemeChange}
          />
        </div>
        <div className="pp-profile-card">
          <h3>{t("profile.activeOrganization")}</h3>
          <div className="pp-organization">
            <Building2 size={15} strokeWidth={1.8} aria-hidden="true" />
            <strong>{t("user.organization")}</strong>
            <span>{t("profile.organizationActive")}</span>
          </div>
        </div>
        <div className="pp-profile-card">
          <h3>{t("profile.account")}</h3>
          <dl>
            <div>
              <dt>{t("profile.status")}</dt>
              <dd className="pp-accent">{t("profile.statusActive")}</dd>
            </div>
            <div>
              <dt>{t("profile.lastActivity")}</dt>
              <dd>{t("profile.lastActivityValue")}</dd>
            </div>
          </dl>
        </div>
        <div className="pp-profile-card pp-signout">
          <button
            type="button"
            className="pp-outline-button"
            onClick={onReset}
            title={t("profile.resetTitle")}
          >
            <LogOut size={16} strokeWidth={1.8} aria-hidden="true" />
            {t("profile.signOut")}
          </button>
        </div>
      </div>
    </section>
  );
}
export function PreviewInline({
  text,
  citations,
  onCitation,
}: {
  text: string;
  citations: readonly PreviewCitation[];
  onCitation: (citation: PreviewCitation, trigger: HTMLButtonElement) => void;
}) {
  const t = useTranslations("platform.preview.chat");
  return text.split(/(⟦[^⟧]+⟧|\*\*[^*]+\*\*)/g).map((token, i) => {
    if (token.startsWith("⟦")) {
      const citation = citations.find((c) => c.anchor === token.slice(1, -1));
      return citation ? (
        <button
          type="button"
          key={i}
          className="pp-citation"
          aria-label={t("citation", {
            order: citation.order,
            title: citation.title,
          })}
          onClick={(e) => onCitation(citation, e.currentTarget)}
        >
          [{citation.order}]
        </button>
      ) : null;
    }
    return token.startsWith("**") ? (
      <strong key={i}>{token.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{token}</span>
    );
  });
}
export function PreviewAnswer({
  text,
  citations,
  onCitation,
}: {
  text: string;
  citations: readonly PreviewCitation[];
  onCitation: (citation: PreviewCitation, trigger: HTMLButtonElement) => void;
}) {
  const blocks: ReactNode[] = [];
  let bullets: ReactNode[] = [];
  const flush = () => {
    if (bullets.length) {
      blocks.push(<ul key={blocks.length}>{bullets}</ul>);
      bullets = [];
    }
  };
  text.split(/\n+/).forEach((line, i) => {
    const inline = (
      <PreviewInline
        text={line.replace(/^- /, "")}
        citations={citations}
        onCitation={onCitation}
      />
    );
    if (line.startsWith("- ")) bullets.push(<li key={i}>{inline}</li>);
    else if (line.trim()) {
      flush();
      blocks.push(<p key={blocks.length}>{inline}</p>);
    }
  });
  flush();
  return <div className="pp-answer">{blocks}</div>;
}
export function PreviewDocument({
  citation,
  full,
  locateKey,
  documentCitations,
  renalProgression,
}: {
  citation: PreviewCitation;
  full: boolean;
  locateKey: number;
  /** Pasajes del documento de la consulta, en el idioma de la página. */
  documentCitations: readonly PreviewCitation[];
  renalProgression: string;
}) {
  const t = useTranslations("platform.preview.document");
  const drugContext = useEvidenceDocumentContext();
  const viewport = useRef<HTMLDivElement>(null);
  const passage = useRef<HTMLElement>(null);
  const renal = citation.source === "promir-nefrologia.md";
  const initial = citation.anchor === "c7b8ef";
  useEffect(() => {
    const scroll = viewport.current;
    const mark = passage.current;
    if (!scroll || !mark) return;
    // Scroll only this document; scrollIntoView would also move the landing page.
    scroll.scrollTop = initial && !full ? 0 : Math.max(0, mark.offsetTop - 110);
  }, [citation.anchor, full, initial, locateKey]);
  return (
    <div
      ref={viewport}
      className="pp-document"
      tabIndex={0}
      aria-label={t("label")}
    >
      {renal && (
        <>
          <h3>{t("renal.etiologyHeading")}</h3>
          <p>{t("renal.etiology")}</p>
          <p>{t("renal.diabetes")}</p>
          <p>
            <strong>{t("renal.progressionHeading")} </strong>
            {initial ? (
              <mark ref={passage}>{renalProgression}</mark>
            ) : (
              renalProgression
            )}{" "}
            {t("renal.progressionAfter")}
          </p>
          <h4>{t("renal.risksHeading")}</h4>
          <table>
            <tbody>
              {(t.raw("renal.risks") as string[]).map((risk) => (
                <tr key={risk}>
                  <td>{risk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      {!initial && (
        <section className="pp-document-excerpt">
          <h3>{renal ? t("excerptRenal") : t("excerptHeart")}</h3>
          {citation.quote ? (
            <p>
              <mark ref={passage}>{cleanQuote(citation.quote)}</mark>
            </p>
          ) : (
            <p>{t("selectCitation")}</p>
          )}
        </section>
      )}
      {full && (
        <>
          {documentCitations
            .filter(
              (c) =>
                c.source === citation.source && c.anchor !== citation.anchor,
            )
            .map((c) => (
              <section key={c.anchor}>
                <h3>
                  {c.expert === "farmacologia"
                    ? t("pharmacology")
                    : t("clinical")}
                </h3>
                <p>{cleanQuote(c.quote ?? "")}</p>
              </section>
            ))}
          {renal && (
            <>
              <h3>{t("dosingHeading")}</h3>
              <p>{drugContext.dosing}</p>
              <ul>
                {(t.raw("dosingWays") as string[]).map((way) => (
                  <li key={way}>{way}</li>
                ))}
              </ul>
              <h3>{t("nsaidsHeading")}</h3>
              <p>{drugContext.nsaids.highlight + drugContext.nsaids.rest}</p>
              <p>{drugContext.interactions}</p>
            </>
          )}
        </>
      )}
    </div>
  );
}
