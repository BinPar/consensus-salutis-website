"use client";

import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  MoveDownRight,
} from "lucide-react";
import { useRef, useState, type KeyboardEvent } from "react";
import {
  teamSol61AreaCopy,
  teamSol61Areas,
  teamSol61Members,
  type TeamSol61Area,
  type TeamSol61Member,
} from "./team-sol61-data";
import {
  AreaFilter,
  Eyebrow,
  ExploreLink,
  MemberLink,
  PageEnd,
  Portrait,
  Scene,
  type TeamViewProps,
} from "./team-sol61-visuals";

export function EditorialTeam(props: TeamViewProps) {
  return (
    <>
      <section className="ts-editorial-intro ts-container">
        <div className="ts-editorial-heading">
          <Eyebrow>Las personas detrás de la tecnología</Eyebrow>
          <h1 tabIndex={-1} className="ts-display font-display">
            El criterio
            <br />
            es <em>humano.</em>
          </h1>
          <p className="ts-lede">
            La tecnología avanza cuando las personas se implican. Conoce al
            equipo que da forma a BinPar.
          </p>
          <ExploreLink target="ts-editorial-people">
            Conoce al equipo
          </ExploreLink>
          <div className="ts-editorial-count">
            <strong className="font-display">16</strong>
            <span>
              personas.
              <br />
              Una forma de hacer.
            </span>
          </div>
        </div>
        <div className="ts-editorial-covers">
          <MemberLink
            {...props}
            member={teamSol61Members[9]!}
            className="ts-cover-large"
          >
            <Portrait key="content-0" member={teamSol61Members[9]!} priority />
            <span key="content-1">
              <b>Adrián Rodríguez</b>Front End
              <ArrowUpRight size={17} strokeWidth={1.8} />
            </span>
          </MemberLink>
          <MemberLink
            {...props}
            member={teamSol61Members[6]!}
            className="ts-cover-small"
          >
            <Portrait key="content-0" member={teamSol61Members[6]!} priority />
            <span key="content-1">
              <b>Beatriz Ortega</b>Analyst
              <ArrowUpRight size={17} strokeWidth={1.8} />
            </span>
          </MemberLink>
          <span className="ts-editorial-side-note">
            BINPAR · PERSONAS Y TECNOLOGÍA
          </span>
        </div>
      </section>
      <section
        id="ts-editorial-people"
        className="ts-editorial-people ts-container"
      >
        <div className="ts-section-heading">
          <div>
            <Eyebrow>Un equipo, distintas perspectivas</Eyebrow>
            <h2 className="font-display">
              Mucho más que
              <br />
              la suma de las partes.
            </h2>
          </div>
          <p>
            Dirección, ingeniería, análisis y personas.
            <br />
            Una mirada compartida sobre cada proyecto.
          </p>
        </div>
        <div className="ts-editorial-grid">
          {teamSol61Members.map((member, index) => (
            <MemberLink
              {...props}
              member={member}
              key={member.slug}
              className="ts-editorial-person"
            >
              <Portrait key="content-0" member={member} />
              <div key="content-1" className="ts-person-caption">
                <span className="ts-ordinal">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display">{member.name}</h3>
                  <p>{member.role}</p>
                </div>
                <ArrowUpRight size={18} strokeWidth={1.8} aria-hidden="true" />
              </div>
            </MemberLink>
          ))}
        </div>
      </section>
      <PageEnd />
    </>
  );
}

