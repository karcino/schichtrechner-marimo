"""HTV-Monats-Rechner — marimo notebook (Monat).

Simuliert eine komplette Monatsabrechnung mit mehreren Schichten.
CSV-Import, manuelle Eingabe, Netto-Berechnung auf Basis des Monats-Brutto.

Logik liegt in `htv_calc.py` (geteilt mit `notebook.py`).

Export zu WebAssembly:
    python build_wasm.py
    uv run marimo export html-wasm _build/notebook_monat.py -o public/monat --mode run
"""

import marimo

__generated_with = "0.16.0"
app = marimo.App(width="medium", app_title="HTV Monats-Rechner")


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
    berechne_monats_netto = htv_calc.berechne_monats_netto
    cap_monats_zulagen = htv_calc.cap_monats_zulagen
    parse_schicht_csv = htv_calc.parse_schicht_csv
    BEISPIEL_CSV = htv_calc.BEISPIEL_CSV
    aggregiere_monat = htv_calc.aggregiere_monat
    netto_details = htv_calc.netto_details
    LOHNARTEN = htv_calc.LOHNARTEN
    return (BEISPIEL_CSV, LOHNARTEN, aggregiere_monat, berechne_monats_netto,
            berechne_schicht, cap_monats_zulagen, entgelt, lst,
            netto_details, parse_schicht_csv, sv)


# ─────────────────────────────────────────────────────────────────────────────
# Einleitung
# ─────────────────────────────────────────────────────────────────────────────
@app.cell(hide_code=True)
def _(mo):
    mo.md(
        r"""
        # 📅 HTV-Monats-Rechner

        Simuliert eine **komplette Monatsabrechnung** nach HTV persoenliche Assistenz —
        mit mehreren Schichten, korrekt gecappter Wechselschichtzulage (§ 7 Abs. 5: max 105 EUR/Monat)
        und Monats-Netto auf Basis des tatsaechlichen Monatsbruttos.

        > 🧮 **Nur eine einzelne Schicht?** → [Einzel-Rechner](../)
        """
    )
    return


# ─────────────────────────────────────────────────────────────────────────────
# CSV-Import
# ─────────────────────────────────────────────────────────────────────────────
@app.cell(hide_code=True)
def _(mo):
    mo.md(
        r"""
        ---

        ## 1️⃣ Import aus Schichtplaner-App (optional)

        Lade einen CSV-Export deiner Schichtplaner-App hoch — Spalten werden automatisch erkannt.
        """
    )
    return


@app.cell(hide_code=True)
def _(BEISPIEL_CSV, mo):
    csv_upload = mo.ui.file(
        filetypes=[".csv", ".txt"],
        label="CSV-Datei auswaehlen",
        multiple=False,
    )
    csv_text = mo.ui.text_area(
        value="",
        label="…oder CSV hier einfuegen",
        placeholder=BEISPIEL_CSV,
        rows=6,
        full_width=True,
    )
    mo.callout(
        mo.vstack(
            [
                mo.md(
                    "**Erwartetes Format** (Header-Zeile + Daten, Trennzeichen `,` oder `;`):"
                ),
                mo.md(
                    "- **Pflicht**: `beginn`, `ende` (HH:MM)\n"
                    "- **Tag**: entweder `datum` (YYYY-MM-DD / DD.MM.YYYY) **oder** `tag` (Mo, Di, …, Feiertag)\n"
                    "- **Optional**: `kurzfristig` (true/false, ja/nein, 1/0), `fahrtzeit` (Stunden)"
                ),
                mo.md(f"```csv\n{BEISPIEL_CSV}```"),
                csv_upload,
                csv_text,
            ],
            gap=1,
        ),
        kind="neutral",
    )
    return csv_text, csv_upload


# ─────────────────────────────────────────────────────────────────────────────
# State: Schichten-Liste
# ─────────────────────────────────────────────────────────────────────────────
@app.cell(hide_code=True)
def _(mo):
    def _default_shift():
        return {
            "tag": "Mo", "start": "20:00", "ende": "08:00",
            "kurzfristig": False, "fahrtzeit": 1.0,
        }

    get_rows, set_rows = mo.state([_default_shift()])
    return _default_shift, get_rows, set_rows


