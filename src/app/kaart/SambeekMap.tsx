"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { SAMBEEK_CENTER, MAP_ZOOM } from "@/lib/event";
import type { RegistrationPin } from "./types";

function FitToPins({ registrations }: { registrations: RegistrationPin[] }) {
  const map = useMap();

  useEffect(() => {
    if (registrations.length === 0) return;
    if (registrations.length === 1) {
      const r = registrations[0];
      map.setView([r.latitude, r.longitude], MAP_ZOOM);
      return;
    }
    const bounds = L.latLngBounds(
      registrations.map((r) => [r.latitude, r.longitude] as [number, number]),
    );
    map.fitBounds(bounds, { padding: [10, 10], maxZoom: MAP_ZOOM });
  }, [map, registrations]);

  useEffect(() => {
    const handler = () => {
      if (registrations.length < 2) return;
      const bounds = L.latLngBounds(
        registrations.map((r) => [r.latitude, r.longitude] as [number, number]),
      );
      map.fitBounds(bounds, { padding: [10, 10], maxZoom: MAP_ZOOM });
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [map, registrations]);

  return null;
}

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
  headerExtra,
}: {
  registrations: RegistrationPin[];
  headerExtra?: ReactNode;
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

  const [userLocation, setUserLocation] = useState<Coord | null>(null);
  const [locating, setLocating] = useState(false);

  const orderedPins = useMemo(
    () => orderForWalking(selectedPins, userLocation ?? undefined),
    [selectedPins, userLocation],
  );
  const routeUrls = buildRouteUrls(orderedPins);
  const allSelected =
    registrations.length > 0 && selected.length === registrations.length;

  function toggleAll() {
    setSelected(allSelected ? [] : registrations.map((r) => r.id));
  }

  function navigateTo(url: string) {
    // Try a new tab first; if the popup blocker rejects (common on mobile
    // after an async geolocation prompt), fall back to navigating the
    // current tab so the user always ends up in Google Maps.
    const win = window.open(url, "_blank", "noopener");
    if (!win) window.location.href = url;
  }

  function openRoute(index: number) {
    if (userLocation || !navigator.geolocation) {
      navigateTo(routeUrls[index]);
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: Coord = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        const fresh = buildRouteUrls(orderForWalking(selectedPins, loc));
        setUserLocation(loc);
        setLocating(false);
        navigateTo(fresh[index] ?? fresh[0]);
      },
      () => {
        setLocating(false);
        navigateTo(routeUrls[index]);
      },
      { timeout: 8000, maximumAge: 60_000 },
    );
  }

  return (
    <div className="relative">
      {(registrations.length > 1 || headerExtra) && (
        <div className="flex flex-wrap justify-end gap-2 mb-3">
          {headerExtra}
          {registrations.length > 1 && (
            <button
              type="button"
              onClick={toggleAll}
              className="bg-accent-300 hover:bg-accent-400 text-brand-800 font-semibold px-4 py-2 rounded-full text-sm transition-colors"
            >
              {allSelected ? "Deselecteer alle" : "Selecteer alle adressen"}
            </button>
          )}
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
          <FitToPins registrations={registrations} />
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
            {routeUrls.map((_url, i) => (
              <button
                key={i}
                type="button"
                disabled={locating}
                onClick={() => openRoute(i)}
                style={{ color: "#ffffff" }}
                className="bg-brand-700 hover:bg-brand-800 disabled:opacity-70 disabled:cursor-wait font-semibold px-3.5 py-1.5 rounded-full text-sm whitespace-nowrap"
              >
                {locating
                  ? "Locatie ophalen..."
                  : routeUrls.length === 1
                    ? "Open route"
                    : `Route ${i + 1}`}
              </button>
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

type Coord = { latitude: number; longitude: number };

function distSq(a: Coord, b: Coord): number {
  const dlat = a.latitude - b.latitude;
  const dlng = a.longitude - b.longitude;
  return dlat * dlat + dlng * dlng;
}

// Reorder selected pins for a sensible walking route. Starts at the pin
// closest to `origin` if provided (e.g. user's GPS location), otherwise
// at the westernmost pin so the route is deterministic. From there the
// route greedily walks to the nearest unvisited pin (nearest-neighbor).
function orderForWalking<T extends Coord & { id: string }>(
  pins: T[],
  origin?: Coord,
): T[] {
  if (pins.length <= 1) return pins;
  let startIdx = 0;
  if (origin) {
    let best = distSq(origin, pins[0]);
    for (let i = 1; i < pins.length; i++) {
      const d = distSq(origin, pins[i]);
      if (d < best) {
        best = d;
        startIdx = i;
      }
    }
  } else {
    let bestLng = pins[0].longitude;
    for (let i = 1; i < pins.length; i++) {
      if (pins[i].longitude < bestLng) {
        bestLng = pins[i].longitude;
        startIdx = i;
      }
    }
  }
  const start = pins[startIdx];
  const remaining = pins.filter((p) => p.id !== start.id);
  const route: T[] = [start];
  while (remaining.length > 0) {
    const last = route[route.length - 1];
    let bestIdx = 0;
    let bestDist = distSq(last, remaining[0]);
    for (let i = 1; i < remaining.length; i++) {
      const d = distSq(last, remaining[i]);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    route.push(remaining.splice(bestIdx, 1)[0]);
  }
  return route;
}

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
