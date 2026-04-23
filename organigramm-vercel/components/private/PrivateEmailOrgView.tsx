"use client";

import { useMemo } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  ReactFlowProvider,
  Position,
} from "reactflow";
import type {
  ASNRecord,
  PaulShiftStats,
  PersonRecord,
} from "@/lib/private-data-types";
import { BUERO_LABELS } from "@/lib/private-data-types";

type Props = {
  persons: PersonRecord[];
  asns: ASNRecord[];
  paulShiftsByAsn: Record<string, PaulShiftStats>;
  onPersonClick?: (name: string) => void;
};

const BUERO_ORDER = ["ES", "BBS", "BBW", "BBN", "BR", "OTHER"] as const;

const BUERO_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  ES: { bg: "#eff6ff", border: "#3b82f6", text: "#1e40af" },
  BBS: { bg: "#fdf2f8", border: "#ec4899", text: "#9d174d" },
  BBW: { bg: "#fffbeb", border: "#f59e0b", text: "#92400e" },
  BBN: { bg: "#ecfdf5", border: "#10b981", text: "#065f46" },
  BR: { bg: "#f5f3ff", border: "#8b5cf6", text: "#5b21b6" },
  OTHER: { bg: "#f3f4f6", border: "#6b7280", text: "#374151" },
};

type RoleTier = "lead" | "coord" | "worker" | "other";

function roleTier(person: PersonRecord): RoleTier {
  const role = person.role_guesses[0]?.toLowerCase() ?? "";
  if (
    role.includes("geschäftsführung") ||
    role.includes("vorstand") ||
    role.includes("verwaltungsleitung") ||
    role.includes("leitung")
  ) {
    return "lead";
  }
  if (
    role.includes("beratungsbüro") ||
    role.includes("beauftragt") ||
    role.includes("personalabteilung") ||
    role.includes("lohnbuchhaltung") ||
    role.includes("digitalisierung")
  ) {
    return "coord";
  }
  if (
    role.includes("einsatzbegleitung") ||
    role.includes("pflegefachkraft") ||
    role.includes("assist")
  ) {
    return "worker";
  }
  return "other";
}

const TIER_STYLE: Record<RoleTier, { weight: number; fontSize: number }> = {
  lead: { weight: 700, fontSize: 12 },
  coord: { weight: 600, fontSize: 11 },
  worker: { weight: 500, fontSize: 11 },
  other: { weight: 400, fontSize: 10 },
};

const CONTAINER_WIDTH = 240;
const CONTAINER_HEADER = 40;
const PERSON_HEIGHT = 44;
const PERSON_GAP = 6;
const CONTAINER_PAD_BOTTOM = 16;
const CONTAINER_GAP_X = 40;
const ROW_Y_OFFSET = 160;
const ASN_ZONE_Y_GAP = 180;
const ASN_WIDTH_BASE = 72;
const ASN_HEIGHT_BASE = 38;

/**
 * Kombinierter Relevanz-Score:
 * - E-Mail-Erwähnungen (occurrences) — wer redet über diesen ASN?
 * - Schicht-Stunden (von Paul) — wo verbringt Paul tatsächlich Arbeitszeit?
 *
 * Stunden werden stärker gewichtet als Mentions (Faktor 2, log-gedämpft)
 * weil "real gearbeitet" > "in Mail erwähnt".
 */
function asnRelevance(asn: ASNRecord, shifts?: PaulShiftStats): number {
  const mail = Math.log(1 + asn.occurrences);
  const work = shifts ? 2 * Math.log(1 + shifts.hours / 5) : 0;
  return mail + work;
}

function personNodeId(name: string): string {
  return `P_${name.replace(/[^a-zA-Z0-9]/g, "_")}`;
}

