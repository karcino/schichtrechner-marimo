"""HTV-Schichtrechner — marimo notebook.

Reaktiver Lohn-Rechner fuer eine einzelne Schicht nach HTV persoenliche Assistenz.
Basis: § 7 HTV (Ausgleich fuer Sonderformen der Arbeit) + Anlage C (EG 5 Stufe 3
= 19,90 EUR/h als Zuschlags-Bemessungsgrundlage).

Export zu WebAssembly:  uv run marimo export html-wasm notebook.py -o public --mode run
"""

import marimo

__generated_with = "0.16.0"
app = marimo.App(width="medium", app_title="Schichtrechner HTV")


@app.cell(hide_code=True)
def _():
    import marimo as mo

    return (mo,)


# ─────────────────────────────────────────────────────────────────────────────
# Einleitung
# ─────────────────────────────────────────────────────────────────────────────
@app.cell(hide_code=True)
def _(mo):
    mo.md(
        r"""
        # HTV-Schichtrechner

        Lohn-Rechner fuer eine einzelne Schicht nach **Haustarifvertrag persoenliche Assistenz**
        (Stand: 2. AenderungsTV gueltig ab 1. Oktober 2023) und **Anlage C**
        (Entgelttabelle gueltig ab Februar 2025).

        Konfiguriert fuer **Entgeltgruppe 5, Erfahrungsstufe 2** (Assistent\*in).

        > Das Notebook ist **reaktiv**: Sobald du unten einen Wert aenderst, wird das
        > Ergebnis automatisch neu berechnet — kein "Berechnen"-Button noetig.
        > Jede Zahl ist unten mit Paragraph aus dem HTV belegt.
        """
    )
    return


# ─────────────────────────────────────────────────────────────────────────────
# Parameter: Entgelt & Sozialabgaben
# ─────────────────────────────────────────────────────────────────────────────
@app.cell
def _():
    # HTV-Parameter — alle Zahlen sind belegt (siehe Dokumentations-Abschnitt unten).
    #
    # Grundlohn = Tabellenentgelt EG 5 Stufe 2, Anlage C gueltig ab Februar 2025.
    # Zuschlag-Bemessungsgrundlage = Stufe 3 derselben Entgeltgruppe (§ 7 Abs. 1 Satz 2 HTV),
    # unabhaengig vom persoenlichen Tabellenentgelt.

    STUFE_2_MONAT = 3201.87  # Anlage C, EG 5 Stufe 2 (bis 3 Jahre)
    STUFE_3_MONAT = 3330.99  # Anlage C, EG 5 Stufe 3 (bis 6 Jahre)
    AZ_WOCHE = 38.5  # § 5 Abs. 1 b aa HTV: Assistent*innen
    AZ_MONAT = AZ_WOCHE * (4348 / 1000)  # Faktor 4,348 (Anlage C Kopfzeile)
    GRUNDLOHN = round(STUFE_2_MONAT / AZ_MONAT, 2)  # = 19,13 EUR/h
    ZUSCHLAGSBASIS = round(STUFE_3_MONAT / AZ_MONAT, 2)  # = 19,90 EUR/h — § 7 Abs. 1

    entgelt = {
        "grundlohn": GRUNDLOHN,
        "gruppe": "EG 5 Stufe 2",
        "zuschlagsbasis": ZUSCHLAGSBASIS,
        "zuschlaege": {
            # § 7 Abs. 1 HTV — alle Prozentsaetze auf Stufe-3-Basis:
            "kurzfristig_prozent": 0.25,  # KV-Zuschlag: 25 % × Grundlohn (Lohnart 475)
            "nacht": round(ZUSCHLAGSBASIS * 0.20, 2),     # Abs. 1 b: 20 %
            "samstag": round(ZUSCHLAGSBASIS * 0.20, 2),   # Abs. 1 f: 20 % (nur 13–21 h)
            "sonntag": round(ZUSCHLAGSBASIS * 0.25, 2),   # Abs. 1 c: 25 %
            "feiertag_mit_fza": round(ZUSCHLAGSBASIS * 0.35, 2),   # Abs. 1 d: 35 %
            "feiertag_ohne_fza": round(ZUSCHLAGSBASIS * 1.35, 2),  # Abs. 1 d: 135 %
            # Monatliche Zulagen:
            "wechselschicht": 0.63,   # § 7 Abs. 5 HTV — max 105 EUR/Monat bei staendiger Wechselschicht
            "organisation": 0.20,     # § 7 Abs. 7 HTV — Assistent*innen Organisationszulage
        },
        "fahrtzeit_standard_h": 1.0,  # Pauschale je Einsatz, verguetet mit Grundlohn (bzw. KV-Satz bei Kurzfristig)
    }
    # Abgeleitet: KV-Zuschlag in EUR (25 % × Grundlohn)
    entgelt["zuschlaege"]["kurzfristig"] = round(
        GRUNDLOHN * entgelt["zuschlaege"]["kurzfristig_prozent"], 4
    )

    # Sozialversicherung 2026 — Arbeitnehmer-Anteil
    # Quellen: AOK, Bundesregierung, Deutsche Rentenversicherung.
    sv = {
        "kv": 0.0730,              # Krankenversicherung allgemein 7,30 %
        "kv_zusatz": 0.0145,       # Zusatzbeitrag (Bundesdurchschnitt 2,9 %, AN-Anteil 50 %)
        "pv": 0.0180,              # Pflegeversicherung 1,80 %
        "pv_kinderlos": 0.0060,    # Kinderlosenzuschlag ab 23 Jahre +0,60 %
        "rv": 0.0930,              # Rentenversicherung 9,30 %
        "av": 0.0130,              # Arbeitslosenversicherung 1,30 %
    }
    # Lohnsteuer 2026 — BMF Programmablaufplan (PAP 2026), Steuerklasse I
    lst = {
        "grundfreibetrag_jahr": 12348,       # § 32a EStG (Jahr 2026)
        "arbeitnehmer_pauschbetrag": 1230,   # § 9a EStG
        "soli_satz": 0.055,                  # 5,5 % auf LSt
    }
    return entgelt, sv, lst


