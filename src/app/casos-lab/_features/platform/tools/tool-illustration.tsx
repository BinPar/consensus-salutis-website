import Image from "next/image";
import {
  Archive,
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  FileCheck2,
  FileText,
  History,
  LocateFixed,
  PanelRight,
  Quote,
  X,
  ZoomIn,
} from "lucide-react";
import type { EvidenceToolId } from "./tools-data";

const examplePassage =
  "El documento reúne los criterios de evaluación, su clasificación y las referencias que los acompañan.";

function BrandMark() {
  return (
    <span className="vlt-mark">
      <Image
        src="/logos/binpar-brand/binpar-isotipo-light.svg"
        width={24}
        height={26}
        alt=""
        className="dark:hidden"
        unoptimized
      />
      <Image
        src="/logos/binpar-brand/binpar-isotipo-dark.svg"
        width={24}
        height={26}
        alt=""
        className="hidden dark:block"
        unoptimized
      />
    </span>
  );
}

function CitationScene() {
  return (
    <div className="vlt-citation-canvas">
      <div className="vlt-answer-paper">
        <span className="vlt-ui-label">Respuesta</span>
        <h4>Una respuesta con referencias</h4>
        <p>
          La consulta reúne los criterios recogidos en el documento y sus
          fuentes.
        </p>
        <p className="vlt-selected-claim">
          La clasificación se presenta junto con el contexto de la guía.{" "}
          <span className="vlt-citation-token">[1]</span>
        </p>
        <p>
          Las referencias permiten revisar el pasaje original.{" "}
          <span className="vlt-citation-token vlt-citation-token-muted">
            [2]
          </span>
        </p>
        <div className="vlt-answer-end">
          <CheckCheck size={14} /> Respuesta completada
        </div>
      </div>
      <div className="vlt-citation-connection">
        <ArrowRight size={22} />
      </div>
      <div className="vlt-source-card">
        <div className="vlt-source-tab">
          <FileText size={14} /> Guía clínica <X size={12} />
        </div>
        <div className="vlt-source-card-body">
          <span className="vlt-ui-label">
            <Quote size={13} /> Afirmación seleccionada
          </span>
          <p className="vlt-selected-text">
            La clasificación se presenta junto con el contexto de la guía.
          </p>
          <span className="vlt-ui-label">Pasaje citado</span>
          <blockquote>{examplePassage}</blockquote>
          <span className="vlt-ui-link">
            Ver documento <ArrowUpRight size={13} />
          </span>
        </div>
      </div>
    </div>
  );
}

function BibliographyScene() {
  return (
    <div className="vlt-bibliography-canvas">
      <div className="vlt-response-tail">
        <p>
          La respuesta mantiene las referencias junto a cada afirmación.{" "}
          <span className="vlt-citation-token">[1]</span>{" "}
          <span className="vlt-citation-token">[2]</span>
        </p>
        <div className="vlt-answer-end">
          <CheckCheck size={14} /> Respuesta completada
        </div>
      </div>
      <div className="vlt-reference-list">
        <span className="vlt-ui-label">
          <BookOpen size={14} /> Bibliografía
        </span>
        {[
          "Guía clínica de referencia",
          "Protocolo de evaluación",
          "Manual de consulta",
        ].map((title, index) => (
          <div className="vlt-reference-row" key={title}>
            <span className="vlt-reference-number">{index + 1}</span>
            <div>
              <strong>{title}</strong>
              <small>
                {index === 1
                  ? "Protocolo institucional"
                  : "Documento del corpus"}
              </small>
            </div>
            <ArrowUpRight size={14} />
          </div>
        ))}
      </div>
    </div>
  );
}

function PreservedScene() {
  return (
    <div className="vlt-preserved-canvas">
      <div className="vlt-history-event">
        <span className="vlt-history-dot">
          <Quote size={15} />
        </span>
        <div>
          <span className="vlt-ui-label">En el momento de la respuesta</span>
          <strong>La afirmación y su fuente quedan vinculadas.</strong>
        </div>
      </div>
      <div className="vlt-preserved-card">
        <div className="vlt-document-heading">
          <Archive size={19} />
          <div>
            <span className="vlt-ui-label">Evidencia citada</span>
            <h4>Conservada con la respuesta</h4>
          </div>
          <Check size={16} />
        </div>
        <blockquote>{examplePassage}</blockquote>
        <div className="vlt-preserved-footer">
          <span className="vlt-status">
            <Check size={12} /> Fragmento disponible
          </span>
          <span>Referencia original · [1]</span>
        </div>
      </div>
      <div className="vlt-history-event vlt-history-event-secondary">
        <span className="vlt-history-dot">
          <FileText size={15} />
        </span>
        <div>
          <span className="vlt-ui-label">Estado actual del documento</span>
          <strong>Retirado del corpus</strong>
          <small>El pasaje citado se conserva.</small>
        </div>
      </div>
    </div>
  );
}

