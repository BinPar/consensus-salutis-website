"use client";

import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { PlatformToolsDirection } from "../platform-directions";
import {
  evidenceFilters,
  evidenceStages,
  evidenceTools,
  type EvidenceFilter,
  type EvidenceTool,
  type EvidenceToolId,
} from "./tools-data";
import { ToolIllustration } from "./tool-illustration";
import "./platform-tools.css";
import { NativeTools } from "./native/native-tools";

function ToolsHeading({ centered = false }: { centered?: boolean }) {
  return (
    <header className={`vlt-heading ${centered ? "vlt-heading-centered" : ""}`}>
      <div>
        <p className="vlt-eyebrow">Herramientas de la plataforma</p>
        <h2 id="platform-tools-title">
          La evidencia,
          <br />
          <span>a la vista.</span>
        </h2>
      </div>
      <p className="vlt-introduction">
        De la afirmación al documento original. Siete herramientas para revisar
        las fuentes, localizar cada pasaje y conservar lo que se citó.
      </p>
    </header>
  );
}

function GroupLabel({ children }: { children?: React.ReactNode }) {
  return (
    <div className="vlt-group-label">
      <span className="vlt-group-number">01</span>
      <h3>Evidencia visible</h3>
      {children}
    </div>
  );
}

function ToolsExplorer() {
  const [selected, setSelected] = useState<EvidenceToolId>("citations");
  const active = evidenceTools.find((tool) => tool.id === selected)!;
  return (
    <>
      <ToolsHeading />
      <div className="vlt-explorer-head">
        <GroupLabel />
        <span className="vlt-meta">7 herramientas · Una misma respuesta</span>
      </div>
      <div className="vlt-explorer">
        <nav
          className="vlt-tool-menu"
          aria-label="Herramientas de evidencia visible"
        >
          {evidenceTools.map((tool) => (
            <button
              type="button"
              key={tool.id}
              data-tool={tool.id}
              onClick={() => setSelected(tool.id)}
              aria-pressed={selected === tool.id}
              aria-controls="vlt-explorer-demo"
            >
              <span className="vlt-tool-number">{tool.number}</span>
              <span className="vlt-tool-menu-copy">
                <span>{tool.title}</span>
                {selected === tool.id && <small>{tool.description}</small>}
              </span>
              <ArrowUpRight size={16} />
            </button>
          ))}
        </nav>
        <div
          id="vlt-explorer-demo"
          className="vlt-explorer-demo"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="vlt-scene-reveal" key={active.id}>
            <ToolIllustration tool={active.id} />
            <div className="vlt-feature-caption">
              <span className="vlt-feature-caption-number">
                {active.number} <span>/ 07</span>
              </span>
              <div>
                <h4>{active.title}</h4>
                <p>{active.detail}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ToolDetail({
  tool,
  onClose,
}: {
  tool: EvidenceTool;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    element?.showModal();
    return () => {
      element?.close();
      previousFocus?.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className="vlt-detail-dialog"
      aria-labelledby="vlt-detail-title"
      onCancel={onClose}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          onClose();
        }
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const rect = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          )
            onClose();
        }
      }}
    >
      <div className="vlt-dialog-heading">
        <span className="vlt-eyebrow">
          Evidencia visible · {tool.number} / 07
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar detalle de herramienta"
          autoFocus
        >
          <X size={20} />
        </button>
      </div>
      <h3 id="vlt-detail-title">{tool.title}</h3>
      <p>{tool.description}</p>
      <ToolIllustration tool={tool.id} />
      <p className="vlt-dialog-detail">{tool.detail}</p>
    </dialog>
  );
}

function ToolsMosaic() {
  const [filter, setFilter] = useState<EvidenceFilter>("all");
  const [detail, setDetail] = useState<EvidenceTool | null>(null);
  const tools = evidenceTools.filter(
    (tool) => filter === "all" || tool.family === filter,
  );
  const order: EvidenceToolId[] = [
    "citations",
    "viewer",
    "bibliography",
    "preserved",
    "verified",
    "provenance",
    "updates",
  ];
  const sorted = [...tools].sort(
    (a, b) => order.indexOf(a.id) - order.indexOf(b.id),
  );
  return (
    <>
      <ToolsHeading centered />
      <div className="vlt-mosaic-toolbar">
        <GroupLabel />
        <div
          className="vlt-filter-group"
          role="group"
          aria-label="Filtrar herramientas"
        >
          {evidenceFilters.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => setFilter(item.id)}
              aria-pressed={item.id === filter}
            >
              {item.id === filter && <Check size={12} />}
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <p className="vlt-sr-only" role="status">
        {tools.length} herramientas visibles
      </p>
      <div className="vlt-mosaic" data-filter={filter}>
        {sorted.map((tool) => (
          <article
            className="vlt-mosaic-card"
            data-tool={tool.id}
            key={tool.id}
          >
            <div className="vlt-mosaic-card-heading">
              <span className="vlt-ui-label">{tool.number} / 07</span>
              <tool.icon size={18} />
            </div>
            <h4>{tool.title}</h4>
            <p>{tool.description}</p>
            <ToolIllustration tool={tool.id} compact />
            <button
              type="button"
              className="vlt-card-open"
              onClick={() => setDetail(tool)}
              aria-label={`Ampliar ${tool.title}`}
            >
              <span>Ver en la plataforma</span>
              <ArrowUpRight size={16} />
            </button>
          </article>
        ))}
      </div>
      {detail && <ToolDetail tool={detail} onClose={() => setDetail(null)} />}
    </>
  );
}

