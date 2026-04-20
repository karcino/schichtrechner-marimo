# HTV-Schichtrechner

Schichtlohn-Rechner als [marimo](https://marimo.io)-Notebook.
Berechnet Brutto und Netto nach **§ 7 HTV** (Haustarifvertrag persönliche Assistenz)
für **Entgeltgruppe 5, Erfahrungsstufe 2**.

Drei Varianten:

- **Einzel-Rechner** (`notebook.py` → Pages `/`) — eine Schicht eingeben, Brutto + Netto sehen.
- **Monats-Rechner** (`notebook_monat.py` → Pages `/monat/`) — komplette Monatsabrechnung simulieren
  mit mehreren Schichten, CSV-Import aus Schichtplaner-Apps, gecappter Wechselschichtzulage
  (§ 7 Abs. 5: max 105 EUR/Monat) und exaktem Monats-Netto.
- **Abgleich-Pipeline** (`notebook_abgleich.py`, nur lokal) — Skeleton, das eigene CSV,
  DATEV-PDF und AG-Schichtenliste (PDF) einliest, Differenzen auswertet und
  `.eml`-Mail-Entwuerfe schreibt. Nicht WASM-faehig.

Gemeinsame Berechnungslogik liegt in `htv_calc.py` und wird beim WASM-Build per `build_wasm.py`
in beide Notebooks inlined (Pyodide importiert keine externen Python-Dateien).

Live via GitHub Pages — Python läuft als WebAssembly direkt im Browser, kein Server.

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

### Abgleich-Pipeline (lokal, mit PDF-Parsing)

```bash
# Zusaetzliche Deps installieren (pdfplumber, pandas)
uv sync --extra abgleich

# Pipeline-Notebook editieren
uv run marimo edit notebook_abgleich.py
```

Erzeugte Mail-Entwuerfe landen als `.eml` in `outbox/` — manuell in
Outlook/Thunderbird oeffnen und versenden.

Falls uv noch nicht installiert ist: https://docs.astral.sh/uv/getting-started/installation/

## Statisch als WebAssembly exportieren

```bash
# 1) htv_calc.py in beide Notebooks inlinen (self-contained für Pyodide)
uv run python build_wasm.py

# 2) Beide Notebooks exportieren
uv run marimo export html-wasm _build/notebook.py       -o public       --mode run
uv run marimo export html-wasm _build/notebook_monat.py -o public/monat --mode run
```

Das Ergebnis ist eine statische Website in `public/`, die komplett im Browser
läuft — kein Server nötig. Python-Code wird via Pyodide (WebAssembly) im Browser
ausgeführt. Der Monats-Rechner ist unter `public/monat/` erreichbar.

## GitHub Pages Deployment

Die Datei `.github/workflows/deploy.yml` deployt bei jedem Push auf `main`
automatisch nach GitHub Pages. Vor dem ersten Deploy:

1. Repo anlegen und pushen.
2. In **Settings → Pages** den Source auf **"GitHub Actions"** umstellen.
3. Workflow läuft automatisch beim nächsten Push.

## Rechtliche Grundlage

Dieser Rechner basiert auf:

- **Haustarifvertrag (HTV) persönliche Assistenz** vom 5. März 2020, inkl. 2. ÄnderungsTV
  gültig ab 1. Oktober 2023 (§ 5, § 6 Abs. 5, § 7)
- **Anlage C** zum HTV — Entgelttabelle gültig ab Februar 2025
- **BMF Programmablaufplan 2026 (PAP 2026)** für Lohnsteuer nach § 32a EStG
- **SV-Beitragssätze 2026** nach AOK / DRV / Bundesregierung

Vollständige Quellen und Zitate sind im Notebook dokumentiert.

## Disclaimer

Inoffizielle Implementation. Keine Rechtsberatung. Im Zweifel gilt die offizielle
Gehaltsabrechnung. Bei Abweichungen mit der Personalabteilung klären.

## Lizenz

MIT — siehe `LICENSE`.
