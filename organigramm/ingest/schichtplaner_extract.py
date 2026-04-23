"""
Schichtplaner → Paul's shifts by ASN (private).

Liest die selbst-erstellte HTML-Datei schichtplaner_allinone.html (mit
eingebettetem JS-Object DATA) und aggregiert pro ASN-Kürzel die Anzahl
Schichten, Gesamtstunden und den Zeitraum.

Keine Kundendaten werden gespeichert — nur das anonyme ASN-Kürzel (z.B.
"RaHi", "MoJa"), das Paul selbst vergeben hat. Echte Namen kommen hier nicht
vor.

Output: organigramm/raw/paul-shifts-by-asn-private.json

Usage:
    uv run python -m organigramm.ingest.schichtplaner_extract \\
        --input ~/Desktop/ADBerlin/schichtplaner_allinone.html \\
        --out organigramm/raw/paul-shifts-by-asn-private.json
"""
from __future__ import annotations

import argparse
import json
import re
from dataclasses import asdict, dataclass, field
from pathlib import Path


@dataclass
class ASNShiftStats:
    kuerzel: str
    shifts: int = 0
    hours: float = 0.0
    first_date: str | None = None
    last_date: str | None = None
    dates: list[str] = field(default_factory=list)


# Schicht-Block: Minimum zeit + klient + stunden, in beliebiger Reihenfolge mit
# optionalem Whitespace / Kommentar / Komma dazwischen — aber nicht über eine
# Objekt-Grenze hinweg ({ oder }).
#
# Das erwischt sowohl single-line-Einträge (`6: { zeit: '...', klient: 'X', stunden: 3 }`)
# als auch multi-line + Array-Varianten (`15: [{ zeit:..., klient:..., stunden:.. }, {..}]`)
# und kommentierte Blöcke (`// Einarbeitung ...\nzeit: ..., klient: ..., stunden: ...`).
SHIFT_RE = re.compile(
    r"""
    zeit\s*:\s*'[^']*'              # zeit als Ankerpunkt
    [^{}]*?                         # beliebiges in gleicher Objekt-Ebene
    klient\s*:\s*'(?P<klient>[^']+)'
    [^{}]*?
    stunden\s*:\s*(?P<stunden>[\d.]+)
    """,
    re.VERBOSE | re.DOTALL,
)

# Month-Block: `'2026-01': { ... }` — wir tracken die Month-Keys, um Datum zu
# bilden (month-key + day → ISO).
MONTH_KEY_RE = re.compile(r"'(?P<ym>\d{4}-\d{2})'\s*:\s*\{")


def normalize_klient(klient: str) -> str | None:
    """
    'RaHi (Jüd. Krankenhaus)' → 'RaHi'
    'MaPu + MoJa' → None (doppelter Eintrag, in separaten Records zählen wir nicht)
    'Kreuzberg' → None (Ortsname, kein ASN-Kürzel)
    'Seminar Pflicht' → None
    'BQ + RaHe (Görlitzer)' → None (doppelt)
    'RaHe' → 'RaHe'
    '?' → None (unbekannt)
    """
    k = klient.strip()
    if "+" in k:
        return None
    if k in {"?", ""}:
        return None
    # Vor Klammer trennen: "RaHi (Jüd. Krankenhaus)" → "RaHi"
    if "(" in k:
        k = k.split("(", 1)[0].strip()
    # CamelCase-Check: Muss dem Muster [A-Z][a-z]+[A-Z][a-z]+ entsprechen,
    # sonst ist's wohl ein Ortsname o.ä.
    if not re.fullmatch(r"[A-Z][a-z]{1,3}[A-Z][a-z]{1,3}", k):
        return None
    return k


