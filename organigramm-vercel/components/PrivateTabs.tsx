"use client";

import { useState } from "react";
import type { PrivateDataset } from "@/lib/private-data-types";
import PrivateBueroOrgView from "./private/PrivateBueroOrgView";
import PrivateASNView from "./private/PrivateASNView";
import PrivateCommLogView from "./private/PrivateCommLogView";
import PrivateEmailOrgView from "./private/PrivateEmailOrgView";

type Tab = "graph" | "buero" | "asn" | "comm";

export default function PrivateTabs({ dataset }: { dataset: PrivateDataset }) {
  const [tab, setTab] = useState<Tab>("graph");
  // Cross-Tab-Linking: wenn jemand in Büro-Tab auf einen Namen klickt, wird
  // der gleich im Comm-Log-Tab vorausgewählt.
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);

  const handlePersonClick = (name: string) => {
    setSelectedPerson(name);
    setTab("comm");
  };

  const tabBtn = (id: Tab, label: string, count: number) => (
    <button
      key={id}
      onClick={() => setTab(id)}
      className={`text-xs px-3 py-1.5 rounded-md transition font-medium ${
        tab === id
          ? "bg-accent text-white"
          : "text-ink-soft hover:bg-ink-soft/5 dark:text-paper/70"
      }`}
    >
      {label} <span className="opacity-60 ml-1">({count})</span>
    </button>
  );

  const allFound =
    dataset.status.personsFound &&
    dataset.status.asnsFound &&
    dataset.status.commLogFound;

  return (
    <div className="min-h-screen bg-paper dark:bg-ink">
      <nav className="border-b border-ink-soft/10 bg-white dark:bg-ink-soft px-4 py-2 flex items-center gap-2 flex-wrap">
        <h1 className="text-sm font-mono font-semibold text-ink dark:text-paper mr-4">
          ad e.V. · Private Ansicht
        </h1>
        {tabBtn("graph", "📊 Email-Organigramm", dataset.persons.length + dataset.asns.length)}
        {tabBtn("buero", "Büro-Organigramm", dataset.persons.length)}
        {tabBtn("asn", "ASN-Übersicht", dataset.asns.length)}
        {tabBtn(
          "comm",
          "Kommunikations-Protokoll",
          Object.keys(dataset.commLogByPerson).length,
        )}
        <span className="ml-auto text-[10px] font-mono text-ink-soft">
          {allFound ? "◉ private data loaded" : "◌ private data missing"}
        </span>
      </nav>

      {!allFound && (
        <div className="p-4 text-sm bg-warn-soft border-b border-warn/30 text-warn-ink">
          <strong>Hinweis:</strong> Eine oder mehrere Private-JSONs fehlen in
          <code className="mx-1 font-mono text-xs">
            {dataset.status.rawDirAbsolute}
          </code>
          . Diese Seite funktioniert nur lokal auf einem Rechner, wo die
          Files existieren (gitignored, nicht im Vercel-Build).
        </div>
      )}

      {tab === "graph" && (
        <PrivateEmailOrgView
          persons={dataset.persons}
          asns={dataset.asns}
          paulShiftsByAsn={dataset.paulShiftsByAsn}
          onPersonClick={handlePersonClick}
        />
      )}
      {tab === "buero" && (
        <PrivateBueroOrgView
          persons={dataset.persons}
          onPersonClick={handlePersonClick}
        />
      )}
      {tab === "asn" && (
        <PrivateASNView
          asns={dataset.asns}
          paulShiftsByAsn={dataset.paulShiftsByAsn}
          onPersonClick={handlePersonClick}
        />
      )}
      {tab === "comm" && (
        <PrivateCommLogView
          persons={dataset.persons}
          commLogByPerson={dataset.commLogByPerson}
          preselected={selectedPerson ?? undefined}
        />
      )}
    </div>
  );
}
