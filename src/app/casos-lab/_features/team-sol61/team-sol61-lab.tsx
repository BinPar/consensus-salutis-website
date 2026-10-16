"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import { VerticalFooter } from "~/app/_components/site-footer";
import {
  getTeamSol61Member,
  teamSol61Members,
  teamSol61SourceDate,
  type TeamSol61Area,
} from "./team-sol61-data";
import {
  teamSol61Directions,
  type TeamSol61Direction,
} from "./team-sol61-directions";
import {
  parseTeamSol61State,
  teamSol61Url,
  type TeamSol61View,
} from "./team-sol61-state";
import {
  ChaptersTeam,
  EditorialTeam,
  FocusTeam,
  IndexTeam,
  WeaveTeam,
} from "./team-sol61-team-views";
import {
  ChaptersProfile,
  EditorialProfile,
  FocusProfile,
  IndexProfile,
  WeaveProfile,
} from "./team-sol61-profile-views";
import { PreviewHeader } from "./team-sol61-visuals";
import "./team-sol61.css";

export function TeamSol61Lab({
  direction,
  context,
  replay,
  initialView = "team",
  initialMember = "adrian-rodriguez",
}: {
  direction: TeamSol61Direction;
  context: boolean;
  replay: number;
  initialView?: TeamSol61View;
  initialMember?: string;
}) {
  const [view, setView] = useState<TeamSol61View>(initialView);
  const [selected, setSelected] = useState(
    getTeamSol61Member(initialMember).slug,
  );
  const [area, setArea] = useState<TeamSol61Area | "Todos">("Todos");
  const root = useRef<HTMLDivElement>(null);
  const toolbar = useRef<HTMLDivElement>(null);
  const preview = useRef<HTMLElement>(null);
  const listScroll = useRef<number | null>(null);
  const member = getTeamSol61Member(selected);
  const proposal = teamSol61Directions.find((item) => item.id === direction)!;

  useEffect(() => {
    const sync = () => {
      const state = parseTeamSol61State(
        new URL(window.location.href).searchParams,
      );
      setView(state.view);
      setSelected(state.member);
    };
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  useLayoutEffect(() => {
    const element = toolbar.current;
    if (!element) return;
    const measure = () =>
      root.current?.style.setProperty(
        "--team-toolbar-height",
        `${element.getBoundingClientRect().height}px`,
      );
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  function change(
    nextView: TeamSol61View,
    nextMember = selected,
    options: { replace?: boolean; restore?: boolean; scroll?: boolean } = {},
  ) {
    if (view === "team" && nextView === "profile")
      listScroll.current = window.scrollY;
    const next = teamSol61Url(new URL(window.location.href), {
      direction,
      view: nextView,
      member: nextMember,
    });
    if (next.href !== window.location.href) {
      if (options.replace) window.history.replaceState(null, "", next);
      else window.history.pushState(null, "", next);
    }
    setView(nextView);
    setSelected(getTeamSol61Member(nextMember).slug);
    window.requestAnimationFrame(() => {
      if (options.restore && listScroll.current !== null) {
        window.scrollTo({ top: listScroll.current, behavior: "instant" });
        preview.current
          ?.querySelector<HTMLElement>(`[data-team-member="${nextMember}"]`)
          ?.focus({ preventScroll: true });
      } else if (options.scroll !== false) {
        const rect = preview.current?.getBoundingClientRect();
        const header =
          document
            .querySelector("[data-cases-lab-header]")
            ?.getBoundingClientRect().height ?? 72;
        if (rect)
          window.scrollTo({
            top:
              window.scrollY +
              rect.top -
              header -
              (toolbar.current?.getBoundingClientRect().height ?? 0) -
              24,
            behavior: "instant",
          });
        preview.current
          ?.querySelector<HTMLElement>("h1")
          ?.focus({ preventScroll: true });
      }
    });
  }

  function open(event: MouseEvent<HTMLAnchorElement>, slug: string) {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    change("profile", slug);
  }

  const common = { direction, onOpen: open };
  const profile = {
    ...common,
    member,
    onBack: () => change("team", selected, { restore: true }),
    onSelect: (next: typeof member) =>
      change("profile", next.slug, { scroll: false }),
  };
  const TeamViews = {
    editorial: <EditorialTeam {...common} />,
    index: (
      <IndexTeam {...common} member={member} area={area} setArea={setArea} />
    ),
    weave: <WeaveTeam {...common} area={area} setArea={setArea} />,
    chapters: <ChaptersTeam {...common} />,
    focus: (
      <FocusTeam
        {...common}
        member={member}
        onSelect={(next) =>
          change("team", next.slug, { replace: true, scroll: false })
        }
      />
    ),
  };
  const ProfileViews = {
    editorial: <EditorialProfile {...profile} />,
    index: <IndexProfile {...profile} />,
    weave: <WeaveProfile {...profile} />,
    chapters: <ChaptersProfile {...profile} />,
    focus: <FocusProfile {...profile} />,
  };

  return (
    <div
      ref={root}
      className="ts-lab"
      data-team-sol61-direction={direction}
      data-team-sol61-view={view}
    >
      <div ref={toolbar} data-team-sol61-toolbar className="ts-toolbar">
        <div className="ts-toolbar-group">
          <div
            className="ts-view-switch"
            role="group"
            aria-label="Vista de la propuesta"
          >
            <button
              type="button"
              aria-pressed={view === "team"}
              onClick={() => change("team", selected, { restore: true })}
            >
              Equipo
            </button>
            <button
              type="button"
              aria-pressed={view === "profile"}
              onClick={() => change("profile")}
            >
              Ficha individual
            </button>
          </div>
          <select
            aria-label="Miembro del equipo"
            value={selected}
            onChange={(event) => change("profile", event.target.value)}
          >
            {teamSol61Members.map((item) => (
              <option value={item.slug} key={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <p className="ts-lab-note">
          Fotografía conceptual · Estudio de dirección gráfica
        </p>
      </div>
      {context && (
        <details className="ts-context">
          <summary>
            {proposal.number} · {proposal.label} — Sobre esta propuesta
          </summary>
          <div className="ts-context-body">
            <div>
              <p>{proposal.description}</p>
              <a
                href={proposal.reference}
                target="_blank"
                rel="noopener noreferrer"
              >
                {proposal.referenceLabel} ↗
              </a>
              <p>
                Explora también{" "}
                <a
                  href="https://koto.com/about"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Koto
                </a>{" "}
                y{" "}
                <a
                  href="https://locomotive.ca/en/agency"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Locomotive
                </a>
                .
              </p>
            </div>
            <div>
              <p>
                Los retratos y las escenas muestran personas ficticias para
                estudiar la dirección fotográfica; no son fotografías reales del
                equipo de BinPar.
              </p>
              <p>
                Los nombres, cargos y fechas proceden de las{" "}
                <a
                  href="https://www.binpar.com/team"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  fichas públicas de BinPar
                </a>
                , capturadas el {teamSol61SourceDate}. Las biografías se han
                adaptado a un tono profesional sin añadir credenciales.{" "}
                <a
                  href={member.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Consultar la fuente de {member.name} ↗
                </a>
              </p>
              <p>
                Ámbitos utilizados como clasificación editorial, no como
                organigrama oficial.
              </p>
            </div>
          </div>
        </details>
      )}
      <main
        ref={preview}
        id="team-sol6-1-preview"
        className="ts-preview"
        aria-label={`Propuesta ${proposal.label}: ${view === "team" ? "equipo" : member.name}`}
      >
        {context && (
          <PreviewHeader
            direction={direction}
            onTeam={(event) => {
              if (
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey
              )
                return;
              event.preventDefault();
              change("team", selected, { restore: true });
            }}
          />
        )}
        <div className="ts-enter" key={`${direction}-${view}-${replay}`}>
          {view === "team" ? TeamViews[direction] : ProfileViews[direction]}
        </div>
      </main>
      {context && <VerticalFooter />}
    </div>
  );
}
