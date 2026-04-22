# Branchen-Economics: Ambulante Persönliche Assistenz in Deutschland

Stand: 2026-04-22 · Referenz: [Sub-Projekt G-Lite](../. claude/plans/plan-mode-cuddly-feather.md)

> **Zweck:** Grobe Größenordnung der wirtschaftlichen Rahmenbedingungen, in denen ad e.V. operiert. Kein Jahresabschluss, keine Schein-Präzision. Alle Zahlen sind mit Quelle und Zeitpunkt markiert; Hochrechnungen sind als solche gekennzeichnet.

---

## 1. Branche — Ambulante Pflege und Assistenz in Zahlen

Die Persönliche Assistenz, wie ad e.V. sie erbringt, ist statistisch Teil der **ambulanten Pflege** — auch wenn sie konzeptuell etwas anderes ist (Selbstbestimmung statt Pflege-im-engeren-Sinn). Destatis-Pflegestatistik erfasst sie unter diesem Dach, darum sind die Branchen-Zahlen so zu lesen.

| Kenngröße (Anfang 2023) | Wert | Quelle |
|---|---|---|
| Ambulante Pflegedienste in Deutschland | **17.122** | MDK-Bericht · Destatis-Pflegestatistik 2023 |
| Patient\*innen ambulant versorgt | **1.810.529** | dito |
| Mitarbeiter\*innen in ambulanter Pflege | **446.425** | Destatis Pflegestatistik 2023 |
| Anteil > 50 Jahre | **41 %** (→ ~183.000 Personen, Renten-Welle) | Destatis 2023 |

ad e.V. mit seinen ~700 Mitarbeitenden und ~100 Kund\*innen ist damit einer der **größeren Dienste**: rund 0,16 % der MA-Basis der Branche, aber typisch kleines Kund\*innen-Verhältnis (100 statt z.B. 150–200), weil Persönliche Assistenz oft 1-zu-1-Einsätze sind, nicht rotierende Touren.

---

## 2. Wer bezahlt? Kostenträger-Landschaft

| Kostenträger | Rechtsgrundlage | Typische Leistung | Wer zahlt |
|---|---|---|---|
| **Eingliederungshilfe-Träger** | SGB IX, seit 2018 BTHG | Assistenz zur gesellschaftlichen Teilhabe | Senatsverw. Soziales Berlin (F_SEN in [data.ts](../organigramm-vercel/lib/data.ts)) |
| **Sozialhilfe / Hilfe zur Pflege** | SGB XII | Pflegerische Versorgung, wenn kein anderer Träger zuständig | Bezirksämter (F_BEZ) |
| **Pflegekasse** | SGB XI | Grundpflege, hauswirtschaftliche Versorgung, Pflegegrad-abhängig | Pflegeversicherung (F_PK) |
| **Krankenkasse** | SGB V | Behandlungspflege (Medi-Gabe, Wundversorgung), auf Verordnung | Gesetzliche KK (F_KV) |
| **Persönliches Budget** | § 29 SGB IX | Budget in Eigenverwaltung, Leistungserbringer frei | Budget-empfangende Person |
| **Selbstzahlende** | — | seltener Fall | Kund\*in direkt |

Kernfall für ad e.V. laut Selbstdarstellung: **Persönliche Assistenz primär über Eingliederungshilfe (BTHG)**, ergänzt durch SGB-XI-Pflegesachleistung bei pflegerischem Anteil und SGB-V-Behandlungspflege bei medizinischem Anteil. Pflegekasse und Krankenkasse sind damit regelmäßig Co-Finanzierer neben dem Sozialamt.

---

## 3. Stundensätze und Kostenstruktur (öffentlich sichtbarer Bereich)

### Was Kostenträger zahlen (ungefähr, 2025)

In Berlin werden Fachleistungsstunden in der Eingliederungshilfe nach § 123 SGB IX vom Kostenträger (Senatsverwaltung) auf Basis des **Landesrahmenvertrags § 131 SGB IX** verhandelt. Konkrete Sätze sind einzelvertraglich; öffentlich zirkulierende Größenordnungen:

- **Fachleistungsstunde Persönliche Assistenz (Berlin, 2024/25):** ca. **30–40 €/h** inkl. aller Nebenkosten (Sozialversicherung, Urlaubsrückstellung, Overhead, Leerstände, Lohnfortzahlung).
- Davon fließt der größere Teil in Personalaufwand (Löhne + Arbeitgeber-SV ~20 %), der Rest in Verwaltung, Beratung, Fortbildung, Raum.

