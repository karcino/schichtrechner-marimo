# Organigramm V2 — Ausbauvorschläge

Dieses Dokument sammelt Ideen für eine **zweite, erweiterte Version** des
Organigramms von ambulante dienste e.V. Die aktuelle V1 (GitHub Pages + Vercel)
ist ein hierarchisches Org-Chart mit Layer-Filter. V2 kann das entweder ablösen
oder als **Multi-View-Konzept** daneben existieren.

Jeder Vorschlag: Idee · Nutzen · Datenbasis (schon vorhanden vs. neu zu
recherchieren) · technischer Aufwand.

---

## 1 · Stakeholder-Netz (Force-Directed Graph)

**Idee**: Statt Baum → schwebendes Netzwerk aus Knoten, Kanten mit Kraft-Modell
(D3 force, Cytoscape, Sigma.js). Jede Entität (Vorstand, BR, Kund*in,
Kostenträger, Gesetz) ist ein Knoten; Beziehungen sind gerichtet und farblich
nach Typ (Weisung, Finanzierung, Rechtsgrundlage, Mitbestimmung, Vertragspartner).

**Nutzen**: Macht Verflechtungen sichtbar, die in der Baumansicht verborgen
bleiben (z. B. "ver.di begleitet sowohl Tarifkommission als auch Ver.di-&-friends-Liste",
"F_SEN finanziert EGH, aber BTHG-Schnittstelle zu F_PK").

**Datenbasis**: vorhanden (aktuelle `data.ts`), + Kanten-Typologie (`relation: "funded-by" | "governs" | "represents" | ...`) ergänzen.

**Aufwand**: mittel (Cytoscape-Komponente + Relation-Klassifikation).

---

## 2 · Process-Journey / Customer Journey

**Idee**: Horizontale Swimlane-Darstellung: Zeit-Achse vom Erstkontakt bis zum
laufenden Assistenz-Einsatz. Lanes: *Kund\*in*, *Beratungsbüro*, *Einsatzstelle*,
*Kostenträger*, *Tarif/Recht*.

Stationen: Erstkontakt → Bedarfsermittlung (TIB) → EGH-Antrag → Bewilligung →
Matching Assistenz → Qualifizierung → Dienstplan → laufender Einsatz → Abrechnung.

**Nutzen**: Zeigt, *wie* die Organisation für die Nutzer\*innen funktioniert —
nicht nur wer wem Bericht erstattet. Gut für Erklär-Seiten.

**Datenbasis**: teilweise neu — Prozess-Schritte müssen aus Website + TIB-Dokumenten
extrahiert werden. EGH-Antragsweg ist öffentlich dokumentiert (service.berlin.de).

**Aufwand**: mittel (BPMN-Lite mit `mermaid gantt`/`sequenceDiagram`, oder React-Flow-Swimlane).

---

## 3 · Geographic View (interaktive Karte)

**Idee**: Leaflet/MapLibre mit OpenStreetMap-Tiles. Pins:

- **Einsatzstelle** (Wilhelm-Kabus-Str. 21-35, Schöneberg)
- **Beratungsbüro Süd** (Gneisenaustr. 2a, Kreuzberg)
- **Beratungsbüro West** + **Nord/Ost** (nach Adress-Recherche)
- **Betriebsrat** (Urbanstr. 100, Kreuzberg)
- optional: *Heatmap* Kund\*innen-Standorte nach Bezirk (aggregiert, anonym, aus
  öffentlichen Statistiken)

Click auf Pin → dieselbe Detail-Panel-Logik wie im Org-Chart.

**Nutzen**: Macht die räumliche Dimension greifbar. Wichtig für Klient*innen
bei Büro-Wahl.

**Datenbasis**: Adressen vorhanden (Süd + HQ + BR); West/Nord-Ost müssen
lokal geprüft werden.

**Aufwand**: gering–mittel (Leaflet ist klein, OSM-Tiles frei).

---

## 4 · Finanzierungsfluss (Sankey)

**Idee**: Sankey-Diagramm — von links (**Kostenträger**: Senatsverwaltung, Pflegekasse,
Krankenkasse, Bezirk, Budgetnehmer\*in) nach rechts (**Leistungen**: EGH-Assistenz,
Behandlungspflege, Pflege SGB XI, Schul-/Arbeitsassistenz). Breite = Relevanz.

**Nutzen**: Erklärt, *woher das Geld kommt* und *wofür es ausgegeben wird* —
zentral im BTHG-/SGB-Kontext. Aufklärend für Öffentlichkeit, Förderer und
neue Mitarbeiter\*innen.

**Datenbasis**: Neu. Grobe Größenordnungen können aus Berliner EGH-Berichten
abgeschätzt werden, Exakt-Zahlen nur über Geschäftsbericht (falls veröffentlicht).

