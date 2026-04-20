"""Shared HTV calculation logic — used by notebook.py (Einzel) and notebook_monat.py (Monat).

Basis: § 7 HTV (Ausgleich fuer Sonderformen der Arbeit) + Anlage C (EG 5 Stufe 3
= 19,90 EUR/h als Zuschlags-Bemessungsgrundlage).
"""

from __future__ import annotations

# ─── HTV-Parameter (Anlage C, gueltig ab Februar 2025) ───────────────────────
STUFE_2_MONAT = 3201.87   # EG 5 Stufe 2 (bis 3 Jahre)
STUFE_3_MONAT = 3330.99   # EG 5 Stufe 3 (bis 6 Jahre) — Zuschlagsbasis
AZ_WOCHE = 38.5           # § 5 Abs. 1 b aa HTV
AZ_MONAT = AZ_WOCHE * (4348 / 1000)

GRUNDLOHN = round(STUFE_2_MONAT / AZ_MONAT, 2)        # 19,13 EUR/h
ZUSCHLAGSBASIS = round(STUFE_3_MONAT / AZ_MONAT, 2)   # 19,90 EUR/h

ENTGELT = {
    "grundlohn": GRUNDLOHN,
    "gruppe": "EG 5 Stufe 2",
    "zuschlagsbasis": ZUSCHLAGSBASIS,
    "zuschlaege": {
        "kurzfristig_prozent": 0.25,
        "kurzfristig": round(GRUNDLOHN * 0.25, 4),
        "nacht": round(ZUSCHLAGSBASIS * 0.20, 2),
        "samstag": round(ZUSCHLAGSBASIS * 0.20, 2),
        "sonntag": round(ZUSCHLAGSBASIS * 0.25, 2),
        "feiertag_mit_fza": round(ZUSCHLAGSBASIS * 0.35, 2),
        "feiertag_ohne_fza": round(ZUSCHLAGSBASIS * 1.35, 2),
        "wechselschicht": 0.63,
        "wechselschicht_max_monat": 105.00,  # § 7 Abs. 5 HTV
        "organisation": 0.20,
    },
    "fahrtzeit_standard_h": 1.0,
}

# Sozialversicherung 2026 — Arbeitnehmer-Anteil
SV = {
    "kv": 0.0730,
    "kv_zusatz": 0.0145,
    "pv": 0.0180,
    "pv_kinderlos": 0.0060,
    "rv": 0.0930,
    "av": 0.0130,
}

# Lohnsteuer 2026 — BMF PAP 2026, Steuerklasse I
LST = {
    "grundfreibetrag_jahr": 12348,
    "arbeitnehmer_pauschbetrag": 1230,
    "soli_satz": 0.055,
}

NEXT_DAY = {"Mo": "Di", "Di": "Mi", "Mi": "Do", "Do": "Fr",
            "Fr": "Sa", "Sa": "So", "So": "Mo", "Feiertag": "Mo"}


# ─── Schicht-Berechnung ───────────────────────────────────────────────────────
def overlap_min(a_start: int, a_end: int, b_start: int, b_end: int) -> int:
    return max(0, min(a_end, b_end) - max(a_start, b_start))


def berechne_segment(seg_start: int, seg_end: int, tag: str, entgelt: dict = ENTGELT):
    seg_h = (seg_end - seg_start) / 60
    nacht_m = (
        overlap_min(seg_start, seg_end, 21 * 60, 1440)
        + overlap_min(seg_start, seg_end, 0, 6 * 60)
    )
    nacht_h = nacht_m / 60
    z = entgelt["zuschlaege"]

    if tag == "Feiertag":
        ft_tag = seg_h - nacht_h
        out = []
        if ft_tag > 0:
            out.append(("Feiertag", ft_tag, z["feiertag_ohne_fza"]))
        if nacht_h > 0:
            kombi = z["feiertag_ohne_fza"] + z["nacht"]
            out.append(("Feiertag + Nacht", nacht_h, kombi))
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

    # Werktag Mo–Fr
    reg_h = seg_h - nacht_h
    out = []
    if reg_h > 0:
        out.append(("Regulaer", reg_h, 0.0))
    if nacht_h > 0:
        out.append(("Nacht", nacht_h, z["nacht"]))
    return out


