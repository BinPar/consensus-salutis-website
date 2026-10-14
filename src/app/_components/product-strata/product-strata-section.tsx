"use client";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ProductStrataContent } from "./product-strata-scene";
export function useProductEntrance() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: "some" });
  const reduced = !!useReducedMotion();
  const [painted, setPainted] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  useEffect(() => {
    let previous = window.scrollY;
    const update = (initial = false) => {
      const r = ref.current?.getBoundingClientRect();
      if (!r?.width || !r.height) return;
      const y = window.scrollY;
      const edge = innerHeight * 0.85;
      const amount = Math.max(0, Math.min(r.bottom, edge) - Math.max(r.top, 0));
      if (
        (initial && r.top <= edge - Math.min(r.height * 0.2, 160)) ||
        (y > previous &&
          (r.bottom <= 0 || amount >= Math.min(r.height * 0.2, 160)))
      )
        setPainted(true);
      if (y < previous && r.top >= edge) setPainted(false);
      previous = y;
    };
    const scroll = () => update();
    const resize = () => update(true);
    const visibility = () => setTabVisible(!document.hidden);
    update(true);
    visibility();
    const raf = requestAnimationFrame(() => update(true));
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  return {
    ref,
    painted: painted || reduced,
    reduced,
    running: painted && inView && tabVisible && !reduced,
  };
}

export function ProductStrataSection({
  panelRef,
  visible = true,
  layout = "vertical",
}: {
  panelRef?: (node: HTMLElement | null) => void;
  visible?: boolean;
  layout?: "vertical" | "horizontal" | "mobile";
}) {
  const { ref, painted, running, reduced } = useProductEntrance();
  const shown = reduced || (visible && painted);
  return (
    <section
      ref={(node) => {
        ref.current = node;
        panelRef?.(node);
      }}
      aria-label="Producto"
      data-home-product="strata-3"
      data-product-direction="strata-3"
      data-product-painted={shown}
      className={`relative overflow-hidden bg-white dark:bg-[#06111f] ${layout === "horizontal" ? "flex h-full w-screen shrink-0 items-center px-10 py-12" : layout === "mobile" ? "px-5 py-14 sm:px-10 sm:py-18" : "px-10 py-18"}`}
    >
      <motion.div
        className="relative z-10 mx-auto w-full max-w-7xl"
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: shown ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 0.5 }}
        style={
          {
            "--product-motion": running && visible ? "running" : "paused",
          } as CSSProperties
        }
      >
        <ProductStrataContent
          key={shown ? "painted" : "unpainted"}
          reduced={reduced}
          running={running && visible}
        />
      </motion.div>
    </section>
  );
}
