type NominatimResult = {
  lat: string;
  lon: string;
  address?: {
    village?: string;
    town?: string;
    city?: string;
    municipality?: string;
  };
};

export type GeocodeResult =
  | { ok: true; latitude: number; longitude: number }
  | { ok: false; reason: "not_found" | "not_in_sambeek" | "error" };

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

function userAgent(): string {
  const contact = process.env.NOMINATIM_CONTACT_EMAIL || "noreply@garageverkoopsambeek.nl";
  return `GarageverkoopSambeek/1.0 (${contact})`;
}

export async function geocodeAddress(
  street: string,
  houseNumber: string,
): Promise<GeocodeResult> {
  const query = `${houseNumber} ${street}, Sambeek, Nederland`;
  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("countrycodes", "nl");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "1");
  url.searchParams.set("q", query);

  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        "User-Agent": userAgent(),
        "Accept-Language": "nl",
      },
    });
  } catch {
    return { ok: false, reason: "error" };
  }

  if (!res.ok) return { ok: false, reason: "error" };

  const data = (await res.json()) as NominatimResult[];
  if (!data || data.length === 0) {
    return { ok: false, reason: "not_found" };
  }

  const hit = data[0];
  const place =
    hit.address?.village ||
    hit.address?.town ||
    hit.address?.city ||
    hit.address?.municipality;

  if (!place || place.toLowerCase() !== "sambeek") {
    return { ok: false, reason: "not_in_sambeek" };
  }

  const latitude = Number.parseFloat(hit.lat);
  const longitude = Number.parseFloat(hit.lon);
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return { ok: false, reason: "error" };
  }

  return { ok: true, latitude, longitude };
}
