import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { deleteRegistration } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();

  const registrations = await prisma.registration.findMany({
    orderBy: { createdAt: "desc" },
  });
  const confirmed = registrations.filter((r) => r.confirmedAt);
  const pending = registrations.filter((r) => !r.confirmedAt);

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h1 className="text-3xl font-bold text-brand-700">Admin</h1>
        <form method="POST" action="/api/admin/logout">
          <button
            type="submit"
            className="text-sm text-brand-700 hover:underline"
          >
            Uitloggen
          </button>
        </form>
      </div>

      <section>
        <h2 className="text-xl font-semibold text-brand-700 mb-2">
          Bevestigde aanmeldingen ({confirmed.length})
        </h2>
        <RegistrationTable rows={confirmed} />
      </section>

      <section>
        <h2 className="text-xl font-semibold text-brand-700 mb-2">
          Nog niet bevestigd ({pending.length})
        </h2>
        <RegistrationTable rows={pending} />
      </section>
    </div>
  );
}

type Row = Awaited<ReturnType<typeof prisma.registration.findMany>>[number];

function RegistrationTable({ rows }: { rows: Row[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-gray-600 italic">Geen aanmeldingen.</p>;
  }
  return (
    <div className="overflow-x-auto bg-white border border-brand-100 rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-brand-50 text-brand-800 text-left">
          <tr>
            <th className="px-3 py-2">Naam</th>
            <th className="px-3 py-2">Adres</th>
            <th className="px-3 py-2">Email</th>
            <th className="px-3 py-2">Telefoon</th>
            <th className="px-3 py-2">Aangemeld</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-brand-100 align-top">
              <td className="px-3 py-2">{r.name}</td>
              <td className="px-3 py-2">
                {r.street} {r.houseNumber}
              </td>
              <td className="px-3 py-2">
                <a href={`mailto:${r.email}`}>{r.email}</a>
              </td>
              <td className="px-3 py-2">
                {r.phone ? (
                  <a href={`tel:${r.phone}`}>{r.phone}</a>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
              <td className="px-3 py-2 text-xs text-gray-600">
                {new Date(r.createdAt).toLocaleString("nl-NL")}
              </td>
              <td className="px-3 py-2">
                <form action={deleteRegistration}>
                  <input type="hidden" name="id" value={r.id} />
                  <button
                    type="submit"
                    className="text-xs text-red-700 hover:underline"
                  >
                    Verwijder
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
