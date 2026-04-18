import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";

type Props = { searchParams: Promise<{ error?: string }> };

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({ searchParams }: Props) {
  if (await isAdmin()) redirect("/admin");

  const { error } = await searchParams;

  return (
    <div className="max-w-sm mx-auto bg-white border border-brand-100 rounded-lg p-6 space-y-4">
      <h1 className="text-2xl font-bold text-brand-700">Admin-login</h1>
      <form method="POST" action="/api/admin/login" className="space-y-3">
        <label className="block">
          <span className="block text-sm font-medium text-gray-800 mb-1">
            Wachtwoord
          </span>
          <input
            type="password"
            name="password"
            required
            autoFocus
            className="w-full border border-brand-200 rounded-md px-3 py-2 focus:outline-none focus:border-brand-600"
          />
        </label>
        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
            Wachtwoord klopt niet.
          </p>
        )}
        <button
          type="submit"
          className="w-full bg-brand-700 hover:bg-brand-800 text-white font-semibold px-5 py-3 rounded-md"
        >
          Inloggen
        </button>
      </form>
    </div>
  );
}
