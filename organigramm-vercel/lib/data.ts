// ─────────────────────────────────────────────────────────────────────────────
// Datenmodell: Knoten, Kanten, Prozesse, Vermittlungsmodi, Kommunikations­kanäle
// + rechtliche Zitate mit nachvollziehbarem Beleg.
//
// Verifikationsstufen (neues System, abwärtskompatibel):
//   verified  🟢 — direkt auf der Original-Website/im Vertrag belegt
//   inferred  🟡 — aus Tarifvertrag / Branche / Struktur plausibel abgeleitet
//   assumed   🔴 — nur Vermutung, braucht Bestätigung (Panel warnt)
//
// Historische Flags (werden visuell wie folgt abgebildet):
//   ok       → verified
//   snippet  → inferred
//   archive  → verified (aus Archivquelle)
// ─────────────────────────────────────────────────────────────────────────────

export type Verify = "verified" | "inferred" | "assumed" | "ok" | "snippet" | "archive";

export type Group =
  // ── klassische Struktur-Ebenen ──────────────────────────────────────────
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
  | "legal"
  // ── neu: Prozesse / Modi / Kommunikation ────────────────────────────────
  | "process"
  | "mode"
  | "channel";

export type OrgNode = {
  id: string;
  label: string;
  role: string;
  description: string;
  verify: Verify;
  group: Group;
  sources: string[];
  /** Optional: Zitate (CIT_* IDs), die diese Rolle / Aussage belegen. */
  citations?: string[];
  address?: string;
};

export type OrgEdge = {
  from: string;
  to: string;
  label?: string;
  /** Nur in Layern relevant (z.B. "funding"). Für Filter. */
  layer?: Group;
  /** Wenn vorhanden: Kante ist Teil eines Prozesses (PROC-ID), nicht der Struktur. */
  process?: string;
  /** Kanten-spezifischer Verifikations-Status. */
  verify?: Verify;
};

// ── Rechtsbezogene Zitate ────────────────────────────────────────────────────
export type Citation = {
  id: string;
  /** Kurz-Referenz, z.B. "§ 7 Abs. 6 HTV" oder "§ 87 Abs. 1 Nr. 2 BetrVG". */
  ref: string;
  /** Was es regelt, in 1 Zeile. */
  title: string;
  /** Wörtliches Zitat aus dem Vertrag/Gesetz. */
  quote: string;
  /** Quelle (Source-ID → url + accessed). */
  source: string;
  /** Optional: ergänzende Quelle. */
  source2?: string;
  /** Anwendungshinweis: wie wirkt sich das konkret aus. */
  implication?: string;
};

export const CITATIONS: Record<string, Citation> = {
  // ── Haustarifvertrag ────────────────────────────────────────────────────
  HTV_7_6: {
    id: "HTV_7_6",
    ref: "§ 7 Abs. 6 HTV",
    title: "Kurzfristige Einsätze (KV) – 25 % Zuschlag",
    quote:
      "Für Arbeitsleistungen, die ohne entsprechende Dienstplanung mit einem Vorlauf von weniger als 4 Kalendertagen (96 Stunden) angeordnet werden, erhält der/die Beschäftigte einen Zuschlag in Höhe von 25 % des individuellen Stundenentgelts.",
    source: "S16",
    source2: "S24",
    implication:
      "Wenn die Koordination der Beratungsbüros kurzfristig eine Schicht an eine*n Assistent*in vergibt, fällt der KV-Zuschlag an – sowohl auf Arbeits- als auch Fahrtzeit.",
  },
  HTV_7_5: {
    id: "HTV_7_5",
    ref: "§ 7 Abs. 5 HTV",
    title: "Wechselschicht-Zulage gecappt (105 €/Monat)",
    quote:
      "Die Wechselschicht-Zulage für ständige Wechselschichtarbeit ist auf 105,00 € monatlich begrenzt.",
    source: "S16",
    source2: "S32",
    implication:
      "Betrifft Assistent*innen in Teams mit rotierenden Nachtdiensten. Relevant für die Monatsdienstplanung.",
  },
  HTV_7_1: {
    id: "HTV_7_1",
    ref: "§ 7 Abs. 1 HTV",
    title: "Zuschläge Nacht / Sa / So / Feiertag",
    quote:
      "Für Arbeit an Sonntagen, gesetzlichen Feiertagen, Samstagen zwischen 13 und 21 Uhr sowie für Nachtarbeit werden Zuschläge gewährt.",
    source: "S16",
    implication:
      "Kerngrundlage der Lohnabrechnung. Jede Schicht-Zuordnung im Dienstplan hat finanzielle Folgen.",
  },
  // ── Betriebsverfassungsgesetz ───────────────────────────────────────────
  BETRVG_87: {
    id: "BETRVG_87",
    ref: "§ 87 Abs. 1 Nr. 2, 3 BetrVG",
    title: "Mitbestimmung bei Arbeitszeit & Dienstplan",
    quote:
      "Der Betriebsrat hat, soweit eine gesetzliche oder tarifliche Regelung nicht besteht, in folgenden Angelegenheiten mitzubestimmen: 2. Beginn und Ende der täglichen Arbeitszeit einschließlich der Pausen sowie Verteilung der Arbeitszeit auf die einzelnen Wochentage; 3. vorübergehende Verkürzung oder Verlängerung der betriebsüblichen Arbeitszeit.",
    source: "S42",
    implication:
      "Monatsdienstpläne und Regelungen zu Mehrarbeit/Ausfall sind mitbestimmungs­pflichtig: Der Betriebsrat muss zustimmen.",
  },
  BETRVG_80: {
    id: "BETRVG_80",
    ref: "§ 80 BetrVG",
    title: "Allgemeine Aufgaben Betriebsrat",
    quote:
      "Der Betriebsrat hat darüber zu wachen, dass die zugunsten der Arbeitnehmer geltenden Gesetze, Verordnungen, Unfallverhütungs­vorschriften, Tarifverträge und Betriebsvereinbarungen durchgeführt werden.",
    source: "S43",
    implication:
      "BR überwacht Einhaltung des HTV, inkl. korrekter KV-Zuschläge und Dienstplan-Regeln.",
  },
  // ── SGB IX (BTHG) ───────────────────────────────────────────────────────
  SGB9_29: {
    id: "SGB9_29",
    ref: "§ 29 SGB IX",
    title: "Persönliches Budget",
    quote:
      "Auf Antrag werden Leistungen zur Teilhabe durch die Leistungsform eines Persönlichen Budgets ausgeführt, um den Leistungsberechtigten in eigener Verantwortung ein möglichst selbstbestimmtes Leben zu ermöglichen.",
    source: "S37",
    implication:
      "Grundlage für Budget­nehmer*innen bei ad e.V. — Kund*in wählt & organisiert Assistenz selbst; ad e.V. übernimmt Verwaltung.",
  },
  SGB9_118: {
    id: "SGB9_118",
    ref: "§ 118 SGB IX",
    title: "Instrumente zur Ermittlung des Rehabilitationsbedarfs",
    quote:
      "Zur einheitlichen und überprüfbaren Ermittlung des individuellen Rehabilitationsbedarfs verwenden die Rehabilitationsträger systematische Arbeitsprozesse und standardisierte Arbeitsmittel (Instrumente).",
    source: "S38",
    implication:
      "Berlin setzt hierfür das Teilhabe-Instrument Berlin (TIB) um — Kund*innen durchlaufen diese Bedarfsermittlung.",
  },
  SGB9_131: {
    id: "SGB9_131",
    ref: "§ 131 SGB IX",
    title: "Landesrahmenvertrag Eingliederungshilfe",
    quote:
      "Die Träger der Eingliederungshilfe schließen mit den Vereinigungen der Leistungserbringer auf Landesebene gemeinsame Rahmenverträge.",
    source: "S39",
    source2: "S30",
    implication:
      "Der Berliner Rahmenvertrag (05.06.2019) legt u.a. Entgelt­systematik und Leistungsbeschreibung fest.",
  },
  // ── SGB XI / V ──────────────────────────────────────────────────────────
  SGB5_37: {
    id: "SGB5_37",
    ref: "§ 37 SGB V",
    title: "Häusliche Krankenpflege (Behandlungspflege)",
    quote:
      "Versicherte erhalten in ihrem Haushalt, ihrer Familie oder sonst an einem geeigneten Ort […] neben der ärztlichen Behandlung häusliche Krankenpflege durch geeignete Pflegekräfte, wenn Krankenhausbehandlung geboten, aber nicht ausführbar ist, oder wenn sie durch die häusliche Krankenpflege vermieden oder verkürzt wird.",
    source: "S40",
    implication:
      "Basis für das Pflegefachkräfte-Team: Verordnung durch Arzt → Krankenkasse zahlt.",
  },
  SGB11_36: {
    id: "SGB11_36",
    ref: "§ 36 SGB XI",
    title: "Pflegesachleistung",
    quote:
      "Pflegebedürftige der Pflegegrade 2 bis 5 haben […] Anspruch auf körperbezogene Pflegemaßnahmen, pflegerische Betreuungsmaßnahmen sowie auf Hilfen bei der Haushaltsführung als Sachleistung.",
    source: "S41",
    implication:
      "Deckt Grundpflege / Hauswirtschaft über die Pflegekasse nach Pflegegrad.",
  },
  // ── Datenschutz ─────────────────────────────────────────────────────────
  DSGVO_9: {
    id: "DSGVO_9",
    ref: "Art. 9 DSGVO",
    title: "Besondere Kategorien personenbezogener Daten",
    quote:
      "Die Verarbeitung von […] Gesundheitsdaten […] ist untersagt.",
    source: "S45",
    implication:
      "Adressen + Pflege­informationen der Kund*innen sind besonders schutzbedürftig. Daher werden in SMS-Vermittlungen keine Adressen übertragen — nur Namen/Initialen und Verweise.",
  },
  BDSG_26: {
    id: "BDSG_26",
    ref: "§ 26 BDSG",
    title: "Datenverarbeitung für Beschäftigungsverhältnisse",
    quote:
      "Personenbezogene Daten von Beschäftigten dürfen für Zwecke des Beschäftigungsverhältnisses verarbeitet werden, wenn dies für die Entscheidung über die Begründung oder für die Durchführung oder Beendigung des Beschäftigungs­verhältnisses erforderlich ist.",
    source: "S46",
    implication:
      "Legitimiert die Dienstplan­verarbeitung in HiCare.",
  },
};

