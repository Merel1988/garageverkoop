"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { SAMBEEK_CENTER, DEFAULT_ZOOM } from "@/lib/event";
import type { NumberedPin } from "./types";

function numberedIcon(num: number) {
  return L.divIcon({
    className: "numbered-pin",
    html: `<div class="gv-print-pin">${num}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

function FitToPins({ pins }: { pins: NumberedPin[] }) {
  const map = useMap();
  useEffect(() => {
    if (pins.length === 0) return;
    const bounds = L.latLngBounds(
      pins.map((p) => [p.latitude, p.longitude] as [number, number]),
    );
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 17 });
  }, [map, pins]);
  return null;
}

export default function PrintMap({ pins }: { pins: NumberedPin[] }) {
  const iconCache = useRef(new Map<number, L.DivIcon>());
  const markers = useMemo(
    () =>
      pins.map((p) => {
        let icon = iconCache.current.get(p.number);
        if (!icon) {
          icon = numberedIcon(p.number);
          iconCache.current.set(p.number, icon);
        }
        return { pin: p, icon };
      }),
    [pins],
  );

  return (
    <>
      <style>{`
        .gv-print-pin {
          width: 30px;
          height: 30px;
          background: #ffd558;
          color: #092955;
          border: 2px solid #092955;
          border-radius: 50%;
          font-weight: 700;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 2px rgba(0,0,0,0.25);
        }
        @media print {
          .gv-print-pin {
            box-shadow: none;
            background: #ffd558 !important;
            border-color: #000 !important;
            color: #000 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .leaflet-control-zoom,
          .leaflet-control-attribution a.leaflet-attribution-flag {
            display: none !important;
          }
        }
      `}</style>
      <div className="rounded-2xl overflow-hidden print:rounded-none">
        <MapContainer
          center={SAMBEEK_CENTER}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom={false}
          style={{ height: "420px", width: "100%" }}
          className="print:!h-[380px]"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {markers.map(({ pin, icon }) => (
            <Marker
              key={pin.id}
              position={[pin.latitude, pin.longitude]}
              icon={icon}
            />
          ))}
          <FitToPins pins={pins} />
        </MapContainer>
      </div>
    </>
  );
}
