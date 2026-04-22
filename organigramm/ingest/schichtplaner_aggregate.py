"""Fail-closed Privacy-Filter für Schichtplaner-CSVs.

Sub-Projekt C aus dem Org-Analysis-Plan. Kernfunktion: aus Schichtplan-
Exporten Prozess-Signale (wie viele Schichten pro Einsatzort, Typ-Mix,
Rollen-Mix) ziehen, OHNE dass Kund*innen-Daten je in einem DataFrame landen.

Architektur:
- ALLOWED_COLUMNS ist die einzige Quelle der Wahrheit. Nur diese Spalten
  dürfen vom Reader akzeptiert werden.
- Taucht im CSV eine unbekannte Spalte auf → PrivacyViolation, Abbruch.
  Das ist FAIL-CLOSED: eine neue Spalte ist ein Stoppschild, kein stiller
  Pass. Weil Privacy-Lecks meistens durch neue, ungeprüfte Felder passieren.
- Nach Filterung werden Aggregate in JSON geschrieben, die Einzeldaten
  nicht mehr rekonstruierbar machen (Counts, Summen, Verteilungen).

Usage:
    from pathlib import Path
    from organigramm.ingest.schichtplaner_aggregate import aggregate_to_json

    aggregate_to_json(
        input_csv=Path("~/Desktop/ADBerlin/AppCalAvaiabilities/AD Schichtplaner/example.csv"),
        output_json=Path("organigramm/proposals/schicht-aggregate-YYYY-MM.json"),
    )

CLI:
    python -m organigramm.ingest.schichtplaner_aggregate \\
        --input path/to/export.csv --output path/to/aggregate.json
"""

from __future__ import annotations

import argparse
import json
from collections import Counter
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Iterable

try:
    import pandas as pd
except ImportError as e:
    raise ImportError(
        "pandas fehlt. Installieren mit: uv pip install pandas "
        "oder pyproject.toml dev-deps nutzen."
    ) from e


# ── Privacy-Gate ──────────────────────────────────────────────────────────────

#: Whitelist der erlaubten Spalten. ÄNDERN ERFORDERT DISKUSSION + PR-Review.
#: Neue Spalten, die drin aufgenommen werden wollen, müssen erklären warum
#: sie keine Kund*innen-Daten sind (d.h. nicht einzelnen Personen zuordenbar).
ALLOWED_COLUMNS: frozenset[str] = frozenset({
    # Zeitfenster der Schicht (unbedenklich — keine PII)
    "shift_start",      # ISO-Datetime oder Datum
    "shift_end",        # ISO-Datetime oder Datum
    # Typisierung
    "shift_type",       # "Tag" / "Nacht" / "Bereitschaft" / "KV" / etc.
    # Ort — nur Einsatzorts-Codes, NICHT Adressen
    "location_code",    # "BB-WEST", "BB-NORD", "EINSATZ-HQ", "EINSATZ-MOBIL"
    # Rolle — nur anonyme Rollen-Codes, NICHT Mitarbeiter*innen-IDs
    "role_code",        # "ASS", "PDL", "FK", "QM", "PRAK" (Praktikant*in)
    # Vorlauf für KV-Berechnung (§ 7 Abs. 6 HTV)
    "lead_hours",       # Integer: Stunden zwischen Ankündigung und Schicht-Start
})

#: Spalten-Namen, die EXPLIZIT niemals akzeptiert werden. Redundant zur
#: Whitelist, aber als Defense-in-Depth + aussagekräftige Fehlermeldung.
EXPLICITLY_FORBIDDEN: frozenset[str] = frozenset({
    "customer_id", "customer_name", "client_id", "client_name",
    "patient_id", "patient_name", "patient_dob",
    "employee_id", "employee_name", "staff_name",
    "address", "street", "phone", "email",
    "insurance_number", "iban", "sv_number",
    "diagnosis", "medication", "notes",
})


class PrivacyViolation(Exception):
    """Ausgelöst, wenn eine CSV-Spalte nicht in ALLOWED_COLUMNS ist.

    Fail-closed: Statt eine unbekannte Spalte stillschweigend zu ignorieren,
    brechen wir ab. Das zwingt zur expliziten Diskussion bei jedem neuen
    Datenfeld.
    """

    def __init__(self, disallowed: Iterable[str], path: Path | None = None):
        self.disallowed = sorted(disallowed)
        self.path = path
        where = f" in {path}" if path else ""
        # Zeige die ersten 10 Treffer, mehr wäre Lärm
        preview = ", ".join(self.disallowed[:10])
        if len(self.disallowed) > 10:
            preview += f", ... (+{len(self.disallowed) - 10} weitere)"
        super().__init__(
            f"Disallowed Columns{where}: {preview}. "
            "Erlaubte Spalten: " + ", ".join(sorted(ALLOWED_COLUMNS)) + ". "
            "Neue Spalten brauchen explizite Freigabe (PR-Review)."
        )


