"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { SAMBEEK_CENTER, MAP_ZOOM } from "@/lib/event";
import type { RegistrationPin } from "./types";

function FitToPins({ pins }: { pins: RegistrationPin[] }) {
  const map = useMap();
  useEffect(() => {
    if (pins.length === 0) return;
    const bounds = L.latLngBounds(
      pins.map((p) => [p.latitude, p.longitude] as [number, number]),
    );
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 17 });
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

function LabelLayer({ pins }: { pins: RegistrationPin[] }) {
  const map = useMap();
  const [pane, setPane] = useState<HTMLElement | null>(null);
  const [labels, setLabels] = useState<Placed[]>([]);

  useEffect(() => {
    let p = map.getPane("gv-labels");
    if (!p) {
      p = map.createPane("gv-labels");
      p.style.zIndex = "620";
      p.style.pointerEvents = "none";
    }
    setPane(p);
  }, [map]);

  useEffect(() => {
    function relayout() {
      const container = map.getContainer();
      const W = container.clientWidth;
      const H = container.clientHeight;
      const nw = map.containerPointToLayerPoint([0, 0]);
      const se = map.containerPointToLayerPoint([W, H]);
      const minX = nw.x + 2;
      const maxX = se.x - 2;
      const minY = nw.y + 2;
      const maxY = se.y - 2;

      const pts = pins.map((p) => {
        const pt = map.latLngToLayerPoint([p.latitude, p.longitude]);
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
        Math.max(minX, Math.min(maxX - w, x));

      for (const p of order) {
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
            const outOfBounds = y < minY || y + LABEL_H > maxY;
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
          const fallbackY =
            p.pinY > (minY + maxY) / 2 ? minY : maxY - LABEL_H;
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

    relayout();
    map.on("zoomend", relayout);
    map.on("resize", relayout);
    return () => {
      map.off("zoomend", relayout);
      map.off("resize", relayout);
    };
  }, [map, pins]);

  if (!pane) return null;

  return createPortal(
    <>
      <svg
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1,
          height: 1,
          overflow: "visible",
        }}
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
          className="gv-map-label"
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
    </>,
    pane,
  );
}

export default function SambeekMap({
  registrations,
}: {
  registrations: RegistrationPin[];
}) {
  const [selected, setSelected] = useState<string[]>([]);

  const selectedPins = useMemo(
    () =>
      selected
        .map((id) => registrations.find((r) => r.id === id))
        .filter((r): r is RegistrationPin => Boolean(r)),
    [selected, registrations],
  );

  function toggle(id: string) {
    setSelected((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id],
    );
  }

  const routeUrls = buildRouteUrls(selectedPins);
  const allSelected =
    registrations.length > 0 && selected.length === registrations.length;

  function toggleAll() {
    setSelected(allSelected ? [] : registrations.map((r) => r.id));
  }

  return (
    <div className="relative">
      <style>{`
        .gv-map-label {
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
          .leaflet-interactive {
            fill: #ffd558 !important;
            stroke: #092955 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .gv-map-label {
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

      <div className="print:hidden flex flex-wrap items-center gap-3 mb-3 justify-end">
        {registrations.length > 1 && (
          <button
            type="button"
            onClick={toggleAll}
            className="bg-accent-300 hover:bg-accent-400 text-brand-800 font-semibold px-4 py-2 rounded-full text-sm transition-colors"
          >
            {allSelected ? "Deselecteer alle" : "Selecteer alle huizen"}
          </button>
        )}
        <button
          type="button"
          onClick={() => window.print()}
          className="bg-brand-700 hover:bg-brand-800 text-white font-semibold px-4 py-2 rounded-full text-sm transition-colors"
        >
          Print kaart
        </button>
      </div>

      <div className="h-[70vh] min-h-[380px] rounded-3xl overflow-hidden print:rounded-none print:!h-[90vh]">
        <MapContainer
          center={SAMBEEK_CENTER}
          zoom={MAP_ZOOM}
          scrollWheelZoom
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {registrations.map((r) => {
            const isSelected = selected.includes(r.id);
            const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${r.latitude},${r.longitude}`;
            return (
              <CircleMarker
                key={r.id}
                center={[r.latitude, r.longitude]}
                radius={7}
                pathOptions={{
                  color: "#092955",
                  weight: 2,
                  fillColor: isSelected ? "#f47b68" : "#ffd558",
                  fillOpacity: 1,
                }}
              >
                <Popup>
                  <div className="text-sm space-y-2 min-w-[200px]">
                    <div className="font-semibold text-brand-800">
                      {r.street} {r.houseNumber}
                    </div>
                    <a
                      href={navUrl}
                      target="_blank"
                      rel="noopener"
                      style={{ color: "#ffffff" }}
                      className="inline-block bg-brand-700 hover:bg-brand-800 font-semibold px-3 py-1.5 rounded-full no-underline"
                    >
                      Navigeer hiernaartoe
                    </a>
                    <label className="flex gap-2 items-center text-xs pt-2 border-t border-gray-200">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggle(r.id)}
                        className="accent-brand-700"
                      />
                      Voeg toe aan mijn route
                    </label>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
          <FitToPins pins={registrations} />
          <LabelLayer pins={registrations} />
        </MapContainer>
      </div>

      {selectedPins.length > 0 && routeUrls.length > 0 && (
        <div className="fixed bottom-3 sm:bottom-4 inset-x-3 sm:inset-x-0 flex justify-center z-[1000] pointer-events-none print:hidden">
          <div className="pointer-events-auto bg-white ring-1 ring-brand-100 shadow-xl rounded-2xl px-3 py-2 flex flex-wrap items-center gap-2 max-w-[min(100%,40rem)]">
            <span className="text-sm font-semibold text-brand-800 whitespace-nowrap">
              {selectedPins.length}{" "}
              {selectedPins.length === 1 ? "garage" : "garages"} gekozen
            </span>
            {routeUrls.map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener"
                style={{ color: "#ffffff" }}
                className="no-underline bg-brand-700 hover:bg-brand-800 font-semibold px-3.5 py-1.5 rounded-full text-sm whitespace-nowrap"
              >
                {routeUrls.length === 1 ? "Open route" : `Route ${i + 1}`}
              </a>
            ))}
            <button
              type="button"
              onClick={() => setSelected([])}
              className="text-gray-400 hover:text-gray-800 w-7 h-7 flex items-center justify-center shrink-0"
              aria-label="Route wissen"
            >
              ✕
            </button>
            {routeUrls.length > 1 && (
              <p className="basis-full text-xs text-gray-600 leading-snug">
                Google Maps kan maximaal 10 stops per route aan, dus we hebben
                het opgesplitst in {routeUrls.length} delen. Start met Route 1
                en open daarna Route 2 als je verder loopt.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Google Maps' URL directions endpoint accepts max 9 waypoints + 1 destination
// (10 stops total). Chunk bigger selections into multiple routes.
const MAX_STOPS_PER_ROUTE = 10;

function buildRouteUrls(pins: RegistrationPin[]): string[] {
  if (pins.length === 0) return [];
  const urls: string[] = [];
  for (let i = 0; i < pins.length; i += MAX_STOPS_PER_ROUTE) {
    const chunk = pins.slice(i, i + MAX_STOPS_PER_ROUTE);
    const destination = chunk[chunk.length - 1];
    const waypoints = chunk.slice(0, -1);
    const params = new URLSearchParams();
    params.set("api", "1");
    params.set("travelmode", "walking");
    params.set("destination", `${destination.latitude},${destination.longitude}`);
    if (waypoints.length > 0) {
      params.set(
        "waypoints",
        waypoints.map((p) => `${p.latitude},${p.longitude}`).join("|"),
      );
    }
    urls.push(`https://www.google.com/maps/dir/?${params.toString()}`);
  }
  return urls;
}