# CSV-Import-Button: parse + replace rows
@app.cell(hide_code=True)
def _(csv_text, csv_upload, mo, parse_schicht_csv, set_rows):
    # Text aus Upload oder Textarea priorisieren
    src_text = ""
    src_label = ""
    if csv_upload.value and len(csv_upload.value) > 0:
        try:
            src_text = csv_upload.value[0].contents.decode("utf-8")
            src_label = f"Datei: {csv_upload.value[0].name}"
        except (UnicodeDecodeError, AttributeError):
            src_text = ""
    elif csv_text.value.strip():
        src_text = csv_text.value
        src_label = "Text-Eingabe"

    if src_text:
        parsed, fehler = parse_schicht_csv(src_text)
    else:
        parsed, fehler = [], []

    apply_btn = mo.ui.button(
        label=f"✓ {len(parsed)} Schichten uebernehmen" if parsed else "Kein CSV",
        kind="success" if parsed else "neutral",
        disabled=not parsed,
        on_click=lambda _v: set_rows(parsed) if parsed else None,
    )

    _preview = None
    if src_text:
        _lines = []
        if fehler:
            _lines.append(mo.md("**Fehler beim Parsen:**"))
            for _err in fehler[:10]:
                _lines.append(mo.md(f"- ❌ {_err}"))
        if parsed:
            _lines.append(mo.md(f"**{len(parsed)} Schichten aus {src_label} erkannt:**"))
            _tbl = "| # | Tag | Beginn | Ende | KV | Fahrtzeit |\n|---|---|---|---|---|---|\n"
            for _i, _s in enumerate(parsed[:20], 1):
                _kv = "✓" if _s["kurzfristig"] else "—"
                _tbl += f"| {_i} | {_s['tag']} | {_s['start']} | {_s['ende']} | {_kv} | {_s['fahrtzeit']:.1f} h |\n"
            if len(parsed) > 20:
                _tbl += f"| … | … | … | … | … | +{len(parsed) - 20} weitere |\n"
            _lines.append(mo.md(_tbl))
            _lines.append(apply_btn)
        _preview = mo.vstack(_lines, gap=1)

    _preview if _preview else mo.md("")
    return (apply_btn,)


# ─────────────────────────────────────────────────────────────────────────────
# Manuelle Eingabe: Add/Delete-Buttons + Row-Rendering
# ─────────────────────────────────────────────────────────────────────────────
@app.cell(hide_code=True)
def _(_default_shift, get_rows, mo, set_rows):
    add_btn = mo.ui.button(
        label="➕ Schicht hinzufuegen",
        kind="success",
        on_click=lambda _v: set_rows(get_rows() + [_default_shift()]),
    )
    clear_btn = mo.ui.button(
        label="🗑️ Alle Schichten loeschen",
        kind="danger",
        on_click=lambda _v: set_rows([_default_shift()]),
    )
    return add_btn, clear_btn


@app.cell(hide_code=True)
def _(mo):
    mo.md(
        r"""
        ---

        ## 2️⃣ Schichten bearbeiten

        Trage alle Schichten des Monats ein — oder lade sie oben per CSV.
        """
    )
    return


@app.cell(hide_code=True)
def _(get_rows, mo, set_rows):
    rows_data = get_rows()
    anzahl_rows = len(rows_data)

    def _row_inputs(s):
        return mo.ui.dictionary({
            "tag": mo.ui.dropdown(
                options=["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So", "Feiertag"],
                value=s["tag"],
                label="",
            ),
            "start": mo.ui.text(value=s["start"], placeholder="HH:MM", full_width=False),
            "ende": mo.ui.text(value=s["ende"], placeholder="HH:MM", full_width=False),
            "kurzfristig": mo.ui.checkbox(value=s["kurzfristig"], label="KV"),
            "fahrtzeit": mo.ui.number(
                value=s["fahrtzeit"], start=0, stop=5, step=0.5, label="",
            ),
        })

    schichten_ui = mo.ui.array([_row_inputs(_s) for _s in rows_data])

    def _make_delete(idx):
        return mo.ui.button(
            label="×",
            on_click=lambda _v, idx=idx: set_rows(
                [_r for _j, _r in enumerate(get_rows()) if _j != idx] or [
                    {"tag": "Mo", "start": "20:00", "ende": "08:00",
                     "kurzfristig": False, "fahrtzeit": 1.0}
                ]
            ),
        )

    def _make_duplicate(idx):
        return mo.ui.button(
            label="⧉",
            on_click=lambda _v, idx=idx: set_rows(
                get_rows()[:idx + 1] + [dict(get_rows()[idx])] + get_rows()[idx + 1:]
            ),
        )

    del_btns = [_make_delete(_i) for _i in range(anzahl_rows)]
    dup_btns = [_make_duplicate(_i) for _i in range(anzahl_rows)]

    return anzahl_rows, del_btns, dup_btns, schichten_ui


