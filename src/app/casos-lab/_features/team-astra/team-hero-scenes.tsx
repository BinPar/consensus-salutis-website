"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useInView,
} from "framer-motion";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";
import { ArrowDown, Pause, Play } from "lucide-react";
import {
  RealTeamPortrait,
  realTeamPortraits,
} from "../../_shared/team-portraits";
import { guided03Members } from "./team-guiada-03-data";
import "./team-hero-scenes.css";

const ease = [0.22, 1, 0.36, 1] as const;
const portraits = [
  "beatriz-ortega",
  "guillermo-hernandez",
  "carolina-carcamo",
  "adrian-rodriguez",
  "fabian-padilla",
  "yaiza-vallejo",
  "pablo-emilio",
].map((slug) => guided03Members.find((person) => person.slug === slug)!);
function Photo({ index }: { index: number }) {
  const person = portraits[index % portraits.length]!;
  return (
    <RealTeamPortrait
      slug={person.slug}
      name={person.name}
      priority
      sizes="(max-width: 767px) 180px, 360px"
    />
  );
}

function useScene() {
  const ref = useRef<HTMLElement>(null);
  const reduced = !!useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const x = useSpring(px, { stiffness: 65, damping: 24 });
  const y = useSpring(py, { stiffness: 65, damping: 24 });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const scroll = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 1]);
  const move = (event: PointerEvent<HTMLElement>) => {
    if (reduced || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    px.set(((event.clientX - rect.left) / rect.width) * 2 - 1);
    py.set(((event.clientY - rect.top) / rect.height) * 2 - 1);
  };
  const reset = () => {
    px.set(0);
    py.set(0);
  };
  return { ref, reduced, x, y, scroll, move, reset };
}

function Foot({ direction, label }: { direction: string; label: string }) {
  return (
    <div className="tn-scene-foot">
      <span>15 personas. Una misma curiosidad.</span>
      <span className="tn-scene-signature">{label}</span>
      <a href={`#${direction}-equipo`} aria-label="Descubrir el equipo">
        <ArrowDown size={19} aria-hidden="true" />
      </a>
    </div>
  );
}

