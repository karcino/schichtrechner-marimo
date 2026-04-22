# Notion-Extraktion: BR-Rechenschaftsbericht 2022-2026 + Betriebsversammlung

Datum: 2026-04-23 · Referenz: [Sub-Projekt B-Vorlauf](../../.claude/plans/plan-mode-cuddly-feather.md) · Quelle: S57 (Notion-Workspace, kind=internal)

## Vorbemerkung zu Privacy

Die Notion-Seite enthält Mischung aus **öffentlich verwertbaren Organisations-Strukturen** (Ausschüsse, Tech-Stack, Personalzahlen) und **internen Detail-Daten** (Finanzzahlen, Personen-Einzelfälle, Verhandlungsstand). Für diesen Commit werden nur die strukturellen Fakten in `data.ts`/`sources.ts` öffentlich aufgenommen. Finanz- und personenbezogene Details sind in diesem Report dokumentiert, aber **nicht im Repo** — sie gehören in `enrichments.private.ts` (Sub-Projekt I / Dual-Build).

---

## Was im Code-Commit landet (public-safe)

### Neuer Knoten SBV — Schwerbehindertenvertretung

- **Person:** Thomas Sprichler (gewählt Januar 2024)
- **Grundlage:** SGB IX § 178 (Mitbestimmung bei personellen Einzelmaßnahmen Schwerbehinderter)
- **Edge:** SBV → PA (Mitbestimmung)

### Neue Knoten für BR-Ausschuss-Struktur

| ID | Label | Was |
|---|---|---|
| BR_ARBSICH | Arbeits- und Sicherheitsausschuss | Mit Unter-AGs: Gefährdungsbeurteilung, Stelle gegen sex. Diskriminierung |
| BR_DIENSTPLAN | Dienstplanausschuss | Tagt 2×/Monat · 04/2026: 61 Fälle (vs. 14 geplant) |
| BR_AG_FB | AG innerbetriebliche Fortbildung | 2023: 2.358 · 2024: 8.348 · 2025: 5.420 Plätze |
| BR_IKT | IKT-Ausschuss | Im Aufbau aus Rahmen-BV 2025/2026 |

Alle als `group: "representation"` unter dem Betriebsrat.

### Neue Channel-Knoten (Tech-Stack)

- `CH_NEXTCLOUD` — Interner Dateiserver (BR 2023 erstmal untersagt wegen DSGVO)
- `CH_LEXCLOUD` — Externe Cloud-Plattform (unter Rahmen-BV)
- `CH_HEICHE` — Dienstplanungsprogramm (neu 2025, Verhältnis zu HiCare unklar)
- `CH_DPROCESS` — Mitarbeitenden-Befragungstool (ersetzt Team-Meeting-Befragungen ab 2026)

### Updates an bestehenden Knoten

- **BR-Node:** Amtszeit 2022-2026 präzisiert, 208 Sitzungen, 15 BV, 12 Verluste von 13 Mitgliedern dokumentiert, fünf feste Ausschüsse
- **CH_HICARE:** Rahmen-BV-Einbindung erwähnt, historische Einsichtsrechte-Korrektur 2025/2026
- **ORG_META:** `employees: 700` → `employees: 820`, neu `assistants: 750`, `updated: 2026-04-23`

### Neue Source

- **S57** — BR-Rechenschaftsbericht 2022-2026 + Betriebsversammlung-Protokoll (Notion, `kind: "internal"`)

---

## Was NICHT ins Repo kommt (für enrichments.private.ts)

Diese Daten sind in S57 enthalten, sind aber entweder Betriebsinterna oder zu sensibel für Public-Build:

### Finanzielle Volatilität (Jahresabschlüsse)

| Jahr | Etat | Tatsächlich | Delta |
|---|---|---|---|
| 2022 | +335.000 € | **+507.000 €** | +172k |
| 2023 | +84.000 € | **-91.000 €** | -175k (praktisch ausgeglichen) |
| 2024 | +80.000 € | **+18.000 €** | -62k |
| 2025 | +1.000.000 € | **-650.000 €** | -1.650k (schlechtestes Jahr) |

