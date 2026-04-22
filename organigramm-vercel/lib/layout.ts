import dagre from "@dagrejs/dagre";
import type { Edge, Node } from "reactflow";
import { NODES, EDGES, type Group, normalizeVerify } from "./data";

const NODE_W = 220;
const NODE_H = 96;

type BuildOpts = {
  activeGroups: Set<Group>;
  /** Nodes, die durch einen aktiven Prozess hervorgehoben werden. */
  highlightIds?: Set<string>;
  /** Nodes, die gedimmt werden sollen (wenn Prozess aktiv & Knoten nicht beteiligt). */
  dimmIds?: Set<string>;
};

export function buildGraph({ activeGroups, highlightIds, dimmIds }: BuildOpts): { nodes: Node[]; edges: Edge[] } {
  const visibleNodeIds = new Set(NODES.filter((n) => activeGroups.has(n.group)).map((n) => n.id));

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TB", nodesep: 28, ranksep: 68, edgesep: 12, marginx: 24, marginy: 24 });

  for (const n of NODES) {
    if (!visibleNodeIds.has(n.id)) continue;
    g.setNode(n.id, { width: NODE_W, height: NODE_H });
  }
  for (const e of EDGES) {
    if (!visibleNodeIds.has(e.from) || !visibleNodeIds.has(e.to)) continue;
    if (e.layer && !activeGroups.has(e.layer)) continue;
    g.setEdge(e.from, e.to);
  }

  dagre.layout(g);

  const nodes: Node[] = NODES.filter((n) => visibleNodeIds.has(n.id)).map((n) => {
    const pos = g.node(n.id);
    const highlighted = highlightIds?.has(n.id);
    const dimmed = !!dimmIds && dimmIds.has(n.id);
    return {
      id: n.id,
      type: "org",
      data: { node: n, highlighted, dimmed },
      position: { x: pos.x - NODE_W / 2, y: pos.y - NODE_H / 2 },
      width: NODE_W,
      height: NODE_H,
    };
  });

  const edges: Edge[] = EDGES
    .filter((e) => visibleNodeIds.has(e.from) && visibleNodeIds.has(e.to))
    .filter((e) => !e.layer || activeGroups.has(e.layer))
    .map((e, i) => {
      const v = normalizeVerify(e.verify ?? "inferred");
      const isHighlighted = highlightIds?.has(e.from) && highlightIds?.has(e.to);
      return {
        id: `e${i}`,
        source: e.from,
        target: e.to,
        label: e.label,
        type: "smoothstep",
        animated: isHighlighted,
        style: {
          strokeWidth: isHighlighted ? 2.2 : 1.1,
          stroke: isHighlighted ? "#c2410c" : (v === "assumed" ? "#9ca3af" : v === "inferred" ? "#b45309" : undefined),
          strokeDasharray: v === "assumed" ? "3 3" : undefined,
          opacity: dimmIds && (dimmIds.has(e.from) || dimmIds.has(e.to)) ? 0.15 : 1,
        },
        labelStyle: { fontSize: 10, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" },
      } as Edge;
    });

  return { nodes, edges };
}
