export type SourceKind =
  | "primary"
  | "secondary"
  | "archive"
  | "legal"
  | "internal"
  | "email-private"     // Nur im private-Build sichtbar; Label fix "Mailaustausch mit Arbeitgeber".
  | "shift-agg"         // Anonymisierte Schichtplaner-Aggregate (Spalten-Whitelist fail-closed).
  | "osint-register"    // Öffentliches Register (Vereinsregister, Handelsregister, Paritätischer, Hilfelotse, TopQM).
  | "financial-public"  // Öffentliche Finanzquelle (Bundesanzeiger, Jahresabschlüsse, Paritätischer-Berichte).
  | "ob1-synthesis";    // Zusammenfassung aus OB1 über mehrere Einzelquellen.

export type Source = {
  id: string;
  title: string;
  url: string;
  /** Stichdatum: Wann die URL das letzte Mal überprüft wurde (YYYY-MM-DD). */
  accessed?: string;
  /** Art der Quelle. */
  kind?: SourceKind;
  /** Dual-Build-Gate: "private" wird im public-Build rausgefiltert. Default = public. */
  visibility?: "public" | "private";
  /** IDs von zugrundeliegenden OB1-Einträgen (für kind="ob1-synthesis" oder "email-private"). */
  ob1_refs?: string[];
  /** Fix-Label-Override z.B. "Mailaustausch mit Arbeitgeber" — überschreibt title in der UI. */
  display_label_override?: string;
};

