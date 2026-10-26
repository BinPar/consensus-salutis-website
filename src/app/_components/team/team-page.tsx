import { SectionNavigation } from "~/app/_components/section-navigation";
import { TeamIdea } from "./team-idea";
import { TeamContact } from "./team-contact";
import { TeamGallery } from "./team-gallery";
import { TeamOrbitHero } from "./team-orbit-hero";

const teamSections = [
  { id: "equipo-ceo", label: "La idea" },
  { id: "equipo-galeria", label: "El equipo" },
  { id: "contacto", label: "Contacto" },
];

export function TeamPage() {
  return (
    <>
      <SectionNavigation sections={teamSections} deferUntilContent />
      <main className="relative z-1 overflow-clip bg-(--team-paper) pt-16 [font-family:var(--font-plus-jakarta-sans),sans-serif] text-(--team-ink) [--team-accent:#006d79] [--team-ink:#05215e] [--team-line:rgb(0_109_121/19%)] [--team-muted:#526b7c] [--team-panel:#e8f2f7] [--team-paper:#fbfdff] dark:[--team-accent:var(--color-primary-dark)] dark:[--team-ink:#f1f5f9] dark:[--team-line:color-mix(in_srgb,var(--color-primary-dark)_20%,transparent)] dark:[--team-muted:#a3b7c8] dark:[--team-panel:#0b2030] dark:[--team-paper:#06111f]">
        <div className="relative isolate overflow-clip bg-(--team-paper) [--team-ceo-fade:160px] [--team-orbit-tail:96px] motion-reduce:[--team-orbit-tail:0px] [@media(width<=767px)]:[--team-ceo-fade:112px] [@media(width<=767px)]:[--team-orbit-tail:64px] [@media(width<=767px)]:motion-reduce:[--team-orbit-tail:0px]">
          <TeamOrbitHero />
          <TeamIdea />
        </div>
        <TeamGallery />
        <TeamContact />
      </main>
    </>
  );
}
