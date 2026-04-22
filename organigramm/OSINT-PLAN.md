# OSINT-PLAN — ambulante dienste e.V. + Betriebsrat

Stand: 2026-04-22 · Referenz: [Sub-Projekt A4 im Plan](../. claude/plans/plan-mode-cuddly-feather.md)

---

## Zweck

Welche öffentlichen Quellen werden mit welchem Tempo und welchem ethischen Rahmen angezapft, um die Organigramm-Datenbasis auf einem belegbaren Stand zu halten?

**Grundprinzip:** Jede Quelle wird vor Erst-Anfrage einer Zone zugewiesen. Quellen ohne Zone werden nicht verwendet.

---

## Grün / Gelb / Rot — Erklärung

| Zone | Was | Automatisierbar? | Beispiele |
|---|---|---|---|
| 🟢 **Grün** | Öffentliches Register, klarer Publikationszweck, kein Persönlichkeitsrecht-Graubereich | Ja, per Script | Vereinsregister, Handelsregister, Paritätischer-Mitgliederliste, Hilfelotse, TopQM, Bundesanzeiger |
| 🟡 **Gelb** | Publikumsöffentlich, aber personenbezogene Inhalte — manuelle Filterung nötig | Nein, nur manuell mit Bedacht | LinkedIn-Unternehmensseite, Facebook-Seiten, Blog-Posts, Presse |
| 🔴 **Rot** | Privatprofile, Kund\*innen-Daten, Leaks, Gated-Communities, Doxing-Material | **Nie** | Persönliche LinkedIn, WhatsApp-Gruppen, Kund\*innen-Karteien |

---

## Grüne Zone (automatisierbar)

Diese Quellen kann der Register-Scraper aus Sub-Projekt D periodisch abfragen. Jede gefundene Änderung landet als Proposal in Public-OB1 und wird erst nach Paul-Review in den TS-Layer übernommen.

### G1. Vereinsregister Berlin (AGN Charlottenburg)

| Feld | Wert |
|---|---|
| URL-Zugang | https://www.handelsregister.de (Vereinsregister-Option, AG Charlottenburg, Suche „ambulante dienste") |
| Register-Nr. | **TODO (Paul):** VR-Nummer eintragen (steht im ad-Impressum oder auf dem Verein-Bescheid) |
| Gesuchte Felder | Vorstandsmitglieder (mit Vertretungsregelung), Satzungsänderungen, Gründungsdatum |
| Update-Frequenz | Quartalsweise |
| Risiko-Note | Niedrig — echtes öffentliches Register |
| Abhängigkeit | Captcha im Handelsregister-Portal kann Automation brechen → fallback manuell |

### G2. Handelsregister (Neue Lebenswege GmbH)

| Feld | Wert |
|---|---|
| URL-Zugang | https://www.handelsregister.de (AG Charlottenburg, Suche „Neue Lebenswege GmbH") |
| Register-Nr. | **TODO (Paul):** HRB-Nummer eintragen (wenn du sie schon kennst; sonst Erst-Suche durchführen) |
| Gesuchte Felder | Geschäftsführung, Gesellschafter (sofern öffentlich), Prokura, Jahresabschlüsse (über Bundesanzeiger) |
| Update-Frequenz | Quartalsweise |
| Risiko-Note | Niedrig |

### G3. Paritätischer Wohlfahrtsverband Berlin — Mitgliederliste

| Feld | Wert |
|---|---|
| URL | https://www.paritaet-berlin.de/mitglieder/unsere-mitgliedsorganisationen |
| Gesuchte Felder | Mitgliedsstatus ad e.V., öffentliche Kontaktdaten, Fachgruppen-Zugehörigkeit |
| Update-Frequenz | Halbjährlich |
| Risiko-Note | Sehr niedrig |

### G4. Hilfelotse Berlin

| Feld | Wert |
|---|---|
| URL | https://www.hilfelotse-berlin.de/detail/ambulante-dienste-e-v-einsatzstelle |
| Gesuchte Felder | Adresse, Sprechzeiten, Leistungsbereiche, Kontaktperson (falls gelistet) |
| Update-Frequenz | Halbjährlich |
| Risiko-Note | Niedrig |

### G5. TopQM Berlin — Einrichtungsstammdaten

| Feld | Wert |
|---|---|
| URL | https://soziale-dienste.berlin.de/topqm-prod/topqw-web/Stammdaten.aspx?EIID=b846593d-e5c5-40be-9623-342c66c722e9 |
| Gesuchte Felder | Zertifizierungsstatus, Einrichtungs-ID, Anschrift |
| Update-Frequenz | Jährlich |
| Risiko-Note | Niedrig |

### G6. Bundesanzeiger — Jahresabschlüsse

| Feld | Wert |
|---|---|
| URL | https://www.bundesanzeiger.de (Suche „Neue Lebenswege" — für e.V. idR kein Pflicht-Eintrag) |
| Gesuchte Felder | Umsatz-Größenordnung, Mitarbeiter-Schnitt, Bilanzsumme — nur so weit in Kurzfassung publiziert |
| Update-Frequenz | Jährlich (nach Publikations-Fristen) |
| Risiko-Note | Niedrig — Pflicht-Publikation |

