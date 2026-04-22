# Handoff: Organigramm Ambulante Dienste e.V. + Betriebsrat

Stand: 2026-04-22

## Ausgangslage / Warum ein Handoff?

Aus der Claude-Code-Session heraus konnten die Ziel-Websites **nicht** direkt geladen werden:

- `WebFetch` liefert durchgehend **HTTP 403** (User-Agent- oder IP-Filter serverseitig).
- `Bash` + `curl` / `wget` schlägt fehl mit **"Host not in allowlist"** (Sandbox blockiert nicht allowlistete Hosts).
- `bad-ad.de` ist zusätzlich nicht per DNS auflösbar.

Alle bisher gesammelten Informationen stammen daher aus **WebSearch-Snippets**
(Google-Index). Daraus lässt sich bereits ein brauchbares Grobgerüst ableiten,
aber die Detailarbeit (Namen in Abteilungen, Betriebsrats-Mitglieder,
Beratungsbüro-Ansprechpersonen, PDFs im Volltext) muss lokal mit Netz-Zugriff
erfolgen.

Dieses Dokument liefert: (1) alle gefundenen URLs, (2) das bisher extrahierte
Datenmodell, (3) einen ersten Organigramm-Entwurf (Mermaid), (4) ein
Shell-Skript zum Mirror/Download aller Ressourcen auf einer Maschine mit
besseren Rechten.

---

## 1. Zielorganisationen und Haupt-URLs

### 1.1 ambulante dienste e.V. (der Träger)

| Feld | Wert |
|------|------|
| Website | <https://www.adberlin.com/neu/> |
| Rechtsform | eingetragener Verein (e.V.) |
| Gründung | 8. Mai 1981 |
| Größe | ~100 Kund\*innen, ca. 650–700 Mitarbeiter\*innen, ~100 Vereinsmitglieder |
| Sitz (Einsatzstelle) | Wilhelm-Kabus-Str. 21-35, 10829 Berlin-Schöneberg (Umzug Juni 2023) |
| Kontakt Sekretariat | Tel. 030 / 69 59 75 -410, Fax -423, <sekretariat@adberlin.org> |
| Erreichbar | Mo–Fr 8:00–16:00 |
| Dachverband | Paritätischer Wohlfahrtsverband Berlin |
| LinkedIn | <https://de.linkedin.com/company/ad-berlin> |
| Facebook | <https://www.facebook.com/ad.berlin/> |
| Verzeichnis QM Berlin | <https://soziale-dienste.berlin.de/topqm-prod/topqw-web/Stammdaten.aspx?EIID=b846593d-e5c5-40be-9623-342c66c722e9> |
| Hilfelotse-Eintrag | <https://www.hilfelotse-berlin.de/detail/ambulante-dienste-e-v-einsatzstelle> |

### 1.2 Betriebsrat ambulante dienste e.V.

| Feld | Wert |
|------|------|
| Website (aktuell) | <https://betriebsrat-ad.de/> |
| Website (Archiv/alt) | <https://betriebsrat-ad.site36.net/> |
| Büros | Urbanstr. 100, 10967 Berlin · Wilhelm-Kabus-Str. 21-35, 10829 Berlin |
| Telefon | 030-69597578 |
| E-Mail | <br@betriebsrat-ad.de> |
| Newsletter | Mail mit Betreff "subscribe" an <betriebsrat.ambulante_dienste@web.de> |
| Öffnungszeiten | Mo + Fr 10–13 Uhr, Mi 12–15 Uhr |
| Facebook | <https://www.facebook.com/Betriebsrat-ambulante-dienste-784278498305728/> |

### 1.3 Verbundene / nahestehende Strukturen

| Organisation | URL | Funktion |
|--------------|-----|----------|
| Neue Lebenswege GmbH | — | Verbundenes Unternehmen, gemeinsamer Haustarif mit ad e.V. |
| Ver.di & friends | <https://verdiandfriends.de/> | Ver.di-nahe Betriebsrats-Liste |
| Tarifkampagne ad + NLW | <https://verdi-ad-lw.de/> | Tarifkommission / Haustarifverträge |
| „Bündnis aktiver Ambulanter Dienste" (BAD) | <https://www.bad-ad.de/wer-wir-sind/> | Zu prüfen: Abkürzung kollidiert – DNS war aus Sandbox nicht auflösbar |

---

## 2. Zu spiegelnde Einzel-URLs

### 2.1 adberlin.com – HTML-Seiten

