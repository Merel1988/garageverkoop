"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Tooltip,
  useMap,
} from "react-leaflet";
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
        .gv-print-label {
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid #092955;
          color: #092955;
          font-weight: 600;
          font-size: 10px;
          padding: 1px 5px;
          border-radius: 6px;
          white-space: nowrap;
          box-shadow: none;
        }
        .gv-print-label::before {
          display: none !important;
        }
        @media print {
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
          style={{ height: "70vh", width: "100%" }}
          className="print:!h-[90vh]"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {pins.map((p) => (
            <CircleMarker
              key={p.id}
              center={[p.latitude, p.longitude]}
              radius={7}
              pathOptions={{
                color: "#092955",
                weight: 2,
                fillColor: "#ffd558",
                fillOpacity: 1,
              }}
            >
              <Tooltip
                permanent
                direction="right"
                offset={[8, 0]}
                className="gv-print-label"
              >
                {p.street} {p.houseNumber}
              </Tooltip>
            </CircleMarker>
          ))}
          <FitToPins pins={pins} />
        </MapContainer>
      </div>
    </>
  );
}
