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
import { useEffect, useRef, type ReactNode } from "react";
import {
  cleanQuote,
  documentCitations,
  drugContext,
  renalContext,
  type PreviewCitation,
} from "./preview-data";

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
  return (
    <Image
      src={
        "/logos/binpar-brand/binpar" +
        (symbol ? "-isotipo" : "-logo") +
        (dark ? "-dark.svg" : "-light.svg")
      }
      alt="BinPar"
      width={symbol ? 121.76 : 430.04}
      height={131.79}
      className={symbol ? "pp-isotype" : "pp-logo"}
      unoptimized
    />
  );
}
export function PreviewAvatar() {
  return (
    <span className="pp-avatar" aria-hidden="true">
      A
      <span className="pp-crown">
        <Crown size={10} strokeWidth={1.8} />
      </span>
      <span className="pp-role">Clínico</span>
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
  return (
    <section
      className={
        "pp-profile " + (inline ? "pp-profile-inline" : "pp-profile-popover")
      }
      aria-label="Perfil y configuración"
      data-preview-popover=""
    >
      <header className="pp-profile-heading">
        <span>Perfil y configuración</span>
        <PreviewIconButton icon={X} label="Cerrar perfil" onClick={onClose} />
      </header>
      <div className="pp-profile-body">
        <div className="pp-profile-card pp-profile-identity">
          <PreviewAvatar />
          <div>
            <strong>Dra. Ana García</strong>
            <p>ana@hospital.example</p>
          </div>
          <PreviewIconButton
            icon={dark ? Sun : Moon}
            label={
              dark
                ? "Activar tema claro del mock"
                : "Activar tema oscuro del mock"
            }
            onClick={onThemeChange}
          />
        </div>
        <div className="pp-profile-card">
          <h3>Organización activa</h3>
          <div className="pp-organization">
            <Building2 size={15} strokeWidth={1.8} aria-hidden="true" />
            <strong>Hospital de demostración</strong>
            <span>Activa</span>
          </div>
        </div>
        <div className="pp-profile-card">
          <h3>Cuenta</h3>
          <dl>
            <div>
              <dt>Estado:</dt>
              <dd className="pp-accent">Activo</dd>
            </div>
            <div>
              <dt>Última actividad:</dt>
              <dd>14 oct 2026, 13:36</dd>
            </div>
          </dl>
        </div>
        <div className="pp-profile-card pp-signout">
          <button
            type="button"
            className="pp-outline-button"
            onClick={onReset}
            title="Reiniciar la demostración"
          >
            <LogOut size={16} strokeWidth={1.8} aria-hidden="true" />
            Cerrar sesión
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
  return text.split(/(⟦[^⟧]+⟧|\*\*[^*]+\*\*)/g).map((token, i) => {
    if (token.startsWith("⟦")) {
      const citation = citations.find((c) => c.anchor === token.slice(1, -1));
      return citation ? (
        <button
          type="button"
          key={i}
          className="pp-citation"
          aria-label={"Ver fuente " + citation.order + ": " + citation.title}
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
}: {
  citation: PreviewCitation;
  full: boolean;
  locateKey: number;
}) {
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
      aria-label="Contenido del documento"
    >
      {renal && (
        <>
          <h3>Etiología</h3>
          <p>{renalContext.etiology}</p>
          <p>{renalContext.diabetes}</p>
          <p>
            <strong>Progresión de la ERC. </strong>
            {initial ? (
              <mark ref={passage}>{renalContext.progression}</mark>
            ) : (
              renalContext.progression
            )}{" "}
            {renalContext.progressionAfter}
          </p>
          <h4>Factores de progresión de la enfermedad renal crónica</h4>
          <table>
            <tbody>
              {renalContext.risks.map((risk) => (
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
          <h3>
            {renal
              ? "Valoración clínica y tratamiento"
              : "Insuficiencia cardíaca aguda"}
          </h3>
          {citation.quote ? (
            <p>
              <mark ref={passage}>{cleanQuote(citation.quote)}</mark>
            </p>
          ) : (
            <p>
              Selecciona una cita del caso inicial para localizar su fragmento
              documental.
            </p>
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
                    ? "Tratamiento farmacológico"
                    : "Valoración clínica"}
                </h3>
                <p>{cleanQuote(c.quote ?? "")}</p>
              </section>
            ))}
          {renal && (
            <>
              <h3>Dosis de fármacos y riñón</h3>
              <p>{drugContext.dosing}</p>
              <ul>
                <li>Disminuyendo la dosis.</li>
                <li>Aumentando el intervalo entre las dosis.</li>
              </ul>
              <h3>Antiinflamatorios no esteroideos</h3>
              <p>{drugContext.nsaids}</p>
              <p>{drugContext.interactions}</p>
            </>
          )}
        </>
      )}
    </div>
  );
}
