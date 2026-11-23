"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { catalogToolDescriptions, evidenceTools } from "../tools-data";
import { CatalogProductScene } from "./catalog-product-scene";

const captions = {
  citations: "De la afirmación al pasaje que la respalda.",
  bibliography: "Las fuentes utilizadas, reunidas al final de la respuesta.",
  preserved: "El pasaje permanece vinculado a la respuesta.",
  viewer: "El documento original, en el punto citado.",
  verified: "La localización y la verificación tienen su propio estado.",
  provenance: "El origen del contenido, identificado en la referencia.",
  updates: "Un aviso distingue el contenido anterior a la actualización.",
} as const;

export function CatalogTwo() {
  const [selected, setSelected] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const tool = evidenceTools[selected]!;
  const description = catalogToolDescriptions[tool.id];
  const firstStop = description.indexOf(". ");
  const lead =
    firstStop >= 0 ? description.slice(0, firstStop + 1) : description;
  const body = firstStop >= 0 ? description.slice(firstStop + 2) : "";
  const move = (index: number) =>
    setSelected((index + evidenceTools.length) % evidenceTools.length);
  const onKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let next: number;
    if (event.key === "ArrowRight") next = (index + 1) % evidenceTools.length;
    else if (event.key === "ArrowLeft")
      next = (index - 1 + evidenceTools.length) % evidenceTools.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = evidenceTools.length - 1;
    else return;
    event.preventDefault();
    setSelected(next);
    buttons.current[next]?.focus({ preventScroll: true });
  };

  return (
    <div
      className="vfp-layout c2-catalog"
      data-native-tools="catalog"
      data-catalog-layout="stage"
    >
      <header className="c2-heading">
        <p className="vlt-eyebrow">Herramientas de la plataforma</p>
        <div>
          <h2>
            De la respuesta
            <br />
            <span>a la fuente.</span>
          </h2>
          <p>
            Cada afirmación conserva su referencia. Las herramientas permiten
            consultar el documento, comprobar el pasaje y revisar su vigencia.
          </p>
        </div>
      </header>
      <div className="c2-index-heading">
        <h3>Evidencia visible</h3>
        <span>7 herramientas · Un mismo recorrido</span>
      </div>
      <div
        className="c2-tool-index"
        role="tablist"
        aria-label="Herramientas de evidencia visible"
      >
        {evidenceTools.map((item, index) => (
          <button
            key={item.id}
            ref={(element) => {
              buttons.current[index] = element;
            }}
            id={`c2-tab-${item.id}`}
            type="button"
            role="tab"
            aria-selected={index === selected}
            aria-controls="c2-feature-panel"
            tabIndex={index === selected ? 0 : -1}
            onClick={() => setSelected(index)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            <span className="c2-index-number">{item.number}</span>
            <span className="c2-index-title">{item.title}</span>
            <span className="c2-index-line" aria-hidden="true" />
          </button>
        ))}
      </div>
      <label className="c2-mobile-index">
        <span>Elegir herramienta</span>
        <select
          value={selected}
          onChange={(event) => setSelected(Number(event.target.value))}
        >
          {evidenceTools.map((item, index) => (
            <option key={item.id} value={index}>
              {item.number} · {item.title}
            </option>
          ))}
        </select>
      </label>
      <div
        className="c2-feature"
        id="c2-feature-panel"
        role="tabpanel"
        aria-label={tool.title}
        tabIndex={0}
      >
        <div className="c2-copy">
          <div className="c2-copy-content" key={tool.id}>
            <p className="c2-feature-position">
              <span>{tool.number}</span>
              <span aria-hidden="true" className="c2-position-rule" />
              <span>Evidencia visible</span>
            </p>
            <h4>{tool.title}</h4>
            <p className="c2-feature-lead">{lead}</p>
            {body && <p className="c2-feature-body">{body}</p>}
          </div>
          <div className="c2-pager">
            <button
              type="button"
              onClick={() => move(selected - 1)}
              aria-label="Herramienta anterior"
            >
              <ArrowLeft size={17} strokeWidth={1.8} />
              <span>Anterior</span>
            </button>
            <span className="c2-page-count">
              {tool.number}
              <span> / 07</span>
            </span>
            <button
              type="button"
              onClick={() => move(selected + 1)}
              aria-label="Herramienta siguiente"
            >
              <span>Siguiente</span>
              <ArrowRight size={17} strokeWidth={1.8} />
            </button>
          </div>
        </div>
        <div className="c2-visual">
          <div className="c2-visual-heading">
            <span>En la plataforma</span>
            <span>
              {tool.family === "answer"
                ? "Consulta clínica"
                : "Fuentes de consulta"}
            </span>
          </div>
          <CatalogProductScene key={tool.id} tool={tool.id} />
          <p className="c2-visual-caption" key={`caption-${tool.id}`}>
            {captions[tool.id]}
          </p>
        </div>
      </div>
    </div>
  );
}