```
https://www.adberlin.com/neu/
https://www.adberlin.com/neu/kontakt
https://www.adberlin.com/neu/impressum
https://www.adberlin.com/neu/aktuelles
https://www.adberlin.com/neu/stellen
https://www.adberlin.com/neu/themen-von-a-bis-z

https://www.adberlin.com/neu/der-verein-ambulante-dienste-e-v
https://www.adberlin.com/neu/der-verein-ambulante-dienste-e-v/mehr-uber-den-verein
https://www.adberlin.com/neu/der-verein-ambulante-dienste-e-v/aktivitaeten/30-jahre-ad

https://www.adberlin.com/neu/assistenzdienst
https://www.adberlin.com/neu/assistenzdienst/einsatzstelle
https://www.adberlin.com/neu/assistenzdienst/beratungsbueros
https://www.adberlin.com/neu/assistenzdienst/qualitatsmanagement-startseite
https://www.adberlin.com/neu/assistenzdienst/qualitatsmanagement-startseite/qualitaetsmanagement-allgemeine-informationen/qualitaetsmanagement-aufgaben-des-qualitaetszirkels

https://www.adberlin.com/neu/unser-angebot/personliche-assistenz
https://www.adberlin.com/neu/unser-angebot/dienstleistungen-fur-bezieherinnen-eines-personlichen-budgets
https://www.adberlin.com/neu/unsere-leistungen

https://www.adberlin.com/neu/mitarbeiterinnenbereich_startseite/wichtige-telefonnummern
https://www.adberlin.com/neu/weiterfuerende-informationen/leben-mit-behinderung-in-berlin-linksammlung
```

### 2.2 adberlin.com – bereits bekannte PDFs

```
http://www.adberlin.com/downloads/Flyer_persoenliche-Assistenz_web.pdf
http://www.adberlin.com/downloads/Flyer_persoenliches-Budget_web.pdf
http://www.adberlin.com/downloads/Leitbild_Handlungsgrundlagen.pdf
http://www.adberlin.com/downloads/Leitbild_umfassende%20Positionen.pdf
http://www.adberlin.com/downloads/2021-05-10%20_%2040%20Jahre%20ambulante%20Dienste%20_%20Endfassung.pdf
```

Vermutlich existieren unter `/downloads/` weitere Dateien. Nach lokalem
Mirror: `grep -oEi 'href="[^"]+\.pdf"' -r mirror/` ausführen, um weitere PDFs
zu entdecken; dann ergänzen.

### 2.3 betriebsrat-ad.de und Archiv

```
https://betriebsrat-ad.de/
https://betriebsrat-ad.de/billig-und-rechtlos/
https://betriebsrat-ad.de/betriebsvereinbarungen-aktuell/

https://betriebsrat-ad.site36.net/
https://betriebsrat-ad.site36.net/category/allgemein/
https://betriebsrat-ad.site36.net/2022/03/
https://betriebsrat-ad.site36.net/2022/03/29/corona-hygienezulage/
```

Für den Archiv-Site (`site36.net`) empfiehlt sich ein **vollständiger
wget-Mirror** (s.u.), weil dort jahrelange Beiträge + Anhänge liegen.

### 2.4 Ver.di & friends / Tarifkampagne

```
https://verdiandfriends.de/
https://verdiandfriends.de/die-liste/
https://verdiandfriends.de/tag/betriebsrat/
https://verdiandfriends.de/enzyklopaedie/vereinte-dienstleistungsgewerkschaft/

https://verdi-ad-lw.de/
https://verdi-ad-lw.de/haustarifvertrag-ambulante-dienste-e-v/
https://verdi-ad-lw.de/haustarifvertrag-neue-lebenswege/
https://verdi-ad-lw.de/2020/04/26/geschaeftsfuehrung-und-vorstand-von-ambulante-dienste-unterzeichnen-haustarifvertrag/
```

---

## 3. Bisher extrahierte Struktur (aus Search-Snippets)

Unsicherheiten sind mit `?` markiert – **lokal verifizieren**, bevor
veröffentlicht.

### 3.1 Vereins-Governance

