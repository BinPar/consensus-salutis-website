import type { StyleSpecification } from "maplibre-gl";

export const officeCoordinates: [number, number] = [-3.68955, 40.43538];

export function officeMapStyle(dark: boolean): StyleSpecification {
  const colors = dark
    ? {
        base: "#081827",
        land: "#0c202e",
        park: "#143a40",
        water: "#14505b",
        building: "#142d3d",
        outline: "#234350",
        road: "#294554",
        casing: "#1b3442",
        label: "#a9bacb",
        accent: "#00bcbb",
      }
    : {
        base: "#e8f2f7",
        land: "#e0edf2",
        park: "#cce4e3",
        water: "#a9d4df",
        building: "#cbdfe7",
        outline: "#bdd4df",
        road: "#fbfdff",
        casing: "#c2d9e1",
        label: "#526d83",
        accent: "#006d79",
      };
  return {
    version: 8,
    name: dark ? "BinPar · Madrid · Oscuro" : "BinPar · Madrid · Claro",
    glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
    sources: {
      streets: {
        type: "vector",
        url: "https://tiles.openfreemap.org/planet",
        attribution:
          '<a href="https://openfreemap.org/" target="_blank">OpenFreeMap</a> · <a href="https://www.openmaptiles.org/" target="_blank">OpenMapTiles</a> · © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
      },
    },
    layers: [
      {
        id: "background",
        type: "background",
        paint: { "background-color": colors.base },
      },
      {
        id: "land",
        type: "fill",
        source: "streets",
        "source-layer": "landuse",
        paint: { "fill-color": colors.land },
      },
      {
        id: "green-cover",
        type: "fill",
        source: "streets",
        "source-layer": "landcover",
        filter: ["in", ["get", "class"], ["literal", ["wood", "grass"]]],
        paint: { "fill-color": colors.park },
      },
      {
        id: "parks",
        type: "fill",
        source: "streets",
        "source-layer": "park",
        paint: { "fill-color": colors.park },
      },
      {
        id: "water",
        type: "fill",
        source: "streets",
        "source-layer": "water",
        paint: { "fill-color": colors.water },
      },
      {
        id: "buildings",
        type: "fill",
        source: "streets",
        "source-layer": "building",
        minzoom: 13,
        paint: {
          "fill-color": colors.building,
          "fill-outline-color": colors.outline,
        },
      },
      {
        id: "road-edges",
        type: "line",
        source: "streets",
        "source-layer": "transportation",
        filter: [
          "!",
          ["in", ["get", "class"], ["literal", ["rail", "transit", "ferry"]]],
        ],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": colors.casing,
          "line-width": [
            "interpolate",
            ["linear"],
            ["zoom"],
            12,
            1,
            16,
            [
              "match",
              ["get", "class"],
              ["primary", "secondary", "trunk", "motorway"],
              14,
              7,
            ],
            19,
            [
              "match",
              ["get", "class"],
              ["primary", "secondary", "trunk", "motorway"],
              38,
              22,
            ],
          ],
        },
      },
      {
        id: "roads",
        type: "line",
        source: "streets",
        "source-layer": "transportation",
        filter: [
          "!",
          ["in", ["get", "class"], ["literal", ["rail", "transit", "ferry"]]],
        ],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": colors.road,
          "line-width": [
            "interpolate",
            ["linear"],
            ["zoom"],
            12,
            0.5,
            16,
            [
              "match",
              ["get", "class"],
              ["primary", "secondary", "trunk", "motorway"],
              11,
              5,
            ],
            19,
            [
              "match",
              ["get", "class"],
              ["primary", "secondary", "trunk", "motorway"],
              34,
              18,
            ],
          ],
        },
      },
      {
        id: "street-names",
        type: "symbol",
        source: "streets",
        "source-layer": "transportation_name",
        minzoom: 14,
        layout: {
          "symbol-placement": "line",
          "symbol-spacing": 280,
          "text-field": [
            "coalesce",
            ["get", "name:es"],
            ["get", "name:latin"],
            ["get", "name"],
          ],
          "text-font": ["Noto Sans Regular"],
          "text-size": 12,
          "text-max-angle": 30,
        },
        paint: {
          "text-color": colors.label,
          "text-halo-color": colors.base,
          "text-halo-width": 1.5,
        },
      },
      {
        id: "neighbourhoods",
        type: "symbol",
        source: "streets",
        "source-layer": "place",
        minzoom: 12,
        filter: [
          "in",
          ["get", "class"],
          ["literal", ["suburb", "quarter", "neighbourhood"]],
        ],
        layout: {
          "text-field": ["coalesce", ["get", "name:es"], ["get", "name"]],
          "text-font": ["Noto Sans Regular"],
          "text-size": 13,
          "text-letter-spacing": 0.12,
          "text-transform": "uppercase",
        },
        paint: {
          "text-color": colors.accent,
          "text-halo-color": colors.base,
          "text-halo-width": 2,
        },
      },
    ],
  };
}