# ─────────────────────────────────────────────────────────────────────────────
# Berechnungs-Logik (1:1 Port aus rechnerCalculations.js)
# ─────────────────────────────────────────────────────────────────────────────
@app.cell
def _():
    def overlap_min(a_start: int, a_end: int, b_start: int, b_end: int) -> int:
        """Ueberlappung zweier Zeitintervalle in Minuten."""
        return max(0, min(a_end, b_end) - max(a_start, b_start))

    NEXT_DAY = {"Mo": "Di", "Di": "Mi", "Mi": "Do", "Do": "Fr",
                "Fr": "Sa", "Sa": "So", "So": "Mo", "Feiertag": "Mo"}

    def berechne_segment(seg_start: int, seg_end: int, tag: str, entgelt: dict):
        """Zerlegt ein Zeitintervall in Kategorien mit Zuschlag-Satz (EUR/h, nur Zuschlag-Anteil)."""
        seg_h = (seg_end - seg_start) / 60
        nacht_m = (
            overlap_min(seg_start, seg_end, 21 * 60, 1440)  # 21-24 h
            + overlap_min(seg_start, seg_end, 0, 6 * 60)    # 0-6 h  (§ 6 Abs. 5 HTV)
        )
        nacht_h = nacht_m / 60
        z = entgelt["zuschlaege"]

        if tag == "Feiertag":
            # § 7 Abs. 1 d: Feiertag ohne Freizeitausgleich 135 %, stapelt mit Nacht (b)
            ft_tag = seg_h - nacht_h
            out = []
            if ft_tag > 0:
                out.append(("Feiertag", ft_tag, z["feiertag_ohne_fza"]))
            if nacht_h > 0:
                # Stapel: Feiertag 135 % + Nacht 20 % (Satz 3: nur bei b) + andere; b ist Nacht selbst)
                # Genauer: § 7 Abs. 1 S. 3 — "hoechster Zeitzuschlag" gilt nur fuer c)–f) untereinander;
                # b) Nacht stapelt on top. Cap: 235 % bei Feiertag+Nacht.
                kombi = min(z["feiertag_ohne_fza"] + z["nacht"], 1.35 * 19.90 + 0.20 * 19.90)
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
            # Sa-Zuschlag NUR zwischen 13 und 21 Uhr (§ 7 Abs. 1 f)
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
                         kurzfristig: bool, fahrtzeit_h: float, entgelt: dict):
        """Berechnet Brutto fuer eine Schicht. Handhabt Tagesuebergang (z.B. Mo 22:00 -> Di 06:00)."""
        start_h, start_m = map(int, start.split(":"))
        ende_h, ende_m = map(int, ende.split(":"))
        start_min = start_h * 60 + start_m
        ende_min = ende_h * 60 + ende_m

        hat_uebergang = ende_min <= start_min
        total_min = (1440 - start_min) + ende_min if hat_uebergang else ende_min - start_min
        total_h = total_min / 60
        if total_h <= 0 or total_h > 24:
            return None

        # Pause: laut § 5 Abs. 1 S. 2 werden "gesetzlich vorgeschriebene Pausen"
        # bei Wechselschichtarbeit in die Arbeitszeit eingerechnet (= voll verguetet).
        # Also kein Pausenabzug.
        bezahlte_h = total_h

        # Segmente sammeln
        kategorien = []
        if hat_uebergang:
            kategorien += berechne_segment(start_min, 1440, tag, entgelt)
            tag2 = NEXT_DAY.get(tag, "Mo")
            if tag2 == "regulaer":
                tag2 = "Mo"
            kategorien += berechne_segment(0, ende_min, tag2, entgelt)
        else:
            kategorien += berechne_segment(start_min, ende_min, tag, entgelt)

        # Zusammenfuehren nach Label
        merged: dict[str, list[float]] = {}
        for label, h, zuschlag in kategorien:
            if label in merged:
                merged[label][0] += h
            else:
                merged[label] = [h, zuschlag]

        kv_zuschlag = entgelt["zuschlaege"]["kurzfristig"] if kurzfristig else 0.0
        grundlohn = entgelt["grundlohn"]

        aufschluesselung = []
        brutto = 0.0
        for label, (h, zuschlag) in merged.items():
            satz = grundlohn + zuschlag + kv_zuschlag
            betrag = h * satz
            displayed = f"{label} (KV)" if kurzfristig else label
            aufschluesselung.append({"label": displayed, "stunden": h, "satz": satz, "betrag": betrag})
            brutto += betrag

        # Fahrtzeit: § 7 Abs. 1 — Fahrtzeit wird mit Grundlohn verguetet,
        # bei Kurzfristiger Vermittlung mit Grundlohn + KV-Zuschlag.
        if fahrtzeit_h > 0:
            fahrt_satz = grundlohn + (kv_zuschlag if kurzfristig else 0.0)
            betrag = fahrtzeit_h * fahrt_satz
            aufschluesselung.append({
                "label": "Fahrtzeit (KV, 125 %)" if kurzfristig else "Fahrtzeit",
                "stunden": fahrtzeit_h,
                "satz": fahrt_satz,
                "betrag": betrag,
            })
            brutto += betrag

        bezahlt_total_h = bezahlte_h + fahrtzeit_h
        # § 7 Abs. 5: Wechselschichtzulage 0,63 EUR/h (Assistent*innen sind laut
        # Protokollerklaerung § 5 Abs. 1 S. 2 staendig in Wechselschicht -> max 105 EUR/Monat)
        wechselschicht = bezahlt_total_h * entgelt["zuschlaege"]["wechselschicht"]
        # § 7 Abs. 7: Organisationszulage 0,20 EUR/h — kein Monatslimit
        organisation = bezahlt_total_h * entgelt["zuschlaege"]["organisation"]
        brutto_monatszulagen = brutto + wechselschicht + organisation

        uebergang_info = (
            f"{tag} {start} -> {NEXT_DAY.get(tag, '?')} {ende}" if hat_uebergang else None
        )

        return {
            "total_h": total_h,
            "bezahlte_h": bezahlte_h,
            "bezahlt_total_h": bezahlt_total_h,
            "aufschluesselung": aufschluesselung,
            "brutto_ohne_zulagen": brutto,
            "wechselschicht": wechselschicht,
            "organisation": organisation,
            "brutto": brutto_monatszulagen,
            "fahrtzeit_h": fahrtzeit_h,
            "uebergang_info": uebergang_info,
        }

    return (berechne_schicht,)


