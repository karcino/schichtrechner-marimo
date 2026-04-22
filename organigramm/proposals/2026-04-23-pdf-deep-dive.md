# PDF Deep-Dive — Runde 1 (5 bekannte ad-PDFs)

Datum: 2026-04-23 · Werkzeug: [`kit pdf batch`](~/Desktop/Code_Projects/kit/src/kit/pdf/) · Input: [`organigramm/pdfs/ad-urls.txt`](../pdfs/ad-urls.txt) · Output: [`organigramm/pdfs/ad-pdfs-extract.md`](../pdfs/ad-pdfs-extract.md)

## Ergebnis-Übersicht

| PDF | Seiten | Author | Erstellt | Verwertbar |
|---|---|---|---|---|
| Leitbild (Handlungsgrundlagen) — S7 | 5 | Martin | 17.01.2012 | ✅ Textreich |
| Leitbild (Umfassende Positionen) — S8 | 10 | Martin | 17.01.2012 | ✅ Textreich |
| 40-Jahre-ad — S9 | 2 | Martin | 11.05.2021 | ✅ Textreich |
| Flyer Persönliche Assistenz — S10 | 2 | (PDF24 Creator) | 05.09.2023 | ⚠ Bild-PDF, Text leer |
| Flyer Persönliches Budget — S11 | 2 | (PDF24 Creator) | 05.09.2023 | ⚠ Bild-PDF, Text leer |

Alle Downloads erfolgreich. 5/5 extrahiert. Die Flyer sind reine Bild-Layouts (kein durchsuchbarer Text) — für die Flyer würden OCR-Runs (separater Schritt mit `tesseract`) die richtige Werkzeugwahl sein, nicht prioritär.

## Neue Knoten-Inhalte aus den 3 Textpdfs

### ASS-Knoten angereichert

Die **5 Kompetenzen** des/der Assistenznehmer\*in sind der ideologische Kern, wie ad e.V. Persönliche Assistenz definiert. Aus Leitbild_Handlungsgrundlagen (S7, 2012):

1. **Personalkompetenz** — Auswahl aus MitarbeiterInnen-Pool
2. **Zeitkompetenz** — wann gearbeitet wird
3. **Ortskompetenz** — wo
4. **Anleitungskompetenz** — wie
5. **Finanzkompetenz** — Verwendung der Mittel

**Gegenseitigkeit**: Auch Assistent\*innen dürfen Einsätze ablehnen — nicht bekannt, aber konzeptionell wichtig.

**LK 32** (Leistungskomplex 32) ist der konkrete Abrechnungs-Code für Persönliche Assistenz, stundenweise Vergütung. Bestätigt S56 (Hilfelotse: 50 €/h).

→ ASS-Knoten-Description in [data.ts](../../organigramm-vercel/lib/data.ts) entsprechend ergänzt.

### Historische Zahlen-Timeline

| Jahr | Quelle | Kund\*innen | Mitarbeiter\*innen |
|---|---|---|---|
| 2006 (25 Jahre Bestehen) | Leitbild Umfassende Positionen (S8) | ~100 | **~600** |
| 2021 (40 Jahre) | 40-Jahre-PDF (S9) | >100 | **~650** |
| 2026 (heute) | BR-Bericht (S57) | ~100 | **820** |

**Trend:** Kund\*innen-Zahl stabil bei 100, MA-Zahl wächst von 600 (2006) auf 820 (2026) — +220 MA in 20 Jahren = ca. 11 MA/Jahr im Durchschnitt. Der Schub +170 MA seit 2021 (in 5 Jahren) ist deutlich beschleunigt — ~34 MA/Jahr, passt zur BR-Bericht-Aussage „985 Einstellungen in 4 Jahren".

### Historische Meilensteine (40-Jahre-PDF)