function ToolsJourney() {
  const [activeStage, setActiveStage] = useState<string>("answer");
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const nodes = container.current?.querySelectorAll<HTMLElement>(
      "[data-evidence-stage]",
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
          setActiveStage(
            (visible.target as HTMLElement).dataset.evidenceStage!,
          );
      },
      { rootMargin: "-18% 0px -48% 0px", threshold: 0 },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
  const moveTo = (id: string) => {
    const element = container.current?.querySelector<HTMLElement>(
      `[data-evidence-stage="${id}"]`,
    );
    if (!element) return;
    const toolbarHeight =
      document.querySelector("[data-cases-lab-header]")?.getBoundingClientRect()
        .height ?? 76;
    window.scrollTo({
      top:
        window.scrollY +
        element.getBoundingClientRect().top -
        toolbarHeight -
        32,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
    element.focus({ preventScroll: true });
  };
  return (
    <div className="vlt-journey" ref={container}>
      <div className="vlt-journey-index">
        <ToolsHeading />
        <GroupLabel />
        <nav aria-label="Recorrido de la evidencia">
          {evidenceStages.map((stage) => (
            <a
              key={stage.id}
              href={`#evidence-${stage.id}`}
              onClick={(event) => {
                event.preventDefault();
                moveTo(stage.id);
              }}
              aria-current={activeStage === stage.id ? "step" : undefined}
            >
              <span>{stage.number}</span>
              {stage.title.slice(0, -1)}
              <ArrowDown size={14} />
            </a>
          ))}
        </nav>
        <p className="vlt-journey-footnote">
          Una afirmación.
          <br />
          Todo su recorrido documental.
        </p>
      </div>
      <div className="vlt-journey-stages">
        {evidenceStages.map((stage) => (
          <section
            key={stage.id}
            id={`evidence-${stage.id}`}
            data-evidence-stage={stage.id}
            aria-labelledby={`evidence-${stage.id}-title`}
            tabIndex={-1}
            className="vlt-journey-stage"
          >
            <div className="vlt-stage-heading">
              <span className="vlt-stage-number">{stage.number}</span>
              <div>
                <p className="vlt-eyebrow">Evidencia visible</p>
                <h3 id={`evidence-${stage.id}-title`}>{stage.title}</h3>
              </div>
            </div>
            <p className="vlt-stage-description">{stage.description}</p>
            <ToolIllustration tool={stage.scene} />
            <div className="vlt-stage-tools">
              {stage.tools.map((id) => {
                const tool = evidenceTools.find((item) => item.id === id)!;
                return (
                  <div key={id}>
                    <tool.icon size={18} />
                    <div>
                      <h4>{tool.title}</h4>
                      <p>{tool.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            {stage.id !== "history" && (
              <span className="vlt-stage-continue" aria-hidden="true">
                <span /> <ChevronDown size={17} /> <span />
              </span>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

export function PlatformTools({
  direction,
}: {
  direction: PlatformToolsDirection;
}) {
  return (
    <section
      id="platform-tools"
      className="vlt-tools"
      data-tools-direction={direction}
      aria-label="Herramientas de la plataforma · Evidencia visible"
    >
      <div className="vlt-section-inner">
        {direction === "catalog" || direction === "disclosure" ? (
          <NativeTools direction={direction} />
        ) : direction === "explorer" ? (
          <ToolsExplorer />
        ) : direction === "mosaic" ? (
          <ToolsMosaic />
        ) : (
          <ToolsJourney />
        )}
      </div>
      <a
        href="#platform-preview"
        className="vlt-back-to-preview"
        onClick={(event) => {
          event.preventDefault();
          const section = document.getElementById("platform-preview");
          const bar = document.querySelector("[data-cases-lab-header]");
          if (section)
            window.scrollTo({
              top:
                scrollY +
                section.getBoundingClientRect().top -
                (bar?.getBoundingClientRect().height ?? 76),
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                .matches
                ? "instant"
                : "smooth",
            });
        }}
      >
        Volver a la plataforma <ArrowRight size={14} />
      </a>
    </section>
  );
}
