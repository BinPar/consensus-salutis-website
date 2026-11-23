"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Download,
} from "lucide-react";
import type { MouseEvent, ReactNode } from "react";
import {
  teamSol61Areas,
  teamSol61Joined,
  teamSol61Members,
  type TeamSol61Area,
  type TeamSol61Member,
} from "./team-sol61-data";
import type { TeamSol61Direction } from "./team-sol61-directions";
import { teamSol61Href } from "./team-sol61-state";
import {
  RealTeamPortrait,
  realTeamPortraits,
} from "../../_shared/team-portraits";

export type MemberNavigation = (
  event: MouseEvent<HTMLAnchorElement>,
  slug: string,
) => void;
export type TeamViewProps = {
  direction: TeamSol61Direction;
  onOpen: MemberNavigation;
};
export type ProfileViewProps = TeamViewProps & {
  member: TeamSol61Member;
  onBack: () => void;
  onSelect: (member: TeamSol61Member) => void;
};

export function Portrait({
  member,
  className = "",
  priority = false,
}: {
  member: TeamSol61Member;
  className?: string;
  priority?: boolean;
}) {
  const column = member.portrait % 2;
  const row = Math.floor(member.portrait / 2) % 2;
  const sheet = String(Math.floor(member.portrait / 4) + 1).padStart(2, "0");
  return (
    <span className={`ts-portrait ${className}`} aria-hidden="true">
      <span className="ts-portrait-crop">
        {realTeamPortraits[member.slug] ? (
          <RealTeamPortrait
            slug={member.slug}
            name={member.name}
            priority={priority}
          />
        ) : (
          <Image
            src={`/lab/team-sol61/portraits-${sheet}.webp`}
            alt=""
            width={1254}
            height={1254}
            priority={priority}
            sizes="(max-width: 640px) 180vw, 1200px"
            style={{
              position: "absolute",
              width: "200%",
              height: "200%",
              maxWidth: "none",
              left: column ? "-100%" : "0",
              top: row ? "-100%" : "0",
              right: "auto",
              bottom: "auto",
            }}
          />
        )}
      </span>
    </span>
  );
}

export function Scene({
  scene,
  className = "",
  priority = false,
}: {
  scene: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={`ts-scene ${className}`}>
      <Image
        src={`/lab/team-sol61/scene-${scene}.webp`}
        alt="Escena de trabajo conceptual para esta propuesta visual"
        fill
        sizes="(max-width: 800px) 100vw, 1400px"
        priority={priority}
      />
    </div>
  );
}

export function MemberLink({
  member,
  direction,
  onOpen,
  className = "",
  children,
  onMouseEnter,
  onFocus,
}: TeamViewProps & {
  member: TeamSol61Member;
  className?: string;
  children: ReactNode;
  onMouseEnter?: () => void;
  onFocus?: () => void;
}) {
  return (
    <a
      className={className}
      data-team-member={member.slug}
      href={teamSol61Href(direction, "profile", member.slug)}
      onClick={(event) => onOpen(event, member.slug)}
      onMouseEnter={onMouseEnter}
      onFocus={onFocus}
    >
      {children}
    </a>
  );
}

export function Eyebrow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={`ts-eyebrow font-display ${className}`}>{children}</p>;
}

export function AreaFilter({
  area,
  onChange,
}: {
  area: TeamSol61Area | "Todos";
  onChange: (area: TeamSol61Area | "Todos") => void;
}) {
  return (
    <div
      className="ts-filters"
      role="group"
      aria-label="Filtrar por ámbito profesional"
    >
      {(["Todos", ...teamSol61Areas] as const).map((item) => (
        <button
          key={item}
          type="button"
          aria-pressed={area === item}
          onClick={() => onChange(item)}
        >
          {item}
          <span>
            {item === "Todos"
              ? teamSol61Members.length
              : teamSol61Members.filter((member) => member.area === item)
                  .length}
          </span>
        </button>
      ))}
    </div>
  );
}

export function ProfileBack({ onBack }: { onBack: () => void }) {
  return (
    <button type="button" className="ts-back" onClick={onBack}>
      <ArrowLeft size={16} strokeWidth={1.8} aria-hidden="true" />
      Todo el equipo
    </button>
  );
}

