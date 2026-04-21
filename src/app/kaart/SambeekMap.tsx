"use client";

import { useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { SAMBEEK_CENTER, MAP_ZOOM } from "@/lib/event";
import type { RegistrationPin } from "./types";

const pinIcon = L.divIcon({
  className: "gv-pin",
  html: `<svg width="24" height="32" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M16 1C7.72 1 1 7.72 1 16c0 10.5 15 25 15 25s15-14.5 15-25c0-8.28-6.72-15-15-15z"
      fill="#f47b68" stroke="#ffffff" stroke-width="2"/>
    <circle cx="16" cy="16" r="5" fill="#ffffff"/>
  </svg>`,
  iconSize: [24, 32],
  iconAnchor: [12, 31],
  popupAnchor: [0, -28],
});

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
      {registrations.length > 1 && (
        <div className="flex justify-end mb-3">
          <button
            type="button"
            onClick={toggleAll}
            className="bg-accent-300 hover:bg-accent-400 text-brand-800 font-semibold px-4 py-2 rounded-full text-sm transition-colors"
          >
            {allSelected ? "Deselecteer alle" : "Selecteer alle adressen"}
          </button>
        </div>
      )}
      <div className="h-[70vh] min-h-[380px] rounded-3xl overflow-hidden">
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
              <Marker
                key={r.id}
                position={[r.latitude, r.longitude]}
                icon={pinIcon}
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
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {selectedPins.length > 0 && routeUrls.length > 0 && (
        <div className="fixed bottom-3 sm:bottom-4 inset-x-3 sm:inset-x-0 flex justify-center z-[1000] pointer-events-none">
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
