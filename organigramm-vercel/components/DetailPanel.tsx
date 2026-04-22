"use client";

import { SOURCES } from "@/lib/sources";
import type { OrgNode } from "@/lib/data";
import { GROUPS } from "@/lib/data";

const badge: Record<OrgNode["verify"], string> = {
  ok:      "bg-accent-soft text-accent dark:bg-accent/30 dark:text-paper",
  snippet: "bg-warn-soft text-warn dark:bg-warn/30 dark:text-paper",
  archive: "bg-info-soft text-info dark:bg-info/30 dark:text-paper",
};
const badgeLabel: Record<OrgNode["verify"], string> = {
  ok: "verifiziert", snippet: "aus Search-Snippet", archive: "Archivquelle",
};

export function DetailPanel({ node, onClose }: { node: OrgNode | null; onClose: () => void }) {
  if (!node) {
    return (
      <div className="h-full p-5 text-sm text-ink-soft/70 dark:text-paper/60">
        <h3 className="font-semibold text-base text-ink dark:text-paper mb-1">Details</h3>
        <p>Klicke einen Knoten im Organigramm, um Rolle, Verantwortung und Quellen zu sehen.</p>
        <div className="mt-6">
          <h4 className="font-semibold text-xs uppercase tracking-wide text-ink-soft/60 dark:text-paper/50 mb-2">Legende</h4>
          <ul className="space-y-1.5 text-[13px]">
            <li><span className="inline-block w-2.5 h-2.5 bg-accent rounded-full align-middle mr-2" />verifiziert – auf offizieller Seite belegt</li>
            <li><span className="inline-block w-2.5 h-2.5 bg-warn   rounded-full align-middle mr-2" />aus Search-Snippet rekonstruiert</li>
            <li><span className="inline-block w-2.5 h-2.5 bg-info   rounded-full align-middle mr-2" />Archivquelle / ältere Version</li>
          </ul>
        </div>
      </div>
    );
  }

  const grp = GROUPS[node.group];

  return (
    <div className="h-full overflow-y-auto slide-in">
      <div className="sticky top-0 bg-white/90 dark:bg-ink-soft/90 backdrop-blur border-b border-line dark:border-line-dark px-5 py-3 flex items-start justify-between gap-3">
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
          <span className={`text-[10.5px] font-mono uppercase tracking-wide px-2 py-0.5 rounded-full ${badge[node.verify]}`}>
            {badgeLabel[node.verify]}
          </span>
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

        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft/60 dark:text-paper/50 mb-1">Belege</div>
          <ul className="space-y-1.5">
            {node.sources.map((sid) => {
              const s = SOURCES[sid];
              return (
                <li key={sid} className="flex items-baseline gap-2">
                  <span className="text-[10px] font-mono text-ink-soft/50 dark:text-paper/40 w-8 shrink-0">[{sid}]</span>
                  <a href={s.url} target="_blank" rel="noopener" className="text-accent hover:underline break-words">
                    {s.title}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