def berechne_schicht(tag: str, start: str, ende: str,
                     kurzfristig: bool, fahrtzeit_h: float,
                     entgelt: dict = ENTGELT):
    """Brutto einer einzelnen Schicht.

    Zuschlaege (inkl. Wechselschicht 0,63 EUR/h und Organisation 0,20 EUR/h)
    werden OHNE monatlichen Cap gerechnet — fuer Monats-Summen den Cap
    separat via `cap_monats_zulagen()` anwenden.
    """
    try:
        start_h, start_m = map(int, start.split(":"))
        ende_h, ende_m = map(int, ende.split(":"))
    except (ValueError, AttributeError):
        return None

    start_min = start_h * 60 + start_m
    ende_min = ende_h * 60 + ende_m

    hat_uebergang = ende_min <= start_min
    total_min = (1440 - start_min) + ende_min if hat_uebergang else ende_min - start_min
    total_h = total_min / 60
    if total_h <= 0 or total_h > 24:
        return None

    bezahlte_h = total_h  # Pausen sind laut § 5 Abs. 1 S. 2 voll verguetet

    kategorien = []
    if hat_uebergang:
        kategorien += berechne_segment(start_min, 1440, tag, entgelt)
        tag2 = NEXT_DAY.get(tag, "Mo")
        kategorien += berechne_segment(0, ende_min, tag2, entgelt)
    else:
        kategorien += berechne_segment(start_min, ende_min, tag, entgelt)

    merged: dict[str, list] = {}
    for label, h, zuschlag in kategorien:
        if label in merged:
            merged[label][0] += h
        else:
            merged[label] = [h, zuschlag]

    kv_zuschlag = entgelt["zuschlaege"]["kurzfristig"] if kurzfristig else 0.0
    grundlohn = entgelt["grundlohn"]

    aufschluesselung = []
    brutto_basis = 0.0
    for label, (h, zuschlag) in merged.items():
        satz = grundlohn + zuschlag + kv_zuschlag
        betrag = h * satz
        displayed = f"{label} (KV)" if kurzfristig else label
        aufschluesselung.append({"label": displayed, "stunden": h, "satz": satz, "betrag": betrag})
        brutto_basis += betrag

    if fahrtzeit_h > 0:
        fahrt_satz = grundlohn + (kv_zuschlag if kurzfristig else 0.0)
        betrag = fahrtzeit_h * fahrt_satz
        aufschluesselung.append({
            "label": "Fahrtzeit (KV, 125 %)" if kurzfristig else "Fahrtzeit",
            "stunden": fahrtzeit_h,
            "satz": fahrt_satz,
            "betrag": betrag,
        })
        brutto_basis += betrag

    bezahlt_total_h = bezahlte_h + fahrtzeit_h
    zus = entgelt["zuschlaege"]
    wechselschicht = bezahlt_total_h * zus["wechselschicht"]
    organisation = bezahlt_total_h * zus["organisation"]
    brutto = brutto_basis + wechselschicht + organisation

    uebergang_info = (
        f"{tag} {start} -> {NEXT_DAY.get(tag, '?')} {ende}" if hat_uebergang else None
    )

    return {
        "total_h": total_h,
        "bezahlte_h": bezahlte_h,
        "bezahlt_total_h": bezahlt_total_h,
        "aufschluesselung": aufschluesselung,
        "brutto_basis": brutto_basis,
        "wechselschicht": wechselschicht,
        "organisation": organisation,
        "brutto": brutto,
        "fahrtzeit_h": fahrtzeit_h,
        "uebergang_info": uebergang_info,
    }


def cap_monats_zulagen(total_bezahlt_h: float, entgelt: dict = ENTGELT) -> dict:
    """Monats-Wechselschicht-Zulage gecappt auf 105 EUR (§ 7 Abs. 5)."""
    z = entgelt["zuschlaege"]
    wechselschicht_ungecappt = total_bezahlt_h * z["wechselschicht"]
    wechselschicht = min(wechselschicht_ungecappt, z["wechselschicht_max_monat"])
    organisation = total_bezahlt_h * z["organisation"]
    return {
        "wechselschicht": wechselschicht,
        "wechselschicht_ungecappt": wechselschicht_ungecappt,
        "wechselschicht_gecappt": wechselschicht < wechselschicht_ungecappt,
        "organisation": organisation,
    }


# ─── Netto-Berechnung ────────────────────────────────────────────────────────
def _lst_jahr(zvE: float, grundfreibetrag: int) -> float:
    """Lohnsteuer/Jahr nach § 32a EStG (Werte 2026)."""
    if zvE <= grundfreibetrag:
        return 0.0
    if zvE <= 17799:
        y = (zvE - grundfreibetrag) / 10000
        return (268.48 * y + 1400) * y
    if zvE <= 69878:
        z = (zvE - 17799) / 10000
        return (114.72 * z + 2397) * z + 1027
    if zvE <= 277825:
        return 0.42 * zvE - 10602
    return 0.45 * zvE - 18941


