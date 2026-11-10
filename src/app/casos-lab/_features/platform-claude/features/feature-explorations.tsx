"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { ArrowDown, ChevronDown } from "lucide-react";
import {
  consultationGroup,
  evidenceGroup,
  formatsGroup,
  workspaceGroup,
  governanceGroup,
  type FeatureMockId,
} from "./features-data";
import {
  FeatureCopy,
  GroupLabel,
  allFeatures,
  eyebrow,
  features,
} from "./feature-shared";
import { EvidenceScene } from "./scenes/feature-scene";

const sceneLabel = (index: number) =>
  `${features[index]!.title}. ${features[index]!.description}`;

/** Scenes stacked in one grid cell: only the active one is shown and plays. */
function SceneStack({
  active,
  onFinish,
}: {
  active: number;
  onFinish?: () => void;
}) {
  return (
    <div className="grid">
      {features.map((feature, index) => (
        <div
          key={feature.number}
          aria-hidden={active !== index}
          inert={active !== index}
          className={`transition-opacity duration-300 [grid-area:1/1] motion-reduce:transition-none ${active === index ? "opacity-100" : "pointer-events-none opacity-0"}`}
        >
          <EvidenceScene
            feature={feature.mock}
            label={sceneLabel(index)}
            active={active === index}
            onFinish={active === index ? onFinish : undefined}
          />
        </div>
      ))}
    </div>
  );
}

/*
 * 05 · Guiado: compact index and a single stage. When a scene ends the next one
 * starts after a short pause, once through the group; choosing an item hands
 * control to the reader and stops the automatic advance.
 */