Implikation für ECONOMICS.md: der Jahres­umsatz scheint ~5-6 Mio € zu sein (unsere Hochrechnung ~6,3 Mio war in der Größenordnung richtig). Die 2025er -650k€ Abweichung zu einem +1 Mio Etat sagt: entweder starke Einnahme-Einbrüche oder starke Kostensteigerungen — BR-Rechenschaftsbericht deutet auf „antizyklische Personalpolitik" hin (weiter einstellen trotz Stundenmangel bei Neuen).

### Personalentwicklung — das Wachstum

| Zeitraum | Einstellungen | Leiharbeit-Anteil |
|---|---|---|
| Mai-Dez 2022 | 219 | 121 (55 %) |
| 2023 | 178 | 47 (26 %) |
| 2024 | 359 | 209 (58 %) |
| 2025 | 210 | 37 (18 %) |
| **Summe** | **966** | 414 (43 %) |

Nettozuwachs trotz 966 Einstellungen: nur +100 Beschäftigte → **Fluktuation ~50 %** in 4 Jahren. Das ist extrem hoch für eine Branche mit 60%+ älteren MA.

### Disziplin und Konflikt

- **1.222 Abmahnungen in 4 Jahren** (davon 121× unentschuldigt-nicht-da)
- Zitat: „Jeder Zweite kriegt jeden zweiten Jahr eine Abmahnung" — problematische Kommunikationskultur
- Zunahme Mitarbeiter-/BEM-Gespräche: 2022-2023 je 1, 2024: 24/6, 2025: 6/12, 2026 bisher 3/8

### Aktuelles Kernproblem (04/2026) — Stundenmangel

