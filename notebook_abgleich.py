"""HTV-Abgleich-Pipeline — marimo notebook (lokal).

Verkettet die komplette Abrechnungs-Pruefung als reaktive Pipeline:

    1. eigene Schicht-CSV             -> df_eigen
    2. DATEV-Lohnabrechnung (PDF)     -> df_lohn
    3. AG-Schichtenliste (PDF)        -> df_ag
    4. Abgleich + Differenzen         -> df_diff
    5. Mail-Entwuerfe (.eml)          -> outbox/

Nicht WASM-faehig (PDF-Parsing + Dateisystem). Nur lokal:

    uv sync --extra abgleich
    uv run marimo edit notebook_abgleich.py

Dieses Notebook wird NICHT via build_wasm.py exportiert.
"""

import marimo

__generated_with = "0.16.0"
app = marimo.App(width="medium", app_title="HTV Abgleich-Pipeline")


@app.cell(hide_code=True)
def _():
    import marimo as mo

    return (mo,)


@app.cell(hide_code=True)
def _():
    import io
    import pandas as pd
    import pdfplumber

    import htv_calc
    return htv_calc, io, pd, pdfplumber


@app.cell(hide_code=True)
def _(mo):
    mo.md(
        r"""
        # 🔁 HTV-Abgleich-Pipeline

        **Nur lokal** — verarbeitet PDF-Lohnabrechnung + AG-Schichtliste und
        erzeugt Mail-Entwuerfe bei Differenzen.

        Benoetigt optionale Dependencies:

        ```bash
        uv sync --extra abgleich
        ```
        """
    )
    return


# ─────────────────────────────────────────────────────────────────────────────
# 1) Eigene Schicht-Aufzeichnung (CSV)
# ─────────────────────────────────────────────────────────────────────────────
@app.cell(hide_code=True)
def _(mo):
    mo.md("## 1️⃣ Eigene Schicht-Aufzeichnung (CSV)")
    return


@app.cell
def _(mo):
    upload_csv = mo.ui.file(
        filetypes=[".csv"],
        label="Eigene Schicht-CSV hochladen",
        kind="area",
    )
    upload_csv
    return (upload_csv,)


@app.cell
def _(htv_calc, pd, upload_csv):
    df_eigen = None
    fehler_eigen: list[str] = []

    if upload_csv.value:
        _text = upload_csv.value[0].contents.decode("utf-8", errors="replace")
        _schichten, fehler_eigen = htv_calc.parse_schicht_csv(_text)
        df_eigen = pd.DataFrame(_schichten)
    return df_eigen, fehler_eigen


@app.cell
def _(df_eigen, mo):
    mo.stop(df_eigen is None, mo.md("_Noch keine eigene CSV geladen._"))
    df_eigen
    return


# ─────────────────────────────────────────────────────────────────────────────
# 2) DATEV-Lohnabrechnung (PDF)
# ─────────────────────────────────────────────────────────────────────────────
@app.cell(hide_code=True)
def _(mo):
    mo.md(
        r"""
        ## 2️⃣ DATEV-Lohnabrechnung (PDF)

        Liest Brutto, Zuschlaege und Stunden aus der monatlichen DATEV-PDF.
        """
    )
    return


@app.cell
def _(mo):
    upload_datev = mo.ui.file(
        filetypes=[".pdf"],
        label="DATEV-Lohnabrechnung (PDF) hochladen",
        kind="area",
    )
    upload_datev
    return (upload_datev,)


@app.cell
def _(io, pdfplumber, upload_datev):
    df_lohn = None
    if upload_datev.value:
        with pdfplumber.open(io.BytesIO(upload_datev.value[0].contents)) as _pdf:
            _seiten = [_page.extract_text() or "" for _page in _pdf.pages]
        # Roh-Container: Parser (Brutto/Zuschlaege/Stunden) folgt, sobald
        # DATEV-Layout auf realer Abrechnung verifiziert ist.
        df_lohn = {"seiten": _seiten}
    return (df_lohn,)


