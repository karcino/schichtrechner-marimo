"use client";

import { Handle, Position, NodeProps } from "reactflow";
import type { OrgNode as OrgNodeT } from "@/lib/data";
import { GROUPS, normalizeVerify } from "@/lib/data";

const verifyStyles: Record<"verified"|"inferred"|"assumed", string> = {
  verified: "border-accent",
  inferred: "border-warn border-dashed",
  assumed:  "border-danger border-dotted",
};
const verifyBadge: Record<"verified"|"inferred"|"assumed", string> = {
  verified: "bg-accent-soft text-accent dark:bg-accent/30 dark:text-paper",
  inferred: "bg-warn-soft text-warn dark:bg-warn/30 dark:text-paper",
  assumed:  "bg-danger-soft text-danger dark:bg-danger/30 dark:text-paper",
};
const verifyLabel: Record<"verified"|"inferred"|"assumed", string> = {
  verified: "🟢 belegt", inferred: "🟡 abgeleitet", assumed: "🔴 vermutet",
};

export function OrgNodeCard({ data, selected }: NodeProps<{ node: OrgNodeT; highlighted?: boolean; dimmed?: boolean }>) {
  const n = data.node;
  const grp = GROUPS[n.group];
  const v = normalizeVerify(n.verify);
  const highlighted = data.highlighted;
  const dimmed = data.dimmed;
  return (
    <div
      style={{ width: 220, opacity: dimmed ? 0.22 : 1 }}
      className={[
        "rounded-xl border bg-white dark:bg-ink-soft p-3 shadow-card transition-all",
        verifyStyles[v],
        selected ? "ring-2 ring-accent scale-[1.02]" : "hover:shadow-md hover:-translate-y-0.5",
        highlighted ? "ring-2 ring-danger shadow-lg scale-[1.03]" : "",
      ].join(" ")}
    >
      <Handle type="target" position={Position.Top} className="!bg-accent !border-accent" />
      <div className="flex items-start gap-2">
        <div
          className="h-8 w-1.5 shrink-0 rounded-full"
          style={{ background: grp.color }}
          title={grp.label}
        />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm leading-tight text-ink dark:text-paper truncate">
            {n.label}
          </div>
          <div className="text-[11px] text-ink-soft/70 dark:text-paper/60 leading-tight truncate">
            {n.role}
          </div>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between gap-1">
        <span className={`text-[9.5px] font-mono uppercase tracking-wide px-1.5 py-0.5 rounded-full ${verifyBadge[v]}`}>
          {verifyLabel[v]}
        </span>
        <span className="text-[10px] text-ink-soft/50 dark:text-paper/40 font-mono whitespace-nowrap">
          {n.sources.length} Q{n.citations?.length ? ` · ${n.citations.length} §` : ""}
        </span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-accent !border-accent" />
    </div>
  );
}
