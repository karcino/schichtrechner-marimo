// Datenmodell für das Organigramm.
// Jeder Knoten hat eine eindeutige id, Label, Rolle und Quellenverweise.
// verify: "ok" | "snippet" | "archive"
//   ok      – Angabe auf offizieller Seite (Impressum, adberlin.com) gesichert
//   snippet – aus Suchmaschinen-Snippet rekonstruiert, noch nicht direkt verifiziert
//   archive – aus Archiv / älterer Quelle

window.ORG_DATA = {
  sources: {
    S1: { title: "ambulante dienste e.V. – Startseite",           url: "https://www.adberlin.com/neu/" },
    S2: { title: "Der Verein ambulante dienste e. V.",            url: "https://www.adberlin.com/neu/der-verein-ambulante-dienste-e-v" },
    S3: { title: "Impressum ambulante dienste e.V.",              url: "https://www.adberlin.com/neu/impressum" },
    S4: { title: "Die Einsatzstelle in Berlin-Schöneberg",        url: "https://www.adberlin.com/neu/assistenzdienst/einsatzstelle" },
    S5: { title: "Unsere Beratungsbüros",                         url: "https://www.adberlin.com/neu/assistenzdienst/beratungsbueros" },
    S6: { title: "Qualitätsmanagement – Startseite",              url: "https://www.adberlin.com/neu/assistenzdienst/qualitatsmanagement-startseite" },
    S7: { title: "Leitbild (Handlungsgrundlagen, PDF)",           url: "http://www.adberlin.com/downloads/Leitbild_Handlungsgrundlagen.pdf" },
    S8: { title: "Leitbild (umfassende Positionen, PDF)",         url: "http://www.adberlin.com/downloads/Leitbild_umfassende%20Positionen.pdf" },
    S9: { title: "40 Jahre ambulante dienste e.V. (PDF)",         url: "http://www.adberlin.com/downloads/2021-05-10%20_%2040%20Jahre%20ambulante%20Dienste%20_%20Endfassung.pdf" },
    S10:{ title: "Flyer Persönliche Assistenz (PDF)",             url: "http://www.adberlin.com/downloads/Flyer_persoenliche-Assistenz_web.pdf" },
    S11:{ title: "Flyer Persönliches Budget (PDF)",               url: "http://www.adberlin.com/downloads/Flyer_persoenliches-Budget_web.pdf" },
    S12:{ title: "Betriebsrat ambulante dienste e.V.",            url: "https://betriebsrat-ad.de/" },
    S13:{ title: "Betriebsrat – Archiv (site36.net)",             url: "https://betriebsrat-ad.site36.net/" },
    S14:{ title: "Ver.di & friends (BR-Liste)",                   url: "https://verdiandfriends.de/" },
    S15:{ title: "Tarifkampagne ad + NLW",                        url: "https://verdi-ad-lw.de/" },
    S16:{ title: "Haustarifvertrag ambulante dienste e.V.",       url: "https://verdi-ad-lw.de/haustarifvertrag-ambulante-dienste-e-v/" },
    S17:{ title: "Haustarifvertrag Neue Lebenswege GmbH",         url: "https://verdi-ad-lw.de/haustarifvertrag-neue-lebenswege/" },
    S18:{ title: "Hilfelotse Berlin – Einsatzstelle-Eintrag",     url: "https://www.hilfelotse-berlin.de/detail/ambulante-dienste-e-v-einsatzstelle" },
    S19:{ title: "TopQM Berlin – Einrichtungsstammdaten",         url: "https://soziale-dienste.berlin.de/topqm-prod/topqw-web/Stammdaten.aspx?EIID=b846593d-e5c5-40be-9623-342c66c722e9" },
    S20:{ title: "Paritätischer Berlin – Mitgliederliste",        url: "https://www.paritaet-berlin.de/mitglieder/unsere-mitgliedsorganisationen" },
    S21:{ title: "Wichtige Kontaktdaten (Mitarbeiter*innen)",     url: "https://www.adberlin.com/neu/mitarbeiterinnenbereich_startseite/wichtige-telefonnummern" },
    S22:{ title: "LinkedIn ambulante dienste e.V.",               url: "https://de.linkedin.com/company/ad-berlin" },
    S23:{ title: "Kontaktseite ambulante dienste e.V.",           url: "https://www.adberlin.com/neu/kontakt" },
    S24:{ title: "Betriebsrat ad: Haustarifvertrag-Dossier",      url: "https://betriebsrat-ad.de/haustarifvertrag/" },
    S25:{ title: "Hilfelotse Berlin – Beratungsbüro Süd",         url: "https://www.hilfelotse-berlin.de/detail/ambulante-dienste-e-v-beratungsbuero-sued" },
    S26:{ title: "Stellenangebote ambulante dienste e.V.",        url: "https://www.adberlin.com/neu/stellen" },
    S27:{ title: "Qualifizierung von Assistent*innen",            url: "http://www.adberlin.com/neu/unser-angebot/qualifizierung-von-assistentinnen" },
    S28:{ title: "Urlaubs- / Reiseassistenz",                     url: "http://www.adberlin.com/neu/unser-angebot/personliche-assistenz/personliche-assistenz-in-besonderen-lebenssituationen/urlaubs-bzw-reiseassistenz" },
    S29:{ title: "Persönliche Assistenz – Leistungsbeschreibung", url: "https://www.adberlin.com/neu/unser-angebot/personliche-assistenz" },
    S30:{ title: "Berliner Rahmenvertrag § 131 SGB IX (PDF)",     url: "https://umsetzungsbegleitung-bthg.de/w/files/umsetzungsstand/2019-06-05_landesrahmenvertrag-berlin.pdf" },
    S31:{ title: "Eingliederungshilfe beantragen – Service Berlin", url: "https://service.berlin.de/dienstleistung/324484/" },
    S33:{ title: "Dienstleistungen für Persönliches Budget",      url: "https://www.adberlin.com/neu/unser-angebot/dienstleistungen-fur-bezieherinnen-eines-personlichen-budgets" },
    S36:{ title: "Das Örtliche – Beratungsbüro Süd (Gneisenaustr.)", url: "https://www.dasoertliche.de/Themen/Ambulante-Dienste-e-V-Beratungsb%C3%BCro-S%C3%BCd-Berlin-Kreuzberg-Gneisenaustr" },
  },

  nodes: [
    // Verein
    { id: "MV", label: "Mitglieder­versammlung",
      role: "Oberstes Organ des Vereins",
      description: "Ca. 100 Mitglieder. Wählt den Vorstand, beschließt Satzungsänderungen.",
      verify: "snippet", sources: ["S2","S9"] },

    { id: "VS", label: "Vorstand",
      role: "Gewählt durch die Mitgliederversammlung",
      description: "Satzung: 3–5 Personen, Mehrheit muss selbst auf Assistenz angewiesen sein. Aktuell namentlich bekannt: Ursula „Uschi\" Aurien, Dennis Jeromin, Michael Sühnel. Historisch: Matthias Vernaldi (†).",
      verify: "snippet", sources: ["S2","S3"] },

    { id: "GF", label: "Geschäftsführung<br/>Uta Wehde",
      role: "Hauptamtliche Geschäftsführerin",
      description: "Operative Leitung. Unterzeichnete 2020 mit dem Vorstand den Haustarifvertrag.",
      verify: "snippet", sources: ["S3","S16"] },

    // Einsatzstelle
    { id: "ES", label: "Einsatzstelle<br/>Wilhelm-Kabus-Str. 21-35",
      role: "Zentrale in Berlin-Schöneberg (10829), Eingang 2, 1. OG",
      description: "Umzug Juni 2023. Sekretariat Mo-Fr 8:00-16:00, Tel. 030/69 59 75-410, sekretariat@adberlin.org.",
      verify: "ok", sources: ["S4","S18","S19","S23"] },

    { id: "SEK", label: "Sekretariat",  role: "Zentrale Telefon/Post der Einsatzstelle",
      description: "Erste Anlaufstelle, Mo-Fr 8:00-16:00.", verify: "ok", sources: ["S4","S23"] },

    { id: "VL",  label: "Verwaltungs­leitung", role: "Leitung Verwaltung / kaufmännischer Bereich",
      description: "Namentlich noch nicht öffentlich zuordenbar.", verify: "snippet", sources: ["S4"] },

    { id: "PDL", label: "Pflege­dienst­leitung", role: "PDL nach SGB XI",
      description: "Führt das Team der Pflegefachkräfte. Namentlich noch nicht öffentlich zuordenbar.", verify: "snippet", sources: ["S4"] },

    { id: "PFK", label: "Pflegefachkräfte", role: "Team examinierter Pflegekräfte",
      description: "Begleitet pflegefachlich die Assistenz-Einsätze.", verify: "snippet", sources: ["S4"] },

    { id: "PA",  label: "Personal­abteilung", role: "HR – Personal & Lohn",
      description: "Einstellungen, Verträge, Lohnabrechnung.", verify: "snippet", sources: ["S4"] },

    { id: "FB",  label: "Finanz­buchhaltung", role: "Buchhaltung / Controlling",
      description: "Rechnungswesen, Abrechnung gegenüber Kostenträgern.", verify: "snippet", sources: ["S4"] },

    { id: "QM",  label: "Qualitäts­management + Qualitätszirkel", role: "QM-Beauftragte*r",
      description: "Pflegt das interne QM-Handbuch, organisiert den Qualitätszirkel.", verify: "ok", sources: ["S6","S19"] },

    { id: "REC", label: "Rechts­beratung", role: "Justiziariat",
      description: "Rechtsberatung für Kund*innen und für den Verein.", verify: "snippet", sources: ["S4"] },

    { id: "OEA", label: "Öffentlichkeits­arbeit", role: "Kommunikation & PR",
      description: "Website, Publikationen, Pressearbeit.", verify: "snippet", sources: ["S4"] },

    // Beratungsbüros
    { id: "BB",  label: "Beratungsbüros", role: "Dezentrale Beratung & Vermittlung",
      description: "Drei Büros: Süd, West, Nord/Ost. Psychosoziale, pflegerische und rechtliche Beratung, Vermittlung von persönlicher Assistenz, Qualifizierung der Assistent*innen.",
      verify: "ok", sources: ["S5"] },
    { id: "BBS", label: "Beratungsbüro Süd<br/>Gneisenaustr. 2a", role: "Beratungsbüro im Mehringhof, Kreuzberg",
      description: "Gneisenaustr. 2a, 10961 Berlin-Kreuzberg (Mehringhof). U6/U7. Korrigiert: dies ist das Süd-Büro, nicht West.",
      verify: "ok", sources: ["S25","S36","S5"] },
    { id: "BBW", label: "Beratungsbüro West", role: "Beratungsbüro",
      description: "Adresse und Leitung: lokal zu prüfen.", verify: "snippet", sources: ["S5"] },
    { id: "BBN", label: "Beratungsbüro Nord/Ost", role: "Beratungsbüro",
      description: "Adresse und Leitung: lokal zu prüfen.", verify: "snippet", sources: ["S5"] },

    // Leistungen
    { id: "L",   label: "Leistungs­bereiche", role: "Kerngeschäft",
      description: "Persönliche Assistenz · Persönliches Budget · Eingliederungshilfe · Ambulante Pflege (SGB XI) · Qualifizierung der Assistent*innen.",
      verify: "ok", sources: ["S1","S10","S11","S19"] },

    // Interessenvertretung
    { id: "BR",  label: "Betriebsrat<br/>ambulante dienste e.V.",
      role: "Mitbestimmung nach BetrVG",
      description: "Büros: Urbanstr. 100, 10967 Berlin · Wilhelm-Kabus-Str. 21-35, 10829 Berlin. Tel. 030-69597578, br@betriebsrat-ad.de. Öffnungszeiten: Mo+Fr 10-13 Uhr, Mi 12-15 Uhr.",
      verify: "ok", sources: ["S12","S13"] },

    { id: "TK",  label: "Tarifkommission",
      role: "Haustarifverhandlungen ad e.V. + Neue Lebenswege GmbH",
      description: "Verhandelt den Haustarifvertrag persönliche Assistenz (HTV). Gewerkschaftlich begleitet durch ver.di.",
      verify: "ok", sources: ["S15","S16","S17"] },

    { id: "VDF", label: "Ver.di & friends<br/>(BR-Liste)",
      role: "Kandidat*innen-Liste für Betriebsratswahlen",
      description: "Ver.di-nahe Liste bei den Betriebsratswahlen von ad e.V.",
      verify: "ok", sources: ["S14"] },

    // Verbundene
    { id: "NLW", label: "Neue Lebenswege GmbH",
      role: "Verbundenes Unternehmen (Schwester/Tochter)",
      description: "Teilt die Tarifkampagne mit ad e.V.; genaue gesellschaftsrechtliche Beziehung noch zu klären.",
      verify: "snippet", sources: ["S15","S17"] },

    // Dachverband
    { id: "DV",  label: "Paritätischer<br/>Wohlfahrtsverband Berlin",
      role: "Dachverband / Spitzenverband der freien Wohlfahrtspflege",
      description: "ad e.V. ist Mitglied im Paritätischen Landesverband Berlin.",
      verify: "snippet", sources: ["S20"] },
  ],

  edges: [
    ["MV","VS","wählt"],
    ["VS","GF","bestellt"],
    ["GF","ES",""],
    ["GF","BB",""],
    ["ES","SEK",""],
    ["ES","VL",""],
    ["ES","PDL",""],
    ["ES","QM",""],
    ["ES","REC",""],
    ["ES","OEA",""],
    ["VL","PA",""],
    ["VL","FB",""],
    ["PDL","PFK",""],
    ["BB","BBS",""],
    ["BB","BBW",""],
    ["BB","BBN",""],
    ["ES","L","erbringt"],
    ["BB","L","erbringt"],
    ["BR","ES","vertritt"],
    ["BR","BB","vertritt"],
    ["TK","GF","Haustarif"],
    ["TK","NLW","Haustarif"],
    ["VDF","BR","stellt Kandidat*innen"],
    ["DV","VS","Mitglied"],
  ],

  // Knoten in Untergraphen gruppieren (nur für visuelles Layout)
  groups: [
    { id: "VEREIN", label: "Verein (Governance)", nodes: ["MV","VS","GF"] },
    { id: "OPER",   label: "Operative Einsatzstelle · Wilhelm-Kabus-Str.", nodes: ["ES","SEK","VL","PDL","QM","REC","OEA","PA","FB","PFK"] },
    { id: "BBG",    label: "Beratungsbüros",     nodes: ["BB","BBS","BBW","BBN"] },
    { id: "IV",     label: "Interessen­vertretung", nodes: ["BR","TK","VDF"] },
    { id: "EXT",    label: "Verbunden / extern", nodes: ["NLW","DV"] },
    { id: "LEIST",  label: "Leistungen",         nodes: ["L"] },
  ],
};