export const SOURCES: Record<string, Source> = {
  // ── Primärquellen: ad e.V. (adberlin.com) ─────────────────────────────
  S1:  { id: "S1",  title: "ambulante dienste e.V. – Startseite",                          url: "https://www.adberlin.com/neu/",                                                                                          accessed: "2026-04-22", kind: "primary" },
  S2:  { id: "S2",  title: "Der Verein ambulante dienste e. V.",                            url: "https://www.adberlin.com/neu/der-verein-ambulante-dienste-e-v",                                                          accessed: "2026-04-22", kind: "primary" },
  S3:  { id: "S3",  title: "Impressum ambulante dienste e.V.",                              url: "https://www.adberlin.com/neu/impressum",                                                                                 accessed: "2026-04-22", kind: "primary" },
  S4:  { id: "S4",  title: "Die Einsatzstelle in Berlin-Schöneberg",                        url: "https://www.adberlin.com/neu/assistenzdienst/einsatzstelle",                                                             accessed: "2026-04-22", kind: "primary" },
  S5:  { id: "S5",  title: "Unsere Beratungsbüros",                                         url: "https://www.adberlin.com/neu/assistenzdienst/beratungsbueros",                                                           accessed: "2026-04-22", kind: "primary" },
  S6:  { id: "S6",  title: "Qualitätsmanagement – Startseite",                              url: "https://www.adberlin.com/neu/assistenzdienst/qualitatsmanagement-startseite",                                             accessed: "2026-04-22", kind: "primary" },
  S7:  { id: "S7",  title: "Leitbild (Handlungsgrundlagen, PDF)",                           url: "http://www.adberlin.com/downloads/Leitbild_Handlungsgrundlagen.pdf",                                                     accessed: "2026-04-22", kind: "primary" },
  S8:  { id: "S8",  title: "Leitbild (umfassende Positionen, PDF)",                         url: "http://www.adberlin.com/downloads/Leitbild_umfassende%20Positionen.pdf",                                                 accessed: "2026-04-22", kind: "primary" },
  S9:  { id: "S9",  title: "40 Jahre ambulante dienste e.V. (PDF)",                         url: "http://www.adberlin.com/downloads/2021-05-10%20_%2040%20Jahre%20ambulante%20Dienste%20_%20Endfassung.pdf",             accessed: "2026-04-22", kind: "primary" },
  S10: { id: "S10", title: "Flyer Persönliche Assistenz (PDF)",                             url: "http://www.adberlin.com/downloads/Flyer_persoenliche-Assistenz_web.pdf",                                                 accessed: "2026-04-22", kind: "primary" },
  S11: { id: "S11", title: "Flyer Persönliches Budget (PDF)",                               url: "http://www.adberlin.com/downloads/Flyer_persoenliches-Budget_web.pdf",                                                   accessed: "2026-04-22", kind: "primary" },

  // ── Primärquellen: Betriebsrat ────────────────────────────────────────
  S12: { id: "S12", title: "Betriebsrat ambulante dienste e.V.",                            url: "https://betriebsrat-ad.de/",                                                                                             accessed: "2026-04-22", kind: "primary" },
  S13: { id: "S13", title: "Betriebsrat – Archiv (site36.net)",                             url: "https://betriebsrat-ad.site36.net/",                                                                                     accessed: "2026-04-22", kind: "archive" },
  S14: { id: "S14", title: "Ver.di & friends (BR-Liste)",                                   url: "https://verdiandfriends.de/",                                                                                            accessed: "2026-04-22", kind: "primary" },
  S15: { id: "S15", title: "Tarifkampagne ad + NLW",                                        url: "https://verdi-ad-lw.de/",                                                                                                accessed: "2026-04-22", kind: "primary" },
  S16: { id: "S16", title: "Haustarifvertrag ambulante dienste e.V.",                       url: "https://verdi-ad-lw.de/haustarifvertrag-ambulante-dienste-e-v/",                                                         accessed: "2026-04-22", kind: "legal" },
  S17: { id: "S17", title: "Haustarifvertrag Neue Lebenswege GmbH",                         url: "https://verdi-ad-lw.de/haustarifvertrag-neue-lebenswege/",                                                               accessed: "2026-04-22", kind: "legal" },

  // ── Verzeichnisse / Sekundärquellen ──────────────────────────────────
  S18: { id: "S18", title: "Hilfelotse Berlin – Einsatzstelle-Eintrag",                     url: "https://www.hilfelotse-berlin.de/detail/ambulante-dienste-e-v-einsatzstelle",                                             accessed: "2026-04-22", kind: "secondary" },
  S19: { id: "S19", title: "TopQM Berlin – Einrichtungsstammdaten",                         url: "https://soziale-dienste.berlin.de/topqm-prod/topqw-web/Stammdaten.aspx?EIID=b846593d-e5c5-40be-9623-342c66c722e9",      accessed: "2026-04-22", kind: "secondary" },
  S20: { id: "S20", title: "Paritätischer Berlin – Mitgliederliste",                        url: "https://www.paritaet-berlin.de/mitglieder/unsere-mitgliedsorganisationen",                                               accessed: "2026-04-22", kind: "secondary" },
  S21: { id: "S21", title: "Wichtige Kontaktdaten (Mitarbeiter*innen)",                     url: "https://www.adberlin.com/neu/mitarbeiterinnenbereich_startseite/wichtige-telefonnummern",                                accessed: "2026-04-22", kind: "primary" },
  S22: { id: "S22", title: "LinkedIn ambulante dienste e.V.",                               url: "https://de.linkedin.com/company/ad-berlin",                                                                               accessed: "2026-04-22", kind: "secondary" },
  S23: { id: "S23", title: "Kontaktseite ambulante dienste e.V.",                           url: "https://www.adberlin.com/neu/kontakt",                                                                                    accessed: "2026-04-22", kind: "primary" },
  S24: { id: "S24", title: "Betriebsrat ad: Haustarifvertrag (Dossier)",                    url: "https://betriebsrat-ad.de/haustarifvertrag/",                                                                             accessed: "2026-04-22", kind: "primary" },
  S25: { id: "S25", title: "Hilfelotse Berlin – Beratungsbüro Süd",                         url: "https://www.hilfelotse-berlin.de/detail/ambulante-dienste-e-v-beratungsbuero-sued",                                       accessed: "2026-04-22", kind: "secondary" },
  S26: { id: "S26", title: "Stellenangebote ambulante dienste e.V.",                        url: "https://www.adberlin.com/neu/stellen",                                                                                    accessed: "2026-04-22", kind: "primary" },
  S27: { id: "S27", title: "Qualifizierung von Assistent*innen",                            url: "http://www.adberlin.com/neu/unser-angebot/qualifizierung-von-assistentinnen",                                              accessed: "2026-04-22", kind: "primary" },
  S28: { id: "S28", title: "Urlaubs- / Reiseassistenz",                                     url: "http://www.adberlin.com/neu/unser-angebot/personliche-assistenz/personliche-assistenz-in-besonderen-lebenssituationen/urlaubs-bzw-reiseassistenz", accessed: "2026-04-22", kind: "primary" },
  S29: { id: "S29", title: "Persönliche Assistenz – Leistungsbeschreibung",                 url: "https://www.adberlin.com/neu/unser-angebot/personliche-assistenz",                                                         accessed: "2026-04-22", kind: "primary" },

  // ── Gesetzes-/Vertragstexte ──────────────────────────────────────────
  S30: { id: "S30", title: "Berliner Rahmenvertrag § 131 SGB IX (PDF)",                     url: "https://umsetzungsbegleitung-bthg.de/w/files/umsetzungsstand/2019-06-05_landesrahmenvertrag-berlin.pdf",                  accessed: "2026-04-22", kind: "legal" },
  S31: { id: "S31", title: "Eingliederungshilfe beantragen – Service Berlin",               url: "https://service.berlin.de/dienstleistung/324484/",                                                                        accessed: "2026-04-22", kind: "secondary" },
  S32: { id: "S32", title: "Betriebsrat ad (Archiv): HTV-Dossier",                          url: "https://betriebsrat-ad.site36.net/dossiers/haustarifvertrag/",                                                            accessed: "2026-04-22", kind: "archive" },
  S33: { id: "S33", title: "Dienstleistungen für Persönliches Budget",                      url: "https://www.adberlin.com/neu/unser-angebot/dienstleistungen-fur-bezieherinnen-eines-personlichen-budgets",              accessed: "2026-04-22", kind: "primary" },
  S34: { id: "S34", title: "Senatsverwaltung Integration, Arbeit, Soziales",                url: "https://www.berlin.de/sen/soziales/",                                                                                     accessed: "2026-04-22", kind: "secondary" },
  S35: { id: "S35", title: "Umsetzungsbegleitung BTHG – EGH vs. Pflege",                    url: "https://umsetzungsbegleitung-bthg.de/bthg-kompass/bk-schnittstellen/eingliederungshilfe-gesetzliche-pflegeversicherung-hilfe-zur-pflege/", accessed: "2026-04-22", kind: "secondary" },
  S36: { id: "S36", title: "Das Örtliche – Beratungsbüro Süd",                              url: "https://www.dasoertliche.de/Themen/Ambulante-Dienste-e-V-Beratungsb%C3%BCro-S%C3%BCd-Berlin-Kreuzberg-Gneisenaustr",     accessed: "2026-04-22", kind: "secondary" },

  // ── Gesetze direkt (dejure.org) ──────────────────────────────────────
  S37: { id: "S37", title: "§ 29 SGB IX – Persönliches Budget",                              url: "https://www.gesetze-im-internet.de/sgb_9_2018/__29.html",                                                                 accessed: "2026-04-22", kind: "legal" },
  S38: { id: "S38", title: "§ 118 SGB IX – Bedarfsermittlungs-Instrument (TIB)",             url: "https://www.gesetze-im-internet.de/sgb_9_2018/__118.html",                                                                accessed: "2026-04-22", kind: "legal" },
  S39: { id: "S39", title: "§ 131 SGB IX – Landesrahmenvertrag",                             url: "https://www.gesetze-im-internet.de/sgb_9_2018/__131.html",                                                                accessed: "2026-04-22", kind: "legal" },
  S40: { id: "S40", title: "§ 37 SGB V – Häusliche Krankenpflege",                           url: "https://www.gesetze-im-internet.de/sgb_5/__37.html",                                                                      accessed: "2026-04-22", kind: "legal" },
  S41: { id: "S41", title: "§ 36 SGB XI – Pflegesachleistung",                               url: "https://www.gesetze-im-internet.de/sgb_11/__36.html",                                                                     accessed: "2026-04-22", kind: "legal" },
  S42: { id: "S42", title: "§ 87 BetrVG – Mitbestimmung bei Arbeitszeit / Dienstplänen",     url: "https://www.gesetze-im-internet.de/betrvg/__87.html",                                                                     accessed: "2026-04-22", kind: "legal" },
  S43: { id: "S43", title: "§ 80 BetrVG – Allgemeine Aufgaben des Betriebsrats",             url: "https://www.gesetze-im-internet.de/betrvg/__80.html",                                                                     accessed: "2026-04-22", kind: "legal" },
  S44: { id: "S44", title: "Art. 6 DSGVO – Rechtmäßigkeit der Verarbeitung",                 url: "https://dsgvo-gesetz.de/art-6-dsgvo/",                                                                                    accessed: "2026-04-22", kind: "legal" },
  S45: { id: "S45", title: "Art. 9 DSGVO – Besondere Kategorien personenbezogener Daten",    url: "https://dsgvo-gesetz.de/art-9-dsgvo/",                                                                                    accessed: "2026-04-22", kind: "legal" },
  S46: { id: "S46", title: "§ 32 BDSG – Datenverarbeitung für Beschäftigungsverhältnisse",   url: "https://www.gesetze-im-internet.de/bdsg_2018/__26.html",                                                                  accessed: "2026-04-22", kind: "legal" },

  // ── Interne / Software ───────────────────────────────────────────────
  S47: { id: "S47", title: "HiCare (OPTADATA) – Pflege-Verwaltungssoftware",                 url: "https://www.optadata.de/pflegesoftware/",                                                                                 accessed: "2026-04-22", kind: "secondary" },
  S48: { id: "S48", title: "ad e.V. – Schichtrechner / HTV-Rechner (dieses Repo)",           url: "https://karcino.github.io/schichtrechner-marimo/",                                                                        accessed: "2026-04-22", kind: "internal" },

  // ── OSINT-Register (Sub-Projekt D) ────────────────────────────────────
  S49: { id: "S49", title: "Handelsregisterauszug Neue Lebenswege GmbH (HRB 145571 B)",       url: "https://www.handelsregister-online.de/handelsregisterauszug/Berlin/Charlottenburg-Berlin/Neue-Lebenswege-GmbH",            accessed: "2026-04-22", kind: "osint-register" },
  S50: { id: "S50", title: "NorthData – Neue Lebenswege GmbH (HRB 145571 B Charlottenburg)",  url: "https://www.northdata.com/Neue%20Lebenswege%20GmbH,%20Berlin/Amtsgericht%20Charlottenburg%20(Berlin)%20HRB%20145571%20B",  accessed: "2026-04-22", kind: "osint-register" },
  S51: { id: "S51", title: "Gemeinsames Registerportal der Länder (Recherche-Einstieg)",      url: "https://www.handelsregister.de/rp_web/mask.do?Typ=n",                                                                     accessed: "2026-04-22", kind: "osint-register" },
};