// ── Prozesse (Dienstplanung, Vermittlung, Einarbeitung) ──────────────────────
export type ProcessStep = {
  n: number;
  label: string;
  /** Wer macht es (Node-ID). */
  actor: string;
  /** Wen adressiert es (Node-ID, optional). */
  addressee?: string;
  /** Kommunikationskanal (Node-ID, optional). */
  via?: string;
  detail?: string;
  verify: Verify;
};

export type Process = {
  id: string;
  label: string;
  role: string;
  description: string;
  verify: Verify;
  /** Nodes, die der Prozess berührt — wird beim Overlay hervorgehoben. */
  involves: string[];
  steps: ProcessStep[];
  citations?: string[];
  sources: string[];
};

export const PROCESSES: Record<string, Process> = {
  P_MONATSPLAN: {
    id: "P_MONATSPLAN",
    label: "Monats-Dienstplanung (feste Team-Planung)",
    role: "~4–6 Wochen Vorlauf",
    description:
      "Reguläre, planbare Assistenz-Einsätze werden in festen Teams vergeben. Ziel: Jede*r Assistent*in hat den Dienstplan mindestens 4 Wochen im Voraus, sodass kein KV-Zuschlag nach § 7 Abs. 6 HTV anfällt.",
    verify: "inferred",
    involves: ["BB_COORD", "ASS", "CL", "BR", "CH_HICARE", "CH_MAIL", "CH_TEL"],
    steps: [
      { n: 1, label: "Bedarfsermittlung",        actor: "CL",       addressee: "BB_COORD", via: "CH_TEL",    detail: "Kund*in meldet Wunsch­stunden und Vertretungs­bedarf an das Beratungs­büro.", verify: "inferred" },
      { n: 2, label: "Team-Abstimmung",          actor: "BB_COORD", addressee: "ASS",      via: "CH_HICARE", detail: "Koordination prüft Verfügbarkeit im Team und stimmt Dienste in HiCare ab.",     verify: "inferred" },
      { n: 3, label: "Entwurf Dienstplan",       actor: "BB_COORD",                          via: "CH_HICARE", detail: "Planentwurf im Verwaltungs­system; Konflikte (Ruhe­zeiten, § 7 HTV-Zuschläge) werden geprüft.", verify: "inferred" },
      { n: 4, label: "BR-Zustimmung (§ 87 BetrVG)", actor: "BR",     addressee: "BB_COORD",                   detail: "Dienstplan ist mitbestimmungs­pflichtig; BR zeichnet vor Veröffentlichung ab.", verify: "inferred" },
      { n: 5, label: "Veröffentlichung Plan",    actor: "BB_COORD", addressee: "ASS",      via: "CH_MAIL",   detail: "Assistent*innen erhalten den finalen Plan per E-Mail (und in HiCare einsehbar).", verify: "inferred" },
      { n: 6, label: "Durchführung",             actor: "ASS",      addressee: "CL",                          detail: "Einsatz beim Kund*innen-Team über den Monat.", verify: "verified" },
    ],
    citations: ["HTV_7_6", "HTV_7_5", "BETRVG_87"],
    sources: ["S16", "S42", "S5", "S48"],
  },

  P_KV: {
    id: "P_KV",
    label: "Kurzfristige Vermittlung bei Ausfall (KV)",
    role: "< 4 Kalendertage Vorlauf",
    description:
      "Fällt eine Assistenz kurzfristig aus (Krankheit, Notfall), vermittelt die Koordination eine Ersatzkraft. Liegt weniger als 96 h Ankündigung vor, greift § 7 Abs. 6 HTV: 25 % Zuschlag auf Arbeits- und Fahrtzeit.",
    verify: "inferred",
    involves: ["BB_COORD", "ASS", "CL", "CH_TEL", "CH_SMS", "CH_HICARE", "M_POOL"],
    steps: [
      { n: 1, label: "Ausfallmeldung",          actor: "ASS",      addressee: "BB_COORD", via: "CH_TEL",    detail: "Ausfall wird telefonisch gemeldet (schnellster Kanal).", verify: "inferred" },
      { n: 2, label: "Pool/Vertretungs-Abfrage", actor: "BB_COORD", addressee: "ASS",      via: "CH_SMS",    detail: "Koordination fragt Vertretungskräfte per SMS an — ohne Kund*in-Adresse (Datenschutz, Art. 9 DSGVO).", verify: "inferred" },
      { n: 3, label: "Zusage & Details",        actor: "ASS",      addressee: "BB_COORD", via: "CH_TEL",    detail: "Telefonat für Details (Adresse, Besonderheiten) erst nach Zusage.", verify: "inferred" },
      { n: 4, label: "Eintrag in HiCare",       actor: "BB_COORD",                          via: "CH_HICARE", detail: "Vertretung wird in HiCare erfasst, KV-Flag gesetzt → Lohnabrechnung kennt den 25 %-Zuschlag.", verify: "inferred" },
      { n: 5, label: "Einsatz + Fahrtzeit",     actor: "ASS",      addressee: "CL",                          detail: "Fahrtzeit zur/zu Kund*in wird ebenfalls mit 125 % vergütet.", verify: "verified" },
    ],
    citations: ["HTV_7_6", "DSGVO_9"],
    sources: ["S16", "S45", "S48"],
  },

  P_EINARBEITUNG: {
    id: "P_EINARBEITUNG",
    label: "Einarbeitung neue*r Assistent*in",
    role: "Basis-Qualifizierung + Anlass-FB",
    description:
      "Neue Assistent*innen durchlaufen verpflichtende Basismodule (Selbstbestimmt-Leben, Pflege) und werden anschließend in ein Team eingeführt. Bedarfsspezifische Fortbildungen werden bei Einsatz­beginn bei einer neuen Kund*in ergänzt.",
    verify: "inferred",
    involves: ["PA", "Q", "Q_INTRO", "Q_PFLEGE", "BB_COORD", "ASS", "CL"],
    steps: [
      { n: 1, label: "Einstellung",               actor: "PA",       addressee: "ASS",      via: "CH_MAIL",   detail: "Vertrag, Erstgespräch, Zuordnung zu einem Beratungsbüro.", verify: "inferred" },
      { n: 2, label: "Basismodul Einführung",     actor: "Q_INTRO",  addressee: "ASS",                         detail: "Selbstbestimmt-Leben, Geschichte der Persönlichen Assistenz.",  verify: "verified" },
      { n: 3, label: "Basismodul Pflege",         actor: "Q_PFLEGE", addressee: "ASS",                         detail: "Hygiene, Körperpflege, Ernährung, rechtliche Aspekte.",      verify: "verified" },
      { n: 4, label: "Kund*in-Kennenlernen",      actor: "BB_COORD", addressee: "ASS",      via: "CH_TEL",    detail: "Koordination vermittelt Erstkontakt; Kund*in entscheidet über Einsatz.", verify: "inferred" },
      { n: 5, label: "Einarbeitung im Team",      actor: "ASS",                                                detail: "Schichten in Doppelbesetzung mit erfahrener Assistenz.", verify: "inferred" },
      { n: 6, label: "Anlass-Fortbildung",        actor: "Q_FB",     addressee: "ASS",                         detail: "Bedarfsabhängig (z.B. spezifische Behinderung, Beatmung).", verify: "verified" },
    ],
    citations: ["BDSG_26"],
    sources: ["S27", "S46"],
  },

  P_TARIFCHECK: {
    id: "P_TARIFCHECK",
    label: "Tarifliche Prüfung einer Schicht (HTV-Compliance)",
    role: "vor Lohnabrechnung",
    description:
      "Jede gebuchte Schicht wird gegen § 7 HTV geprüft: Nacht-, Samstag-, Sonntag-, Feiertags-Zuschläge, KV-Flag, Fahrtzeit. Ergebnis fließt in die Lohnabrechnung.",
    verify: "verified",
    involves: ["BB_COORD", "FB", "PA", "CH_HICARE"],
    steps: [
      { n: 1, label: "Schicht erfasst",         actor: "BB_COORD",                         via: "CH_HICARE", detail: "Zeitraum, Kund*in, Art (Nacht/Bereitschaft), KV-Flag.", verify: "inferred" },
      { n: 2, label: "HTV-Klassifizierung",     actor: "FB",                               via: "CH_HICARE", detail: "Automatische Berechnung nach § 7 Abs. 1 HTV (Zuschläge).", verify: "inferred" },
      { n: 3, label: "Wechselschicht-Cap",      actor: "FB",                                                detail: "Wechselschicht­zulage wird auf 105 €/Monat gecappt (§ 7 Abs. 5).", verify: "verified" },
      { n: 4, label: "Lohnlauf",                actor: "PA",       addressee: "ASS",      via: "CH_MAIL",   detail: "Abrechnung & Gehaltsmitteilung an die Assistent*in.", verify: "inferred" },
    ],
    citations: ["HTV_7_1", "HTV_7_5", "HTV_7_6"],
    sources: ["S16", "S32", "S48"],
  },
};