def _sv_satz(sv: dict) -> float:
    return sv["kv"] + sv["kv_zusatz"] + sv["pv"] + sv["pv_kinderlos"] + sv["rv"] + sv["av"]


def berechne_schicht_netto(schicht_brutto: float, monats_brutto_schaetzung: float,
                           sv: dict = SV, lst: dict = LST) -> dict:
    """Netto-Anteil einer Einzelschicht (pro-rata auf Monats-Schaetzung)."""
    satz = _sv_satz(sv)
    sv_betrag = schicht_brutto * satz

    anb_pausch_monat = lst["arbeitnehmer_pauschbetrag"] / 12
    vorsorge_monat = monats_brutto_schaetzung * satz
    zvE_monat = max(0.0, monats_brutto_schaetzung - anb_pausch_monat - vorsorge_monat)
    lst_monat = _lst_jahr(zvE_monat * 12, lst["grundfreibetrag_jahr"]) / 12

    anteil = schicht_brutto / monats_brutto_schaetzung if monats_brutto_schaetzung > 0 else 0
    lst_schicht = lst_monat * anteil
    soli = lst_schicht * lst["soli_satz"]
    netto = schicht_brutto - sv_betrag - lst_schicht - soli
    return {
        "sv": round(sv_betrag, 2),
        "sv_satz_prozent": round(satz * 100, 2),
        "lst": round(lst_schicht, 2),
        "soli": round(soli, 2),
        "netto": round(netto, 2),
    }


# ─── Import von Schichtplaener-Daten ─────────────────────────────────────────
import csv
import io
from datetime import datetime

# Python-Weekday (Mo=0) -> HTV-Tag-Kuerzel
_WEEKDAY_MAP = {0: "Mo", 1: "Di", 2: "Mi", 3: "Do", 4: "Fr", 5: "Sa", 6: "So"}


def _parse_date(s: str):
    """Datum aus gaengigen Formaten parsen — YYYY-MM-DD, DD.MM.YYYY, DD/MM/YYYY."""
    s = s.strip()
    for fmt in ("%Y-%m-%d", "%d.%m.%Y", "%d/%m/%Y", "%Y/%m/%d", "%d.%m.%y"):
        try:
            return datetime.strptime(s, fmt).date()
        except ValueError:
            continue
    return None


def _parse_bool(s) -> bool:
    if isinstance(s, bool):
        return s
    if s is None:
        return False
    return str(s).strip().lower() in ("true", "1", "ja", "yes", "x", "y", "kv")


def _parse_float(s, default: float = 0.0) -> float:
    if s is None or s == "":
        return default
    try:
        return float(str(s).replace(",", "."))
    except ValueError:
        return default


def _parse_hhmm(s: str):
    """HH:MM / HHMM / HH normalisieren auf HH:MM."""
    s = str(s).strip()
    if ":" in s:
        h, m = s.split(":")
        return f"{int(h):02d}:{int(m):02d}"
    if len(s) == 4 and s.isdigit():
        return f"{s[:2]}:{s[2:]}"
    if len(s) <= 2 and s.isdigit():
        return f"{int(s):02d}:00"
    return s  # invalid, caller handles


def _parse_zeit_range(s: str):
    """'HH:MM-HH:MM' / 'HH:MM – HH:MM' in (beginn, ende) splitten."""
    if s is None:
        return None, None
    # Gaengige Bindestrich-Varianten normalisieren
    for dash in ("–", "—", "−", "‐", "-"):
        if dash in s:
            parts = s.split(dash, 1)
            if len(parts) == 2:
                return parts[0].strip(), parts[1].strip()
    return None, None


def _parse_typ_to_kv(typ) -> bool:
    """`Typ`-Spalte -> KV-Flag. Nur explizites 'kurzfristig'/'kv' setzt KV."""
    if typ is None:
        return False
    t = str(typ).strip().lower()
    return "kurzfristig" in t or t in ("kv", "kurz")


