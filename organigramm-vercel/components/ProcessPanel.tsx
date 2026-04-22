"use client";

import { useState } from "react";
import { PROCESSES, CITATIONS, NODES, normalizeVerify, type Process } from "@/lib/data";
import { SOURCES } from "@/lib/sources";

const badgeMap = {
  verified: { cls: "bg-accent-soft text-accent dark:bg-accent/30 dark:text-paper", label: "🟢 belegt" },
  inferred: { cls: "bg-warn-soft text-warn dark:bg-warn/30 dark:text-paper",         label: "🟡 abgeleitet" },
  assumed:  { cls: "bg-danger-soft text-danger dark:bg-danger/30 dark:text-paper",   label: "🔴 vermutet" },
} as const;

function nodeLabel(id: string): string {
  return NODES.find((n) => n.id === id)?.label ?? id;
}

export function ProcessPanel({
  activeProcess,
  onSelect,
  onHover,
}: {
  activeProcess: string | null;
  onSelect: (id: string | null) => void;
  onHover: (stepInvolves: string[] | null) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const procs = Object.values(PROCESSES);

  return (
    <div className="border-t border-line dark:border-line-dark bg-paper-soft/40 dark:bg-ink/60">
      <div className="px-4 py-2.5 flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-mono uppercase tracking-widest text-ink-soft/60 dark:text-paper/50">Prozesse:</span>
        <button
          onClick={() => { onSelect(null); setExpanded(null); onHover(null); }}
          className={[
            "inline-flex items-center rounded-full border px-2.5 py-1 text-[11.5px] transition",
            activeProcess === null
              ? "border-ink/30 dark:border-paper/30 bg-white dark:bg-ink-soft text-ink dark:text-paper font-medium"
              : "border-line dark:border-line-dark text-ink-soft/60 dark:text-paper/50 hover:text-ink dark:hover:text-paper",
          ].join(" ")}
        >
          keiner aktiv
        </button>
        {procs.map((p) => {
          const on = activeProcess === p.id;
          const v = normalizeVerify(p.verify);
          return (
            <button
              key={p.id}
              onClick={() => { onSelect(on ? null : p.id); setExpanded(on ? null : p.id); onHover(null); }}
              className={[
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] transition",
                on
                  ? "border-danger/50 bg-danger-soft/40 text-danger dark:bg-danger/20 dark:text-paper"
                  : "border-line dark:border-line-dark text-ink-soft/70 dark:text-paper/60 hover:text-ink dark:hover:text-paper",
              ].join(" ")}
              title={p.description}
            >
              <span>▶ {p.label}</span>
              <span className={`text-[9.5px] font-mono uppercase px-1 py-px rounded ${badgeMap[v].cls}`}>{badgeMap[v].label}</span>
            </button>
          );
        })}
      </div>

      {activeProcess && expanded && PROCESSES[expanded] && (
        <ProcessDetail p={PROCESSES[expanded]} onHover={onHover} />
      )}
    </div>
  );
}

function ProcessDetail({ p, onHover }: { p: Process; onHover: (involves: string[] | null) => void }) {
  return (
    <div className="border-t border-line dark:border-line-dark px-4 py-3 bg-white dark:bg-ink-soft">
      <div className="flex items-baseline justify-between gap-3 mb-2 flex-wrap">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-widest text-ink-soft/60 dark:text-paper/50">{p.role}</div>
          <div className="font-semibold text-ink dark:text-paper">{p.label}</div>
        </div>
        <div className="text-[11px] text-ink-soft/60 dark:text-paper/50">
          {p.steps.length} Schritte · {p.citations?.length ?? 0} Rechtsgrundlagen
        </div>
      </div>

      <p className="text-[13px] text-ink dark:text-paper leading-relaxed mb-3">{p.description}</p>

      <ol className="space-y-1.5 mb-3">
        {p.steps.map((s) => {
          const v = normalizeVerify(s.verify);
          const involvesIds = [s.actor, s.addressee, s.via].filter(Boolean) as string[];
          return (
            <li
              key={s.n}
              className="flex items-start gap-3 p-2 rounded-md hover:bg-paper-soft/70 dark:hover:bg-ink/60 cursor-default"
              onMouseEnter={() => onHover(involvesIds)}
              onMouseLeave={() => onHover(null)}
            >
              <span className={`shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-mono font-semibold ${badgeMap[v].cls}`}>
                {s.n}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] text-ink dark:text-paper">
                  <strong>{s.label}</strong>
                  <span className="text-ink-soft/70 dark:text-paper/60"> — {nodeLabel(s.actor)}
                    {s.addressee ? <> → {nodeLabel(s.addressee)}</> : null}
                    {s.via ? <>, via <em>{nodeLabel(s.via)}</em></> : null}
                  </span>
                </div>
                {s.detail && (
                  <div className="text-[12px] text-ink-soft/70 dark:text-paper/60 mt-0.5">{s.detail}</div>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {p.citations && p.citations.length > 0 && (
        <div className="border-t border-line dark:border-line-dark pt-3 space-y-2">
          <div className="text-[10.5px] font-semibold uppercase tracking-wide text-ink-soft/60 dark:text-paper/50">Rechtliche Grundlagen dieses Prozesses</div>
          {p.citations.map((cid) => {
            const c = CITATIONS[cid];
            if (!c) return null;
            const src = SOURCES[c.source];
            return (
              <div key={cid} className="text-[12px] rounded-md border border-line dark:border-line-dark bg-paper-soft/40 dark:bg-ink/40 p-2.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-mono text-[11.5px] font-semibold text-ink dark:text-paper">{c.ref}</span>
                  <span className="text-[10.5px] text-ink-soft/60 dark:text-paper/50">{c.title}</span>
                </div>
                <blockquote className="italic text-ink dark:text-paper border-l-2 border-accent/50 pl-2.5 my-1.5">
                  „{c.quote}"
                </blockquote>
                {src && (
                  <a href={src.url} target="_blank" rel="noopener" className="text-[11px] text-accent hover:underline">
                    {src.title}{src.accessed ? ` · abgerufen ${src.accessed}` : ""} →
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
