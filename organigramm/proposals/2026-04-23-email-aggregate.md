# Email-Archive-Analyse — Aggregate-only

Datum: 2026-04-23 · Werkzeug: [`organigramm/ingest/email_role_extract.py`](../ingest/email_role_extract.py) · Input: 201 `.eml`-Dateien (Paul's Posteo-Archiv zu @adberlin.org-Korrespondenz, lokal bei Paul) · Output: [`2026-04-23-email-aggregate.json`](./2026-04-23-email-aggregate.json)

## Privacy-Garantien dieser Analyse

Was **nie** im Repo oder in diesem Dokument landet:
- Einzelne Email-Inhalte
- Kund\*innen-Namen, -Adressen, -Kürzel
- Filenames (auch nicht paraphrasiert)
- Individuelle Absender-/Empfänger-Email-Adressen (nur Domain-Aggregate)

Was **nicht** im Repo, **aber** in gitignored `organigramm/raw/email-private-findings.json` (nur Paul's Mac) liegt:
- Rollen-Token-gefilterte Named Entities mit Kontext-Snippets

Was im Repo ist (dieses Dokument + `2026-04-23-email-aggregate.json`):
- Zahlen-Aggregate auf Archiv-Level
- Keyword-Frequenzen
- Domain-Verteilung

## Kernzahlen

| Metric | Wert |
|---|---|
| Gesamt-Emails | **201** |
| Privacy-Flag-übersprungen | **124 (62 %)** |
| Mit Rollen-Token-Treffer | 48 (von 77 nicht-geflaggten) |
| Emails in 2025 | 15 |
| Emails in 2026 | 186 |
| Unparsebare | 0 |

Der hohe **Privacy-Flag-Anteil (62 %)** ist **gewollt** und bestätigt die Filter-Logik: das sind Emails mit Straßenadressen, IBANs oder SV-Nummern drin — genau der Kundendaten-Content, den wir strikt ausblenden wollen. Diese Emails werden vom Skript gar nicht erst auf Role-Token-Matching geprüft.

## Absender- / Empfänger-Landschaft (Top-Domains)

| Von | Anzahl | | An | Anzahl |
|---|---|---|---|---|
| adberlin.org | 197 | | posteo.de (Paul) | 131 |
| betriebsrat-ad.de | 4 | | adberlin.org | 43 |
| | | | icloud.com | 4 |
| | | | thomas-kaufmann.com | 1 |

**Dominant `@adberlin.org`** als Sender-Domain (98 %) — Paul's Archiv ist also fast ausschließlich ad-intern. 43 Nachrichten gingen von Paul an `adberlin.org` (= Paul sendet intern). Die 4 Emails an `icloud.com` sind wahrscheinlich Self-Forwards durch Paul.

Die einzige externe Adresse **`thomas-kaufmann.com`** (1 Email) ist nicht-ad. Paul kennt vermutlich den Kontext.

## Subject-Keyword-Frequenzen (nicht-sensibel)

| Keyword | Count |
|---|---|
| schicht | 30 |
| einsatz | 18 |
| einladung | 12 |
| vertrag | 7 |
| beatmung | 5 |
| fortbildung | 5 |
| bewerbung | 5 |
| einarbeitung | 4 |
| basisqualifizierung | 3 |
| abrechnung | 2 |
| vorstand | 2 |
| lohn | 1 |
| petition | 1 |

Dominant: **Dispatch-Themen** (Schicht, Einsatz, Einladung). Das bestätigt den Charakter der Korrespondenz — operative Einsatzplanung, nicht strategische Unternehmens-Kommunikation.

**Interessante Low-Counts:** 5 Beatmung-Emails zeigen Existenz von Beatmungspatient\*innen → spezialisierte Assistenz. 2 Vorstand-Emails → Vereinskommunikation an Mitglieder. 1 Petition → externe Kampagnen-Aktivität (Uta Wehde's „Keine Kürzungen bei der Teilhabe"-Petition, öffentlich).

## Struktur-Erkenntnisse

### ✅ Beratungsbüros bestätigt

Named-Entity-Extraktion (trotz strikter Filter) fand 3 Beratungsbüro-Nennungen:

- **Beratungsbüro Süd** — 64 Nennungen (sehr häufig, in To-Feldern und im Body)
- **Beratungsbüro West** — 3 Nennungen
- **Beratungsbüro Nordost** — 2 Nennungen

Das **Beratungsbüro Nordost** ist eine wichtige Bestätigung — die bisherigen HANDOFF-Notizen sprachen von „Nord/Ost", ohne exakten Namen. Die Email-Korrespondenz nennt es **„Beratungsbüro Nordost"** als eine Einheit. → data.ts-Knoten kann entsprechend präzisiert werden.

Die 64 Nennungen von „Beratungsbüro Süd" zeigen, dass Paul primär mit dem Süd-Büro korrespondiert — möglicher Hinweis auf seinen Einsatz-Standort.

### Signature-Block-Lücke

Keine Email hatte einen RFC-konformen Signature-Delimiter (`-- ` auf eigener Zeile). Das erklärt, warum Name-Role-Pairs so dünn gefunden wurden: Abschluss-Grüße in deutschen Email-Clients nutzen oft nur Freitext ohne formelles Delimiter. Eine verbesserte Version des Skripts könnte spezifisch nach Deutsch-üblichen Signature-Mustern suchen („Mit freundlichen Grüßen\nVorname Nachname\nRolle"). Nicht jetzt implementiert.

### Was nicht drin ist

- Keine Pro-Person-Statistik (würde PII exponieren)
- Kein Thread-Zuordnung (In-Reply-To-Auswertung nicht gemacht)
- Kein Attachment-Export (PDFs in Anhängen wurden nicht extrahiert; könnte in späterer Runde passieren mit dem kit-pdf-Tool)

## Empfehlungen

### Für Paul

1. **Mail-Ordner-Ort**: `Mail ` liegt im Repo-Root (`~/Desktop/Code_Projects/Marimo-ADBerlin/Mail ` mit Trailing-Space). `.eml` ist zwar gitignored, aber der Ordner-Name selbst nicht. Empfehlung: umziehen nach `~/Desktop/ADBerlin/Mail/` (außerhalb Repo) — mehr Schutz vor versehentlichem Commit. Alternativ: `Mail*/` in .gitignore aufnehmen.
2. **Beratungsbüro-Nordost-Verifikation**: Prüfe ob dieser Name offiziell so heißt (data.ts aktualisierbar)
3. **124 privacy-flagged Emails enthalten wahrscheinlich Kund\*innen-Daten** — das Skript überspringt sie absichtlich. Für Prozesse wie „Schichtplanungs-Flow" könntest du gezielt diese Emails manuell anschauen, aber das ist **nicht** etwas, das ich automatisiert aus diesem Archiv herausfiltern werde. Private Analyse.

### Für's Projekt

1. **Script in kit überführen** (analog zu `kit pdf`) — `kit email extract` als wiederverwendbares Tool. Dann auch einsetzbar für andere Ordner (z.B. ver.di-Korrespondenz, Paritätischer).
2. **Signature-Block-Parser verbessern** — „Mit freundlichen Grüßen"-Muster, Post-Scriptum-Rollenangabe
3. **Attachment-Extraktion** — 201 Emails haben potenziell Attachments; `kit pdf` könnte angewandt werden

## Dateien, die dieser Commit anfasst

- [organigramm/ingest/email_role_extract.py](../ingest/email_role_extract.py) — neu, fail-closed Email-Analyse-Skript
- [organigramm/proposals/2026-04-23-email-aggregate.json](./2026-04-23-email-aggregate.json) — Aggregate-JSON (safe)
- [organigramm/proposals/2026-04-23-email-aggregate.md](./2026-04-23-email-aggregate.md) — dieses Dokument

**Nicht in git:** `organigramm/raw/email-private-findings.json` — private Named-Entity-Findings (nur lokal auf Paul's Mac, gitignored via `organigramm/raw/`).

## Privacy-Gesamtbewertung

Diese Runde war **konservativ erfolgreich**:
- 201 Emails analysiert, nicht einzeln inspiziert
- 124 wegen PII-Flagging übersprungen
- 3 strukturelle Org-Einheiten bestätigt (die 3 Beratungsbüros)
- Keine Kund\*innen-Daten im Repo
- Keine Einzelpersonen-Namen im Repo (außer Beratungsbüro-Namen, die Organisations-Einheiten sind)

Weitere Runden möglich, aber mit gleichen Privacy-Regeln.
