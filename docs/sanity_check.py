"""Sanity check: run a handful of shift scenarios through htv_calc.

Run:  uv run python docs/sanity_check.py
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from htv_calc import (
    BEISPIEL_CSV,
    berechne_monats_netto,
    berechne_schicht,
    cap_monats_zulagen,
    parse_schicht_csv,
)


def fmt(r):
    print(f"  Dauer: {r['total_h']:.2f} h, bezahlt inkl. Fahrt: {r['bezahlt_total_h']:.2f} h")
    for pos in r["aufschluesselung"]:
        print(f"    {pos['stunden']:6.2f} h x {pos['satz']:6.2f} EUR  "
              f"[{pos['label']:22s}] = {pos['betrag']:7.2f} EUR")
    print(f"    Wechselschicht: {r['wechselschicht']:.2f} EUR, "
          f"Organisation: {r['organisation']:.2f} EUR")
    print(f"  => BRUTTO: {r['brutto']:.2f} EUR")
    print()


if __name__ == "__main__":
    print("--- Einzelschichten ---")
    print("Szenario 1: Mo 20:00 -> Di 08:00 (Nachtschicht), 1h Fahrtzeit, ohne KV")
    fmt(berechne_schicht("Mo", "20:00", "08:00", False, 1.0))

    print("Szenario 2: Sa 08:00 -> 20:00, ohne Fahrtzeit, ohne KV")
    fmt(berechne_schicht("Sa", "08:00", "20:00", False, 0.0))

    print("Szenario 3: So 14:00 -> 22:00, 1h Fahrtzeit, mit KV")
    fmt(berechne_schicht("So", "14:00", "22:00", True, 1.0))

    print("Szenario 4: Feiertag 06:00 -> 22:00 (ohne FZA), 1h Fahrtzeit, ohne KV")
    fmt(berechne_schicht("Feiertag", "06:00", "22:00", False, 1.0))

    print("--- CSV-Import ---")
    parsed, fehler = parse_schicht_csv(BEISPIEL_CSV)
    print(f"  {len(parsed)} Schichten geparst, {len(fehler)} Fehler")

    total_h = 0.0
    basis = 0.0
    for s in parsed:
        r = berechne_schicht(s["tag"], s["start"], s["ende"],
                             s["kurzfristig"], s["fahrtzeit"])
        if r:
            total_h += r["bezahlt_total_h"]
            basis += r["brutto_basis"]

    zulagen = cap_monats_zulagen(total_h)
    monats_brutto = basis + zulagen["wechselschicht"] + zulagen["organisation"]
    netto = berechne_monats_netto(monats_brutto)
    print(f"  Monats-Brutto: {monats_brutto:.2f} EUR ({total_h:.2f} h)")
    print(f"  Wechselschicht gecappt: {zulagen['wechselschicht_gecappt']}")
    print(f"  Monats-Netto:  ~{netto['netto']:.2f} EUR "
          f"(SV {netto['sv']:.2f}, LSt {netto['lst']:.2f})")
