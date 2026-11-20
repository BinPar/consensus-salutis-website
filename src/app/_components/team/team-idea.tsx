import { useTranslations } from "next-intl";

import { TeamIdeaReveal } from "./team-idea-reveal";
import { teamContentWidth } from "./team-layout";

export function TeamIdea() {
  const t = useTranslations("team.idea");

  return (
    <section
      id="equipo-ceo"
      tabIndex={-1}
      aria-labelledby="equipo-idea-title"
      data-team-idea=""
      className="relative z-1 scroll-mt-16 bg-[linear-gradient(to_bottom,transparent,var(--team-paper)_var(--team-ceo-fade))] pt-24 pb-[45px] focus:outline-none motion-reduce:bg-(--team-paper) motion-reduce:pt-14 [@media(width<=767px)]:pt-16 [@media(width<=767px)]:motion-reduce:pt-14"
    >
      <TeamIdeaReveal className={`${teamContentWidth} font-body text-center`}>
        <p className="font-display m-0 mb-5 text-xs leading-5 font-bold tracking-[0.22em] text-(--team-accent) uppercase">
          {t("eyebrow")}
        </p>
        <h2
          id="equipo-idea-title"
          className="font-display m-0 text-4xl leading-tight font-extrabold tracking-tight text-balance text-(--team-ink) xl:text-5xl dark:text-slate-50"
        >
          {t.rich("title", {
            br: () => <br />,
            accent: (chunks) => (
              <span className="text-(--team-accent)">{chunks}</span>
            ),
          })}
        </h2>
        <p className="mx-auto mt-7 mb-0 max-w-220 text-base leading-7 text-pretty text-slate-600 md:text-lg md:leading-8 dark:text-slate-400">
          {t("body")}
        </p>
      </TeamIdeaReveal>
    </section>
  );
}
