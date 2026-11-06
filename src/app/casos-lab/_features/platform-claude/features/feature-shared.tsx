import {
  evidenceGroup,
  platformFeatureGroups,
  type PlatformFeature,
} from "./features-data";

type SceneFeature = PlatformFeature & {
  mock: NonNullable<PlatformFeature["mock"]>;
};
const withScene = (feature: PlatformFeature): feature is SceneFeature =>
  feature.mock !== undefined;

/** Pieces shared by every composition of the features section. */
export const features = evidenceGroup.features.filter(withScene);
/** Every feature that already has a scene, across the groups. */
export const allFeatures = platformFeatureGroups
  .flatMap((group) => group.features)
  .filter(withScene);

export const eyebrow =
  "font-display text-primary-light dark:text-primary-dark text-[10px] font-bold tracking-[0.18em] uppercase sm:text-xs";

export function SectionHeading() {
  return (
    <header className="max-w-3xl">
      <p className={eyebrow}>Funcionalidades</p>
      <h2 className="font-display text-navy mt-5 text-3xl leading-[1.15] font-extrabold tracking-tight sm:text-4xl xl:text-5xl dark:text-slate-50">
        De la pregunta a la fuente,
        <br />
        <span className="text-primary-light dark:text-primary-dark">
          sin salir de la consulta.
        </span>
      </h2>
      <p className="font-body mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg dark:text-slate-400">
        Treinta y seis funcionalidades en cinco grupos: evidencia, consulta,
        formatos de respuesta, espacio personal y gobierno institucional.
      </p>
    </header>
  );
}

export function GroupLabel({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-baseline gap-3 border-b border-cyan-800/10 pb-5 dark:border-cyan-300/10 ${className}`}
    >
      <span className="font-display text-primary-light dark:text-primary-dark text-xs font-semibold tabular-nums">
        {evidenceGroup.number}
      </span>
      <h3 className="font-display text-navy text-lg font-semibold tracking-tight dark:text-slate-50">
        {evidenceGroup.title}
      </h3>
      <span className="font-body ml-auto text-xs text-slate-500 dark:text-slate-400">
        {features.length} funcionalidades
      </span>
    </div>
  );
}

export function FeatureCopy({
  feature,
  size = "base",
  numbered = true,
}: {
  feature: PlatformFeature;
  size?: "base" | "large";
  /** Shows the feature number beside the title. */
  numbered?: boolean;
}) {
  return (
    <div className="flex gap-4">
      {numbered && (
        <span className="font-display text-primary-light dark:text-primary-dark pt-1 text-xs font-semibold tabular-nums">
          {feature.number}
        </span>
      )}
      <div className="min-w-0">
        <h4
          className={`font-display text-navy font-semibold tracking-tight dark:text-slate-50 ${size === "large" ? "text-xl sm:text-2xl" : "text-lg"}`}
        >
          {feature.title}
        </h4>
        <p
          className={`font-body mt-2 text-slate-600 dark:text-slate-400 ${size === "large" ? "text-base leading-7" : "text-sm leading-6"}`}
        >
          {feature.description}
          {feature.detail ? ` ${feature.detail}` : null}
        </p>
      </div>
    </div>
  );
}