def parse_schichtplaner(html: str) -> dict[str, ASNShiftStats]:
    # Ausschnitt einschränken: nach 'monate:' bis Ende-of-Block oder bis
    # zum nächsten DATA-Top-Level-Key. Praktikabel: monate ist der größte
    # Block; wir greifen die Substring nach 'monate:'.
    monate_start = html.find("monate:")
    if monate_start < 0:
        raise RuntimeError("Kein monate-Block gefunden")
    region = html[monate_start:]

    # Finde alle Month-Key-Positionen (z.B. '2026-01':)
    month_positions: list[tuple[int, str]] = []
    for m in MONTH_KEY_RE.finditer(region):
        month_positions.append((m.start(), m.group("ym")))

    if not month_positions:
        raise RuntimeError("Keine Month-Keys gefunden")

    # Pro Month-Block (Start-Pos bis Start-Pos des nächsten) alle Shifts
    # extrahieren.
    result: dict[str, ASNShiftStats] = {}
    for i, (start, ym) in enumerate(month_positions):
        end = month_positions[i + 1][0] if i + 1 < len(month_positions) else len(region)
        block = region[start:end]

        # Innerhalb des Monats: nur der schichten-Sub-Block zählt (sonst
        # könnten blockierungen o.ä. False-Positives liefern).
        schichten_match = re.search(r"schichten\s*:\s*\{", block)
        if not schichten_match:
            continue
        schichten_block = block[schichten_match.end() :]
        # Bis zur matching closing-brace — naive: bis "},\n\n" oder bis
        # zum nächsten top-level-key "blockierungen" ... für MVP reicht's,
        # bis zum ersten `},\n      blockierungen` oder bis end-of-month.
        # Einfacher: einfach den ganzen Rest des month-blocks nehmen, die
        # SHIFT_RE ist streng genug.

        # Day-Marker: innerhalb von schichten `NUM:` markiert den Tag. Für
        # jeden Shift-Match schauen wir den nächst-vorgelagerten Day-Marker.
        day_positions: list[tuple[int, int]] = [
            (m.start(), int(m.group(1)))
            for m in re.finditer(r"\n\s*(\d{1,2})\s*:\s*[\{\[]", schichten_block)
        ]

        def day_at(pos: int) -> int | None:
            day = None
            for p, d in day_positions:
                if p <= pos:
                    day = d
                else:
                    break
            return day

        for sm in SHIFT_RE.finditer(schichten_block):
            raw_klient = sm.group("klient")
            stunden = float(sm.group("stunden"))

            kuerzel = normalize_klient(raw_klient)
            if not kuerzel:
                continue

            day = day_at(sm.start()) or 1
            iso_date = f"{ym}-{day:02d}"
            rec = result.setdefault(kuerzel, ASNShiftStats(kuerzel=kuerzel))
            rec.shifts += 1
            rec.hours += stunden
            rec.dates.append(iso_date)
            if rec.first_date is None or iso_date < rec.first_date:
                rec.first_date = iso_date
            if rec.last_date is None or iso_date > rec.last_date:
                rec.last_date = iso_date

    # Stunden auf 1 Nachkommastelle runden
    for rec in result.values():
        rec.hours = round(rec.hours, 1)
        rec.dates.sort()

    return result


def _cli() -> None:
    p = argparse.ArgumentParser(description="Schichtplaner-HTML → ASN-Shift-Stats")
    p.add_argument("--input", required=True, type=Path, help="Pfad zur schichtplaner_allinone.html")
    p.add_argument("--out", required=True, type=Path, help="Output-JSON (privat)")
    args = p.parse_args()

    html = args.input.read_text(encoding="utf-8")
    stats = parse_schichtplaner(html)

    out_payload = {
        "generated_from": str(args.input),
        "asn_shift_stats": [asdict(s) for s in sorted(stats.values(), key=lambda x: -x.hours)],
        "total_asns_with_shifts": len(stats),
        "total_shifts": sum(s.shifts for s in stats.values()),
        "total_hours": round(sum(s.hours for s in stats.values()), 1),
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(out_payload, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"OK — {len(stats)} ASN-Kürzel mit Schichten, {out_payload['total_shifts']} Schichten, {out_payload['total_hours']}h gesamt")
    for s in sorted(stats.values(), key=lambda x: -x.hours):
        print(f"  {s.kuerzel:6s} {s.shifts:3d}×  {s.hours:5.1f}h  {s.first_date} → {s.last_date}")


if __name__ == "__main__":
    _cli()
