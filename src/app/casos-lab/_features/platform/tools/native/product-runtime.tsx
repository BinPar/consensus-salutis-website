import type { ReactNode } from "react";
import labels from "./product-labels.json";

// Only replaces runtime dependencies (i18n, data and markdown) for static fragments.
// The presentation components are copied verbatim in product-fragments.tsx.
export const cn = (...values: (string | false | undefined)[]) =>
  values.filter(Boolean).join(" ");
export function useTranslations(namespace: keyof typeof labels) {
  return (key: string, values: Record<string, string | number> = {}) => {
    let value: unknown = labels[namespace];
    for (const part of key.split("."))
      value =
        typeof value === "object" && value !== null
          ? (value as Record<string, unknown>)[part]
          : undefined;
    let result = typeof value === "string" ? value : key;
    for (const [name, replacement] of Object.entries(values))
      result = result.replaceAll(`{${name}}`, String(replacement));
    return result;
  };
}
export type CitationFormat = "numbered" | "source-chip" | "highlighted";
export type CitationViewerTarget = {
  claimText?: string;
  occurrenceIndex?: number;
};
export type CitationBibliographyEntry = {
  number: number;
  sourceKey: string;
  text: string;
  references: {
    priorToUpdate?: boolean;
    anchor: string;
    referenceIndex: number;
    occurrenceIndex?: number;
  }[];
};
export type CitationPresentation = {
  unit:
    | {
        availability: "available";
        basis: "historical_snapshot" | "current";
        content: string;
      }
    | { availability: "duplicate" | "missing" };
  expert: { slug: string; version: number };
  references: {
    snapshot: {
      source: { chapterTitle?: string };
      locator: { section?: string; page?: number; fragment?: string };
    };
  }[];
};
export type PdfHighlightKind =
  "literal" | "approximate" | "figure" | "none" | "legacy";
export type PdfTextProvenanceKind =
  "verified" | "reconciled" | "contradicted" | "unverified";
export const QUOTE_KEYS = {
  supports: "supports",
  verbatim: "verbatim",
  "derived-from": "derivedFrom",
  contradicts: "contradicts",
} as const;
export const stripStreamingCitationAnchors = (content: string) =>
  content.replace(/⟦[^⟧]*⟧/g, "");
export const formatExpertName = (slug: string) =>
  slug
    .split(/[-_]/u)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");

// Badge class lists from packages/ui/src/components/badge.tsx.
export function Badge({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "secondary";
}) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "font-body inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors [&_svg]:size-3.5 [&_svg]:stroke-[1.8]",
        variant === "default"
          ? "border-primary-light/20 bg-primary-light/10 text-primary-light dark:border-primary-dark/25 dark:bg-primary-dark/12 dark:text-primary-dark"
          : "border-cyan-800/15 bg-white/70 text-slate-600 backdrop-blur-xs dark:border-cyan-300/15 dark:bg-white/[0.04] dark:text-slate-300",
      )}
    >
      {children}
    </span>
  );
}

// These fixtures contain paragraphs only. This is the paragraph renderer from ChatMarkdown.
export function ChatMarkdown({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <div className={className}>
      {content
        .split("\n\n")
        .filter(Boolean)
        .map((paragraph, index) => (
          <p
            key={index}
            className="my-2 leading-7 whitespace-pre-wrap first:mt-0 last:mb-0"
          >
            {paragraph}
          </p>
        ))}
    </div>
  );
}
