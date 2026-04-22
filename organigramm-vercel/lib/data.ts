export type Verify = "ok" | "snippet" | "archive";

export type Group =
  | "governance"
  | "operations"
  | "advisory"
  | "representation"
  | "external"
  | "services"
  | "clients"
  | "assistance"
  | "qualification"
  | "funding"
  | "legal";

export type OrgNode = {
  id: string;
  label: string;
  role: string;
  description: string;
  verify: Verify;
  group: Group;
  sources: string[];
  address?: string;
};

export type OrgEdge = {
  from: string;
  to: string;
  label?: string;
  /** Optional: Kante nur in Layern relevant (z.B. "funding"). Für Filter. */
  layer?: Group;
};

export const GROUPS: Record<Group, { label: string; color: string; dark: string }> = {
  governance:     { label: "Verein · Governance",        color: "#d8eadd", dark: "#1f3b2c" },
  operations:     { label: "Einsatzstelle",              color: "#dbeafe", dark: "#1e2658" },
  advisory:       { label: "Beratungsbüros",             color: "#fce7f3", dark: "#4d1d38" },
  assistance:     { label: "Assistenz-Formen",           color: "#ede9fe", dark: "#2a1f57" },
  qualification:  { label: "Qualifizierung",             color: "#ccfbf1", dark: "#134e4a" },
  services:       { label: "Leistungen",                 color: "#d1fae5", dark: "#1d3b2b" },
  clients:        { label: "Kund*innen",                 color: "#fde68a", dark: "#4a3a0a" },
  representation: { label: "Interessenvertretung",       color: "#fef3c7", dark: "#4a371a" },
  funding:        { label: "Kostenträger",               color: "#fecaca", dark: "#4a1f1f" },
  legal:          { label: "Rechtsrahmen",               color: "#e5e7eb", dark: "#33363d" },
  external:       { label: "Verbunden / extern",         color: "#f5f5f4", dark: "#2e3035" },
};