@app.cell
def _():
    # Lohnsteuer: vereinfachter BMF PAP 2026 (Stufentarif § 32a EStG, Steuerklasse I)
    def lst_jahr(zvE: float, grundfreibetrag: int) -> float:
        """Lohnsteuer pro Jahr nach § 32a EStG (Werte fuer 2026)."""
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

    def berechne_netto(schicht_brutto: float, monats_brutto_schaetzung: float,
                       sv: dict, lst: dict) -> dict:
        """Netto-Schaetzung fuer eine einzelne Schicht (SK I, 2026, kinderlos)."""
        sv_satz = sv["kv"] + sv["kv_zusatz"] + sv["pv"] + sv["pv_kinderlos"] + sv["rv"] + sv["av"]
        sv_betrag = schicht_brutto * sv_satz

        # Lohnsteuer proportional auf die Schicht herunterrechnen
        anb_pausch_monat = lst["arbeitnehmer_pauschbetrag"] / 12
        vorsorge_monat = monats_brutto_schaetzung * sv_satz
        zvE_monat = max(0.0, monats_brutto_schaetzung - anb_pausch_monat - vorsorge_monat)
        zvE_jahr = zvE_monat * 12
        lst_monat = lst_jahr(zvE_jahr, lst["grundfreibetrag_jahr"]) / 12

        anteil = schicht_brutto / monats_brutto_schaetzung if monats_brutto_schaetzung > 0 else 0
        lst_schicht = lst_monat * anteil
        soli = lst_schicht * lst["soli_satz"]
        netto = schicht_brutto - sv_betrag - lst_schicht - soli

        return {
            "sv": round(sv_betrag, 2),
            "sv_satz_prozent": round(sv_satz * 100, 2),
            "lst": round(lst_schicht, 2),
            "soli": round(soli, 2),
            "netto": round(netto, 2),
        }

    return (berechne_netto,)


