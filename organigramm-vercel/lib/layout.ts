import dagre from "@dagrejs/dagre";
import type { Edge, Node } from "reactflow";
import { NODES, EDGES, type Group } from "./data";

const NODE_W = 220;
const NODE_H = 90;

export function buildGraph(activeGroups: Set<Group>): { nodes: Node[]; edges: Edge[] } {
  const visibleNodeIds = new Set(NODES.filter((n) => activeGroups.has(n.group)).map((n) => n.id));

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TB", nodesep: 30, ranksep: 68, edgesep: 12, marginx: 24, marginy: 24 });

  for (const n of NODES) {
    if (!visibleNodeIds.has(n.id)) continue;
    g.setNode(n.id, { width: NODE_W, height: NODE_H });
  }
  for (const e of EDGES) {
    if (!visibleNodeIds.has(e.from) || !visibleNodeIds.has(e.to)) continue;
    // Optional layer-constraint: Kante nur sichtbar, wenn ihr Layer aktiv ist
    if (e.layer && !activeGroups.has(e.layer)) continue;
    g.setEdge(e.from, e.to);
  }

  dagre.layout(g);

  const nodes: Node[] = NODES.filter((n) => visibleNodeIds.has(n.id)).map((n) => {
    const pos = g.node(n.id);
    return {
      id: n.id,
      type: "org",
      data: { node: n },
      position: { x: pos.x - NODE_W / 2, y: pos.y - NODE_H / 2 },
      width: NODE_W,
      height: NODE_H,
    };
  });

  const edges: Edge[] = EDGES
    .filter((e) => visibleNodeIds.has(e.from) && visibleNodeIds.has(e.to))
    .filter((e) => !e.layer || activeGroups.has(e.layer))
    .map((e, i) => ({
      id: `e${i}`,
      source: e.from,
      target: e.to,
      label: e.label,
      type: "smoothstep",
    }));

  return { nodes, edges };
}
