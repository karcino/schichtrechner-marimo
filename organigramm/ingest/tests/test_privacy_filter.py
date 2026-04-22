"""Privacy-Filter-Tests für den Schichtplaner-Reader.

Das Kernversprechen: wenn eine CSV Spalten enthält, die NICHT in
ALLOWED_COLUMNS sind, bricht der Reader ab. Besonders für Kund*innen-
Daten muss das fail-closed-Verhalten gelten.

Pytest-Konvention: diese Tests sind PFLICHT und müssen grün sein,
bevor `organigramm/ingest/schichtplaner_aggregate.py` auf echte Daten
losgelassen wird.
"""
from __future__ import annotations

from pathlib import Path

import pytest

from organigramm.ingest.schichtplaner_aggregate import (
    ALLOWED_COLUMNS,
    EXPLICITLY_FORBIDDEN,
    PrivacyViolation,
    aggregate,
    read_schichtplaner,
)


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture
def valid_csv(tmp_path: Path) -> Path:
    """Ein Minimal-gültiges Schichtplaner-Export mit nur erlaubten Spalten."""
    p = tmp_path / "valid.csv"
    p.write_text(
        "shift_start,shift_end,shift_type,location_code,role_code,lead_hours\n"
        "2026-04-01T08:00:00,2026-04-01T14:00:00,Tag,BB-WEST,ASS,168\n"
        "2026-04-01T22:00:00,2026-04-02T06:00:00,Nacht,EINSATZ-HQ,ASS,72\n"
        "2026-04-02T13:00:00,2026-04-02T21:00:00,Tag,BB-NORD,PDL,24\n",
        encoding="utf-8",
    )
    return p


def make_csv(tmp_path: Path, headers: list[str], rows: list[list[str]]) -> Path:
    """Hilfs-Factory: CSV mit beliebigen Headern."""
    p = tmp_path / "test.csv"
    lines = [",".join(headers)]
    lines.extend(",".join(r) for r in rows)
    p.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return p


# ── Positive: erlaubte Schemas funktionieren ─────────────────────────────────

def test_valid_csv_loads_successfully(valid_csv: Path):
    """Happy Path: nur erlaubte Spalten → DataFrame kommt zurück."""
    df = read_schichtplaner(valid_csv)
    assert len(df) == 3
    assert set(df.columns).issubset(ALLOWED_COLUMNS)


def test_aggregate_produces_counts(valid_csv: Path):
    df = read_schichtplaner(valid_csv)
    summary = aggregate(df)
    assert summary.total_shifts == 3
    assert summary.shifts_by_location == {"BB-WEST": 1, "EINSATZ-HQ": 1, "BB-NORD": 1}
    assert summary.shifts_by_role == {"ASS": 2, "PDL": 1}
    assert summary.shifts_by_type == {"Tag": 2, "Nacht": 1}
    # lead_hours: 168, 72, 24 — zwei davon < 96 → KV-Anteil = 2/3 ≈ 0.6667
    assert summary.kv_share == pytest.approx(0.6667, abs=0.001)
    assert summary.date_range_start == "2026-04-01"
    assert summary.date_range_end == "2026-04-02"


def test_subset_of_allowed_columns_is_fine(tmp_path: Path):
    """Nicht alle Allowed-Spalten müssen da sein, nur keine extra."""
    csv = make_csv(tmp_path, ["shift_type", "location_code"], [["Tag", "BB-WEST"]])
    df = read_schichtplaner(csv)
    assert list(df.columns) == ["shift_type", "location_code"]


# ── Negative: fail-closed bei Kund*innen-Daten ───────────────────────────────

@pytest.mark.parametrize("forbidden", sorted(EXPLICITLY_FORBIDDEN))
def test_every_explicitly_forbidden_column_raises(tmp_path: Path, forbidden: str):
    """Jede einzelne explizit verbotene Spalte muss einen Block auslösen."""
    csv = make_csv(
        tmp_path,
        headers=["shift_start", forbidden],
        rows=[["2026-04-01T08:00:00", "testvalue"]],
    )
    with pytest.raises(PrivacyViolation) as exc_info:
        read_schichtplaner(csv)
    assert forbidden in str(exc_info.value), (
        f"Erwartete PrivacyViolation, die {forbidden} explizit nennt, "
        f"aber Message war: {exc_info.value}"
    )


def test_customer_name_column_raises_privacy_violation(tmp_path: Path):
    """Der klassische Kund*innen-Daten-Fall — muss knallen."""
    csv = make_csv(
        tmp_path,
        headers=["shift_start", "customer_name", "location_code"],
        rows=[["2026-04-01T08:00:00", "Mueller, Anna", "BB-WEST"]],
    )
    with pytest.raises(PrivacyViolation) as exc_info:
        read_schichtplaner(csv)
    assert "customer_name" in str(exc_info.value)


def test_unknown_column_raises_privacy_violation(tmp_path: Path):
    """Auch NICHT explizit verbotene, aber unbekannte Spalten müssen knallen —
    fail-closed heißt: default ist Block, nicht Pass."""
    csv = make_csv(
        tmp_path,
        headers=["shift_start", "some_new_weird_field"],
        rows=[["2026-04-01T08:00:00", "foo"]],
    )
    with pytest.raises(PrivacyViolation) as exc_info:
        read_schichtplaner(csv)
    assert "some_new_weird_field" in str(exc_info.value)


def test_multiple_disallowed_columns_all_listed(tmp_path: Path):
    """Mehrere verbotene Spalten — alle müssen in der Fehlermeldung auftauchen."""
    csv = make_csv(
        tmp_path,
        headers=["shift_start", "customer_name", "phone", "address"],
        rows=[["2026-04-01T08:00:00", "X", "030-123", "Y-Str. 1"]],
    )
    with pytest.raises(PrivacyViolation) as exc_info:
        read_schichtplaner(csv)
    msg = str(exc_info.value)
    for needle in ("customer_name", "phone", "address"):
        assert needle in msg, f"{needle} fehlt in der Fehlermeldung"


def test_privacy_violation_includes_path_info(tmp_path: Path):
    """Die Fehlermeldung soll den Dateipfad nennen — für Debugging."""
    csv = make_csv(tmp_path, ["customer_name"], [["X"]])
    with pytest.raises(PrivacyViolation) as exc_info:
        read_schichtplaner(csv)
    assert str(csv) in str(exc_info.value)


# ── Meta: Regeln-Konsistenz ──────────────────────────────────────────────────

def test_explicitly_forbidden_not_in_allowed():
    """Sanity-Check: die explizit verbotenen Felder sind NICHT in der Whitelist."""
    overlap = ALLOWED_COLUMNS & EXPLICITLY_FORBIDDEN
    assert overlap == set(), f"Widerspruch: {overlap} ist sowohl erlaubt als auch verboten."


def test_allowed_columns_are_all_lowercase_snakecase():
    """Konvention: Spaltennamen immer lowercase_with_underscores."""
    for col in ALLOWED_COLUMNS:
        assert col == col.lower(), f"{col} ist nicht lowercase"
        assert " " not in col, f"{col} enthält Leerzeichen"
