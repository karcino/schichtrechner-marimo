"use client";

import { Handle, Position, NodeProps } from "reactflow";
import type { OrgNode as OrgNodeT } from "@/lib/data";
import { GROUPS } from "@/lib/data";

const verifyStyles: Record<OrgNodeT["verify"], string> = {
  ok:      "border-accent",
  snippet: "border-warn border-dashed",
  archive: "border-info",
};
const verifyBadge: Record<OrgNodeT["verify"], string> = {
  ok:      "bg-accent-soft text-accent dark:bg-accent/30 dark:text-paper",
  snippet: "bg-warn-soft text-warn dark:bg-warn/30 dark:text-paper",
  archive: "bg-info-soft text-info dark:bg-info/30 dark:text-paper",
};
const verifyLabel: Record<OrgNodeT["verify"], string> = {
  ok: "verifiziert", snippet: "verify", archive: "archiv",
};

export function OrgNodeCard({ data, selected }: NodeProps<{ node: OrgNodeT }>) {
  const n = data.node;
  const grp = GROUPS[n.group];
  return (
    <div
      style={{ width: 220 }}
      className={[
        "rounded-xl border bg-white dark:bg-ink-soft p-3 shadow-card transition",
        verifyStyles[n.verify],
        selected ? "ring-2 ring-accent scale-[1.02]" : "hover:shadow-md hover:-translate-y-0.5",
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
      <div className="mt-2 flex items-center justify-between">
        <span className={`text-[9.5px] font-mono uppercase tracking-wide px-1.5 py-0.5 rounded-full ${verifyBadge[n.verify]}`}>
          {verifyLabel[n.verify]}
        </span>
        <span className="text-[10px] text-ink-soft/50 dark:text-paper/40 font-mono">
          {n.sources.length} Quelle{n.sources.length === 1 ? "" : "n"}
        </span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-accent !border-accent" />
    </div>
  );
}