export function GuidedLayout() {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const advance = useCallback(() => {
    if (!auto) return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setActive((current) =>
        current < features.length - 1 ? current + 1 : current,
      );
    }, 1400);
  }, [auto]);

  const choose = (index: number) => {
    window.clearTimeout(timer.current);
    setAuto(false);
    setActive(index);
  };

  return (
    <div className="mt-16 lg:mt-20">
      <GroupLabel />
      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_480px] lg:items-start lg:gap-16">
        <ol className="order-2 lg:order-1" aria-label={evidenceGroup.title}>
          {features.map((feature, index) => {
            const current = active === index;
            return (
              <li
                key={feature.number}
                className="border-b border-cyan-800/10 last:border-b-0 dark:border-cyan-300/10"
              >
                <button
                  type="button"
                  onClick={() => choose(index)}
                  aria-current={current ? "true" : undefined}
                  className={`focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark relative w-full py-4 pr-2 pl-5 text-left transition-opacity duration-300 focus-visible:outline-2 focus-visible:-outline-offset-2 motion-reduce:transition-none ${current ? "opacity-100" : "opacity-55 hover:opacity-90"}`}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute top-4 bottom-4 left-0 w-0.5 rounded-full transition-colors duration-300 ${current ? "bg-primary-light dark:bg-primary-dark" : "bg-transparent"}`}
                  />
                  {current ? (
                    <FeatureCopy feature={feature} />
                  ) : (
                    <span className="flex gap-4">
                      <span className="font-display text-primary-light dark:text-primary-dark pt-0.5 text-xs font-semibold tabular-nums">
                        {feature.number}
                      </span>
                      <span className="font-display text-navy text-base font-semibold tracking-tight dark:text-slate-50">
                        {feature.title}
                      </span>
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
        <div className="order-1 lg:sticky lg:top-[calc(var(--lab-toolbar-height,72px)+3rem)] lg:order-2">
          <SceneStack active={active} onFinish={advance} />
        </div>
      </div>
    </div>
  );
}

/*
 * 06 · Fuelle: seven panels in a row. The open one shows its scene and text;
 * the folded ones keep their number and a vertical title. Below 1024px it
 * becomes a vertical accordion.
 */
export function BellowsLayout() {
  const [active, setActive] = useState(0);
  return (
    <div className="mt-16 lg:mt-20">
      <GroupLabel />
      <div className="mt-10 flex flex-col gap-3 lg:h-[580px] lg:flex-row">
        {features.map((feature, index) => {
          const open = active === index;
          return (
            <section
              key={feature.number}
              aria-labelledby={`bellows-${feature.number}`}
              className={`relative min-w-0 rounded-3xl border transition-[flex-grow,flex-basis,background-color,border-color] duration-500 ease-out motion-reduce:transition-none ${open ? "overflow-visible border-transparent bg-transparent lg:shrink-0 lg:grow-0 lg:basis-[480px]" : "dark:border-primary-dark/15 overflow-hidden border-cyan-800/12 bg-white/60 hover:bg-white/90 lg:grow lg:basis-0 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"}`}
            >
              <h4 className="contents">
                <button
                  id={`bellows-${feature.number}`}
                  type="button"
                  onClick={() => setActive(index)}
                  aria-expanded={open}
                  className={`focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark flex w-full items-center gap-4 px-5 py-4 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 lg:h-full lg:flex-col lg:items-center lg:justify-between lg:px-0 lg:py-6 ${open ? "lg:hidden" : ""}`}
                >
                  <span className="font-display text-primary-light dark:text-primary-dark text-xs font-semibold tabular-nums">
                    {feature.number}
                  </span>
                  <span className="font-display text-navy text-base font-semibold tracking-tight whitespace-nowrap lg:rotate-180 lg:[writing-mode:vertical-rl] dark:text-slate-50">
                    {feature.title}
                  </span>
                </button>
              </h4>
              {open && (
                <div className="px-1 pb-4 motion-safe:animate-[visual-lab-pc-fade_450ms_ease-out_200ms_both] lg:absolute lg:inset-y-0 lg:left-0 lg:w-[480px] lg:px-0 lg:pb-0">
                  <EvidenceScene
                    feature={feature.mock}
                    label={sceneLabel(index)}
                  />
                  <div className="mt-3 px-1">
                    <FeatureCopy feature={feature} />
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

/*
 * 07 · Índice: an editorial list with large titles. Hovering or focusing a row
 * glides the scene alongside it; on small screens the row opens in place.
 */
export function IndexLayout() {
  const [active, setActive] = useState(0);
  const list = useRef<HTMLOListElement>(null);
  const rows = useRef<(HTMLLIElement | null)[]>([]);
  const [offset, setOffset] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const row = rows.current[active];
      const container = list.current;
      if (!row || !container) return;
      const stage = stageRef.current?.offsetHeight ?? 0;
      const centred = row.offsetTop + row.offsetHeight / 2 - stage / 2;
      setOffset(Math.max(0, Math.min(centred, container.offsetHeight - stage)));
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (list.current) observer.observe(list.current);
    return () => observer.disconnect();
  }, [active]);

  return (
    <div className="mt-16 lg:mt-20">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className={eyebrow}>Grupo {evidenceGroup.number}</p>
          <h3 className="font-display text-navy mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl dark:text-slate-50">
            {evidenceGroup.title}
          </h3>
        </div>
        <span className="font-body text-xs text-slate-500 dark:text-slate-400">
          {features.length} funcionalidades
        </span>
      </div>
      <div className="relative mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_480px] lg:gap-16">
        <ol
          ref={list}
          className="border-t border-cyan-800/10 dark:border-cyan-300/10"
        >
          {features.map((feature, index) => {
            const current = active === index;
            return (
              <li
                key={feature.number}
                ref={(element) => {
                  rows.current[index] = element;
                }}
                className="border-b border-cyan-800/10 dark:border-cyan-300/10"
              >
                <button
                  type="button"
                  onClick={() => setActive(index)}
                  onPointerEnter={(event) => {
                    if (event.pointerType === "mouse") setActive(index);
                  }}
                  onFocus={() => setActive(index)}
                  aria-expanded={current}
                  className="group focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark grid w-full grid-cols-[2.5rem_minmax(0,1fr)] items-baseline gap-x-4 py-6 text-left focus-visible:outline-2 focus-visible:-outline-offset-2"
                >
                  <span className="font-display text-primary-light dark:text-primary-dark text-xs font-semibold tabular-nums">
                    {feature.number}
                  </span>
                  <span
                    className={`font-display text-2xl font-semibold tracking-tight transition-colors duration-300 sm:text-3xl ${current ? "text-navy dark:text-slate-50" : "group-hover:text-navy text-slate-400 dark:text-slate-500 dark:group-hover:text-slate-200"}`}
                  >
                    {feature.title}
                  </span>
                  <span
                    className="col-start-2 grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none"
                    style={{
                      gridTemplateRows: current ? "1fr" : "0fr",
                      opacity: current ? 1 : 0,
                    }}
                  >
                    <span className="font-body min-h-0 overflow-hidden pt-3 text-base leading-7 text-slate-600 dark:text-slate-400">
                      {feature.description}
                      {feature.detail ? ` ${feature.detail}` : null}
                    </span>
                  </span>
                </button>
                {current && (
                  <div className="pb-8 lg:hidden">
                    <EvidenceScene
                      feature={feature.mock}
                      label={sceneLabel(index)}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
        <div className="relative hidden lg:block">
          <div
            ref={stageRef}
            className="absolute inset-x-0 top-0 transition-transform duration-500 ease-out motion-reduce:transition-none"
            style={{ transform: `translateY(${offset}px)` }}
          >
            <SceneStack active={active} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Reading steps from the «Recorrido» composition of the Plataforma lab.
type JourneyStepData = {
  id: string;
  number: string;
  title: string;
  description: string;
  features: FeatureMockId[];
};
const evidenceSteps: JourneyStepData[] = [
  {
    id: "answer",
    number: "01",
    title: "Seguir la cita.",
    description:
      "La lectura empieza en la respuesta. Cada afirmación permite llegar a la fuente que la respalda.",
    features: ["citations", "bibliography"],
  },
  {
    id: "document",
    number: "02",
    title: "Consultar el original.",
    description:
      "El documento se abre en su contexto, con la ubicación del pasaje y el estado de verificación del texto.",
    features: ["viewer", "verified", "provenance"],
  },
  {
    id: "history",
    number: "03",
    title: "Conservar la evidencia.",
    description:
      "La respuesta conserva lo que citó. Una actualización posterior se presenta con su propio aviso.",
    features: ["preserved", "updates"],
  },
];

const consultationSteps: JourneyStepData[] = [
  {
    id: "ask",
    number: "01",
    title: "Plantear la duda.",
    description:
      "La consulta se escribe como se formularía a un colega, con las imágenes que la acompañan y el modo de respuesta que pide cada caso.",
    features: ["natural", "images", "modes"],
  },
  {
    id: "committee",
    number: "02",
    title: "Consultar al comité.",
    description:
      "Cada especialidad revisa los documentos de su ámbito. Mientras se responde, se ve quién consulta qué y en qué páginas.",
    features: ["committee", "progress"],
  },
  {
    id: "continue",
    number: "03",
    title: "Precisar y continuar.",
    description:
      "Si falta un dato decisivo, se solicita antes de responder. Las preguntas siguientes parten de lo ya consultado.",
    features: ["clarify", "followup"],
  },
];

const formatsSteps: JourneyStepData[] = [
  {
    id: "order",
    number: "01",
    title: "Ordenar la respuesta.",
    description:
      "Un árbol de decisión o una tabla comparativa ordenan la respuesta sin separarla de sus fuentes.",
    features: ["schemes", "tables"],
  },
  {
    id: "guide",
    number: "02",
    title: "Mostrar la guía.",
    description:
      "Las figuras de los documentos aparecen en la respuesta y se abren en el panel lateral, junto a esquemas y fuentes.",
    features: ["figures", "panel"],
  },
  {
    id: "keep",
    number: "03",
    title: "Llevarse el esquema.",
    description:
      "Cada esquema se descarga como imagen y cuenta con un recorrido en texto para leerlo sin la parte gráfica.",
    features: ["download", "textalt"],
  },
];

const workspaceSteps: JourneyStepData[] = [
  {
    id: "organize",
    number: "01",
    title: "Organizar el trabajo.",
    description:
      "Las conversaciones se agrupan por tema y el historial se ordena para volver a cada consulta.",
    features: ["projects", "history"],
  },
  {
    id: "context",
    number: "02",
    title: "Dar contexto al proyecto.",
    description:
      "Instrucciones, documentos propios y respuestas guardadas acompañan a cada consulta del proyecto.",
    features: ["instructions", "private", "saved"],
  },
  {
    id: "reading",
    number: "03",
    title: "Ajustar la lectura.",
    description:
      "Extensión, idioma y tema se adaptan a cada profesional y se mantienen entre chats.",
    features: ["preferences", "languages", "theme"],
  },
];

const governanceSteps: JourneyStepData[] = [
  {
    id: "knowledge",
    number: "01",
    title: "Definir el conocimiento.",
    description:
      "Cada organización suma sus protocolos a la base común y mantiene el inventario de lo que consulta el comité.",
    features: ["corpus", "library"],
  },
  {
    id: "changes",
    number: "02",
    title: "Controlar los cambios.",
    description:
      "Ningún cambio entra en el corpus sin revisión, cada versión queda registrada y las preguntas de control vigilan la calidad.",
    features: ["review", "versions", "control"],
  },
  {
    id: "adapt",
    number: "03",
    title: "Adaptar la plataforma.",
    description:
      "Expertos, modos, valoraciones y marca se ajustan a cada organización.",
    features: ["committees", "rating", "brand"],
  },
];

/** A group told through the «Recorrido» composition. */
export type JourneyGroupData = {
  title: string;
  number: string;
  /** Title split in its two tones. */
  heading: [string, string];
  lead: string;
  navLabel: string;
  steps: JourneyStepData[];
};
export const journeyGroups = {
  evidence: {
    title: evidenceGroup.title,
    number: evidenceGroup.number,
    heading: ["Evidencia", "visible."],
    lead: "Cada afirmación remite al documento que la respalda. El pasaje se consulta en su contexto, con su procedencia y su vigencia a la vista.",
    navLabel: "Recorrido de la evidencia",
    steps: evidenceSteps,
  },
  consultation: {
    title: consultationGroup.title,
    number: consultationGroup.number,
    heading: ["Consulta", "clínica."],
    lead: "La duda se formula como en una sesión clínica. Cada especialidad revisa su corpus, el avance queda a la vista y la conversación conserva el caso.",
    navLabel: "Recorrido de la consulta",
    steps: consultationSteps,
  },
  formats: {
    title: formatsGroup.title,
    number: formatsGroup.number,
    heading: ["Formatos", "de respuesta."],
    lead: "La respuesta se presenta en el formato que mejor la explica. Esquemas, figuras y tablas conservan sus citas y se consultan en el panel lateral.",
    navLabel: "Recorrido de los formatos",
    steps: formatsSteps,
  },
  workspace: {
    title: workspaceGroup.title,
    number: workspaceGroup.number,
    heading: ["Espacio", "personal."],
    lead: "Cada profesional organiza sus consultas en proyectos con instrucciones y fuentes propias, y ajusta cómo se leen las respuestas.",
    navLabel: "Recorrido del espacio personal",
    steps: workspaceSteps,
  },
  governance: {
    title: governanceGroup.title,
    number: governanceGroup.number,
    heading: ["Gobierno", "institucional."],
    lead: "La organización decide qué documentos consulta el comité, revisa cada cambio antes de publicarlo y comprueba que la calidad de las respuestas se mantiene.",
    navLabel: "Recorrido del gobierno institucional",
    steps: governanceSteps,
  },
} satisfies Record<string, JourneyGroupData>;

export type JourneyVariant = "sidebar" | "index" | "bar" | "rows";

function JourneyStepHeader({
  step,
  group,
}: {
  step: JourneyStepData;
  group: JourneyGroupData;
}) {
  return (
    <>
      <div className="flex items-start gap-5">
        <span className="font-display text-primary-light dark:text-primary-dark text-5xl leading-none font-semibold tracking-[-0.06em] tabular-nums opacity-45">
          {step.number}
        </span>
        <div className="pt-1">
          <p className="font-display text-primary-light dark:text-primary-dark text-[9px] font-bold tracking-[0.18em] uppercase">
            {group.title}
          </p>
          <h3
            id={`journey-${step.id}-title`}
            className="font-display text-navy mt-1.5 text-2xl font-extrabold tracking-tight dark:text-slate-50"
          >
            {step.title}
          </h3>
        </div>
      </div>
      <p className="font-body mt-5 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-400">
        {step.description}
      </p>
    </>
  );
}

function JourneyFigures({
  step,
  variant,
}: {
  step: JourneyStepData;
  variant: JourneyVariant;
}) {
  const items = step.features.map((id) =>
    allFeatures.find((feature) => feature.mock === id)!,
  );
  const label = (feature: (typeof items)[number]) =>
    `${feature.title}. ${feature.description}`;
  // Recorrido 4: one scene per row, its text alongside.
  if (variant === "rows")
    return (
      <div className="mt-10 flex flex-col gap-12">
        {items.map((feature) => (
          <figure
            key={feature.number}
            className="m-0 grid gap-5 xl:grid-cols-[480px_minmax(0,1fr)] xl:items-center xl:gap-8"
          >
            <EvidenceScene feature={feature.mock} label={label(feature)} />
            <figcaption className="px-1 xl:px-0 xl:pb-12">
              <FeatureCopy feature={feature} numbered={false} />
            </figcaption>
          </figure>
        ))}
      </div>
    );
  return (
    <div
      className={`mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 ${variant === "bar" ? "lg:grid-cols-[repeat(2,480px)] lg:justify-between" : ""}`}
    >
      {items.map((feature) => (
        <figure key={feature.number} className="m-0 flex flex-col">
          <EvidenceScene
            feature={feature.mock}
            label={label(feature)}
            alignGrid={variant === "sidebar"}
          />
          <figcaption className="mt-3 px-1">
            <FeatureCopy feature={feature} numbered={false} />
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

function JourneyHeading() {
  return (
    <>
      <p className={eyebrow}>Funcionalidades</p>
      <h2 className="font-display text-navy mt-5 text-3xl leading-[1.15] font-extrabold tracking-tight lg:text-[30px] dark:text-slate-50">
        De la pregunta a la fuente,{" "}
        <span className="text-primary-light dark:text-primary-dark">
          sin salir de la consulta.
        </span>
      </h2>
      <p className="font-body mt-5 text-base leading-7 text-slate-600 dark:text-slate-400">
        Treinta y seis funcionalidades en cinco grupos: evidencia, consulta,
        formatos de respuesta, espacio personal y gobierno institucional.
      </p>
    </>
  );
}

function JourneyGroup({
  group,
  className = "",
}: {
  group: JourneyGroupData;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="font-display text-primary-light dark:text-primary-dark dark:border-primary-dark/25 grid size-8 shrink-0 place-items-center rounded-full border border-cyan-800/15 text-[10px] font-semibold tabular-nums">
        {group.number}
      </span>
      <h3 className="font-display text-navy text-lg font-semibold tracking-tight whitespace-nowrap dark:text-slate-50">
        {group.title}
      </h3>
    </div>
  );
}

/** 08: the sticky column opens the group itself. The title scales with the
 * column (cqw), the same in every group; if it does not fit on one line it
 * breaks between its two tones. */
function JourneyGroupHeading({ group }: { group: JourneyGroupData }) {
  return (
    <>
      <p className={eyebrow}>Funcionalidades</p>
      <h2 className="font-display text-navy mt-5 text-3xl leading-[1.1] font-extrabold tracking-tight lg:text-[11.4cqw] dark:text-slate-50">
        {/* Same size in every group; a long title breaks between its tones. */}
        <span className="whitespace-nowrap">{group.heading[0]}</span>{" "}
        <span className="text-primary-light dark:text-primary-dark whitespace-nowrap">
          {group.heading[1]}
        </span>
      </h2>
      <p className="font-body mt-5 text-base leading-7 text-slate-600 dark:text-slate-400">
        {group.lead}
      </p>
    </>
  );
}

const stickyTop = "lg:top-[calc(var(--lab-toolbar-height,76px)+40px)]";

/*
 * Recorrido family: the distribution of the Plataforma lab «Recorrido». The
 * evidence group runs through three reading steps that the index follows.
 *  - 08 sidebar: sticky column that opens the group (title, lead, steps);
 *    articles of at most 390px, the rest goes to the column.
 *  - 09 index: heading on top, a narrow (220px) sticky index with group and steps.
 *  - 10 bar: heading on top, a sticky horizontal index; scenes at 480px.
 *  - 11 rows: wide sticky column; one scene per row with its text alongside.
 */
export function JourneyLayout({
  variant = "sidebar",
  group = journeyGroups.evidence,
  className = "",
}: {
  variant?: JourneyVariant;
  group?: JourneyGroupData;
  className?: string;
}) {
  const journeySteps = group.steps;
  const [activeStep, setActiveStep] = useState(journeySteps[0]!.id);
  const container = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const nodes = container.current?.querySelectorAll<HTMLElement>(
      "[data-journey-step]",
    );
    if (!nodes) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          )[0];
        if (visible)
          setActiveStep((visible.target as HTMLElement).dataset.journeyStep!);
      },
      // The sticky index bar covers the top of the viewport in «bar».
      {
        rootMargin:
          variant === "bar" ? "-30% 0px -45% 0px" : "-18% 0px -48% 0px",
        threshold: 0,
      },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [variant]);

  // On narrow screens the bar scrolls sideways: keep the active step visible.
  useEffect(() => {
    if (variant !== "bar") return;
    const strip = bar.current?.firstElementChild as HTMLElement | null;
    const pill = strip?.querySelector<HTMLElement>('[aria-current="step"]');
    if (!strip || !pill) return;
    strip.scrollTo({
      left: pill.offsetLeft - (strip.clientWidth - pill.offsetWidth) / 2,
      behavior: "smooth",
    });
  }, [activeStep, variant]);

  const moveTo = (id: string) => {
    const element = container.current?.querySelector<HTMLElement>(
      `[data-journey-step="${id}"]`,
    );
    if (!element) return;
    const toolbar =
      document.querySelector("[data-cases-lab-header]")?.getBoundingClientRect()
        .height ?? 76;
    const index = variant === "bar" ? (bar.current?.offsetHeight ?? 0) : 0;
    window.scrollTo({
      top:
        window.scrollY +
        element.getBoundingClientRect().top -
        toolbar -
        index -
        32,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
    element.focus({ preventScroll: true });
  };

  const stepLink = (step: JourneyStepData, horizontal = false) => {
    const current = activeStep === step.id;
    return (
      <a
        key={step.id}
        href={`#journey-${step.id}`}
        onClick={(event) => {
          event.preventDefault();
          moveTo(step.id);
        }}
        aria-current={current ? "step" : undefined}
        className={
          horizontal
            ? `font-body focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark inline-flex min-h-9 shrink-0 items-center gap-2 rounded-full px-3.5 text-sm whitespace-nowrap transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 ${current ? "bg-primary-light dark:bg-primary-dark font-semibold text-white dark:text-[#06111f]" : "hover:text-navy text-slate-500 hover:bg-cyan-800/5 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-200"}`
            : `font-body focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark flex items-center gap-3 rounded-md py-2 text-sm transition-colors duration-200 focus-visible:outline-2 focus-visible:-outline-offset-2 ${current ? "text-primary-light dark:text-primary-dark font-semibold" : "hover:text-navy text-slate-500 dark:text-slate-400 dark:hover:text-slate-200"}`
        }
      >
        <span className="font-display text-[11px] tabular-nums opacity-70">
          {step.number}
        </span>
        {step.title.slice(0, -1)}
        {!horizontal && (
          <ArrowDown
            size={14}
            aria-hidden="true"
            className={`ml-auto shrink-0 transition-opacity duration-200 ${current ? "opacity-100" : "opacity-0"}`}
          />
        )}
      </a>
    );
  };

  const steps = (
    <div>
      {journeySteps.map((step, index) => (
        <section
          key={step.id}
          id={`journey-${step.id}`}
          data-journey-step={step.id}
          aria-labelledby={`journey-${step.id}-title`}
          tabIndex={-1}
          className="focus:outline-none"
        >
          <JourneyStepHeader step={step} group={group} />
          <JourneyFigures step={step} variant={variant} />
          {index < journeySteps.length - 1 && (
            <span
              aria-hidden="true"
              className="text-primary-light/70 dark:text-primary-dark/70 my-14 flex items-center gap-4"
            >
              <span className="h-px flex-1 bg-cyan-800/10 dark:bg-cyan-300/10" />
              <ChevronDown size={17} />
              <span className="h-px flex-1 bg-cyan-800/10 dark:bg-cyan-300/10" />
            </span>
          )}
        </section>
      ))}
    </div>
  );

  const verticalNav = (
    <nav aria-label={group.navLabel} className="mt-6">
      {journeySteps.map((step) => stepLink(step))}
    </nav>
  );

  if (variant === "bar")
    return (
      <div ref={container} className="mt-16 lg:mt-20">
        <div
          ref={bar}
          className="sticky top-[var(--lab-toolbar-height,76px)] z-20 -mx-5 border-b border-cyan-800/10 bg-[#fbfdff]/90 px-5 py-3 backdrop-blur-xl sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10 dark:border-cyan-300/10 dark:bg-[#06111f]/90"
        >
          <div className="flex [scrollbar-width:none] items-center gap-6 overflow-x-auto [&::-webkit-scrollbar]:hidden">
            <JourneyGroup group={group} />
            <span
              aria-hidden="true"
              className="h-5 w-px shrink-0 bg-cyan-800/15 dark:bg-cyan-300/15"
            />
            <nav
              aria-label={group.navLabel}
              className="flex items-center gap-1.5"
            >
              {journeySteps.map((step) => stepLink(step, true))}
            </nav>
          </div>
        </div>
        <div className="mt-14">{steps}</div>
      </div>
    );

  if (variant === "index")
    return (
      <div
        ref={container}
        className="mt-16 grid items-start gap-12 lg:mt-20 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12"
      >
        <div className={`lg:sticky ${stickyTop}`}>
          <JourneyGroup group={group} />
          {verticalNav}
        </div>
        {steps}
      </div>
    );

  return (
    <div
      ref={container}
      className={`grid items-start gap-12 ${className} ${variant === "rows" ? "lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-12" : "lg:grid-cols-[minmax(280px,1fr)_minmax(0,812px)] lg:gap-12"}`}
    >
      <div className={`@container lg:sticky ${stickyTop}`}>
        {variant === "rows" ? (
          <>
            <JourneyHeading />
            <JourneyGroup group={group} className="mt-10" />
          </>
        ) : (
          <JourneyGroupHeading group={group} />
        )}
        {verticalNav}
      </div>
      {steps}
    </div>
  );
}

/*
 * 12 · Recorrido 5: a plainer composition. Each group opens with its heading
 * (eyebrow, two-tone title and lead) and its scenes follow in a grid, three
 * per row on desktop, in the reading order of its steps.
 */
export function GroupGridLayout() {
  return (
    <div className="grid gap-32 lg:gap-44">
      {Object.values(journeyGroups).map((group) => {
        const items = group.steps
          .flatMap((step) => step.features)
          .map((id) => allFeatures.find((feature) => feature.mock === id)!);
        return (
          <section
            key={group.title}
            aria-labelledby={`group-grid-${group.number}`}
          >
            <header className="max-w-3xl">
              <p className={eyebrow}>Funcionalidades</p>
              <h2
                id={`group-grid-${group.number}`}
                className="font-display text-navy mt-5 text-3xl leading-[1.1] font-extrabold tracking-tight sm:text-4xl xl:text-5xl dark:text-slate-50"
              >
                {group.heading[0]}{" "}
                <span className="text-primary-light dark:text-primary-dark">
                  {group.heading[1]}
                </span>
              </h2>
              <p className="font-body mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg dark:text-slate-400">
                {group.lead}
              </p>
            </header>
            <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
              {items.map((feature) => (
                <figure key={feature.number} className="m-0 flex flex-col">
                  <EvidenceScene
                    feature={feature.mock}
                    label={`${feature.title}. ${feature.description}`}
                    alignGrid
                  />
                  <figcaption className="mt-3 px-1">
                    <FeatureCopy feature={feature} numbered={false} />
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