export function MemberFacts({ member }: { member: TeamSol61Member }) {
  const joined = teamSol61Joined(member);
  return (
    <dl className="ts-facts">
      <div>
        <dt>Ámbito</dt>
        <dd>{member.area}</dd>
      </div>
      <div>
        <dt>Función</dt>
        <dd>{member.role}</dd>
      </div>
      {joined && (
        <div>
          <dt>En BinPar desde</dt>
          <dd>{joined}</dd>
        </div>
      )}
    </dl>
  );
}

export function MemberBio({ member }: { member: TeamSol61Member }) {
  return (
    <div className="ts-bio">
      {member.paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );
}

export function ContactActions({ member }: { member: TeamSol61Member }) {
  return (
    <div className="ts-contact-actions">
      <a
        className="ts-button"
        href={member.contactHref}
        target="_blank"
        rel="noopener noreferrer"
      >
        Guardar contacto
        <Download size={16} strokeWidth={1.8} aria-hidden="true" />
        <span className="sr-only"> (se abre en otra pestaña)</span>
      </a>
      <a className="ts-text-link" href="/contacto">
        Hablemos
        <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
      </a>
    </div>
  );
}

export function ProfileNeighbors({
  member,
  direction,
  onOpen,
}: TeamViewProps & { member: TeamSol61Member }) {
  const index = teamSol61Members.findIndex((item) => item.slug === member.slug);
  const previous =
    teamSol61Members[
      (index - 1 + teamSol61Members.length) % teamSol61Members.length
    ]!;
  const next = teamSol61Members[(index + 1) % teamSol61Members.length]!;
  return (
    <nav className="ts-neighbors" aria-label="Otros miembros del equipo">
      <MemberLink member={previous} direction={direction} onOpen={onOpen}>
        <ArrowLeft size={18} strokeWidth={1.8} aria-hidden="true" />
        <span>
          <small>Anterior</small>
          {previous.name}
        </span>
      </MemberLink>
      <MemberLink member={next} direction={direction} onOpen={onOpen}>
        <span>
          <small>Siguiente</small>
          {next.name}
        </span>
        <ArrowRight size={18} strokeWidth={1.8} aria-hidden="true" />
      </MemberLink>
    </nav>
  );
}

export function PreviewHeader({
  onTeam,
  direction,
}: {
  onTeam: (event: MouseEvent<HTMLAnchorElement>) => void;
  direction: TeamSol61Direction;
}) {
  return (
    <header className="ts-site-header">
      <Link href="/" prefetch={false} aria-label="BinPar, inicio">
        <Image
          src="/logos/binpar-brand/binpar-logo-light.svg"
          alt="BinPar"
          width={131}
          height={40}
          className="dark:hidden"
        />
        <Image
          src="/logos/binpar-brand/binpar-logo-dark.svg"
          alt="BinPar"
          width={131}
          height={40}
          className="hidden dark:block"
        />
      </Link>
      <nav aria-label="Navegación de la previsualización">
        <Link href="/" prefetch={false}>
          Inicio
        </Link>
        <Link href="/plataforma" prefetch={false}>
          Plataforma
        </Link>
        <a
          href={teamSol61Href(direction, "team")}
          onClick={onTeam}
          aria-current="page"
        >
          Equipo
        </a>
      </nav>
      <a href="/contacto" className="ts-header-contact">
        Hablemos
        <ArrowUpRight size={14} strokeWidth={1.8} aria-hidden="true" />
      </a>
    </header>
  );
}

export function PageEnd() {
  return (
    <div className="ts-page-end">
      <Eyebrow>Sigamos conversando</Eyebrow>
      <div>
        <h2 className="font-display">
          Un buen proyecto empieza
          <br />
          por entendernos.
        </h2>
        <a href="/contacto" className="ts-text-link">
          Conoce lo que podemos construir juntos
          <ArrowUpRight size={20} strokeWidth={1.8} aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}

export function ExploreLink({
  target,
  children,
}: {
  target: string;
  children: ReactNode;
}) {
  return (
    <a
      className="ts-text-link"
      href={`#${target}`}
      onClick={(event) => {
        event.preventDefault();
        document.getElementById(target)?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "instant"
            : "smooth",
        });
      }}
    >
      {children}
      <ArrowDown size={16} strokeWidth={1.8} aria-hidden="true" />
    </a>
  );
}