# ─────────────────────────────────────────────────────────────────────────────
# UI — Eingabe
# ─────────────────────────────────────────────────────────────────────────────
@app.cell(hide_code=True)
def _(mo):
    tag = mo.ui.dropdown(
        options=["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So", "Feiertag"],
        value="Mo",
        label="Wochentag",
    )
    fahrtzeit = mo.ui.dropdown(
        options={"Keine": 0.0, "0,5 h": 0.5, "1 h": 1.0, "1,5 h": 1.5, "2 h": 2.0, "2,5 h": 2.5},
        value="1 h",
        label="Fahrtzeit",
    )
    start = mo.ui.text(value="20:00", label="Beginn (HH:MM)", placeholder="HH:MM")
    ende = mo.ui.text(value="08:00", label="Ende (HH:MM)", placeholder="HH:MM")
    kurzfristig = mo.ui.checkbox(value=False, label="Kurzfristige Vermittlung (KV)")
    return ende, fahrtzeit, kurzfristig, start, tag


@app.cell(hide_code=True)
def _(ende, fahrtzeit, kurzfristig, mo, start, tag):
    mo.md("## Schicht eingeben")
    return


@app.cell(hide_code=True)
def _(ende, fahrtzeit, kurzfristig, mo, start, tag):
    mo.hstack(
        [
            mo.vstack([tag, start, kurzfristig]),
            mo.vstack([fahrtzeit, ende]),
        ],
        justify="start",
        gap=2,
    )
    return


# ─────────────────────────────────────────────────────────────────────────────
# Berechnung + Ausgabe
# ─────────────────────────────────────────────────────────────────────────────
@app.cell
def _(berechne_netto, berechne_schicht, ende, entgelt,
      fahrtzeit, kurzfristig, lst, start, sv, tag):
    try:
        ergebnis = berechne_schicht(
            tag.value, start.value, ende.value,
            kurzfristig.value, float(fahrtzeit.value), entgelt,
        )
    except (ValueError, AttributeError):
        ergebnis = None

    steuer = None
    if ergebnis is not None:
        # Monats-Brutto-Schaetzung: grob 94 h * Grundlohn (Basis fuer LSt-Hochrechnung)
        monats_schaetzung = 94 * entgelt["grundlohn"]
        steuer = berechne_netto(ergebnis["brutto"], monats_schaetzung, sv, lst)
    return ergebnis, steuer


