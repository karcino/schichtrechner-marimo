"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow";
import { OrgNodeCard } from "./OrgNode";
import { DetailPanel } from "./DetailPanel";
import { buildGraph } from "@/lib/layout";
import { NODES, GROUPS, ORG_META, type Group, type OrgNode as OrgNodeT } from "@/lib/data";
import { SOURCES } from "@/lib/sources";

const nodeTypes = { org: OrgNodeCard };

const ALL_GROUPS = Object.keys(GROUPS) as Group[];
/** Default-Sichtbarkeit: "Kern"-Layer angezeigt, Zusatz-Layer als Opt-In. */
const DEFAULT_ACTIVE: Group[] = [
  "governance", "operations", "advisory", "services", "representation", "external", "clients",
];

function Chart() {
  const [active, setActive] = useState<Set<Group>>(new Set(DEFAULT_ACTIVE));
  const graph = useMemo(() => buildGraph(active), [active]);

  const [nodes, setNodes, onNodesChange] = useNodesState<{ node: OrgNodeT }>(graph.nodes as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graph.edges as Edge[]);
  const [selected, setSelected] = useState<OrgNodeT | null>(null);
  const [query, setQuery] = useState("");
  const [dark, setDark] = useState<boolean>(false);
  const { fitView } = useReactFlow();

  // Bei Gruppen-Toggle komplett neu layouten
  useEffect(() => {
    setNodes(graph.nodes as Node[]);
    setEdges(graph.edges as Edge[]);
    // Fit im nächsten Frame, wenn React Flow die neuen Nodes gesetzt hat
    requestAnimationFrame(() => fitView({ padding: 0.2, duration: 300 }));
  }, [graph, setNodes, setEdges, fitView]);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleDark = () => {
    const el = document.documentElement;
    const next = !el.classList.contains("dark");
    el.classList.toggle("dark", next);
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
    setDark(next);
  };

  const toggleGroup = (g: Group) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g); else next.add(g);
      return next;
    });
  };

  // Suche: dimmt nicht-matchende Knoten
  useEffect(() => {
    const q = query.trim().toLowerCase();
    setNodes((nds) =>
      nds.map((n) => {
        const on = n.data?.node as OrgNodeT | undefined;
        const hit =
          !q ||
          (on &&
            (on.label.toLowerCase().includes(q) ||
              on.role.toLowerCase().includes(q) ||
              on.description.toLowerCase().includes(q)));
        return { ...n, style: { ...n.style, opacity: hit ? 1 : 0.18 } };
      }),
    );
  }, [query, setNodes]);

  const onNodeClick = useCallback((_: React.MouseEvent, n: Node) => {
    const on = NODES.find((x) => x.id === n.id);
    if (on) setSelected(on);
  }, []);

  return (
    <div className="h-dvh grid grid-rows-[auto_1fr]">
      <header className="border-b border-line dark:border-line-dark bg-white/70 dark:bg-ink-soft/70 backdrop-blur">
        <div className="px-4 py-3 flex items-center gap-3 flex-wrap">
          <div className="mr-2">
            <div className="text-[11px] font-mono uppercase tracking-widest text-ink-soft/60 dark:text-paper/50">Organigramm</div>
            <div className="font-semibold text-ink dark:text-paper leading-tight">
              {ORG_META.name}{" "}
              <span className="text-ink-soft/60 dark:text-paper/60 font-normal">+ Betriebsrat</span>
            </div>
          </div>

          <div className="flex-1 min-w-[200px] max-w-sm">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Suche: Person, Rolle, Abteilung, Gesetz…"
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-line dark:border-line-dark bg-white dark:bg-ink focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>

          <div className="flex items-center gap-2 text-[12px] text-ink-soft/70 dark:text-paper/60">
            <span className="hidden md:inline">Stand {ORG_META.updated}</span>
            <button
              onClick={toggleDark}
              className="px-2 py-1 rounded-md border border-line dark:border-line-dark hover:bg-paper-soft dark:hover:bg-ink"
              aria-label="Dark mode umschalten"
            >
              {dark ? "☀︎" : "☾"}
            </button>
          </div>
        </div>

        {/* Gruppen-Chips: klickbar als Layer-Toggle */}
        <div className="px-4 pb-3 flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="text-ink-soft/60 dark:text-paper/50 mr-1">Ebenen:</span>
          {ALL_GROUPS.map((k) => {
            const g = GROUPS[k];
            const on = active.has(k);
            return (
              <button
                key={k}
                onClick={() => toggleGroup(k)}
                className={[
                  "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 transition",
                  on
                    ? "border-ink/20 dark:border-paper/30 bg-white dark:bg-ink-soft text-ink dark:text-paper"
                    : "border-line dark:border-line-dark text-ink-soft/40 dark:text-paper/35 hover:text-ink dark:hover:text-paper",
                ].join(" ")}
                aria-pressed={on}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: on ? g.color : "transparent", outline: on ? "none" : `1px dashed ${g.color}` }}
                />
                <span>{g.label}</span>
              </button>
            );
          })}
          <button
            onClick={() => setActive(new Set(ALL_GROUPS))}
            className="ml-1 rounded-full border border-accent/30 text-accent px-2 py-0.5 hover:bg-accent-soft/60"
          >
            Alles anzeigen
          </button>
          <button
            onClick={() => setActive(new Set(DEFAULT_ACTIVE))}
            className="rounded-full border border-line dark:border-line-dark text-ink-soft/70 dark:text-paper/60 px-2 py-0.5 hover:bg-paper-soft dark:hover:bg-ink"
          >
            Standard
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_380px] min-h-0">
        <div className="min-h-0">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            onPaneClick={() => setSelected(null)}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.2}
            maxZoom={2}
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={22} size={1} color={dark ? "#2b2b30" : "#d8d4ca"} />
            <MiniMap
              pannable
              zoomable
              nodeColor={(n) => {
                const on = NODES.find((x) => x.id === n.id);
                return on ? GROUPS[on.group].color : "#cbd5e1";
              }}
              maskColor={dark ? "rgba(10,10,10,.6)" : "rgba(255,255,255,.6)"}
            />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>

        <aside className="border-t md:border-t-0 md:border-l border-line dark:border-line-dark bg-white dark:bg-ink-soft min-h-0 overflow-hidden flex flex-col">
          <div className="flex-1 min-h-0">
            <DetailPanel node={selected} onClose={() => setSelected(null)} />
          </div>
          <div className="border-t border-line dark:border-line-dark px-5 py-3 text-[11px] text-ink-soft/60 dark:text-paper/50 bg-paper-soft/50 dark:bg-ink">
            <div className="flex justify-between">
              <span>Gegründet {ORG_META.founded}</span>
              <span>~{ORG_META.employees} Beschäftigte</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span>{nodes.length} sichtbare Knoten</span>
              <span>{Object.keys(SOURCES).length} Quellen</span>
            </div>
          </div>
        </aside>
      </div>

      <footer className="border-t border-line dark:border-line-dark bg-white dark:bg-ink-soft px-4 py-3 text-[11.5px]">
        <details>
          <summary className="cursor-pointer text-ink-soft/70 dark:text-paper/60 font-medium">
            Alle Quellen ({Object.keys(SOURCES).length})
          </summary>
          <ol className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 list-none">
            {Object.values(SOURCES).map((s) => (
              <li key={s.id} className="flex items-baseline gap-2">
                <span className="font-mono text-ink-soft/40 dark:text-paper/30 w-8 shrink-0">[{s.id}]</span>
                <a href={s.url} target="_blank" rel="noopener" className="text-accent hover:underline break-words">
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </details>
      </footer>
    </div>
  );
}

export default function OrgChart() {
  return (
    <ReactFlowProvider>
      <Chart />
    </ReactFlowProvider>
  );
}