export function IndexTeam(
  props: TeamViewProps & {
    member: TeamSol61Member;
    area: TeamSol61Area | "Todos";
    setArea: (area: TeamSol61Area | "Todos") => void;
  },
) {
  const { area, setArea } = props;
  const [hovered, setHovered] = useState(props.member);
  const members = teamSol61Members.filter(
    (member) => area === "Todos" || member.area === area,
  );
  return (
    <div className="ts-index-team">
      <div className="ts-container">
        <section className="ts-index-intro">
          <Eyebrow>Personas con nombre propio</Eyebrow>
          <div>
            <h1 tabIndex={-1} className="ts-display font-display">
              Detrás.<sup>16</sup>
            </h1>
            <p className="ts-lede">
              Conoce quién está al otro lado.
              <br />Y qué aporta al conjunto.
            </p>
          </div>
        </section>
        <AreaFilter area={area} onChange={setArea} />
        <section className="ts-index-layout" aria-label="Directorio del equipo">
          <aside className="ts-index-preview" aria-label="Persona destacada">
            <div key={hovered.slug} className="ts-image-fade">
              <Portrait member={hovered} priority />
              <div className="ts-index-image-caption">
                <span>{hovered.area}</span>
                <ArrowUpRight size={20} strokeWidth={1.8} />
              </div>
            </div>
            <p className="ts-index-focus">{hovered.focus}</p>
            <MemberLink {...props} member={hovered} className="ts-text-link">
              Conocer a {hovered.name.split(" ")[0]}
              <ArrowRight key="content-0" size={16} strokeWidth={1.8} />
            </MemberLink>
          </aside>
          <div className="ts-index-rows">
            <div className="ts-index-columns">
              <span>Nombre</span>
              <span>Función</span>
            </div>
            {members.map((member) => (
              <MemberLink
                {...props}
                member={member}
                key={member.slug}
                className="ts-index-row"
                onMouseEnter={() => setHovered(member)}
                onFocus={() => setHovered(member)}
              >
                <span key="content-0" className="ts-index-number">
                  {String(member.portrait + 1).padStart(2, "0")}
                </span>
                <span key="content-1" className="ts-index-name font-display">
                  {member.name}
                </span>
                <span key="content-2" className="ts-index-role">
                  {member.role}
                </span>
                <ArrowUpRight
                  key="content-3"
                  size={18}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </MemberLink>
            ))}
          </div>
        </section>
      </div>
      <PageEnd />
    </div>
  );
}

export function WeaveTeam(
  props: TeamViewProps & {
    area: TeamSol61Area | "Todos";
    setArea: (area: TeamSol61Area | "Todos") => void;
  },
) {
  const { area, setArea } = props;
  return (
    <div className="ts-weave-team">
      <section className="ts-weave-intro ts-container">
        <Eyebrow>La fuerza del conjunto</Eyebrow>
        <h1 tabIndex={-1} className="ts-display font-display">
          Distintas miradas.
          <br />
          <em>Una misma trama.</em>
        </h1>
        <p className="ts-lede">
          Cada persona aporta una perspectiva. Juntas, dan forma a nuestra
          manera de construir tecnología.
        </p>
        <div className="ts-weave-portrait-line">
          {[0, 6, 9, 7, 14].map((index) => (
            <MemberLink
              {...props}
              member={teamSol61Members[index]!}
              key={index}
              className="ts-weave-intro-person"
            >
              <Portrait
                key="content-0"
                member={teamSol61Members[index]!}
                priority
              />
              <span key="content-1">
                {teamSol61Members[index]!.name.split(" ")[0]}
              </span>
            </MemberLink>
          ))}
          <span className="ts-weave-more">
            +11
            <br />
            <small>perspectivas</small>
          </span>
        </div>
      </section>
      <section
        className="ts-container ts-weave-board"
        aria-label="Personas por ámbito profesional"
      >
        <AreaFilter area={area} onChange={setArea} />
        <div className="ts-weave-hub">
          <Image
            src="/logos/binpar-brand/binpar-isotipo-light.svg"
            alt=""
            width={34}
            height={38}
            style={{ width: 34, height: "auto" }}
            className="dark:hidden"
          />
          <Image
            src="/logos/binpar-brand/binpar-isotipo-dark.svg"
            alt=""
            width={34}
            height={38}
            style={{ width: 34, height: "auto" }}
            className="hidden dark:block"
          />
          <span className="font-display">
            BinPar<small>Un equipo conectado</small>
          </span>
        </div>
        <div className="ts-weave-columns">
          {teamSol61Areas.map((item) => (
            <div
              className="ts-weave-column"
              key={item}
              data-muted={area !== "Todos" && area !== item}
            >
              <div className="ts-weave-area">
                <span>{teamSol61AreaCopy[item].number}</span>
                <h2 className="font-display">{item}</h2>
                <small>
                  {
                    teamSol61Members.filter((member) => member.area === item)
                      .length
                  }{" "}
                  {teamSol61Members.filter((member) => member.area === item)
                    .length === 1
                    ? "persona"
                    : "personas"}
                </small>
              </div>
              {teamSol61Members
                .filter((member) => member.area === item)
                .map((member) => (
                  <MemberLink
                    {...props}
                    member={member}
                    key={member.slug}
                    className="ts-weave-member"
                  >
                    <Portrait key="content-0" member={member} />
                    <div key="content-1">
                      <h3>{member.name}</h3>
                      <p>{member.role}</p>
                    </div>
                    <ArrowUpRight
                      key="content-2"
                      size={14}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                  </MemberLink>
                ))}
            </div>
          ))}
        </div>
        <p className="ts-board-caption">
          Ámbitos profesionales que se complementan. Selecciona a una persona
          para conocer su perfil.
        </p>
      </section>
      <PageEnd />
    </div>
  );
}

