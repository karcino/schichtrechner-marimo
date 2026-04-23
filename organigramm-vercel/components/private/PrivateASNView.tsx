"use client";

import type { ASNRecord, PaulShiftStats } from "@/lib/private-data-types";
import { BUERO_LABELS } from "@/lib/private-data-types";

type Props = {
  asns: ASNRecord[];
  paulShiftsByAsn: Record<string, PaulShiftStats>;
  onPersonClick?: (name: string) => void;
};

export default function PrivateASNView({
  asns,
  paulShiftsByAsn,
  onPersonClick,
}: Props) {
  if (asns.length === 0) {
    return (
      <div className="p-6 text-sm italic text-ink-soft">
        Keine ASN-Kürzel-Daten geladen.
      </div>
    );
  }

  // Relevanz-Score analog zur Graph-View: mail + 2*log(1+hours/5)
  const scoreOf = (a: ASNRecord) => {
    const shifts = paulShiftsByAsn[a.kuerzel];
    const mail = Math.log(1 + a.occurrences);
    const work = shifts ? 2 * Math.log(1 + shifts.hours / 5) : 0;
    return mail + work;
  };

  const sorted = asns.slice().sort((a, b) => scoreOf(b) - scoreOf(a));
  const totalShiftHours = Object.values(paulShiftsByAsn).reduce(
    (sum, s) => sum + s.hours,
    0,
  );
  const totalShiftCount = Object.values(paulShiftsByAsn).reduce(
    (sum, s) => sum + s.shifts,
    0,
  );

  return (
    <main className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="bg-white dark:bg-ink-soft rounded-lg border border-ink-soft/10 p-4">
        <header className="mb-3 pb-2 border-b border-ink-soft/10">
          <h2 className="text-sm font-semibold text-ink dark:text-paper">
            ASN (Assistenznehmer*innen) — nur Kürzel
          </h2>
          <p className="text-xs text-ink-soft mt-1">
            Client-Kürzel aus Email-Subjects + Body und Schichtplaner-Einträgen.
            Keine Vollnamen, Adressen, medizinischen Infos. Relevanz mischt
            E-Mail-Erwähnungen + von Paul gearbeitete Stunden.
          </p>
          {totalShiftCount > 0 && (
            <p className="text-[11px] font-mono text-ink-soft mt-1">
              Paul: {totalShiftCount} Schichten · {totalShiftHours.toFixed(1)}h
              aus Schichtplaner.
            </p>
          )}
        </header>

        <table className="w-full text-sm">
          <thead className="text-xs text-ink-soft uppercase tracking-wide">
            <tr>
              <th className="text-left py-2 pr-3 font-medium">Kürzel</th>
              <th className="text-right py-2 px-2 font-medium">Mails</th>
              <th className="text-right py-2 px-2 font-medium">Paul: h / ×</th>
              <th className="text-left py-2 px-2 font-medium">Büro</th>
              <th className="text-left py-2 px-2 font-medium">Primär-Kontakt</th>
              <th className="text-left py-2 pl-2 font-medium">Zeitraum</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((a) => {
              const shifts = paulShiftsByAsn[a.kuerzel];
              const primary = a.associated_persons?.[0];
              return (
                <tr
                  key={a.kuerzel}
                  className="border-t border-ink-soft/5 hover:bg-ink-soft/5 dark:hover:bg-paper/5"
                >
                  <td className="py-2 pr-3 font-mono font-semibold text-ink dark:text-paper">
                    {a.kuerzel}
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-ink-soft text-xs">
                    {a.occurrences}×
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-xs">
                    {shifts ? (
                      <span className="text-warn">
                        {shifts.hours}h · {shifts.shifts}×
                      </span>
                    ) : (
                      <span className="text-ink-soft/40">—</span>
                    )}
                  </td>
                  <td className="py-2 px-2 text-xs">
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
                  <td className="py-2 px-2 text-xs">
                    {primary ? (
                      <button
                        onClick={() => onPersonClick?.(primary[0])}
                        className="text-left hover:text-accent hover:underline"
                        title={`${primary[1]}× als Mail-Signer erkannt`}
                      >
                        {primary[0]}
                        <span className="text-ink-soft/60 font-mono ml-1 text-[10px]">
                          {primary[1]}×
                        </span>
                      </button>
                    ) : (
                      <span className="text-ink-soft/50">—</span>
                    )}
                  </td>
                  <td className="py-2 pl-2 text-[11px] font-mono text-ink-soft">
                    {shifts?.first_date && shifts.first_date !== shifts.last_date
                      ? `${shifts.first_date} → ${shifts.last_date}`
                      : a.first_seen === a.last_seen
                        ? a.first_seen
                        : `${a.first_seen} → ${a.last_seen}`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