// ── Knoten ───────────────────────────────────────────────────────────────────
export const GROUPS: Record<Group, { label: string; color: string; dark: string; icon?: string }> = {
  governance:     { label: "Verein · Governance",        color: "#d8eadd", dark: "#1f3b2c", icon: "■" },
  operations:     { label: "Einsatzstelle",              color: "#dbeafe", dark: "#1e2658", icon: "■" },
  advisory:       { label: "Beratungsbüros",             color: "#fce7f3", dark: "#4d1d38", icon: "■" },
  assistance:     { label: "Assistenz-Formen",           color: "#ede9fe", dark: "#2a1f57", icon: "■" },
  qualification:  { label: "Qualifizierung",             color: "#ccfbf1", dark: "#134e4a", icon: "■" },
  services:       { label: "Leistungen",                 color: "#d1fae5", dark: "#1d3b2b", icon: "■" },
  clients:        { label: "Kund*innen",                 color: "#fde68a", dark: "#4a3a0a", icon: "■" },
  representation: { label: "Interessenvertretung",       color: "#fef3c7", dark: "#4a371a", icon: "■" },
  funding:        { label: "Kostenträger",               color: "#fecaca", dark: "#4a1f1f", icon: "■" },
  legal:          { label: "Rechtsrahmen",               color: "#e5e7eb", dark: "#33363d", icon: "§" },
  external:       { label: "Verbunden / extern",         color: "#f5f5f4", dark: "#2e3035", icon: "■" },
  process:        { label: "Prozesse",                   color: "#fed7aa", dark: "#3d2410", icon: "▶" },
  mode:           { label: "Vermittlungs-Modi",          color: "#bfdbfe", dark: "#1e3a5f", icon: "◆" },
  channel:        { label: "Kommunikations-Kanäle",      color: "#f5d0fe", dark: "#4a1c5c", icon: "✉" },
};