export function PrismaScene({
  children,
  direction = "prisma",
}: {
  children: ReactNode;
  direction?: "prisma" | "prisma-2";
}) {
  const scene = useScene();
  const tilt = useTransform(scene.x, [-1, 1], [-5, 5]);
  const lift = useTransform(scene.scroll, [0, 1], [0, -70]);
  const rotateX = useTransform(scene.y, [-1, 1], [4, -4]);
  return (
    <section
      ref={scene.ref}
      onPointerMove={scene.move}
      onPointerLeave={scene.reset}
      className="tn-hero tn-scene tn-scene-prisma"
      aria-label="Las personas de BinPar"
    >
      <div className="tn-scene-copy">{children}</div>
      <motion.div
        className="tn-fan-stage"
        style={{ y: lift }}
        aria-hidden="true"
      >
        <div className="tn-fan-horizon" />
        <motion.div className="tn-fan" style={{ rotateY: tilt, rotateX }}>
          {portraits.map((person, index) => {
            const slot = index - 3;
            return (
              <motion.div
                key={person.slug}
                className="tn-fan-card"
                style={{ zIndex: 8 - Math.abs(slot) }}
                initial={
                  scene.reduced
                    ? false
                    : { x: "0%", y: 65, rotate: slot * 2, opacity: 0 }
                }
                animate={{
                  x: `${slot * 85}%`,
                  y: Math.abs(slot) * 17,
                  rotate: slot * 7,
                  opacity: 1,
                }}
                transition={{
                  duration: scene.reduced ? 0 : 1.65,
                  delay: scene.reduced ? 0 : 0.18 + Math.abs(slot) * 0.07,
                  ease,
                }}
              >
                <Photo index={index} />
                <span className="tn-fan-index">0{index + 1}</span>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
      <Foot
        direction={direction}
        label="Distintas miradas. Un mismo impulso."
      />
    </section>
  );
}

const cinemaPeople = [
  "carolina-carcamo",
  "adrian-rodriguez",
  "beatriz-ortega",
  "guillermo-hernandez",
].map((slug) => guided03Members.find((person) => person.slug === slug)!);

export function UmbralScene({ children }: { children: ReactNode }) {
  const scene = useScene();
  const [active, setActive] = useState<number | null>(null);
  const photoY = useTransform(scene.scroll, [0, 1], [0, 85]);
  return (
    <section
      ref={scene.ref}
      className="tn-hero tn-cinema"
      aria-label="Las personas de BinPar"
    >
      <motion.div
        className="tn-cinema-portraits"
        style={{ y: photoY }}
        onPointerLeave={() => setActive(null)}
      >
        {cinemaPeople.map((person, index) => (
          <motion.button
            type="button"
            key={person.slug}
            className="tn-cinema-panel"
            aria-label={`Destacar a ${person.name}`}
            aria-pressed={active === index}
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") setActive(index);
            }}
            onFocus={() => setActive(index)}
            onBlur={() => setActive(null)}
            onClick={() => setActive(active === index ? null : index)}
            initial={scene.reduced ? false : { clipPath: "inset(0 0 100% 0)" }}
            animate={{
              flexGrow: active === null ? 1 : active === index ? 1.75 : 0.75,
              clipPath: "inset(0 0 0% 0)",
            }}
            transition={{
              flexGrow: { duration: scene.reduced ? 0 : 0.75, ease },
              clipPath: {
                duration: scene.reduced ? 0 : 1.25,
                delay: scene.reduced ? 0 : index * 0.13,
                ease,
              },
            }}
          >
            <motion.div
              className="tn-cinema-image"
              initial={scene.reduced ? false : { scale: 1.12 }}
              animate={{ scale: active === index ? 1.025 : 1 }}
              transition={{ duration: scene.reduced ? 0 : 1.25, ease }}
            >
              <RealTeamPortrait
                slug={person.slug}
                name={person.name}
                priority
                sizes="(max-width:767px) 640px, 900px"
              />
            </motion.div>
            <span className="tn-cinema-person">
              <span>{person.name}</span>
              <small>{person.role}</small>
            </span>
          </motion.button>
        ))}
      </motion.div>
      <div className="tn-cinema-shade" aria-hidden="true" />
      <div className="tn-cinema-caption">{children}</div>
      <div className="tn-cinema-edition">
        <span>BINPAR — EL EQUIPO</span>
        <span>15 personas · Una misma curiosidad</span>
      </div>
    </section>
  );
}

// One continuous, asymmetric aperture: the photographs remain undistorted.
const aperture: [string, string, string] = [
  "M 390,34 C 620,-25 858,86 869,286 C 884,475 739,532 657,663 C 566,807 344,845 177,728 C 36,630 -12,414 88,246 C 166,115 231,72 390,34 Z",
  "M 390,54 C 607,-5 884,130 849,326 C 814,515 729,552 637,683 C 526,827 294,805 157,688 C 16,570 28,374 128,216 C 206,85 251,92 390,54 Z",
  "M 390,34 C 620,-25 858,86 869,286 C 884,475 739,532 657,663 C 566,807 344,845 177,728 C 36,630 -12,414 88,246 C 166,115 231,72 390,34 Z",
];

export function NexoScene({ children }: { children: ReactNode }) {
  const scene = useScene();
  const id = useId().replace(/:/g, "");
  const [paused, setPaused] = useState(false);
  const art = useRef<HTMLDivElement>(null);
  const inView = useInView(art, { amount: 0.1 });
  const [tabVisible, setTabVisible] = useState(true);
  useEffect(() => {
    const update = () => setTabVisible(!document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  const running = !scene.reduced && !paused && inView && tabVisible;
  const x = useTransform(scene.x, [-1, 1], [-18, 18]);
  const y = useTransform(scene.y, [-1, 1], [-12, 12]);
  const photoX = useTransform(scene.x, [-1, 1], [18, -18]);
  const photoY = useTransform(scene.y, [-1, 1], [12, -12]);
  const scrollY = useTransform(scene.scroll, [0, 1], [0, -70]);
  return (
    <section
      ref={scene.ref}
      onPointerMove={scene.move}
      onPointerLeave={scene.reset}
      className="tn-hero tn-aperture"
      aria-label="Las personas de BinPar"
    >
      <div className="tn-aperture-wash" aria-hidden="true" />
      <div className="tn-aperture-caption">
        {children}
        <div className="tn-aperture-note">
          <span className="tn-aperture-dot" />
          15 formas de mirar. Un mismo propósito.
        </div>
      </div>
      <motion.div
        ref={art}
        className="tn-aperture-art"
        style={{ y: scrollY }}
        initial={scene.reduced ? false : { clipPath: "circle(0% at 50% 50%)" }}
        animate={{ clipPath: "circle(75% at 50% 50%)" }}
        transition={{ duration: scene.reduced ? 0 : 1.6, ease }}
        aria-hidden="true"
      >
        <motion.svg
          viewBox="0 0 900 850"
          style={{ x, y }}
          className="tn-aperture-svg"
        >
          <defs>
            <clipPath id={id}>
              <motion.path
                d={aperture[0]}
                animate={{ d: running ? aperture : aperture[0] }}
                transition={{
                  duration: running ? 18 : scene.reduced ? 0 : 1.2,
                  repeat: running ? Infinity : 0,
                  ease: "easeInOut",
                }}
              />
            </clipPath>
          </defs>
          <g clipPath={`url(#${id})`}>
            <rect width="900" height="850" fill="var(--ta-panel)" />
            <motion.g style={{ x: photoX, y: photoY }}>
              {guided03Members.slice(0, 12).map((person, index) => (
                <image
                  key={person.slug}
                  href={realTeamPortraits[person.slug]}
                  x={(index % 4) * 228 - 4}
                  y={Math.floor(index / 4) * 286 - 8}
                  width="224"
                  height="282"
                  preserveAspectRatio="xMidYMid slice"
                />
              ))}
            </motion.g>
          </g>
          <motion.path
            d={aperture[1]}
            className="tn-aperture-outline"
            transform="translate(16 12) scale(.985)"
            animate={{
              d: running
                ? [aperture[1], aperture[0], aperture[1]]
                : aperture[1],
            }}
            transition={{
              duration: running ? 22 : scene.reduced ? 0 : 1.2,
              repeat: running ? Infinity : 0,
              ease: "easeInOut",
            }}
          />
        </motion.svg>
      </motion.div>
      <div className="tn-aperture-bottom">
        <span>Personas que dan forma a las ideas.</span>
        <button
          type="button"
          disabled={scene.reduced}
          aria-pressed={paused}
          onClick={() => setPaused((value) => !value)}
        >
          {paused || scene.reduced ? (
            <Play size={13} aria-hidden="true" />
          ) : (
            <Pause size={13} aria-hidden="true" />
          )}
          {scene.reduced
            ? "Movimiento reducido"
            : paused
              ? "Reanudar movimiento"
              : "Pausar movimiento"}
        </button>
      </div>
    </section>
  );
}