(*Quelle Größenordnung: Futura Berlin + BCIS-Fachartikel zur Fachleistungsstunden-Kalkulation. Keine offizielle ad-spezifische Zahl publiziert.*)

### Was Assistent\*innen bei ad e.V. brutto bekommen (sicher belegt)

Aus dem **Haustarifvertrag § 7 HTV** — direkt aus diesem Repo ([notebook_monat.py](../notebook_monat.py), [htv_calc.py](../htv_calc.py)) und den zitierten Quellen S16/S24:

- Entgeltgruppe 5, Erfahrungsstufe 2 (typisch für Assistenz ohne Pflege-Fachausbildung): Grund-Stundenlohn nach Tabelle Anlage C (gültig ab Februar 2025) ≈ **~15–16 €/h brutto** (Grundlohn; ohne Zuschläge).
- **§ 7 HTV-Zuschläge** hebeln das je nach Schicht deutlich an: Nacht-, Wochenend-, Feiertags-Zuschläge, KV-Zuschlag (+25 % bei < 96 h Vorlauf), Wechselschichtzulage gecappt 105 €/Monat.
- **Pflegefachkräfte** (EG-7 oder höher) liegen entsprechend höher.

Resultat: Der Unterschied „Kostenträger zahlt ~35 €/h" vs. „Assistent\*in bekommt ~15–16 €/h brutto" ist kein Skandal, sondern Ausdruck der Personalkosten-Struktur — die 35 € enthalten Arbeitgeber-SV (~20 %), Urlaubsrückstellung, Lohnfortzahlung (Krankheit), Weiterbildung, Leerstandskosten, Raum, IT, Koordination, Beratung und Verwaltung.

### Typische Kostenstruktur eines ambulanten Pflege-/Assistenzdienstes

Branchenüblich (Paritätischer-Publikationen, BAGüS-Kalkulationen):

| Kostenblock | Anteil am Umsatz | Bemerkung |
|---|---|---|
| Personalaufwand (Lohn + SV) | **80–85 %** | Kernkosten; Tarif-getrieben |
| Raum / Miete | 2–4 % | abhängig von Standort |
| Sachkosten / IT / Verwaltung | 5–8 % | Pflegesoftware, Büros, Fahrtkosten |
| Fortbildung / Qualifizierung | 1–3 % | gesetzlich teils vorgeschrieben |
| Rücklagen / Risiko | 2–5 % | nicht jede Schicht wird refinanziert |

Das bedeutet: Wenn der Kostenträger den Stundensatz um 1 € senkt, trifft das zu ~80 % direkt den Personalkosten-Topf. Das ist der ökonomische Kern der Tarifverhandlungen der Tarifkommission ver.di ad + NLW.

---

## 4. ad e.V. — eine Hochrechnung (keine Kontenabrechnung)

Mit öffentlich verfügbaren Zahlen lässt sich ad e.V.s Umsatz-Größenordnung grob schätzen:

| Größe | Annahme | Quelle |
|---|---|---|
| Mitarbeiter\*innen | ~700 (Range 501–1.000) | LinkedIn + adberlin.com |
| Kund\*innen | ~100 | adberlin.com |
| Durchschnittliche Assistenz-Stunden pro Kund\*in pro Monat | **~150 h** (Schätzung — BTHG-typisch bei Vollzeit-Assistenz) | Hochrechnung |
| Durchschnittliche Fachleistungsstunde (Mischkalkulation) | **~35 €** | Branchen-Größenordnung |

→ **Grobe Jahresumsatz-Größenordnung: 100 Kund\*innen × 150 h × 12 Monate × 35 € ≈ 6,3 Mio. €**

**Wichtig:** Das ist eine kommunizierte Größenordnung, keine Abrechnung. Die realen Stundenzahlen variieren stark (manche Kund\*innen brauchen 24/7-Assistenz — 720 h/Monat —, andere nur 30 h). Mischkalkulationen bei 700 MA × Voll-/Teilzeit-Anteilen ergäben ein anderes Bild. Öffentlich belastbare Zahl wäre nur ein publizierter Jahresabschluss (e.V. in DE nicht zwangsveröffentlichungspflichtig).

Zur Kalibrierung: Bei 80 % Personalkostenanteil wären das ≈ 5 Mio. € Jahres-Personalaufwand für 700 MA → ≈ 7.000 €/MA/Jahr. Das ist deutlich zu niedrig für Vollzeit-Vergütung — also arbeiten die 700 MA im Schnitt **in Teilzeit** (≈ 20 h/Woche im Branchen-Schnitt ambulanter Dienste). Das passt zur Assistenz-Realität: viele Assistent\*innen arbeiten studienbegleitend oder in Neben-Jobs.

