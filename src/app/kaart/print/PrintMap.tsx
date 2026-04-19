"use client";

import { useEffect } from "react";
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
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 17 });
  }, [map, pins]);
  return null;
}

export default function PrintMap({ pins }: { pins: NumberedPin[] }) {
  return (
    <>
      <style>{`
        @media print {
          .leaflet-interactive {
            fill: #ffd558 !important;
            stroke: #092955 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .leaflet-control-zoom {
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
          {pins.map((p) => (
            <CircleMarker
              key={p.id}
              center={[p.latitude, p.longitude]}
              radius={9}
              pathOptions={{
                color: "#092955",
                weight: 2,
                fillColor: "#ffd558",
                fillOpacity: 1,
              }}
            />
          ))}
          <FitToPins pins={pins} />
        </MapContainer>
      </div>
    </>
  );
}
