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
    return (BEISPIEL_CSV, berechne_monats_netto, berechne_schicht,
            cap_monats_zulagen, entgelt, lst, parse_schicht_csv, sv)


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
