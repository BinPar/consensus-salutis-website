"use client";
import Image from "next/image";
import dynamic from "next/dynamic";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { BookOpen, Cloud, Code2 } from "lucide-react";
import { PlaybackControls } from "~/app/_components/clinical-process-player";
const StrataRotatableGraphic = dynamic(
  () =>
    import("./strata-rotatable-graphic").then(
      (module) => module.StrataRotatableGraphic,
    ),
  { ssr: false },
);
// Shared product capabilities and brand presentation.
export const pillars = [
  {
    name: "BinPar",
    role: "Producto e ingeniería",
    short: "Ingeniería",
    logo: "/logos/binpar-brand/binpar-logo-light.svg",
    darkLogo: "/logos/binpar-brand/binpar-logo-dark.svg",
    width: 430,
    height: 132,
    icon: Code2,
    proof: "+15 años",
    proofLabel: "de software sanitario",
    summary:
      "Convierte contenidos y protocolos en un sistema integrable, evaluable y trazable.",
    detail:
      "Más de 15 años desarrollando software sanitario. Una capa de ingeniería que controla el ciclo de cada respuesta y conecta el conocimiento con la práctica clínica.",
  },
  {
    name: "Editorial Médica Panamericana",
    role: "Conocimiento clínico",
    short: "Conocimiento",
    logo: "/logos/emp.svg",
    width: 180,
    height: 45,
    icon: BookOpen,
    proof: "+70 años",
    proofLabel: "de experiencia editorial",
    summary:
      "Una base médica revisada, estructurada y actualizada de forma continua.",
    detail:
      "Más de 70 años de experiencia editorial y más de 3 TB de conocimiento médico. Contenidos revisados que dan profundidad y contexto a la consulta.",
  },
  {
    name: "AWS",
    role: "Infraestructura resiliente",
    short: "Infraestructura",
    logo: "/logos/Amazon_Web_Services_Logo.svg",
    width: 84,
    height: 50,
    icon: Cloud,
    proof: "Continuidad",
    proofLabel: "y capacidad de escala",
    summary:
      "Aísla cargas, escala automáticamente y sostiene la operación del sistema.",
    detail:
      "Una arquitectura cloud native preparada para operar con continuidad, observabilidad y cumplimiento. La infraestructura acompaña el crecimiento y las necesidades de cada organización.",
  },
] as const;

export const micro =
  "font-display text-[10px] font-semibold uppercase tracking-[.19em] text-primary-light dark:text-primary-dark";
export const title =
  "font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-[#05215e] sm:text-5xl lg:text-[54px] dark:text-slate-50";
export const body =
  "font-body text-base leading-7 text-slate-600 dark:text-slate-400";
export const sectionBody =
  "font-body text-lg leading-8 text-slate-600 dark:text-slate-400";
export function Brand({
  index,
  className = "",
  large = false,
}: {
  index: number;
  className?: string;
  large?: boolean;
}) {
  const p = pillars[index]!;
  const sizes =
    index === 2
      ? large
        ? "h-11 w-auto"
        : "h-8 w-auto"
      : index === 1
        ? large
          ? "h-10 w-auto max-w-[168px]"
          : "h-7 w-auto max-w-[128px]"
        : large
          ? "h-10 w-auto"
          : "h-7 w-auto";
  return (
    <span className={`inline-flex items-center ${className}`}>
      <Image
        src={p.logo}
        alt={p.name}
        width={p.width}
        height={p.height}
        className={`${sizes} ${"darkLogo" in p ? "dark:hidden" : "dark:brightness-0 dark:invert"}`}
      />
      {"darkLogo" in p && (
        <Image
          src={p.darkLogo}
          alt={p.name}
          width={p.width}
          height={p.height}
          className={`${sizes} hidden dark:block`}
        />
      )}
    </span>
  );
}

export function Heading({
  children,
  description,
  centered = false,
  eyebrow = "Producto · Tres capacidades, un sistema",
  compact = false,
}: {
  children: ReactNode;
  description: string;
  centered?: boolean;
  eyebrow?: string | null;
  compact?: boolean;
}) {
  return (
    <div
      className={`relative z-10 ${centered ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}`}
    >
      {eyebrow && <p className={micro}>{eyebrow}</p>}
      <h2
        className={`${title} ${eyebrow ? "mt-5" : ""} ${compact ? "max-lg:text-[32px] sm:max-lg:text-[40px]" : ""}`}
      >
        {children}
      </h2>
      <p
        className={`${compact ? sectionBody : body} mt-6 ${centered ? "mx-auto max-w-2xl" : "max-w-lg"} ${compact ? "max-lg:mt-4" : ""}`}
      >
        {description}
      </p>
    </div>
  );
}

