"use client";

import { SOURCES } from "@/lib/sources";
import type { OrgNode } from "@/lib/data";
import { GROUPS, CITATIONS, normalizeVerify } from "@/lib/data";

const badge: Record<"verified"|"inferred"|"assumed", string> = {
  verified: "bg-accent-soft text-accent dark:bg-accent/30 dark:text-paper",
  inferred: "bg-warn-soft text-warn dark:bg-warn/30 dark:text-paper",
  assumed:  "bg-danger-soft text-danger dark:bg-danger/30 dark:text-paper",
};
const badgeLabel: Record<"verified"|"inferred"|"assumed", string> = {
  verified: "🟢 belegt auf Originalseite",
  inferred: "🟡 aus Struktur/Tarif abgeleitet",
  assumed:  "🔴 nur Vermutung · bitte bestätigen",
};

export function DetailPanel({ node, onClose }: { node: OrgNode | null; onClose: () => void }) {
  if (!node) {
    return (
      <div className="h-full p-5 text-sm text-ink-soft/70 dark:text-paper/60">
        <h3 className="font-semibold text-base text-ink dark:text-paper mb-1">Details</h3>
        <p>Klicke einen Knoten im Organigramm, um Rolle, Verantwortung, Belege und rechtliche Grundlagen zu sehen.</p>
        <div className="mt-6">
          <h4 className="font-semibold text-xs uppercase tracking-wide text-ink-soft/60 dark:text-paper/50 mb-2">Verifikation</h4>
          <ul className="space-y-1.5 text-[13px]">
            <li><span className="inline-block w-2.5 h-2.5 bg-accent rounded-full align-middle mr-2" />🟢 <strong>belegt</strong> — direkt auf offizieller Seite</li>
            <li><span className="inline-block w-2.5 h-2.5 bg-warn   rounded-full align-middle mr-2" />🟡 <strong>abgeleitet</strong> — aus Tarifvertrag/Struktur rekonstruiert</li>
            <li><span className="inline-block w-2.5 h-2.5 bg-danger rounded-full align-middle mr-2" />🔴 <strong>vermutet</strong> — braucht Bestätigung</li>
          </ul>
        </div>
        <div className="mt-6 text-[12px]">
          <h4 className="font-semibold text-xs uppercase tracking-wide text-ink-soft/60 dark:text-paper/50 mb-2">Ebenen an/aus</h4>
          <p>Über die Chips oben lässt sich steuern, welche Ebenen sichtbar sind — z.B. nur Struktur, oder zusätzlich Prozesse, Vermittlungs-Modi und Kommunikations­kanäle.</p>
        </div>
      </div>
    );
  }

  const grp = GROUPS[node.group];
  const v = normalizeVerify(node.verify);

  return (
    <div className="h-full overflow-y-auto slide-in">
      <div className="sticky top-0 bg-white/90 dark:bg-ink-soft/90 backdrop-blur border-b border-line dark:border-line-dark px-5 py-3 flex items-start justify-between gap-3 z-10">
        <div>
          <div className="text-[10.5px] font-mono uppercase tracking-wide text-ink-soft/60 dark:text-paper/50">{grp.label}</div>
          <div className="font-semibold text-ink dark:text-paper leading-tight">{node.label}</div>
          <div className="text-[12px] text-ink-soft/70 dark:text-paper/60">{node.role}</div>
        </div>
        <button
          onClick={onClose}
          className="text-ink-soft/60 hover:text-ink dark:hover:text-paper text-lg leading-none"
          aria-label="Details schließen"
        >×</button>
      </div>

      <div className="px-5 py-4 space-y-4 text-[13.5px]">
        <div>
          <span className={`text-[10.5px] font-mono uppercase tracking-wide px-2 py-0.5 rounded-full ${badge[v]}`}>
            {badgeLabel[v]}
          </span>
          {v === "assumed" && (
            <div className="mt-2 text-[12px] text-danger bg-danger-soft/60 dark:bg-danger/10 rounded-md px-3 py-2 border border-danger/30">
              <strong>Hinweis:</strong> Diese Angabe ist nicht öffentlich belegt und beruht auf plausibler Annahme. Vor Zitation bitte intern bestätigen lassen.
            </div>
          )}
        </div>

        <p className="text-ink dark:text-paper leading-relaxed">{node.description}</p>

        {node.address && (
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft/60 dark:text-paper/50 mb-1">Adresse</div>
            <div className="text-ink dark:text-paper">{node.address}</div>
            <a
              href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(node.address)}`}
              target="_blank" rel="noopener"
              className="text-[11.5px] text-accent hover:underline inline-block mt-1"
            >auf OpenStreetMap öffnen →</a>
          </div>
        )}

        {/* Rechtliche Zitate */}
        {node.citations && node.citations.length > 0 && (
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft/60 dark:text-paper/50 mb-2">
              Rechtliche Grundlagen ({node.citations.length})
            </div>
            <ul className="space-y-3">
              {node.citations.map((cid) => {
                const c = CITATIONS[cid];
                if (!c) return null;
                const src = SOURCES[c.source];
                const src2 = c.source2 ? SOURCES[c.source2] : null;
                return (
                  <li key={cid} className="rounded-lg border border-line dark:border-line-dark bg-paper-soft/40 dark:bg-ink/40 p-3">
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <span className="font-mono text-[11.5px] font-semibold text-ink dark:text-paper">{c.ref}</span>
                      <span className="text-[10.5px] text-ink-soft/60 dark:text-paper/50">{c.title}</span>
                    </div>
                    <blockquote className="text-[12.5px] italic text-ink dark:text-paper border-l-2 border-accent/50 pl-3 my-2">
                      „{c.quote}"
                    </blockquote>
                    {c.implication && (
                      <div className="text-[12px] text-ink-soft/80 dark:text-paper/70 mt-2">
                        <strong className="text-ink dark:text-paper">In Kontext: </strong>{c.implication}
                      </div>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                      {src && (
                        <a href={src.url} target="_blank" rel="noopener" className="text-accent hover:underline">
                          {src.title}{src.accessed ? ` · abgerufen ${src.accessed}` : ""} →
                        </a>
                      )}
                      {src2 && (
                        <a href={src2.url} target="_blank" rel="noopener" className="text-accent/80 hover:underline">
                          + {src2.title} →
                        </a>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft/60 dark:text-paper/50 mb-1">
            Belege ({node.sources.length})
          </div>
          <ul className="space-y-1.5">
            {node.sources.map((sid) => {
              const s = SOURCES[sid];
              if (!s) return null;
              return (
                <li key={sid} className="flex items-baseline gap-2">
                  <span className="text-[10px] font-mono text-ink-soft/50 dark:text-paper/40 w-8 shrink-0">[{sid}]</span>
                  <span className="flex-1 min-w-0">
                    <a href={s.url} target="_blank" rel="noopener" className="text-accent hover:underline break-words">
                      {s.title}
                    </a>
                    {s.accessed && <span className="text-[10.5px] text-ink-soft/50 dark:text-paper/40 ml-1.5">· {s.accessed}</span>}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
