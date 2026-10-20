"use client";

import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion, useMotionValue } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useProductEntrance } from "~/app/_components/product-strata/product-strata-section";
import { RealTeamPortrait } from "../../_shared/team-portraits";
import { teamMembers, teamAreas, type TeamMember } from "./astra-team-data";
import "./team-new-directions.css";
import { PrismaScene, UmbralScene, NexoScene } from "./team-hero-scenes";
import { PrismaScrollBridge } from "./team-prisma-scroll";
import { TeamGuiada03Hero } from "./team-guiada-03-hero";
import { TeamGuiada03Ceo } from "./team-guiada-03-ceo";
import { guided03Members } from "./team-guiada-03-data";
import "./team-mezcla.css";
import "~/app/_components/section-navigation.css";

export type NewTeamDirection =
  | "prisma"
  | "prisma-2"
  | "mezcla"
  | "mezcla-3"
  | "umbral"
  | "nexo";
export function isNewTeamDirection(value: string): value is NewTeamDirection {
  return (
    value === "prisma" ||
    value === "prisma-2" ||
    value === "mezcla" ||
    value === "mezcla-3" ||
    value === "umbral" ||
    value === "nexo"
  );
}

// The same published roster and supplied photographs as the guided proposals.
const members = teamMembers.filter(
  (person) => person.slug !== "tihomir-nikolaev",
);
const ceo = members.find((person) => person.slug === "ignacio-ferro")!;
const prismaMembers = [
  "ignacio-ferro",
  "cristian-alvarez",
  "marcos-gonzalez",
  "alberto-blanco",
  "isabel-ferro",
  "nicolas-arianoutsos",
  "pablo-emilio",
  "jeronimo-ekerdt",
  "fabian-padilla",
  "beatriz-ortega",
  "adrian-rodriguez",
  "carolina-carcamo",
  "jimmy-montano",
  "yaiza-vallejo",
  "guillermo-hernandez",
].map((slug) => members.find((person) => person.slug === slug)!);
const mezclaMembers = [
  ...prismaMembers.slice(0, 6),
  ...prismaMembers.slice(9, 12),
  ...prismaMembers.slice(6, 9),
  ...prismaMembers.slice(12),
];
const heading =
  "tn-title font-display font-extrabold tracking-tight text-4xl leading-tight xl:text-5xl";
const introduction =
  "Distintas miradas. Una misma curiosidad. Trabajamos para acercar el conocimiento médico a quienes lo necesitan.";
const experience =
  "Al frente de BinPar, Ignacio lidera un equipo con más de quince años de experiencia desarrollando tecnología para el sector de la salud.";
const vision =
  "Hoy, esa experiencia está detrás de la plataforma de IA médica que conecta conocimiento médico con la práctica clínica.";
const purpose =
  "El objetivo: llevar el conocimiento hasta donde hace falta. Ayudar a quienes cuidan de nuestra salud a resolver sus dudas, consultar fuentes y seguir aprendiendo en su práctica diaria.";
const qualities = [
  {
    title: "Visión de producto",
    body: "Conectar el conocimiento médico con la práctica clínica.",
  },
  {
    title: "Experiencia compartida",
    body: "Un equipo con más de quince años de trabajo en el sector de la salud.",
  },
  {
    title: "Un propósito claro",
    body: "Acercar el conocimiento a quienes cuidan de nuestra salud.",
  },
];