export function useStrataScene({
  reduced,
  running,
  scaleActive = true,
  keyboardEnabled = true,
}: {
  reduced: boolean;
  running: boolean;
  scaleActive?: boolean;
  keyboardEnabled?: boolean;
}) {
  const [turn, setTurn] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const elapsed = useRef(0);
  const scene = useRef<HTMLDivElement>(null);
  const progress = useMotionValue(0);
  const ambientSeconds = useMotionValue(0);
  const topShift = useMotionValue(0);
  const middleShift = useMotionValue(0);
  const bottomShift = useMotionValue(0);
  const topScale = useMotionValue(1);
  const middleScale = useMotionValue(1);
  const bottomScale = useMotionValue(1);
  const layerScales = [topScale, middleScale, bottomScale];
  const drift = (seconds: number, layer: number) => {
    const separation = (1 - Math.cos((seconds * Math.PI * 2) / 7)) * 7;
    const float = Math.sin((seconds * Math.PI * 2) / 9) * 3;
    return float + (layer - 1) * separation;
  };
  const topY = useTransform(
    [topShift, ambientSeconds],
    (values) => Number(values[0]) + drift(Number(values[1]), 0),
  );
  const middleY = useTransform(
    [middleShift, ambientSeconds],
    (values) => Number(values[0]) + drift(Number(values[1]), 1),
  );
  const bottomY = useTransform(
    [bottomShift, ambientSeconds],
    (values) => Number(values[0]) + drift(Number(values[1]), 2),
  );
  const layerYs = [topY, middleY, bottomY];
  const order = [0, 2, 1];
  const selected = order[turn]!;
  useEffect(() => {
    const transition = {
      duration: reduced ? 0 : 0.55,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    };
    const controls = [topShift, middleShift, bottomShift].flatMap(
      (shift, layer) => [
        animate(
          shift,
          !reduced && turn === layer && layer !== 1 ? -18 : 0,
          transition,
        ),
        animate(
          [topScale, middleScale, bottomScale][layer]!,
          scaleActive && turn === layer ? 1.08 : 1,
          transition,
        ),
      ],
    );
    return () => controls.forEach((control) => control.stop());
  }, [
    turn,
    reduced,
    topShift,
    middleShift,
    bottomShift,
    topScale,
    middleScale,
    bottomScale,
    scaleActive,
  ]);
  const selectTurn = (next: number) => {
    elapsed.current = 0;
    progress.set(0);
    setTurn(next);
  };
  useEffect(() => {
    if (!keyboardEnabled) return;
    const navigate = (event: KeyboardEvent) => {
      if (
        (event.key !== "ArrowLeft" && event.key !== "ArrowRight") ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.defaultPrevented
      )
        return;
      if (
        event.target instanceof Element &&
        event.target.closest(
          "input, textarea, select, [contenteditable]:not([contenteditable=false]), [role=slider], [role=combobox]",
        )
      )
        return;
      const section = scene.current?.closest<HTMLElement>(
        "[data-product-direction]",
      );
      if (section?.dataset.productPainted !== "true") return;
      const bounds = section.getBoundingClientRect();
      if (bounds.bottom <= 0 || bounds.top >= innerHeight) return;
      event.preventDefault();
      const next = (turn + (event.key === "ArrowRight" ? 1 : -1) + 3) % 3;
      elapsed.current = 0;
      progress.set(0);
      setTurn(next);
      const focused = document.activeElement;
      if (
        focused instanceof Element &&
        focused.closest("[data-strata-layer]")
      ) {
        section
          .querySelector<SVGElement>(`[data-strata-layer="${next}"]`)
          ?.focus({ preventScroll: true });
      } else if (
        focused instanceof Element &&
        focused.closest('[aria-label="Escenas de las capas del producto"]')
      ) {
        scene.current
          ?.querySelectorAll<HTMLButtonElement>("nav button")
          [next]?.focus({ preventScroll: true });
      }
    };
    window.addEventListener("keydown", navigate);
    return () => window.removeEventListener("keydown", navigate);
  }, [keyboardEnabled, turn, progress]);
  useEffect(() => {
    if (!running || reduced || paused || interacting) return;
    let previous = performance.now();
    let request = 0;
    const tick = (now: number) => {
      const delta = Math.max(0, Math.min((now - previous) / 1000, 0.1));
      elapsed.current += delta;
      ambientSeconds.set(ambientSeconds.get() + delta);
      previous = now;
      if (elapsed.current >= 7) {
        elapsed.current -= 7;
        setTurn((current) => (current + 1) % 3);
      }
      progress.set(elapsed.current / 7);
      request = requestAnimationFrame(tick);
    };
    request = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(request);
  }, [running, reduced, paused, interacting, progress, ambientSeconds]);
  return {
    scene,
    turn,
    paused,
    setPaused,
    progress,
    ambientSeconds,
    layerYs,
    layerScales,
    order,
    selected,
    selectTurn,
    setInteracting,
  };
}
export function StrataDetails({
  model,
  reduced,
  compactLayout = true,
}: {
  model: ReturnType<typeof useStrataScene>;
  reduced: boolean;
  compactLayout?: boolean;
}) {
  const { scene, turn, paused, setPaused, progress, order, selectTurn } = model;
  return (
    <div
      ref={scene}
      data-strata-scene=""
      data-strata-turn={turn + 1}
      className={
        compactLayout
          ? "min-w-0 max-md:mx-auto max-md:w-full max-md:max-w-[560px] max-md:text-center"
          : undefined
      }
    >
      <div className="grid items-center">
        {order.map((index, layer) => (
          <motion.div
            key={index}
            initial={false}
            animate={{ opacity: turn === layer ? 1 : 0 }}
            transition={{
              duration: reduced
                ? 0
                : compactLayout
                  ? turn === layer
                    ? 0.3
                    : 0.18
                  : 0.4,
              delay:
                turn === layer && !reduced ? (compactLayout ? 0.18 : 0.15) : 0,
            }}
            aria-hidden={turn !== layer}
            className={`col-start-1 row-start-1 py-5 ${compactLayout ? "min-w-0 max-lg:py-2" : ""} ${turn !== layer ? "pointer-events-none" : ""}`}
          >
            <p
              className={`${micro} mb-7 ${compactLayout ? "max-lg:mb-4" : ""}`}
            >
              Capa 0{layer + 1} / 03
            </p>
            <div
              className={`flex h-12 items-center ${compactLayout ? "max-md:justify-center" : ""}`}
            >
              <Brand
                index={index}
                large
                className={`origin-left scale-[1.1] ${compactLayout ? "max-md:origin-center" : ""}`}
              />
            </div>
            <h3
              className={`font-display mt-8 max-w-sm leading-tight font-bold tracking-tight text-[#05215e] dark:text-slate-50 ${compactLayout ? "text-2xl max-lg:mt-4 max-lg:max-w-none" : "text-3xl sm:text-4xl"}`}
            >
              {pillars[index]!.role}
            </h3>
            <p
              className={`${compactLayout ? sectionBody : body} mt-5 max-w-md ${compactLayout ? "max-lg:mt-3 max-md:mx-auto" : ""}`}
            >
              {pillars[index]!.detail}
            </p>
          </motion.div>
        ))}
      </div>
      <PlaybackControls
        steps={order.map((index, layer) => ({
          number: `0${layer + 1}`,
          title: pillars[index]!.role,
        }))}
        index={turn}
        progress={progress}
        reduced={reduced}
        paused={paused}
        onSelect={selectTurn}
        onTogglePause={() => setPaused((current) => !current)}
        navigationLabel="Escenas de las capas del producto"
        playbackLabel="escena de capas"
        unit="capa"
        className={
          compactLayout
            ? "max-lg:mt-4 max-md:mx-auto max-md:max-w-[280px]"
            : undefined
        }
      />
    </div>
  );
}
export function ProductStrataContent({
  reduced,
  running,
}: {
  reduced: boolean;
  running: boolean;
}) {
  const model = useStrataScene({ reduced, running });
  return (
    <div className="product-strata-scene">
      <Heading
        centered
        compact
        eyebrow={null}
        description="Un producto sólido se construye en profundidad. Tres capas complementarias sostienen la misma experiencia clínica."
      >
        Tres capacidades.
        <br />
        <span className="text-primary-light dark:text-primary-dark">
          Una sola arquitectura.
        </span>
      </Heading>
      <div className="mt-10 grid items-center gap-8 max-lg:mt-6 max-lg:gap-5 md:grid-cols-[.95fr_1.05fr] lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
        <div className="text-primary-light dark:text-primary-dark relative mx-auto aspect-[650/410] w-full max-w-[640px] max-md:max-w-[440px]">
          <StrataRotatableGraphic
            offsets={model.layerYs}
            scales={model.layerScales}
            ambientSeconds={model.ambientSeconds}
            turn={model.turn}
            roles={model.order.map((index) => pillars[index]!.role)}
            running={running && !model.paused}
            reduced={reduced}
            onSelect={model.selectTurn}
            onInteraction={model.setInteracting}
          />
        </div>
        <StrataDetails model={model} reduced={reduced} />
      </div>
      <style jsx global>{`
        @media (hover: hover) {
          .product-strata-scene
            [data-strata-layer]:hover
            [data-strata-active="false"]
            [data-strata-contour] {
            stroke-opacity: 0.45;
          }
          .product-strata-scene
            [data-strata-layer]:hover
            [data-strata-active="false"]
            [data-strata-tint] {
            fill-opacity: 0.04;
          }
        }
        .product-strata-scene .product-flow {
          animation: product-strata-flow 5s linear infinite;
          animation-play-state: var(--product-motion, paused);
        }
        @keyframes product-strata-flow {
          to {
            stroke-dashoffset: -100;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .product-strata-scene * {
            animation: none !important;
            transition: none !important;
          }
          .product-strata-scene .product-flow {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