- **Mitgliederversammlung** (~100 Mitglieder) – oberste Instanz
  - **Vorstand** (statutarisch 3–5 Personen; Mehrheit muss selbst auf
    Assistenz angewiesen sein):
    - Ursula („Uschi") Aurien
    - Dennis Jeromin
    - Michael Sühnel
    - _historisch:_ Matthias Vernaldi (†, war langjähriges Vorstandsmitglied)
  - **Geschäftsführung**: Uta Wehde

### 3.2 Einsatzstelle (operative Zentrale, Wilhelm-Kabus-Str. 21-35)

Auf der Seite `/assistenzdienst/einsatzstelle` sind laut Suchtreffer folgende
Funktionen gelistet (Namen fehlen in den Snippets):

- Sekretariat
- Geschäftsführung
- Verwaltungsleitung
- Pflegedienstleitung
- Team Pflegefachkräfte
- Personalabteilung
- Finanzbuchhaltung
- Rechtsberatung (Justiziariat)
- Qualitätsmanagement-Beauftragte\*r (inkl. Qualitätszirkel)
- Öffentlichkeitsarbeit / Kommunikation

### 3.3 Beratungsbüros (dezentral, 3 Einheiten)

- **Beratungsbüro Süd**
- **Beratungsbüro West** (Gneisenaustr. 2a, im Mehringhof, 10961 Berlin-Kreuzberg) – Zuordnung süd/west noch unklar, bitte lokal prüfen
- **Beratungsbüro Nord/Ost**

Aufgaben (laut Suche): psychosoziale, pflegerische und rechtliche Beratung,
Vermittlung persönlicher Assistenz, Qualifizierung/Fortbildung der
Assistent\*innen.

### 3.4 Leistungsbereiche (nicht Org-Einheiten, aber nützlich)

- Persönliche Assistenz (Kerngeschäft)
- Dienstleistungen für Bezieher\*innen eines Persönlichen Budgets
- Eingliederungshilfe
- Ambulante Pflege nach SGB XI
- Qualifizierung / Fortbildung

### 3.5 Interessenvertretung der Beschäftigten

- **Betriebsrat ambulante dienste e.V.** (Anzahl Mitglieder, Vorsitz etc. noch
  zu extrahieren aus `betriebsrat-ad.de`)
- **Tarifkommission** (Verhandlungspartner Haustarifvertrag, gemeinsam mit
  Neue Lebenswege GmbH, gewerkschaftlich begleitet durch ver.di)

---

## 4. Erster Organigramm-Entwurf (Mermaid)

Siehe `organigramm_draft.mmd`. Nach dem lokalen Scrape mit den echten Namen
auffüllen.

---

## 5. Lokaler Scrape – empfohlenes Vorgehen

### Vorbedingungen

- Maschine mit freiem Internet
- `wget`, `curl`, `pdftotext` (`poppler-utils`), optional `pandoc`

### 5.1 Mirror-Skript

Das Skript `scrape.sh` im selben Ordner macht einen respektvollen Mirror
(`--wait=1`, User-Agent, nur HTML + PDF, keine assets) aller relevanten
Hosts und entpackt die PDFs anschließend nach Textform.

```bash
cd organigramm
bash scrape.sh          # legt mirror/ und pdfs/ + pdf_text/ an
```

### 5.2 Extraktions-Pipeline nach dem Mirror

```bash
# Alle gefundenen PDFs finden und nachladen
grep -rhoEi 'href="[^"]+\.pdf"' mirror/ \
  | sed -E 's/href="//;s/"//' \
  | sort -u > pdfs/found_urls.txt

# Namen/Funktionen aus HTML extrahieren (grob)
grep -rhE '(Vorstand|Geschäftsführung|Leitung|Referent|Beauftragte|Sekretariat|Beratungsbüro)' mirror/ \
  | sort -u > raw/roles_hits.txt

# PDFs in Text
mkdir -p pdf_text
for f in pdfs/*.pdf; do
  pdftotext -layout "$f" "pdf_text/$(basename "${f%.pdf}").txt"
done
```

### 5.3 Daten-Pflege

- `data.yaml` (siehe dort) stückweise mit verifizierten Namen befüllen
- `organigramm_draft.mmd` entsprechend aktualisieren
- Optional: `organigramm.py` als Marimo-Notebook, das `data.yaml` liest und
  via graphviz/pydot rendert

---

## 6. Offene Fragen / TODO

- [ ] Vollständige Vorstandsliste inkl. Ämter (Vorsitz, Kasse etc.)
- [ ] Ist die Geschäftsführung allein Uta Wehde, oder gibt es eine
      Doppelspitze / stellvertretende GF?
- [ ] Namen der Pflegedienstleitung, Verwaltungsleitung, QM-Beauftragten,
      Personalleitung
- [ ] Vollständige Adressen + Leitungen der drei Beratungsbüros
- [ ] Aktuelle Mitgliederliste des Betriebsrats inkl. Freistellung
- [ ] Struktur der Tarifkommission (ad-Seite vs. Arbeitgeber-Seite)
- [ ] Verhältnis zu „Neue Lebenswege GmbH" (Schwester, Tochter, anderes?)
- [ ] BAD AD (`bad-ad.de`) – was genau ist das? (DNS aus Sandbox nicht auflösbar)

---

## 7. Quellenliste (für Verifikation)

- adberlin.com – <https://www.adberlin.com/neu/>
- betriebsrat-ad.de – <https://betriebsrat-ad.de/>
- betriebsrat-ad.site36.net – <https://betriebsrat-ad.site36.net/>
- verdiandfriends.de – <https://verdiandfriends.de/>
- verdi-ad-lw.de – <https://verdi-ad-lw.de/>
- Paritätischer Berlin – Mitgliederliste
- Hilfelotse Berlin – Einsatzstelle-Eintrag
- TopQM Berlin – Einrichtungsstammdaten
