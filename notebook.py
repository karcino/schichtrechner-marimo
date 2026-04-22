"""HTV-Schichtrechner — marimo notebook (Einzelschicht).

Reaktiver Lohn-Rechner fuer eine einzelne Schicht nach HTV persoenliche Assistenz.
Basis: § 7 HTV (Ausgleich fuer Sonderformen der Arbeit) + Anlage C.

Logik liegt in `htv_calc.py` (geteilt mit `notebook_monat.py`).

Export zu WebAssembly:
    python build_wasm.py
    uv run marimo export html-wasm _build/notebook.py -o public --mode run
"""

import marimo

__generated_with = "0.16.0"
app = marimo.App(width="medium", app_title="Schichtrechner HTV")


@app.cell(hide_code=True)
def _():
    import marimo as mo

    return (mo,)


# ─────────────────────────────────────────────────────────────────────────────
# Gemeinsame Logik aus htv_calc.py
# ─────────────────────────────────────────────────────────────────────────────
@app.cell(hide_code=True)
def _():
    # BUILD_INLINE: htv_calc
    import htv_calc

    entgelt = htv_calc.ENTGELT
    sv = htv_calc.SV
    lst = htv_calc.LST
    berechne_schicht = htv_calc.berechne_schicht
    berechne_netto = htv_calc.berechne_schicht_netto
    return berechne_netto, berechne_schicht, entgelt, lst, sv


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

        > 📅 **Monatsabrechnung simulieren?** → [Monats-Rechner](./monat/)
        >
        > 🏛 **Wer ist ambulante dienste e.V.?** → [Organigramm](./organigramm/)
        """
    )
    return


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
def _(mo):
    mo.md(
        r"""
        ---

        # 🧮 Schicht-Rechner

        **Trage deine Schicht unten ein — das Ergebnis erscheint automatisch darunter.**
        """
    )
    return


@app.cell(hide_code=True)
def _(ende, fahrtzeit, kurzfristig, mo, start, tag):
    mo.callout(
        mo.hstack(
            [
                mo.vstack([tag, start, kurzfristig], gap=1),
                mo.vstack([fahrtzeit, ende], gap=1),
            ],
            justify="start",
            gap=2,
        ),
        kind="info",
    )
    return


# ─────────────────────────────────────────────────────────────────────────────
# Berechnung + Ausgabe
# ─────────────────────────────────────────────────────────────────────────────
@app.cell
def _(berechne_netto, berechne_schicht, ende, entgelt, fahrtzeit,
      kurzfristig, lst, start, sv, tag):
    try:
        ergebnis = berechne_schicht(
            tag.value, start.value, ende.value,
            kurzfristig.value, float(fahrtzeit.value), entgelt,
        )
    except (ValueError, AttributeError):
        ergebnis = None

    steuer = None
    if ergebnis is not None:
        monats_schaetzung = 94 * entgelt["grundlohn"]
        steuer = berechne_netto(ergebnis["brutto"], monats_schaetzung, sv, lst)
    return ergebnis, steuer


@app.cell(hide_code=True)
def _(ergebnis, mo, steuer):
    if ergebnis is None:
        _ausgabe = mo.md(
            "> Eingabe unvollstaendig oder ungueltig — bitte Beginn/Ende im Format HH:MM."
        ).callout(kind="warn")
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

        _ausgabe = mo.md(f"""
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
    _ausgabe
    return


# ─────────────────────────────────────────────────────────────────────────────
# Dokumentation (einklappbar)
# ─────────────────────────────────────────────────────────────────────────────
@app.cell(hide_code=True)
def _(mo):
    mo.md(
        r"""
        ---

        ## 📚 Dokumentation & Quellen

        *Klicke eine Sektion an, um die Details einzublenden.*
        """
    )
    return


@app.cell(hide_code=True)
def _(entgelt, mo):
    z = entgelt["zuschlaege"]
    _rechtliche_grundlage = mo.md(f"""
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

    _paragraphen = mo.md(r"""
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
  + PV-Kinderlos 0,60 % + RV 9,30 % + AV 1,30 % = **21,75 %**.
- **Lohnsteuer**: Stufentarif § 32a EStG mit Jahres-Grundfreibetrag 12.348 EUR (2026),
  Arbeitnehmer-Pauschbetrag 1.230 EUR. Berechnung nach BMF Programmablaufplan **PAP 2026**,
  Steuerklasse I, keine Konfession, keine Kinder.
- **Solidaritaetszuschlag**: 5,5 % auf LSt, Freigrenze ~23.900 EUR LSt/Jahr —
  bei diesem Einkommensniveau praktisch **0**.
""")

    _quellen = mo.md(r"""
- **HTV** vom 5. Maerz 2020, inkl. 2. AenderungsTV gueltig ab 1. Oktober 2023
  (nicht oeffentlich verfuegbar)
- **Anlage C** — Entgelttabelle gueltig ab Februar 2025
- **BMF Programmablaufplan 2026 (PAP 2026)** — [bundesfinanzministerium.de](https://www.bundesfinanzministerium.de/Content/DE/Downloads/Steuern/Steuerarten/Lohnsteuer/Programmablaufplan/)
- **§ 32a EStG** — [gesetze-im-internet.de/estg/__32a.html](https://www.gesetze-im-internet.de/estg/__32a.html)
- **§ 9a EStG** — [gesetze-im-internet.de/estg/__9a.html](https://www.gesetze-im-internet.de/estg/__9a.html)
- **SV-Beitragssaetze 2026** — [AOK Beitragssaetze](https://www.aok.de/fk/sozialversicherung/sozialversicherungsbeitraege/beitragssaetze/)
- **ver.di Berlin-Brandenburg** — [bb.verdi.de](https://bb.verdi.de/)

### Disclaimer

Inoffizielle Implementation. Keine Rechtsberatung. Im Zweifel gilt die offizielle
Gehaltsabrechnung. Bei Abweichungen zuerst mit der Personalabteilung klaeren.
""")

    _akkordeon = mo.accordion(
        {
            "⚖️  Rechtliche Grundlage & Entgelt-Saetze": _rechtliche_grundlage,
            "📜 § 7 HTV — Paragraphen im Wortlaut": _paragraphen,
            "🔗 Quellen & Disclaimer": _quellen,
        }
    )
    _akkordeon
    return


if __name__ == "__main__":
    app.run()