@app.cell(hide_code=True)
def _(add_btn, anzahl_rows, clear_btn, del_btns, dup_btns, mo, schichten_ui):
    _header = mo.hstack(
        [
            mo.md("**#**"),
            mo.md("**Tag**"),
            mo.md("**Beginn**"),
            mo.md("**Ende**"),
            mo.md("**KV**"),
            mo.md("**Fahrt (h)**"),
            mo.md(""),
            mo.md(""),
        ],
        justify="start", gap=1, align="center",
    )
    _rows = [_header]
    for _idx in range(anzahl_rows):
        _dic = schichten_ui[_idx]
        _rows.append(mo.hstack(
            [
                mo.md(f"**{_idx + 1}**"),
                _dic["tag"],
                _dic["start"],
                _dic["ende"],
                _dic["kurzfristig"],
                _dic["fahrtzeit"],
                dup_btns[_idx],
                del_btns[_idx],
            ],
            justify="start", gap=1, align="center",
        ))

    mo.vstack(
        [
            *_rows,
            mo.hstack([add_btn, clear_btn], justify="start", gap=1),
        ],
        gap=0,
    )
    return


# ─────────────────────────────────────────────────────────────────────────────
# Berechnung
# ─────────────────────────────────────────────────────────────────────────────
@app.cell
def _(berechne_monats_netto, berechne_schicht, cap_monats_zulagen,
      entgelt, lst, schichten_ui, sv):
    results = []
    errors = []
    for _i, _s in enumerate(schichten_ui.value):
        try:
            _r = berechne_schicht(
                _s["tag"], _s["start"], _s["ende"],
                bool(_s["kurzfristig"]), float(_s["fahrtzeit"] or 0),
                entgelt,
            )
        except (ValueError, AttributeError, TypeError):
            _r = None
        if _r is None:
            errors.append(_i + 1)
        results.append(_r)

    valid = [_r for _r in results if _r is not None]
    monats_basis = sum(_r["brutto_basis"] for _r in valid)
    total_h = sum(_r["bezahlt_total_h"] for _r in valid)

    zulagen = cap_monats_zulagen(total_h, entgelt)
    monats_brutto = monats_basis + zulagen["wechselschicht"] + zulagen["organisation"]
    steuer = berechne_monats_netto(monats_brutto, sv, lst) if monats_brutto > 0 else None
    return errors, monats_basis, monats_brutto, results, steuer, total_h, zulagen


# ─────────────────────────────────────────────────────────────────────────────
# Ergebnis-Anzeige
# ─────────────────────────────────────────────────────────────────────────────
@app.cell(hide_code=True)
def _(errors, mo, monats_basis, monats_brutto, results, steuer,
      total_h, zulagen):
    if monats_brutto == 0:
        _summary = mo.md("> Noch keine gueltige Schicht eingetragen.").callout(kind="warn")
    else:
        err_note = ""
        if errors:
            err_note = (
                f"\n\n⚠️ Zeile(n) {', '.join(map(str, errors))} ungueltig "
                f"(Zeiten pruefen) — werden ignoriert."
            )

        cap_note = ""
        if zulagen["wechselschicht_gecappt"]:
            cap_note = (
                f"\n*(Wechselschichtzulage gecappt auf 105 EUR — "
                f"ungecappt waeren es {zulagen['wechselschicht_ungecappt']:.2f} EUR)*"
            )

        eff = monats_brutto / max(total_h, 0.01)
        netto_line = (
            f"| **Netto** (SK I, 2026, kinderlos) | **~{steuer['netto']:.2f} EUR** |"
            if steuer else ""
        )

        _summary = mo.md(f"""
## 💰 Monats-Summary

| Position | Wert |
|---|--:|
| Anzahl Schichten | {len([r for r in results if r]):d} |
| Gesamt-Stunden (inkl. Fahrtzeit) | {total_h:.2f} h |
| Brutto aus Schichten (mit Zuschlaegen) | {monats_basis:.2f} EUR |
| Wechselschichtzulage (§ 7 Abs. 5) | {zulagen['wechselschicht']:.2f} EUR |
| Organisationszulage (§ 7 Abs. 7) | {zulagen['organisation']:.2f} EUR |
| **Monats-Brutto** | **{monats_brutto:.2f} EUR** |
{netto_line}
| Effektiver Stundenlohn (brutto) | {eff:.2f} EUR/h |
{cap_note}{err_note}
""").callout(kind="success")
    _summary
    return


@app.cell(hide_code=True)
def _(mo, results, steuer):
    if not any(_r is not None for _r in results):
        _details = mo.md("")
    else:
        _rows = "| # | Tag | Zeit | Stunden | Brutto-Basis |\n|--:|---|---|--:|--:|\n"
        for _i, _r in enumerate(results, 1):
            if _r is None:
                _rows += f"| {_i} | — | ❌ ungueltig | — | — |\n"
                continue
            _ueb = f" → Folgetag" if _r["uebergang_info"] else ""
            _rows += (
                f"| {_i} | — | {_r['bezahlt_total_h']:.2f} h{_ueb} | "
                f"{_r['bezahlt_total_h']:.2f} h | {_r['brutto_basis']:.2f} EUR |\n"
            )

        _abzuege = ""
        if steuer:
            _abzuege = f"""

### Abzuege

| Position | Betrag |
|---|--:|
| Sozialversicherung ({steuer['sv_satz_prozent']} %) | -{steuer['sv']:.2f} EUR |
| Lohnsteuer (§ 32a EStG, PAP 2026) | -{steuer['lst']:.2f} EUR |
"""
            if steuer["soli"] > 0:
                _abzuege += f"| Solidaritaetszuschlag (5,5 %) | -{steuer['soli']:.2f} EUR |\n"

        _details = mo.md(f"""

### Pro Schicht

{_rows}
{_abzuege}
""")
    _details
    return