@app.cell(hide_code=True)
def _(ergebnis, mo, steuer):
    if ergebnis is None:
        mo.md("> Eingabe unvollstaendig oder ungueltig — bitte Beginn/Ende im Format HH:MM.").callout(kind="warn")
    else:
        e = ergebnis
        rows = ""
        for pos in e["aufschluesselung"]:
            rows += (
                f"| {pos['stunden']:.2f} h | {pos['satz']:.2f} EUR | "
                f"{pos['label']} | **{pos['betrag']:.2f} EUR** |\n"
            )
        if e["wechselschicht"] > 0:
            rows += (
                f"| {e['bezahlt_total_h']:.2f} h | 0,63 EUR | "
                f"Wechselschicht (§ 7 Abs. 5) | **{e['wechselschicht']:.2f} EUR** |\n"
            )
        if e["organisation"] > 0:
            rows += (
                f"| {e['bezahlt_total_h']:.2f} h | 0,20 EUR | "
                f"Organisation (§ 7 Abs. 7) | **{e['organisation']:.2f} EUR** |\n"
            )

        uebergang = f"\n> **Tagesuebergang:** {e['uebergang_info']}\n" if e["uebergang_info"] else ""
        netto_zeile = (
            f"| **Netto** (SK I, 2026, kinderlos) | **~{steuer['netto']:.2f} EUR** |"
            if steuer else ""
        )
        abzuege = ""
        if steuer:
            abzuege = f"""

### Abzuege (Steuerklasse I, 2026, kinderlos)

| Position | Betrag |
|---|--:|
| Sozialversicherung ({steuer['sv_satz_prozent']} %) | -{steuer['sv']:.2f} EUR |
| Lohnsteuer (§ 32a EStG, PAP 2026) | -{steuer['lst']:.2f} EUR |
"""
            if steuer["soli"] > 0:
                abzuege += f"| Solidaritaetszuschlag (5,5 %) | -{steuer['soli']:.2f} EUR |\n"

        mo.md(f"""
## Ergebnis

| Schichtdauer | Fahrtzeit | Bezahlt |
|--:|--:|--:|
| {e['total_h']:.2f} h | {e['fahrtzeit_h']:.2f} h | {e['bezahlt_total_h']:.2f} h |
{uebergang}

### Brutto-Aufschluesselung

| Stunden | Satz | Position | Betrag |
|--:|--:|---|--:|
{rows}| | | **Brutto gesamt** | **{e['brutto']:.2f} EUR** |
{abzuege}
### Endergebnis

| | |
|---|--:|
| **Brutto** | **{e['brutto']:.2f} EUR** |
{netto_zeile}
| Effektiver Stundenlohn (brutto) | {e['brutto'] / max(e['bezahlt_total_h'], 0.01):.2f} EUR/h |
""")
    return