### G7. Berliner Amtsblatt / Behördenpublikationen

| Feld | Wert |
|---|---|
| URL-Zugang | https://www.berlin.de/sen/justiz/service/amtsblatt-fuer-berlin/ |
| Gesuchte Felder | Nennungen der Organisationen, Zuwendungs-Bekanntmachungen |
| Update-Frequenz | Monatlich (Volltext-Suche) |
| Risiko-Note | Sehr niedrig |

---

## Gelbe Zone (manuell, mit Bedacht)

Keine Automation. Paul besucht diese Seiten persönlich, filtert, was für das Organigramm relevant ist, und gibt es ggf. als Enrichment ein. Personenbezogene Inhalte werden restriktiv behandelt.

### Y1. LinkedIn-Unternehmensseite ad e.V.

| URL | https://de.linkedin.com/company/ad-berlin |
| Was ja | Firmenbeschreibung, offizielle Rollen-Titel (wenn publiziert), Mitarbeiter-Zahl-Größenordnung, Stellenausschreibungen |
| Was nein | Personenbezogene Profile von Mitarbeiter\*innen abseits publizierter Rollen |

### Y2. Facebook-Seite ad.berlin + Betriebsrat

| URL | https://www.facebook.com/ad.berlin/ · https://www.facebook.com/Betriebsrat-ambulante-dienste-784278498305728/ |
| Was ja | Öffentliche Posts, Event-Ankündigungen, BR-Positionierungen |
| Was nein | Kommentatoren, Like-Listen, Mitgliedschaft in Gruppen |

### Y3. ver.di-Tarif-Dossiers

| URL | https://verdi-ad-lw.de/ · https://verdiandfriends.de/ |
| Was ja | Tarif-Historie, Verhandlungsstände, Positionspapiere, Streik-Ankündigungen |
| Was nein | Interne Mitglieder-Listen (falls auffindbar) |

### Y4. Bundestag-Drucksachen (BTHG-Kontext)

| URL | https://dserver.bundestag.de/ |
| Was ja | Gesetzgebungsverlauf SGB IX / BTHG, Ausschuss-Anhörungen mit ad-Vertretung (falls Paul dort als Sachverständiger) |
| Was nein | — |

### Y5. Presse-Clippings

| URL | Google News + Berliner Lokalpresse (Tagesspiegel, Berliner Zeitung, Taz) — Suche „ambulante dienste" |
| Was ja | Artikel über ad e.V. oder den Betriebsrat als Institution |
| Was nein | Artikel, die nur Kund\*innen-Fälle behandeln, selbst wenn sie ad erwähnen |

---

## Rote Zone (NIE)

Explizit ausgeschlossen. Kein Code-Pfad, keine manuelle Ad-hoc-Nutzung. Wenn solche Quellen auftauchen, werden sie dokumentiert (dass sie existieren), aber nicht eingebunden.

- Persönliche LinkedIn-Profile einzelner Mitarbeiter\*innen oder Vorstandsmitglieder (außer explizit als „öffentliche Rolle" mit Link auf ad-Seite)
- Kund\*innen-Daten jeder Art, aus jeder Quelle
- Geschlossene Facebook-Gruppen
- WhatsApp-Gruppen / Telegram-Kanäle (auch wenn sie Beschäftigte versammeln)
- Dark-Web-Quellen, Pastebins, Leaks (Ashley Madison-artige Dumps)
- Recherche-Datenbanken mit personenbezogenem Fokus (Correctiv, LobbyControl-Gesichtsprofile) — es sei denn, ein konkreter publizierter Bericht nennt eine Rolle
- Doxing-Quellen, „OSINT-Investigation"-Dienste mit unklaren Daten-Herkünften

**Test:** Wenn du die Quelle einem BR-Vertrauensanwalt in einem Satz erklären müsstest und zögerst — sie ist rot.

---

## Workflow bei neuen Funden

1. Quelle finden → Zone zuweisen (grün/gelb/rot) **bevor** auf „Ingestieren" geklickt wird
2. Bei grün: Register-Scraper-Config erweitern (siehe D's `register_scrape.py`)
3. Bei gelb: Manuelle Notiz in OB1-Public mit `source_kind="osint-register"`, Enrichment-Vorschlag generieren
4. Bei rot: Notieren **dass** die Quelle existiert (inkl. Warum-Rot-Begründung), nicht **was** drin steht

---

## Offene Punkte für Paul

- [ ] **VR-Nummer ad e.V.** eintragen (G1)
- [ ] **HRB-Nummer NLW** eintragen (G2) — oder bestätigen, dass NLW überhaupt im HR steht
- [ ] **Weitere Register-Pflicht-Einträge?** (Gesundheitsamt-Listungen, Sozialamt-Leistungserbringer-Verzeichnisse?)
- [ ] **Berliner Bezirksamt-Ressourcen** — gibt es ein öffentliches Verzeichnis der zugelassenen Assistenzdienste pro Bezirk?
- [ ] **Korrekte Abgrenzung „Bündnis aktiver Ambulanter Dienste" (bad-ad.de)** — was genau ist das? In HANDOFF.md markiert als „DNS nicht auflösbar"

---

## Änderungs-Log

- 2026-04-22: Erstfassung (aus Sub-Projekt A4)
