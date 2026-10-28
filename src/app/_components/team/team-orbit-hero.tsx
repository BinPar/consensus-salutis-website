"use client";

import { ArrowDown, Pause, Play } from "lucide-react";
import { useState, type CSSProperties } from "react";
import { teamMembers } from "./team-data";
import { TeamPortrait } from "./team-portrait";
import { teamContentWidth } from "./team-layout";
import { useTeamOrbit } from "./use-team-orbit";

const disciplines = [
  "Ideas que conectan",
  "Diseño de producto",
  "Ingeniería de software",
  "Curiosidad compartida",
  "Estrategia digital",
  "Inteligencia artificial",
  "Aprender haciendo",
  "Cuidar los detalles",
  "Pensar en equipo",
  "Nuevas perspectivas",
  "Tecnología con sentido",
  "Crear y mejorar",
  "Escuchar primero",
  "Resolver juntos",
  "Conocimiento compartido",
  "Mirar más allá",
];
const sizes = [1, 0.92, 1.06, 0.96, 1, 1.04, 0.92, 1];
const innerPortraitSlots = [0, 1, 2, 4, 5, 6, 7, 9, 10, 11, 13];
const outerPortraitSlots = [1, 2, 3, 5, 6, 7, 9, 10, 11, 13, 14, 15];
const rings = [
  { id: "inner", slots: Array.from({ length: 14 }, (_, index) => index) },
  { id: "outer", slots: Array.from({ length: 16 }, (_, index) => index) },
];
const patternBackgrounds = [
  "bg-(--team-panel)",
  "bg-[color-mix(in_srgb,var(--team-accent)_12%,var(--team-paper))]",
  "bg-[color-mix(in_srgb,var(--team-ink)_9%,var(--team-paper))]",
  "bg-[color-mix(in_srgb,var(--team-accent)_7%,var(--team-paper))]",
];

function Pattern({ index }: { index: number }) {
  return (
    <div
      className={`h-full w-full text-(--team-accent) ${patternBackgrounds[index % 4]}`}
    >
      <svg
        className="h-full w-full stroke-current [stroke-width:1] opacity-36 dark:opacity-30"
        viewBox="0 0 160 160"
        fill="none"
        aria-hidden="true"
      >
        {index % 4 === 0 ? (
          <g>
            {[0, 1, 2, 3, 4].map((i) => (
              <ellipse
                key={i}
                cx={80}
                cy={80}
                rx={26 + i * 14}
                ry={65}
                transform={`rotate(${i * 24 - 48} 80 80)`}
              />
            ))}
          </g>
        ) : index % 4 === 1 ? (
          <g>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <path
                key={i}
                d={`M-20 ${25 + i * 21} C40 ${-40 + i * 21} 75 ${140 + i * 10} 180 ${30 + i * 18}`}
              />
            ))}
          </g>
        ) : index % 4 === 2 ? (
          <g>
            {[0, 1, 2, 3, 4].map((i) => (
              <rect
                key={i}
                x={24 + i * 8}
                y={24 + i * 8}
                width={112 - i * 16}
                height={112 - i * 16}
                rx={24 - i * 3}
                transform={`rotate(${i * 9 - 18} 80 80)`}
              />
            ))}
          </g>
        ) : (
          <g>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <circle key={i} cx={35 + i * 23} cy={80} r={55} />
            ))}
          </g>
        )}
      </svg>
    </div>
  );
}