@app.cell
def _(df_lohn, mo):
    mo.stop(df_lohn is None, mo.md("_Noch keine DATEV-PDF geladen._"))
    _vorschau = [
        mo.accordion({f"Seite {_i + 1} ({len(_t)} Zeichen)": mo.md(f"```\n{_t}\n```")})
        for _i, _t in enumerate(df_lohn["seiten"])
    ]
    mo.vstack([
        mo.md(f"**{len(df_lohn['seiten'])} Seiten** geladen. Roh-Text ausklappen:"),
        *_vorschau,
    ])
    return


# ─────────────────────────────────────────────────────────────────────────────
# 3) AG-Schichtenliste (PDF)
# ─────────────────────────────────────────────────────────────────────────────
@app.cell(hide_code=True)
def _(mo):
    mo.md("## 3️⃣ Schichtenliste vom Arbeitgeber (PDF)")
    return


@app.cell
def _(mo):
    upload_ag = mo.ui.file(
        filetypes=[".pdf"],
        label="AG-Schichtenliste (PDF) hochladen",
        kind="area",
    )
    upload_ag
    return (upload_ag,)


@app.cell
def _(io, pdfplumber, upload_ag):
    df_ag = None
    if upload_ag.value:
        with pdfplumber.open(io.BytesIO(upload_ag.value[0].contents)) as _pdf:
            _tab_pro_seite: list[list[list]] = []
            _text_pro_seite: list[str] = []
            for _page in _pdf.pages:
                _tab_pro_seite.append(_page.extract_tables() or [])
                _text_pro_seite.append(_page.extract_text() or "")
        # Roh-Container: Tabellen pro Seite + Fallback-Text. Parser
        # (datum, beginn, ende, typ) folgt, sobald reale Schichtliste vorliegt.
        df_ag = {"tabellen_pro_seite": _tab_pro_seite, "text_pro_seite": _text_pro_seite}
    return (df_ag,)


@app.cell
def _(df_ag, mo, pd):
    mo.stop(df_ag is None, mo.md("_Noch keine AG-Schichtliste geladen._"))

    _panels = {}
    for _seite_idx, _tabellen in enumerate(df_ag["tabellen_pro_seite"]):
        _label = f"Seite {_seite_idx + 1}"
        if not _tabellen:
            _panels[_label] = mo.md("_Keine Tabelle erkannt._")
            continue
        _views = []
        for _t_idx, _tab in enumerate(_tabellen):
            _df = pd.DataFrame(_tab[1:], columns=_tab[0]) if _tab and len(_tab) > 1 else pd.DataFrame(_tab)
            _views.append(mo.md(f"**Tabelle {_t_idx + 1}** ({_df.shape[0]} × {_df.shape[1]})"))
            _views.append(_df)
        _panels[_label] = mo.vstack(_views)

    _gesamt = sum(len(t) for t in df_ag["tabellen_pro_seite"])
    mo.vstack([
        mo.md(f"**{len(df_ag['tabellen_pro_seite'])} Seiten · {_gesamt} Tabellen** erkannt."),
        mo.accordion(_panels),
    ])
    return


# ─────────────────────────────────────────────────────────────────────────────
# 4) Abgleich + Differenzen
# ─────────────────────────────────────────────────────────────────────────────
@app.cell(hide_code=True)
def _(mo):
    mo.md(
        r"""
        ## 4️⃣ Abgleich & Differenzen

        Vergleicht Schichten (eigen vs. AG) und Brutto (berechnet vs. DATEV).
        """
    )
    return


