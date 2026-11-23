import type { ReactNode } from "react";
import {
  QuoteIcon,
  FileCheck2Icon,
  FileQuestionIcon,
  FileTextIcon,
  LocateFixedIcon,
} from "lucide-react";
import {
  Badge,
  ChatMarkdown,
  cn,
  useTranslations,
  QUOTE_KEYS,
  stripStreamingCitationAnchors,
  formatExpertName,
  type CitationFormat,
  type CitationViewerTarget,
  type CitationPresentation,
  type CitationBibliographyEntry,
  type PdfHighlightKind,
  type PdfTextProvenanceKind,
} from "./product-runtime";

// Verbatim presentation from consensus-salutis/apps/chat/src/components/citation-viewer.tsx.
export function SourceLocation({
  source,
  locator,
  technical = false,
}: {
  source: CitationPresentation["references"][number]["snapshot"]["source"];
  locator: CitationPresentation["references"][number]["snapshot"]["locator"];
  technical?: boolean;
}) {
  const t = useTranslations("chatCitations.viewer");
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-600 dark:text-slate-400">
      {source.chapterTitle ? (
        <span>{t("chapter", { title: source.chapterTitle })}</span>
      ) : null}
      {locator.section ? (
        <span>{t("section", { section: locator.section })}</span>
      ) : null}
      {locator.page !== undefined ? (
        <span>{t("page", { page: locator.page })}</span>
      ) : null}
      {technical && locator.fragment ? (
        <span>{t("fragment", { fragment: locator.fragment })}</span>
      ) : null}
    </div>
  );
}

export function DocumentState({
  tone,
  icon,
  eyebrow,
  title,
  description,
  meta,
  footer,
}: {
  tone: "ready" | "fallback" | "unavailable";
  icon: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  meta?: string;
  footer?: ReactNode;
}) {
  return (
    <section
      className={cn(
        "dark:bg-surface-dark/70 relative overflow-hidden rounded-2xl border bg-white/75 p-4 backdrop-blur-sm",
        tone === "ready" && "border-cyan-800/15 dark:border-cyan-300/15",
        tone === "fallback" && "border-cyan-800/15 dark:border-cyan-300/20",
        tone === "unavailable" &&
          "border-rose-700/25 bg-rose-700/5 dark:border-rose-300/30 dark:bg-rose-300/5",
      )}
    >
      <div
        className={cn(
          "absolute inset-y-0 left-0 w-1",
          tone === "ready" && "bg-primary-light dark:bg-primary-dark",
          tone === "fallback" && "bg-slate-300 dark:bg-slate-600",
          tone === "unavailable" && "bg-rose-700 dark:bg-rose-300",
        )}
        aria-hidden="true"
      />
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-xl [&_svg]:size-4 [&_svg]:stroke-[1.8]",
            tone === "ready" &&
              "bg-primary-light/10 text-primary-light dark:bg-primary-dark/10 dark:text-primary-dark-lighter",
            tone === "fallback" &&
              "bg-primary-light/10 text-primary-light dark:bg-primary-dark/10 dark:text-primary-dark",
            tone === "unavailable" &&
              "bg-rose-700/10 text-rose-700 dark:bg-rose-300/14 dark:text-rose-300",
          )}
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "font-display text-xs font-bold tracking-[0.22em] uppercase",
              tone === "ready" && "text-primary-light dark:text-primary-dark",
              tone === "fallback" &&
                "text-primary-light dark:text-primary-dark",
              tone === "unavailable" && "text-rose-700 dark:text-rose-300",
            )}
          >
            {eyebrow}
          </p>
          <h3 className="font-display text-heading-navy mt-1 text-sm leading-5 font-semibold wrap-break-word dark:text-slate-100">
            {title}
          </h3>
          {meta ? (
            <p className="font-body mt-1 text-[11px] text-slate-600 tabular-nums dark:text-slate-400">
              {meta}
            </p>
          ) : null}
          <p className="font-body mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">
            {description}
          </p>
          {footer ? <div className="mt-3">{footer}</div> : null}
        </div>
      </div>
    </section>
  );
}