export function ChaptersTeam(props: TeamViewProps) {
  return (
    <div className="ts-chapters-team">
      <section className="ts-chapters-intro ts-container">
        <Eyebrow>Un equipo, cuatro capítulos</Eyebrow>
        <div className="ts-chapters-intro-line">
          <h1 tabIndex={-1} className="ts-display font-display">
            Así se construye
            <br />
            <em>lo que importa.</em>
          </h1>
          <p className="ts-lede">
            Personas que piensan, conectan y dan forma.
            <br />
            Conoce cómo se complementan.
          </p>
        </div>
        <Scene scene="direction" priority className="ts-chapters-cover" />
        <nav className="ts-chapters-nav" aria-label="Capítulos del equipo">
          {teamSol61Areas.map((area) => (
            <ExploreLink
              key={area}
              target={`ts-chapter-${teamSol61AreaCopy[area].number}`}
            >
              <span>{teamSol61AreaCopy[area].number}</span>
              {area}
            </ExploreLink>
          ))}
        </nav>
      </section>
      {teamSol61Areas.map((area) => {
        const copy = teamSol61AreaCopy[area];
        return (
          <section
            id={`ts-chapter-${copy.number}`}
            className="ts-chapter"
            key={area}
          >
            <div className="ts-container ts-chapter-layout">
              <div className="ts-chapter-visual">
                <Scene scene={copy.scene} />
                <span className="ts-chapter-number font-display">
                  {copy.number}
                </span>
                <p>{area} · BinPar</p>
              </div>
              <div className="ts-chapter-content">
                <Eyebrow>{area}</Eyebrow>
                <h2 className="font-display">{copy.title}</h2>
                <p className="ts-lede">{copy.description}</p>
                <div className="ts-chapter-members">
                  {teamSol61Members
                    .filter((member) => member.area === area)
                    .map((member) => (
                      <MemberLink
                        {...props}
                        member={member}
                        key={member.slug}
                        className="ts-chapter-member"
                      >
                        <Portrait key="content-0" member={member} />
                        <div key="content-1">
                          <h3 className="font-display">{member.name}</h3>
                          <p>{member.role}</p>
                        </div>
                        <ArrowUpRight
                          key="content-2"
                          size={18}
                          strokeWidth={1.8}
                          aria-hidden="true"
                        />
                      </MemberLink>
                    ))}
                </div>
              </div>
            </div>
          </section>
        );
      })}
      <PageEnd />
    </div>
  );
}

