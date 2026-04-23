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
} from "reactflow";
import dagre from "@dagrejs/dagre";
import type { ASNRecord, PersonRecord } from "@/lib/private-data-types";
import { BUERO_LABELS } from "@/lib/private-data-types";

/**
 * Gefilterter Mini-Graph nur mit Entitäten, die in Paul's Mail-Archiv
 * vorkommen. Struktur: Wurzel „ad e.V." → Büro-Knoten → Personen + ASN.
 * Nur Büros mit ≥ 1 assozierter Entität werden gerendert.
 */

type Props = {
  persons: PersonRecord[];
  asns: ASNRecord[];
  onPersonClick?: (name: string) => void;
};

const BUERO_ORDER = ["ES", "BBS", "BBW", "BBN", "BR"] as const;

const BUERO_COLORS: Record<string, string> = {
  ES: "#3b82f6",
  BBS: "#ec4899",
  BBW: "#f59e0b",
  BBN: "#10b981",
  BR: "#8b5cf6",
};

function buildGraph(persons: PersonRecord[], asns: ASNRecord[]) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TB", nodesep: 40, ranksep: 60, marginx: 20, marginy: 20 });

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Root
  const rootId = "ROOT";
  g.setNode(rootId, { width: 160, height: 50 });
  nodes.push({
    id: rootId,
    type: "default",
    data: { label: "ad e.V." },
    position: { x: 0, y: 0 },
    style: {
      background: "#1f2937",
      color: "#f9fafb",
      border: "2px solid #111827",
      borderRadius: 10,
      fontSize: 13,
      fontWeight: 600,
      padding: "10px 16px",
    },
  });

  // Nur Büros rendern, die mindestens 1 Entity haben
  const bueroHasEntity = new Set<string>();
  for (const p of persons) {
    if (p.buero_guesses[0]) bueroHasEntity.add(p.buero_guesses[0]);
  }
  for (const a of asns) {
    if (a.associated_bueros[0]) bueroHasEntity.add(a.associated_bueros[0]);
  }
  const visibleBueros = BUERO_ORDER.filter((b) => bueroHasEntity.has(b));

  for (const code of visibleBueros) {
    const personsHere = persons.filter((p) => p.buero_guesses[0] === code);
    const asnsHere = asns.filter((a) => a.associated_bueros[0] === code);
    const label = `${BUERO_LABELS[code]?.split(" ")[0] ?? code} (${personsHere.length}P · ${asnsHere.length}A)`;

    const color = BUERO_COLORS[code] ?? "#6b7280";
    g.setNode(code, { width: 190, height: 50 });
    nodes.push({
      id: code,
      type: "default",
      data: { label },
      position: { x: 0, y: 0 },
      style: {
        background: color,
        color: "#ffffff",
        border: "none",
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 600,
        padding: "8px 14px",
      },
    });
    g.setEdge(rootId, code);
    edges.push({ id: `e-root-${code}`, source: rootId, target: code });

    // Personen pro Büro
    for (const p of personsHere.sort((a, b) => b.occurrences - a.occurrences)) {
      const nodeId = `P_${p.name.replace(/[^a-zA-Z0-9]/g, "_")}`;
      const role = p.role_guesses[0] ?? "";
      const roleShort = role.length > 30 ? role.slice(0, 28) + "…" : role;
      const label = `${p.name}${roleShort ? `\n${roleShort}` : ""}`;
      g.setNode(nodeId, { width: 200, height: role ? 58 : 40 });
      nodes.push({
        id: nodeId,
        type: "default",
        data: { label },
        position: { x: 0, y: 0 },
        style: {
          background: "#ffffff",
          color: "#111827",
          border: `1.5px solid ${color}`,
          borderRadius: 6,
          fontSize: 11,
          padding: "6px 10px",
          whiteSpace: "pre-wrap",
          textAlign: "left",
        },
      });
      g.setEdge(code, nodeId);
      edges.push({ id: `e-${code}-${nodeId}`, source: code, target: nodeId });
    }

    // ASN-Kürzel pro Büro — als kleinere Markierungen
    for (const a of asnsHere.sort((a, b) => b.occurrences - a.occurrences)) {
      const nodeId = `A_${a.kuerzel}`;
      g.setNode(nodeId, { width: 80, height: 32 });
      nodes.push({
        id: nodeId,
        type: "default",
        data: { label: `${a.kuerzel} (${a.occurrences})` },
        position: { x: 0, y: 0 },
        style: {
          background: "#fef3c7",
          color: "#78350f",
          border: `1px dashed ${color}`,
          borderRadius: 16,
          fontSize: 10,
          padding: "4px 8px",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        },
      });
      g.setEdge(code, nodeId);
      edges.push({
        id: `e-${code}-${nodeId}`,
        source: code,
        target: nodeId,
        style: { strokeDasharray: "4 4", stroke: color, opacity: 0.6 },
      });
    }
  }

  // ASN ohne Büro-Zuordnung: als separate Gruppe rechts
  const orphanAsns = asns.filter((a) => !a.associated_bueros[0]);
  if (orphanAsns.length > 0) {
    const groupId = "ASN_ORPHAN";
    g.setNode(groupId, { width: 160, height: 36 });
    nodes.push({
      id: groupId,
      type: "default",
      data: { label: `ASN ohne Büro (${orphanAsns.length})` },
      position: { x: 0, y: 0 },
      style: {
        background: "#fef3c7",
        color: "#78350f",
        border: "1px solid #d97706",
        borderRadius: 8,
        fontSize: 11,
        padding: "6px 12px",
      },
    });
    g.setEdge(rootId, groupId);
    edges.push({ id: "e-root-orphan", source: rootId, target: groupId });
    for (const a of orphanAsns.sort((x, y) => y.occurrences - x.occurrences)) {
      const nodeId = `A_${a.kuerzel}`;
      g.setNode(nodeId, { width: 80, height: 32 });
      nodes.push({
        id: nodeId,
        type: "default",
        data: { label: `${a.kuerzel} (${a.occurrences})` },
        position: { x: 0, y: 0 },
        style: {
          background: "#fef3c7",
          color: "#78350f",
          border: "1px dashed #d97706",
          borderRadius: 16,
          fontSize: 10,
          padding: "4px 8px",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        },
      });
      g.setEdge(groupId, nodeId);
      edges.push({
        id: `e-orphan-${nodeId}`,
        source: groupId,
        target: nodeId,
        style: { strokeDasharray: "4 4", stroke: "#d97706", opacity: 0.6 },
      });
    }
  }

  dagre.layout(g);
  for (const n of nodes) {
    const pos = g.node(n.id);
    if (pos) {
      n.position = { x: pos.x - pos.width / 2, y: pos.y - pos.height / 2 };
    }
  }
  return { nodes, edges };
}

function Chart({ persons, asns, onPersonClick }: Props) {
  const { nodes, edges } = useMemo(
    () => buildGraph(persons, asns),
    [persons, asns],
  );

  if (persons.length === 0 && asns.length === 0) {
    return (
      <div className="p-6 text-sm italic text-ink-soft">
        Keine Daten geladen.
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "calc(100vh - 100px)" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        proOptions={{ hideAttribution: true }}
        onNodeClick={(_, node) => {
          // Nur Personen-Nodes: ID beginnt mit "P_"
          if (node.id.startsWith("P_")) {
            // Name aus Nodes-Array holen (Label ist "Name\nRolle")
            const label = typeof node.data?.label === "string" ? node.data.label : "";
            const name = label.split("\n")[0];
            if (name && onPersonClick) onPersonClick(name);
          }
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        <Controls showInteractive={false} />
        <MiniMap pannable zoomable />
      </ReactFlow>
    </div>
  );
}

export default function PrivateEmailOrgView({ persons, asns, onPersonClick }: Props) {
  return (
    <ReactFlowProvider>
      <Chart persons={persons} asns={asns} onPersonClick={onPersonClick} />
    </ReactFlowProvider>
  );
}