**Aufwand**: mittel (D3 Sankey oder ECharts Sankey).

---

## 5 · Timeline / Historie

**Idee**: Vertikale Zeitachse von 1981 bis heute mit Meilensteinen (Gründung,
Einführung Persönliches Budget, BTHG-Umsetzung 2020, Haustarifvertrag 2020,
40-Jahr-Feier 2021, Umzug der Einsatzstelle 2023). Jeder Meilenstein verlinkt
Quellen & PDF (z. B. die 40-Jahre-Festschrift).

**Nutzen**: Kontextualisiert die heutige Struktur als Ergebnis einer langen
Entwicklung. Hilft, die Selbstbestimmt-Leben-Bewegung nachzuvollziehen.

**Datenbasis**: Vorhanden (40-Jahre-PDF, HTV-Historie, Archiv-BR-Seite).

**Aufwand**: gering (CSS/Scroll-Timeline oder Mermaid Gantt).

---

## 6 · Rollen-Matrix (Responsibility Chart · RACI)

**Idee**: Matrix — Zeilen = Prozesse (Einstellung, Dienstplan, QM-Audit,
Tarifverhandlung, Budget-Beratung), Spalten = Rollen (GF, VL, PDL, BR, TK,
Beratungsbüro-Koordination). Zellen: R (responsible), A (accountable), C
(consulted), I (informed).

**Nutzen**: Klarheit über Verantwortlichkeiten. Nützlich intern (Onboarding)
und extern (Transparenz für Klient\*innen).

**Datenbasis**: Neu — muss aus QM-Handbuch und Betriebsvereinbarungen extrahiert werden.

**Aufwand**: gering technisch, hoch recherchisch.

---

## 7 · Mitbestimmungs-Mechanik

**Idee**: Fokussierte Teil-Ansicht auf die Mitbestimmung: **BR**, **GF**,
**Vorstand**, **Tarifkommission**, **ver.di**, **Ver.di & friends**, **MV**.
Gerichtete Pfeile mit Labels (konsultiert / verhandelt mit / wählt / stellt
Kandidat\*innen für). Dazu Timeline-Mini-Widget mit BR-Wahlen (alle 4 Jahre,
letzte Wahl …).

**Nutzen**: Gewerkschaftspolitisch relevant, zeigt das Feld zwischen
Selbstverwaltung (MV, Vorstand) und Arbeitnehmer\*innen-Vertretung (BR + TK).

**Datenbasis**: Grundstruktur vorhanden; BR-Wahlergebnisse aus betriebsrat-ad.de nachtragen.

**Aufwand**: gering (Teilmenge des vorhandenen Graphs).

---

## 8 · Recht-Layer (SGB IX / XI / V, BTHG, TIB, BetrVG, HTV)

**Idee**: Kartierung **Leistung ↔ Rechtsgrundlage**. Jede Leistung von ad e.V.
wird einem Paragraphen zugeordnet. Beispielsweise:

- „Persönliche Assistenz" → § 78 SGB IX, § 29 SGB IX (Budget), § 113 SGB IX
- „Häusliche Krankenpflege" → § 37 SGB V
- „Grundpflege" → § 36 SGB XI
- „Betriebsrats-Rechte" → §§ 87 ff BetrVG

**Nutzen**: Unverzichtbar für Kund\*innen-Beratung und für das Verständnis
der Finanzierungslogik. Auch für Fortbildung neuer Assistent\*innen.

**Datenbasis**: Teilweise vorhanden (in neuer `data.ts` als `legal`-Gruppe).
Voll auszubauen über BTHG-Kompass (umsetzungsbegleitung-bthg.de).

**Aufwand**: gering technisch, mittel recherchisch.

---

## 9 · Publikations- / Materialarchiv

**Idee**: Durchsuchbarer Katalog aller öffentlich verfügbaren Dokumente von
ad e.V. und BR:
Leitbild (Handlungsgrundlagen + umfassende Positionen), Flyer, 40-Jahre-Festschrift,
Newsletter, Betriebsvereinbarungen, Tarifvertrag. Jede Datei mit Thumbnail,
Schlagwörtern, Download-Link, Jahr.

**Nutzen**: Transparenz-Werkzeug. Schnellere Quellenprüfung.

**Datenbasis**: Halbautomatisch über `scrape.sh` (siehe `organigramm/HANDOFF.md`) zu befüllen.

**Aufwand**: gering (statische Liste mit Filter/Suche).

---

## 10 · Assistenz-Formen-Katalog

**Idee**: Eigene Seite pro Assistenz-Form (Grund-, Reise-, Arbeits-, Studien-,
Schul-, Kommunikations-, Nacht-, Krankenhaus-, Freizeit-Assistenz) mit:

- Definition
- Typische Einsatzorte / Zeiten
- Welche Kostenträger zahlen
- Welche Qualifizierung erforderlich
- HTV-Zuschläge (Nacht, Sonntag, Wechselschicht) — Verlinkung zum `notebook_monat.py`-Rechner
- Ansprechperson (Assistenz-Koordination)

**Nutzen**: Konkreter Nutzen für Klient\*innen und Interessierte.

**Datenbasis**: Grundstruktur vorhanden (assistance-Gruppe), Detail-Texte teilweise aus
„Persönliche Assistenz"-Seite + Unterseiten.

**Aufwand**: gering (Unterseiten im bestehenden Layout).

---

## 11 · Tarif-Anwendung · Interaktiver HTV-Explorer

**Idee**: Parameterisierter Explorer: Nutzer\*in wählt Entgeltgruppe und Stufe,
sieht Stunden- und Monatssatz nach HTV + Anlage C, Zuschläge nach § 7, gekoppelt
mit `notebook.py` / `notebook_monat.py`. Bindet das Organigramm an den schon
vorhandenen Schichtrechner.

**Nutzen**: Macht den bisher separaten Rechner organisch Teil der
Organisations-Erklärung.

**Datenbasis**: Vorhanden (`htv_calc.py`).

**Aufwand**: gering (nur Integration / Verlinkung).

---

## 12 · „Gebäude-Ansicht" der Einsatzstelle

**Idee**: Schematischer Grundriss Wilhelm-Kabus-Str. 21-35, Eingang 2, 1. OG,
mit klickbaren Räumen/Bereichen: Sekretariat, GF, VL, PDL, QM, Personal,
Buchhaltung, Justiziariat. Illustrativ, nicht vermessungsgenau.

**Nutzen**: Räumliche Orientierung für neue Mitarbeiter\*innen, Klient\*innen,
Besucher\*innen.

**Datenbasis**: Neu (eigener Plan nötig).

**Aufwand**: hoch (SVG-Illustration), aber eine einmalige Investition.

---

## 13 · Changelog / Version-History der Organisation

**Idee**: Jede Änderung am Organigramm wird versioniert mit Commit-Nachricht +
Datum + Quelle. Öffentliche Page zeigt Diff zwischen Versionen (etwa
„01.07.2023: Einsatzstelle an neue Adresse Wilhelm-Kabus-Str. verlegt").

**Nutzen**: Historische Nachvollziehbarkeit, Vertrauen.

**Datenbasis**: Liegt bereits in git (Commit-Log).

**Aufwand**: gering (git-log-Renderer oder GitHub-Releases).

---

## 14 · Unterschiedliche Schärfegrade („Lesermodus")

**Idee**: Drei Modi:

1. **Übersicht** — nur Hauptbereiche (MV → VS → GF → ES/BB + BR).
2. **Standard** — Kern + Abteilungen + IV (aktueller Default).
3. **Detail** — alles: Assistenzformen, Kostenträger, Rechtsrahmen, Qualifizierung.

Aktuell bereits im Vercel-Build als Layer-Toggle vorbereitet. V2 könnte das als
echten Modus verstehen (URL `?view=overview|standard|detail` für Bookmarks).

**Nutzen**: Eine Seite für viele Zielgruppen.

**Datenbasis**: Vorhanden.

**Aufwand**: gering.

---

## 15 · Print-/Export-Paket

**Idee**: Ein Button, der das aktuelle Diagramm + aktive Layer als
**SVG/PNG/PDF** exportiert, inkl. Quellenliste im Footer. Optional: A3-/A2-Poster-Layout.

**Nutzen**: Nutzbar in Printmaterial, Präsentationen, Ausbildungs-Unterlagen.

**Datenbasis**: Vorhanden.

**Aufwand**: gering (React-Flow hat eine `toPng`/`toSvg`-API bzw. html-to-image).

---

## Priorisierungs-Vorschlag

| Wert × Aufwand | Ideen |
|---|---|
| Hoch / niedrig | 5 Timeline · 13 Changelog · 14 Leser-Modus · 15 Export |
| Hoch / mittel  | 1 Force-Graph · 3 Karte · 8 Recht-Layer · 10 Assistenz-Katalog |
| Hoch / hoch    | 2 Customer Journey · 4 Finanzierungsfluss · 12 Gebäudeplan |
| Mittel         | 6 RACI · 7 Mitbestimmung · 9 Publikationsarchiv · 11 HTV-Explorer |

**Empfehlung**: Starten mit *5 + 14 + 15* (höchste Wirkung bei geringstem Aufwand)
und *3 + 8* als nächsten Schritt (hoher Wert, überschaubare Arbeit).
