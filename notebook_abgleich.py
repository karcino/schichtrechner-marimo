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
def _(upload_csv):
    import htv_calc

    df_eigen = None
    fehler_eigen: list[str] = []

    if upload_csv.value:
        text = upload_csv.value[0].contents.decode("utf-8", errors="replace")
        schichten, fehler_eigen = htv_calc.parse_schicht_csv(text)
        import pandas as pd
        df_eigen = pd.DataFrame(schichten)
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
def _(upload_datev):
    import io
    import pdfplumber

    df_lohn = None
    if upload_datev.value:
        with pdfplumber.open(io.BytesIO(upload_datev.value[0].contents)) as pdf:
            seiten_text = [p.extract_text() or "" for p in pdf.pages]
        # TODO: DATEV-spezifischer Parser — Layout haengt vom AG ab.
        # Platzhalter: rohtext zeigen, bis Felder identifiziert sind.
        df_lohn = {"seiten": seiten_text}
    return (df_lohn,)


@app.cell
def _(df_lohn, mo):
    mo.stop(df_lohn is None, mo.md("_Noch keine DATEV-PDF geladen._"))
    mo.md(f"**Seiten:** {len(df_lohn['seiten'])}\n\n_Parser-TODO: Felder extrahieren._")
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
def _(upload_ag):
    import io
    import pdfplumber

    df_ag = None
    if upload_ag.value:
        with pdfplumber.open(io.BytesIO(upload_ag.value[0].contents)) as pdf:
            tabellen = []
            for p in pdf.pages:
                for tab in p.extract_tables() or []:
                    tabellen.extend(tab)
        # TODO: Tabellen -> DataFrame mit (datum, beginn, ende, typ)
        df_ag = {"rows": tabellen}
    return (df_ag,)


@app.cell
def _(df_ag, mo):
    mo.stop(df_ag is None, mo.md("_Noch keine AG-Schichtliste geladen._"))
    mo.md(f"**Zeilen roh:** {len(df_ag['rows'])}\n\n_Parser-TODO: Struktur finden._")
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
def _(df_ag, df_eigen, df_lohn):
    diffs: list[dict] = []
    if df_eigen is not None and df_ag is not None:
        # TODO: Join auf Datum, vergleich von (beginn, ende, typ).
        pass
    if df_lohn is not None and df_eigen is not None:
        # TODO: Summe eigener berechneter Bruttos vs. DATEV-Brutto.
        pass
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
    for i, d in enumerate(diffs, 1):
        msg = EmailMessage()
        msg["From"] = absender.value
        msg["To"] = empfaenger.value
        msg["Subject"] = f"Abrechnungs-Differenz {i}"
        msg.set_content(f"Hallo,\n\nDifferenz festgestellt:\n\n{d}\n\nBitte pruefen.\n")
        p = outbox / f"diff_{i:03d}.eml"
        p.write_bytes(bytes(msg))
        pfade.append(str(p))
    mo.md("**Geschrieben:**\n\n" + "\n".join(f"- `{p}`" for p in pfade))
    return


if __name__ == "__main__":
    app.run()
