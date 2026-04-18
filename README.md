# Garageverkoop Sambeek

Openbare site voor de jaarlijkse garageverkoop in Sambeek. Bewoners melden hun huis aan, krijgen een bevestigingsmail met unieke afmeldlink, en hun pin verschijnt op een OpenStreetMap-kaart. Bezoekers kunnen naar een adres navigeren of een wandelroute langs meerdere garages plannen.

## Tech-stack

- Next.js 16 (App Router) + React 19 + TypeScript 5
- Tailwind CSS 4
- Prisma 7 + Turso (lokaal: SQLite `dev.db`)
- Resend voor email
- Leaflet + OpenStreetMap + Nominatim (allemaal gratis, geen API-key)
- Vercel-deploy

## Lokale setup

```bash
cp .env.example .env
# Vul minimaal in: RESEND_API_KEY, ADMIN_PASSWORD, ADMIN_SECRET
npm install
npx prisma db push
npm run dev
```

Open http://localhost:3000.

### Benodigde env-vars

| Variabele | Verplicht | Uitleg |
|---|---|---|
| `TURSO_DATABASE_URL` | Productie | Lokaal leeglaten → valt terug op `file:./dev.db` |
| `TURSO_AUTH_TOKEN` | Productie | Bij Turso db |
| `RESEND_API_KEY` | Ja | Resend API key |
| `EMAIL_FROM` | Ja | Bijv. `Garageverkoop Sambeek <noreply@garageverkoopsambeek.nl>` |
| `NEXT_PUBLIC_SITE_URL` | Ja | Basis-URL voor email-links (lokaal: `http://localhost:3000`) |
| `NOMINATIM_CONTACT_EMAIL` | Aanbevolen | Contact-email in User-Agent (Nominatim ToS) |
| `ADMIN_PASSWORD` | Ja | Wachtwoord voor `/admin` |
| `ADMIN_SECRET` | Ja | Willekeurige string (≥32 bytes) voor cookie-HMAC |
| `EVENT_DATE` | Optioneel | ISO-datum, bv. `2026-09-06` — tonen op homepage |
| `REGISTRATION_DEADLINE` | Optioneel | ISO-datum; formulier sluit na deze datum |

## Hoe de flow werkt

1. Bewoner vult `/aanmelden` in.
2. API route `/api/registrations`:
   - Valideert velden (zod)
   - Geocodeert adres via Nominatim; weigert als adres niet in Sambeek ligt
   - Slaat rij op met `confirmToken` + `unsubscribeToken`, `confirmedAt = null`
   - Verstuurt bevestigingsmail (Resend)
3. Klik op bevestigingslink → `/bevestigen/[token]` → `confirmedAt` wordt gezet → pin verschijnt op `/kaart`.
4. Klik op afmeldlink → `/afmelden/[token]` → rij wordt verwijderd.
5. Op `/kaart`: klik pin → **Navigeer hiernaartoe** opent Google Maps. Vink meerdere pins aan → **Open route in Google Maps** opent een wandelroute-URL.

## Admin

`/admin/login` met wachtwoord (`ADMIN_PASSWORD`). HMAC-gesigneerde cookie, 12 uur geldig. `/admin` toont alle aanmeldingen (bevestigd + pending) met verwijder-knop.

## Deploy (Vercel)

```bash
npm i -g vercel
vercel link
vercel env add   # voor elke env-var
```

Push naar GitHub (`main`) triggert automatisch deploy. `vercel.json` bevat `buildCommand: "prisma generate && next build"`.

### Resend-domein

1. In Resend dashboard → Domains → `garageverkoopsambeek.nl` toevoegen.
2. Voeg de DNS-records (SPF, DKIM, DMARC) toe bij je domeinregistrar.
3. Valideer het domein in Resend.
4. Zet `EMAIL_FROM="Garageverkoop Sambeek <noreply@garageverkoopsambeek.nl>"`.

Testen vóór DNS-verificatie? Gebruik dan `onboarding@resend.dev` — werkt alleen richting je eigen Resend-account.

### Turso

```bash
turso db create garageverkoop
turso db tokens create garageverkoop
npm run db:generate-sql
turso db shell garageverkoop < schema.sql
```

Stop URL en token in Vercel env-vars (`TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`).