export const NODES: OrgNode[] = [
  // ── Governance ──────────────────────────────────────────────────────────
  { id: "MV", label: "Mitgliederversammlung", role: "Oberstes Organ",
    description: "Rund 100 Vereinsmitglieder. Wählt den Vorstand, beschließt Satzungsänderungen.",
    verify: "snippet", group: "governance", sources: ["S2","S9"] },

  { id: "VS", label: "Vorstand", role: "3–5 Personen, ehrenamtlich",
    description: "Satzung: Mehrheit muss selbst auf Assistenz angewiesen sein. Namentlich öffentlich bekannt: Ursula „Uschi\" Aurien, Dennis Jeromin, Michael Sühnel. Historisch: Matthias Vernaldi (†).",
    verify: "snippet", group: "governance", sources: ["S2","S3"] },

  { id: "GF", label: "Geschäftsführung", role: "Uta Wehde",
    description: "Hauptamtliche Geschäftsführung. Unterzeichnete 2020 mit dem Vorstand den Haustarifvertrag mit ver.di.",
    verify: "snippet", group: "governance", sources: ["S3","S16"] },

  // ── Einsatzstelle (Operations) ──────────────────────────────────────────
  { id: "ES", label: "Einsatzstelle", role: "Wilhelm-Kabus-Str. 21-35, 10829 Berlin",
    description: "Zentrale in Schöneberg, Eingang 2, 1. OG. Umzug Juni 2023. Sekretariat Mo–Fr 8:00–16:00, Tel. 030/69 59 75-410, sekretariat@adberlin.org.",
    verify: "ok", group: "operations", sources: ["S4","S18","S19","S23"],
    address: "Wilhelm-Kabus-Str. 21-35, 10829 Berlin-Schöneberg" },

  { id: "SEK", label: "Sekretariat", role: "Zentrale Anlaufstelle",
    description: "Erste telefonische und postalische Kontaktstelle. Mo–Fr 8–16 Uhr.",
    verify: "ok", group: "operations", sources: ["S4","S23"] },

  { id: "VL",  label: "Verwaltungsleitung", role: "Kaufmännische Leitung",
    description: "Leitet Personal und Buchhaltung. Name öffentlich nicht zugeordnet.",
    verify: "snippet", group: "operations", sources: ["S4"] },

  { id: "PDL", label: "Pflegedienstleitung", role: "PDL nach SGB XI",
    description: "Führt das Team der Pflegefachkräfte und koordiniert die pflegefachliche Begleitung.",
    verify: "snippet", group: "operations", sources: ["S4"] },

  { id: "PFK", label: "Pflegefachkräfte", role: "Team examinierter Pflegekräfte",
    description: "Pflegefachliche Begleitung der Assistenz-Einsätze, Behandlungspflege SGB V.",
    verify: "snippet", group: "operations", sources: ["S4"] },

  { id: "PA",  label: "Personalabteilung", role: "HR · Personal & Lohn",
    description: "Einstellungen, Verträge, Lohn- und Gehaltsabrechnung. Erreichbar: 030/69 59 75-422.",
    verify: "snippet", group: "operations", sources: ["S4","S26"] },

  { id: "FB",  label: "Finanzbuchhaltung", role: "Buchhaltung / Controlling",
    description: "Rechnungswesen, Abrechnung gegenüber Kostenträgern.",
    verify: "snippet", group: "operations", sources: ["S4"] },

  { id: "QM",  label: "Qualitätsmanagement", role: "QM-Beauftragte*r + Qualitätszirkel",
    description: "Pflegt das QM-Handbuch nach SGB XI-Vorgaben, organisiert den Qualitätszirkel.",
    verify: "ok", group: "operations", sources: ["S6","S19"] },

  { id: "REC", label: "Rechtsberatung (Justiziariat)", role: "Intern-juristisch",
    description: "Rechtsberatung intern und für Kund*innen, Schnittstelle zu den Beratungsbüros.",
    verify: "snippet", group: "operations", sources: ["S4"] },

  { id: "OEA", label: "Öffentlichkeitsarbeit", role: "Kommunikation & PR",
    description: "Website adberlin.com, Publikationen (Flyer, Leitbild), Pressearbeit.",
    verify: "snippet", group: "operations", sources: ["S4","S10","S11"] },

  // ── Beratungsbüros ──────────────────────────────────────────────────────
  { id: "BB",  label: "Beratungsbüros", role: "Dezentrale Beratung & Vermittlung",
    description: "Drei Büros (Süd, West, Nord/Ost). Sozialarbeitende werden vom Büropersonal unterstützt.",
    verify: "ok", group: "advisory", sources: ["S5"] },

  { id: "BBS", label: "Beratungsbüro Süd", role: "Gneisenaustr. 2a, Kreuzberg (Mehringhof)",
    description: "10961 Berlin-Kreuzberg, Mehringhof. Verkehrsanbindung U6/U7.",
    verify: "ok", group: "advisory", sources: ["S25","S36","S5"],
    address: "Gneisenaustr. 2a, 10961 Berlin-Kreuzberg (Mehringhof)" },

  { id: "BBW", label: "Beratungsbüro West", role: "Beratungsbüro",
    description: "Adresse und Leitung: lokal zu prüfen.",
    verify: "snippet", group: "advisory", sources: ["S5"] },

  { id: "BBN", label: "Beratungsbüro Nord/Ost", role: "Beratungsbüro",
    description: "Adresse und Leitung: lokal zu prüfen.",
    verify: "snippet", group: "advisory", sources: ["S5"] },

  // Rollen innerhalb der Beratungsbüros (ohne Namen)
  { id: "BB_SOZ",   label: "Sozialarbeit (Büro)", role: "Sozialpädagog*innen / Sozialarbeiter*innen",
    description: "Psychosoziale Beratung, Krisenintervention, Antragsunterstützung. In allen drei Büros.",
    verify: "snippet", group: "advisory", sources: ["S5","S29"] },
  { id: "BB_COORD", label: "Assistenz-Koordination", role: "Matching Kund*in ↔ Assistenz",
    description: "Koordiniert die Einsätze: Suche, Einarbeitung, Dienstplanung, Ausfall-Management. Ansprechperson für Kund*innen und Assistent*innen.",
    verify: "snippet", group: "advisory", sources: ["S4","S5","S29"] },
  { id: "BB_REC",   label: "Rechtsberatung (Büro)", role: "Juristische Erstberatung",
    description: "Hilfe bei EGH-Antrag, Widerspruch, Leistungsgewährung. Verweist für komplexe Fälle an Justiziariat der Einsatzstelle.",
    verify: "snippet", group: "advisory", sources: ["S4","S5"] },
  { id: "BB_ADMIN", label: "Büroassistenz / Verwaltung", role: "Büromanagement",
    description: "Unterstützt die Sozialarbeit organisatorisch, erste Anlaufstelle im Büro.",
    verify: "snippet", group: "advisory", sources: ["S5"] },

  // ── Kund*innen ──────────────────────────────────────────────────────────
  { id: "CL",  label: "Kund*innen", role: "Menschen mit körperlicher Behinderung",
    description: "Über 100 Kund*innen. Zielgruppe: Menschen mit körperlichen Behinderungen, die Persönliche Assistenz brauchen — viele als Bezieher*innen eines Persönlichen Budgets (§ 29 SGB IX).",
    verify: "ok", group: "clients", sources: ["S1","S29","S33"] },
  { id: "CL_BUD", label: "Budgetnehmer*innen", role: "Bezieher*innen eines Persönlichen Budgets",
    description: "Kund*innen, die Leistungen als Persönliches Budget beziehen (§ 29 SGB IX). ad e.V. bietet Dienstleistungen zur Budget-Verwaltung.",
    verify: "ok", group: "clients", sources: ["S11","S33"] },

  // ── Assistenz-Formen (ohne Namensnennung) ───────────────────────────────
  { id: "ASS",    label: "Persönliche Assistenz", role: "Kerngeschäft · Umfang",
    description: "Unterstützung in allen Lebensbereichen: Körperpflege (Duschen, Zahnpflege, Anziehen), Ernährung (Einkauf, Kochen), Haushalt (Putzen, Wäsche), Kommunikation. Einsätze 24/7 in wechselnden Teams.",
    verify: "ok", group: "assistance", sources: ["S29","S10"] },
  { id: "ASS_BASE",   label: "Grundassistenz", role: "Körperpflege · Ernährung · Haushalt",
    description: "Kern-Assistenzleistungen im Alltag.", verify: "ok", group: "assistance", sources: ["S29"] },
  { id: "ASS_COMM",   label: "Kommunikations­assistenz", role: "Kommunikation · Teilhabe",
    description: "Unterstützung bei der Kommunikation mit dem Umfeld.", verify: "ok", group: "assistance", sources: ["S29"] },
  { id: "ASS_NIGHT",  label: "Nachtassistenz",   role: "Nacht / Bereitschaft",
    description: "Begleitung in der Nacht, teilweise als Bereitschaft. HTV § 7 regelt Nachtzuschläge.",
    verify: "snippet", group: "assistance", sources: ["S16"] },
  { id: "ASS_TRAVEL", label: "Urlaubs-/Reise­assistenz", role: "Reisebegleitung · Wochenende",
    description: "Assistent*innen begleiten Kund*innen in den Urlaub oder auf Wochenendreisen.",
    verify: "ok", group: "assistance", sources: ["S28","S29"] },
  { id: "ASS_WORK",   label: "Arbeitsassistenz", role: "Am Arbeitsplatz",
    description: "Begleitung am Arbeitsplatz.", verify: "ok", group: "assistance", sources: ["S29"] },
  { id: "ASS_STUDY",  label: "Studienassistenz", role: "Hochschul-Kontext",
    description: "Unterstützung im Studium.",   verify: "ok", group: "assistance", sources: ["S29"] },
  { id: "ASS_HOSP",   label: "Krankenhaus­assistenz", role: "Klinik-Begleitung",
    description: "Assistenz im Krankenhaus.",   verify: "ok", group: "assistance", sources: ["S29"] },
  { id: "ASS_SCHOOL", label: "Schulassistenz",  role: "Unterricht · Schule",
    description: "Assistenz im Schulalltag.",   verify: "snippet", group: "assistance", sources: ["S29"] },
  { id: "ASS_LEIS",   label: "Freizeit­assistenz", role: "Kultur · Sport · Freunde",
    description: "Begleitung in der Freizeit.", verify: "snippet", group: "assistance", sources: ["S29"] },

  // ── Qualifizierung ──────────────────────────────────────────────────────
  { id: "Q",   label: "Qualifizierung", role: "Basic- und Anlass-Fortbildung",
    description: "Verpflichtende Basisqualifizierung für neu eingestellte Assistent*innen, plus bedarfsbezogene Fortbildungen zu bestimmten Behinderungen. Auch offen für externe Budget-Nehmer*innen.",
    verify: "ok", group: "qualification", sources: ["S27"] },
  { id: "Q_INTRO", label: "Modul Einführung", role: "Selbstbestimmt-Leben · PA-Geschichte",
    description: "Einführung: Selbstbestimmung behinderter Menschen, Entwicklung der Persönlichen Assistenz, Rechte & Haltung.",
    verify: "ok", group: "qualification", sources: ["S27"] },
  { id: "Q_PFLEGE", label: "Modul Pflege", role: "Hygiene · Pflege · Ernährung · Ausscheidung",
    description: "Hygiene, rechtliche Aspekte, Körperpflege, Ernährung, Ausscheidung.",
    verify: "ok", group: "qualification", sources: ["S27"] },
  { id: "Q_FB", label: "Anlass-Fortbildungen", role: "Behinderungsspezifisch",
    description: "Fortbildungen auf Anfrage zu spezifischen Behinderungen oder Themen.",
    verify: "ok", group: "qualification", sources: ["S27"] },

  // ── Leistungsbereiche ───────────────────────────────────────────────────
  { id: "L",   label: "Leistungsbereiche", role: "Kernangebot",
    description: "Persönliche Assistenz · Persönliches Budget · Eingliederungshilfe · Ambulante Pflege (SGB XI) · Qualifizierung der Assistent*innen.",
    verify: "ok", group: "services", sources: ["S1","S10","S11","S19","S29"] },

  // ── Interessenvertretung ────────────────────────────────────────────────
  { id: "BR",  label: "Betriebsrat", role: "Mitbestimmung nach BetrVG",
    description: "Büros: Urbanstr. 100, 10967 Berlin · Wilhelm-Kabus-Str. 21-35, 10829 Berlin. Tel. 030-69597578, br@betriebsrat-ad.de. Mo+Fr 10–13, Mi 12–15 Uhr.",
    verify: "ok", group: "representation", sources: ["S12","S13"],
    address: "Urbanstr. 100, 10967 Berlin · Wilhelm-Kabus-Str. 21-35, 10829 Berlin" },

  { id: "TK",  label: "Tarifkommission", role: "Haustarifverhandlungen ad + NLW",
    description: "Verhandelt den Haustarifvertrag persönliche Assistenz (HTV). Gewerkschaftlich begleitet durch ver.di.",
    verify: "ok", group: "representation", sources: ["S15","S16","S17","S24"] },

  { id: "VDF", label: "Ver.di & friends", role: "BR-Kandidat*innen-Liste",
    description: "Ver.di-nahe Liste bei den Betriebsratswahlen von ad e.V.",
    verify: "ok", group: "representation", sources: ["S14"] },

  { id: "VERDI", label: "ver.di", role: "Gewerkschaft (Vereinte Dienstleistungsgewerkschaft)",
    description: "Vertragspartnerin des Haustarifs; organisiert die Tarifkampagne ad + NLW.",
    verify: "ok", group: "representation", sources: ["S15","S24"] },

  // ── Verbunden / extern ──────────────────────────────────────────────────
  { id: "NLW", label: "Neue Lebenswege GmbH", role: "Verbundenes Unternehmen",
    description: "Gemeinsame Tarifkampagne mit ad e.V. Genaue gesellschaftsrechtliche Beziehung öffentlich nicht dokumentiert.",
    verify: "snippet", group: "external", sources: ["S15","S17"] },

  { id: "DV",  label: "Paritätischer Berlin", role: "Dachverband / Spitzenverband",
    description: "ad e.V. ist Mitglied im Paritätischen Wohlfahrtsverband Landesverband Berlin.",
    verify: "snippet", group: "external", sources: ["S20"] },

  // ── Kostenträger (funding) ──────────────────────────────────────────────
  { id: "F_SEN", label: "Senatsverw. Integration, Arbeit, Soziales", role: "Eingliederungshilfe-Träger Berlin",
    description: "Zuständig für Eingliederungshilfe nach SGB IX. Basis: Berliner Rahmenvertrag § 131 SGB IX vom 05.06.2019; Bedarf mittels Teilhabe-Instrument Berlin (TIB, § 118 SGB IX).",
    verify: "ok", group: "funding", sources: ["S30","S31","S34"] },
  { id: "F_BEZ", label: "Bezirksämter / Sozialämter", role: "Hilfe zur Pflege · wirtschaftliche Hilfen",
    description: "Sozialhilfe-Leistungen nach SGB XII, soweit keine andere Zuständigkeit besteht.",
    verify: "snippet", group: "funding", sources: ["S35"] },
  { id: "F_PK",  label: "Pflegekassen", role: "SGB XI · Pflegeversicherung",
    description: "Grundpflege und hauswirtschaftliche Versorgung nach Pflegegrad.",
    verify: "ok", group: "funding", sources: ["S35","S19"] },
  { id: "F_KK",  label: "Krankenkassen", role: "SGB V · Behandlungspflege",
    description: "Häusliche Krankenpflege nach § 37 SGB V auf ärztliche Verordnung.",
    verify: "snippet", group: "funding", sources: ["S35"] },
  { id: "F_BUD", label: "Persönliches Budget", role: "§ 29 SGB IX",
    description: "Leistungsträger-übergreifende Geldleistung. Kund*in wählt und organisiert Assistenz selbst; ad e.V. bietet begleitende Dienstleistungen.",
    verify: "ok", group: "funding", sources: ["S11","S33"] },

  // ── Rechtsrahmen ────────────────────────────────────────────────────────
  { id: "L_SGB9",  label: "SGB IX / BTHG", role: "Rehabilitation & Teilhabe",
    description: "Eingliederungshilfe und Teilhabeleistungen. BTHG gilt seit 2020 vollständig; Bedarfe werden in Berlin über das TIB ermittelt.",
    verify: "ok", group: "legal", sources: ["S30","S35"] },
  { id: "L_SGB11", label: "SGB XI", role: "Pflegeversicherung",
    description: "Leistungen ambulanter Pflege nach Pflegegrad.",
    verify: "ok", group: "legal", sources: ["S35","S19"] },
  { id: "L_SGB5",  label: "SGB V", role: "Gesetzliche Krankenversicherung",
    description: "Häusliche Krankenpflege (Behandlungspflege) nach § 37.",
    verify: "snippet", group: "legal", sources: ["S35"] },
  { id: "L_HTV",   label: "Haustarifvertrag (HTV)", role: "Tarifrecht · seit 01.07.2019",
    description: "Unterzeichnet 05.03.2020 (Fassung 27.04.2020) mit ver.di; rückwirkend ab 01.07.2019. Basiert methodisch auf TV-L. Ergänzende Betriebsvereinbarung zur Stufenanerkennung (§ 15 Abs. 2).",
    verify: "ok", group: "legal", sources: ["S16","S24","S32"] },
  { id: "L_BETRVG", label: "BetrVG", role: "Betriebsverfassungsgesetz",
    description: "Gesetzliche Grundlage für Betriebsrat und Mitbestimmung.",
    verify: "ok", group: "legal", sources: ["S12"] },
  { id: "L_TIB",   label: "TIB", role: "Teilhabe-Instrument Berlin (§ 118 SGB IX)",
    description: "Bedarfsermittlungsinstrument für die Berliner Eingliederungshilfe (seit 2019).",
    verify: "ok", group: "legal", sources: ["S30"] },
];

