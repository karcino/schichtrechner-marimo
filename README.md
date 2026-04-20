# Schichtrechner — ambulante dienste e.V.

HTV-konformer Schichtlohn-Rechner als [marimo](https://marimo.io)-Notebook.
Berechnet Brutto und Netto einer einzelnen Schicht nach **§ 7 HTV** (Haustarifvertrag
der ambulante dienste e.V.) für **Entgeltgruppe 5, Erfahrungsstufe 2**.

**Live:** https://karcino.github.io/schichtrechner-marimo (nach erstem Deploy)

## Features

- Brutto-Berechnung nach § 7 HTV (Nacht, Samstag 13-21 h, Sonntag, Feiertag, KV)
- Korrektes Zuschlags-Stacking (§ 7 Abs. 1 Satz 3: Nachtzuschlag stapelt, c-f untereinander nicht)
- Wechselschichtzulage (§ 7 Abs. 5) + Organisationszulage (§ 7 Abs. 7)
- Fahrtzeit-Pauschale (bei KV mit +25 %)
- Tagesübergang (z.B. Mo 22:00 → Di 06:00)
- Netto-Schätzung: SV 2026 (21,75 %) + Lohnsteuer BMF PAP 2026 (Steuerklasse I)
- Vollständige Dokumentation aller Paragraphen direkt im Notebook

## Lokal starten

```bash
# Dependencies installieren (uv installiert automatisch Python 3.11+)
uv sync

# Notebook editieren
uv run marimo edit notebook.py

# Als App ausführen (ohne Code)
uv run marimo run notebook.py
```

Falls uv noch nicht installiert ist: https://docs.astral.sh/uv/getting-started/installation/

## Statisch als WebAssembly exportieren

```bash
uv run marimo export html-wasm notebook.py -o public --mode run
```

Das Ergebnis ist eine statische Website in `public/`, die komplett im Browser
läuft — kein Server nötig. Python-Code wird via Pyodide (WebAssembly) im Browser
ausgeführt.

## GitHub Pages Deployment

Die Datei `.github/workflows/deploy.yml` deployt bei jedem Push auf `main`
automatisch nach GitHub Pages. Vor dem ersten Deploy:

1. Repo erstellen: `gh repo create karcino/schichtrechner-marimo --public --source=. --remote=origin`
2. Push: `git push -u origin main`
3. In **Settings → Pages** den Source auf **"GitHub Actions"** umstellen.
4. Workflow läuft automatisch beim nächsten Push.

## Rechtliche Grundlage

Dieser Rechner basiert auf:

- **Haustarifvertrag ambulante dienste e.V.** vom 5. März 2020, inkl. 2. ÄnderungsTV
  gültig ab 1. Oktober 2023 (§ 5, § 6 Abs. 5, § 7)
- **Anlage C** zum HTV — Entgelttabelle gültig ab Februar 2025
- **BMF Programmablaufplan 2026 (PAP 2026)** für Lohnsteuer nach § 32a EStG
- **SV-Beitragssätze 2026** nach AOK / DRV / Bundesregierung

Vollständige Quellen und Zitate sind im Notebook dokumentiert.

## Disclaimer

Inoffizielle Re-Implementation durch einen Beschäftigten. Keine Rechtsberatung.
Im Zweifel gilt die offizielle Gehaltsabrechnung. Bei Abweichungen mit der
Personalabteilung klären.

## Lizenz

MIT — siehe `LICENSE`.
