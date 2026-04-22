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
3. Framework: _Next.js_ wird automatisch erkannt. `vercel.json` setzt den Build-Command auf `npm run build:public` (siehe Sub-Projekt I / Dual-Build).
4. **Env-Variablen** (für Edit-UI + Review aus Sub-Projekt E — nur nötig wenn Kollaboration aktiv sein soll):
   - `EDIT_PASSWORD` — geteiltes Passwort für Vorschlags-Absender (frei wählbar, z.B. via `openssl rand -hex 16`)
   - `REVIEW_PASSWORD` — Pauls Admin-Passwort für `/review`. **Unbedingt anders wählen als `EDIT_PASSWORD`.**
   - `BRAIN_URL` — `https://<ref>.supabase.co/functions/v1/open-brain-mcp` (OB1 Edge Function)
   - `BRAIN_KEY` — der MCP-Access-Key aus dem OB1-Setup
   - `SUPABASE_URL` — `https://<ref>.supabase.co` (nur base-URL, ohne `/functions/...`)
   - `SUPABASE_SERVICE_KEY` — der Secret-Key aus Supabase → Settings → API Keys → Secret keys → default (beginnt mit `sb_secret_`)
   Ohne diese Env-Vars antworten `/api/propose` + `/api/review` mit 503 — der Button erscheint weiterhin, leitet aber zum Fehler-State. Also entweder alle setzen oder `ProposalButton` in [ViewSwitcher.tsx](components/ViewSwitcher.tsx) auskommentieren.
5. Deploy. Fertiges Deployment unter `https://<projekt>.vercel.app`.

Die restliche Repo (Marimo-Notebooks) wird von Vercel ignoriert, weil das Root-Directory auf den Unterordner zeigt.

## Build-Modes (Dual-Build, Sub-Projekt I)

```bash
npm run dev              # Public-Mode, Default
npm run dev:private      # Private-Mode — lädt enrichments.private.ts (gitignored)
npm run build:public     # für Vercel-Deploy
npm run build:private    # nur lokal, niemals zu Vercel pushen
npm run check:no-private-leaks   # Post-Build-Scan auf verbotene Marker
```

Details: `lib/enrichments.ts` importiert aus der auto-generierten `lib/enrichments.generated.ts`. Der Generator (`scripts/generate-enrichments.mjs`) bündelt den commiteten Stub mit der optionalen privaten Datei, wenn BUILD_MODE=private und die Datei existiert.

## Eingabe-UI (Sub-Projekt E, Scope E-LITE)

Floating-Button unten rechts → Passwort → Name → Form (Kategorie + Content + optional Quelle/Knoten-ID) → POST `/api/propose` → Vorschlag landet in OB1 mit tag `edit-proposal` + `pending`.

Kein Accounts-System, kein Tracking. Name bleibt in `localStorage`, Passwort wird nach erstem erfolgreichen Submit auch gecached.

## Proposal-Review (Paul-only)

`/review?key=<REVIEW_PASSWORD>` zeigt alle Proposals gefiltert nach Status (`pending`, `accepted`, `rejected`, `later`). Accept/Reject/Later-Buttons aktualisieren das Status-Metadata-Feld direkt in der Supabase-DB.

**Accept → GitHub-Issue-Automation:** Wenn die drei Env-Vars `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO` gesetzt sind, erzeugt ein Klick auf "Accept" zusätzlich automatisch ein GitHub-Issue im Repo mit dem strukturierten Vorschlags-Inhalt + Kategorie-Hinweisen zur Integration in `data.ts`/`sources.ts`. Der Issue-Link taucht danach in der /review-Karte auf. Token braucht `public_repo` (oder `repo` für Private).

Alternativ-Zugang via Claude-Code-MCP:
```
> adberlin-brain: liste pending edit-proposals auf
```

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