export function CitationClaim({ target }: { target: CitationViewerTarget }) {
  const t = useTranslations("chatCitations.viewer");
  if (target.claimText === undefined) return null;

  return (
    <section
      className="border-primary-light/20 bg-primary-light/12 dark:border-primary-dark/25 dark:bg-primary-dark/18 rounded-xl border px-3.5 py-3"
      aria-labelledby="citation-claim-title"
      data-citation-claim=""
      data-citation-occurrence-index={target.occurrenceIndex}
    >
      <div className="flex items-start gap-2.5">
        <QuoteIcon
          className="text-primary-light dark:text-primary-dark mt-0.5 size-4 shrink-0"
          strokeWidth={1.8}
          aria-hidden="true"
        />
        <div className="min-w-0">
          <h3
            id="citation-claim-title"
            className="font-display text-primary-light dark:text-primary-dark text-xs font-bold tracking-[0.22em] uppercase"
          >
            {t("selectedClaim")}
          </h3>
          <p className="font-body mt-1 text-sm leading-6 text-slate-700 dark:text-slate-200">
            {target.claimText}
          </p>
        </div>
      </div>
    </section>
  );
}

export function CitationQuote({
  quote,
  relation,
  priorToUpdate,
}: {
  quote: string;
  relation: keyof typeof QUOTE_KEYS;
  priorToUpdate: boolean;
}) {
  const t = useTranslations("chatCitations.viewer");
  return (
    <section aria-labelledby="citation-quote-title">
      <div className="mb-2 flex items-center gap-2">
        <QuoteIcon
          className="text-primary-light dark:text-primary-dark size-3.5"
          strokeWidth={1.8}
          aria-hidden="true"
        />
        <h3
          id="citation-quote-title"
          className="font-display text-primary-light dark:text-primary-dark text-xs font-bold tracking-[0.22em] uppercase"
        >
          {t("quoteHeading", {
            label: priorToUpdate
              ? t("quote.priorToUpdate")
              : t(`quote.${QUOTE_KEYS[relation]}`),
          })}
        </h3>
      </div>
      <blockquote className="border-primary-light/55 dark:border-primary-dark/55 border-l-2 pl-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
        <ChatMarkdown content={quote} className="[&>p]:my-0 [&>p]:leading-6" />
      </blockquote>
    </section>
  );
}

export function CitationUnit({
  unit,
  anchor,
  expert,
}: {
  unit: CitationPresentation["unit"];
  anchor: string;
  expert: CitationPresentation["expert"];
}) {
  const t = useTranslations("chatCitations.viewer");
  if (unit.availability !== "available") {
    return (
      <DocumentState
        tone="unavailable"
        icon={<FileQuestionIcon aria-hidden="true" />}
        eyebrow={t("unit.unavailableEyebrow")}
        title={t("unit.cannotRecover", { anchor })}
        description={
          unit.availability === "duplicate"
            ? t("unit.duplicateAnchor")
            : t("unit.missingUnit")
        }
      />
    );
  }

  const isHistorical = unit.basis === "historical_snapshot";

  return (
    <section
      className="shadow-big-blocks dark:bg-surface-dark/80 overflow-hidden rounded-2xl border border-cyan-800/15 bg-white/80 backdrop-blur-xs dark:border-cyan-300/20 dark:shadow-[0_0_18px_rgb(83_234_253/8%)]"
      aria-labelledby="citation-unit-title"
    >
      <div className="flex items-start gap-3 px-4 py-3.5">
        <span className="bg-primary-light/10 text-primary-light dark:bg-primary-dark/10 dark:text-primary-dark-lighter grid size-9 shrink-0 place-items-center rounded-xl">
          <FileCheck2Icon
            className="size-4"
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-primary-light dark:text-primary-dark text-xs font-bold tracking-[0.22em] uppercase">
            {t("unit.cited")}
          </p>
          <h3
            id="citation-unit-title"
            className="font-display text-heading-navy mt-1 text-sm leading-5 font-semibold dark:text-slate-100"
          >
            {t("unit.expertCorpus", {
              expert: formatExpertName(expert.slug),
              version: expert.version,
            })}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge>
              {isHistorical ? t("unit.keptWithAnswer") : t("unit.current")}
            </Badge>
            <Badge variant="secondary">⟦{anchor}⟧</Badge>
          </div>
          {!isHistorical ? (
            <p className="font-body mt-2 text-[11px] leading-4 text-slate-600 dark:text-slate-400">
              {t("unit.legacyNotice")}
            </p>
          ) : null}
        </div>
      </div>
      <div className="border-t border-cyan-800/10 px-4 py-4 dark:border-cyan-300/10">
        <ChatMarkdown
          content={stripStreamingCitationAnchors(unit.content)}
          className="text-sm text-slate-700 dark:text-slate-300"
        />
      </div>
    </section>
  );
}

