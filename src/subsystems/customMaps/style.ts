import type { ExpressionSpecification, Map } from "maplibre-gl";
import { luminance, parseColor } from "../../utils/color";
import type { MapFile } from "./MapFile";

export const addStyle = (map: Map, mapFile: MapFile) => {
  const colorExpr = (prop: string, def: string): ExpressionSpecification => [
    "coalesce",
    ["get", prop],
    def,
  ];

  const luminanceExpr = (
    color: ExpressionSpecification
  ): ExpressionSpecification => [
    "let",
    "rgba",
    ["to-rgba", ["to-color", color]],
    [
      "+",
      ["*", 0.299, ["at", 0, ["var", "rgba"]]],
      ["*", 0.587, ["at", 1, ["var", "rgba"]]],
      ["*", 0.114, ["at", 2, ["var", "rgba"]]],
    ],
  ];

  const haloColorExpr = (
    color: ExpressionSpecification
  ): ExpressionSpecification => [
    "case",
    [">", luminanceExpr(color), 127],
    "#000000",
    "#ffffff",
  ];

  const fillColor = colorExpr("fill", "#555555");
  const strokeColor = colorExpr("stroke", "#555555");
  const markerColor = colorExpr("marker-color", "#7e7e7e");
  const markerHaloColor = haloColorExpr(colorExpr("marker-color", "#7e7e7e"));

  const metadata = {
    cursor: "pointer",
    "custom-map": true,
    "place-origin": {
      type: "custom-map",
      name: mapFile.name,
    },
  };

  map.addLayer({
    id: mapFile.sourceId + "-polygons",
    type: "fill",
    source: mapFile.sourceId,
    filter: ["in", ["geometry-type"], ["literal", ["Polygon", "MultiPolygon"]]],
    layout: {},
    paint: {
      "fill-color": fillColor,
      "fill-outline-color": strokeColor,
      "fill-opacity": ["coalesce", ["get", "fill-opacity"], 0.5],
    },
    metadata,
  });

  map.addLayer({
    id: mapFile.sourceId + "-lines",
    type: "line",
    source: mapFile.sourceId,
    filter: [
      "in",
      ["geometry-type"],
      ["literal", ["Polygon", "MultiPolygon", "LineString", "MultiLineString"]],
    ],
    layout: {
      "line-cap": "round",
      "line-join": "round",
    },
    paint: {
      "line-color": strokeColor,
      "line-width": ["coalesce", ["get", "stroke-width"], 2],
      "line-opacity": ["coalesce", ["get", "stroke-opacity"], 1],
    },
    metadata,
  });

  map.addLayer({
    id: mapFile.sourceId + "-points",
    type: "symbol",
    source: mapFile.sourceId,
    filter: ["in", ["geometry-type"], ["literal", ["Point", "MultiPoint"]]],
    layout: {
      "text-font": ["Noto Sans Regular"],
      "text-field": ["get", "title"],
      "text-offset": [0, 0.4],
      "icon-anchor": "bottom",
      "icon-overlap": "always",
      "text-optional": true,
      "text-overlap": "never",
      "icon-image": [
        "concat",
        "custom-map-",
        [
          "match",
          ["get", "marker-size"],
          "small",
          "small",
          "medium",
          "medium",
          "large",
          "large",
          "medium",
        ],
        "-",
        ["get", "marker-icon"],
        "-",
        markerColor,
      ],
    },
    paint: {
      "text-color": markerColor,
      "text-halo-color": markerHaloColor,
      "text-halo-width": 1,
    },
    metadata,
  });
};

export const removeStyle = (sourceId: string, map: Map) => {
  map.removeLayer(sourceId + "-polygons");
  map.removeLayer(sourceId + "-lines");
  map.removeLayer(sourceId + "-points");
};

export const handleStyleImageMissing = (imageId: string, map: Map) => {
  if (imageId.startsWith("custom-map-")) {
    const match = imageId.match(
      /^custom-map-(small|medium|large)-(\w?)-#([0-9A-Fa-f]+)$/
    );
    if (match !== null) {
      /* For some reason it doesn't like calling addImage() immediately */
      setTimeout(() => {
        if (!map.hasImage(imageId)) {
          const size = match[1];
          const letter = match[2];
          const color = match[3];

          const haloColor =
            luminance(parseColor(color)) > 0.5
              ? "rgba(0, 0, 0, 0.6)"
              : "rgba(255, 255, 255, 0.6)";

          const canvas = document.createElement("canvas");
          const sizePx = size === "small" ? 16 : size === "medium" ? 24 : 40;
          const margin = 4;
          canvas.width = sizePx + margin * 2;
          canvas.height = sizePx + margin * 2;

          const radius = sizePx * 0.35;
          const tanAngle = Math.acos(radius / (sizePx - radius));

          const ctx = canvas.getContext("2d");

          if (window.devicePixelRatio > 1) {
            canvas.width *= window.devicePixelRatio;
            canvas.height *= window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
          }

          ctx.fillStyle = "#" + color;
          ctx.strokeStyle = haloColor;
          ctx.lineWidth = 2;

          ctx.translate(margin, margin);

          /* draw a pin */
          let path = new Path2D();
          path.moveTo(sizePx * 0.5, sizePx);
          path.lineTo(
            sizePx * 0.5 + Math.sin(tanAngle) * radius,
            radius + Math.cos(tanAngle) * radius
          );
          path.arc(
            sizePx * 0.5,
            radius,
            radius,
            Math.PI / 2 - tanAngle,
            tanAngle - Math.PI * 1.5,
            true
          );
          path.closePath();
          ctx.stroke(path);
          ctx.fill(path);

          ctx.fillStyle = haloColor;
          if (letter !== "") {
            /* If the letter/number is not empty, draw it */
            ctx.font = `bold ${radius * 0.75}px sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(letter, radius * 0.5, sizePx * 0.5);
          } else {
            /* otherwise draw a circle */
            ctx.beginPath();
            ctx.arc(sizePx * 0.5, radius, radius * 0.4, 0, Math.PI * 2);
            ctx.fill();
          }

          map.addImage(
            imageId,
            ctx.getImageData(0, 0, canvas.width, canvas.height),
            { pixelRatio: window.devicePixelRatio }
          );
        }
      }, 100);
    }
  }
};