def _read_header_only(path: Path) -> list[str]:
    """Nur die erste Zeile lesen, um Spalten zu prüfen — ohne Daten zu laden."""
    return pd.read_csv(path, nrows=0).columns.tolist()


def read_schichtplaner(path: Path) -> pd.DataFrame:
    """Liest eine Schichtplaner-CSV fail-closed.

    Prüft zuerst die Spalten-Header. Unbekannte Spalte → PrivacyViolation,
    Datei wird gar nicht vollständig geladen. Erst nach erfolgreicher Prüfung
    wird der eigentliche Read gemacht, und auch dann nur mit den allowed
    Spalten (usecols).
    """
    raw_cols = set(_read_header_only(path))
    disallowed = raw_cols - ALLOWED_COLUMNS
    if disallowed:
        raise PrivacyViolation(disallowed, path=path)
    # usecols ist idempotent — nur ALLOWED_COLUMNS die tatsächlich da sind.
    used = list(raw_cols & ALLOWED_COLUMNS)
    return pd.read_csv(path, usecols=used)


# ── Aggregation ───────────────────────────────────────────────────────────────

@dataclass
class AggregateSummary:
    """Aggregiertes Ergebnis einer Schichtplan-CSV — keine Individual-Daten."""

    total_shifts: int
    date_range_start: str | None
    date_range_end: str | None
    shifts_by_location: dict[str, int]
    shifts_by_role: dict[str, int]
    shifts_by_type: dict[str, int]
    kv_share: float  # Anteil Schichten mit lead_hours < 96
    notes: list[str]

    def to_dict(self) -> dict:
        return asdict(self)


def aggregate(df: pd.DataFrame) -> AggregateSummary:
    """Produziert AggregateSummary aus einem validierten DataFrame."""
    notes: list[str] = []
    total = len(df)

    # Zeitfenster
    date_start: str | None = None
    date_end: str | None = None
    if "shift_start" in df.columns and total > 0:
        ts = pd.to_datetime(df["shift_start"], errors="coerce").dropna()
        if len(ts) > 0:
            date_start = ts.min().strftime("%Y-%m-%d")
            date_end = ts.max().strftime("%Y-%m-%d")
        if len(ts) < total:
            notes.append(f"{total - len(ts)} Zeilen mit unparsbarem shift_start.")

    # Counter, nur wenn Spalte da ist — sonst leer lassen
    by_loc = dict(Counter(df["location_code"])) if "location_code" in df.columns else {}
    by_role = dict(Counter(df["role_code"])) if "role_code" in df.columns else {}
    by_type = dict(Counter(df["shift_type"])) if "shift_type" in df.columns else {}

    # KV-Anteil (§ 7 Abs. 6 HTV: < 96 h Vorlauf)
    kv_share = 0.0
    if "lead_hours" in df.columns and total > 0:
        kv_count = int((df["lead_hours"] < 96).sum())
        kv_share = round(kv_count / total, 4)
    elif total > 0:
        notes.append("Keine lead_hours-Spalte — KV-Anteil kann nicht berechnet werden.")

    return AggregateSummary(
        total_shifts=total,
        date_range_start=date_start,
        date_range_end=date_end,
        shifts_by_location=by_loc,
        shifts_by_role=by_role,
        shifts_by_type=by_type,
        kv_share=kv_share,
        notes=notes,
    )


def aggregate_to_json(input_csv: Path, output_json: Path) -> AggregateSummary:
    """End-to-end: CSV lesen (fail-closed), aggregieren, JSON schreiben."""
    df = read_schichtplaner(input_csv)
    summary = aggregate(df)
    output_json.parent.mkdir(parents=True, exist_ok=True)
    output_json.write_text(
        json.dumps(summary.to_dict(), indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    return summary


# ── CLI ───────────────────────────────────────────────────────────────────────

def _cli() -> None:
    p = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    p.add_argument("--input", required=True, type=Path, help="Schichtplaner-CSV")
    p.add_argument("--output", required=True, type=Path, help="Aggregate-JSON")
    args = p.parse_args()

    try:
        summary = aggregate_to_json(args.input, args.output)
    except PrivacyViolation as e:
        print(f"PRIVACY-STOP: {e}")
        raise SystemExit(2)

    print(f"OK — {summary.total_shifts} Schichten aggregiert nach {args.output}")


if __name__ == "__main__":
    _cli()