# ─────────────────────────────────────────────────────────────────────────────
# Dokumentation
# ─────────────────────────────────────────────────────────────────────────────
@app.cell(hide_code=True)
def _(entgelt, mo):
    z = entgelt["zuschlaege"]
    mo.md(f"""
---

## Rechtliche Grundlage

**Haustarifvertrag** (HTV) persoenliche Assistenz vom 5. Maerz 2020,
inkl. 2. AenderungsTV gueltig ab 1. Oktober 2023.

Tarifparteien: Arbeitgeber (Assistenzdienstleister e.V.) und **ver.di** —
Vereinte Dienstleistungsgewerkschaft, Landesbezirk Berlin-Brandenburg.

### Verwendete Entgelt-Saetze (Anlage C, gueltig ab Februar 2025)

| Groesse | Wert | Herkunft |
|---|--:|---|
| Grundlohn (EG 5 Stufe 2) | **{entgelt['grundlohn']:.2f} EUR/h** | 3.201,87 EUR / 167,398 Std/Monat |
| Zuschlagsbasis (EG 5 Stufe 3) | **{entgelt['zuschlagsbasis']:.2f} EUR/h** | 3.330,99 EUR / 167,398 Std/Monat |
| Nachtzuschlag (21-6 h) | {z['nacht']:.2f} EUR/h | § 7 Abs. 1 b: 20 % × 19,90 EUR |
| Samstagszuschlag (13-21 h) | {z['samstag']:.2f} EUR/h | § 7 Abs. 1 f: 20 % × 19,90 EUR |
| Sonntagszuschlag | {z['sonntag']:.2f} EUR/h | § 7 Abs. 1 c: 25 % × 19,90 EUR |
| Feiertag mit FZA | {z['feiertag_mit_fza']:.2f} EUR/h | § 7 Abs. 1 d: 35 % × 19,90 EUR |
| Feiertag ohne FZA | {z['feiertag_ohne_fza']:.2f} EUR/h | § 7 Abs. 1 d: 135 % × 19,90 EUR |
| KV-Zuschlag (Kurzfristig) | {z['kurzfristig']:.4f} EUR/h | 25 % × Grundlohn (Lohnart 475) |
| Wechselschichtzulage | 0,63 EUR/h | § 7 Abs. 5, max 105 EUR/Monat |
| Organisationszulage | 0,20 EUR/h | § 7 Abs. 7, kein Limit |
""")
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
### § 7 HTV — Ausgleich fuer Sonderformen der Arbeit (Wortlaut)

> **(1)** Beschaeftigte erhalten neben dem Entgelt fuer die tatsaechliche Arbeitsleistung
> Zeitzuschlaege. Die Zeitzuschlaege betragen — auch bei Teilzeitbeschaeftigten — je Stunde
>
> - **a)** fuer Ueberstunden — in den Entgeltgruppen 1 bis 9b **30 v.H.**, in 10 bis 15 15 v.H.
> - **b)** fuer Nachtarbeit **20 v.H.**
> - **c)** fuer Sonntagsarbeit **25 v.H.**
> - **d)** bei Feiertagsarbeit — ohne Freizeitausgleich **135 v.H.**, mit Freizeitausgleich **35 v.H.**
> - **e)** fuer Arbeit am 24. und 31. Dezember — wie d)
> - **f)** fuer Arbeit an Samstagen von **13 bis 21 Uhr — 20 v.H.**
>
> des auf eine Stunde entfallenden Anteils des Tabellenentgelts der **Stufe 3** der jeweiligen
> Entgeltgruppe.
>
> Beim Zusammentreffen von Zeitzuschlaegen nach Satz 2 Buchstabe c) bis f) wird nur der
> hoechste Zeitzuschlag gezahlt. (Nachtzuschlag b) stapelt dagegen auf c)–f) — max. 235 %
> bei Feiertag ohne FZA laut Protokollerklaerung zu Satz 2 Buchstabe d.)

> **(5)** Beschaeftigte, die staendig Wechselschichtarbeit leisten, erhalten eine
> Wechselschichtzulage in Hoehe von **0,63 EUR pro Stunde, maximal jedoch 105 EUR monatlich**;
> Beschaeftigte, die nicht staendig Wechselschichtarbeit leisten, erhalten eine
> Wechselschichtzulage von 0,63 EUR pro Stunde.
>
> Laut Protokollerklaerung zu § 5 Abs. 1 Satz 2: "Assistent\*innen sind in Wechselschicht taetig."

> **(7)** Assistent\*innen erhalten eine **Organisationszulage**. Im Rahmen der Gewaehrleistung
> der Rechte der Menschen mit Behinderung und ihrer Personalkompetenz werden ihre
> Teamassistent\*innen und festen Teamvertretungen fuer die Besetzung von kurzfristig
> ausgefallenen Schichten in ihrer Freizeit angefragt und aus ihrer Freizeit vermittelt.
> Hierfuer wird als Ausgleich eine pauschale Zulage in Hoehe von **0,20 EUR pro monatlich
> geleisteter Arbeitsstunde** an die Assistent\*innen gewaehrt.

### § 6 Abs. 5 HTV — Definition Nachtarbeit

> "Nachtarbeit ist die Arbeit zwischen **21 Uhr und 6 Uhr**."

