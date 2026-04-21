"use client";

import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { MapContainer, TileLayer, CircleMarker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { SAMBEEK_CENTER, DEFAULT_ZOOM } from "@/lib/event";
import type { NumberedPin } from "./types";

function FitToPins({ pins }: { pins: NumberedPin[] }) {
  const map = useMap();
  useEffect(() => {
    if (pins.length === 0) return;
    const bounds = L.latLngBounds(
      pins.map((p) => [p.latitude, p.longitude] as [number, number]),
    );
    const fit = () => {
      map.invalidateSize({ animate: false });
      map.fitBounds(bounds, {
        padding: [40, 40],
        maxZoom: 17,
        animate: false,
      });
    };
    fit();
    // ResizeObserver catches any container size change — including print CSS
    // shrinking the viewport — regardless of whether the window also resizes.
    const ro = new ResizeObserver(() => fit());
    ro.observe(map.getContainer());
    // matchMedia('print') fires AFTER print CSS has been applied, which is
    // the only moment the container has its real print dimensions in every
    // browser. beforeprint fires too early in Firefox.
    const mql = window.matchMedia("print");
    const onChange = () => fit();
    mql.addEventListener("change", onChange);
    return () => {
      ro.disconnect();
      mql.removeEventListener("change", onChange);
    };
  }, [map, pins]);
  return null;
}

type Placed = {
  id: string;
  text: string;
  pinX: number;
  pinY: number;
  labelX: number;
  labelY: number;
  width: number;
  height: number;
};

const LABEL_H = 16;
const CHAR_W = 6.3;
const PAD_X = 12;
const GAP = 3;
const PIN_CLEAR = 9;
const OFFSET = 12;

function LabelLayer({ pins }: { pins: NumberedPin[] }) {
  const map = useMap();
  const [labels, setLabels] = useState<Placed[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    function relayout() {
      const container = map.getContainer();
      const W = container.clientWidth;
      const H = container.clientHeight;
      setSize({ w: W, h: H });

      const pts = pins.map((p) => {
        const pt = map.latLngToContainerPoint([p.latitude, p.longitude]);
        const text = `${p.street} ${p.houseNumber}`;
        return {
          id: p.id,
          text,
          pinX: pt.x,
          pinY: pt.y,
          width: Math.ceil(text.length * CHAR_W) + PAD_X,
        };
      });

      const order = [...pts].sort((a, b) => a.pinY - b.pinY);
      const placed: Placed[] = [];

      const collidesWithPlaced = (
        x: number,
        y: number,
        w: number,
        h: number,
      ) => {
        for (const pl of placed) {
          if (
            x < pl.labelX + pl.width + GAP &&
            x + w + GAP > pl.labelX &&
            y < pl.labelY + pl.height + GAP &&
            y + h + GAP > pl.labelY
          )
            return true;
        }
        return false;
      };

      const collidesWithPins = (
        x: number,
        y: number,
        w: number,
        h: number,
      ) => {
        for (const other of pts) {
          if (
            other.pinX > x - PIN_CLEAR &&
            other.pinX < x + w + PIN_CLEAR &&
            other.pinY > y - PIN_CLEAR &&
            other.pinY < y + h + PIN_CLEAR
          )
            return true;
        }
        return false;
      };

      const clampX = (x: number, w: number) =>
        Math.max(2, Math.min(W - w - 2, x));

      for (const p of order) {
        // Direction seeds: right, left, below, above. For right/left we let
        // the push-down loop walk y until a slot is free; for below/above we
        // walk away from the pin so labels don't slide back over it.
        const seeds: Array<{ x: number; y: number; dy: number }> = [
          { x: p.pinX + OFFSET, y: p.pinY - LABEL_H / 2, dy: LABEL_H + GAP },
          {
            x: p.pinX - OFFSET - p.width,
            y: p.pinY - LABEL_H / 2,
            dy: LABEL_H + GAP,
          },
          { x: p.pinX - p.width / 2, y: p.pinY + OFFSET, dy: LABEL_H + GAP },
          {
            x: p.pinX - p.width / 2,
            y: p.pinY - OFFSET - LABEL_H,
            dy: -(LABEL_H + GAP),
          },
        ];

        let chosen: Placed | null = null;
        for (const seed of seeds) {
          const x = clampX(seed.x, p.width);
          let y = seed.y;
          for (let tries = 0; tries < 60; tries++) {
            const outOfBounds = y < 2 || y + LABEL_H > H - 2;
            const bad =
              outOfBounds ||
              collidesWithPlaced(x, y, p.width, LABEL_H) ||
              collidesWithPins(x, y, p.width, LABEL_H);
            if (!bad) {
              chosen = {
                id: p.id,
                text: p.text,
                pinX: p.pinX,
                pinY: p.pinY,
                labelX: x,
                labelY: y,
                width: p.width,
                height: LABEL_H,
              };
              break;
            }
            y += seed.dy;
          }
          if (chosen) break;
        }

        if (!chosen) {
          // Last resort: place at bottom edge, shifted away from pin so it
          // can't cover its own dot.
          const fallbackY =
            p.pinY > H / 2 ? 2 : Math.max(2, H - LABEL_H - 2);
          chosen = {
            id: p.id,
            text: p.text,
            pinX: p.pinX,
            pinY: p.pinY,
            labelX: clampX(p.pinX - p.width / 2, p.width),
            labelY: fallbackY,
            width: p.width,
            height: LABEL_H,
          };
        }
        placed.push(chosen);
      }

      setLabels(placed);
    }

    function relayoutSync() {
      flushSync(() => relayout());
    }

    relayout();
    map.on("zoomend", relayout);
    map.on("moveend", relayout);
    map.on("resize", relayout);

    // Force a synchronous label re-layout + render when print CSS kicks in,
    // so the browser's print snapshot sees the freshly placed labels rather
    // than the screen-sized ones that React would otherwise commit on the
    // next tick.
    const mql = window.matchMedia("print");
    mql.addEventListener("change", relayoutSync);

    return () => {
      map.off("zoomend", relayout);
      map.off("moveend", relayout);
      map.off("resize", relayout);
      mql.removeEventListener("change", relayoutSync);
    };
  }, [map, pins]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 700,
      }}
    >
      <svg
        width={size.w}
        height={size.h}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {labels.map((l) => {
          const cx = l.labelX + l.width / 2;
          const cy = l.labelY + l.height / 2;
          const anchorX =
            l.pinX < l.labelX
              ? l.labelX
              : l.pinX > l.labelX + l.width
                ? l.labelX + l.width
                : cx;
          const anchorY =
            l.pinY < l.labelY
              ? l.labelY
              : l.pinY > l.labelY + l.height
                ? l.labelY + l.height
                : cy;
          return (
            <line
              key={l.id}
              x1={l.pinX}
              y1={l.pinY}
              x2={anchorX}
              y2={anchorY}
              stroke="#092955"
              strokeWidth={1}
            />
          );
        })}
      </svg>
      {labels.map((l) => (
        <div
          key={l.id}
          className="gv-print-label"
          style={{
            position: "absolute",
            left: l.labelX,
            top: l.labelY,
            width: l.width,
            height: l.height,
            lineHeight: `${l.height - 2}px`,
          }}
        >
          {l.text}
        </div>
      ))}
    </div>
  );
}

