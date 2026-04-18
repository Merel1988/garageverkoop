"use client";

import { useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { SAMBEEK_CENTER, DEFAULT_ZOOM } from "@/lib/event";
import type { RegistrationPin } from "./types";

// Leaflet's default marker icon URLs are broken under bundlers — serve them
// from /public/leaflet/ instead.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "/leaflet/marker-icon.png",
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  shadowUrl: "/leaflet/marker-shadow.png",
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

  const routeUrl = buildRouteUrl(selectedPins);

  return (
    <div className="relative">
      <div className="h-[70vh] min-h-[380px] rounded-2xl overflow-hidden ring-1 ring-brand-100 shadow-sm">
        <MapContainer
          center={SAMBEEK_CENTER}
          zoom={DEFAULT_ZOOM}
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
              <Marker key={r.id} position={[r.latitude, r.longitude]}>
                <Popup>
                  <div className="text-sm space-y-2 min-w-[200px]">
                    <div>
                      <strong>{r.name}</strong>
                      <br />
                      {r.street} {r.houseNumber}
                    </div>
                    <a
                      href={navUrl}
                      target="_blank"
                      rel="noopener"
                      className="inline-block bg-brand-700 text-white font-semibold px-3 py-1.5 rounded-full no-underline"
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

      {selectedPins.length > 0 && routeUrl && (
        <div className="fixed bottom-3 sm:bottom-4 inset-x-3 sm:inset-x-0 flex justify-center z-[1000] pointer-events-none">
          <div className="pointer-events-auto bg-white ring-1 ring-brand-100 shadow-xl rounded-full px-3 sm:pl-5 py-2 flex items-center gap-2 sm:gap-3 max-w-full">
            <span className="hidden sm:inline text-sm font-medium text-brand-800 whitespace-nowrap">
              {selectedPins.length}{" "}
              {selectedPins.length === 1 ? "garage" : "garages"} gekozen
            </span>
            <span className="sm:hidden text-sm font-semibold text-brand-800 bg-accent-300 rounded-full w-7 h-7 flex items-center justify-center shrink-0">
              {selectedPins.length}
            </span>
            <a
              href={routeUrl}
              target="_blank"
              rel="noopener"
              className="no-underline bg-brand-700 hover:bg-brand-800 text-white font-semibold px-4 py-2 rounded-full text-sm whitespace-nowrap"
            >
              Open route
            </a>
            <button
              type="button"
              onClick={() => setSelected([])}
              className="text-gray-400 hover:text-gray-800 w-7 h-7 flex items-center justify-center shrink-0"
              aria-label="Route wissen"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function buildRouteUrl(pins: RegistrationPin[]): string | null {
  if (pins.length === 0) return null;
  const destination = pins[pins.length - 1];
  const waypoints = pins.slice(0, -1);
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
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