function buildGraph(
  persons: PersonRecord[],
  asns: ASNRecord[],
  paulShiftsByAsn: Record<string, PaulShiftStats>,
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // --- Bucket Personen nach Büro ---
  const personsByBuero: Record<string, PersonRecord[]> = {};
  for (const b of BUERO_ORDER) personsByBuero[b] = [];
  for (const p of persons) {
    const buero = p.buero_guesses[0] ?? "OTHER";
    const key = (BUERO_ORDER as readonly string[]).includes(buero) ? buero : "OTHER";
    personsByBuero[key].push(p);
  }
  // Sortierung: Rolle-Tier (lead → coord → worker → other), dann occurrences
  const tierOrder: Record<RoleTier, number> = {
    lead: 0,
    coord: 1,
    worker: 2,
    other: 3,
  };
  for (const b of BUERO_ORDER) {
    personsByBuero[b].sort((a, x) => {
      const ta = tierOrder[roleTier(a)];
      const tx = tierOrder[roleTier(x)];
      if (ta !== tx) return ta - tx;
      return x.occurrences - a.occurrences;
    });
  }

  // --- Nur Büros mit mindestens 1 Person rendern ---
  const visibleBueros = BUERO_ORDER.filter((b) => personsByBuero[b].length > 0);

  // --- Root ---
  const totalWidth =
    visibleBueros.length * CONTAINER_WIDTH +
    (visibleBueros.length - 1) * CONTAINER_GAP_X;
  const rootX = totalWidth / 2 - 90;
  nodes.push({
    id: "ROOT",
    type: "default",
    position: { x: rootX, y: 0 },
    data: { label: "ad e.V." },
    style: {
      width: 180,
      background: "#111827",
      color: "#f9fafb",
      border: "2px solid #000000",
      borderRadius: 10,
      fontSize: 13,
      fontWeight: 700,
      padding: "12px 18px",
      textAlign: "center",
    },
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  });

  // --- Büro-Container + Person-Kinder ---
  const bueroContainerAt: Record<
    string,
    { x: number; y: number; w: number; h: number }
  > = {};

  visibleBueros.forEach((b, idx) => {
    const personsHere = personsByBuero[b];
    const colors = BUERO_COLORS[b];
    const containerHeight =
      CONTAINER_HEADER +
      personsHere.length * PERSON_HEIGHT +
      Math.max(0, personsHere.length - 1) * PERSON_GAP +
      CONTAINER_PAD_BOTTOM;
    const x = idx * (CONTAINER_WIDTH + CONTAINER_GAP_X);
    const y = ROW_Y_OFFSET;
    bueroContainerAt[b] = { x, y, w: CONTAINER_WIDTH, h: containerHeight };

    // Container-Header-Label: „Einsatzstelle · 8P"
    const shortLabel = BUERO_LABELS[b]?.split(" (")[0] ?? b;

    nodes.push({
      id: `BUERO_${b}`,
      type: "group",
      position: { x, y },
      data: { label: shortLabel },
      style: {
        width: CONTAINER_WIDTH,
        height: containerHeight,
        background: colors.bg,
        border: `2px solid ${colors.border}`,
        borderRadius: 12,
      },
      draggable: false,
      selectable: false,
    });

    // Header-Badge als separater "Überschrift"-Node (kein echter group-Label-Support)
    nodes.push({
      id: `BUERO_${b}_HDR`,
      type: "default",
      parentNode: `BUERO_${b}`,
      extent: "parent",
      position: { x: 8, y: 6 },
      data: { label: `${shortLabel} · ${personsHere.length}P` },
      style: {
        width: CONTAINER_WIDTH - 16,
        background: colors.border,
        color: "#ffffff",
        border: "none",
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 700,
        padding: "4px 8px",
        textAlign: "left",
        minHeight: 24,
      },
      draggable: false,
      selectable: false,
    });

    // Root → Büro-Container-Edge (zielt auf HDR, denn group-Nodes akzeptieren keine eingehenden Edges gut)
    edges.push({
      id: `e-root-${b}`,
      source: "ROOT",
      target: `BUERO_${b}_HDR`,
      style: { stroke: colors.border, strokeWidth: 1.5 },
      animated: false,
    });

    // Person-Nodes als Kinder
    personsHere.forEach((p, i) => {
      const tier = roleTier(p);
      const tierSty = TIER_STYLE[tier];
      const totalCount = p.occurrences;
      const role = p.role_guesses[0] ?? "";
      const roleShort = role.length > 24 ? role.slice(0, 22) + "…" : role;
      const inOut =
        p.in_count !== undefined && p.out_count !== undefined
          ? ` · ←${p.in_count} →${p.out_count}`
          : "";
      const isPaul = p.name === "Paul Fiedler";

      nodes.push({
        id: personNodeId(p.name),
        type: "default",
        parentNode: `BUERO_${b}`,
        extent: "parent",
        position: {
          x: 8,
          y: CONTAINER_HEADER + i * (PERSON_HEIGHT + PERSON_GAP),
        },
        data: {
          label: `${p.name}\n${roleShort} · ${totalCount}×${inOut}`,
        },
        style: {
          width: CONTAINER_WIDTH - 16,
          height: PERSON_HEIGHT,
          background: isPaul ? "#fef3c7" : "#ffffff",
          color: isPaul ? "#78350f" : "#111827",
          border: isPaul ? `2px solid #d97706` : `1px solid ${colors.border}`,
          borderRadius: 6,
          fontSize: tierSty.fontSize,
          fontWeight: tierSty.weight,
          padding: "4px 8px",
          textAlign: "left",
          whiteSpace: "pre-wrap",
          lineHeight: 1.25,
          cursor: "pointer",
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      });
    });
  });

  // --- ASN-Zone ---
  // Zeige nur ASN mit mindestens 1 Mention oder Schicht. Primär-Person =
  // associated_persons[0] falls vorhanden, sonst erster Büro-Kontakt.
  const maxContainerH = Math.max(
    ...Object.values(bueroContainerAt).map((c) => c.h),
  );
  const asnY = ROW_Y_OFFSET + maxContainerH + ASN_ZONE_Y_GAP;

  // Relevanz-gewichtet sortieren
  const enrichedAsns = asns.map((a) => {
    const shifts = paulShiftsByAsn[a.kuerzel];
    return { asn: a, shifts, relevance: asnRelevance(a, shifts) };
  });
  enrichedAsns.sort((a, b) => b.relevance - a.relevance);

  // Finde Primär-Person pro ASN → Zuordnung zur Spalte unter dem Büro
  // Fallback: associated_bueros[0] → erste Person dort → mittlere Pos
  const primaryPersonOf = (a: ASNRecord): string | null => {
    const topPerson = a.associated_persons?.[0]?.[0];
    if (topPerson && persons.some((p) => p.name === topPerson)) return topPerson;
    return null;
  };

  // Bucket ASN-Kürzel nach Primär-Person
  const asnsByPerson: Record<string, typeof enrichedAsns> = {};
  const asnsOrphan: typeof enrichedAsns = [];
  for (const e of enrichedAsns) {
    const primary = primaryPersonOf(e.asn);
    if (primary) {
      (asnsByPerson[primary] ??= []).push(e);
    } else {
      asnsOrphan.push(e);
    }
  }

  // Position ASNs horizontal — unter ihrem Primär-Person-Knoten (gleiche x-Range wie der Büro-Container)
  let xCursor = 0;
  for (const b of visibleBueros) {
    const container = bueroContainerAt[b];
    const personsHere = personsByBuero[b];
    // Finde alle ASNs, die mind. 1 Person in diesem Büro als Primary haben
    const asnsForBuero: { entry: (typeof enrichedAsns)[number]; personId: string }[] = [];
    for (const p of personsHere) {
      const list = asnsByPerson[p.name];
      if (list) {
        for (const e of list) {
          asnsForBuero.push({ entry: e, personId: personNodeId(p.name) });
        }
      }
    }
    if (asnsForBuero.length === 0) continue;

    // Spread horizontal unter dem Container
    const slotCount = asnsForBuero.length;
    const slotWidth = Math.max(
      ASN_WIDTH_BASE + 10,
      container.w / Math.max(1, slotCount),
    );
    asnsForBuero.forEach((item, i) => {
      const { asn, shifts, relevance } = item.entry;
      // Node-Größe nach Relevanz
      const scale = 1 + relevance * 0.22;
      const w = Math.round(ASN_WIDTH_BASE * scale);
      const h = Math.round(ASN_HEIGHT_BASE * (0.9 + relevance * 0.08));
      const asnX = container.x + i * slotWidth + (slotWidth - w) / 2;
      const hasShifts = !!shifts && shifts.shifts > 0;
      const colors = BUERO_COLORS[b];
      const label = hasShifts
        ? `${asn.kuerzel}\n${shifts!.hours}h · ${shifts!.shifts}×`
        : `${asn.kuerzel}\n${asn.occurrences}×Mail`;

      nodes.push({
        id: `A_${asn.kuerzel}`,
        type: "default",
        position: { x: asnX, y: asnY },
        data: { label },
        style: {
          width: w,
          height: h,
          background: hasShifts ? "#fde68a" : "#fef3c7",
          color: hasShifts ? "#78350f" : "#92400e",
          border: hasShifts
            ? `2px solid #d97706`
            : `1.5px dashed ${colors.border}`,
          borderRadius: 16,
          fontSize: Math.round(9 + relevance * 0.4),
          fontWeight: hasShifts ? 700 : 500,
          padding: "4px 6px",
          textAlign: "center",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          whiteSpace: "pre-wrap",
          lineHeight: 1.2,
        },
        sourcePosition: Position.Top,
        targetPosition: Position.Top,
      });

      // Edge Person → ASN (aus Container heraus)
      edges.push({
        id: `e-${item.personId}-A_${asn.kuerzel}`,
        source: item.personId,
        target: `A_${asn.kuerzel}`,
        type: "smoothstep",
        style: {
          stroke: hasShifts ? "#d97706" : colors.border,
          strokeWidth: hasShifts ? 2 : 1.2,
          strokeDasharray: hasShifts ? undefined : "4 4",
          opacity: hasShifts ? 0.85 : 0.55,
        },
      });
    });

    xCursor += container.w + CONTAINER_GAP_X;
  }

  // Orphan-ASN-Zone ganz rechts
  if (asnsOrphan.length > 0) {
    const orphanStartX = visibleBueros.length * (CONTAINER_WIDTH + CONTAINER_GAP_X) + 20;
    asnsOrphan.forEach((e, i) => {
      const { asn, shifts, relevance } = e;
      const hasShifts = !!shifts && shifts.shifts > 0;
      const scale = 1 + relevance * 0.22;
      const w = Math.round(ASN_WIDTH_BASE * scale);
      const h = Math.round(ASN_HEIGHT_BASE * (0.9 + relevance * 0.08));
      const label = hasShifts
        ? `${asn.kuerzel}\n${shifts!.hours}h · ${shifts!.shifts}×`
        : `${asn.kuerzel}\n${asn.occurrences}×Mail`;
      nodes.push({
        id: `A_${asn.kuerzel}`,
        type: "default",
        position: { x: orphanStartX, y: asnY + i * 54 },
        data: { label },
        style: {
          width: w,
          height: h,
          background: hasShifts ? "#fde68a" : "#fef3c7",
          color: hasShifts ? "#78350f" : "#92400e",
          border: hasShifts ? `2px solid #d97706` : `1.5px dashed #d97706`,
          borderRadius: 16,
          fontSize: Math.round(9 + relevance * 0.4),
          fontWeight: hasShifts ? 700 : 500,
          padding: "4px 6px",
          textAlign: "center",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          whiteSpace: "pre-wrap",
          lineHeight: 1.2,
        },
      });
    });
  }

  return { nodes, edges };
}

function Chart({ persons, asns, paulShiftsByAsn, onPersonClick }: Props) {
  const { nodes, edges } = useMemo(
    () => buildGraph(persons, asns, paulShiftsByAsn),
    [persons, asns, paulShiftsByAsn],
  );

  if (persons.length === 0 && asns.length === 0) {
    return (
      <div className="p-6 text-sm italic text-ink-soft">
        Keine Daten geladen.
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "calc(100vh - 120px)" }}>
      <div className="absolute top-16 left-4 z-10 bg-white/95 dark:bg-ink/95 rounded-md px-3 py-2 border border-ink-soft/15 shadow-sm text-[11px] leading-relaxed max-w-xs">
        <div className="font-semibold text-ink dark:text-paper mb-1">Legende</div>
        <div className="flex gap-2 items-center">
          <span className="inline-block w-3 h-3 rounded bg-[#fef3c7] border border-[#d97706]" />
          <span>Paul Fiedler (ich)</span>
        </div>
        <div className="flex gap-2 items-center">
          <span className="inline-block w-3 h-3 rounded-full bg-[#fde68a] border-2 border-[#d97706]" />
          <span>ASN mit Schichten (Stunden)</span>
        </div>
        <div className="flex gap-2 items-center">
          <span className="inline-block w-3 h-3 rounded-full bg-[#fef3c7] border border-dashed border-[#d97706]" />
          <span>ASN nur in Mails</span>
        </div>
        <div className="text-ink-soft mt-1 text-[10px]">
          Linien = Primärkontakt per Mail. Fett = Schichten.
        </div>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.3}
        maxZoom={1.8}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        proOptions={{ hideAttribution: true }}
        onNodeClick={(_, node) => {
          if (node.id.startsWith("P_")) {
            const label = typeof node.data?.label === "string" ? node.data.label : "";
            const name = label.split("\n")[0];
            if (name && onPersonClick) onPersonClick(name);
          }
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={18} size={1} />
        <Controls showInteractive={false} />
        <MiniMap pannable zoomable nodeColor={(n) => {
          if (n.id === "ROOT") return "#111827";
          if (n.id.startsWith("A_")) return "#f59e0b";
          if (n.id.startsWith("BUERO_")) return "#d1d5db";
          return "#3b82f6";
        }} />
      </ReactFlow>
    </div>
  );
}

export default function PrivateEmailOrgView({
  persons,
  asns,
  paulShiftsByAsn,
  onPersonClick,
}: Props) {
  return (
    <ReactFlowProvider>
      <Chart
        persons={persons}
        asns={asns}
        paulShiftsByAsn={paulShiftsByAsn}
        onPersonClick={onPersonClick}
      />
    </ReactFlowProvider>
  );
}
