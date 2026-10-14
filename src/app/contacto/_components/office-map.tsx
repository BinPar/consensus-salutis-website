"use client";

import { useEffect, useRef, useState } from "react";
import type { Map, Marker } from "maplibre-gl";
import { officeCoordinates, officeMapStyle } from "./office-map-style";
import "maplibre-gl/dist/maplibre-gl.css";
import "./office-map.css";

export function OfficeMap({ active = true }: { active?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    let visible = false;
    const update = () => {
      element.dataset.motionRunning = String(
        active && visible && !document.hidden,
      );
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      update();
    });
    observer.observe(element);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [active]);

  useEffect(() => {
    const element = container.current;
    if (!element || !root.current) return;
    let disposed = false;
    let map: Map | undefined;
    let marker: Marker | undefined;
    let themeObserver: MutationObserver | undefined;
    let resizeObserver: ResizeObserver | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        void initialize();
      },
      { rootMargin: "300px" },
    );

    async function initialize() {
      try {
        const {
          Map,
          Marker,
          NavigationControl,
          AttributionControl,
          setWorkerUrl,
        } = await import("maplibre-gl");
        if (disposed) return;
        setWorkerUrl(
          new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url)
            .href,
        );
        const isDark = () =>
          document.documentElement.classList.contains("dark");
        let dark = isDark();
        map = new Map({
          container: element!,
          style: officeMapStyle(dark),
          center: officeCoordinates,
          zoom: 15.8,
          minZoom: 12,
          maxZoom: 19,
          attributionControl: false,
          scrollZoom: false,
          dragRotate: false,
          pitchWithRotate: false,
          cooperativeGestures: true,
          locale: {
            "NavigationControl.ZoomIn": "Acercar mapa",
            "NavigationControl.ZoomOut": "Alejar mapa",
            "AttributionControl.ToggleAttribution": "Información del mapa",
            "Map.Title": "Oficinas de BinPar en Paseo de la Castellana, Madrid",
            "CooperativeGesturesHandler.MobileHelpText":
              "Usa dos dedos para mover el mapa",
            "CooperativeGesturesHandler.WindowsHelpText":
              "Usa Ctrl y la rueda para acercar el mapa",
            "CooperativeGesturesHandler.MacHelpText":
              "Usa ⌘ y la rueda para acercar el mapa",
          },
        });
        map.touchZoomRotate.disableRotation();
        map.addControl(
          new NavigationControl({ showCompass: false }),
          "top-right",
        );
        map.addControl(
          new AttributionControl({ compact: true }),
          "bottom-right",
        );
        map.on("load", () => {
          if (!disposed) setStatus("ready");
        });
        map.on("error", () => {
          if (!disposed && !map?.loaded()) setStatus("error");
        });
        const pin = document.createElement("a");
        pin.className = "office-map-marker";
        pin.href = "https://g.page/binpar-sl?share";
        pin.target = "_blank";
        pin.rel = "noopener noreferrer";
        pin.setAttribute(
          "aria-label",
          "Oficinas de BinPar · Abrir ubicación en Google Maps (pestaña nueva)",
        );
        // Same outline waves and timing as the Cases water ripple.
        const waves = Array.from(
          { length: 4 },
          (_, wave) =>
            `<circle cx="80" cy="80" r="40" fill="none" stroke="currentColor" stroke-width="0.8" vector-effect="non-scaling-stroke" class="office-map-marker-ripple" style="animation-delay:${-wave * 0.7}s" />`,
        ).join("");
        pin.innerHTML = `<span class="office-map-marker-target"><svg class="office-map-marker-waves" viewBox="0 0 160 160" aria-hidden="true" focusable="false">${waves}</svg><span class="office-map-marker-mark"><img class="office-map-logo-light" src="/logos/binpar-brand/binpar-isotipo-light.svg" alt="" /><img class="office-map-logo-dark" src="/logos/binpar-brand/binpar-isotipo-dark.svg" alt="" /></span></span><span class="office-map-marker-label">BinPar</span>`;
        marker = new Marker({ element: pin, anchor: "center" })
          .setLngLat(officeCoordinates)
          .addTo(map);
        themeObserver = new MutationObserver(() => {
          const next = isDark();
          if (next === dark) return;
          dark = next;
          map?.setStyle(officeMapStyle(dark));
        });
        themeObserver.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ["class"],
        });
        resizeObserver = new ResizeObserver(() => map?.resize());
        resizeObserver.observe(element!);
      } catch {
        if (!disposed) setStatus("error");
      }
    }
    observer.observe(root.current);
    return () => {
      disposed = true;
      observer.disconnect();
      themeObserver?.disconnect();
      resizeObserver?.disconnect();
      marker?.remove();
      map?.remove();
    };
  }, []);

  return (
    <div
      ref={root}
      className="office-map absolute inset-0"
      data-map-status={status}
      data-map-painted={active}
    >
      <div ref={container} className="absolute inset-0" />
      {status !== "ready" && (
        <div className="office-map-status" role="status">
          {status === "loading"
            ? "Cargando mapa…"
            : "No se ha podido cargar el mapa."}
          {status === "error" && (
            <a
              href="https://g.page/binpar-sl?share"
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir ubicación en Google Maps
            </a>
          )}
        </div>
      )}
    </div>
  );
}