export function Filmstrip({
  member,
  onSelect,
}: {
  member: TeamSol61Member;
  onSelect: (member: TeamSol61Member) => void;
}) {
  const strip = useRef<HTMLDivElement>(null);
  const index = teamSol61Members.indexOf(member);
  function move(event: KeyboardEvent<HTMLButtonElement>, position: number) {
    const nextIndex =
      event.key === "ArrowRight"
        ? (position + 1) % teamSol61Members.length
        : event.key === "ArrowLeft"
          ? (position - 1 + teamSol61Members.length) % teamSol61Members.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? teamSol61Members.length - 1
              : -1;
    if (nextIndex < 0) return;
    event.preventDefault();
    onSelect(teamSol61Members[nextIndex]!);
    strip.current
      ?.querySelectorAll("button")
      [nextIndex]?.focus({ preventScroll: true });
    strip.current
      ?.querySelectorAll("button")
      [
        nextIndex
      ]?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
  }
  return (
    <div className="ts-filmstrip-shell">
      <div className="ts-filmstrip-meta">
        <span>El equipo, persona a persona</span>
        <span>{String(index + 1).padStart(2, "0")} / 16</span>
      </div>
      <div
        className="ts-filmstrip"
        ref={strip}
        role="group"
        aria-label="Seleccionar persona"
      >
        {teamSol61Members.map((item, position) => (
          <button
            type="button"
            key={item.slug}
            aria-pressed={member.slug === item.slug}
            aria-label={`Ver a ${item.name}`}
            onClick={() => onSelect(item)}
            onKeyDown={(event) => move(event, position)}
          >
            <Portrait member={item} />
            <span>{item.name.split(" ")[0]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function FocusTeam(
  props: TeamViewProps & {
    member: TeamSol61Member;
    onSelect: (member: TeamSol61Member) => void;
  },
) {
  const { member, onSelect } = props;
  const index = teamSol61Members.indexOf(member);
  return (
    <>
      <section className="ts-focus-stage">
        <div className="ts-container">
          <div className="ts-focus-intro">
            <Eyebrow>El valor está en las personas</Eyebrow>
            <h1 tabIndex={-1} className="font-display">
              Conocer cambia
              <br />
              la <em>perspectiva.</em>
            </h1>
            <MoveDownRight size={40} strokeWidth={1} aria-hidden="true" />
          </div>
          <div className="ts-focus-person" key={member.slug}>
            <div className="ts-focus-photo">
              <Portrait member={member} priority />
              <span className="ts-focus-photo-index font-display">
                {String(index + 1).padStart(2, "0")}
                <small>/ 16</small>
              </span>
            </div>
            <div className="ts-focus-copy">
              <Eyebrow>{member.area}</Eyebrow>
              <h2 className="font-display">{member.name}</h2>
              <p className="ts-focus-role">{member.role}</p>
              <p className="ts-focus-description">{member.intro}</p>
              <MemberLink
                {...props}
                member={member}
                className="ts-focus-profile-link"
              >
                Conoce su historia
                <ArrowUpRight
                  key="content-0"
                  size={22}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </MemberLink>
              <div className="ts-focus-arrows">
                <button
                  aria-label="Persona anterior"
                  type="button"
                  onClick={() => onSelect(teamSol61Members[(index + 15) % 16]!)}
                >
                  <ArrowLeft size={20} strokeWidth={1.8} />
                </button>
                <button
                  aria-label="Persona siguiente"
                  type="button"
                  onClick={() => onSelect(teamSol61Members[(index + 1) % 16]!)}
                >
                  <ArrowRight size={20} strokeWidth={1.8} />
                </button>
              </div>
            </div>
          </div>
          <Filmstrip member={member} onSelect={onSelect} />
        </div>
      </section>
      <section className="ts-container ts-focus-directory">
        <Eyebrow>16 personas, una forma de hacer</Eyebrow>
        <h2 className="font-display">Encuentra a cada persona.</h2>
        <div>
          {teamSol61Members.map((item) => (
            <MemberLink {...props} member={item} key={item.slug}>
              <span key="content-0">{item.name}</span>
              <small key="content-1">{item.role}</small>
              <ArrowUpRight key="content-2" size={14} strokeWidth={1.8} />
            </MemberLink>
          ))}
        </div>
      </section>
      <PageEnd />
    </>
  );
}