export const NODES: OrgNode[] = [
  // ── Governance ──────────────────────────────────────────────────────────
  { id: "MV", label: "Mitgliederversammlung", role: "Oberstes Organ",
    description: "Rund 100 Vereinsmitglieder. Wählt den Vorstand, beschließt Satzungsänderungen.",
    verify: "inferred", group: "governance", sources: ["S2","S9"] },

  { id: "VS", label: "Vorstand", role: "3–5 Personen, ehrenamtlich",
    description: "Satzung: Mehrheit muss selbst auf Assistenz angewiesen sein. Öffentlich bekannt: Ursula „Uschi\" Aurien, Dennis Jeromin, Michael Sühnel. Historisch: Matthias Vernaldi (†).",
    verify: "verified", group: "governance", sources: ["S2","S3"] },

  { id: "GF", label: "Geschäftsführung", role: "Uta Wehde",
    description: "Hauptamtliche Geschäftsführung. Unterzeichnete 2020 mit dem Vorstand den Haustarifvertrag mit ver.di.",
    verify: "verified", group: "governance", sources: ["S3","S16"] },

  // ── Einsatzstelle ───────────────────────────────────────────────────────
  { id: "ES", label: "Einsatzstelle", role: "Wilhelm-Kabus-Str. 21-35, 10829 Berlin",
    description: "Zentrale in Schöneberg, Eingang 2, 1. OG. Umzug Juni 2023. Sekretariat Mo–Fr 8:00–16:00, Tel. 030/69 59 75-410, sekretariat@adberlin.org.",
    verify: "verified", group: "operations", sources: ["S4","S18","S19","S23"],
    address: "Wilhelm-Kabus-Str. 21-35, 10829 Berlin-Schöneberg" },

  { id: "SEK", label: "Sekretariat", role: "Zentrale Anlaufstelle",
    description: "Erste telefonische und postalische Kontaktstelle. Mo–Fr 8–16 Uhr.",
    verify: "verified", group: "operations", sources: ["S4","S23"] },

  { id: "VL",  label: "Verwaltungsleitung", role: "Kaufmännische Leitung",
    description: "Leitet Personal und Buchhaltung. Name öffentlich nicht zugeordnet.",
    verify: "inferred", group: "operations", sources: ["S4"] },

  { id: "PDL", label: "Pflegedienstleitung", role: "PDL nach SGB XI",
    description: "Führt das Team der Pflegefachkräfte und koordiniert die pflegefachliche Begleitung.",
    verify: "inferred", group: "operations", sources: ["S4"], citations: ["SGB5_37","SGB11_36"] },

  { id: "PFK", label: "Pflegefachkräfte", role: "Team examinierter Pflegekräfte",
    description: "Pflegefachliche Begleitung der Assistenz-Einsätze, Behandlungspflege nach § 37 SGB V.",
    verify: "inferred", group: "operations", sources: ["S4"], citations: ["SGB5_37"] },

  { id: "PA",  label: "Personalabteilung", role: "HR · Personal & Lohn",
    description: "Einstellungen, Verträge, Lohn- und Gehaltsabrechnung. Erreichbar: 030/69 59 75-422.",
    verify: "inferred", group: "operations", sources: ["S4","S26"], citations: ["BDSG_26"] },

  { id: "FB",  label: "Finanzbuchhaltung", role: "Buchhaltung / Controlling",
    description: "Rechnungswesen, Abrechnung gegenüber Kostenträgern.",
    verify: "inferred", group: "operations", sources: ["S4"] },

  { id: "QM",  label: "Qualitätsmanagement", role: "QM-Beauftragte*r + Qualitätszirkel",
    description: "Pflegt das QM-Handbuch nach SGB XI-Vorgaben, organisiert den Qualitätszirkel.",
    verify: "verified", group: "operations", sources: ["S6","S19"] },

  { id: "REC", label: "Rechtsberatung (Justiziariat)", role: "Intern-juristisch",
    description: "Rechtsberatung intern und für Kund*innen, Schnittstelle zu den Beratungsbüros.",
    verify: "inferred", group: "operations", sources: ["S4"] },

  { id: "OEA", label: "Öffentlichkeitsarbeit", role: "Kommunikation & PR",
    description: "Website adberlin.com, Publikationen (Flyer, Leitbild), Pressearbeit.",
    verify: "inferred", group: "operations", sources: ["S4","S10","S11"] },

  // ── Beratungsbüros ──────────────────────────────────────────────────────
  { id: "BB",  label: "Beratungsbüros", role: "Dezentrale Beratung & Vermittlung",
    description: "Drei Büros (Süd, West, Nord/Ost). Sozialarbeitende werden vom Büropersonal unterstützt.",
    verify: "verified", group: "advisory", sources: ["S5"] },

  { id: "BBS", label: "Beratungsbüro Süd", role: "Gneisenaustr. 2a, Kreuzberg (Mehringhof)",
    description: "10961 Berlin-Kreuzberg, Mehringhof. Verkehrsanbindung U6/U7.",
    verify: "verified", group: "advisory", sources: ["S25","S36","S5"],
    address: "Gneisenaustr. 2a, 10961 Berlin-Kreuzberg (Mehringhof)" },

  { id: "BBW", label: "Beratungsbüro West", role: "Beratungsbüro",
    description: "Adresse und Leitung: lokal zu prüfen.",
    verify: "inferred", group: "advisory", sources: ["S5"] },

  { id: "BBN", label: "Beratungsbüro Nord/Ost", role: "Beratungsbüro",
    description: "Adresse und Leitung: lokal zu prüfen.",
    verify: "inferred", group: "advisory", sources: ["S5"] },

  // Rollen in den Beratungsbüros (Mittelbau – ohne Namen)
  { id: "BB_SOZ",   label: "Sozialarbeit (Büro)", role: "Sozialpädagog*innen",
    description: "Psychosoziale Beratung, Krisenintervention, Antragsunterstützung. In allen drei Büros.",
    verify: "inferred", group: "advisory", sources: ["S5","S29"] },
  { id: "BB_COORD", label: "Assistenz-Koordination", role: "Matching Kund*in ↔ Assistenz · Dienstplanung",
    description: "Schnittstelle zwischen Kund*innen und Assistent*innen: Suche, Einarbeitung, Monats­dienstplan, Ausfall-Management (KV). Nutzt HiCare als zentrale Verwaltungs­software. Kommunikation: Telefon, E-Mail, SMS (ohne Adressen — Datenschutz).",
    verify: "inferred", group: "advisory", sources: ["S4","S5","S29"],
    citations: ["HTV_7_6","DSGVO_9","BDSG_26"] },
  { id: "BB_REC",   label: "Rechtsberatung (Büro)", role: "Juristische Erstberatung",
    description: "Hilfe bei EGH-Antrag, Widerspruch, Leistungs­gewährung. Verweist komplexe Fälle an das Justiziariat der Einsatzstelle.",
    verify: "inferred", group: "advisory", sources: ["S4","S5"], citations: ["SGB9_29","SGB9_131"] },
  { id: "BB_ADMIN", label: "Büroassistenz / Verwaltung", role: "Büromanagement",
    description: "Unterstützt die Sozialarbeit organisatorisch, erste Anlaufstelle im Büro.",
    verify: "inferred", group: "advisory", sources: ["S5"] },

  // ── Kund*innen ──────────────────────────────────────────────────────────
  { id: "CL",  label: "Kund*innen", role: "Menschen mit körperlicher Behinderung",
    description: "Über 100 Kund*innen. Zielgruppe: Menschen mit körperlichen Behinderungen, die Persönliche Assistenz brauchen — viele als Bezieher*innen eines Persönlichen Budgets.",
    verify: "verified", group: "clients", sources: ["S1","S29","S33"], citations: ["SGB9_29"] },
  { id: "CL_BUD", label: "Budget­nehmer*innen", role: "Bezieher*innen eines Persönlichen Budgets",
    description: "Kund*innen, die Leistungen als Persönliches Budget (§ 29 SGB IX) beziehen. ad e.V. bietet Dienstleistungen zur Budget-Verwaltung.",
    verify: "verified", group: "clients", sources: ["S11","S33"], citations: ["SGB9_29"] },

  // ── Assistenz-Formen ────────────────────────────────────────────────────
  { id: "ASS",    label: "Persönliche Assistenz", role: "Kerngeschäft · 24/7",
    description: "Unterstützung in allen Lebensbereichen: Körperpflege, Ernährung, Haushalt, Kommunikation. Einsätze 24/7 in wechselnden Teams.",
    verify: "verified", group: "assistance", sources: ["S29","S10"], citations: ["HTV_7_1","HTV_7_6"] },
  { id: "ASS_BASE",   label: "Grundassistenz",          role: "Körperpflege · Ernährung · Haushalt",          description: "Kern-Assistenzleistungen im Alltag.", verify: "verified", group: "assistance", sources: ["S29"] },
  { id: "ASS_COMM",   label: "Kommunikations­assistenz", role: "Kommunikation · Teilhabe",                    description: "Unterstützung bei der Kommunikation mit dem Umfeld.", verify: "verified", group: "assistance", sources: ["S29"] },
  { id: "ASS_NIGHT",  label: "Nachtassistenz",          role: "Nacht / Bereitschaft",                          description: "Begleitung in der Nacht, teilweise als Bereitschaft. HTV § 7 Abs. 1 b regelt Nachtzuschläge.", verify: "verified", group: "assistance", sources: ["S16"], citations: ["HTV_7_1","HTV_7_5"] },
  { id: "ASS_TRAVEL", label: "Reiseassistenz",           role: "Reisebegleitung · Wochenende",                  description: "Assistent*innen begleiten Kund*innen in den Urlaub oder auf Wochenendreisen.", verify: "verified", group: "assistance", sources: ["S28","S29"] },
  { id: "ASS_WORK",   label: "Arbeits­assistenz",        role: "Am Arbeitsplatz",                               description: "Begleitung am Arbeitsplatz.", verify: "verified", group: "assistance", sources: ["S29"] },
  { id: "ASS_STUDY",  label: "Studien­assistenz",        role: "Hochschul-Kontext",                             description: "Unterstützung im Studium.",   verify: "verified", group: "assistance", sources: ["S29"] },
  { id: "ASS_HOSP",   label: "Krankenhaus­assistenz",    role: "Klinik-Begleitung",                             description: "Assistenz im Krankenhaus.",   verify: "verified", group: "assistance", sources: ["S29"] },
  { id: "ASS_SCHOOL", label: "Schul­assistenz",          role: "Unterricht · Schule",                           description: "Assistenz im Schulalltag.",   verify: "inferred", group: "assistance", sources: ["S29"] },
  { id: "ASS_LEIS",   label: "Freizeit­assistenz",       role: "Kultur · Sport",                                description: "Begleitung in der Freizeit.", verify: "inferred", group: "assistance", sources: ["S29"] },

  // ── Qualifizierung ──────────────────────────────────────────────────────
  { id: "Q",   label: "Qualifizierung", role: "Basismodule + Anlass-Fortbildung",
    description: "Verpflichtende Basisqualifizierung für neu eingestellte Assistent*innen, plus bedarfs­bezogene Fortbildungen. Auch offen für externe Budget-Nehmer*innen.",
    verify: "verified", group: "qualification", sources: ["S27"] },
  { id: "Q_INTRO",  label: "Modul Einführung", role: "Selbstbestimmt-Leben · PA-Geschichte",  description: "Einführung: Selbstbestimmung behinderter Menschen, Entwicklung der Persönlichen Assistenz.", verify: "verified", group: "qualification", sources: ["S27"] },
  { id: "Q_PFLEGE", label: "Modul Pflege",      role: "Hygiene · Pflege · Ernährung",          description: "Hygiene, rechtliche Aspekte, Körperpflege, Ernährung, Ausscheidung.",                          verify: "verified", group: "qualification", sources: ["S27"] },
  { id: "Q_FB",     label: "Anlass-Fortbildungen", role: "Behinderungsspezifisch",             description: "Fortbildungen auf Anfrage zu spezifischen Behinderungen oder Themen.",                         verify: "verified", group: "qualification", sources: ["S27"] },

  // ── Leistungen ──────────────────────────────────────────────────────────
  { id: "L",   label: "Leistungsbereiche", role: "Kernangebot",
    description: "Persönliche Assistenz · Persönliches Budget · Eingliederungshilfe · Ambulante Pflege (SGB XI) · Qualifizierung.",
    verify: "verified", group: "services", sources: ["S1","S10","S11","S19","S29"] },

  // ── Interessenvertretung ────────────────────────────────────────────────
  { id: "BR",  label: "Betriebsrat", role: "Mitbestimmung nach BetrVG",
    description: "Büros: Urbanstr. 100, 10967 Berlin · Wilhelm-Kabus-Str. 21-35, 10829 Berlin. Tel. 030-69597578, br@betriebsrat-ad.de. Mo+Fr 10–13, Mi 12–15 Uhr. Überwacht HTV-Einhaltung und Dienstplan-Mitbestimmung.",
    verify: "verified", group: "representation", sources: ["S12","S13"],
    address: "Urbanstr. 100, 10967 Berlin · Wilhelm-Kabus-Str. 21-35, 10829 Berlin",
    citations: ["BETRVG_87","BETRVG_80"] },
  { id: "TK",  label: "Tarifkommission", role: "Haustarifverhandlungen ad + NLW",
    description: "Verhandelt den Haustarifvertrag persönliche Assistenz (HTV). Gewerkschaftlich begleitet durch ver.di.",
    verify: "verified", group: "representation", sources: ["S15","S16","S17","S24"], citations: ["HTV_7_6"] },
  { id: "VDF", label: "Ver.di & friends", role: "BR-Kandidat*innen-Liste",
    description: "Ver.di-nahe Liste bei den Betriebsratswahlen von ad e.V.",
    verify: "verified", group: "representation", sources: ["S14"] },
  { id: "VERDI", label: "ver.di", role: "Gewerkschaft",
    description: "Vertragspartnerin des Haustarifs; organisiert die Tarifkampagne ad + NLW.",
    verify: "verified", group: "representation", sources: ["S15","S24"] },

  // ── Verbunden / extern ──────────────────────────────────────────────────
  { id: "NLW", label: "Neue Lebenswege GmbH", role: "HRB 145571 B · Tochter von Cooperative Mensch eG",
    description: "gGmbH, gegründet 02.11.2012, AG Charlottenburg (HRB 145571 B). Sitz: Zimmerstr. 26-27, 10969 Berlin (ehem. Kurfürstenstr. 75, 10787). GF: Georg Dudaschwili (seit Juni 2021). Stammkapital 25.000 EUR. Gesellschafter: Cooperative Mensch eG (seit spätestens 2014, vorher Spastikerhilfe Berlin eG). Zweck laut HR: Integration behinderter Menschen, Förderung der Wohlfahrt, Bildung, Jugend-/Altenpflege. Verbunden mit ad e.V. nur über den gemeinsamen Haustarifvertrag (Tarifkommission ver.di) — KEINE Konzern- oder Gesellschafter-Verbindung zu ad.",
    verify: "verified", group: "external", sources: ["S15","S17","S49","S50"],
    address: "Zimmerstr. 26-27, 10969 Berlin" },
  { id: "COOP", label: "Cooperative Mensch eG", role: "Genossenschaft · 25+ Einrichtungen",
    description: "Freier Träger der Berliner Behindertenhilfe. Genossenschaft, gegründet 1990 als Spastikerhilfe Berlin eG (die wiederum aus einer 1958 gegründeten Eltern-Initiative hervorging). 2018 umbenannt in Cooperative Mensch eG. Betreibt in Berlin 25+ Einrichtungen: Wohneinrichtungen, Tagesförderstätten, Werkstätten, Beratung, ambulante Angebote. Mutter-Genossenschaft der Neuen Lebenswege GmbH. 2021 Fusion mit Lebenswege Wohnprojekte GmbH. KEIN gesellschaftsrechtlicher Bezug zu ad e.V.",
    verify: "verified", group: "external", sources: ["S52","S53"] },
  { id: "DV",  label: "Paritätischer Berlin", role: "Dachverband",
    description: "ad e.V. ist Mitglied im Paritätischen Wohlfahrtsverband Landesverband Berlin. Paritätischer veröffentlichte 2021/22 eine digitale Ausstellung „ad:bewegt! – vom Musterkrüppelchen zur Persönlichen Assistenz\" zur Geschichte des Vereins.",
    verify: "verified", group: "external", sources: ["S20","S54"] },

  // ── Kostenträger ────────────────────────────────────────────────────────
  { id: "F_SEN", label: "Senatsverw. Soziales", role: "EGH-Träger Berlin",
    description: "Zuständig für Eingliederungshilfe nach SGB IX. Basis: Berliner Rahmenvertrag § 131 SGB IX vom 05.06.2019; Bedarf mittels Teilhabe-Instrument Berlin (TIB, § 118 SGB IX).",
    verify: "verified", group: "funding", sources: ["S30","S31","S34"], citations: ["SGB9_131","SGB9_118"] },
  { id: "F_BEZ", label: "Bezirksämter", role: "Hilfe zur Pflege",
    description: "Sozialhilfe-Leistungen nach SGB XII, soweit keine andere Zuständigkeit besteht.",
    verify: "inferred", group: "funding", sources: ["S35"] },
  { id: "F_PK",  label: "Pflegekassen", role: "SGB XI · Pflegeversicherung",
    description: "Grundpflege und hauswirtschaftliche Versorgung nach Pflegegrad.",
    verify: "verified", group: "funding", sources: ["S35","S19"], citations: ["SGB11_36"] },
  { id: "F_KK",  label: "Krankenkassen", role: "SGB V · Behandlungspflege",
    description: "Häusliche Krankenpflege nach § 37 SGB V auf ärztliche Verordnung.",
    verify: "inferred", group: "funding", sources: ["S35"], citations: ["SGB5_37"] },
  { id: "F_BUD", label: "Persönliches Budget", role: "§ 29 SGB IX",
    description: "Leistungsträger-übergreifende Geldleistung. Kund*in wählt und organisiert Assistenz selbst; ad e.V. bietet begleitende Dienstleistungen.",
    verify: "verified", group: "funding", sources: ["S11","S33"], citations: ["SGB9_29"] },

  // ── Rechtsrahmen ────────────────────────────────────────────────────────
  { id: "L_SGB9",   label: "SGB IX / BTHG",  role: "Rehabilitation & Teilhabe",   description: "Eingliederungshilfe und Teilhabeleistungen. BTHG gilt seit 2020 vollständig; Bedarfe werden in Berlin über das TIB ermittelt.", verify: "verified", group: "legal", sources: ["S30","S35","S38"], citations: ["SGB9_29","SGB9_118","SGB9_131"] },
  { id: "L_SGB11",  label: "SGB XI",          role: "Pflegeversicherung",          description: "Leistungen ambulanter Pflege nach Pflegegrad.",          verify: "verified", group: "legal", sources: ["S35","S19","S41"], citations: ["SGB11_36"] },
  { id: "L_SGB5",   label: "SGB V",           role: "Gesetzliche Krankenversicherung", description: "Häusliche Krankenpflege (Behandlungspflege) nach § 37.", verify: "inferred", group: "legal", sources: ["S35","S40"], citations: ["SGB5_37"] },
  { id: "L_HTV",    label: "Haustarifvertrag (HTV)", role: "seit 01.07.2019",       description: "Unterzeichnet 05.03.2020 (Fassung 27.04.2020) mit ver.di; rückwirkend ab 01.07.2019. Basiert methodisch auf TV-L.", verify: "verified", group: "legal", sources: ["S16","S24","S32"], citations: ["HTV_7_1","HTV_7_5","HTV_7_6"] },
  { id: "L_BETRVG", label: "BetrVG",          role: "Betriebsverfassungsgesetz",    description: "Gesetzliche Grundlage für Betriebsrat und Mitbestimmung.", verify: "verified", group: "legal", sources: ["S12","S42","S43"], citations: ["BETRVG_87","BETRVG_80"] },
  { id: "L_TIB",    label: "TIB",              role: "Teilhabe-Instrument Berlin",  description: "Bedarfsermittlungs­instrument für die Berliner Eingliederungshilfe (seit 2019).", verify: "verified", group: "legal", sources: ["S30","S38"], citations: ["SGB9_118"] },
  { id: "L_DSGVO",  label: "DSGVO / BDSG",    role: "Datenschutz",                  description: "Adressen/Pflege­informationen sind besondere Kategorien nach Art. 9 DSGVO → höhere Schutzstufe.", verify: "verified", group: "legal", sources: ["S44","S45","S46"], citations: ["DSGVO_9","BDSG_26"] },

  // ── Prozesse (als Knoten, für Overlay) ──────────────────────────────────
  { id: "PROC_MONAT",  label: "▶ Monatsdienstplanung",   role: "~4–6 Wochen Vorlauf",          description: "Feste Team-Planung. Siehe Prozess-Details im rechten Panel.", verify: "inferred", group: "process", sources: ["S16","S42"], citations: ["HTV_7_6","BETRVG_87"] },
  { id: "PROC_KV",     label: "▶ Kurzfristige Vermittlung", role: "< 96 h Vorlauf",            description: "KV-Fall: § 7 Abs. 6 HTV → 25 % Zuschlag.",                  verify: "inferred", group: "process", sources: ["S16"],       citations: ["HTV_7_6","DSGVO_9"] },
  { id: "PROC_EIN",    label: "▶ Einarbeitung",             role: "Basismodule + Anlass-FB",    description: "Neue Assistent*innen durchlaufen Basismodule, dann Team-Einarbeitung.", verify: "inferred", group: "process", sources: ["S27"], citations: ["BDSG_26"] },
  { id: "PROC_TARIF",  label: "▶ HTV-Compliance-Check",     role: "vor Lohnabrechnung",         description: "Jede Schicht wird gegen § 7 HTV geprüft.",                   verify: "verified", group: "process", sources: ["S16","S48"], citations: ["HTV_7_1","HTV_7_5","HTV_7_6"] },

  // ── Vermittlungs-Modi ───────────────────────────────────────────────────
  { id: "M_TEAM",   label: "◆ Feste Team-Planung",          role: "~4–6 Wochen Vorlauf",   description: "Regulärer Dienstplan­modus: rechtzeitig vor Monatsbeginn, keine KV-Zuschläge.", verify: "inferred", group: "mode", sources: ["S16"] },
  { id: "M_KV",     label: "◆ Kurzfristige Vermittlung",    role: "< 96 h Vorlauf",        description: "Ausfall/Notfall. KV-Zuschlag 25 % greift.", verify: "inferred", group: "mode", sources: ["S16"], citations: ["HTV_7_6"] },
  { id: "M_POOL",   label: "◆ Vertretungs-/Springer-Pool", role: "Pool-Anfrage",          description: "Pool von Assistent*innen, die bereit sind kurzfristig einzuspringen.",     verify: "assumed",  group: "mode", sources: ["S48"] },
  { id: "M_NIGHT",  label: "◆ Nachtrotation",              role: "Team-intern",           description: "Rotierende Verteilung von Nachtdiensten im Team.",                        verify: "inferred", group: "mode", sources: ["S16"], citations: ["HTV_7_1","HTV_7_5"] },
  { id: "M_TRAVEL", label: "◆ Reise­buchung",               role: "Urlaub/Wochenende",     description: "Eigener Buchungs­prozess für Reise­assistenz (längerer Vorlauf, Urlaubs­planung).", verify: "verified", group: "mode", sources: ["S28","S29"] },

  // ── Kommunikations-Kanäle ───────────────────────────────────────────────
  { id: "CH_TEL",    label: "✉ Telefon",                role: "Schnellster Kanal · Koordination",
    description: "Hauptsächlicher Kanal für kurzfristige Vermittlung, Ausfallmeldungen und sensible Abstimmungen mit Koordination (030/69 59 75-410, Beratungsbüros: eigene Nummern). Reihenfolge für KV: Telefon zuerst, SMS wenn nicht erreichbar.",
    verify: "verified", group: "channel", sources: ["S4","S23","S21"] },
  { id: "CH_MAIL",   label: "✉ E-Mail",                 role: "Dokumentierte Kommunikation",
    description: "Offizielle Dienstplan-Veröffentlichung, Verträge, Lohnmitteilungen. Adressen: sekretariat@adberlin.org, br@betriebsrat-ad.de.",
    verify: "verified", group: "channel", sources: ["S4","S12","S23"] },
  { id: "CH_SMS",    label: "✉ SMS",                   role: "Schnell · datenschutz­reduziert",
    description: "Teilweise für kurzfristige Vermittlungsanfragen. Wichtig: aus Datenschutz­gründen (Art. 9 DSGVO) werden Kund*innen-Adressen NICHT per SMS versendet — nur Namen/Initialen, Zeitfenster. Adressen & Details folgen telefonisch erst nach Zusage.",
    verify: "verified", group: "channel", sources: ["S45"], citations: ["DSGVO_9"] },
  { id: "CH_HICARE", label: "✉ HiCare",                role: "Interne Verwaltungs­software",
    description: "Zentrales Verwaltungsprogramm für Dienstpläne, Kund*innen- und Assistenz­stammdaten, Schicht­klassifikation (Nacht, KV, Wechselschicht), Export in die Lohnabrechnung. Zugriffsrechte rollen­basiert (BB_COORD, PA, FB, PDL).",
    verify: "verified", group: "channel", sources: ["S47"], citations: ["BDSG_26","DSGVO_9"] },
  { id: "CH_TEAM",   label: "✉ Team-Treffen",          role: "Monatlich · physisch",
    description: "Team-Treffen im Beratungsbüro/Kund*innen-Team. Abstimmung von Schichten, Übergabe, Supervision.",
    verify: "inferred", group: "channel", sources: ["S4","S5"] },
  { id: "CH_SUP",    label: "✉ Supervision",           role: "Fallbezogen",
    description: "Fallbezogene Supervision zur Entlastung. Bei psychosozial komplexen Kund*innen-Situationen.",
    verify: "assumed", group: "channel", sources: ["S5"] },
];