export const EDGES: OrgEdge[] = [
  // Governance
  { from: "MV", to: "VS", label: "wählt" },
  { from: "VS", to: "GF", label: "bestellt" },
  { from: "GF", to: "ES" },
  { from: "GF", to: "BB" },

  // Einsatzstelle intern
  { from: "ES", to: "SEK" },
  { from: "ES", to: "VL" },
  { from: "ES", to: "PDL" },
  { from: "ES", to: "QM" },
  { from: "ES", to: "REC" },
  { from: "ES", to: "OEA" },
  { from: "VL", to: "PA" },
  { from: "VL", to: "FB" },
  { from: "PDL", to: "PFK" },

  // Beratungsbüros
  { from: "BB", to: "BBS" },
  { from: "BB", to: "BBW" },
  { from: "BB", to: "BBN" },
  { from: "BBS", to: "BB_SOZ" },
  { from: "BBS", to: "BB_COORD" },
  { from: "BBS", to: "BB_ADMIN" },
  { from: "BBW", to: "BB_SOZ" },
  { from: "BBW", to: "BB_COORD" },
  { from: "BBW", to: "BB_ADMIN" },
  { from: "BBN", to: "BB_SOZ" },
  { from: "BBN", to: "BB_COORD" },
  { from: "BBN", to: "BB_ADMIN" },
  { from: "REC", to: "BB_REC", label: "unterstützt" },

  // Leistungen
  { from: "ES", to: "L", label: "erbringt" },
  { from: "BB", to: "L", label: "erbringt" },

  // Interessenvertretung
  { from: "BR", to: "ES",  label: "vertritt" },
  { from: "BR", to: "BB",  label: "vertritt" },
  { from: "TK", to: "GF",  label: "Haustarif" },
  { from: "TK", to: "NLW", label: "Haustarif" },
  { from: "VDF", to: "BR", label: "stellt" },
  { from: "VERDI", to: "TK", label: "begleitet" },
  { from: "VERDI", to: "VDF", label: "trägt" },

  // Extern
  { from: "DV", to: "VS", label: "Mitgliedschaft" },

  // Kund*innen
  { from: "CL", to: "CL_BUD", label: "teilweise" },
  { from: "BB_COORD", to: "CL", label: "vermittelt", layer: "clients" },
  { from: "ASS", to: "CL",     label: "dient",      layer: "clients" },

  // Assistenz-Formen — Untergliederung von ASS
  { from: "L", to: "ASS", label: "umfasst" },
  { from: "ASS", to: "ASS_BASE" },
  { from: "ASS", to: "ASS_COMM" },
  { from: "ASS", to: "ASS_NIGHT" },
  { from: "ASS", to: "ASS_TRAVEL" },
  { from: "ASS", to: "ASS_WORK" },
  { from: "ASS", to: "ASS_STUDY" },
  { from: "ASS", to: "ASS_HOSP" },
  { from: "ASS", to: "ASS_SCHOOL" },
  { from: "ASS", to: "ASS_LEIS" },

  // Qualifizierung
  { from: "PA", to: "Q", label: "organisiert" },
  { from: "Q", to: "Q_INTRO" },
  { from: "Q", to: "Q_PFLEGE" },
  { from: "Q", to: "Q_FB" },
  { from: "Q", to: "ASS", label: "qualifiziert für", layer: "qualification" },

  // Kostenträger / Finanzierung
  { from: "F_SEN",  to: "L", label: "EGH finanziert",        layer: "funding" },
  { from: "F_BEZ",  to: "L", label: "Hilfe zur Pflege",      layer: "funding" },
  { from: "F_PK",   to: "L", label: "Pflegeleistungen",      layer: "funding" },
  { from: "F_KK",   to: "L", label: "Behandlungspflege",     layer: "funding" },
  { from: "F_BUD",  to: "CL_BUD", label: "wird gewährt",     layer: "funding" },
  { from: "CL",     to: "F_BUD", label: "beantragt",         layer: "funding" },

  // Rechtsrahmen
  { from: "L_SGB9",  to: "F_SEN", label: "§ 131 SGB IX",     layer: "legal" },
  { from: "L_SGB11", to: "F_PK",  label: "Rechtsgrundlage",  layer: "legal" },
  { from: "L_SGB5",  to: "F_KK",  label: "§ 37 SGB V",       layer: "legal" },
  { from: "L_TIB",   to: "F_SEN", label: "Bedarfsermittlung",layer: "legal" },
  { from: "L_HTV",   to: "TK",    label: "Ergebnis",         layer: "legal" },
  { from: "L_BETRVG",to: "BR",    label: "Rechtsgrundlage",  layer: "legal" },
];

export const ORG_META = {
  name: "ambulante dienste e.V.",
  founded: "1981-05-08",
  employees: 700,
  members: 100,
  clients: 100,
  hq: "Wilhelm-Kabus-Str. 21-35, 10829 Berlin-Schöneberg",
  website: "https://www.adberlin.com/neu/",
  brWebsite: "https://betriebsrat-ad.de/",
  updated: "2026-04-22",
};