// Verbatim presentation from consensus-salutis/apps/chat/src/components/chat-markdown.tsx.
export function CitationMarker({
  anchor,
  referenceIndex,
  occurrenceIndex,
  format,
  children,
  onCitationOpen,
}: {
  anchor: string;
  referenceIndex: number;
  occurrenceIndex?: number;
  format: CitationFormat;
  children?: ReactNode;
  onCitationOpen?: (
    anchor: string,
    referenceIndex: number,
    occurrenceIndex?: number,
  ) => void;
}) {
  const t = useTranslations("chatThread.markdown");
  if (format === "source-chip") {
    const title =
      typeof children === "string" ? children : t("bibliographicSource");
    const chipClassName =
      "inline-flex max-w-full items-center rounded-md border border-cyan-800/15 bg-primary-light/8 px-1.5 py-0.5 text-[0.78em] font-semibold leading-4 text-primary-light no-underline dark:border-cyan-300/20 dark:bg-primary-dark/10 dark:text-primary-dark-lighter";

    return (
      <span
        className="mx-0.5 inline-flex max-w-[min(16rem,70vw)] align-middle"
        data-citation-anchor={anchor}
        data-citation-reference-index={referenceIndex}
        data-citation-occurrence-index={occurrenceIndex}
      >
        {onCitationOpen === undefined ? (
          <span className={chipClassName}>
            <span className="truncate" title={title}>
              {children}
            </span>
          </span>
        ) : (
          <button
            type="button"
            className={cn(
              chipClassName,
              "hover:border-primary-light/35 hover:bg-primary-light/12 focus-visible:outline-primary-light dark:hover:border-primary-dark/40 dark:hover:bg-primary-dark/15 dark:focus-visible:outline-primary-dark cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
            )}
            onClick={() =>
              onCitationOpen(anchor, referenceIndex, occurrenceIndex)
            }
            aria-label={t("openSource", { title })}
          >
            <span className="truncate" title={title}>
              {children}
            </span>
          </button>
        )}
      </span>
    );
  }

  const className =
    "font-display rounded-sm px-0.5 text-[0.9em] font-semibold leading-none text-primary-light underline decoration-primary-light/35 underline-offset-2 dark:text-primary-dark dark:decoration-primary-dark/35";

  return (
    <sup
      className="ml-0.5 align-super whitespace-nowrap"
      data-citation-anchor={anchor}
      data-citation-reference-index={referenceIndex}
      data-citation-occurrence-index={occurrenceIndex}
    >
      {onCitationOpen === undefined ? (
        <span className={className} title={t("bibliographicSource")}>
          {children}
        </span>
      ) : (
        <button
          type="button"
          className={cn(
            className,
            "focus-visible:outline-primary-light dark:hover:text-primary-dark-lighter dark:focus-visible:outline-primary-dark cursor-pointer transition-colors hover:text-cyan-800 focus-visible:outline-2 focus-visible:outline-offset-2",
          )}
          onClick={() =>
            onCitationOpen(anchor, referenceIndex, occurrenceIndex)
          }
          aria-label={t("openClaimSources")}
        >
          {children}
        </button>
      )}
    </sup>
  );
}

