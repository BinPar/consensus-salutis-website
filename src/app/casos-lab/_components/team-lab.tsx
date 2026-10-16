"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Plus,
  ScanLine,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { teamDirections, type TeamDirection } from "./team-directions";
import {
  joinedYear,
  memberHref,
  teamAreas,
  teamMembers,
  type TeamArea,
  type TeamMember,
} from "./astra-team-data";
import "./team-astra.css";

type Navigate = (slug?: string) => void;
const firstMember = teamMembers[0]!;
const featuredMember = teamMembers.find(
  (person) => person.slug === "adrian-rodriguez",
)!;
const number = (person: TeamMember) =>
  String(person.portrait + 1).padStart(2, "0");

function Arrow({ back = false }: { back?: boolean }) {
  const Icon = back ? ArrowLeft : ArrowUpRight;
  return <Icon size={19} strokeWidth={1.8} aria-hidden="true" />;
}
function Portrait({
  person,
  className = "",
  priority = false,
}: {
  person: TeamMember;
  className?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const col = person.portrait % 2;
  const row = Math.floor((person.portrait % 4) / 2);
  const sheet = Math.floor(person.portrait / 4) + 1;
  return (
    <div className={`ta-photo ${className}`}>
      {failed ? (
        <span className="ta-photo-fallback" aria-label="Imagen no disponible">
          {person.name
            .split(" ")
            .map((part) => part[0])
            .slice(0, 2)
            .join("")}
        </span>
      ) : (
        <Image
          src={`/img/team-astra/portraits-${sheet}.webp`}
          alt="Retrato ficticio de referencia fotográfica"
          width={1254}
          height={1254}
          unoptimized
          priority={priority}
          onError={() => setFailed(true)}
          className="ta-sheet"
          style={{ left: `${-col * 100}%`, top: `${-row * 100}%` }}
        />
      )}
      <span className="ta-photo-mark" aria-hidden="true">
        Estudio visual
      </span>
    </div>
  );
}
function intercept(event: MouseEvent<HTMLAnchorElement>, action: () => void) {
  if (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
    return;
  event.preventDefault();
  action();
}
function MemberLink({
  person,
  direction,
  navigate,
  children,
  className = "",
  onPreview,
}: {
  person: TeamMember;
  direction: TeamDirection;
  navigate: Navigate;
  children: ReactNode;
  className?: string;
  onPreview?: () => void;
}) {
  return (
    <a
      href={memberHref(direction, person.slug)}
      data-member-link={person.slug}
      className={className}
      onMouseEnter={onPreview}
      onFocus={onPreview}
      onClick={(event) => intercept(event, () => navigate(person.slug))}
    >
      {children}
    </a>
  );
}
function Identity({
  person,
  arrow = true,
}: {
  person: TeamMember;
  arrow?: boolean;
}) {
  return (
    <div className="ta-identity">
      <span>
        <strong>{person.name}</strong>
        <span>{person.role}</span>
      </span>
      {arrow && <Arrow />}
    </div>
  );
}
function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="ta-eyebrow">{children}</p>;
}
function Filters({
  selected,
  onSelect,
}: {
  selected: TeamArea;
  onSelect: (area: TeamArea) => void;
}) {
  return (
    <div
      className="ta-filters"
      role="group"
      aria-label="Filtrar por especialidad"
    >
      {teamAreas.map((area) => (
        <button
          key={area}
          type="button"
          aria-pressed={selected === area}
          onClick={() => onSelect(area)}
        >
          {area}
          <span>
            {area === "Todas"
              ? teamMembers.length
              : teamMembers.filter((p) => p.area === area).length}
          </span>
        </button>
      ))}
    </div>
  );
}
function DirectoryHeader({ direction }: { direction: TeamDirection }) {
  const headings = {
    encuadre: (
      <>
        Distintas miradas.
        <br />
        <em>Una misma intención.</em>
      </>
    ),
    atlas: (
      <>
        El talento se conecta.
        <br />
        <em>Las ideas avanzan.</em>
      </>
    ),
    indice: (
      <>
        Detrás de cada respuesta,
        <br />
        <em>hay personas.</em>
      </>
    ),
    mesa: (
      <>
        Un lugar para pensar.
        <br />
        <em>Un equipo para hacerlo.</em>
      </>
    ),
    secuencia: (
      <>
        Cada persona,
        <br />
        <em>una forma de mirar.</em>
      </>
    ),
  };
  return (
    <header className={`ta-directory-heading ta-heading-${direction}`}>
      <div>
        <Eyebrow>Las personas de BinPar</Eyebrow>
        <h1 tabIndex={-1} data-astra-heading>
          {headings[direction]}
        </h1>
      </div>
      <div className="ta-heading-aside">
        <span className="ta-count">
          16<span>perspectivas</span>
        </span>
        <p>
          Nos une la curiosidad.
          <br />
          Nos define cómo trabajamos juntos.
        </p>
      </div>
    </header>
  );
}
type ListProps = {
  direction: TeamDirection;
  navigate: Navigate;
  members: TeamMember[];
};
function Encuadre({ direction, navigate, members }: ListProps) {
  return (
    <div className="ta-editorial-grid">
      {members.map((person, index) => (
        <MemberLink
          key={person.slug}
          person={person}
          direction={direction}
          navigate={navigate}
          className={`ta-editorial-card ta-editorial-${index % 6}`}
        >
          <span className="ta-card-number">{number(person)} / BinPar</span>
          <Portrait person={person} priority={index < 2} />
          <Identity person={person} />
          {index % 6 === 0 && <p className="ta-card-thought">{person.intro}</p>}
        </MemberLink>
      ))}
    </div>
  );
}
function Atlas({ direction, navigate, members }: ListProps) {
  return (
    <div
      className={`ta-atlas ${members.length < teamMembers.length ? "ta-atlas-filtered" : ""}`}
    >
      <div className="ta-atlas-center" aria-hidden="true">
        <span className="ta-atlas-orbit" />
        <Plus size={22} strokeWidth={1.2} />
        <span>
          Un equipo.
          <br />
          <strong>Muchas conexiones.</strong>
        </span>
      </div>
      {teamAreas.slice(1).map((area) => {
        const group = members.filter((member) => member.area === area);
        if (!group.length) return null;
        return (
          <section
            key={area}
            className={`ta-atlas-group ta-atlas-${area === "Dirección" ? "direction" : area === "Tecnología" ? "technology" : area === "Análisis" ? "analysis" : "talent"}`}
          >
            <div className="ta-atlas-group-heading">
              <Eyebrow>{area}</Eyebrow>
              <span>{String(group.length).padStart(2, "0")}</span>
            </div>
            <div className="ta-atlas-people">
              {group.map((person) => (
                <MemberLink
                  key={person.slug}
                  person={person}
                  direction={direction}
                  navigate={navigate}
                  className="ta-atlas-person"
                >
                  <Portrait person={person} />
                  <Identity person={person} arrow={false} />
                </MemberLink>
              ))}
            </div>
          </section>
        );
      })}
      <div className="ta-atlas-legend">
        <span />
        <p>Explora las personas de cada especialidad.</p>
        <ArrowDown size={15} aria-hidden="true" />
      </div>
    </div>
  );
}
function Indice({ direction, navigate, members }: ListProps) {
  const [activeSlug, setActiveSlug] = useState(featuredMember.slug);
  const active =
    members.find((person) => person.slug === activeSlug) ??
    members[0] ??
    firstMember;
  return (
    <div className="ta-index">
      <div className="ta-index-list">
        <div className="ta-index-columns">
          <span>Nombre / función</span>
          <span>Conoce su historia</span>
        </div>
        {members.map((person) => (
          <MemberLink
            person={person}
            direction={direction}
            navigate={navigate}
            key={person.slug}
            onPreview={() => setActiveSlug(person.slug)}
            className={`ta-index-row ${active.slug === person.slug ? "is-active" : ""}`}
          >
            <span className="ta-index-number">{number(person)}</span>
            <Portrait person={person} className="ta-index-mobile-photo" />
            <Identity person={person} />
          </MemberLink>
        ))}
      </div>
      <aside className="ta-index-stage">
        <div className="ta-index-stage-inner">
          <div className="ta-stage-label">
            <ScanLine size={15} strokeWidth={1.8} aria-hidden="true" />
            <span>Una mirada al equipo</span>
            <span>{number(active)} / 16</span>
          </div>
          <MemberLink
            person={active}
            direction={direction}
            navigate={navigate}
            className="ta-index-feature"
          >
            <Portrait key={active.slug} person={active} priority />
            <div className="ta-index-caption">
              <span>{active.area}</span>
              <h2>{active.name}</h2>
              <p>{active.intro}</p>
              <span className="ta-text-link">
                Conocer su historia <Arrow />
              </span>
            </div>
          </MemberLink>
        </div>
      </aside>
    </div>
  );
}
function Mesa({ direction, navigate, members }: ListProps) {
  return (
    <div className="ta-desk">
      <div className="ta-desk-note">
        <Eyebrow>Notas de estudio / 01</Eyebrow>
        <p>
          Lo que hacemos
          <br />
          empieza por
          <br />
          <strong>escucharnos.</strong>
        </p>
        <span>BinPar · Personas y tecnología</span>
      </div>
      {members.map((person, index) => (
        <MemberLink
          key={person.slug}
          person={person}
          direction={direction}
          navigate={navigate}
          className={`ta-desk-card ta-desk-card-${index % 4}`}
        >
          <span className="ta-paper-clip" aria-hidden="true" />
          <div className="ta-desk-card-top">
            <span>{number(person)}</span>
            <span>{person.area}</span>
          </div>
          <Portrait person={person} />
          <Identity person={person} />
          <div className="ta-desk-card-bottom">
            <span>
              {joinedYear(person)
                ? `En BinPar desde ${joinedYear(person)}`
                : "Parte del equipo"}
            </span>
            <Plus size={14} strokeWidth={1.8} aria-hidden="true" />
          </div>
        </MemberLink>
      ))}
      <div className="ta-desk-endnote">
        <Plus aria-hidden="true" />
        <p>
          La siguiente buena idea
          <br />
          puede empezar con una conversación.
        </p>
      </div>
    </div>
  );
}
function Secuencia({ direction, navigate, members }: ListProps) {
  const strip = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState(0);
  const go = (index: number) => {
    const target = strip.current?.children[index] as HTMLElement | undefined;
    if (!target || !strip.current) return;
    strip.current.scrollTo({
      left: target.offsetLeft,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  };
  return (
    <div className="ta-cinema">
      <div className="ta-cinema-top">
        <Eyebrow>Historias que se cruzan</Eyebrow>
        <div className="ta-cinema-controls">
          <span>
            {String(Math.min(frame + 1, members.length)).padStart(2, "0")} /{" "}
            {String(members.length).padStart(2, "0")}
          </span>
          <button
            type="button"
            aria-label="Fotograma anterior"
            disabled={frame === 0}
            onClick={() => go(Math.max(0, frame - 1))}
          >
            <Arrow back />
          </button>
          <button
            type="button"
            aria-label="Fotograma siguiente"
            disabled={frame >= members.length - 1}
            onClick={() => go(Math.min(members.length - 1, frame + 1))}
          >
            <ArrowRight size={19} aria-hidden="true" />
          </button>
        </div>
      </div>
      <div
        ref={strip}
        className="ta-filmstrip"
        onScroll={() => {
          const el = strip.current;
          const first = el?.children[0] as HTMLElement | undefined;
          if (el && first)
            setFrame(
              Math.min(
                members.length - 1,
                Math.round(el.scrollLeft / (first.offsetWidth + 20)),
              ),
            );
        }}
      >
        {members.map((person, index) => (
          <MemberLink
            key={person.slug}
            person={person}
            direction={direction}
            navigate={navigate}
            className="ta-film-frame"
          >
            <Portrait person={person} priority={index < 2} />
            <div className="ta-film-scrim" />
            <span className="ta-film-number">
              {number(person)}
              <span>BinPar / Personas</span>
            </span>
            <div className="ta-film-caption">
              <span>{person.role}</span>
              <h2>{person.name}</h2>
              <p>{person.intro}</p>
              <span className="ta-film-open">
                <Arrow />
              </span>
            </div>
          </MemberLink>
        ))}
      </div>
      <div className="ta-cinema-index" aria-label="Índice de personas">
        {members.map((person, index) => (
          <button
            key={person.slug}
            type="button"
            aria-pressed={frame === index}
            onClick={() => go(index)}
          >
            <span>{number(person)}</span>
            {person.name}
          </button>
        ))}
      </div>
    </div>
  );
}
function MemberFacts({ person }: { person: TeamMember }) {
  return (
    <dl className="ta-member-facts">
      <div>
        <dt>Especialidad</dt>
        <dd>{person.role}</dd>
      </div>
      <div>
        <dt>Área</dt>
        <dd>{person.area}</dd>
      </div>
      {joinedYear(person) && (
        <div>
          <dt>En BinPar desde</dt>
          <dd>{joinedYear(person)}</dd>
        </div>
      )}
    </dl>
  );
}
function Biography({ person }: { person: TeamMember }) {
  return (
    <div className="ta-biography">
      <Eyebrow>Su recorrido</Eyebrow>
      <h2>{person.intro}</h2>
      {person.paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );
}
function ProfileHeading({ person }: { person: TeamMember }) {
  return (
    <div className="ta-profile-heading">
      <Eyebrow>{person.area} / BinPar</Eyebrow>
      <h1 tabIndex={-1} data-astra-heading>
        {person.name}
      </h1>
      <p>
        {person.role}
        <span>
          {joinedYear(person)
            ? `Desde ${joinedYear(person)}`
            : "Parte del equipo"}
        </span>
      </p>
    </div>
  );
}
function Related({
  person,
  direction,
  navigate,
}: {
  person: TeamMember;
  direction: TeamDirection;
  navigate: Navigate;
}) {
  const related = teamMembers
    .filter(
      (member) => member.area === person.area && member.slug !== person.slug,
    )
    .slice(0, 3);
  if (!related.length) return null;
  return (
    <section className="ta-related">
      <Eyebrow>Más miradas / {person.area}</Eyebrow>
      <div>
        {related.map((member) => (
          <MemberLink
            key={member.slug}
            person={member}
            direction={direction}
            navigate={navigate}
          >
            <Portrait person={member} />
            <Identity person={member} />
          </MemberLink>
        ))}
      </div>
    </section>
  );
}
function Profile({
  person,
  direction,
  navigate,
}: {
  person: TeamMember;
  direction: TeamDirection;
  navigate: Navigate;
}) {
  const [chapter, setChapter] = useState(0);
  useEffect(() => {
    if (direction !== "secuencia") return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting)
            setChapter(Number((entry.target as HTMLElement).dataset.chapter));
      },
      { rootMargin: "-30% 0px -40% 0px" },
    );
    document
      .querySelectorAll("[data-chapter]")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [direction, person.slug]);
  const current = teamMembers.indexOf(person);
  const previous =
    teamMembers[(current - 1 + teamMembers.length) % teamMembers.length]!;
  const next = teamMembers[(current + 1) % teamMembers.length]!;
  return (
    <article className={`ta-profile ta-profile-${direction}`}>
      <div className="ta-profile-top">
        <a
          href={memberHref(direction)}
          onClick={(event) => intercept(event, () => navigate())}
          className="ta-back"
        >
          <Arrow back /> Todas las personas
        </a>
        <span>{number(person)} / 16</span>
      </div>
      {direction === "encuadre" && (
        <>
          <div className="ta-editorial-profile">
            <div className="ta-editorial-profile-photo">
              <Portrait person={person} priority />
              <span className="ta-editorial-photo-foot">
                BinPar / Una mirada propia
              </span>
            </div>
            <div className="ta-editorial-profile-copy">
              <ProfileHeading person={person} />
              <MemberFacts person={person} />
              <Biography person={person} />
            </div>
          </div>
          <div className="ta-focus-band">
            <span>Su enfoque</span>
            <p>{person.focus}</p>
          </div>
        </>
      )}
      {direction === "atlas" && (
        <>
          <ProfileHeading person={person} />
          <div className="ta-profile-orbit">
            <div className="ta-orbit-ring" aria-hidden="true" />
            <div className="ta-orbit-label ta-orbit-role">
              <Eyebrow>Su especialidad</Eyebrow>
              <p>{person.role}</p>
            </div>
            <Portrait person={person} priority />
            <div className="ta-orbit-label ta-orbit-year">
              <Eyebrow>Su recorrido</Eyebrow>
              <p>
                {joinedYear(person)
                  ? `Desde ${joinedYear(person)}`
                  : "En BinPar"}
              </p>
            </div>
            <div className="ta-orbit-label ta-orbit-focus">
              <Eyebrow>Su enfoque</Eyebrow>
              <p>{person.focus}</p>
            </div>
          </div>
          <div className="ta-orbit-biography">
            <span className="ta-large-number" aria-hidden="true">
              {number(person)}
            </span>
            <Biography person={person} />
          </div>
          <Related person={person} direction={direction} navigate={navigate} />
        </>
      )}
      {direction === "indice" && (
        <div className="ta-index-profile">
          <aside>
            <Portrait person={person} priority />
            <div className="ta-stage-label">
              <span>BinPar / {person.area}</span>
              <span>{number(person)} — 16</span>
            </div>
          </aside>
          <div>
            <ProfileHeading person={person} />
            <MemberFacts person={person} />
            <Biography person={person} />
            <div className="ta-person-focus">
              <Eyebrow>Su enfoque</Eyebrow>
              <p>{person.focus}</p>
            </div>
          </div>
        </div>
      )}
      {direction === "mesa" && (
        <div className="ta-dossier">
          <div className="ta-dossier-photo">
            <span className="ta-paper-clip" aria-hidden="true" />
            <Portrait person={person} priority />
            <span className="ta-dossier-photo-label">
              Personas que construyen / {number(person)}
            </span>
          </div>
          <div className="ta-dossier-title">
            <Eyebrow>Cuaderno de equipo / {number(person)}</Eyebrow>
            <ProfileHeading person={person} />
            <MemberFacts person={person} />
          </div>
          <div className="ta-dossier-story">
            <Biography person={person} />
          </div>
          <div className="ta-dossier-note">
            <Eyebrow>Una forma de trabajar</Eyebrow>
            <p>{person.focus}</p>
            <Plus size={27} strokeWidth={1.2} aria-hidden="true" />
          </div>
        </div>
      )}
      {direction === "secuencia" && (
        <>
          <ProfileHeading person={person} />
          <div className="ta-story">
            <div className="ta-story-visual" data-active-chapter={chapter}>
              <Portrait person={person} priority />
              <span className="ta-story-counter">
                {String(chapter + 1).padStart(2, "0")} /{" "}
                {String(person.paragraphs.length).padStart(2, "0")}
              </span>
              <p>{person.intro}</p>
            </div>
            <div className="ta-story-chapters">
              {person.paragraphs.map((paragraph, index) => (
                <section key={paragraph} data-chapter={index}>
                  <Eyebrow>
                    {String(index + 1).padStart(2, "0")} /{" "}
                    {index === 0
                      ? "El punto de partida"
                      : index === person.paragraphs.length - 1
                        ? "Una forma de trabajar"
                        : "El recorrido"}
                  </Eyebrow>
                  {index === 0 && <h2>{person.intro}</h2>}
                  <p>{paragraph}</p>
                  {index === person.paragraphs.length - 1 && (
                    <MemberFacts person={person} />
                  )}
                </section>
              ))}
            </div>
          </div>
        </>
      )}
      <div className="ta-source-line">
        <span>Biografía adaptada de la información pública de BinPar.</span>
        <a href={person.sourceUrl} target="_blank" rel="noreferrer">
          Leer la biografía original <Arrow />
        </a>
      </div>
      <nav className="ta-profile-pagination" aria-label="Otras personas">
        <MemberLink person={previous} direction={direction} navigate={navigate}>
          <Arrow back />
          <span>
            <small>Anterior</small>
            {previous.name}
          </span>
        </MemberLink>
        <MemberLink person={next} direction={direction} navigate={navigate}>
          <span>
            <small>Siguiente</small>
            {next.name}
          </span>
          <Arrow />
        </MemberLink>
      </nav>
    </article>
  );
}
export function TeamLab({
  direction,
  context,
  replay,
  initialMember,
}: {
  direction: TeamDirection;
  context: boolean;
  replay: number;
  initialMember?: string;
}) {
  const [slug, setSlug] = useState<string | undefined>(initialMember);
  const [area, setArea] = useState<TeamArea>("Todas");
  const returnPosition = useRef({ y: 0, slug: "" });
  const root = useRef<HTMLElement>(null);
  const person = teamMembers.find((member) => member.slug === slug);
  const selected = teamDirections.find((item) => item.id === direction)!;
  const members = teamMembers.filter(
    (member) => area === "Todas" || member.area === area,
  );
  useEffect(() => {
    const sync = () => {
      setSlug(
        new URL(window.location.href).searchParams.get("member") ?? undefined,
      );
      const history = window.history.state as {
        astraY?: number;
        astraFocus?: string;
      } | null;
      window.requestAnimationFrame(() =>
        window.requestAnimationFrame(() => {
          if (history?.astraFocus)
            root.current
              ?.querySelector<HTMLElement>(
                `[data-member-link="${history.astraFocus}"]`,
              )
              ?.focus({ preventScroll: true });
          else
            root.current
              ?.querySelector<HTMLElement>("[data-astra-heading]")
              ?.focus({ preventScroll: true });
          if (typeof history?.astraY === "number")
            window.scrollTo({ top: history.astraY, behavior: "instant" });
        }),
      );
    };
    setSlug(
      new URL(window.location.href).searchParams.get("member") ?? undefined,
    );
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);
  const navigate: Navigate = (next) => {
    if (!person && next)
      returnPosition.current = { y: window.scrollY, slug: next };
    const history = (window.history.state ?? {}) as Record<string, unknown>;
    window.history.replaceState(
      {
        ...history,
        astraY: window.scrollY,
        astraFocus: !person ? next : undefined,
      },
      "",
    );
    const url = new URL(window.location.href);
    url.searchParams.set("lab", "team");
    url.searchParams.set("teamVariant", direction);
    if (next) url.searchParams.set("member", next);
    else url.searchParams.delete("member");
    url.hash = "team-preview";
    window.history.pushState({}, "", url);
    setSlug(next);
    window.requestAnimationFrame(() =>
      window.requestAnimationFrame(() => {
        if (!next && returnPosition.current.slug) {
          root.current
            ?.querySelector<HTMLElement>(
              `[data-member-link="${returnPosition.current.slug}"]`,
            )
            ?.focus({ preventScroll: true });
          window.scrollTo({
            top: returnPosition.current.y,
            behavior: "instant",
          });
        } else {
          root.current
            ?.querySelector<HTMLElement>("[data-astra-heading]")
            ?.focus({ preventScroll: true });
          document
            .getElementById("team-preview")
            ?.scrollIntoView({ behavior: "instant", block: "start" });
        }
      }),
    );
  };
  return (
    <main
      ref={root}
      className={`ta-root ta-direction-${direction}`}
      aria-label="Team Astra"
    >
      <div className="ta-lab-note">
        <span className="ta-lab-name">
          Team Astra{" "}
          <span>
            / {selected.number} {selected.label}
          </span>
        </span>
        <span>
          Retratos ficticios de referencia · Personas y biografías reales
        </span>
        {context && (
          <details>
            <summary>
              Sobre esta dirección <Plus size={13} aria-hidden="true" />
            </summary>
            <p>
              {selected.description} Inspiración:{" "}
              <a href={selected.url} target="_blank" rel="noreferrer">
                {selected.reference} <Arrow />
              </a>
              . Fotografía conceptual generada para explorar la dirección de
              arte; no representa el aspecto de los miembros del equipo.
            </p>
          </details>
        )}
      </div>
      <div className="ta-site-bar">
        <Link href="/" aria-label="BinPar, inicio">
          <Image
            src="/logos/binpar-brand/binpar-logo-light.svg"
            alt="BinPar"
            width={130}
            height={40}
            className="dark:hidden"
          />
          <Image
            src="/logos/binpar-brand/binpar-logo-dark.svg"
            alt="BinPar"
            width={130}
            height={40}
            className="hidden dark:block"
          />
        </Link>
        <span>Personas que hacen posible la tecnología.</span>
        <Link href="/contacto" className="ta-text-link">
          Hablemos <Arrow />
        </Link>
      </div>
      <section
        id="team-preview"
        className="ta-preview"
        key={`${direction}-${replay}`}
      >
        {person ? (
          <Profile
            key={person.slug}
            person={person}
            direction={direction}
            navigate={navigate}
          />
        ) : (
          <>
            <DirectoryHeader direction={direction} />
            <div className="ta-directory-tools">
              <Filters selected={area} onSelect={setArea} />
              <span aria-live="polite">{members.length} personas</span>
            </div>
            {direction === "encuadre" ? (
              <Encuadre
                direction={direction}
                navigate={navigate}
                members={members}
              />
            ) : direction === "atlas" ? (
              <Atlas
                direction={direction}
                navigate={navigate}
                members={members}
              />
            ) : direction === "indice" ? (
              <Indice
                direction={direction}
                navigate={navigate}
                members={members}
              />
            ) : direction === "mesa" ? (
              <Mesa
                direction={direction}
                navigate={navigate}
                members={members}
              />
            ) : (
              <Secuencia
                key={area}
                direction={direction}
                navigate={navigate}
                members={members}
              />
            )}
          </>
        )}
        <footer className="ta-contact">
          <div>
            <Eyebrow>La próxima conversación</Eyebrow>
            <h2>Conozcámonos.</h2>
            <p>
              Cuéntanos qué quieres construir.
              <br />
              Empecemos por escucharte.
            </p>
          </div>
          <Link href="/contacto">
            Hablar con el equipo <Arrow />
          </Link>
          <span className="ta-contact-signature">
            BinPar
            <br />
            <small>Personas. Ideas. Tecnología.</small>
          </span>
        </footer>
      </section>
    </main>
  );
}
