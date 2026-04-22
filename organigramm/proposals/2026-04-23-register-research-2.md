# Register-Research — Runde 2

Datum: 2026-04-23 · Referenz: [Sub-Projekt D fortgesetzt](../../.claude/plans/plan-mode-cuddly-feather.md) · Vorgänger: [Runde 1](./2026-04-22-register-research.md)

## Ergebnisse — strukturelle Neu-Entdeckung

### ✅ Cooperative Mensch eG — neuer Knoten COOP

Bisher in der Datenbasis nicht erfasst. Verdient einen eigenen Knoten, weil sie die **Mutter-Genossenschaft von NLW** ist und damit die Verflechtungs-Landschaft der Berliner Behindertenhilfe deutlich präziser macht.

| Feld | Wert | Quelle |
|---|---|---|
| Name | Cooperative Mensch eG | S52 |
| Rechtsform | Eingetragene Genossenschaft | S52, S53 |
| Gegründet als | Spastikerhilfe Berlin eG (1990); Vorläufer-Verein 1958 | S53 |
| Umbenannt | 2018 zu „Cooperative Mensch eG" | S52 |
| Sitz | Berlin | S52 |
| Größe | **25+ Einrichtungen** in Berlin (Wohnen, Tagesförderstätten, Werkstätten, ambulante Angebote) | S52, S53 |
| Besonderheit | 2021 Fusion mit Lebenswege Wohnprojekte GmbH | S53 |
| Verbindung zu NLW | Gesellschafter der Neuen Lebenswege GmbH (seit spätestens 2014) | S50 |

**Commit:** Neuer `COOP`-Knoten in [data.ts](../../organigramm-vercel/lib/data.ts) mit group=external, verify=verified. Neue Edge `COOP → NLW` mit label="Gesellschafter", verify=verified.

### ✅ Neue Lebenswege GmbH — signifikante Korrekturen

Die bisherigen Annahmen aus Runde 1 mussten präzisiert werden:

| Feld | Runde 1 | Runde 2 (korrigiert) |
|---|---|---|
| Sitz | Kurfürstenstr. 75, 10787 | **Zimmerstr. 26-27, 10969** (neuer Sitz) |
| Geschäftsführung | unbekannt | **Georg Dudaschwili** (seit Juni 2021) |
| Gründungsdatum | unbekannt | **02.11.2012** |
| Stammkapital | unbekannt | **25.000 EUR** |
| Gesellschafter | keiner öffentlich bekannt | **Cooperative Mensch eG** (seit mind. 2014) |

**Commit:** NLW-Knoten description + address aktualisiert. Sources S49, S50 bleiben Belege, accessed-Datum S50 auf 2026-04-23 aktualisiert (weil re-verifiziert).

### ✅ Paritätischer — „ad:bewegt"-Ausstellung

Paritätischer Berlin hat eine digitale Ausstellung über die Geschichte von ad e.V. publiziert: **ad:bewegt! – vom Musterkrüppelchen zur Persönlichen Assistenz**. Das ist eine qualitätsreiche sekundäre Quelle für Geschichte + Selbstverständnis des Vereins, auch wenn der Mitgliederlisten-Eintrag selbst auf der paginierten Seite nicht wiedergefunden werden konnte.

**Commit:** DV-Knoten (Paritätischer) verify: inferred → verified, mit Source S54 ergänzt.

### ✅ Hilfelotse — URL lebt

Die S18-URL `https://www.hilfelotse-berlin.de/detail/ambulante-dienste-e-v-einsatzstelle` lieferte beim ersten Versuch 404, jetzt ist sie wieder erreichbar (vermutlich war 404 ein temporäres Problem). Zusätzliche Detail-Infos gefunden:

- **LK 32 als Abrechnungs-Kategorie**: 50 EUR/Stunde
- **Zugangsvoraussetzungen**: unter 67, Pflegegrad 3, min. 5 h/Tag Assistenzbedarf

Diese Zugangsvoraussetzungen sind relevant für G-Lite (ECONOMICS.md), weil sie erklären warum ad e.V. speziell ~100 Kund\*innen bedient und nicht tausend — die Hürde ist substanziell.

### ⚠️ Paginierter Paritätischer-Eintrag — nicht auffindbar

Google-Index zeigt Offset 710 der Paritätischer-Mitgliederliste, aber die direkte Web-Fetch auf diese URL liefert Organisationen T–U, nicht A. Entweder Google-Cache veraltet oder Liste umsortiert. **Empfehlung:** Paul fetcht die Liste direkt im Browser und sucht manuell — die Mitgliedschaft ist bereits anderweitig (S20 + S54) belegt, also kein Blocker.

### ⚠️ NLW-Finanzdaten — hinter Paywall

NorthData zeigt Bilanzsumme + Mitarbeiter nur für zahlende Abonnenten. Die frühere Google-Search-Ergebnis-Aussage „Bilanzsumme 2023 ≈ 3 Mio EUR, -26,2 %" konnte ich nicht direkt verifizieren, darum **nicht** in ECONOMICS.md aufgenommen. Paul kann bei Bedarf Bundesanzeiger direkt abfragen (gGmbH ist Publikations-pflichtig) oder NorthData-Abo nehmen.

### 🔗 Berliner Zuwendungsdatenbank — Recherche-Weg dokumentiert

<https://www.berlin.de/sen/finanzen/service/zuwendungsdatenbank/> bietet Such-Formular mit Feldern (Name, Jahr, Art, Politikbereich, Zweck). Kein direkter API-Zugang. Paul kann dort gezielt nach „ambulante dienste" suchen, um konkrete Senats-Zuwendungen an ad e.V. zu finden. Als Source S55 dokumentiert (kind=osint-register), damit der Recherche-Einstieg im Code versioniert ist.

## Offene Punkte für Paul (hochbleibend)

1. **VR-Nummer ad e.V.** — weiterhin offen (Runde 1 TODO)
2. **Aktuelle Vorstands-Besetzung 2026** — weiterhin unbestätigt seit Runde 1
3. **Geschäftsführung Uta Wehde?** — weiterhin nur via S16 belegt (HTV-Unterzeichnung 2020), keine aktuelle Bestätigung
4. **Zuwendungsdatenbank-Recherche**: manuelle Suche „ambulante dienste" + „Neue Lebenswege" → Liste der öffentlichen Förderungen dokumentieren
5. **Bundesanzeiger-Abfrage NLW**: 2023er Jahresabschluss für ECONOMICS.md-Präzisierung

## Erweiterungen in diesem Commit

- [sources.ts](../../organigramm-vercel/lib/sources.ts) — +5 neue Sources (S52 Cooperative Mensch Homepage, S53 Wikipedia, S54 ad:bewegt-Ausstellung, S55 Zuwendungsdatenbank, S56 Familienratgeber)
- [data.ts](../../organigramm-vercel/lib/data.ts) — neuer `COOP`-Knoten, NLW-Knoten korrigiert, DV-Knoten auf verified, neue Edge `COOP → NLW`
- Dieses Dokument

**Kein Name-Zuordnungs-Durchbruch bei Einsatzstellen-Funktionen** — die ad-Website nennt weiterhin keine Personen mit ihren Rollen. Für diese Informationsschicht braucht's entweder Insider-Dokumente (Newsletter, Jahresberichte als PDF auf der ad-Seite) oder Sub-Projekt B (Email-Ingest nach BR-Vertrauensanwalt-Call).