# ─────────────────────────────────────────────────────────────────────────────
# Lohnabrechnung (druckbar / PDF)
# ─────────────────────────────────────────────────────────────────────────────
@app.cell(hide_code=True)
def _(mo):
    mo.md(
        r"""
        ---

        ## 3️⃣ Professionelle Lohnabrechnung (druckbar)

        Ausfuehrliche Monatsabrechnung zum Vergleich mit der offiziellen Gehaltsabrechnung —
        **Drucken → "Als PDF speichern"** im Browser erzeugt eine saubere A4-PDF.
        """
    )
    return


@app.cell(hide_code=True)
def _(mo):
    abr_name = mo.ui.text(value="", label="Name / Mitarbeiter:in", full_width=True)
    abr_pers_nr = mo.ui.text(value="", label="Personalnummer (optional)", full_width=True)
    abr_monat = mo.ui.text(value="", label='Abrechnungsmonat (z.B. "April 2026")', full_width=True)
    abr_show = mo.ui.switch(value=False, label="Lohnabrechnung anzeigen")

    mo.vstack(
        [
            mo.hstack([abr_name, abr_pers_nr, abr_monat], justify="start", gap=1, wrap=True),
            abr_show,
        ],
        gap=1,
    )
    return abr_monat, abr_name, abr_pers_nr, abr_show


@app.cell(hide_code=True)
def _(get_rows):
    # Datumsangaben aus dem State (falls CSV importiert)
    _rows_raw = get_rows()
    datums = [r.get("datum") for r in _rows_raw]
    return (datums,)