Für spätere Timeline-View (V2-PROPOSALS #5) relevant:

- **8. Mai 1981** — Gründung (gewähltes Datum: Jahrestag Ende 2. Weltkrieg / Tag der Befreiung)
- **West-Berlin-Sondersituation** — keine Wehrpflicht → keine Zivis → Assistenz als Studijobs
- **Frühe 1990er** — Existenz-Krise: Finanzamt + AOK sahen Assistenz als sv-pflichtig → enormer Nachzahlungs-Druck
- **Mid-1990er (Pflegeversicherungs-Einführung)** — Durchsetzung von **LK 32** (Leistungskomplex „Persönliche Assistenz") als Rettung vor dem Modulsystem
- **2020** — 3. Stufe BTHG in Kraft, Eingliederungshilfe/Assistenz entkoppelt vom Sozialhilfekomplex
- **"Assistenz im Krankenhaus"** — dauerhafter Konflikt mit Sozialhilfeträgern, der sich durch 40 Jahre zieht

### Martin — der Author

Alle drei Textpdfs haben "Martin" als Author-Metadatum (Leitbild × 2 in 2012, 40-Jahre-PDF in 2021). Konsistent über 9 Jahre = langjährige Person im ad-Kontext, publiziert Leitbild-Dokumente und Jubiläums-Texte.

**Kandidaten-Check:**
- Nicht **Matthias Vernaldi** (Vorname passt nicht, Vernaldi mit zwei -nn- und anderem Vornamen)
- Könnte **Martin Marquard** sein — bekannter Aktivist der Selbstbestimmt-Leben-Bewegung in Berlin, publiziert regelmäßig zu Assistenzthemen
- Alternativ: ein interner Autor, dessen Name im Impressum nicht publiziert wurde

**Empfehlung:** Paul weiß vermutlich, wer "Martin" ist — bitte in einem späteren Proposals-Update eintragen. Nicht in data.ts auf Vermutungs-Basis.

## Flyer-Problem (S10, S11)

Die beiden Flyer-PDFs lieferten **kein extrahierbarer Text** — PDF24 Creator produziert offenbar Bild-PDFs ohne Text-Layer. Für Inhalts-Extraktion bräuchte es einen OCR-Schritt:

```bash
# Später als eigener kit-Befehl: kit pdf ocr URL → deutsches Tesseract-Model
# Hier OK: Flyer haben ohnehin mehr Marketing- als Struktur-Info
```

Nicht als blockierend eingestuft. Wenn später im Zusammenhang mit **kit pdf ocr** gebaut, hohes Re-Use-Potenzial für andere Bild-Dokumente.

## Tool-Rückmeldung `kit pdf`

- **Positiv:** funktioniert auf alle 5 PDFs, pdfplumber + pypdf liefern konsistent Metadaten + Text
- **Verbesserungs-Idee:** `--pages N` Flag wäre nützlich, um nur bestimmte Seiten zu extrahieren (für lange PDFs)
- **Verbesserungs-Idee:** `kit pdf ocr` als Subkommando für Bild-PDFs (tesseract + deutsches Model)
- **Nicht implementiert:** MCP-Server-Integration in `kit mcp_server.py` — wenn gewünscht, als separates Commit hinzufügen, damit Claude Code direkt `kit pdf extract URL` über MCP aufrufen kann

## Dateien, die dieser Commit anfasst

- `~/Desktop/Code_Projects/kit/src/kit/pdf/` — neues Subpackage `__init__.py`, `core.py`, `commands.py`
- `~/Desktop/Code_Projects/kit/src/kit/cli.py` — PDF-Typer-App registriert
- `~/Desktop/Code_Projects/kit/pyproject.toml` — pdfplumber, pypdf, pyyaml (bug-fix) als Deps
- [organigramm-vercel/lib/data.ts](../../organigramm-vercel/lib/data.ts) — ASS-Knoten mit 5-Kompetenzen + LK 32 angereichert
- [organigramm/pdfs/ad-urls.txt](../pdfs/ad-urls.txt) — Liste der 5 ad-PDFs
- [organigramm/pdfs/ad-pdfs-extract.md](../pdfs/ad-pdfs-extract.md) — Batch-Extract-Output
- [organigramm/proposals/2026-04-23-pdf-deep-dive.md](./2026-04-23-pdf-deep-dive.md) — dieses Dokument

## Nächste Schritte für PDFs

1. **OCR-Subkommando** `kit pdf ocr` bauen für Bild-PDFs (Flyer) — optional
2. **MCP-Integration** in kit — erlaubt Claude-Code-Sessions direkten `kit pdf extract`-Zugriff
3. **Andere Quellen-Seiten als PDF-Quelle** — Betriebsrat-ad.de publiziert öfter PDFs (BV-Dokumente, Haustarif-Texte), die via `kit pdf extract URL` batch-verarbeitbar sind
4. **BR-publizierter Haustarifvertrag** — S24 hat einen Link auf betriebsrat-ad.de/haustarifvertrag/, aber unklar ob dort ein direktes PDF liegt. Deep-Link-Check lohnenswert.