@app.cell
def _(mo):
    toleranz_min = mo.ui.number(
        start=0, stop=30, step=1, value=5,
        label="Zeit-Toleranz (Minuten) — Beginn/Ende gleich, wenn Abweichung ≤ Toleranz",
    )
    toleranz_brutto = mo.ui.number(
        start=0.0, stop=50.0, step=0.5, value=1.0,
        label="Brutto-Toleranz (EUR) — Summe gleich, wenn Abweichung ≤ Toleranz",
    )
    mo.hstack([toleranz_min, toleranz_brutto])
    return toleranz_brutto, toleranz_min


@app.cell
def _(df_ag, df_eigen, df_lohn, toleranz_brutto, toleranz_min):
    # Entscheidungsrahmen fuer die Diff-Heuristik:
    # - Schicht-Diff: Outer-Join auf Datum. Differenz, wenn Schicht nur einseitig
    #   existiert, oder wenn Beginn/Ende um > toleranz_min abweichen, oder wenn
    #   Typ (Nacht/Samstag/Sonntag/Feiertag) nicht uebereinstimmt.
    # - Brutto-Diff: Summe eigener berechneter Bruttos vs. DATEV-Brutto.
    #   Differenz, wenn |eigen - datev| > toleranz_brutto.
    # Umsetzung folgt, sobald df_ag (Schichten als DataFrame) und df_lohn
    # (Brutto-Summe) strukturiert vorliegen.

    diffs: list[dict] = []
    _tol_min = toleranz_min.value
    _tol_eur = toleranz_brutto.value

    if df_eigen is not None and df_ag is not None and isinstance(df_ag, dict):
        pass  # df_ag ist noch Roh-Container — wartet auf Parser
    if df_lohn is not None and df_eigen is not None and isinstance(df_lohn, dict):
        pass  # df_lohn ist noch Roh-Container — wartet auf Parser

    return (diffs,)


@app.cell
def _(diffs, mo):
    mo.stop(not diffs, mo.md("_Keine Differenzen erkannt (oder noch keine Daten)._"))
    diffs
    return


# ─────────────────────────────────────────────────────────────────────────────
# 5) Mail-Entwuerfe
# ─────────────────────────────────────────────────────────────────────────────
@app.cell(hide_code=True)
def _(mo):
    mo.md(
        r"""
        ## 5️⃣ Mail-Entwuerfe

        Erzeugt `.eml`-Dateien in `outbox/` — manuell in Outlook/Thunderbird oeffnen
        und absenden. **Kein** direkter SMTP-Versand (bewusst: Review vor Versand).
        """
    )
    return


@app.cell
def _(mo):
    empfaenger = mo.ui.text(label="An (Verantwortlicher)", placeholder="lohn@arbeitgeber.de")
    absender = mo.ui.text(label="Von", placeholder="du@example.com")
    btn = mo.ui.run_button(label="Mail-Entwuerfe erzeugen")
    mo.hstack([empfaenger, absender, btn])
    return absender, btn, empfaenger


@app.cell
def _(absender, btn, diffs, empfaenger, mo):
    from email.message import EmailMessage
    from pathlib import Path

    mo.stop(not btn.value, mo.md("_Button druecken, sobald Diffs vorliegen._"))
    mo.stop(not diffs, mo.md("_Keine Diffs — kein Mail-Entwurf noetig._"))

    outbox = Path("outbox")
    outbox.mkdir(exist_ok=True)
    pfade = []
    for _i, _d in enumerate(diffs, 1):
        _msg = EmailMessage()
        _msg["From"] = absender.value
        _msg["To"] = empfaenger.value
        _msg["Subject"] = f"Abrechnungs-Differenz {_i}"
        _msg.set_content(f"Hallo,\n\nDifferenz festgestellt:\n\n{_d}\n\nBitte pruefen.\n")
        _p = outbox / f"diff_{_i:03d}.eml"
        _p.write_bytes(bytes(_msg))
        pfade.append(str(_p))
    mo.md("**Geschrieben:**\n\n" + "\n".join(f"- `{_p}`" for _p in pfade))
    return


if __name__ == "__main__":
    app.run()