export function TeamOrbitHero() {
  const [paused, setPaused] = useState(false);
  const { stage, reducedMotion, memberIndices } = useTeamOrbit(paused);
  return (
    <section
      ref={stage}
      aria-labelledby="team-title"
      data-team-orbit=""
      data-motion={paused || reducedMotion ? "paused" : "playing"}
      className="relative isolate grid h-[max(700px,calc(100svh-64px))] max-h-[1100px] place-items-center overflow-visible bg-(--team-paper) [--team-orbit-reveal:0] data-dragging:cursor-grabbing motion-reduce:[--team-orbit-reveal:1] [@media(width<=600px)]:h-[max(620px,calc(100svh-64px))] [@media(width<=600px)]:max-h-[760px]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -bottom-(--team-orbit-tail) [mask-image:radial-gradient(ellipse_42%_46%_at_50%_46%,transparent_25%,rgb(0_0_0/35%)_48%,#000_75%),linear-gradient(to_bottom,transparent_5%,#000_24%,#000_65%,transparent)] [mask-composite:intersect] [clip-path:inset(0)]"
      >
        <div className="fixed inset-0 bg-[linear-gradient(rgba(8,145,178,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(8,145,178,0.1)_1px,transparent_1px)] bg-size-[44px_44px] [background-position:var(--home-grid-position,0px_0px)] dark:bg-[linear-gradient(color-mix(in_srgb,var(--color-primary-dark)_4.5%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--color-primary-dark)_4.5%,transparent)_1px,transparent_1px)]" />
      </div>
      {rings.map(({ id: ring, slots }, ringIndex) => (
        <div
          key={ring}
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 -bottom-(--team-orbit-tail) [mask-image:linear-gradient(to_bottom,transparent,#000_calc((100%_-_var(--team-orbit-tail))*0.18),#000_calc((100%_-_var(--team-orbit-tail))*0.65),transparent)] opacity-(--team-orbit-reveal) ${ringIndex === 1 ? "[@media(width<=1000px)]:hidden" : ""}`}
        >
          {slots.map((slot) => {
            const portraitSlots =
              ringIndex === 0 ? innerPortraitSlots : outerPortraitSlots;
            const canShowPortrait = portraitSlots.includes(slot);
            const memberKey = `${ring}-${slot}`;
            const baseIndex =
              portraitSlots.indexOf(slot) +
              (ringIndex === 0 ? 0 : innerPortraitSlots.length);
            const personIndex =
              memberIndices === null
                ? canShowPortrait && baseIndex < teamMembers.length
                  ? baseIndex
                  : undefined
                : memberIndices[memberKey];
            const person =
              personIndex === undefined ? undefined : teamMembers[personIndex];
            const patternIndex = Math.floor(slot / 2) + ringIndex * 8;
            return (
              <div
                key={slot}
                data-team-orbit-card=""
                data-team-orbit-ring={ring}
                data-team-orbit-slot={slot}
                data-team-orbit-count={slots.length}
                data-team-orbit-member-key={
                  canShowPortrait ? memberKey : undefined
                }
                data-team-orbit-member={person?.slug}
                style={
                  {
                    "--team-card-size":
                      sizes[slot % sizes.length]! *
                      (ringIndex === 0 ? 0.94 : 1),
                  } as CSSProperties
                }
                className="group pointer-events-auto absolute top-[calc((100%_-_var(--team-orbit-tail))/2)] left-1/2 -mt-[calc(clamp(96px,8.3vw,180px)*var(--team-card-size)/2)] -ml-[calc(clamp(96px,8.3vw,180px)*var(--team-card-size)/2)] aspect-square w-[calc(clamp(96px,8.3vw,180px)*var(--team-card-size))] cursor-grab touch-none will-change-transform select-none [-webkit-user-select:none] [@media(600px<width<=1000px)]:-m-[calc(45px*var(--team-card-size))] [@media(600px<width<=1000px)]:w-[calc(90px*var(--team-card-size))] [@media(width<=600px)]:-m-[calc(38px*var(--team-card-size))] [@media(width<=600px)]:w-[calc(76px*var(--team-card-size))] [[data-dragging]_&]:cursor-grabbing"
              >
                <div className="relative h-full w-full overflow-hidden rounded-[10%] bg-(--team-panel) transition-[scale] duration-400 ease-[ease] group-hover:scale-[1.045] motion-reduce:transition-none motion-reduce:group-hover:scale-100">
                  {person ? (
                    <TeamPortrait
                      person={person}
                      orbit
                      sizes="180px"
                      decorative
                    />
                  ) : (
                    <Pattern index={patternIndex} />
                  )}
                </div>
                <div
                  data-team-orbit-caption=""
                  className="pointer-events-none absolute top-full left-0 w-[115%] pt-2.5 text-[clamp(10px,0.85vw,15px)] leading-[1.5] text-(--team-muted) [@media(width<=1000px)]:text-[10px] [@media(width<=600px)]:hidden"
                >
                  <span>
                    {person ? person.name : disciplines[patternIndex]}
                  </span>
                  {person && (
                    <small className="mt-0.5 block text-[0.82em]">
                      {person.role}
                    </small>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <div
       
        className="pointer-events-none relative z-2 -mt-3 flex w-[calc(100%-40px)] max-w-3xl flex-col items-center text-center sm:w-[calc(100%-64px)] lg:w-[calc(100%-80px)] [&>*]:pointer-events-auto"
      >
        <p className="font-display mb-6 text-xs leading-4 font-bold tracking-[0.22em] text-balance text-(--team-accent) uppercase">
          BinPar Team
        </p>
        <h1
          id="team-title"
          tabIndex={-1}
          className="font-display m-0 text-4xl leading-tight font-extrabold tracking-tight text-balance text-navy focus:outline-none xl:text-5xl dark:text-slate-50"
        >
          Todo empieza
          <br />
          <span className="text-primary-light dark:text-primary-dark">
            con las personas.
          </span>
        </h1>
        <p className="font-body mx-auto mt-6 max-w-lg text-base leading-7 text-balance text-slate-600 md:text-lg md:leading-8 dark:text-slate-400">
          Distintas miradas. Una misma curiosidad. Trabajamos para acercar el
          conocimiento médico a quienes lo necesitan.
        </p>
        <div className="font-body mt-8 flex items-center justify-center [@media(width<=600px)]:mt-[27px]">
          <a
            href="#equipo-ceo"
            onClick={(event) => {
              const destination = document.getElementById("equipo-ceo");
              if (!destination) return;
              event.preventDefault();
              destination.scrollIntoView({
                behavior: reducedMotion ? "instant" : "smooth",
                block: "start",
              });
            }}
            className="inline-flex min-h-10 items-center justify-center gap-2.5 rounded-[999px] border border-transparent bg-(--team-accent) px-5 py-2 text-sm leading-5 font-semibold text-white shadow-[0_4px_6px_-1px_rgb(0_0_0/10%),0_2px_4px_-2px_rgb(0_0_0/10%)] transition-[background,border-color,box-shadow] duration-200 hover:bg-cyan-800 focus-visible:outline-2 focus-visible:outline-offset-[5px] focus-visible:outline-(--team-accent) motion-reduce:transition-none dark:text-[#04111e] dark:shadow-[0_0_34px_color-mix(in_srgb,var(--color-primary-dark)_26%,transparent)] dark:hover:bg-primary-dark/85 [@media(width<=600px)]:min-h-11 [@media(width<=600px)]:min-w-[205px]"
          >
            Conoce al equipo
            <ArrowDown size={17} strokeWidth={1.8} aria-hidden="true" />
          </a>
        </div>
      </div>
      <div
        className={`${teamContentWidth} absolute inset-x-0 bottom-[26px] z-3 flex justify-end [@media(width<=600px)]:bottom-[18px]`}
      >
        <button
          type="button"
          onClick={() => setPaused((value) => !value)}
          disabled={reducedMotion}
          aria-pressed={paused || reducedMotion}
          aria-label={
            reducedMotion
              ? "Movimiento reducido activado"
              : paused
                ? "Reanudar movimiento de las tarjetas"
                : "Pausar movimiento de las tarjetas"
          }
          title={
            reducedMotion
              ? "Movimiento reducido"
              : paused
                ? "Reanudar"
                : "Pausar"
          }
          className="bg-primary-light/10 text-primary-light dark:bg-primary-dark/10 dark:text-primary-dark hover:bg-primary-light/15 dark:hover:bg-primary-dark/15 grid size-8 cursor-pointer place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 disabled:cursor-default"
        >
          {paused || reducedMotion ? (
            <Play size={16} strokeWidth={1.1} aria-hidden="true" />
          ) : (
            <Pause size={16} strokeWidth={1.1} aria-hidden="true" />
          )}
        </button>
      </div>
    </section>
  );
}
