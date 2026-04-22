# organigramm/ingest

Python-Ingestion-Pipeline für das ADBerlin Organisations-Analysis-Projekt.
Aktuell implementiert: **C — Schichtplaner-Aggregate**.
Geplant: B (Posteo-Email, nach Rechts-Check), D (Register-Scraper).

## Installation

Aus dem Repo-Root:

```bash
uv sync --group dev      # installiert pandas + pytest
```

Oder manuell:

```bash
python -m venv .venv
source .venv/bin/activate
pip install pandas pytest
```

## Tests laufen lassen

```bash
# Aus dem Repo-Root, damit der Import-Pfad `organigramm.ingest.*` funktioniert:
pytest organigramm/ingest/tests/ -v
```

Die Privacy-Filter-Tests **müssen grün sein**, bevor echte Schichtplaner-
Daten durchlaufen. Das ist die fail-closed-Garantie.

## Schichtplaner-Aggregate CLI

```bash
python -m organigramm.ingest.schichtplaner_aggregate \
  --input /pfad/zur/schichtplaner-export.csv \
  --output organigramm/proposals/schicht-aggregate-$(date +%Y-%m).json
```

Wenn die CSV unbekannte Spalten enthält:
```
PRIVACY-STOP: Disallowed Columns in ...csv: customer_name. Erlaubte Spalten: ...
```
Exit-Code **2** → CI/pre-commit kann darauf reagieren.

## Whitelist erweitern

Die erlaubten Spalten stehen in `schichtplaner_aggregate.py` als
`ALLOWED_COLUMNS`. Änderungen brauchen PR-Review + Begründung, warum
das neue Feld keine Kund\*innen-Daten enthält.

## Keine Kund\*innen-Daten ins Repo

Auch die **Rohdaten** (die CSV-Dateien selbst) gehören **nicht** ins Repo.
Sie liegen bei Paul lokal unter `~/Desktop/ADBerlin/AppCalAvaiabilities/
AD Schichtplaner/`. Aus dem Repo gitignored ist `organigramm/raw/` und
`*.eml`. Die CSV-Dateien liegen außerhalb des Repo-Verzeichnisbaums —
das Ingest-Script liest von dort und schreibt nur das Aggregat in
`organigramm/proposals/`.
