"use client";

import { useMemo, useState } from "react";
import { RACI, RACI_ROLES, RACI_PROCESSES, raciFor, auditRACI, type Responsibility, type RACIEntry } from "@/lib/raci";
import { SOURCES } from "@/lib/sources";

const respStyles: Record<Responsibility, { bg: string; fg: string; label: string }> = {
  R: { bg: "bg-accent text-white",              fg: "text-white",   label: "Responsible" },
  A: { bg: "bg-danger text-white",              fg: "text-white",   label: "Accountable" },
  C: { bg: "bg-warn text-ink",                  fg: "text-ink",     label: "Consulted" },
  I: { bg: "bg-ink-soft/20 text-ink-soft",      fg: "text-ink-soft", label: "Informed" },
};

const verifyDot: Record<RACIEntry["verify"], string> = {
  verified: "bg-accent",
  ok:       "bg-accent",
  inferred: "bg-warn",
  snippet:  "bg-warn",
  assumed:  "bg-danger",
  archive:  "bg-ink-soft/50",
};

const categoryLabels: Record<string, string> = {
  operations:      "Operativ",
  hr:              "Personal",
  governance:      "Governance",
  codetermination: "Mitbestimmung",
  finance:         "Finanzen",
};

export default function RACIMatrix() {
  const [selectedCell, setSelectedCell] = useState<{ p: string; r: string } | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const visibleProcesses = useMemo(
    () => categoryFilter ? RACI_PROCESSES.filter((p) => p.category === categoryFilter) : RACI_PROCESSES,
    [categoryFilter]
  );

  const selectedEntry = useMemo(
    () => selectedCell ? raciFor(selectedCell.p, selectedCell.r) : undefined,
    [selectedCell]
  );
  const selectedProcess = useMemo(
    () => selectedCell ? RACI_PROCESSES.find((p) => p.id === selectedCell.p) : undefined,
    [selectedCell]
  );
  const selectedRole = useMemo(
    () => selectedCell ? RACI_ROLES.find((r) => r.id === selectedCell.r) : undefined,
    [selectedCell]
  );

  const audit = useMemo(() => auditRACI(), []);
  const categories = Array.from(new Set(RACI_PROCESSES.map((p) => p.category)));

  return (
    <div className="min-h-screen bg-paper dark:bg-ink p-4 md:p-6">
      <header className="mb-4">
        <h1 className="text-xl font-semibold text-ink dark:text-paper">
          Prozess-RACI-Matrix — ad e.V. + Betriebsrat
        </h1>
        <p className="text-sm text-ink-soft dark:text-paper/70 mt-1">
          Wer trägt für welchen Prozess welche Verantwortung? R = Responsible (Durchführung) · A = Accountable (Genehmigung, genau eine Rolle) · C = Consulted (beratend) · I = Informed (informiert).
        </p>
        {audit.length > 0 && (
          <div className="mt-2 text-xs font-mono text-warn bg-warn-soft p-2 rounded border border-warn/40">
            <strong>RACI-Audit:</strong> {audit.map((a) => `${a.process_id}: ${a.issue}`).join(" · ")}
          </div>
        )}
      </header>

      {/* Kategorie-Filter */}
      <div className="flex gap-1 flex-wrap mb-3 text-xs">
        <button
          onClick={() => setCategoryFilter(null)}
          className={`px-2 py-1 rounded-full border transition ${categoryFilter === null ? "bg-accent text-white border-accent" : "border-ink-soft/20 text-ink-soft hover:bg-ink-soft/5"}`}
        >
          Alle ({RACI_PROCESSES.length})
        </button>
        {categories.map((cat) => {
          const count = RACI_PROCESSES.filter((p) => p.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2 py-1 rounded-full border transition ${categoryFilter === cat ? "bg-accent text-white border-accent" : "border-ink-soft/20 text-ink-soft hover:bg-ink-soft/5"}`}
            >
              {categoryLabels[cat] ?? cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Legende */}
      <div className="flex gap-3 mb-4 text-[11px] flex-wrap">
        {(Object.keys(respStyles) as Responsibility[]).map((r) => (
          <div key={r} className="flex items-center gap-1.5">
            <span className={`inline-block w-5 h-5 rounded text-center text-[10px] font-bold leading-5 ${respStyles[r].bg}`}>{r}</span>
            <span className="text-ink-soft dark:text-paper/70">{respStyles[r].label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 ml-4">
          <span className="inline-block w-2 h-2 rounded-full bg-accent"></span>
          <span className="text-ink-soft dark:text-paper/70">belegt</span>
          <span className="inline-block w-2 h-2 rounded-full bg-warn ml-2"></span>
          <span className="text-ink-soft dark:text-paper/70">abgeleitet</span>
          <span className="inline-block w-2 h-2 rounded-full bg-danger ml-2"></span>
          <span className="text-ink-soft dark:text-paper/70">vermutet</span>
        </div>
      </div>

      {/* Matrix */}
      <div className="overflow-x-auto border border-ink-soft/10 rounded-lg bg-white dark:bg-ink-soft shadow-card">
        <table className="text-xs font-mono min-w-full">
          <thead>
            <tr>
              <th className="sticky left-0 top-0 bg-white dark:bg-ink-soft z-10 text-left p-2 border-b border-r border-ink-soft/10 min-w-[200px]">
                Prozess
              </th>
              {RACI_ROLES.map((role) => (
                <th
                  key={role.id}
                  title={role.label}
                  className="p-2 border-b border-ink-soft/10 text-center font-semibold text-ink dark:text-paper whitespace-nowrap"
                >
                  {role.short}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleProcesses.map((process, idx) => (
              <tr key={process.id} className={idx % 2 ? "bg-paper/50 dark:bg-ink/50" : ""}>
                <th
                  className="sticky left-0 bg-inherit text-left p-2 border-r border-ink-soft/10 font-normal"
                  title={process.description}
                >
                  <div className="text-ink dark:text-paper font-medium leading-tight">{process.label}</div>
                  <div className="text-[10px] text-ink-soft/60 dark:text-paper/50 uppercase tracking-wide">
                    {categoryLabels[process.category] ?? process.category}
                  </div>
                </th>
                {RACI_ROLES.map((role) => {
                  const entry = raciFor(process.id, role.id);
                  const isSelected = selectedCell?.p === process.id && selectedCell?.r === role.id;
                  return (
                    <td
                      key={role.id}
                      className={`text-center border-b border-ink-soft/5 p-1 ${isSelected ? "ring-2 ring-accent ring-inset" : ""}`}
                    >
                      {entry ? (
                        <button
                          onClick={() => setSelectedCell({ p: process.id, r: role.id })}
                          className={`w-6 h-6 rounded text-[10px] font-bold leading-6 transition-transform hover:scale-110 ${respStyles[entry.responsibility].bg}`}
                          title={`${respStyles[entry.responsibility].label}${entry.note ? ` — ${entry.note}` : ""}`}
                        >
                          {entry.responsibility}
                        </button>
                      ) : (
                        <span className="text-ink-soft/20">·</span>
                      )}
                      {entry && (
                        <div className="mt-0.5 flex justify-center">
                          <span
                            className={`inline-block w-1.5 h-1.5 rounded-full ${verifyDot[entry.verify]}`}
                            title={entry.verify}
                          ></span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail-Panel für ausgewählte Zelle */}
      {selectedEntry && selectedProcess && selectedRole && (
        <aside className="mt-4 p-4 bg-white dark:bg-ink-soft border border-ink-soft/10 rounded-lg shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-mono text-ink-soft uppercase tracking-wide">
                {selectedProcess.label} × {selectedRole.label}
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${respStyles[selectedEntry.responsibility].bg}`}>
                  {selectedEntry.responsibility} — {respStyles[selectedEntry.responsibility].label}
                </span>
                <span className="text-xs text-ink-soft">
                  verify: <span className="font-mono">{selectedEntry.verify}</span>
                </span>
              </div>
              {selectedEntry.note && (
                <p className="mt-2 text-sm text-ink dark:text-paper">{selectedEntry.note}</p>
              )}
              {selectedEntry.source_ids.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs text-ink-soft mb-1">Quellen:</div>
                  <ul className="text-xs space-y-0.5">
                    {selectedEntry.source_ids.map((sid) => {
                      const src = SOURCES[sid];
                      return (
                        <li key={sid} className="font-mono">
                          <span className="text-accent">{sid}</span>
                          {src && (
                            <> — <a href={src.url} target="_blank" rel="noreferrer" className="underline hover:text-accent">{src.title}</a></>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              {selectedEntry.source_ids.length === 0 && selectedEntry.verify !== "verified" && (
                <div className="mt-2 text-xs text-warn font-mono">
                  ⚠ Keine Source-Referenz — bitte bei Review Quelle ergänzen oder Eintrag löschen.
                </div>
              )}
            </div>
            <button
              onClick={() => setSelectedCell(null)}
              className="text-ink-soft hover:text-ink text-xs px-2 py-1"
              aria-label="Schließen"
            >
              ✕
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}