def parse_schicht_csv(text: str) -> tuple[list[dict], list[str]]:
    """Parst einen Schichtplaner-CSV in eine Liste von Schicht-Dicts.

    Erwartete Spalten (Header-Namen case-insensitive, Reihenfolge egal):

    **Zeit** — entweder getrennt oder kombiniert:
      - `beginn` und `ende` (HH:MM)  — oder
      - `zeit` / `time`              — Format `HH:MM-HH:MM` (mit -, –, — als Trenner)

    **Tag** — entweder:
      - `datum` / `date`             — YYYY-MM-DD, DD.MM.YYYY, ... (Wochentag abgeleitet) — oder
      - `tag` / `wt` / `wochentag`   — Mo, Di, ..., Feiertag

    **KV** (optional) — entweder:
      - `kurzfristig` / `kv`         — true/false, ja/nein, 1/0 — oder
      - `typ` / `type` / `art`       — "kurzfristig" setzt KV, alles andere nicht

    **Fahrtzeit** (optional):
      - `fahrtzeit` / `fahrt`        — Stunden (Default 0)

    Trennzeichen wird automatisch erkannt (`,` oder `;`).

    Rueckgabe: (schichten, fehler) — fehler ist eine Liste von Fehler-Meldungen.
    """
    sample = text[:2048]
    delim = ";" if sample.count(";") > sample.count(",") else ","

    try:
        reader = csv.DictReader(io.StringIO(text), delimiter=delim)
    except Exception as exc:
        return [], [f"CSV nicht lesbar: {exc}"]

    if not reader.fieldnames:
        return [], ["Kein Header gefunden — erste Zeile muss Spaltennamen enthalten."]

    norm = {h: h.strip().lower() for h in reader.fieldnames}

    def col(row, *names):
        for h, n in norm.items():
            if n in names:
                v = row.get(h)
                if v is not None and str(v).strip() != "":
                    return v
        return None

    schichten = []
    fehler = []
    for i, row in enumerate(reader, start=2):
        datum_raw = col(row, "datum", "date")
        tag_raw = col(row, "tag", "wt", "wochentag", "day")
        beginn = col(row, "beginn", "start", "von", "from")
        ende = col(row, "ende", "end", "bis", "to")
        zeit_raw = col(row, "zeit", "time", "uhrzeit")
        typ_raw = col(row, "typ", "type", "art")

        # Falls beginn/ende fehlen, aus `zeit` ableiten
        if (not beginn or not ende) and zeit_raw:
            beginn, ende = _parse_zeit_range(str(zeit_raw))

        if not beginn or not ende:
            fehler.append(f"Zeile {i}: Zeit fehlt — entweder `beginn`+`ende` oder `zeit` (HH:MM-HH:MM).")
            continue

        tag = None
        if datum_raw:
            d = _parse_date(str(datum_raw))
            if d is None:
                fehler.append(f"Zeile {i}: Datum '{datum_raw}' nicht erkannt.")
                continue
            tag = _WEEKDAY_MAP[d.weekday()]
        elif tag_raw:
            t = str(tag_raw).strip().capitalize()
            if t not in NEXT_DAY:
                fehler.append(f"Zeile {i}: Tag '{tag_raw}' nicht erkannt (Mo/Di/.../Feiertag).")
                continue
            tag = t
        else:
            fehler.append(f"Zeile {i}: Entweder `datum` oder `tag` muss gesetzt sein.")
            continue

        # KV: explizite Spalte hat Vorrang, sonst aus `typ`
        kv_raw = col(row, "kurzfristig", "kv")
        if kv_raw is not None:
            kurzfristig = _parse_bool(kv_raw)
        else:
            kurzfristig = _parse_typ_to_kv(typ_raw)

        schichten.append({
            "tag": tag,
            "start": _parse_hhmm(str(beginn)),
            "ende": _parse_hhmm(str(ende)),
            "kurzfristig": kurzfristig,
            "fahrtzeit": _parse_float(col(row, "fahrtzeit", "fahrt", "travel"), default=0.0),
        })

    return schichten, fehler


BEISPIEL_CSV = """datum,beginn,ende,kurzfristig,fahrtzeit
2026-04-01,20:00,08:00,false,1.0
2026-04-03,20:00,08:00,false,1.0
2026-04-06,06:00,14:00,true,0.5
2026-04-11,13:00,21:00,false,1.0
2026-04-12,08:00,20:00,false,1.5
"""


def berechne_monats_netto(monats_brutto: float, sv: dict = SV, lst: dict = LST) -> dict:
    """Netto aus Monats-Brutto — direkt, nicht pro-rata."""
    satz = _sv_satz(sv)
    sv_betrag = monats_brutto * satz

    anb_pausch_monat = lst["arbeitnehmer_pauschbetrag"] / 12
    vorsorge_monat = monats_brutto * satz
    zvE_monat = max(0.0, monats_brutto - anb_pausch_monat - vorsorge_monat)
    lst_monat = _lst_jahr(zvE_monat * 12, lst["grundfreibetrag_jahr"]) / 12
    soli = lst_monat * lst["soli_satz"]
    netto = monats_brutto - sv_betrag - lst_monat - soli
    return {
        "sv": round(sv_betrag, 2),
        "sv_satz_prozent": round(satz * 100, 2),
        "lst": round(lst_monat, 2),
        "soli": round(soli, 2),
        "netto": round(netto, 2),
    }