### § 5 Abs. 1 HTV — Regelmaessige Arbeitszeit

> "Die durchschnittliche regelmaessige woechentliche Arbeitszeit ... b) betraegt **38,5 Stunden**
> fuer ... aa) Assistent\*innen, bb) Beschaeftigte, die staendig Wechselschicht- oder
> Schichtarbeit leisten. Bei Wechselschichtarbeit werden die gesetzlich vorgeschriebenen Pausen
> in die Arbeitszeit eingerechnet."
>
> -> Der Rechner rechnet Pausen **nicht heraus**: sie sind laut HTV voll verguetet.

### KV-Zuschlag (Kurzfristige Vermittlung)

Laut Lohnabrechnung (Lohnart **475**): **25 % des Grundlohns** als Zuschlag fuer
kurzfristig vermittelte Schichten. Bei Kurzfristig-Einsaetzen wird auch die
Fahrtzeit mit 125 % (= Grundlohn + KV-Zuschlag) verguetet (Lohnart 277).

### Lohnsteuer & Sozialversicherung (2026)

- **SV-Saetze Arbeitnehmer-Anteil 2026**: KV 7,30 % + KV-Zusatz 1,45 % + PV 1,80 %
  + PV-Kinderlos 0,60 % + RV 9,30 % + AV 1,30 % = **21,75 %**. Quellen: AOK, DRV, Bundesregierung.
- **Lohnsteuer**: Stufentarif § 32a EStG mit Jahres-Grundfreibetrag 12.348 EUR (2026),
  Arbeitnehmer-Pauschbetrag 1.230 EUR. Berechnung nach BMF Programmablaufplan **PAP 2026**,
  Steuerklasse I, keine Konfession, keine Kinder.
- **Solidaritaetszuschlag**: 5,5 % auf LSt, Freigrenze ~23.900 EUR LSt/Jahr —
  bei diesem Einkommensniveau praktisch **0**.

### Offene Punkte (nicht im Rechner beruecksichtigt)

1. **Zuschlagsbasis**: HTV sagt "Stufe 3" (19,90 EUR). Nach Anlage-C-Neufassungen
   kann sich diese Summe aendern — dann ist die Zuschlagsbasis anzupassen.
2. **Annahmeverzug-Zuschlag** (Lohnart 485): monatlich wiederkehrend oder einmalig?
3. **Ausfall-Stunden AFG** (Lohnart 235): Meldeweg und Hoehe.

Diese Punkte koennen das tatsaechliche Brutto um einige Euro verschieben.
""")
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
---

### Quellen

- **HTV** vom 5. Maerz 2020, inkl. 2. AenderungsTV gueltig ab 1. Oktober 2023
  (nicht oeffentlich verfuegbar)
- **Anlage C** — Entgelttabelle gueltig ab Februar 2025
  — Datei: `Anlage-C-allg.-Tabellenentgelt_ab-Feb-2025-bis-Okt-2025.pdf` (nicht public)
- **BMF Programmablaufplan 2026 (PAP 2026)** — [bundesfinanzministerium.de](https://www.bundesfinanzministerium.de/Content/DE/Downloads/Steuern/Steuerarten/Lohnsteuer/Programmablaufplan/)
- **§ 32a EStG** (Einkommensteuer-Tarif) — [gesetze-im-internet.de/estg/__32a.html](https://www.gesetze-im-internet.de/estg/__32a.html)
- **§ 9a EStG** (Arbeitnehmer-Pauschbetrag) — [gesetze-im-internet.de/estg/__9a.html](https://www.gesetze-im-internet.de/estg/__9a.html)
- **SV-Beitragssaetze 2026** — [AOK Beitragssaetze](https://www.aok.de/fk/sozialversicherung/sozialversicherungsbeitraege/beitragssaetze/)
- **ver.di Berlin-Brandenburg** (Tarifpartei) — [bb.verdi.de](https://bb.verdi.de/)

### Disclaimer

Inoffizielle Implementation. Keine Rechtsberatung. Im Zweifel gilt die offizielle
Gehaltsabrechnung. Bei Abweichungen zuerst mit der Personalabteilung klaeren.
""")
    return


if __name__ == "__main__":
    app.run()