---

## 5. Neue Lebenswege GmbH — Schwestergesellschaft mit eigener Bilanz

Seit [Sub-Projekt D](./proposals/2026-04-22-register-research.md) belegbar:

- Rechtsform: gGmbH (gemeinnützig)
- Register: **HRB 145571 B** AG Charlottenburg
- Sitz: Kurfürstenstr. 75, 10787 Berlin (anderer Standort als ad)
- Zweck: Integration behinderter Menschen, Wohlfahrt, Bildung, Jugend-/Altenpflege
- **Nicht mit ad e.V. gesellschaftsrechtlich verbunden** — kein Gesellschafter-Verhältnis im Handelsregister sichtbar

Als gGmbH **muss NLW Jahresabschlüsse beim Bundesanzeiger publizieren** (im Gegensatz zu ad e.V.). Das ist eine verfügbare Quelle für Präzisions-Upgrades dieses Dokuments — Paul kann im Bundesanzeiger abfragen und die konkreten Umsatz- und Personal-Zahlen von NLW nachlesen, die ad e.V. nicht publizieren muss.

Die Tarif-Parallelität über die ver.di-Tarifkommission bedeutet: wenn ad im HTV eine Lohnerhöhung verhandelt, trägt NLW das unabhängig, zahlt es aus der eigenen Bilanz — und umgekehrt. Keine Umlagen, keine Konzern-Finanzierung.

---

## 6. Was dieses Dokument NICHT weiß

- Den tatsächlichen Stundenlohn-Mittelwert bei ad e.V. 2025/26 (nur Branchen-Größenordnung aus HTV)
- Den tatsächlichen Jahresumsatz (Hochrechnung, keine Abrechnung)
- Die exakte Aufteilung SGB IX / SGB XI / SGB V / Persönliches Budget im ad-Mix
- Zuwendungen / Förderungen von Stiftungen, Senat, Bundesprogrammen (recherchierbar in Berliner Amtsblatt + Förderdatenbanken)
- Miet- und Raum-Kosten (privat zwischen ad und Vermieter)
- Steuerliche Rücklagen / Investitions-Planung

Für diese Präzision bräuchte es entweder ad-Innenperspektive (Sub-Projekt B nach Rechts-Check) oder den NLW-Bundesanzeiger-Abschluss als Proxy. Beides ist machbar, ist aber nicht Scope dieses G-Lite.

---

## 7. Quellen

| ID | Titel | URL |
|---|---|---|
| Destatis PM 2023/05 | Beschäftigte in ambulanten Pflegediensten verdoppelt | <https://www.destatis.de/DE/Presse/Pressemitteilungen/2023/05/PD23_N029_23.html> |
| Destatis Pflegestatistik 2023 | Statistischer Bericht | <https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Gesundheit/Pflege/Publikationen/Downloads-Pflege/statistischer-bericht-pflege-deutschlandergebnisse-5224001239005.html> |
| Destatis PM 2024/12 | 5,7 Mio. Pflegebedürftige Ende 2023 | <https://www.destatis.de/DE/Presse/Pressemitteilungen/2024/12/PD24_478_224.html> |
| Umsetzungsbegleitung BTHG | Assistenzleistungen im SGB IX | <https://umsetzungsbegleitung-bthg.de/bthg-kompass/bk-soziale-teilhabe/assistenzleistungen/> |
| Landesrahmenvertrag § 131 SGB IX Berlin (2019) | PDF | <https://umsetzungsbegleitung-bthg.de/w/files/umsetzungsstand/2019-06-05_landesrahmenvertrag-berlin.pdf> |
| Futura Berlin | Stundensatz-Info Assistenz | <https://www.futura-berlin.de/assistenz/persoenliche-assistenz/> |
| BCIS-Fachartikel | Fachleistungsstunde in der Eingliederungshilfe | <https://bcis-bildung.de/events/fachleistungsstunde-die-koenigsdisziplin-fuer-personenzentrierte-finanzierung-in-der-eingliederungshilfe/> |
| ad e.V. Haustarif | Dossier Betriebsrat | (S24 in [sources.ts](../organigramm-vercel/lib/sources.ts)) |
| NLW Handelsregister | HRB 145571 B | (S49 in [sources.ts](../organigramm-vercel/lib/sources.ts)) |

---

*Korrekturen willkommen — gern als Edit-UI-Vorschlag (Sub-Projekt E) oder direkt im Pull Request mit ergänzenden Quellen.*
