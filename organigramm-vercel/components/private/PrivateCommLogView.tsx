"use client";

import { useMemo, useState } from "react";
import type { CommunicationEntry, PersonRecord } from "@/lib/private-data-types";

type Props = {
  persons: PersonRecord[];
  commLogByPerson: Record<string, CommunicationEntry[]>;
  preselected?: string;
};

export default function PrivateCommLogView({ persons, commLogByPerson, preselected }: Props) {
  const personNames = useMemo(() => {
    return persons
      .slice()
      .sort((a, b) => b.occurrences - a.occurrences)
      .map((p) => p.name);
  }, [persons]);

  // Derived-state-Pattern: localOverride > preselected (von außen) > default.
  // Kein setState-in-render.
  const [localOverride, setLocalOverride] = useState<string | null>(null);
  const selected = localOverride ?? preselected ?? personNames[0] ?? "";
  const setSelected = (name: string) => setLocalOverride(name);

  if (personNames.length === 0) {
    return (
      <div className="p-6 text-sm italic text-ink-soft">
        Keine Kommunikations-Log-Daten geladen.
      </div>
    );
  }

  const entries = commLogByPerson[selected] ?? [];
  // Neueste zuerst
  const sorted = entries.slice().sort((a, b) => (b.date > a.date ? 1 : -1));

  const personMeta = persons.find((p) => p.name === selected);

  return (
    <main className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-ink-soft rounded-lg border border-ink-soft/10 p-4 space-y-3">
        <header className="pb-3 border-b border-ink-soft/10">
          <h2 className="text-sm font-semibold text-ink dark:text-paper mb-2">
            Kommunikations-Protokoll pro Person
          </h2>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full md:w-auto border border-ink-soft/20 rounded-lg px-3 py-1.5 bg-paper dark:bg-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {personNames.map((name) => {
              const count = commLogByPerson[name]?.length ?? 0;
              return (
                <option key={name} value={name}>
                  {name} ({count})
                </option>
              );
            })}
          </select>
          {personMeta && (
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-ink-soft">
              {personMeta.role_guesses[0] && (
                <span>Rolle: {personMeta.role_guesses[0]}</span>
              )}
              {personMeta.buero_guesses[0] && (
                <span>Büro: {personMeta.buero_guesses[0]}</span>
              )}
              {personMeta.phone_candidates[0] && (
                <span>☎ {personMeta.phone_candidates[0]}</span>
              )}
              {personMeta.email_candidates[0] && (
                <span>
                  ✉ <a
                    href={`mailto:${personMeta.email_candidates[0]}`}
                    className="text-accent hover:underline"
                  >
                    {personMeta.email_candidates[0]}
                  </a>
                </span>
              )}
            </div>
          )}
        </header>

        {sorted.length === 0 ? (
          <div className="text-sm italic text-ink-soft">
            Keine Einträge für {selected}.
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead className="text-[10px] text-ink-soft uppercase tracking-wide">
              <tr>
                <th className="text-left py-1.5 pr-3 font-medium">Datum</th>
                <th className="text-left py-1.5 px-3 font-medium">Richtung</th>
                <th className="text-left py-1.5 px-3 font-medium">Thema</th>
                <th className="text-left py-1.5 pl-3 font-medium font-mono">Hash</th>
              </tr>
            </thead>
            <tbody className="font-mono text-[11px]">
              {sorted.map((e, i) => (
                <tr
                  key={`${e.date}-${e.subject_hash}-${i}`}
                  className="border-t border-ink-soft/5 hover:bg-ink-soft/5 dark:hover:bg-paper/5"
                >
                  <td className="py-1 pr-3 text-ink dark:text-paper">
                    {e.date || "—"}
                  </td>
                  <td className="py-1 px-3">
                    {e.direction === "in" ? (
                      <span className="inline-block px-1.5 py-0.5 bg-accent-soft text-accent rounded text-[10px]">
                        ← ein
                      </span>
                    ) : e.direction === "out" ? (
                      <span className="inline-block px-1.5 py-0.5 bg-warn-soft text-warn rounded text-[10px]">
                        → aus
                      </span>
                    ) : (
                      <span className="text-ink-soft/50">?</span>
                    )}
                  </td>
                  <td className="py-1 px-3 text-ink-soft">
                    {e.subject_keyword}
                  </td>
                  <td className="py-1 pl-3 text-ink-soft/50">
                    {e.subject_hash}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