function DocumentScene() {
  return (
    <div className="vlt-document-canvas">
      <div className="vlt-pdf-toolbar">
        <span>
          <FileText size={14} /> Guía clínica de referencia.pdf
        </span>
        <span>
          <ChevronLeft size={12} /> 42 / 86 <ChevronRight size={12} />
          <ZoomIn size={14} />
        </span>
      </div>
      <div className="vlt-pdf-surround">
        <div className="vlt-pdf-page">
          <span className="vlt-pdf-running">Guía clínica de referencia</span>
          <h4>4. Criterios de evaluación</h4>
          <p>
            El apartado reúne el contexto de la consulta y las referencias
            documentales.
          </p>
          <p className="vlt-pdf-highlight">{examplePassage}</p>
          <p>
            La lectura del capítulo permite revisar el alcance del fragmento
            citado y su relación con el resto del documento.
          </p>
          <span className="vlt-pdf-page-number">42</span>
        </div>
        <span className="vlt-locate">
          <LocateFixed size={13} /> Pasaje localizado
        </span>
      </div>
    </div>
  );
}

function VerifiedScene() {
  return (
    <div className="vlt-verified-canvas">
      <div className="vlt-verification-heading">
        <span className="vlt-check-seal">
          <FileCheck2 size={25} />
        </span>
        <span className="vlt-status">
          <Check size={12} /> Coincide con el original
        </span>
      </div>
      <div className="vlt-comparison-block">
        <span className="vlt-ui-label">Pasaje citado</span>
        <p>{examplePassage}</p>
      </div>
      <div className="vlt-match-bridge">
        <span />
        <CheckCheck size={18} />
        <span />
      </div>
      <div className="vlt-comparison-block vlt-comparison-original">
        <span className="vlt-ui-label">
          <FileText size={13} /> Texto del PDF original
        </span>
        <p>{examplePassage}</p>
      </div>
      <span className="vlt-verified-note">
        Estado del texto · Independiente de su localización
      </span>
    </div>
  );
}

function ProvenanceScene() {
  return (
    <div className="vlt-provenance-canvas">
      <div className="vlt-provenance-title">
        <FileText size={24} />
        <div>
          <span className="vlt-ui-label">Fuente de la afirmación [1]</span>
          <h4>Una referencia completa</h4>
        </div>
      </div>
      <div className="vlt-provenance-path">
        {[
          {
            label: "Documento",
            value: "Guía clínica de referencia",
            icon: BookOpen,
          },
          { label: "Capítulo", value: "04 · Evaluación", icon: FileText },
          {
            label: "Apartado",
            value: "Criterios de clasificación",
            icon: Quote,
          },
          { label: "Página", value: "42", icon: LocateFixed },
        ].map(({ label, value, icon: Icon }) => (
          <div className="vlt-provenance-step" key={label}>
            <span>
              <Icon size={16} />
            </span>
            <div>
              <small>{label}</small>
              <strong>{value}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UpdatesScene() {
  return (
    <div className="vlt-updates-canvas">
      <div className="vlt-update-notice">
        <History size={18} />
        <div>
          <span className="vlt-ui-label">Actualización disponible</span>
          <h4>Existe una fuente posterior</h4>
          <p>
            El pasaje citado corresponde a una versión anterior del documento.
          </p>
        </div>
      </div>
      <div className="vlt-version vlt-version-previous">
        <span className="vlt-version-node" />
        <div>
          <small>Fuente citada</small>
          <strong>Guía de referencia · Edición anterior</strong>
          <span>Conservada con esta respuesta</span>
        </div>
      </div>
      <div className="vlt-version-arrow">
        <ArrowDown size={17} />
      </div>
      <div className="vlt-version vlt-version-current">
        <span className="vlt-version-node" />
        <div>
          <small>Fuente posterior</small>
          <strong>Guía de referencia · Edición actual</strong>
          <span className="vlt-ui-link">
            Consultar actualización <ArrowUpRight size={12} />
          </span>
        </div>
      </div>
    </div>
  );
}

const scenes = {
  citations: CitationScene,
  bibliography: BibliographyScene,
  preserved: PreservedScene,
  viewer: DocumentScene,
  verified: VerifiedScene,
  provenance: ProvenanceScene,
  updates: UpdatesScene,
};
const sceneLabels = {
  citations:
    "Una afirmación de la respuesta enlaza con el pasaje citado en un panel lateral.",
  bibliography: "Tres fuentes numeradas al final de una respuesta.",
  preserved:
    "El fragmento sigue disponible junto a la respuesta aunque el documento se haya retirado del corpus.",
  viewer: "Un PDF abierto en la página 42 con el pasaje citado resaltado.",
  verified:
    "El pasaje citado y el texto del original coinciden y muestran un indicador propio.",
  provenance: "La referencia muestra documento, capítulo, apartado y página.",
  updates: "Un aviso distingue la fuente citada de una edición posterior.",
};

export function ToolIllustration({
  tool,
  compact = false,
}: {
  tool: EvidenceToolId;
  compact?: boolean;
}) {
  const Scene = scenes[tool];
  return (
    <div
      className="vlt-scene"
      data-scene={tool}
      data-compact={compact}
      role="img"
      aria-label={`Ejemplo de interfaz: ${sceneLabels[tool]}`}
    >
      <div aria-hidden="true" className="vlt-scene-content">
        <div className="vlt-window-bar">
          <span>
            <BrandMark />
            <strong>
              {tool === "citations" || tool === "bibliography"
                ? "Consulta clínica"
                : "Fuentes de consulta"}
            </strong>
          </span>
          <span>
            <PanelRight size={14} />
            <span className="vlt-window-close">
              <X size={13} />
            </span>
          </span>
        </div>
        <div className="vlt-scene-stage">
          <Scene />
        </div>
        <div className="vlt-scene-caption">
          <span className="vlt-caption-dot" /> Ejemplo de interfaz
          <span>BinPar</span>
        </div>
      </div>
    </div>
  );
}
