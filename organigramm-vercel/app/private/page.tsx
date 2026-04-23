/**
 * /private — Paul's privater Datenraum.
 *
 * Passwort-Gate via `?key=<PRIVATE_PASSWORD>` (analog zu /review).
 * Server-renders die drei gitignored Private-JSONs aus organigramm/raw/.
 *
 * Wichtig: auf Vercel-Deploy existieren diese Files **nicht** (gitignored).
 * Die Seite lädt dann mit leerem State + Hinweis. Private-View funktioniert
 * nur lokal auf Paul's Mac, wo die JSONs existieren.
 */
import { loadPrivateDataset } from "@/lib/private-data";
import PrivateTabs from "@/components/PrivateTabs";

type Props = {
  searchParams: { key?: string };
};

export const dynamic = "force-dynamic";

export default async function PrivatePage({ searchParams }: Props) {
  const pw = process.env.PRIVATE_PASSWORD;
  if (!pw) {
    return (
      <main className="min-h-screen bg-paper dark:bg-ink p-8 max-w-2xl mx-auto">
        <div className="bg-danger-soft border border-danger/40 rounded-lg p-4 text-sm text-danger">
          PRIVATE_PASSWORD-Env-Variable ist nicht gesetzt. Diese Ansicht ist
          nicht verfügbar.
        </div>
      </main>
    );
  }

  if (searchParams.key !== pw) {
    return (
      <main className="min-h-screen bg-paper dark:bg-ink p-8 max-w-md mx-auto">
        <form
          method="get"
          action="/private"
          className="bg-white dark:bg-ink-soft rounded-xl shadow-card p-6 mt-12 space-y-3"
        >
          <h1 className="text-lg font-semibold text-ink dark:text-paper">
            Private Ansicht
          </h1>
          <p className="text-sm text-ink-soft dark:text-paper/70">
            Nur für Paul. Separates Passwort (nicht EDIT_PASSWORD,
            nicht REVIEW_PASSWORD).
          </p>
          <input
            type="password"
            name="key"
            autoFocus
            className="w-full border border-ink-soft/20 rounded-lg px-3 py-2 bg-paper dark:bg-ink focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="PRIVATE_PASSWORD"
          />
          <button
            type="submit"
            className="w-full bg-accent text-white rounded-lg py-2 font-medium hover:bg-accent/90"
          >
            Einloggen
          </button>
        </form>
      </main>
    );
  }

  const dataset = await loadPrivateDataset();

  return <PrivateTabs dataset={dataset} />;
}
