"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// Client-side only: React Flow und Matrix brauchen Browser-DOM.
const OrgChart = dynamic(() => import("./OrgChart"), { ssr: false });
const RACIMatrix = dynamic(() => import("./RACIMatrix"), { ssr: false });

type View = "organigramm" | "raci";

export default function ViewSwitcher() {
  const [view, setView] = useState<View>("organigramm");

  return (
    <div className="min-h-screen bg-paper dark:bg-ink">
      <nav className="border-b border-ink-soft/10 bg-white dark:bg-ink-soft px-4 py-2 flex items-center gap-1">
        <h1 className="text-sm font-mono font-semibold text-ink dark:text-paper mr-4">
          ad e.V. · Organisations-Analyse
        </h1>
        <button
          onClick={() => setView("organigramm")}
          className={`text-xs px-3 py-1.5 rounded-md transition font-medium ${
            view === "organigramm"
              ? "bg-accent text-white"
              : "text-ink-soft hover:bg-ink-soft/5 dark:text-paper/70"
          }`}
        >
          Organigramm
        </button>
        <button
          onClick={() => setView("raci")}
          className={`text-xs px-3 py-1.5 rounded-md transition font-medium ${
            view === "raci"
              ? "bg-accent text-white"
              : "text-ink-soft hover:bg-ink-soft/5 dark:text-paper/70"
          }`}
        >
          Prozesse (RACI)
        </button>
      </nav>
      {view === "organigramm" ? <OrgChart /> : <RACIMatrix />}
    </div>
  );
}
