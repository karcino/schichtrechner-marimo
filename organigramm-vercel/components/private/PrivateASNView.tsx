"use client";

import type { ASNRecord } from "@/lib/private-data-types";
import { BUERO_LABELS } from "@/lib/private-data-types";

export default function PrivateASNView({ asns }: { asns: ASNRecord[] }) {
  if (asns.length === 0) {
    return (
      <div className="p-6 text-sm italic text-ink-soft">
        Keine ASN-Kürzel-Daten geladen.
      </div>
    );
  }

  return (
    <main className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-ink-soft rounded-lg border border-ink-soft/10 p-4">
        <header className="mb-3 pb-2 border-b border-ink-soft/10">
          <h2 className="text-sm font-semibold text-ink dark:text-paper">
            ASN (Assistenznehmer\*innen) — nur Kürzel
          </h2>
          <p className="text-xs text-ink-soft mt-1">
            Client-Kürzel aus Email-Subjects und Body-Texten. Keine Vollnamen,
            keine Adressen, keine medizinischen Informationen. Büro-Zuordnung
            abgeleitet aus dem Absender-Kontext.
          </p>
        </header>

        <table className="w-full text-sm">
          <thead className="text-xs text-ink-soft uppercase tracking-wide">
            <tr>
              <th className="text-left py-2 pr-3 font-medium">Kürzel</th>
              <th className="text-right py-2 px-3 font-medium">Erwähnungen</th>
              <th className="text-left py-2 px-3 font-medium">Büro(s)</th>
              <th className="text-left py-2 pl-3 font-medium">Zeitraum</th>
            </tr>
          </thead>
          <tbody>
            {asns
              .slice()
              .sort((a, b) => b.occurrences - a.occurrences)
              .map((a) => (
                <tr
                  key={a.kuerzel}
                  className="border-t border-ink-soft/5 hover:bg-ink-soft/5 dark:hover:bg-paper/5"
                >
                  <td className="py-2 pr-3 font-mono font-medium text-ink dark:text-paper">
                    {a.kuerzel}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-ink-soft">
                    {a.occurrences}×
                  </td>
                  <td className="py-2 px-3 text-xs">
                    {a.associated_bueros.length > 0 ? (
                      a.associated_bueros.map((b) => (
                        <span
                          key={b}
                          className="inline-block mr-1 px-1.5 py-0.5 bg-accent-soft text-accent rounded"
                        >
                          {BUERO_LABELS[b]?.split(" ")[0] ?? b}
                        </span>
                      ))
                    ) : (
                      <span className="text-ink-soft/50">—</span>
                    )}
                  </td>
                  <td className="py-2 pl-3 text-[11px] font-mono text-ink-soft">
                    {a.first_seen === a.last_seen
                      ? a.first_seen
                      : `${a.first_seen} → ${a.last_seen}`}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
