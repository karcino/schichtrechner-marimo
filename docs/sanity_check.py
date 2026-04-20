"""Sanity check: extracts the pure calc functions from notebook.py and runs example shifts.

Run:  uv run python docs/sanity_check.py
"""

from __future__ import annotations

# Duplicate the pure calc functions here (same logic as notebook.py cells).
STUFE_2_MONAT = 3201.87
STUFE_3_MONAT = 3330.99
AZ_MONAT = 38.5 * (4348 / 1000)
GRUNDLOHN = round(STUFE_2_MONAT / AZ_MONAT, 2)          # 19.13
ZUSCHLAGSBASIS = round(STUFE_3_MONAT / AZ_MONAT, 2)     # 19.90

entgelt = {
    "grundlohn": GRUNDLOHN,
    "zuschlaege": {
        "kurzfristig": round(GRUNDLOHN * 0.25, 4),
        "nacht": round(ZUSCHLAGSBASIS * 0.20, 2),
        "samstag": round(ZUSCHLAGSBASIS * 0.20, 2),
        "sonntag": round(ZUSCHLAGSBASIS * 0.25, 2),
        "feiertag_ohne_fza": round(ZUSCHLAGSBASIS * 1.35, 2),
        "feiertag_mit_fza": round(ZUSCHLAGSBASIS * 0.35, 2),
        "wechselschicht": 0.63,
        "organisation": 0.20,
    },
}

NEXT_DAY = {"Mo": "Di", "Di": "Mi", "Mi": "Do", "Do": "Fr",
            "Fr": "Sa", "Sa": "So", "So": "Mo", "Feiertag": "Mo"}


def overlap_min(a, b, c, d):
    return max(0, min(b, d) - max(a, c))


def berechne_segment(seg_start, seg_end, tag, entgelt):
    seg_h = (seg_end - seg_start) / 60
    nacht_m = overlap_min(seg_start, seg_end, 21 * 60, 1440) + overlap_min(seg_start, seg_end, 0, 6 * 60)
    nacht_h = nacht_m / 60
    z = entgelt["zuschlaege"]
    if tag == "Feiertag":
        ft_tag = seg_h - nacht_h
        out = []
        if ft_tag > 0:
            out.append(("Feiertag", ft_tag, z["feiertag_ohne_fza"]))
        if nacht_h > 0:
            out.append(("Feiertag + Nacht", nacht_h, z["feiertag_ohne_fza"] + z["nacht"]))
        return out
    if tag == "So":
        so_tag = seg_h - nacht_h
        out = []
        if so_tag > 0:
            out.append(("Sonntag", so_tag, z["sonntag"]))
        if nacht_h > 0:
            out.append(("Sonntag + Nacht", nacht_h, z["sonntag"] + z["nacht"]))
        return out
    if tag == "Sa":
        sa_fenster_h = overlap_min(seg_start, seg_end, 13 * 60, 21 * 60) / 60
        reg_h = max(0, seg_h - sa_fenster_h - nacht_h)
        out = []
        if reg_h > 0:
            out.append(("Regulaer", reg_h, 0.0))
        if sa_fenster_h > 0:
            out.append(("Samstag 13-21 h", sa_fenster_h, z["samstag"]))
        if nacht_h > 0:
            out.append(("Nacht (Sa)", nacht_h, z["nacht"]))
        return out
    reg_h = seg_h - nacht_h
    out = []
    if reg_h > 0:
        out.append(("Regulaer", reg_h, 0.0))
    if nacht_h > 0:
        out.append(("Nacht", nacht_h, z["nacht"]))
    return out


def berechne_schicht(tag, start, ende, kurzfristig, fahrtzeit_h, entgelt):
    start_h, start_m = map(int, start.split(":"))
    ende_h, ende_m = map(int, ende.split(":"))
    start_min = start_h * 60 + start_m
    ende_min = ende_h * 60 + ende_m
    hat_uebergang = ende_min <= start_min
    total_min = (1440 - start_min) + ende_min if hat_uebergang else ende_min - start_min
    total_h = total_min / 60
    if total_h <= 0 or total_h > 24:
        return None
    bezahlte_h = total_h

    kategorien = []
    if hat_uebergang:
        kategorien += berechne_segment(start_min, 1440, tag, entgelt)
        tag2 = NEXT_DAY.get(tag, "Mo")
        kategorien += berechne_segment(0, ende_min, tag2, entgelt)
    else:
        kategorien += berechne_segment(start_min, ende_min, tag, entgelt)

    merged = {}
    for lbl, h, z in kategorien:
        if lbl in merged:
            merged[lbl][0] += h
        else:
            merged[lbl] = [h, z]

    kv = entgelt["zuschlaege"]["kurzfristig"] if kurzfristig else 0.0
    g = entgelt["grundlohn"]
    brutto = 0.0
    lines = []
    for lbl, (h, zuschlag) in merged.items():
        satz = g + zuschlag + kv
        betrag = h * satz
        brutto += betrag
        lines.append((lbl, h, satz, betrag))

    if fahrtzeit_h > 0:
        fahrt_satz = g + (kv if kurzfristig else 0.0)
        betrag = fahrtzeit_h * fahrt_satz
        brutto += betrag
        lines.append(("Fahrtzeit", fahrtzeit_h, fahrt_satz, betrag))

    bezahlt_total_h = bezahlte_h + fahrtzeit_h
    wechselschicht = bezahlt_total_h * entgelt["zuschlaege"]["wechselschicht"]
    organisation = bezahlt_total_h * entgelt["zuschlaege"]["organisation"]
    return {
        "total_h": total_h,
        "bezahlt_total_h": bezahlt_total_h,
        "lines": lines,
        "brutto_ohne_zulagen": brutto,
        "wechselschicht": wechselschicht,
        "organisation": organisation,
        "brutto": brutto + wechselschicht + organisation,
    }


def fmt(r):
    print(f"  Dauer: {r['total_h']:.2f} h, bezahlt inkl. Fahrt: {r['bezahlt_total_h']:.2f} h")
    for lbl, h, satz, betrag in r["lines"]:
        print(f"    {h:6.2f} h x {satz:6.2f} EUR  [{lbl:22s}] = {betrag:7.2f} EUR")
    print(f"    Wechselschicht: {r['wechselschicht']:.2f} EUR, Organisation: {r['organisation']:.2f} EUR")
    print(f"  => BRUTTO: {r['brutto']:.2f} EUR")
    print()


if __name__ == "__main__":
    print("Szenario 1: Mo 20:00 -> Di 08:00 (Nachtschicht), 1h Fahrtzeit, ohne KV")
    fmt(berechne_schicht("Mo", "20:00", "08:00", False, 1.0, entgelt))

    print("Szenario 2: Sa 08:00 -> 20:00, ohne Fahrtzeit, ohne KV")
    fmt(berechne_schicht("Sa", "08:00", "20:00", False, 0.0, entgelt))

    print("Szenario 3: So 14:00 -> 22:00, 1h Fahrtzeit, mit KV")
    fmt(berechne_schicht("So", "14:00", "22:00", True, 1.0, entgelt))

    print("Szenario 4: Feiertag 06:00 -> 22:00 (ohne FZA), 1h Fahrtzeit, ohne KV")
    fmt(berechne_schicht("Feiertag", "06:00", "22:00", False, 1.0, entgelt))