export default function PrintMap({ pins }: { pins: NumberedPin[] }) {
  return (
    <>
      <style>{`
        .gv-print-label {
          box-sizing: border-box;
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid #092955;
          color: #092955;
          font-weight: 600;
          font-size: 10px;
          padding: 0 5px;
          border-radius: 4px;
          white-space: nowrap;
          text-align: center;
        }
        @media print {
          @page { size: A4 portrait; margin: 10mm; }
          html, body { height: auto !important; }
          .leaflet-interactive {
            fill: #ffd558 !important;
            stroke: #092955 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .gv-print-label {
            background: #ffffff !important;
            color: #000000 !important;
            border-color: #000000 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .leaflet-control-zoom,
          .leaflet-control-attribution {
            display: none !important;
          }
        }
      `}</style>
      <div className="rounded-2xl overflow-hidden print:rounded-none relative print:h-full">
        <MapContainer
          center={SAMBEEK_CENTER}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom={false}
          style={{ height: "75vh", width: "100%" }}
          className="print:!h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {pins.map((p) => (
            <CircleMarker
              key={p.id}
              center={[p.latitude, p.longitude]}
              radius={6}
              pathOptions={{
                color: "#092955",
                weight: 2,
                fillColor: "#ffd558",
                fillOpacity: 1,
              }}
            />
          ))}
          <FitToPins pins={pins} />
          <LabelLayer pins={pins} />
        </MapContainer>
      </div>
    </>
  );
}
