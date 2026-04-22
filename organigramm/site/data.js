// ─────────────────────────────────────────────────────────────────────────────
// Datenbasis für die statische GitHub-Pages-Version.
// Gleiche Logik wie organigramm-vercel/lib/data.ts, nur als Plain-JS mit
// kompakter Darstellung (Mermaid) + Prozesse/Kanäle/Zitate in Sections.
//
// Verifikationsstufen:
//   verified  🟢 belegt auf Originalseite
//   inferred  🟡 aus Tarifvertrag/Struktur abgeleitet
//   assumed   🔴 nur Vermutung — bitte bestätigen
// ─────────────────────────────────────────────────────────────────────────────

window.ORG_DATA = {
  meta: {
    name: "ambulante dienste e.V.",
    founded: "1981-05-08",
    employees: 700,
    updated: "2026-04-22",
  },

  sources: {
    S1:  { title: "ambulante dienste e.V. – Startseite",           url: "https://www.adberlin.com/neu/",                                                                                  accessed: "2026-04-22" },
    S2:  { title: "Der Verein ambulante dienste e. V.",            url: "https://www.adberlin.com/neu/der-verein-ambulante-dienste-e-v",                                                   accessed: "2026-04-22" },
    S3:  { title: "Impressum ambulante dienste e.V.",              url: "https://www.adberlin.com/neu/impressum",                                                                          accessed: "2026-04-22" },
    S4:  { title: "Einsatzstelle in Berlin-Schöneberg",            url: "https://www.adberlin.com/neu/assistenzdienst/einsatzstelle",                                                       accessed: "2026-04-22" },
    S5:  { title: "Unsere Beratungsbüros",                         url: "https://www.adberlin.com/neu/assistenzdienst/beratungsbueros",                                                     accessed: "2026-04-22" },
    S6:  { title: "Qualitätsmanagement",                           url: "https://www.adberlin.com/neu/assistenzdienst/qualitatsmanagement-startseite",                                       accessed: "2026-04-22" },
    S10: { title: "Flyer Persönliche Assistenz (PDF)",             url: "http://www.adberlin.com/downloads/Flyer_persoenliche-Assistenz_web.pdf",                                           accessed: "2026-04-22" },
    S11: { title: "Flyer Persönliches Budget (PDF)",               url: "http://www.adberlin.com/downloads/Flyer_persoenliches-Budget_web.pdf",                                             accessed: "2026-04-22" },
    S12: { title: "Betriebsrat ambulante dienste e.V.",            url: "https://betriebsrat-ad.de/",                                                                                      accessed: "2026-04-22" },
    S13: { title: "Betriebsrat – Archiv",                          url: "https://betriebsrat-ad.site36.net/",                                                                              accessed: "2026-04-22" },
    S14: { title: "Ver.di & friends (BR-Liste)",                   url: "https://verdiandfriends.de/",                                                                                      accessed: "2026-04-22" },
    S15: { title: "Tarifkampagne ad + NLW",                        url: "https://verdi-ad-lw.de/",                                                                                         accessed: "2026-04-22" },
    S16: { title: "Haustarifvertrag ad e.V.",                      url: "https://verdi-ad-lw.de/haustarifvertrag-ambulante-dienste-e-v/",                                                   accessed: "2026-04-22" },
    S17: { title: "Haustarifvertrag Neue Lebenswege GmbH",         url: "https://verdi-ad-lw.de/haustarifvertrag-neue-lebenswege/",                                                         accessed: "2026-04-22" },
    S18: { title: "Hilfelotse Berlin – Einsatzstelle",             url: "https://www.hilfelotse-berlin.de/detail/ambulante-dienste-e-v-einsatzstelle",                                      accessed: "2026-04-22" },
    S19: { title: "TopQM Berlin – Stammdaten",                     url: "https://soziale-dienste.berlin.de/topqm-prod/topqw-web/Stammdaten.aspx?EIID=b846593d-e5c5-40be-9623-342c66c722e9", accessed: "2026-04-22" },
    S23: { title: "Kontaktseite ambulante dienste e.V.",           url: "https://www.adberlin.com/neu/kontakt",                                                                             accessed: "2026-04-22" },
    S24: { title: "BR: Haustarifvertrag-Dossier",                  url: "https://betriebsrat-ad.de/haustarifvertrag/",                                                                      accessed: "2026-04-22" },
    S25: { title: "Hilfelotse Berlin – Beratungsbüro Süd",         url: "https://www.hilfelotse-berlin.de/detail/ambulante-dienste-e-v-beratungsbuero-sued",                                 accessed: "2026-04-22" },
    S27: { title: "Qualifizierung von Assistent*innen",            url: "http://www.adberlin.com/neu/unser-angebot/qualifizierung-von-assistentinnen",                                       accessed: "2026-04-22" },
    S29: { title: "Persönliche Assistenz – Leistung",              url: "https://www.adberlin.com/neu/unser-angebot/personliche-assistenz",                                                   accessed: "2026-04-22" },
    S30: { title: "Berliner Rahmenvertrag § 131 SGB IX",            url: "https://umsetzungsbegleitung-bthg.de/w/files/umsetzungsstand/2019-06-05_landesrahmenvertrag-berlin.pdf",          accessed: "2026-04-22" },
    S36: { title: "Das Örtliche – BBS Gneisenaustr.",              url: "https://www.dasoertliche.de/Themen/Ambulante-Dienste-e-V-Beratungsb%C3%BCro-S%C3%BCd-Berlin-Kreuzberg-Gneisenaustr", accessed: "2026-04-22" },
    S37: { title: "§ 29 SGB IX – Persönliches Budget",              url: "https://www.gesetze-im-internet.de/sgb_9_2018/__29.html",                                                          accessed: "2026-04-22" },
    S38: { title: "§ 118 SGB IX – Bedarfsermittlungs-Instrument",   url: "https://www.gesetze-im-internet.de/sgb_9_2018/__118.html",                                                         accessed: "2026-04-22" },
    S39: { title: "§ 131 SGB IX – Landesrahmenvertrag",             url: "https://www.gesetze-im-internet.de/sgb_9_2018/__131.html",                                                         accessed: "2026-04-22" },
    S40: { title: "§ 37 SGB V – Häusliche Krankenpflege",           url: "https://www.gesetze-im-internet.de/sgb_5/__37.html",                                                               accessed: "2026-04-22" },
    S41: { title: "§ 36 SGB XI – Pflegesachleistung",               url: "https://www.gesetze-im-internet.de/sgb_11/__36.html",                                                              accessed: "2026-04-22" },
    S42: { title: "§ 87 BetrVG – Mitbestimmung Dienstplan",         url: "https://www.gesetze-im-internet.de/betrvg/__87.html",                                                              accessed: "2026-04-22" },
    S43: { title: "§ 80 BetrVG – Aufgaben Betriebsrat",             url: "https://www.gesetze-im-internet.de/betrvg/__80.html",                                                              accessed: "2026-04-22" },
    S45: { title: "Art. 9 DSGVO – besondere Kategorien",            url: "https://dsgvo-gesetz.de/art-9-dsgvo/",                                                                              accessed: "2026-04-22" },
    S46: { title: "§ 26 BDSG – Beschäftigtendaten",                 url: "https://www.gesetze-im-internet.de/bdsg_2018/__26.html",                                                           accessed: "2026-04-22" },
    S47: { title: "HiCare (OPTADATA) – Pflegesoftware",             url: "https://www.optadata.de/pflegesoftware/",                                                                          accessed: "2026-04-22" },
    S48: { title: "Schichtrechner (Einstieg, dieses Repo)",         url: "https://karcino.github.io/schichtrechner-marimo/",                                                                 accessed: "2026-04-22" },
  },

  citations: {
    HTV_7_6: {
      ref: "§ 7 Abs. 6 HTV",
      title: "Kurzfristige Einsätze — 25 % Zuschlag",
      quote: "Für Arbeitsleistungen, die ohne entsprechende Dienstplanung mit einem Vorlauf von weniger als 4 Kalendertagen (96 Stunden) angeordnet werden, erhält der/die Beschäftigte einen Zuschlag in Höhe von 25 % des individuellen Stundenentgelts.",
      source: "S16", source2: "S24",
      implication: "Wenn die Koordination kurzfristig eine Schicht vergibt, fällt der KV-Zuschlag auf Arbeits- und Fahrtzeit an.",
    },
    HTV_7_5: {
      ref: "§ 7 Abs. 5 HTV",
      title: "Wechselschicht-Zulage gedeckelt",
      quote: "Die Wechselschicht-Zulage für ständige Wechselschichtarbeit ist auf 105,00 € monatlich begrenzt.",
      source: "S16",
      implication: "Relevant für Assistent*innen mit rotierenden Nachtdiensten.",
    },
    HTV_7_1: {
      ref: "§ 7 Abs. 1 HTV",
      title: "Zuschläge Nacht / Sa / So / Feiertag",
      quote: "Für Arbeit an Sonntagen, gesetzlichen Feiertagen, Samstagen zwischen 13 und 21 Uhr sowie für Nachtarbeit werden Zuschläge gewährt.",
      source: "S16",
      implication: "Kerngrundlage der Lohnabrechnung.",
    },
    BETRVG_87: {
      ref: "§ 87 Abs. 1 Nr. 2, 3 BetrVG",
      title: "Mitbestimmung bei Arbeitszeit & Dienstplan",
      quote: "Der Betriebsrat hat [...] in folgenden Angelegenheiten mitzubestimmen: 2. Beginn und Ende der täglichen Arbeitszeit einschließlich der Pausen sowie Verteilung der Arbeitszeit auf die einzelnen Wochentage; 3. vorübergehende Verkürzung oder Verlängerung der betriebsüblichen Arbeitszeit.",
      source: "S42",
      implication: "Monatsdienstpläne und Mehrarbeit/Ausfall sind mitbestimmungspflichtig.",
    },
    BETRVG_80: {
      ref: "§ 80 BetrVG",
      title: "Allgemeine Aufgaben Betriebsrat",
      quote: "Der Betriebsrat hat darüber zu wachen, dass die zugunsten der Arbeitnehmer geltenden Gesetze [...] Tarifverträge und Betriebsvereinbarungen durchgeführt werden.",
      source: "S43",
      implication: "BR überwacht HTV-Einhaltung und KV-Zuschläge.",
    },
    SGB9_29: {
      ref: "§ 29 SGB IX",
      title: "Persönliches Budget",
      quote: "Auf Antrag werden Leistungen zur Teilhabe durch die Leistungsform eines Persönlichen Budgets ausgeführt, um den Leistungsberechtigten in eigener Verantwortung ein möglichst selbstbestimmtes Leben zu ermöglichen.",
      source: "S37",
      implication: "Grundlage für Budgetnehmer*innen — Kund*in wählt & organisiert Assistenz selbst.",
    },
    SGB9_118: {
      ref: "§ 118 SGB IX",
      title: "Instrumente zur Ermittlung des Reha-Bedarfs (TIB)",
      quote: "Zur einheitlichen und überprüfbaren Ermittlung des individuellen Rehabilitationsbedarfs verwenden die Rehabilitationsträger systematische Arbeitsprozesse und standardisierte Arbeitsmittel (Instrumente).",
      source: "S38",
      implication: "Berlin setzt dafür das Teilhabe-Instrument Berlin (TIB) ein.",
    },
    SGB9_131: {
      ref: "§ 131 SGB IX",
      title: "Landesrahmenvertrag Eingliederungshilfe",
      quote: "Die Träger der Eingliederungshilfe schließen mit den Vereinigungen der Leistungserbringer auf Landesebene gemeinsame Rahmenverträge.",
      source: "S39", source2: "S30",
      implication: "Berliner Rahmenvertrag (05.06.2019) legt Entgelt und Leistungen fest.",
    },
    SGB5_37: {
      ref: "§ 37 SGB V",
      title: "Häusliche Krankenpflege (Behandlungspflege)",
      quote: "Versicherte erhalten in ihrem Haushalt [...] neben der ärztlichen Behandlung häusliche Krankenpflege durch geeignete Pflegekräfte.",
      source: "S40",
      implication: "Basis für Pflegefachkräfte — auf ärztliche Verordnung, Krankenkasse zahlt.",
    },
    SGB11_36: {
      ref: "§ 36 SGB XI",
      title: "Pflegesachleistung",
      quote: "Pflegebedürftige der Pflegegrade 2 bis 5 haben [...] Anspruch auf körperbezogene Pflegemaßnahmen, pflegerische Betreuungsmaßnahmen sowie auf Hilfen bei der Haushaltsführung als Sachleistung.",
      source: "S41",
      implication: "Deckt Grundpflege und Hauswirtschaft über Pflegekasse nach Pflegegrad.",
    },
    DSGVO_9: {
      ref: "Art. 9 DSGVO",
      title: "Besondere Kategorien personenbezogener Daten",
      quote: "Die Verarbeitung von [...] Gesundheitsdaten [...] ist untersagt.",
      source: "S45",
      implication: "Adressen und Pflegeinformationen genießen besonderen Schutz — daher keine Adressen in SMS-Vermittlungen.",
    },
    BDSG_26: {
      ref: "§ 26 BDSG",
      title: "Datenverarbeitung im Beschäftigungsverhältnis",
      quote: "Personenbezogene Daten von Beschäftigten dürfen für Zwecke des Beschäftigungsverhältnisses verarbeitet werden, wenn dies [...] erforderlich ist.",
      source: "S46",
      implication: "Legitimiert Dienstplan-Verarbeitung in HiCare.",
    },
  },

  nodes: [
    // Governance
    { id: "MV", label: "Mitglieder&shy;versammlung",    role: "Oberstes Organ",                description: "Rund 100 Vereinsmitglieder. Wählt den Vorstand, beschließt Satzungsänderungen.", verify: "inferred", sources: ["S2"] },
    { id: "VS", label: "Vorstand",                      role: "3–5 Personen, ehrenamtlich",    description: "Satzung: Mehrheit muss selbst auf Assistenz angewiesen sein. Öffentlich bekannt: Ursula Aurien, Dennis Jeromin, Michael Sühnel.", verify: "verified", sources: ["S2","S3"] },
    { id: "GF", label: "Geschäftsführung<br/>Uta Wehde", role: "Hauptamtlich",                   description: "Operative Leitung. Unterzeichnete 2020 mit dem Vorstand den Haustarifvertrag.", verify: "verified", sources: ["S3","S16"] },
    // Einsatzstelle
    { id: "ES", label: "Einsatzstelle<br/>Wilhelm-Kabus-Str. 21-35", role: "Zentrale Berlin-Schöneberg", description: "Umzug Juni 2023. Sekretariat Mo–Fr 8:00–16:00, Tel. 030/69 59 75-410.", verify: "verified", sources: ["S4","S18","S23"] },
    { id: "SEK", label: "Sekretariat",     role: "Zentrale Anlaufstelle",    description: "Erste Anlaufstelle, Mo–Fr 8–16 Uhr.", verify: "verified", sources: ["S4","S23"] },
    { id: "VL",  label: "Verwaltungs&shy;leitung", role: "Kaufmännische Leitung",    description: "Leitet Personal und Buchhaltung.",     verify: "inferred", sources: ["S4"] },
    { id: "PDL", label: "Pflege&shy;dienst&shy;leitung", role: "PDL nach SGB XI",    description: "Führt das Team der Pflegefachkräfte.", verify: "inferred", sources: ["S4"], citations: ["SGB5_37","SGB11_36"] },
    { id: "PA",  label: "Personal&shy;abteilung",  role: "Personal & Lohn",          description: "Einstellungen, Verträge, Lohnabrechnung.", verify: "inferred", sources: ["S4"], citations: ["BDSG_26"] },
    { id: "FB",  label: "Finanz&shy;buchhaltung",  role: "Buchhaltung",              description: "Rechnungswesen, Abrechnung gegenüber Kostenträgern.", verify: "inferred", sources: ["S4"] },
    { id: "QM",  label: "Qualitäts&shy;management", role: "QM-Beauftragte*r",        description: "QM-Handbuch nach SGB XI, organisiert den Qualitätszirkel.", verify: "verified", sources: ["S6","S19"] },
    // Beratungsbüros
    { id: "BB",  label: "Beratungsbüros",          role: "Dezentrale Beratung & Vermittlung", description: "Drei Büros (Süd, West, Nord/Ost). Kern der Koordination.", verify: "verified", sources: ["S5"] },
    { id: "BBS", label: "BB Süd<br/>Gneisenaustr. 2a", role: "Mehringhof, Kreuzberg", description: "10961 Berlin-Kreuzberg, Mehringhof. U6/U7.", verify: "verified", sources: ["S25","S36","S5"] },
    { id: "BBW", label: "BB West",                 role: "Beratungsbüro",            description: "Adresse/Leitung: zu verifizieren.", verify: "inferred", sources: ["S5"] },
    { id: "BBN", label: "BB Nord/Ost",             role: "Beratungsbüro",            description: "Adresse/Leitung: zu verifizieren.", verify: "inferred", sources: ["S5"] },
    { id: "BB_COORD", label: "Assistenz-Koordination<br/>(pro Büro)", role: "Matching · Dienstplanung", description: "Kern-Funktion. Vermittelt Assistent*innen zu Kund*innen, plant Monatsdienste, organisiert Ausfall/KV. Nutzt HiCare, Telefon, E-Mail; SMS nur datenschutzkonform (keine Adressen).", verify: "inferred", sources: ["S5","S29","S47"], citations: ["HTV_7_6","DSGVO_9","BDSG_26"] },
    // Leistungen & Kund*innen
    { id: "L",   label: "Leistungsbereiche",       role: "Kernangebot",              description: "Persönliche Assistenz · Persönliches Budget · Eingliederungshilfe · Ambulante Pflege · Qualifizierung.", verify: "verified", sources: ["S10","S11","S29"] },
    { id: "CL",  label: "Kund*innen",              role: "Menschen mit körperl. Behinderung", description: "Über 100 Kund*innen, viele als Budgetnehmer*innen.", verify: "verified", sources: ["S11","S29"], citations: ["SGB9_29"] },
    { id: "ASS", label: "Persönliche Assistenz",   role: "Kerngeschäft, 24/7",       description: "Unterstützung in allen Lebensbereichen in wechselnden Teams.", verify: "verified", sources: ["S29","S10"], citations: ["HTV_7_1","HTV_7_6"] },
    // Qualifizierung
    { id: "Q",   label: "Qualifizierung",          role: "Basismodule + Anlass-FB",  description: "Einführung, Pflege-Basismodul und bedarfsbezogene Fortbildungen.", verify: "verified", sources: ["S27"] },
    // Interessenvertretung
    { id: "BR",  label: "Betriebsrat",             role: "Mitbestimmung nach BetrVG", description: "Büros: Urbanstr. 100 + Wilhelm-Kabus-Str. 21-35. br@betriebsrat-ad.de, 030-69597578.", verify: "verified", sources: ["S12","S13"], citations: ["BETRVG_87","BETRVG_80"] },
    { id: "TK",  label: "Tarif&shy;kommission",     role: "Haustarif ad + NLW",       description: "Verhandelt den HTV gemeinsam mit ver.di.", verify: "verified", sources: ["S15","S16","S17"], citations: ["HTV_7_6"] },
    { id: "VDF", label: "Ver.di & friends<br/>(BR-Liste)", role: "BR-Kandidat*innen", description: "Ver.di-nahe Liste bei den Betriebsratswahlen.", verify: "verified", sources: ["S14"] },
    // Verbunden
    { id: "NLW", label: "Neue Lebenswege GmbH",    role: "Verbundenes Unternehmen",  description: "Gemeinsame Tarifkampagne. Gesellschaftsrechtlich noch zu klären.", verify: "inferred", sources: ["S15","S17"] },
    { id: "DV",  label: "Paritätischer Berlin",    role: "Dachverband",              description: "ad e.V. ist Mitglied im Paritätischen Wohlfahrtsverband Landesverband Berlin.", verify: "inferred", sources: ["S3"] },
  ],

  edges: [
    ["MV","VS","wählt"], ["VS","GF","bestellt"],
    ["GF","ES",""], ["GF","BB",""],
    ["ES","SEK",""], ["ES","VL",""], ["ES","PDL",""], ["ES","QM",""],
    ["VL","PA",""], ["VL","FB",""],
    ["BB","BBS",""], ["BB","BBW",""], ["BB","BBN",""],
    ["BBS","BB_COORD",""], ["BBW","BB_COORD",""], ["BBN","BB_COORD",""],
    ["ES","L","erbringt"], ["BB","L","erbringt"],
    ["L","ASS","umfasst"],
    ["BB_COORD","ASS","vermittelt"],
    ["ASS","CL","dient"],
    ["PA","Q","organisiert"], ["Q","ASS","qualifiziert"],
    ["BR","ES","vertritt"], ["BR","BB","vertritt"],
    ["TK","GF","Haustarif"], ["TK","NLW","Haustarif"],
    ["VDF","BR","stellt"],
    ["DV","VS","Mitglied"],
  ],

  groups: [
    { id: "VEREIN", label: "Verein · Governance",   nodes: ["MV","VS","GF"] },
    { id: "OPER",   label: "Einsatzstelle",         nodes: ["ES","SEK","VL","PDL","QM","PA","FB"] },
    { id: "BBG",    label: "Beratungsbüros",        nodes: ["BB","BBS","BBW","BBN","BB_COORD"] },
    { id: "LEIS",   label: "Leistungen & Kund*innen", nodes: ["L","ASS","CL","Q"] },
    { id: "IV",     label: "Interessenvertretung",  nodes: ["BR","TK","VDF"] },
    { id: "EXT",    label: "Verbunden / extern",    nodes: ["NLW","DV"] },
  ],

  // ── Prozesse (als separate Section) ───────────────────────────────────
  processes: [
    {
      id: "P_MONATSPLAN",
      label: "Monats-Dienstplanung (feste Team-Planung)",
      role: "~4–6 Wochen Vorlauf",
      description: "Reguläre, planbare Assistenz-Einsätze werden in festen Teams vergeben. Ziel: Jede*r Assistent*in kennt den Plan mindestens 4 Wochen im Voraus, sodass kein KV-Zuschlag anfällt.",
      verify: "inferred",
      steps: [
        { n:1, label:"Bedarfsermittlung",   who:"Kund*in → Koordination", via:"Telefon",    detail:"Wunschstunden & Vertretungsbedarf werden ans Beratungsbüro gemeldet.",                       verify:"inferred" },
        { n:2, label:"Team-Abstimmung",     who:"Koordination ↔ Team",    via:"HiCare",     detail:"Verfügbarkeiten werden in HiCare abgestimmt, Konflikte (Ruhezeiten, HTV) geprüft.",           verify:"inferred" },
        { n:3, label:"Entwurf Dienstplan",  who:"Koordination",           via:"HiCare",     detail:"Planentwurf im Verwaltungssystem.",                                                             verify:"inferred" },
        { n:4, label:"BR-Zustimmung",       who:"Betriebsrat",            via:"",           detail:"Dienstplan ist mitbestimmungspflichtig (§ 87 BetrVG); BR zeichnet vor Veröffentlichung ab.",   verify:"inferred" },
        { n:5, label:"Veröffentlichung",    who:"Koordination → Team",    via:"E-Mail",     detail:"Finaler Plan per E-Mail, einsehbar in HiCare.",                                                 verify:"inferred" },
        { n:6, label:"Durchführung",        who:"Assistenz → Kund*in",    via:"",           detail:"Einsatz über den Monat.",                                                                       verify:"verified" },
      ],
      citations: ["HTV_7_6","HTV_7_5","BETRVG_87"],
    },
    {
      id: "P_KV",
      label: "Kurzfristige Vermittlung bei Ausfall (KV)",
      role: "< 4 Kalendertage Vorlauf",
      description: "Fällt eine Assistenz kurzfristig aus, vermittelt die Koordination Ersatz. Liegt weniger als 96 h Ankündigung vor, greift § 7 Abs. 6 HTV: 25 % Zuschlag auf Arbeits- und Fahrtzeit.",
      verify: "inferred",
      steps: [
        { n:1, label:"Ausfallmeldung",     who:"Assistenz → Koordination", via:"Telefon",  detail:"Ausfall wird telefonisch gemeldet — schnellster Kanal.",                                verify:"inferred" },
        { n:2, label:"Pool-Abfrage",       who:"Koordination → Pool",      via:"SMS",      detail:"Vertretung wird per SMS angefragt — OHNE Kund*innen-Adresse (Art. 9 DSGVO). Nur Name/Initialen und Zeitfenster.", verify:"inferred" },
        { n:3, label:"Zusage & Details",   who:"Assistenz → Koordination", via:"Telefon",  detail:"Adresse und Besonderheiten werden erst nach Zusage telefonisch übermittelt.",           verify:"inferred" },
        { n:4, label:"Eintrag in HiCare",  who:"Koordination",             via:"HiCare",   detail:"Vertretung wird in HiCare erfasst, KV-Flag gesetzt → Lohnabrechnung kennt 25 %-Zuschlag.", verify:"inferred" },
        { n:5, label:"Einsatz + Fahrtzeit", who:"Assistenz → Kund*in",      via:"",         detail:"Fahrtzeit zur/zu Kund*in wird ebenfalls mit 125 % vergütet.",                          verify:"verified" },
      ],
      citations: ["HTV_7_6","DSGVO_9"],
    },
    {
      id: "P_EINARBEITUNG",
      label: "Einarbeitung neue*r Assistent*in",
      role: "Basis-Qualifizierung + Team",
      description: "Neue Assistent*innen durchlaufen verpflichtende Basismodule und werden dann im Team eingeführt. Bedarfsspezifische Fortbildungen bei Einsatz bei neuen Kund*innen.",
      verify: "inferred",
      steps: [
        { n:1, label:"Einstellung",             who:"Personal → Assistenz",  via:"E-Mail",  detail:"Vertrag, Erstgespräch, Zuordnung zu einem Beratungsbüro.",          verify:"inferred" },
        { n:2, label:"Modul Einführung",        who:"Qualifizierung",        via:"",        detail:"Selbstbestimmt-Leben, Geschichte der Persönlichen Assistenz.",     verify:"verified" },
        { n:3, label:"Modul Pflege",            who:"Qualifizierung",        via:"",        detail:"Hygiene, Körperpflege, Ernährung, Ausscheidung, rechtl. Aspekte.", verify:"verified" },
        { n:4, label:"Kund*in-Kennenlernen",    who:"Koordination → Assistenz", via:"Telefon", detail:"Erstkontakt-Vermittlung; Kund*in entscheidet über Einsatz.",  verify:"inferred" },
        { n:5, label:"Team-Einarbeitung",       who:"Assistenz im Team",     via:"",        detail:"Doppelbesetzung mit erfahrener Assistenz.",                         verify:"inferred" },
        { n:6, label:"Anlass-Fortbildung",      who:"Qualifizierung",        via:"",        detail:"Bedarfsabhängig (z.B. Beatmung, spezifische Behinderung).",        verify:"verified" },
      ],
      citations: ["BDSG_26"],
    },
    {
      id: "P_TARIFCHECK",
      label: "HTV-Compliance-Check einer Schicht",
      role: "vor Lohnabrechnung",
      description: "Jede gebuchte Schicht wird gegen § 7 HTV geprüft: Nacht-, Samstag-, Sonntag-, Feiertags-Zuschläge, KV-Flag, Fahrtzeit. Fließt in die Lohnabrechnung.",
      verify: "verified",
      steps: [
        { n:1, label:"Schicht erfasst",     who:"Koordination", via:"HiCare", detail:"Zeitraum, Kund*in, Art (Nacht/Bereitschaft), KV-Flag.",     verify:"inferred" },
        { n:2, label:"HTV-Klassifizierung", who:"Buchhaltung",  via:"HiCare", detail:"Automatische Berechnung nach § 7 Abs. 1 HTV (Zuschläge).", verify:"inferred" },
        { n:3, label:"Wechselschicht-Cap",  who:"Buchhaltung",  via:"",        detail:"Wechselschichtzulage wird auf 105 €/Monat gecappt.",       verify:"verified" },
        { n:4, label:"Lohnlauf",            who:"Personal → Assistenz", via:"E-Mail", detail:"Abrechnung & Gehaltsmitteilung.",                   verify:"inferred" },
      ],
      citations: ["HTV_7_1","HTV_7_5","HTV_7_6"],
    },
  ],

  channels: [
    { id:"CH_TEL",    label:"Telefon",        role:"Schnellster Kanal",                   note:"Hauptkanal für kurzfristige Vermittlung, Ausfallmeldungen, sensible Abstimmungen.",           verify:"verified" },
    { id:"CH_MAIL",   label:"E-Mail",         role:"Dokumentierte Kommunikation",         note:"Offizielle Dienstplan-Veröffentlichung, Verträge, Lohnmitteilungen. sekretariat@adberlin.org.", verify:"verified" },
    { id:"CH_SMS",    label:"SMS",            role:"Schnell · datenschutz­reduziert",      note:"Für KV-Anfragen. WICHTIG: keine Kund*innen-Adressen (Art. 9 DSGVO) — Adressen folgen erst nach Zusage per Telefon.", verify:"verified" },
    { id:"CH_HICARE", label:"HiCare",         role:"Interne Verwaltungs­software",         note:"Zentrales System für Dienstpläne, Stammdaten, HTV-Klassifikation, Lohn-Export.",               verify:"verified" },
    { id:"CH_TEAM",   label:"Team-Treffen",   role:"Monatlich · physisch",                 note:"Abstimmung im Kund*innen-Team und Beratungsbüro.",                                             verify:"inferred" },
    { id:"CH_SUP",    label:"Supervision",    role:"Fallbezogen",                          note:"Entlastung bei psychosozial komplexen Situationen.",                                            verify:"assumed" },
  ],
};
