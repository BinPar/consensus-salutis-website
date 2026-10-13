"use client";

import { animate, type MotionValue, useMotionValue } from "framer-motion";
import { RotateCcw } from "lucide-react";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import {
  initialStrataElevation,
  initialStrataYaw,
  projectStrata,
  ambientStrataCamera,
} from "./strata-projection";

type Props = {
  offsets: readonly MotionValue<number>[];
  scales: readonly MotionValue<number>[];
  ambientSeconds: MotionValue<number>;
  turn: number;
  roles: readonly string[];
  running: boolean;
  reduced: boolean;
  onSelect: (layer: number) => void;
  onInteraction: (dragging: boolean) => void;
};

const angleDelta = (angle: number, initial: number) =>
  ((((angle - initial + 180) % 360) + 360) % 360) - 180;

export function StrataRotatableGraphic({
  offsets,
  scales,
  ambientSeconds,
  turn,
  roles,
  running,
  reduced,
  onSelect,
  onInteraction,
}: Props) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const yaw = useMotionValue(initialStrataYaw);
  const elevation = useMotionValue(initialStrataElevation);
  const orbitStart = useMotionValue(0);
  const [dragging, setDragging] = useState(false);
  const [rotated, setRotated] = useState(false);
  const stopReset = useRef<(() => void) | null>(null);
  const stopMomentum = useRef<(() => void) | null>(null);
  const gesture = useRef({
    pointer: -1,
    x: 0,
    y: 0,
    yaw: initialStrataYaw,
    elevation: initialStrataElevation,
    moved: false,
    lastX: 0,
    lastY: 0,
    lastTime: 0,
    yawVelocity: 0,
    elevationVelocity: 0,
  });
  const frame = projectStrata({
    camera: ambientStrataCamera(
      { yaw: yaw.get(), elevation: elevation.get() },
      reduced ? 0 : ambientSeconds.get() - orbitStart.get(),
    ),
    offsets: offsets.map((value) => value.get()),
    scales: scales.map((value) => value.get()),
  });

  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const layerNodes = [0, 1, 2].map((layer) => {
      const group = element.querySelector(`[data-strata-layer="${layer}"]`)!;
      return {
        group,
        paths: [
          "surface",
          "left",
          "right",
          "contour",
          "grid",
          "flow",
          "clip",
          "tint",
        ].map((slot) => group.querySelector(`[data-projection="${slot}"]`)!),
        glassClip: group.querySelector("[data-projection=glass-clip]")!,
        blur: group.querySelector("feGaussianBlur")!,
        backdropSources: [...group.querySelectorAll("[data-backdrop-source]")],
        title: group.querySelector("[data-projection=title]"),
        number: group.querySelector("[data-projection=number]")!,
      };
    });
    const guideNodes = [...element.querySelectorAll("[data-strata-guide]")];
    let request = 0;
    const update = () => {
      request = 0;
      const camera = ambientStrataCamera(
        { yaw: yaw.get(), elevation: elevation.get() },
        reduced ? 0 : ambientSeconds.get() - orbitStart.get(),
      );
      const next = projectStrata({
        camera,
        offsets: offsets.map((value) => value.get()),
        scales: scales.map((value) => value.get()),
      });
      element.dataset.strataYaw = String(yaw.get());
      element.dataset.strataElevation = String(elevation.get());
      element.dataset.strataCameraYaw = String(camera.yaw);
      element.dataset.strataCameraElevation = String(camera.elevation);
      next.layers.forEach((layer, index) => {
        const nodes = layerNodes[index]!;
        [
          layer.surface,
          layer.left,
          layer.right,
          layer.contour,
          layer.grid,
          layer.surface,
          layer.surface,
          layer.surface,
        ].forEach((d, slot) => nodes.paths[slot]!.setAttribute("d", d));
        nodes.paths.forEach((node, slot) =>
          node.setAttribute(
            "stroke-width",
            String((slot === 4 ? 0.6 : slot === 5 ? 1.5 : 1) * layer.textScale),
          ),
        );
        nodes.glassClip.setAttribute("d", layer.glassClip);
        nodes.blur.setAttribute("stdDeviation", String(8 * layer.textScale));
        const behind = next.paintOrder.slice(0, next.paintOrder.indexOf(index));
        nodes.backdropSources.forEach((source, slot) => {
          const sourceIndex = behind[slot];
          source.setAttribute(
            "display",
            sourceIndex === undefined ? "none" : "inline",
          );
          if (sourceIndex === undefined) source.removeAttribute("href");
          else source.setAttribute("href", `#${id}-paint-${sourceIndex}`);
        });
        for (const [node, position, size] of [
          [nodes.title, layer.title, 10],
          [nodes.number, layer.number, 11],
        ] as const) {
          if (!node) continue;
          node.setAttribute("x", String(position.x));
          node.setAttribute("y", String(position.y));
          node.setAttribute("font-size", String(size * layer.textScale));
          if (size === 10)
            node.setAttribute("letter-spacing", String(1.6 * layer.textScale));
        }
      });
      next.guides.forEach((d, index) =>
        guideNodes[index]!.setAttribute("d", d),
      );
      const plates = element.querySelector("[data-strata-plates]")!;
      if (
        next.paintOrder.some(
          (index, position) =>
            plates.children[position] !== layerNodes[index]!.group,
        )
      ) {
        next.paintOrder.forEach((index) =>
          plates.appendChild(layerNodes[index]!.group),
        );
      }
      setRotated(
        Math.abs(angleDelta(camera.yaw, initialStrataYaw)) > 0.01 ||
          Math.abs(angleDelta(camera.elevation, initialStrataElevation)) > 0.01,
      );
    };
    const schedule = () => {
      if (!request) request = requestAnimationFrame(update);
    };
    const unsubscribe = [
      yaw,
      elevation,
      ambientSeconds,
      orbitStart,
      ...offsets,
      ...scales,
    ].map((value) => value.on("change", schedule));
    update();
    return () => {
      unsubscribe.forEach((off) => off());
      cancelAnimationFrame(request);
    };
  }, [
    yaw,
    elevation,
    offsets,
    scales,
    ambientSeconds,
    orbitStart,
    reduced,
    id,
  ]);

  useEffect(
    () => () => {
      stopReset.current?.();
      stopMomentum.current?.();
    },
    [],
  );
  useEffect(() => {
    if (!running || reduced) stopMomentum.current?.();
  }, [running, reduced]);
  const setCamera = (nextYaw: number, nextElevation: number) => {
    yaw.set(nextYaw);
    elevation.set(nextElevation);
  };
  const finish = (event: PointerEvent<HTMLDivElement>) => {
    if (gesture.current.pointer !== event.pointerId) return;
    gesture.current.pointer = -1;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    setDragging(false);
    const released = gesture.current;
    const freshness = Math.exp(
      -Math.max(0, event.timeStamp - released.lastTime) / 70,
    );
    const velocity = [released.yawVelocity, released.elevationVelocity].map(
      (value) => Math.max(-150, Math.min(150, value * freshness)),
    );
    if (
      event.type === "pointerup" &&
      released.moved &&
      !reduced &&
      Math.hypot(...velocity) > 3
    ) {
      const started = performance.now();
      const initialYaw = yaw.get(),
        initialElevation = elevation.get();
      let request = 0;
      const stop = () => {
        cancelAnimationFrame(request);
        stopMomentum.current = null;
        if (root.current) root.current.dataset.strataCoasting = "false";
        onInteraction(false);
      };
      stopMomentum.current = stop;
      if (root.current) root.current.dataset.strataCoasting = "true";
      const tick = (now: number) => {
        const elapsed = (now - started) / 1000;
        const decay = Math.exp(-elapsed / 0.24);
        const distance = 0.24 * (1 - decay);
        setCamera(
          initialYaw + velocity[0]! * distance,
          initialElevation + velocity[1]! * distance,
        );
        if (elapsed >= 1.3 || Math.hypot(...velocity) * decay < 0.6) stop();
        else request = requestAnimationFrame(tick);
      };
      request = requestAnimationFrame(tick);
      return;
    }
    onInteraction(false);
  };
  const resetView = () => {
    stopReset.current?.();
    stopMomentum.current?.();
    const current = ambientStrataCamera(
      { yaw: yaw.get(), elevation: elevation.get() },
      reduced ? 0 : ambientSeconds.get() - orbitStart.get(),
    );
    orbitStart.set(ambientSeconds.get());
    yaw.set(current.yaw);
    elevation.set(current.elevation);
    onInteraction(true);
    const options = {
      duration: reduced ? 0 : 0.35,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    };
    const controls = [
      animate(yaw, yaw.get() - angleDelta(yaw.get(), initialStrataYaw), {
        ...options,
        onComplete: () => onInteraction(false),
      }),
      animate(
        elevation,
        elevation.get() - angleDelta(elevation.get(), initialStrataElevation),
        options,
      ),
    ];
    stopReset.current = () => {
      controls.forEach((control) => control.stop());
      onInteraction(false);
    };
  };

  return (
    <div
      ref={root}
      data-strata-rotatable=""
      data-rotating={dragging}
      role="group"
      tabIndex={0}
      aria-label="Arquitectura del producto: gráfico rotatable"
      aria-describedby={`${id}-instructions`}
      className={`absolute inset-0 touch-none outline-none select-none [--strata-glass-backdrop-opacity:1] [--strata-glass-ground:#fff] [--strata-glass-tint:rgba(255,255,255,0.3)] dark:[--strata-glass-backdrop-opacity:0.45] dark:[--strata-glass-ground:#06111f] dark:[--strata-glass-tint:rgba(11,32,48,0.3)] ${dragging ? "cursor-grabbing [&_*]:cursor-grabbing!" : "cursor-grab"}`}
      onPointerDown={(event) => {
        if (
          !event.isPrimary ||
          event.button !== 0 ||
          (event.target as Element).closest("button")
        )
          return;
        stopReset.current?.();
        stopMomentum.current?.();
        gesture.current = {
          pointer: event.pointerId,
          x: event.clientX,
          y: event.clientY,
          yaw: yaw.get(),
          elevation: elevation.get(),
          moved: false,
          lastX: event.clientX,
          lastY: event.clientY,
          lastTime: event.timeStamp,
          yawVelocity: 0,
          elevationVelocity: 0,
        };
      }}
      onPointerMove={(event) => {
        const start = gesture.current;
        if (start.pointer !== event.pointerId) return;
        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;
        if (!start.moved && Math.hypot(dx, dy) < 6) return;
        if (!start.moved) {
          start.moved = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          setDragging(true);
          onInteraction(true);
        }
        const sensitivity =
          100 / Math.max(250, event.currentTarget.clientWidth);
        const sampleTime = Math.max(
          0.008,
          (event.timeStamp - start.lastTime) / 1000,
        );
        start.yawVelocity =
          (0.65 * (event.clientX - start.lastX) * sensitivity) / sampleTime +
          0.35 * start.yawVelocity;
        start.elevationVelocity =
          (-0.65 * (event.clientY - start.lastY) * sensitivity) / sampleTime +
          0.35 * start.elevationVelocity;
        start.lastX = event.clientX;
        start.lastY = event.clientY;
        start.lastTime = event.timeStamp;
        setCamera(
          start.yaw + dx * sensitivity,
          start.elevation - dy * sensitivity,
        );
      }}
      onPointerUp={finish}
      onPointerCancel={finish}
      onLostPointerCapture={finish}
      onClickCapture={(event) => {
        if (
          gesture.current.moved &&
          !(event.target as Element).closest("button")
        ) {
          event.preventDefault();
          event.stopPropagation();
        }
      }}
      onKeyDown={(event) => {
        if (
          !event.shiftKey ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
            event.key,
          )
        )
          return;
        event.preventDefault();
        stopReset.current?.();
        stopMomentum.current?.();
        if (event.key === "ArrowLeft" || event.key === "ArrowRight")
          setCamera(
            yaw.get() + (event.key === "ArrowRight" ? 5 : -5),
            elevation.get(),
          );
        else
          setCamera(
            yaw.get(),
            elevation.get() + (event.key === "ArrowUp" ? 3 : -3),
          );
      }}
    >
      <span id={`${id}-instructions`} className="sr-only">
        Arrastra para girar e inclinar. Mayús y flechas giran el gráfico.
        Izquierda y derecha seleccionan capas.
      </span>
      <svg
        viewBox="0 0 650 410"
        className="absolute size-full overflow-visible"
        fill="none"
        role="group"
        aria-label="Capas de la arquitectura del producto"
        style={
          {
            "--product-motion": running && !dragging ? "running" : "paused",
          } as React.CSSProperties
        }
      >
        <defs>
          <linearGradient id={`${id}-layer`} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="currentColor" stopOpacity=".025" />
            <stop offset=".55" stopColor="currentColor" stopOpacity=".075" />
            <stop offset="1" stopColor="currentColor" stopOpacity=".035" />
          </linearGradient>
        </defs>
        <g id={`${id}-guides`}>
          {frame.guides.map((d, index) => (
            <path
              key={index}
              data-strata-guide=""
              d={d}
              stroke="currentColor"
              strokeOpacity=".23"
              strokeDasharray="2 6"
              strokeWidth=".9"
            />
          ))}
        </g>
        <g data-strata-plates="">
          {frame.paintOrder.map((index) => {
            const layer = frame.layers[index]!;
            const active = index === turn;
            return (
              <g
                key={index}
                data-strata-layer={index}
                role="button"
                tabIndex={0}
                aria-label={`Capa 0${index + 1}: ${roles[index]}`}
                aria-pressed={active}
                className="outline-none"
                style={{ outline: "none" }}
                onClick={() => onSelect(index)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(index);
                  }
                }}
              >
                <g
                  id={`${id}-paint-${index}`}
                  data-strata-active={active}
                  className="[&_path]:transition-[fill-opacity,stroke-opacity] [&_path]:duration-250 motion-reduce:[&_path]:transition-none"
                >
                  <defs>
                    <clipPath
                      id={`${id}-clip-${index}`}
                      clipPathUnits="userSpaceOnUse"
                    >
                      <path data-projection="clip" d={layer.surface} />
                    </clipPath>
                    <clipPath
                      id={`${id}-glass-${index}`}
                      clipPathUnits="userSpaceOnUse"
                    >
                      <path data-projection="glass-clip" d={layer.glassClip} />
                    </clipPath>
                    <filter
                      id={`${id}-blur-${index}`}
                      filterUnits="userSpaceOnUse"
                      primitiveUnits="userSpaceOnUse"
                      x="-64"
                      y="-64"
                      width="778"
                      height="538"
                      colorInterpolationFilters="sRGB"
                    >
                      <feGaussianBlur
                        in="SourceGraphic"
                        stdDeviation={8 * layer.textScale}
                      />
                    </filter>
                  </defs>
                  <g
                    data-strata-glass=""
                    clipPath={`url(#${id}-glass-${index})`}
                    pointerEvents="none"
                    aria-hidden
                  >
                    <rect
                      x="-64"
                      y="-64"
                      width="778"
                      height="538"
                      data-strata-glass-ground=""
                      fill="var(--strata-glass-ground)"
                    />
                    {/* SVG use instances inherit these explicit tokens; ancestor
                        theme selectors do not reliably match their shadow trees. */}
                    <g
                      filter={`url(#${id}-blur-${index})`}
                      opacity="var(--strata-glass-backdrop-opacity)"
                    >
                      <use href={`#${id}-guides`} />
                      {[0, 1].map((slot) => {
                        const behind = frame.paintOrder.slice(
                          0,
                          frame.paintOrder.indexOf(index),
                        );
                        const source = behind[slot];
                        return (
                          <use
                            key={slot}
                            data-backdrop-source=""
                            href={
                              source === undefined
                                ? undefined
                                : `#${id}-paint-${source}`
                            }
                            display={source === undefined ? "none" : "inline"}
                          />
                        );
                      })}
                    </g>
                    <rect
                      x="-64"
                      y="-64"
                      width="778"
                      height="538"
                      data-strata-glass-tint=""
                      fill="var(--strata-glass-tint)"
                    />
                  </g>
                  <path
                    data-projection="left"
                    data-strata-face="left"
                    d={layer.left}
                    fill="currentColor"
                    fillOpacity={active ? 0.09 : 0.035}
                  />
                  <path
                    data-projection="right"
                    data-strata-face="right"
                    d={layer.right}
                    fill="currentColor"
                    fillOpacity={active ? 0.23 : 0.14}
                  />
                  <path
                    data-projection="contour"
                    data-strata-contour=""
                    d={layer.contour}
                    stroke="currentColor"
                    strokeOpacity={active ? 0.65 : 0.2}
                    strokeWidth={layer.textScale}
                  />
                  <path
                    data-strata-tint=""
                    d={layer.surface}
                    data-projection="tint"
                    fill="currentColor"
                    fillOpacity={active ? 0.085 : 0}
                  />
                  <path
                    data-projection="grid"
                    data-strata-grid=""
                    d={layer.grid}
                    className="stroke-[#008b7b] dark:stroke-[#29bda8]"
                    clipPath={`url(#${id}-clip-${index})`}
                    strokeOpacity=".1"
                    strokeWidth={0.6 * layer.textScale}
                    pointerEvents="none"
                  />
                  <path
                    data-projection="surface"
                    data-strata-surface=""
                    data-strata-contour=""
                    d={layer.surface}
                    fill={`url(#${id}-layer)`}
                    stroke="currentColor"
                    strokeOpacity={active ? 0.65 : 0.27}
                    strokeWidth={layer.textScale}
                    strokeLinejoin="round"
                  />
                  <path
                    data-projection="flow"
                    className="product-flow"
                    d={layer.surface}
                    stroke="currentColor"
                    strokeWidth={1.5 * layer.textScale}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="2 98"
                    pathLength="100"
                    style={{ animationDelay: `${-index * 1.4}s` }}
                  />
                  {index === 0 && (
                    <text
                      data-projection="title"
                      x={layer.title.x}
                      y={layer.title.y}
                      fill="currentColor"
                      className="font-display"
                      textAnchor="middle"
                      fontSize={10 * layer.textScale}
                      fontWeight="600"
                      letterSpacing={1.6 * layer.textScale}
                    >
                      BINPAR / SISTEMA INTEGRADO
                    </text>
                  )}
                  <text
                    data-projection="number"
                    x={layer.number.x}
                    y={layer.number.y}
                    fill="currentColor"
                    className="font-display"
                    textAnchor="middle"
                    fontSize={11 * layer.textScale}
                    fontWeight="600"
                  >
                    0{index + 1}
                  </text>
                </g>
              </g>
            );
          })}
        </g>
      </svg>
      <button
        type="button"
        aria-label="Recuperar vista inicial del gráfico"
        title="Recuperar vista inicial"
        disabled={!rotated}
        onClick={resetView}
        className={`bg-primary-light/10 text-primary-light focus-visible:ring-primary-light/50 dark:bg-primary-dark/10 dark:text-primary-dark absolute right-0 bottom-0 grid size-8 place-items-center rounded-full outline-none focus-visible:ring-1 ${rotated ? "" : "pointer-events-none invisible"}`}
      >
        <RotateCcw size={14} aria-hidden />
      </button>
    </div>
  );
}