export function CitationBibliography({
  entries,
  onCitationOpen,
}: {
  entries: CitationBibliographyEntry[];
  onCitationOpen?: (
    anchor: string,
    referenceIndex: number,
    occurrenceIndex?: number,
  ) => void;
}) {
  const t = useTranslations("chatThread.markdown");
  const title = t("bibliography");
  return (
    <section
      className="mt-5 border-t border-cyan-800/15 pt-4 dark:border-cyan-300/15"
      aria-label={title}
    >
      <h2 className="font-display text-primary-light dark:text-primary-dark text-xs font-bold tracking-[0.22em] uppercase">
        {title}
      </h2>
      <ol className="mt-3 space-y-2.5">
        {entries.map((entry) => {
          // A passage that predates its unit's update may state the replaced value (#172).
          const target =
            entry.references.find((item) => !item.priorToUpdate) ??
            entry.references[0];
          const canOpen = onCitationOpen !== undefined && target !== undefined;
          const content = (
            <>
              <span
                className="font-display border-primary-light/20 bg-primary-light/8 text-primary-light dark:border-primary-dark/25 dark:bg-primary-dark/10 dark:text-primary-dark-lighter grid size-6 shrink-0 place-items-center rounded-md border text-[10px] font-semibold tabular-nums"
                aria-hidden="true"
              >
                {entry.number}
              </span>
              <span className="min-w-0 flex-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
                <span className="sr-only">{entry.number}. </span>
                {entry.text}
              </span>
            </>
          );

          return (
            <li key={entry.sourceKey}>
              {canOpen ? (
                <button
                  type="button"
                  className="focus-visible:outline-primary-light dark:hover:text-primary-dark-lighter dark:focus-visible:outline-primary-dark flex w-full items-start gap-2.5 rounded-md text-left transition-colors hover:text-cyan-800 focus-visible:outline-2 focus-visible:outline-offset-2"
                  onClick={() =>
                    onCitationOpen(
                      target.anchor,
                      target.referenceIndex,
                      target.occurrenceIndex,
                    )
                  }
                  aria-label={t("openNumberedSource", {
                    number: entry.number,
                    text: entry.text,
                  })}
                >
                  {content}
                </button>
              ) : (
                <div className="flex items-start gap-2.5">{content}</div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

// Verbatim presentation from consensus-salutis/apps/chat/src/components/pdf-source-renderer.tsx.
export function HighlightStatus({
  kind,
  label,
  description,
}: {
  kind: PdfHighlightKind;
  label: string;
  description: string;
}) {
  return (
    <span
      className={cn(
        "font-body mt-0.5 inline-flex max-w-36 shrink-0 items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] leading-4 font-semibold",
        highlightBadgeClass(kind),
      )}
      title={description}
      data-pdf-highlight-kind={kind}
    >
      <LocateFixedIcon
        className="size-3.5 shrink-0"
        strokeWidth={1.8}
        aria-hidden="true"
      />
      <span>{label}</span>
    </span>
  );
}

export function TextProvenanceStatus({
  kind,
  label,
  description,
}: {
  kind: PdfTextProvenanceKind;
  label: string;
  description: string;
}) {
  return (
    <span
      className={cn(
        "font-body mt-0.5 inline-flex max-w-36 shrink-0 items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] leading-4 font-semibold",
        textProvenanceBadgeClass(kind),
      )}
      title={description}
      data-pdf-text-provenance={kind}
    >
      <FileTextIcon
        className="size-3.5 shrink-0"
        strokeWidth={1.8}
        aria-hidden="true"
      />
      <span>{label}</span>
    </span>
  );
}

export function textProvenanceBadgeClass(kind: PdfTextProvenanceKind) {
  if (kind === "verified" || kind === "reconciled") {
    return "border-primary-light/20 bg-primary-light/10 text-primary-light dark:border-primary-dark/25 dark:bg-primary-dark/12 dark:text-primary-dark";
  }
  if (kind === "contradicted") {
    return "border-rose-700/25 bg-rose-700/10 text-rose-700 dark:border-rose-300/30 dark:bg-rose-300/14 dark:text-rose-300";
  }
  return "border-slate-400/30 bg-slate-400/8 text-slate-600 dark:border-slate-300/20 dark:bg-slate-300/5 dark:text-slate-300";
}

export function highlightBadgeClass(kind: PdfHighlightKind) {
  if (kind === "literal") {
    return "border-primary-light/20 bg-primary-light/10 text-primary-light dark:border-primary-dark/25 dark:bg-primary-dark/12 dark:text-primary-dark";
  }
  if (kind === "approximate" || kind === "figure") {
    return "border-dashed border-primary-light/25 bg-primary-light/8 text-primary-light dark:border-primary-dark/30 dark:bg-primary-dark/8 dark:text-primary-dark-lighter";
  }
  return "border-slate-400/30 bg-slate-400/8 text-slate-600 dark:border-slate-300/20 dark:bg-slate-300/5 dark:text-slate-300";
}
