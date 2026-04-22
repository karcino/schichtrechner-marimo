# Organigramm ad e.V. · Vercel-Version

Interaktive, zoombare Org-Chart-Webapp für
[ambulante dienste e.V.](https://www.adberlin.com/neu/) und seinen
[Betriebsrat](https://betriebsrat-ad.de/), gebaut mit Next.js 14, React Flow,
Tailwind und Dagre (Auto-Layout).

Komplementär zur statischen Mermaid-Seite unter
[`/organigramm/`](../organigramm/site/) — diese Vercel-Version hat:

- **React Flow** mit Pan, Zoom, Minimap
- **Dagre-Auto-Layout** (Hierarchie wird aus `lib/data.ts` berechnet)
- **Custom Node Cards** mit Verifikations-Badge, Quellen-Counter, Gruppen-Farbstreifen
- **Detail-Panel** mit vollständigen Belegen und OSM-Verlinkung bei Adressen
- **Volltextsuche** (dimmt nicht-matchende Knoten)
- **Dark Mode** (System-Preference + Toggle, kein FOUC)
- **Aufklappbare Quellen-Leiste** unten mit allen ~23 Primärquellen
- Mobile-responsive, Tastaturbedienbar

## Lokal starten

```bash
cd organigramm-vercel
npm install
npm run dev      # http://localhost:3000
```

## Auf Vercel deployen

1. Auf vercel.com **New Project** → Repo `schichtrechner-marimo` importieren.
2. **Root Directory** auf `organigramm-vercel` setzen.
3. Framework: _Next.js_ wird automatisch erkannt. Keine Env-Variablen nötig.
4. Deploy. Fertig — fertiges Deployment unter `https://<projekt>.vercel.app`.

Die restliche Repo (Marimo-Notebooks) wird von Vercel ignoriert, weil das
Root-Directory auf den Unterordner zeigt.

## Daten pflegen

Alle Strukturdaten liegen in `lib/data.ts` (Knoten + Kanten + Gruppen) und
`lib/sources.ts` (nummerierte Quellenliste). Neue Knoten hinzufügen:

```ts
// lib/data.ts
{
  id: "NEU",
  label: "Neue Einheit",
  role: "Kurze Rolle",
  description: "Beschreibung…",
  verify: "snippet",                 // ok | snippet | archive
  group: "operations",               // governance | operations | advisory | …
  sources: ["S4"],                   // referenziert lib/sources.ts
}
```

Kante ergänzen:

```ts
{ from: "GF", to: "NEU", label: "bestellt" }
```

Dagre berechnet das Layout neu beim ersten Render. Auto-Layout-Parameter
(Abstand zwischen Ranks, Orientierung) in `lib/layout.ts`.

## Dateien

```
organigramm-vercel/
├── app/
│   ├── layout.tsx      Metadata + Dark-Mode-Preload
│   ├── page.tsx        dynamic(OrgChart, { ssr: false })
│   └── globals.css     Tailwind + React-Flow-Overrides
├── components/
│   ├── OrgChart.tsx    Haupt-Canvas mit Header, Suche, Panel
│   ├── OrgNode.tsx     Custom-Node-Kachel
│   └── DetailPanel.tsx Seiten-Panel mit Quellen + OSM-Link
├── lib/
│   ├── data.ts         Knoten, Kanten, Gruppen, Meta
│   ├── layout.ts       Dagre → React-Flow
│   └── sources.ts      Belegstellen
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.js
└── package.json
```
