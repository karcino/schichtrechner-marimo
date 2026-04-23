"use client";

import { useMemo } from "react";
import type { PersonRecord } from "@/lib/private-data-types";
import { BUERO_LABELS, groupPersonsByBuero } from "@/lib/private-data-types";

export default function PrivateBueroOrgView({ persons }: { persons: PersonRecord[] }) {
  const grouped = useMemo(() => groupPersonsByBuero(persons), [persons]);
  const order = ["ES", "BBS", "BBW", "BBN", "BR", "OTHER"] as const;

  if (persons.length === 0) {
    return (
      <div className="p-6 text-sm italic text-ink-soft">
        Keine Personen-Daten geladen. Script ausführen:
        <pre className="mt-2 p-2 bg-ink/5 rounded text-xs">
          uv run python -m organigramm.ingest.email_persons_extract --input
          ~/Desktop/ADBerlin/Mail --persons-out
          organigramm/raw/persons-private.json ...
        </pre>
      </div>
    );
  }

  return (
    <main className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="grid gap-4 md:grid-cols-2">
        {order.map((code) => {
          const list = grouped[code];
          if (!list || list.length === 0) return null;
          return (
            <section
              key={code}
              className="bg-white dark:bg-ink-soft rounded-lg border border-ink-soft/10 p-4"
            >
              <header className="flex items-baseline justify-between mb-3 pb-2 border-b border-ink-soft/10">
                <h2 className="text-sm font-semibold text-ink dark:text-paper">
                  {BUERO_LABELS[code] ?? code}
                </h2>
                <span className="text-[11px] font-mono text-ink-soft">
                  {list.length} Person{list.length !== 1 ? "en" : ""}
                </span>
              </header>
              <ul className="space-y-2 text-sm">
                {list
                  .slice()
                  .sort((a, b) => b.occurrences - a.occurrences)
                  .map((p) => (
                    <li
                      key={p.name}
                      className="flex flex-col gap-0.5 pb-2 border-b border-ink-soft/5 last:border-0"
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-medium text-ink dark:text-paper">
                          {p.name}
                        </span>
                        <span className="text-[10px] font-mono text-ink-soft">
                          {p.occurrences}×
                        </span>
                      </div>
                      {p.role_guesses.length > 0 && (
                        <div className="text-xs text-ink-soft/80">
                          {p.role_guesses.join(" · ")}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] font-mono text-ink-soft">
                        {p.phone_candidates[0] && (
                          <span>☎ {p.phone_candidates[0]}</span>
                        )}
                        {p.email_candidates.slice(0, 2).map((e) => (
                          <a
                            key={e}
                            href={`mailto:${e}`}
                            className="text-accent hover:underline"
                          >
                            ✉ {e}
                          </a>
                        ))}
                      </div>
                      {(p.first_seen || p.last_seen) && (
                        <div className="text-[10px] text-ink-soft/60">
                          {p.first_seen === p.last_seen
                            ? `gesehen: ${p.first_seen}`
                            : `aktiv: ${p.first_seen} → ${p.last_seen}`}
                        </div>
                      )}
                    </li>
                  ))}
              </ul>
            </section>
          );
        })}
      </div>
    </main>
  );
}