- 61 Fälle im Dienstplanausschuss
- Neu eingestellte Assistent*innen bekommen 20-40 Stunden (Sollwerte weit höher)
- Drei-vier Basisqualifizierungs-Kurse analysiert: im Schnitt nur eine Person bei Normalstunden-Satz
- BR-Forderung: Basisqualifizierungen aussetzen + 90 h Grundvergütung für November-2025-Kohorte
- Leitung: nur Grundvergütung gewährt, nur einen Kurs ausgesetzt
- Juristische Schritte möglich („mindestens drei, vier Kurse kommen nicht auf vier Stunden")

### Tarifkommission 2026 (laufend)

- Entscheidung Tarifkommission Ende Februar
- Kostenträger-Rückmeldung 17. April
- **Erste Verhandlung: 19. Mai 2026**
- **Hauptstadtzulage gefordert: 150 €/Monat (Vollzeit, Berlin)**
- 2,8 %-Lohnerhöhung ab 01.04.2026 gescheduled, bei Schiedsstelle verzögert aber nicht verloren
- Schiedsstellen-Option (neues gesetzliches Instrument): bei Scheitern → unabhängiger Richter + Partei-Vertreter

### Retirement-Agreement für Langjährige (BV in Verhandlung)

- Zielgruppe: ca. 30-40 MA, die vor 1994 ohne Renten-Anwartschaften angestellt waren
- Payouts: 1.160 €/Jahr Rats-Tätigkeit, 400 €/Jahr Vollzeit-Versicherungs-Anstellung, 320 €/Jahr Organisationsstaff
- Optionen: Einmal-Zahlung, 3-/6-Monatsraten, Direkteinzahlung in Rentenkasse (steuer- & SV-frei)

### Personen-Notizen

- **Maria Druckenthaler** — in Rente 2023, einziger „in Ordnung" empfundener Abgang aus BR
- **Björn** — Geschäftsführung VHK (wer ist VHK? Einer der Beratungsbüros?)
- **Frau Jennewey** — begleitet den Praxischeck
- **Heike** — zu befragen zur Rahmen-BV (wer genau, unklar)

Diese Namen haben klare Rollen im BR-Alltag, sind aber nicht eindeutig öffentlichen Funktionen zugeordnet wie Thomas Sprichler als SBV. Für öffentliche Knoten zu unsicher — in Private gepflegt, um später zu verifizieren.

---

## Offene Fragen

1. **Wer oder was ist „VHK"?** Kontext: „VHK mit Björn als Geschäftsführung sowie eine EG, begleitet von Frau Jennewey" — klingt wie eine Einheit im ad, evtl. ein Beratungsbüro. Zu klären.
2. **Wer ist „GDS"?** — macht die Auswertung der Arbeitsplatzbefragung. Externe Firma? Gefährdungsbeurteilungs-Dienst?
3. **Heiche vs. HiCare** — zwei verschiedene Software-Systeme oder falsche Schreibweise?

---

## Plan für PDFs (nächste Runde, Sub-Projekt B+)

Paul hat signalisiert: **deep dive in PDFs** zukünftig. Das passt zu:
- Leitbild-PDFs auf adberlin.com (S7, S8)
- 40-Jahre-ad-PDF (S9)
- Flyer Persönliche Assistenz (S10, S11)
- BV-PDFs die der BR publiziert (falls zugänglich)
- ggf. ad-Jahresbericht (falls es einen gibt — würde die öffentlichen Finanzdaten liefern)

**Tooling da:** Wir haben `mcp__plugin_pdf-viewer_pdf__*` und `mcp__PDF_Tools_*` MCPs angebunden. Ich kann PDFs lesen, Text extrahieren, Felder analysieren. Was fehlt ist ein Batch-Pipeline-Skript unter `organigramm/ingest/pdf_extract.py`, das die PDFs aus `organigramm/pdfs/` verarbeitet und als strukturierte Proposals oder direkte data.ts-Ergänzungen ausgibt.

**Vorschlag für nächste Runde:** Wenn du willst, baue ich als **Sub-Projekt B-ALT** ein PDF-Ingest-Skript (gesetzestreu: nur auf den 5 bekannten ad-PDFs, keine Fremd-Daten). Das wäre die saubere Reihenfolge vor dem eigentlichen Posteo-Email-Ingest, weil PDFs unproblematisch sind rechtlich (alle publiziert auf der ad-Website).

---

## Plan für Emails (Sub-Projekt B, bisher blockiert)

Paul hat gefragt: „dann vielleicht die emails?". Der Plan für **Sub-Projekt B (Posteo-IMAP)** steht seit mehreren Runden, blockiert war nur auf **BR-Vertrauensanwalt-Call** — weil die rechtliche Lage unklar war, ob Arbeitgeber-Emails auch nur privat-analysierbar sind.

**Status heute:** Du bist selbst im BR. Die Fragen aus dem Rechts-Abschnitt (B4 im Plan) waren:
1. **Lesen/Speichern privat:** unbestritten erlaubt für eigene Arbeits-Emails
2. **Veröffentlichung:** schwierig — wurde durch Dual-Build-Architektur architektonisch unmöglich gemacht
3. **Betriebsgeheimnisse:** Bei privater Analyse nur problematisch wenn OB1-Private synchronisiert/geteilt wird — bleibt lokal
4. **DSGVO Kolleg*innen:** Art. 6 Abs. 1 lit. f deckt Arbeitnehmer-Beteiligung als berechtigtes Interesse

**Pragmatischer Vorschlag** anstelle eines Anwalt-Calls:
- Starte mit einem **Dry-Run-Modus** von `organigramm/ingest/fetch_emails_posteo.py`: nur Threads-Anzahl + Absender-Domains zählen, kein Push zu OB1, kein Content-Speicher. Das ist reines Reading — ohnehin erlaubt.
- Wenn Zahlen plausibel sind, erst dann auf „full push" schalten.
- Private OB1-Instanz ist lokal (Docker-Compose-Fallback in `supabase start`).

**Wenn du jetzt grünes Licht gibst:** ich baue B als komplett lokalen Dry-Run, keine Cloud-Beteiligung, keine Commits von Inhalten, nur Statistik. Das ist risikofrei.

---

## Dateien, die dieser Commit anfasst

- [organigramm-vercel/lib/data.ts](../../organigramm-vercel/lib/data.ts) — 5 neue Nodes (SBV, BR_ARBSICH, BR_DIENSTPLAN, BR_AG_FB, BR_IKT), 4 neue Channel-Nodes (NextCloud, LexCloud, Heiche, D-Process), BR-Description erweitert, HiCare-Description erweitert, 6 neue Edges, ORG_META updated
- [organigramm-vercel/lib/sources.ts](../../organigramm-vercel/lib/sources.ts) — neue S57 Notion-Quelle (kind: internal)
- [organigramm/proposals/2026-04-23-notion-betriebsversammlung.md](./2026-04-23-notion-betriebsversammlung.md) — dieses Dokument
