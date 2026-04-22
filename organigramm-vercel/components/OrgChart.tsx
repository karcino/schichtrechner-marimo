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
import { ProcessPanel } from "./ProcessPanel";
import { buildGraph } from "@/lib/layout";
import { NODES, GROUPS, ORG_META, PROCESSES, type Group, type OrgNode as OrgNodeT } from "@/lib/data";
import { SOURCES } from "@/lib/sources";

const nodeTypes = { org: OrgNodeCard };

const ALL_GROUPS = Object.keys(GROUPS) as Group[];
/** Default: Kern-Struktur sichtbar; Prozesse/Modi/Kanäle opt-in. */
const DEFAULT_ACTIVE: Group[] = [
  "governance", "operations", "advisory", "services", "representation", "external", "clients",
];

function Chart() {
  const [active, setActive] = useState<Set<Group>>(new Set(DEFAULT_ACTIVE));
  const [activeProcess, setActiveProcess] = useState<string | null>(null);

  const highlightIds = useMemo(() => {
    if (activeProcess) return new Set(PROCESSES[activeProcess]?.involves ?? []);
    return undefined;
  }, [activeProcess]);

  const dimmIds = useMemo(() => {
    if (!activeProcess) return undefined;
    const involved = new Set(PROCESSES[activeProcess]?.involves ?? []);
    const toDim = new Set<string>();
    for (const n of NODES) if (!involved.has(n.id)) toDim.add(n.id);
    return toDim;
  }, [activeProcess]);

  const graph = useMemo(
    () => buildGraph({ activeGroups: active, highlightIds, dimmIds }),
    [active, highlightIds, dimmIds]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState<{ node: OrgNodeT; highlighted?: boolean; dimmed?: boolean }>(graph.nodes as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graph.edges as Edge[]);
  const [selected, setSelected] = useState<OrgNodeT | null>(null);
  const [query, setQuery] = useState("");
  const [dark, setDark] = useState<boolean>(false);
  const { fitView } = useReactFlow();

  useEffect(() => {
    setNodes(graph.nodes as Node[]);
    setEdges(graph.edges as Edge[]);
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
    <div className="h-dvh grid grid-rows-[auto_auto_1fr]">
      <header className="border-b border-line dark:border-line-dark bg-white/70 dark:bg-ink-soft/70 backdrop-blur">
        <div className="px-4 py-3 flex items-center gap-3 flex-wrap">
          <div className="mr-2">
            <div className="text-[11px] font-mono uppercase tracking-widest text-ink-soft/60 dark:text-paper/50">Organigramm · interaktiv</div>
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
              placeholder="Suche: Person, Rolle, Abteilung, Gesetz, Prozess…"
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

        {/* Gruppen-Chips (Ebenen) */}
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
            Alles
          </button>
          <button
            onClick={() => setActive(new Set(DEFAULT_ACTIVE))}
            className="rounded-full border border-line dark:border-line-dark text-ink-soft/70 dark:text-paper/60 px-2 py-0.5 hover:bg-paper-soft dark:hover:bg-ink"
          >
            Standard
          </button>
          <button
            onClick={() => setActive(new Set(["process","mode","channel","advisory","operations","assistance","clients"] as Group[]))}
            className="rounded-full border border-danger/30 text-danger px-2 py-0.5 hover:bg-danger-soft/60"
          >
            Fokus: Vermittlung
          </button>
        </div>
      </header>

      {/* Prozess-Leiste (immer sichtbar, kompakt) */}
      <ProcessPanel
        activeProcess={activeProcess}
        onSelect={(id) => {
          setActiveProcess(id);
          if (id) {
            setActive((prev) => {
              const next = new Set(prev);
              (["process", "mode", "channel"] as Group[]).forEach((g) => next.add(g));
              return next;
            });
          }
        }}
        onHover={() => { /* noop — hover-Highlighting in v1 deaktiviert */ }}
      />

      <div className="grid grid-cols-1 md:grid-cols-[1fr_400px] min-h-0">
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
              <span>{Object.keys(SOURCES).length} Quellen · {Object.keys(PROCESSES).length} Prozesse</span>
            </div>
          </div>
        </aside>
      </div>
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