function Portrait({
  person,
  priority = false,
}: {
  person: TeamMember;
  priority?: boolean;
}) {
  return (
    <RealTeamPortrait
      slug={person.slug}
      name={person.name}
      priority={priority}
      sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 400px"
    />
  );
}

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, painted, reduced } = useProductEntrance();
  return (
    <motion.div
      ref={(node) => {
        ref.current = node;
      }}
      className={className}
      data-new-painted={painted}
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: painted ? 1 : 0 }}
      transition={{
        duration: reduced ? 0 : 0.42,
        delay: painted && !reduced ? delay : 0,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
}

function Actions({ direction }: { direction: NewTeamDirection }) {
  return (
    <div className="tn-actions">
      <a className="tn-button" href={`#${direction}-equipo`}>
        Conoce al equipo <ArrowDown size={17} aria-hidden="true" />
      </a>
      <Link className="tn-link" href="/plataforma">
        Conoce BinPar <ArrowUpRight size={17} aria-hidden="true" />
      </Link>
    </div>
  );
}

function HeroText({ direction }: { direction: NewTeamDirection }) {
  return (
    <Reveal className="tn-hero-copy" delay={0.1}>
      <p className="tn-eyebrow">Las personas de BinPar</p>
      <h1 className={heading} data-astra-heading tabIndex={-1}>
        Todo empieza
        <br />
        <span>con las personas.</span>
      </h1>
      <p className="tn-lede">{introduction}</p>
      <Actions direction={direction} />
    </Reveal>
  );
}

function PrismaHero({
  direction = "prisma",
}: {
  direction?: "prisma" | "prisma-2";
}) {
  return (
    <PrismaScene direction={direction}>
      <HeroText direction={direction} />
    </PrismaScene>
  );
}
function UmbralHero() {
  return (
    <UmbralScene>
      <HeroText direction="umbral" />
    </UmbralScene>
  );
}
function NexoHero() {
  return (
    <NexoScene>
      <HeroText direction="nexo" />
    </NexoScene>
  );
}

function Qualities({ className = "" }: { className?: string }) {
  return (
    <ul className={`tn-qualities ${className}`}>
      {qualities.map((quality, index) => (
        <li key={quality.title}>
          <span className="tn-quality-number" aria-hidden="true">
            0{index + 1}
          </span>
          <div>
            <h3>{quality.title}</h3>
            <p>{quality.body}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function PrismaCeo({ bridge = false }: { bridge?: boolean }) {
  const titleId = bridge ? "prisma-2-ceo-title" : "prisma-ceo-title";
  const Profile = bridge ? "div" : Reveal;
  return (
    <section className="tn-ceo tn-prisma-ceo" aria-labelledby={titleId}>
      <div className="tn-container">
        <Profile className="tn-prisma-profile">
          <div className="tn-prisma-profile-photo">
            <Portrait person={ceo} />
          </div>
          <div className="tn-prisma-profile-identity">
            <p className="tn-eyebrow">La persona detrás de la idea</p>
            <h2 id={titleId} className={heading}>
              Ignacio Ferro Picón
            </h2>
            <p className="tn-ceo-role">CEO de BinPar</p>
          </div>
          <div className="tn-prisma-profile-story">
            <p>
              Al frente de BinPar, Ignacio lidera un equipo con más de quince
              años de experiencia desarrollando tecnología para el sector de la
              salud. Hoy, esa experiencia está detrás de la plataforma de IA
              médica que conecta conocimiento médico con la práctica clínica. El
              objetivo, llevar el conocimiento hasta donde hace falta: ayudar a
              quienes cuidan de nuestra salud a resolver sus dudas, consultar
              fuentes y seguir aprendiendo en su práctica diaria.
            </p>
          </div>
        </Profile>
      </div>
    </section>
  );
}

function UmbralCeo() {
  return (
    <section
      className="tn-ceo tn-umbral-ceo"
      aria-labelledby="umbral-ceo-title"
    >
      <div className="tn-container">
        <Reveal className="tn-umbral-ceo-heading">
          <p className="tn-eyebrow">La persona detrás de la idea</p>
          <h2 id="umbral-ceo-title" className={heading}>
            Ignacio Ferro Picón
          </h2>
          <p className="tn-ceo-role">CEO de BinPar</p>
        </Reveal>
        <div className="tn-umbral-story">
          <Reveal className="tn-umbral-story-copy">
            <p className="tn-eyebrow">Una trayectoria compartida</p>
            <p className="tn-body">{experience}</p>
            <p className="tn-body">{vision}</p>
          </Reveal>
          <Reveal className="tn-umbral-ceo-portrait">
            <Portrait person={ceo} />
          </Reveal>
          <Reveal className="tn-umbral-purpose">
            <p className="tn-eyebrow">Conocimiento que ayuda</p>
            <p className="tn-body">{purpose}</p>
            <span className="tn-umbral-purpose-line" aria-hidden="true" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function NexoCeo() {
  return (
    <section className="tn-ceo tn-nexo-ceo" aria-labelledby="nexo-ceo-title">
      <div className="tn-container">
        <Reveal className="tn-nexo-ceo-heading">
          <p className="tn-eyebrow">La persona detrás de la idea</p>
          <h2 id="nexo-ceo-title" className={heading}>
            Una visión.
            <br />
            <span>Un propósito compartido.</span>
          </h2>
        </Reveal>
        <div className="tn-nexo-leadership">
          <Reveal className="tn-nexo-signature">
            <div className="tn-nexo-ceo-portrait">
              <Portrait person={ceo} />
            </div>
            <h3>Ignacio Ferro Picón</h3>
            <p className="tn-ceo-role">CEO de BinPar</p>
          </Reveal>
          <Reveal className="tn-nexo-biography">
            <p className="tn-body">{experience}</p>
            <p className="tn-body">
              {vision} {purpose}
            </p>
            <Qualities />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function MemberFigure({
  person,
  index,
  className = "",
  overlayCaption = false,
  travelling = false,
  arrivalReveal = false,
}: {
  person: TeamMember;
  index: number;
  className?: string;
  overlayCaption?: boolean;
  travelling?: boolean;
  arrivalReveal?: boolean;
}) {
  const staticFrame = travelling || arrivalReveal;
  const Frame = staticFrame ? "div" : Reveal;
  return (
    <Frame
      className={`tn-member ${className}`}
      {...(!staticFrame ? { delay: (index % 3) * 0.08 } : {})}
    >
      <figure
        data-team-member={person.slug}
        tabIndex={overlayCaption ? 0 : undefined}
      >
        <div
          className={
            travelling ? "tn-member-photo p2-destination" : "tn-member-photo"
          }
        >
          {travelling ? (
            <div className="p2-travelling-portrait">
              <div className="tn-prisma-crop">
                <Portrait person={person} />
              </div>
            </div>
          ) : overlayCaption ? (
            <div className="tn-prisma-crop">
              <Portrait person={person} />
            </div>
          ) : (
            <Portrait person={person} />
          )}
        </div>
        <figcaption>
          <h3>{person.name}</h3>
          <p>{person.role}</p>
        </figcaption>
      </figure>
    </Frame>
  );
}

function GalleryHeading({ direction }: { direction: NewTeamDirection }) {
  return (
    <>
      <p className="tn-eyebrow">Nuestro equipo</p>
      <h2 id={`${direction}-gallery-title`} className={heading}>
        Distintas miradas.
        <br />
        <span>Una misma dirección.</span>
      </h2>
      <p className="tn-lede">
        Cada persona aporta una forma de pensar, de crear y de resolver. Este es
        el equipo que da forma a BinPar cada día.
      </p>
    </>
  );
}

function PrismaGallery({
  bridge = false,
  mezcla = false,
  variant,
}: {
  bridge?: boolean;
  mezcla?: boolean;
  variant?: NewTeamDirection;
}) {
  const direction =
    variant ?? (mezcla ? "mezcla" : bridge ? "prisma-2" : "prisma");
  const Intro = bridge ? "div" : Reveal;
  const galleryRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const backgroundOpacity = useMotionValue(0);
  useEffect(() => {
    const gallery = galleryRef.current;
    if (direction !== "mezcla-3" || !gallery) return;
    const directory = gallery.querySelector<HTMLElement>(
      ".tn-prisma-directory",
    );
    const aside = gallery.querySelector<HTMLElement>(
      ".tn-prisma-gallery-aside",
    );
    if (!directory || !aside) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = directory.getBoundingClientRect();
      const stickyTop = parseFloat(getComputedStyle(aside).top) || 0;
      // The directory keeps its natural position while the aside sticks.
      // Stay white until its top reaches the aside's actual sticky offset.
      const travel = Math.max(1, rect.height - aside.offsetHeight);
      const progress = Math.max(
        0,
        Math.min(1, (stickyTop - rect.top) / travel),
      );
      backgroundOpacity.set(
        reducedMotion ? 0 : progress * progress * (3 - 2 * progress),
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const resize = new ResizeObserver(schedule);
    resize.observe(directory);
    resize.observe(aside);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [direction, reducedMotion, backgroundOpacity]);
  return (
    <section
      ref={galleryRef}
      id={`${direction}-equipo`}
      className="tn-gallery tn-prisma-gallery"
      aria-labelledby={`${direction}-gallery-title`}
    >
      {direction === "mezcla-3" && (
        <motion.div
          aria-hidden="true"
          className="tn-mezcla-gallery-background"
          style={{ opacity: backgroundOpacity }}
        />
      )}
      <div className="tn-container tn-prisma-directory">
        <div className="tn-prisma-gallery-aside">
          <Intro>
            {mezcla ? (
              <>
                <h2 id={`${direction}-gallery-title`} className={heading}>
                  Las personas
                  <br />
                  <span>detrás de BinPar.</span>
                </h2>
                <p className="tn-lede">
                  Cada persona aporta una forma de pensar, de crear y de
                  resolver. Conoce al equipo que da forma a BinPar cada día.
                </p>
              </>
            ) : (
              <>
                <GalleryHeading direction={direction} />
                <p className="tn-roster-count">
                  {members.length} personas · Un mismo equipo
                </p>
              </>
            )}
          </Intro>
        </div>
        <ul className="tn-prisma-members">
          {(mezcla ? mezclaMembers : prismaMembers).map((person, index) => (
            <li key={person.slug}>
              <MemberFigure
                person={person}
                index={index}
                overlayCaption
                travelling={bridge && index === 0}
                arrivalReveal={bridge && index < 3}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function UmbralGalleryCard({
  person,
  column,
  priority,
}: {
  person: TeamMember;
  column: number;
  priority: boolean;
}) {
  const { ref, painted, reduced } = useProductEntrance();
  return (
    <motion.li
      ref={(node) => {
        ref.current = node;
      }}
      initial={reduced ? false : { opacity: 0, scale: 0.94 }}
      animate={{
        opacity: painted ? 1 : 0,
        scale: painted || reduced ? 1 : 0.94,
      }}
      transition={{
        duration: reduced ? 0 : 0.42,
        delay: reduced || !painted ? 0 : column * 0.12,
        ease: "easeOut",
      }}
    >
      <figure
        tabIndex={0}
        data-team-member={person.slug}
        aria-label={`${person.name}, ${person.role}`}
      >
        <div className="tn-umbral-wall-photo">
          <RealTeamPortrait
            slug={person.slug}
            name={person.name}
            sizes="(max-width:1023px) 640px, 720px"
            priority={priority}
            unoptimized={person.slug === "marcos-gonzalez"}
          />
        </div>
        <figcaption>
          <h3>{person.name}</h3>
          <p>{person.role}</p>
        </figcaption>
      </figure>
    </motion.li>
  );
}

function UmbralGallery() {
  const [columns, setColumns] = useState(5);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width:1024px)");
    const update = () => setColumns(desktop.matches ? 5 : 2);
    update();
    desktop.addEventListener("change", update);
    return () => desktop.removeEventListener("change", update);
  }, []);
  return (
    <section
      id="umbral-equipo"
      className="tn-gallery tn-umbral-gallery"
      aria-labelledby="umbral-gallery-title"
    >
      <Reveal className="tn-umbral-gallery-heading">
        <h2 id="umbral-gallery-title" className={heading}>
          Las personas
          <br />
          <span>detrás de BinPar.</span>
        </h2>
        <p className="tn-lede">
          Cada persona aporta una forma de pensar, de crear y de resolver.
          Conoce al equipo que da forma a BinPar cada día.
        </p>
      </Reveal>
      <div className="tn-umbral-wall">
        <div className="tn-umbral-wall-rows">
          {Array.from({ length: Math.ceil(members.length / 5) }, (_, row) => (
            <ul
              className="tn-umbral-wall-row"
              key={row}
              aria-label={`Miembros del equipo, fila ${row + 1}`}
            >
              {members.slice(row * 5, row * 5 + 5).map((person, index) => (
                <UmbralGalleryCard
                  key={person.slug}
                  person={person}
                  column={(row * 5 + index) % columns}
                  priority={row === 0}
                />
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}

function NexoGallery() {
  return (
    <section
      id="nexo-equipo"
      className="tn-gallery tn-nexo-gallery"
      aria-labelledby="nexo-gallery-title"
    >
      <div className="tn-container">
        <Reveal className="tn-nexo-gallery-heading">
          <GalleryHeading direction="nexo" />
        </Reveal>
        <div className="tn-nexo-groups">
          {teamAreas
            .filter((area) => area !== "Todas")
            .map((area) => {
              const people = members.filter((person) => person.area === area);
              if (!people.length) return null;
              return (
                <section className="tn-nexo-group" key={area} aria-label={area}>
                  <Reveal className="tn-nexo-group-label">
                    <span className="tn-nexo-group-dot" aria-hidden="true" />
                    <h3>{area}</h3>
                    <p>
                      {people.length}{" "}
                      {people.length === 1 ? "persona" : "personas"}
                    </p>
                  </Reveal>
                  <ul>
                    {people.map((person, index) => (
                      <li key={person.slug}>
                        <MemberFigure person={person} index={index} />
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
        </div>
      </div>
    </section>
  );
}

export function TeamNewDirections({
  direction,
}: {
  direction: NewTeamDirection;
}) {
  return (
    <div
      className={`ta-new tn-${direction}${direction === "mezcla" || direction === "mezcla-3" ? "section-navigation-layout tn-mezcla" : ""}`}
      data-team-direction={direction}
    >
      {direction === "mezcla" || direction === "mezcla-3" ? (
        <>
          <div className="tn-mezcla-intro">
            <TeamGuiada03Hero
              extendedOrbit
              homeGrid={direction === "mezcla-3"}
              portraits={guided03Members.map((person) => (
                <RealTeamPortrait
                  key={person.slug}
                  slug={person.slug}
                  name={person.name}
                  sizes="220px"
                  priority
                />
              ))}
            />
            <TeamGuiada03Ceo
              id={direction === "mezcla-3" ? "mezcla-3-ceo" : undefined}
            />
          </div>
          <PrismaGallery mezcla variant={direction} />
        </>
      ) : direction === "prisma-2" ? (
        <>
          <PrismaHero direction="prisma-2" />
          <PrismaScrollBridge>
            <PrismaCeo bridge />
            <PrismaGallery bridge />
          </PrismaScrollBridge>
        </>
      ) : direction === "prisma" ? (
        <>
          <PrismaHero />
          <PrismaCeo />
          <PrismaGallery />
        </>
      ) : direction === "umbral" ? (
        <>
          <UmbralHero />
          <UmbralCeo />
          <UmbralGallery />
        </>
      ) : (
        <>
          <NexoHero />
          <NexoCeo />
          <NexoGallery />
        </>
      )}
    </div>
  );
}