// ── Kanten ───────────────────────────────────────────────────────────────────
export const EDGES: OrgEdge[] = [
  // Governance
  { from: "MV", to: "VS", label: "wählt",       verify: "verified" },
  { from: "VS", to: "GF", label: "bestellt",    verify: "verified" },
  { from: "GF", to: "ES",                       verify: "verified" },
  { from: "GF", to: "BB",                       verify: "verified" },

  // Einsatzstelle intern
  { from: "ES", to: "SEK", verify: "verified" },
  { from: "ES", to: "VL",  verify: "inferred" },
  { from: "ES", to: "PDL", verify: "inferred" },
  { from: "ES", to: "QM",  verify: "verified" },
  { from: "ES", to: "REC", verify: "inferred" },
  { from: "ES", to: "OEA", verify: "inferred" },
  { from: "VL", to: "PA",  verify: "inferred" },
  { from: "VL", to: "FB",  verify: "inferred" },
  { from: "PDL", to: "PFK", verify: "inferred" },

  // Beratungsbüros
  { from: "BB", to: "BBS", verify: "verified" },
  { from: "BB", to: "BBW", verify: "verified" },
  { from: "BB", to: "BBN", verify: "verified" },
  { from: "BBS", to: "BB_SOZ",   verify: "inferred" },
  { from: "BBS", to: "BB_COORD", verify: "inferred" },
  { from: "BBS", to: "BB_ADMIN", verify: "inferred" },
  { from: "BBW", to: "BB_SOZ",   verify: "inferred" },
  { from: "BBW", to: "BB_COORD", verify: "inferred" },
  { from: "BBW", to: "BB_ADMIN", verify: "inferred" },
  { from: "BBN", to: "BB_SOZ",   verify: "inferred" },
  { from: "BBN", to: "BB_COORD", verify: "inferred" },
  { from: "BBN", to: "BB_ADMIN", verify: "inferred" },
  { from: "REC", to: "BB_REC", label: "unterstützt", verify: "inferred" },

  // Leistungen
  { from: "ES", to: "L", label: "erbringt", verify: "verified" },
  { from: "BB", to: "L", label: "erbringt", verify: "verified" },

  // Interessenvertretung
  { from: "BR", to: "ES",  label: "vertritt",  verify: "verified" },
  { from: "BR", to: "BB",  label: "vertritt",  verify: "verified" },
  { from: "TK", to: "GF",  label: "Haustarif", verify: "verified" },
  { from: "TK", to: "NLW", label: "Haustarif", verify: "verified" },
  { from: "COOP", to: "NLW", label: "Gesellschafter", verify: "verified" },
  { from: "VDF", to: "BR", label: "stellt",    verify: "verified" },
  { from: "VERDI", to: "TK", label: "begleitet", verify: "verified" },
  { from: "VERDI", to: "VDF", label: "trägt",    verify: "verified" },

  // Extern
  { from: "DV", to: "VS", label: "Mitgliedschaft", verify: "inferred" },

  // Kund*innen
  { from: "CL", to: "CL_BUD", label: "teilweise", verify: "verified" },
  { from: "BB_COORD", to: "CL", label: "vermittelt", layer: "clients", verify: "inferred" },
  { from: "ASS", to: "CL",     label: "dient",      layer: "clients", verify: "verified" },

  // Assistenz-Formen
  { from: "L", to: "ASS", label: "umfasst", verify: "verified" },
  { from: "ASS", to: "ASS_BASE",   verify: "verified" },
  { from: "ASS", to: "ASS_COMM",   verify: "verified" },
  { from: "ASS", to: "ASS_NIGHT",  verify: "verified" },
  { from: "ASS", to: "ASS_TRAVEL", verify: "verified" },
  { from: "ASS", to: "ASS_WORK",   verify: "verified" },
  { from: "ASS", to: "ASS_STUDY",  verify: "verified" },
  { from: "ASS", to: "ASS_HOSP",   verify: "verified" },
  { from: "ASS", to: "ASS_SCHOOL", verify: "inferred" },
  { from: "ASS", to: "ASS_LEIS",   verify: "inferred" },

  // Qualifizierung
  { from: "PA", to: "Q", label: "organisiert", verify: "inferred" },
  { from: "Q", to: "Q_INTRO",  verify: "verified" },
  { from: "Q", to: "Q_PFLEGE", verify: "verified" },
  { from: "Q", to: "Q_FB",     verify: "verified" },
  { from: "Q", to: "ASS", label: "qualifiziert für", layer: "qualification", verify: "verified" },

  // Kostenträger
  { from: "F_SEN",  to: "L", label: "EGH finanziert",        layer: "funding", verify: "verified" },
  { from: "F_BEZ",  to: "L", label: "Hilfe zur Pflege",      layer: "funding", verify: "inferred" },
  { from: "F_PK",   to: "L", label: "Pflegeleistungen",      layer: "funding", verify: "verified" },
  { from: "F_KK",   to: "L", label: "Behandlungspflege",     layer: "funding", verify: "inferred" },
  { from: "F_BUD",  to: "CL_BUD", label: "wird gewährt",     layer: "funding", verify: "verified" },
  { from: "CL",     to: "F_BUD", label: "beantragt",         layer: "funding", verify: "verified" },

  // Rechtsrahmen
  { from: "L_SGB9",  to: "F_SEN", label: "§ 131 SGB IX",      layer: "legal", verify: "verified" },
  { from: "L_SGB11", to: "F_PK",  label: "Rechtsgrundlage",   layer: "legal", verify: "verified" },
  { from: "L_SGB5",  to: "F_KK",  label: "§ 37 SGB V",        layer: "legal", verify: "verified" },
  { from: "L_TIB",   to: "F_SEN", label: "Bedarfsermittlung", layer: "legal", verify: "verified" },
  { from: "L_HTV",   to: "TK",    label: "Ergebnis",          layer: "legal", verify: "verified" },
  { from: "L_BETRVG", to: "BR",   label: "Rechtsgrundlage",   layer: "legal", verify: "verified" },
  { from: "L_DSGVO", to: "CH_SMS", label: "schützt",          layer: "legal", verify: "verified" },
  { from: "L_DSGVO", to: "CH_HICARE", label: "reguliert",     layer: "legal", verify: "verified" },

  // Prozess-Knoten → Modi
  { from: "PROC_MONAT", to: "M_TEAM",   verify: "inferred" },
  { from: "PROC_KV",    to: "M_KV",     verify: "verified" },
  { from: "PROC_KV",    to: "M_POOL",   verify: "assumed" },

  // Modi → Akteur
  { from: "M_TEAM",   to: "BB_COORD", label: "organisiert", verify: "inferred" },
  { from: "M_KV",     to: "BB_COORD", label: "organisiert", verify: "inferred" },
  { from: "M_POOL",   to: "BB_COORD", label: "pflegt",      verify: "assumed"  },
  { from: "M_NIGHT",  to: "ASS_NIGHT",label: "verteilt",    verify: "inferred" },
  { from: "M_TRAVEL", to: "ASS_TRAVEL", label: "bucht",     verify: "verified" },

  // Kanäle → Akteure (Beziehungen, kein structural)
  { from: "CH_HICARE", to: "BB_COORD", label: "genutzt von", layer: "channel", verify: "verified" },
  { from: "CH_HICARE", to: "PA",       label: "genutzt von", layer: "channel", verify: "verified" },
  { from: "CH_HICARE", to: "FB",       label: "genutzt von", layer: "channel", verify: "verified" },
  { from: "CH_TEL",    to: "BB_COORD", label: "primär",      layer: "channel", verify: "verified" },
  { from: "CH_MAIL",   to: "BB_COORD", label: "dokumentiert",layer: "channel", verify: "verified" },
  { from: "CH_SMS",    to: "BB_COORD", label: "KV-Anfrage",  layer: "channel", verify: "verified" },
  { from: "CH_TEAM",   to: "ASS",      label: "monatlich",   layer: "channel", verify: "inferred" },
  { from: "CH_SUP",    to: "ASS",      label: "entlastet",   layer: "channel", verify: "assumed" },
];

// ── Metadaten ────────────────────────────────────────────────────────────────
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

// ── Helpers ──────────────────────────────────────────────────────────────────
/** Alte verify-Werte auf neues 3-Stufen-System mappen. */
export function normalizeVerify(v: Verify): "verified" | "inferred" | "assumed" {
  if (v === "verified" || v === "inferred" || v === "assumed") return v;
  if (v === "ok" || v === "archive") return "verified";
  return "inferred"; // snippet → inferred
}
