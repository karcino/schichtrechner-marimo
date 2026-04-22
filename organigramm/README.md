# Organigramm-Recherche: ambulante dienste e.V. + Betriebsrat

## Inhalt dieses Ordners

| Datei | Zweck |
|-------|-------|
| `HANDOFF.md` | Übergabedokument – alle URLs, offene Punkte, bisherige Rechercheergebnisse |
| `V2-PROPOSALS.md` | Ideen-Sammlung für spätere View-Erweiterungen |
| `OSINT-PLAN.md` | Grün/Gelb/Rot-Zonen-Plan für öffentliche Register + manuelle Quellen |
| `scrape.sh` | Shell-Skript: Mirror + PDF-Download + Text-Extraktion (lokal ausführen) |
| `data.yaml` | Strukturierte Rohdaten (Search-Snippets — nur für Erst-Einstieg) |
| `organigramm_draft.mmd` | Erster Mermaid-Entwurf des Organigramms |
| `raw/`, `pdfs/`, `pdf_text/` | (leer, gitignored) werden von `scrape.sh` oder Ingestion-Pipeline befüllt |
| `ingest/` | Python-Ingestion-Pipeline (Sub-Projekte B, C, D) — später |
| `proposals/` | Auto-generierte Update-Vorschläge aus OB1 (Sub-Projekt D) — später |

Die **gerenderte App** mit dem interaktiven Organigramm liegt in `../organigramm-vercel/`. Die kuratierten Daten stehen in [../organigramm-vercel/lib/data.ts](../organigramm-vercel/lib/data.ts), die Quellen in [../organigramm-vercel/lib/sources.ts](../organigramm-vercel/lib/sources.ts), Anreicherungen in [../organigramm-vercel/lib/enrichments.ts](../organigramm-vercel/lib/enrichments.ts).

## Quick-Start auf einer Maschine mit Netz

```bash
cd organigramm
sudo apt install -y wget curl poppler-utils        # pdftotext
chmod +x scrape.sh
./scrape.sh
# → mirror/, pdfs/, pdf_text/, raw/keyword_hits.txt werden erzeugt

# Mermaid rendern (optional)
npm i -g @mermaid-js/mermaid-cli
mmdc -i organigramm_draft.mmd -o organigramm.svg
```

Danach `data.yaml` mit den echten Namen aus `raw/keyword_hits.txt`, `mirror/` und `pdf_text/` anreichern.

## OB1 (Open Brain) — Memory-Layer für erweiterte Ingestion

Mit Sub-Projekt A wird eine Zwei-Instanz-OB1-Konfiguration eingeführt ([OB1-Repo](https://github.com/NateBJones-Projects/OB1)):

- **`adberlin-private-brain`** — lokale Instanz auf Paul's Mac (Docker-compose, nur 127.0.0.1). Speichert Posteo-Email-Threads, PDF-Attachments, Schichtplaner-Roh-CSVs. Enthält PII und fließt **nie** in einen öffentlichen Build.
- **`adberlin-public-brain`** — Supabase-gehosted. Speichert nur OSINT-Register-Hits, Website-Scrapes, aggregierte Schichtplaner-Signale, Edit-Proposals. Deploy-sicher.

Beide Instanzen sprechen via MCP mit Claude Code. Die Tool-Präfixe machen sichtbar, gegen welche Instanz gerade gearbeitet wird:

- `adberlin-private-brain__query` — Paul-only, lokal
- `adberlin-public-brain__query` — alle Claude-Code-Sessions

**Setup** (wird in Phase 2 von Sub-Projekt A ausgeführt — siehe Plan):
1. OB1-Repo klonen: `git clone https://github.com/NateBJones-Projects/OB1 ~/Desktop/Code_Projects/OB1`
2. Private Instanz: `docker compose up -d` im OB1-Repo, Postgres-Port nur lokal
3. Public Instanz: Supabase-Projekt `adberlin-public-brain` anlegen, `.env` mit URL/Key
4. MCP-Konfig in `~/.claude.json` ergänzen (zwei Server-Einträge)
5. Healthcheck: `curl http://localhost:PORT/health` für Privat · MCP-Tools in Claude-Code-Liste prüfen

## Build-Modes der Vercel-App

Die App unterstützt zwei Build-Modi (Sub-Projekt I):

```bash
# Öffentlich — was auf Vercel läuft, keine Email-Spur
cd organigramm-vercel
BUILD_MODE=public npm run dev          # oder: npm run build

# Privat — nur Paul lokal, Email-Enrichments sichtbar mit Label "Mailaustausch mit Arbeitgeber"
BUILD_MODE=private npm run dev
```

`enrichments.private.ts` lebt **gitignored** neben `enrichments.ts` und wird nur im Privat-Modus dazugeladen.
