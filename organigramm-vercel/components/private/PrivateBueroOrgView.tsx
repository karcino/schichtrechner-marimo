"use client";

import { useMemo } from "react";
import type { PersonRecord } from "@/lib/private-data-types";
import { BUERO_LABELS, groupPersonsByBuero } from "@/lib/private-data-types";

type Props = { persons: PersonRecord[]; onPersonClick?: (name: string) => void };

export default function PrivateBueroOrgView({ persons, onPersonClick }: Props) {
  const grouped = useMemo(() => groupPersonsByBuero(persons), [persons]);
  const order = ["ES", "BBS", "BBW", "BBN", "BR", "OTHER"] as const;

  if (persons.length === 0) {
    return (
      <div className="p-6 text-sm italic text-ink-soft">
        Keine Personen-Daten geladen. Extractor ausführen:
        <pre className="mt-2 p-2 bg-ink/5 rounded text-xs">
          uv run python -m organigramm.ingest.email_persons_extract --input
          ~/Desktop/ADBerlin/Mail ...
        </pre>
      </div>
    );
  }

  return (
    <main className="p-4 md:p-6 max-w-6xl mx-auto">
      <p className="text-xs text-ink-soft mb-4">
        Tipp: Klick auf einen Namen öffnet das Kommunikations-Protokoll mit dieser Person.
      </p>
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
              <ul className="space-y-3 text-sm">
                {list
                  .slice()
                  .sort((a, b) => b.occurrences - a.occurrences)
                  .map((p) => (
                    <li
                      key={p.name}
                      className="border-b border-ink-soft/5 pb-2 last:border-0 last:pb-0"
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <button
                          onClick={() => onPersonClick?.(p.name)}
                          className="font-medium text-ink dark:text-paper hover:text-accent hover:underline text-left"
                          title="Klick zeigt Kommunikations-Protokoll"
                        >
                          {p.name}
                        </button>
                        <div className="flex gap-1 items-baseline text-[10px] font-mono text-ink-soft whitespace-nowrap">
                          {typeof p.in_count === "number" && p.in_count > 0 && (
                            <span className="px-1 rounded bg-accent-soft text-accent" title="Eingehende Mails">
                              ←{p.in_count}
                            </span>
                          )}
                          {typeof p.out_count === "number" && p.out_count > 0 && (
                            <span className="px-1 rounded bg-warn-soft text-warn" title="Ausgehende Mails">
                              →{p.out_count}
                            </span>
                          )}
                          <span className="ml-1">{p.occurrences}× gesamt</span>
                        </div>
                      </div>
                      {p.role_guesses.length > 0 && (
                        <div className="text-xs text-ink-soft/90 mt-0.5">
                          {p.role_guesses.join(" · ")}
                        </div>
                      )}
                      {p.top_keywords && p.top_keywords.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {p.top_keywords.slice(0, 4).map(([kw, n]) => (
                            <span
                              key={kw}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-ink-soft/10 text-ink-soft/80 font-mono"
                            >
                              {kw}·{n}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] font-mono text-ink-soft mt-1">
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
                        <div className="text-[10px] text-ink-soft/60 mt-0.5">
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
