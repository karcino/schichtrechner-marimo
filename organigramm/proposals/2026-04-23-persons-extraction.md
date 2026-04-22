# Persons-Extraction aus Email-Archiv — Public-Report

Datum: 2026-04-23 · Werkzeug: [`email_persons_extract.py`](../ingest/email_persons_extract.py) · Input: 201 `.eml`-Dateien in `~/Desktop/ADBerlin/Mail/` (lokal, nicht im Repo)

## Methodik

Verbesserter Signature-Parser gegenüber der ersten Runde (`email_role_extract.py`). Statt auf den RFC-konformen `-- `-Delimiter zu warten (der in keiner Email vorkam), detektiert das Skript die letzte **Closing-Phrase** im Body (z.B. "Mit freundlichen Grüßen", "Viele Grüße") und parsed die ~8 Zeilen danach.

Pro Zeile wird heuristisch erkannt:
- **Name** (1-3 Capitalized Words, keine Zahlen, nicht in Rollen-Token-Liste)
- **Rolle** (Zeile enthält ein Token aus 40+ deutschen Rollenbezeichnungen)
- **Telefon** (regex, mindestens 7 Ziffern, inkl. `030/69 59 75-NNN`-Format)
- **Email** (`@adberlin.org` priorisiert)
- **Büro** (Keyword-Match für Beratungsbüros, Einsatzstelle, Urbanstr. BR)

Für ASN (Assistenznehmer\*innen) wird im Subject + ersten 800 Chars des Bodys nach 2+2-CamelCase-Kürzeln gesucht (Pattern `[A-Z][a-z]{1,3}[A-Z][a-z]{1,3}`).

## Kernzahlen (nicht-sensibel)

| Metric | Wert |
|---|---|
| Gesamt-Emails | 201 |
| Mit erkanntem Signature-Block | 176 (88 %) |
| Mit geparsten Namen | 140 |
| **Distinct identifizierte Personen** | **28** |
| Personen mit bekannter Rolle | 19 |
| Personen mit bekanntem Telefon | 7 |
| Personen mit Büro-Zuordnung | 22 |
| **Distinct ASN-Kürzel** | **10** |
| ASN-Gesamt-Erwähnungen | 55 |

## Qualitäts-Vergleich zur ersten Runde

| | Runde 1 (email_role_extract) | Runde 2 (email_persons_extract) |
|---|---|---|
| Name-Rolle-Paare | 3 (alle = Beratungsbüro-Labels) | **28 echte Personen** |
| Telefonnummern | 0 | **7** |
| Büro-Zuordnung | 0 | **22** |
| Methoden-Basis | Nur RFC-`-- `-Delimiter | Deutsche Closing-Phrases + mehrzeilige Sig-Parse |

Die 10-fache Steigerung erklärt sich durch zwei Effekte: (a) Closing-Phrase-Detection findet die Sig-Blöcke auch ohne RFC-Delimiter, und (b) Mehrzeilige Sig-Parse erkennt nicht nur adjacent-to-role-token Namen, sondern extrahiert das strukturierte Name/Rolle/Tel/Email/Büro-Muster.

## Was aus dieser Runde öffentlich verwertbar ist

Einige der extrahierten Infos sind durch externe Quellen (LinkedIn, Website, Register) sowieso öffentlich bekannt. Beispiel:

- **Uta Wehde** — Geschäftsführung — bestätigt aus S16 (HTV-Unterzeichnung 2020) plus Email-Signatur 2026
- **Aurien, Jeromin, Sühnel** — Vorstand — schon auf adberlin.com gelistet (S2)

Die Info, dass diese Personen **in 2026 noch aktiv** sind, ist aber **neu** — die Website hat keine Datumsstempel.

## Was strikt privat bleibt (nicht in git, nicht in Proposals-MD)

- Vollnamen aller extrahierten Personen (außer die schon öffentlich bekannten wie Uta Wehde)
- Telefonnummern und E-Mail-Adressen Einzelner
- ASN-Kürzel und ihre Büro-Zuordnung
- Kommunikationsprotokolle

Diese liegen gitignored in:
- `organigramm/raw/persons-private.json` (nur lokal)
- `organigramm/raw/asn-kuerzel-private.json` (nur lokal)
- `organigramm/raw/communication-log-private.json` (nur lokal)

## Nächste Schritte

1. **UI /private-Route** in der Vercel-App — gated mit separatem `PRIVATE_PASSWORD`, rendert die drei Dateien als interaktive Tabs:
   - **Büro-Organigramm** mit Vollnamen
   - **ASN-Übersicht** mit Kürzel + Büro-Zuordnung
   - **Kommunikationsprotokoll** pro Person (chronologisch, nur Metadaten)
2. **Manuelle Verifikation der Rolle-Guesses** — die Heuristik nimmt die erste Role-Token-haltige Zeile, manchmal stimmt das nicht 100 %
3. **Unter-Büros-Zuordnung verfeinern** — z.B. innerhalb BBS gibt es vermutlich mehrere Teams/Koordinator\*innen

## Dateien, die dieser Commit anfasst

- [organigramm/ingest/email_persons_extract.py](../ingest/email_persons_extract.py) — neues Skript
- [organigramm/proposals/2026-04-23-persons-extraction.md](./2026-04-23-persons-extraction.md) — dieses Dokument
- [organigramm/proposals/2026-04-23-persons-public.json](./2026-04-23-persons-public.json) — Public-Aggregate

**Nicht im Commit (gitignored):**
- `organigramm/raw/persons-private.json`
- `organigramm/raw/asn-kuerzel-private.json`
- `organigramm/raw/communication-log-private.json`
