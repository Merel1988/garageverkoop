export const SAMBEEK_CENTER: [number, number] = [51.6381, 5.9342];
export const DEFAULT_ZOOM = 15;

export function eventDate(): Date | null {
  const raw = process.env.EVENT_DATE;
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function registrationDeadline(): Date | null {
  const raw = process.env.REGISTRATION_DEADLINE;
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function registrationsOpen(now: Date = new Date()): boolean {
  const deadline = registrationDeadline();
  if (!deadline) return true;
  return now < deadline;
}

export function formatEventDate(d: Date): string {
  return new Intl.DateTimeFormat("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}