@app.cell(hide_code=True)
def _(LOHNARTEN, abr_monat, abr_name, abr_pers_nr, abr_show,
      aggregiere_monat, datums, entgelt, mo, netto_details, results,
      schichten_ui):
    if not abr_show.value or not results or not any(r for r in results):
        _lohnab = mo.md("")
    else:
        from datetime import date, datetime

        _agg = aggregiere_monat(results, list(schichten_ui.value), entgelt)
        _n = netto_details(_agg["monats_brutto"])

        _heute = date.today().strftime("%d.%m.%Y")
        _name = abr_name.value.strip() or "—"
        _pers = abr_pers_nr.value.strip() or "—"
        _monat = abr_monat.value.strip() or "—"

        _WT_DE = {"Mo": "Montag", "Di": "Dienstag", "Mi": "Mittwoch",
                  "Do": "Donnerstag", "Fr": "Freitag", "Sa": "Samstag",
                  "So": "Sonntag", "Feiertag": "Feiertag"}

        def _fmt_eur(x):
            return f"{x:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")

        def _fmt_h(x):
            return f"{x:.2f}".replace(".", ",")

        _schicht_rows = []
        for _idx, (_s, _r) in enumerate(zip(schichten_ui.value, results), 1):
            _datum_iso = datums[_idx - 1] if _idx - 1 < len(datums) and datums[_idx - 1] else None
            _datum_disp = ""
            if _datum_iso:
                try:
                    _datum_disp = datetime.fromisoformat(_datum_iso).strftime("%d.%m.%Y")
                except ValueError:
                    _datum_disp = _datum_iso
            _wt = _WT_DE.get(_s.get("tag", ""), _s.get("tag", ""))
            _kv = "ja" if _s.get("kurzfristig") else "—"
            _fahrt = float(_s.get("fahrtzeit") or 0)
            if _r is None:
                _brutto_zeile = "—"
                _stunden_zeile = "—"
            else:
                _brutto_zeile = _fmt_eur(_r["brutto_basis"])
                _stunden_zeile = _fmt_h(_r["bezahlt_total_h"])
            _schicht_rows.append(
                f"<tr>"
                f"<td>{_idx}</td>"
                f"<td>{_datum_disp or '—'}</td>"
                f"<td>{_wt}</td>"
                f"<td>{_s.get('start', '')}</td>"
                f"<td>{_s.get('ende', '')}</td>"
                f"<td class='num'>{_stunden_zeile}</td>"
                f"<td class='num'>{_fmt_h(_fahrt) if _fahrt > 0 else '—'}</td>"
                f"<td>{_kv}</td>"
                f"<td class='num'>{_brutto_zeile}</td>"
                f"</tr>"
            )

        _la_order = [
            "Regulaer", "Nacht", "Nacht (Sa)", "Samstag 13-21 h",
            "Sonntag", "Sonntag + Nacht", "Feiertag", "Feiertag + Nacht",
            "Fahrtzeit", "Fahrtzeit (KV, 125 %)",
        ]
        _lohnart_rows = []
        for _key in _la_order:
            if _key not in _agg["lohnarten"]:
                continue
            _la = _agg["lohnarten"][_key]
            _meta = LOHNARTEN.get(_key, {"nr": "—", "bez": _key})
            _lohnart_rows.append(
                f"<tr>"
                f"<td class='la-nr'>{_meta['nr']}</td>"
                f"<td>{_meta['bez']}</td>"
                f"<td class='num'>{_fmt_h(_la['stunden'])}</td>"
                f"<td class='num'>{_fmt_eur(_la['satz'])}</td>"
                f"<td class='num'>{_fmt_eur(_la['betrag'])}</td>"
                f"</tr>"
            )
        for _key, _la in _agg["lohnarten"].items():
            if _key in _la_order:
                continue
            _meta = LOHNARTEN.get(_key, {"nr": "—", "bez": _key})
            _lohnart_rows.append(
                f"<tr><td class='la-nr'>{_meta['nr']}</td><td>{_meta['bez']}</td>"
                f"<td class='num'>{_fmt_h(_la['stunden'])}</td>"
                f"<td class='num'>{_fmt_eur(_la['satz'])}</td>"
                f"<td class='num'>{_fmt_eur(_la['betrag'])}</td></tr>"
            )

        _cap_note = ""
        if _agg["wechselschicht_gecappt"]:
            _cap_note = (
                f" <span class='cap-note'>(gecappt — ungecappt "
                f"{_fmt_eur(_agg['wechselschicht_ungecappt'])} EUR)</span>"
            )

        _html = f"""
<style>
  .lohnab-hint {{
    font-size: 10pt; color: #555; padding: 6pt 0; font-style: italic;
  }}
  .lohnabrechnung {{
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    color: #111; background: #fff;
    max-width: 210mm; margin: 12pt auto; padding: 18mm 16mm;
    font-size: 9.5pt; line-height: 1.35;
    box-shadow: 0 1px 4px rgba(0,0,0,.08), 0 6px 22px rgba(0,0,0,.06);
    border: 1px solid #e2e2e2;
  }}
  .lohnabrechnung header {{
    border-bottom: 3px solid #111; padding-bottom: 10pt; margin-bottom: 14pt;
  }}
  .lohnabrechnung .title {{
    font-size: 22pt; font-weight: 700; letter-spacing: -0.3pt; margin: 0;
  }}
  .lohnabrechnung .subtitle {{
    font-size: 11pt; color: #444; margin-top: 2pt;
  }}
  .lohnabrechnung .kopf {{
    width: 100%; margin-top: 10pt; border-collapse: collapse;
  }}
  .lohnabrechnung .kopf td {{
    padding: 2pt 6pt 2pt 0; vertical-align: top;
  }}
  .lohnabrechnung .kopf td:nth-child(odd) {{ color: #666; width: 22%; }}
  .lohnabrechnung .kopf td:nth-child(even) {{ font-weight: 600; width: 28%; }}
  .lohnabrechnung h3 {{
    font-size: 11pt; margin: 18pt 0 6pt; padding-bottom: 3pt;
    border-bottom: 1px solid #999; text-transform: uppercase;
    letter-spacing: 0.3pt;
  }}
  .lohnabrechnung table.main {{
    width: 100%; border-collapse: collapse; margin-top: 2pt;
  }}
  .lohnabrechnung table.main th {{
    font-size: 8.5pt; font-weight: 600; text-align: left;
    background: #f2f2f2; padding: 4pt 6pt; border-bottom: 1px solid #999;
    text-transform: uppercase; letter-spacing: 0.3pt;
  }}
  .lohnabrechnung table.main td {{
    padding: 3pt 6pt; border-bottom: 1px solid #eee;
  }}
  .lohnabrechnung table.main tbody tr:nth-child(even) {{ background: #fafafa; }}
  .lohnabrechnung table.main .num {{
    text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap;
  }}
  .lohnabrechnung table.main tfoot td {{
    border-top: 2px solid #111; border-bottom: none;
    padding-top: 5pt; font-weight: 700;
  }}
  .lohnabrechnung .la-nr {{ color: #888; font-variant-numeric: tabular-nums; }}
  .lohnabrechnung .total-row td {{
    background: #f7f7f7; font-weight: 700; border-top: 1px solid #111;
  }}
  .lohnabrechnung .netto-box {{
    background: #e8f5e9; border: 2px solid #2e7d32; border-radius: 4pt;
    padding: 10pt 14pt; margin: 14pt 0 6pt; display: flex;
    justify-content: space-between; align-items: center;
  }}
  .lohnabrechnung .netto-box .label {{ font-size: 11pt; font-weight: 600; }}
  .lohnabrechnung .netto-box .value {{
    font-size: 18pt; font-weight: 700; font-variant-numeric: tabular-nums;
    color: #1b5e20;
  }}
  .lohnabrechnung .cap-note {{
    color: #c62828; font-size: 8pt; font-style: italic;
  }}
  .lohnabrechnung footer {{
    margin-top: 18pt; padding-top: 8pt; border-top: 1px solid #ccc;
    font-size: 7.5pt; color: #666; line-height: 1.4;
  }}
  .lohnabrechnung footer p {{ margin: 2pt 0; }}

  @media print {{
    body * {{ visibility: hidden !important; }}
    .lohnab-print-scope, .lohnab-print-scope * {{ visibility: visible !important; }}
    .lohnab-print-scope {{
      position: absolute !important; left: 0; top: 0; width: 100%;
    }}
    .lohnab-hint {{ display: none !important; }}
    .lohnabrechnung {{
      box-shadow: none !important; border: none !important;
      margin: 0 !important; padding: 8mm 10mm !important; max-width: 100% !important;
    }}
    @page {{ size: A4; margin: 10mm; }}
  }}
</style>

<div class="lohnab-hint">
  💡 <b>Drucken oder als PDF speichern:</b>
  Browser-Druckfunktion (Strg/Cmd + P) — dank <code>@media print</code>
  wird nur die Abrechnung gedruckt.
</div>

<div class="lohnab-print-scope">
<div class="lohnabrechnung">

  <header>
    <div class="title">Lohnabrechnung</div>
    <div class="subtitle">Abrechnungszeitraum: {_monat}</div>
    <table class="kopf">
      <tr><td>Mitarbeiter:in</td><td>{_name}</td>
          <td>Personalnummer</td><td>{_pers}</td></tr>
      <tr><td>Entgeltgruppe</td><td>EG 5 Stufe 2</td>
          <td>Steuerklasse</td><td>I (keine Kinder)</td></tr>
      <tr><td>Tabellenentgelt (Monat)</td><td>{_fmt_eur(3201.87)} EUR</td>
          <td>Grundlohn (Stunde)</td><td>{_fmt_eur(entgelt['grundlohn'])} EUR</td></tr>
      <tr><td>Zuschlagsbasis (Stufe 3)</td><td>{_fmt_eur(entgelt['zuschlagsbasis'])} EUR/h</td>
          <td>Wochenarbeitszeit</td><td>38,5 h</td></tr>
      <tr><td>Abrechnung erstellt am</td><td>{_heute}</td>
          <td>Tarif</td><td>HTV p.A.</td></tr>
    </table>
  </header>

  <h3>Tätigkeitsnachweis</h3>
  <table class="main">
    <thead>
      <tr>
        <th>#</th><th>Datum</th><th>Wochentag</th>
        <th>Beginn</th><th>Ende</th>
        <th class="num">Std.</th><th class="num">Fahrt</th>
        <th>KV</th><th class="num">Brutto-Basis</th>
      </tr>
    </thead>
    <tbody>
      {''.join(_schicht_rows)}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="5">Summe</td>
        <td class="num">{_fmt_h(_agg['total_h'])}</td>
        <td class="num">—</td><td>—</td>
        <td class="num">{_fmt_eur(_agg['brutto_basis'])}</td>
      </tr>
    </tfoot>
  </table>

  <h3>Brutto-Bezüge nach Lohnart</h3>
  <table class="main">
    <thead>
      <tr>
        <th>LA</th><th>Bezeichnung</th>
        <th class="num">Stunden</th><th class="num">Satz (€/h)</th>
        <th class="num">Betrag (€)</th>
      </tr>
    </thead>
    <tbody>
      {''.join(_lohnart_rows)}
      <tr>
        <td class="la-nr">200</td>
        <td>Wechselschichtzulage (§ 7 Abs. 5){_cap_note}</td>
        <td class="num">{_fmt_h(_agg['total_h'])}</td>
        <td class="num">0,63</td>
        <td class="num">{_fmt_eur(_agg['wechselschicht'])}</td>
      </tr>
      <tr>
        <td class="la-nr">201</td>
        <td>Organisationszulage (§ 7 Abs. 7)</td>
        <td class="num">{_fmt_h(_agg['total_h'])}</td>
        <td class="num">0,20</td>
        <td class="num">{_fmt_eur(_agg['organisation'])}</td>
      </tr>
    </tbody>
    <tfoot>
      <tr class="total-row">
        <td colspan="4">Brutto-Bezüge gesamt</td>
        <td class="num">{_fmt_eur(_agg['monats_brutto'])}</td>
      </tr>
    </tfoot>
  </table>

  <h3>Gesetzliche Abzüge (Arbeitnehmer-Anteil)</h3>
  <table class="main">
    <thead>
      <tr>
        <th>Art</th><th>Bezeichnung</th>
        <th class="num">Satz</th><th class="num">Bemessung (€)</th>
        <th class="num">Betrag (€)</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>KV</td><td>Krankenversicherung (allg.)</td>
          <td class="num">{_n['sv_saetze']['kv'] * 100:.2f}%</td>
          <td class="num">{_fmt_eur(_agg['monats_brutto'])}</td>
          <td class="num">{_fmt_eur(_n['sv_einzeln']['kv'])}</td></tr>
      <tr><td>KV-Z</td><td>Zusatzbeitrag KV</td>
          <td class="num">{_n['sv_saetze']['kv_zusatz'] * 100:.2f}%</td>
          <td class="num">{_fmt_eur(_agg['monats_brutto'])}</td>
          <td class="num">{_fmt_eur(_n['sv_einzeln']['kv_zusatz'])}</td></tr>
      <tr><td>PV</td><td>Pflegeversicherung</td>
          <td class="num">{_n['sv_saetze']['pv'] * 100:.2f}%</td>
          <td class="num">{_fmt_eur(_agg['monats_brutto'])}</td>
          <td class="num">{_fmt_eur(_n['sv_einzeln']['pv'])}</td></tr>
      <tr><td>PV-K</td><td>Kinderlosenzuschlag PV</td>
          <td class="num">{_n['sv_saetze']['pv_kinderlos'] * 100:.2f}%</td>
          <td class="num">{_fmt_eur(_agg['monats_brutto'])}</td>
          <td class="num">{_fmt_eur(_n['sv_einzeln']['pv_kinderlos'])}</td></tr>
      <tr><td>RV</td><td>Rentenversicherung</td>
          <td class="num">{_n['sv_saetze']['rv'] * 100:.2f}%</td>
          <td class="num">{_fmt_eur(_agg['monats_brutto'])}</td>
          <td class="num">{_fmt_eur(_n['sv_einzeln']['rv'])}</td></tr>
      <tr><td>AV</td><td>Arbeitslosenversicherung</td>
          <td class="num">{_n['sv_saetze']['av'] * 100:.2f}%</td>
          <td class="num">{_fmt_eur(_agg['monats_brutto'])}</td>
          <td class="num">{_fmt_eur(_n['sv_einzeln']['av'])}</td></tr>
      <tr class="total-row"><td colspan="4">SV-Beiträge gesamt ({_n['sv_satz_summe'] * 100:.2f}%)</td>
          <td class="num">{_fmt_eur(_n['sv_summe'])}</td></tr>
      <tr><td>LSt</td><td>Lohnsteuer (§ 32a EStG, BMF PAP 2026, SK I)</td>
          <td class="num">—</td>
          <td class="num">{_fmt_eur(_n['zvE_monat'])}</td>
          <td class="num">{_fmt_eur(_n['lst_monat'])}</td></tr>
      <tr><td>Soli</td><td>Solidaritätszuschlag</td>
          <td class="num">{_n['soli_satz'] * 100:.1f}%</td>
          <td class="num">{_fmt_eur(_n['lst_monat'])}</td>
          <td class="num">{_fmt_eur(_n['soli_monat'])}</td></tr>
    </tbody>
    <tfoot>
      <tr class="total-row"><td colspan="4">Abzüge gesamt</td>
          <td class="num">{_fmt_eur(_n['sv_summe'] + _n['lst_monat'] + _n['soli_monat'])}</td></tr>
    </tfoot>
  </table>

  <div class="netto-box">
    <div class="label">Auszahlungsbetrag (Netto)</div>
    <div class="value">{_fmt_eur(_n['netto'])} €</div>
  </div>

  <h3>Lohnsteuer-Herleitung</h3>
  <table class="main">
    <tbody>
      <tr><td>Brutto-Bezüge Monat</td>
          <td class="num">{_fmt_eur(_agg['monats_brutto'])} EUR</td></tr>
      <tr><td>./. Vorsorgeaufwand (= SV-Beiträge)</td>
          <td class="num">{_fmt_eur(_n['sv_summe'])} EUR</td></tr>
      <tr><td>./. Arbeitnehmer-Pauschbetrag / 12 (§ 9a EStG)</td>
          <td class="num">{_fmt_eur(_n['arbeitnehmer_pausch_monat'])} EUR</td></tr>
      <tr><td>zu versteuerndes Einkommen (Monat)</td>
          <td class="num">{_fmt_eur(_n['zvE_monat'])} EUR</td></tr>
      <tr><td>→ hochgerechnet × 12 (Jahresbetrag)</td>
          <td class="num">{_fmt_eur(_n['zvE_jahr'])} EUR</td></tr>
      <tr><td>Lohnsteuer/Jahr (§ 32a EStG, PAP 2026, SK I, Grundfreibetrag 12.348 €)</td>
          <td class="num">{_fmt_eur(_n['lst_jahr'])} EUR</td></tr>
      <tr class="total-row"><td>Lohnsteuer/Monat (÷ 12)</td>
          <td class="num">{_fmt_eur(_n['lst_monat'])} EUR</td></tr>
    </tbody>
  </table>

  <footer>
    <p><b>Rechtliche Grundlage:</b>
      Haustarifvertrag persönliche Assistenz vom 5. März 2020, inkl. 2. ÄnderungsTV gültig ab 1. Oktober 2023.
      Entgelt-Tabelle: Anlage C, gültig ab Februar 2025.
      SV-Beitragssätze 2026 (AOK/DRV). LSt nach BMF Programmablaufplan PAP 2026.</p>
    <p><b>Hinweis:</b>
      Dies ist eine <b>unverbindliche Simulation</b> — keine amtliche Lohnabrechnung.
      Im Zweifel gilt die offizielle Gehaltsabrechnung des Arbeitgebers. Lohnart-Nummern sind exemplarisch.</p>
    <p>Erzeugt am {_heute} · HTV-Monats-Rechner</p>
  </footer>

</div>
</div>
"""
        _lohnab = mo.Html(_html)
    _lohnab
    return


