"use client";

import { useState } from "react";
import { ArrowDown, Minus, Plus } from "lucide-react";
import {
  catalogToolDescriptions,
  evidenceTools,
  type EvidenceToolId,
} from "../tools-data";
import { ProductToolFragment } from "./product-tool-fragment";
import { CatalogProductScene } from "./catalog-product-scene";
import { CatalogTwo } from "./catalog-two";
import "./native-tools.css";
import "./catalog-2.css";

function Heading() {
  return (
    <header className="vfp-heading">
      <p className="vlt-eyebrow">Herramientas de la plataforma</p>
      <div>
        <h2>
          Evidencia visible.
          <br />
          <span>De la respuesta a la fuente.</span>
        </h2>
        <p>
          Cada afirmación conserva su referencia. Las herramientas permiten
          consultar el documento, comprobar el pasaje y revisar su vigencia.
        </p>
      </div>
    </header>
  );
}

function Introduction() {
  return (
    <div className="vfp-section-label">
      <span>01</span>
      <h3>Evidencia visible</h3>
      <span>7 herramientas</span>
    </div>
  );
}

export function NativeTools({
  direction,
}: {
  direction: "catalog" | "catalog-2" | "disclosure";
}) {
  const [expanded, setExpanded] = useState<EvidenceToolId | null>("citations");
  if (direction === "catalog-2") return <CatalogTwo />;
  return (
    <div className="vfp-layout" data-native-tools={direction}>
      <Heading />
      <Introduction />
      {direction === "catalog" ? (
        <div className="vfp-catalog">
          {evidenceTools.map((tool) => (
            <article key={tool.id} className="vfp-catalog-article">
              <div className="vfp-article-copy">
                <span className="vfp-number">{tool.number}</span>
                <div>
                  <h4>{tool.title}</h4>
                  <p>{catalogToolDescriptions[tool.id]}</p>
                </div>
              </div>
              <CatalogProductScene tool={tool.id} />
            </article>
          ))}
        </div>
      ) : (
        <div className="vfp-disclosures">
          {evidenceTools.map((tool) => (
            <article
              key={tool.id}
              className="vfp-disclosure"
              data-open={expanded === tool.id}
            >
              <h4>
                <button
                  type="button"
                  onClick={() =>
                    setExpanded(expanded === tool.id ? null : tool.id)
                  }
                  aria-expanded={expanded === tool.id}
                  aria-controls={`native-tool-${tool.id}`}
                >
                  <span className="vfp-number">{tool.number}</span>
                  <span>{tool.title}</span>
                  <span className="vfp-disclosure-toggle">
                    {expanded === tool.id ? (
                      <Minus size={17} aria-hidden="true" />
                    ) : (
                      <Plus size={17} aria-hidden="true" />
                    )}
                  </span>
                </button>
              </h4>
              {expanded === tool.id && (
                <div
                  id={`native-tool-${tool.id}`}
                  className="vfp-disclosure-body"
                >
                  <div>
                    <p className="vfp-tool-description">{tool.description}</p>
                    <p>{tool.detail}</p>
                    <span className="vfp-read-note">
                      <ArrowDown size={14} aria-hidden="true" /> En la
                      plataforma
                    </span>
                  </div>
                  <ProductToolFragment tool={tool.id} />
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