# ─────────────────────────────────────────────────────────────────────────────
# Dokumentation
# ─────────────────────────────────────────────────────────────────────────────
@app.cell(hide_code=True)
def _(entgelt, mo):
    z = entgelt["zuschlaege"]
    _saetze = mo.md(f"""
### Monats-Berechnung — Unterschiede zum Einzel-Rechner

1. **Wechselschichtzulage** (§ 7 Abs. 5 HTV) ist auf **max 105 EUR/Monat** gecappt.
   Im Einzel-Rechner wird sie pro Schicht ohne Cap gezeigt.
2. **Lohnsteuer** wird direkt auf das Monats-Brutto gerechnet (ueber zvE/Jahr nach § 32a EStG),
   nicht pro-rata wie im Einzel-Rechner.
3. **Organisationszulage** ist ungecappt (§ 7 Abs. 7).

### Verwendete Saetze

| Groesse | Wert |
|---|--:|
| Grundlohn (EG 5 Stufe 2) | {entgelt['grundlohn']:.2f} EUR/h |
| Zuschlagsbasis (EG 5 Stufe 3) | {entgelt['zuschlagsbasis']:.2f} EUR/h |
| Nachtzuschlag (21-6 h) | {z['nacht']:.2f} EUR/h |
| Samstagszuschlag (13-21 h) | {z['samstag']:.2f} EUR/h |
| Sonntagszuschlag | {z['sonntag']:.2f} EUR/h |
| Feiertag mit FZA | {z['feiertag_mit_fza']:.2f} EUR/h |
| Feiertag ohne FZA | {z['feiertag_ohne_fza']:.2f} EUR/h |
| KV-Zuschlag | {z['kurzfristig']:.4f} EUR/h |
| Wechselschichtzulage | 0,63 EUR/h (max 105 EUR/Monat) |
| Organisationszulage | 0,20 EUR/h |
""")

    _csv_format = mo.md(r"""
### CSV-Format (Schichtplaner-Import)

Header-Zeile mit folgenden Spalten (case-insensitive, Reihenfolge egal):

| Spalte(n) | Inhalt | Pflicht? |
|---|---|---|
| `beginn` / `start` / `von` | Beginn HH:MM | ja |
| `ende` / `end` / `bis` | Ende HH:MM | ja |
| `datum` / `date` | YYYY-MM-DD, DD.MM.YYYY, ... (Wochentag wird abgeleitet) | einer von beiden |
| `tag` / `wochentag` | Mo, Di, Mi, Do, Fr, Sa, So, Feiertag | einer von beiden |
| `kurzfristig` / `kv` | true/false, ja/nein, 1/0 | nein |
| `fahrtzeit` / `fahrt` | Stunden (Default 0) | nein |

Trennzeichen `,` oder `;` wird automatisch erkannt.
""")

    mo.accordion({
        "⚖️  Berechnungs-Unterschiede & HTV-Saetze": _saetze,
        "📄 CSV-Import Format": _csv_format,
    })
    return


if __name__ == "__main__":
    app.run()
