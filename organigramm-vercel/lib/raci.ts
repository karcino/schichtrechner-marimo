/**
 * RACI-Matrix für ad e.V. + Betriebsrat.
 *
 * Zeigt für jeden Prozess und jede Rolle, welche Beteiligungsform vorliegt:
 *   R = Responsible (macht die Arbeit)
 *   A = Accountable (genehmigt / trägt Verantwortung, genau eine pro Prozess)
 *   C = Consulted   (wird beratend einbezogen, 2-Wege)
 *   I = Informed    (wird am Ende informiert, 1-Weg)
 *
 * Befüllt aus HTV, BetrVG, Satzung ad e.V., Betriebsvereinbarungen.
 * Unsichere Zellen: verify="inferred", brauchen Paul-Review + Quelle.
 */

import type { Verify } from "./data";

/** Referenz-Rollen — IDs, die als Spaltenköpfe erscheinen. Manche matchen OrgNode.id, andere sind gruppierte Abstraktionen. */
export type RoleColumn = {
  id: string;
  label: string;
  short: string;         // z.B. "GF" statt "Geschäftsführung"
  group: "governance" | "operations" | "advisory" | "representation" | "external";
};

export const RACI_ROLES: RoleColumn[] = [
  { id: "MV",       label: "Mitgliederversammlung",      short: "MV",       group: "governance" },
  { id: "VS",       label: "Vorstand",                   short: "VS",       group: "governance" },
  { id: "GF",       label: "Geschäftsführung",           short: "GF",       group: "governance" },
  { id: "PDL",      label: "Pflegedienstleitung",        short: "PDL",      group: "operations" },
  { id: "PA",       label: "Personalabteilung",          short: "PA",       group: "operations" },
  { id: "FB",       label: "Finanzbuchhaltung",          short: "FB",       group: "operations" },
  { id: "QM",       label: "Qualitätsmanagement",        short: "QM",       group: "operations" },
  { id: "BB_COORD", label: "Beratungsbüro-Koordination", short: "BB",       group: "advisory" },
  { id: "ASS",      label: "Assistent*innen",            short: "ASS",      group: "operations" },
  { id: "CL",       label: "Kund*innen",                 short: "CL",       group: "external" },
  { id: "BR",       label: "Betriebsrat",                short: "BR",       group: "representation" },
  { id: "TK",       label: "Tarifkommission / ver.di",   short: "TK",       group: "representation" },
  { id: "KT",       label: "Kostenträger",               short: "KT",       group: "external" },
];

export type RACIProcess = {
  id: string;
  label: string;
  /** Kurzbeschreibung für Hover/Legend. */
  description: string;
  /** Referenz auf PROCESSES aus data.ts, falls der Prozess dort schon ausmodelliert ist. */
  process_ref?: string;
  /** Kategorisierung für Gruppierung in der UI. */
  category: "operations" | "hr" | "governance" | "codetermination" | "finance";
};

export const RACI_PROCESSES: RACIProcess[] = [
  // Direkt aus data.ts/PROCESSES
  {
    id: "P_MONATSPLAN",
    label: "Monats-Dienstplanung",
    description: "Planbare Einsätze in festen Teams, ≥ 4 Wochen Vorlauf.",
    process_ref: "P_MONATSPLAN",
    category: "operations",
  },
  {
    id: "P_KV",
    label: "Kurzfristige Vermittlung (KV)",
    description: "Ausfall-Ersatz mit < 96h Vorlauf, § 7 Abs. 6 HTV.",
    process_ref: "P_KV",
    category: "operations",
  },
  {
    id: "P_EINARBEITUNG",
    label: "Einarbeitung neue*r Assistent*in",
    description: "Basismodule + Team-Einführung + Anlass-Fortbildung.",
    process_ref: "P_EINARBEITUNG",
    category: "hr",
  },
  {
    id: "P_TARIFCHECK",
    label: "Tarif-Check einer Schicht",
    description: "HTV-Zuschlags-Prüfung, Wechselschicht-Cap, Lohnlauf.",
    process_ref: "P_TARIFCHECK",
    category: "finance",
  },
  // Neu für RACI-Blick (werden in data.ts nicht als Schritt-Prozess ausmodelliert,
  // weil sie mehr High-Level-Governance sind als operative Abläufe)
  {
    id: "P_NEUEINSTELLUNG",
    label: "Neueinstellung (Vertragsschluss)",
    description: "Ausschreibung, Auswahl, Vertrag, BR-Mitbestimmung § 99 BetrVG.",
    category: "hr",
  },
  {
    id: "P_BR_WAHL",
    label: "Betriebsrats-Wahl",
    description: "Alle 4 Jahre, Wahlvorstand, Listen, Wahlverfahren nach BetrVG § 14ff.",
    category: "codetermination",
  },
  {
    id: "P_BETRIEBSVEREINBARUNG",
    label: "Betriebsvereinbarung abschließen",
    description: "Verhandlung + Abschluss BV zu Mitbestimmungsthemen (Dienstplan, IT, etc.).",
    category: "codetermination",
  },
  {
    id: "P_TARIFKOMM",
    label: "Tarifkommission-Sitzung",
    description: "Verhandlung Haustarifvertrag mit Arbeitgeberseite ad+NLW.",
    category: "codetermination",
  },
  {
    id: "P_KUENDIGUNG",
    label: "Kündigung Beschäftigte*r",
    description: "BR-Anhörung § 102 BetrVG, Dokumentation, Zustellung.",
    category: "hr",
  },
  {
    id: "P_KOSTENUEBERNAHME",
    label: "Kostenübernahme-Antrag (Budget)",
    description: "Antrag bei Kostenträger (Pflegekasse/Sozialamt), Verhandlung, Bewilligung.",
    category: "finance",
  },
  {
    id: "P_QMZIRKEL",
    label: "Qualitäts-Zirkel-Sitzung",
    description: "Fall-Besprechung, Beschwerde-Review, Prozess-Verbesserung.",
    category: "operations",
  },
  {
    id: "P_VORSTANDS_SITZUNG",
    label: "Vorstands-Sitzung",
    description: "Strategische Entscheidungen, Budget, MV-Vorbereitung.",
    category: "governance",
  },
];

export type Responsibility = "R" | "A" | "C" | "I";

export type RACIEntry = {
  process_id: string;    // RACIProcess.id
  role_id: string;       // RoleColumn.id
  responsibility: Responsibility;
  /** Belegquelle — SOURCES-ID aus sources.ts, wo möglich. */
  source_ids: string[];
  verify: Verify;
  /** Optionaler Hinweis, z.B. Paragraph oder Einschränkung. */
  note?: string;
};

// ── Initial-Befüllung ────────────────────────────────────────────────────────
// Ableitungen für die 4 operativen Prozesse aus data.ts/PROCESSES erklärt sich
// selbst: actor → R, addressee → I/C, übergeordnete Zuständigkeit → A.
// Für die Governance/Mitbestimmungs-Prozesse sind Rechtsgrundlagen (BetrVG,
// HTV, Satzung) die Source. Alle Zellen mit "inferred" brauchen Verify.

export const RACI: RACIEntry[] = [
  // ── P_MONATSPLAN ──────────────────────────────────────────────────────────
  { process_id: "P_MONATSPLAN", role_id: "BB_COORD", responsibility: "R", source_ids: ["S16", "S42"], verify: "inferred",
    note: "Koordination erstellt Entwurf." },
  { process_id: "P_MONATSPLAN", role_id: "PDL",      responsibility: "A", source_ids: ["S4"],         verify: "inferred",
    note: "Pflegedienstleitung verantwortet HTV-konforme Planung." },
  { process_id: "P_MONATSPLAN", role_id: "BR",       responsibility: "C", source_ids: ["S48"],        verify: "verified",
    note: "BR-Zustimmung nach § 87 Abs. 1 Nr. 2 BetrVG." },
  { process_id: "P_MONATSPLAN", role_id: "ASS",      responsibility: "I", source_ids: [],             verify: "verified",
    note: "Erhalten finalen Plan." },
  { process_id: "P_MONATSPLAN", role_id: "CL",       responsibility: "I", source_ids: [],             verify: "inferred" },

  // ── P_KV ──────────────────────────────────────────────────────────────────
  { process_id: "P_KV", role_id: "BB_COORD", responsibility: "R", source_ids: ["S16"], verify: "inferred" },
  { process_id: "P_KV", role_id: "PDL",      responsibility: "A", source_ids: [],       verify: "assumed" },
  { process_id: "P_KV", role_id: "ASS",      responsibility: "C", source_ids: [],       verify: "inferred",
    note: "Ausfall meldet + Vertretung annimmt." },
  { process_id: "P_KV", role_id: "FB",       responsibility: "I", source_ids: ["S16"], verify: "inferred",
    note: "KV-Flag fließt in Lohnlauf." },

  // ── P_EINARBEITUNG ────────────────────────────────────────────────────────
  { process_id: "P_EINARBEITUNG", role_id: "PA",       responsibility: "A", source_ids: [],      verify: "assumed",
    note: "Personalabteilung verantwortet Einarbeitung formal." },
  { process_id: "P_EINARBEITUNG", role_id: "QM",       responsibility: "R", source_ids: ["S6"], verify: "inferred",
    note: "QM koordiniert Basismodule." },
  { process_id: "P_EINARBEITUNG", role_id: "BB_COORD", responsibility: "C", source_ids: [],      verify: "inferred" },
  { process_id: "P_EINARBEITUNG", role_id: "BR",       responsibility: "I", source_ids: [],      verify: "assumed",
    note: "§ 99 BetrVG – BR informiert bei Einstellung." },
  { process_id: "P_EINARBEITUNG", role_id: "ASS",      responsibility: "R", source_ids: [],      verify: "verified" },

  // ── P_TARIFCHECK ──────────────────────────────────────────────────────────
  { process_id: "P_TARIFCHECK", role_id: "FB",  responsibility: "R", source_ids: ["S16", "S32"], verify: "inferred" },
  { process_id: "P_TARIFCHECK", role_id: "PA",  responsibility: "A", source_ids: [],              verify: "assumed" },
  { process_id: "P_TARIFCHECK", role_id: "ASS", responsibility: "I", source_ids: [],              verify: "verified" },

  // ── P_NEUEINSTELLUNG ──────────────────────────────────────────────────────
  { process_id: "P_NEUEINSTELLUNG", role_id: "PA",  responsibility: "R", source_ids: [],      verify: "assumed" },
  { process_id: "P_NEUEINSTELLUNG", role_id: "GF",  responsibility: "A", source_ids: [],      verify: "assumed" },
  { process_id: "P_NEUEINSTELLUNG", role_id: "BR",  responsibility: "C", source_ids: ["S48"], verify: "verified",
    note: "§ 99 BetrVG Mitbestimmung bei personellen Einzelmaßnahmen." },
  { process_id: "P_NEUEINSTELLUNG", role_id: "PDL", responsibility: "C", source_ids: [],      verify: "inferred" },
  { process_id: "P_NEUEINSTELLUNG", role_id: "VS",  responsibility: "I", source_ids: [],      verify: "assumed" },

  // ── P_BR_WAHL ─────────────────────────────────────────────────────────────
  { process_id: "P_BR_WAHL", role_id: "ASS", responsibility: "R", source_ids: ["S48"], verify: "verified",
    note: "Wahlberechtigt: alle Beschäftigten (§ 7 BetrVG)." },
  { process_id: "P_BR_WAHL", role_id: "BR",  responsibility: "A", source_ids: ["S48"], verify: "verified",
    note: "Bestehender BR bestimmt Wahlvorstand (§ 16 BetrVG)." },
  { process_id: "P_BR_WAHL", role_id: "TK",  responsibility: "C", source_ids: [],      verify: "inferred",
    note: "Gewerkschaft kann unterstützen, Listen anregen." },
  { process_id: "P_BR_WAHL", role_id: "GF",  responsibility: "I", source_ids: [],      verify: "verified" },

  // ── P_BETRIEBSVEREINBARUNG ────────────────────────────────────────────────
  { process_id: "P_BETRIEBSVEREINBARUNG", role_id: "BR", responsibility: "R", source_ids: ["S48"], verify: "verified" },
  { process_id: "P_BETRIEBSVEREINBARUNG", role_id: "GF", responsibility: "A", source_ids: ["S48"], verify: "verified",
    note: "Unterzeichnet für Arbeitgeberseite." },
  { process_id: "P_BETRIEBSVEREINBARUNG", role_id: "PA", responsibility: "C", source_ids: [],      verify: "inferred" },
  { process_id: "P_BETRIEBSVEREINBARUNG", role_id: "VS", responsibility: "I", source_ids: [],      verify: "assumed" },

  // ── P_TARIFKOMM ───────────────────────────────────────────────────────────
  { process_id: "P_TARIFKOMM", role_id: "TK", responsibility: "R", source_ids: ["S15", "S16"], verify: "verified",
    note: "Tarifkommission ver.di + Betroffene verhandelt." },
  { process_id: "P_TARIFKOMM", role_id: "VS", responsibility: "A", source_ids: ["S16"],         verify: "verified",
    note: "Vorstand ad e.V. + GF unterzeichnen auf Arbeitgeberseite." },
  { process_id: "P_TARIFKOMM", role_id: "GF", responsibility: "C", source_ids: [],              verify: "verified" },
  { process_id: "P_TARIFKOMM", role_id: "BR", responsibility: "C", source_ids: [],              verify: "inferred",
    note: "Informelle Koordination BR ↔ TK." },
  { process_id: "P_TARIFKOMM", role_id: "ASS", responsibility: "I", source_ids: [],             verify: "verified" },

  // ── P_KUENDIGUNG ──────────────────────────────────────────────────────────
  { process_id: "P_KUENDIGUNG", role_id: "PA",  responsibility: "R", source_ids: [],      verify: "inferred" },
  { process_id: "P_KUENDIGUNG", role_id: "GF",  responsibility: "A", source_ids: [],      verify: "assumed" },
  { process_id: "P_KUENDIGUNG", role_id: "BR",  responsibility: "C", source_ids: ["S48"], verify: "verified",
    note: "§ 102 BetrVG – Anhörungspflicht, sonst Kündigung unwirksam." },
  { process_id: "P_KUENDIGUNG", role_id: "PDL", responsibility: "C", source_ids: [],      verify: "inferred" },

  // ── P_KOSTENUEBERNAHME ────────────────────────────────────────────────────
  { process_id: "P_KOSTENUEBERNAHME", role_id: "CL",       responsibility: "R", source_ids: [],     verify: "verified",
    note: "Antrag wird formell von Leistungsberechtigten gestellt." },
  { process_id: "P_KOSTENUEBERNAHME", role_id: "BB_COORD", responsibility: "C", source_ids: [],     verify: "inferred",
    note: "Beratungsbüro unterstützt Antrag + Bedarfsbeschreibung." },
  { process_id: "P_KOSTENUEBERNAHME", role_id: "KT",       responsibility: "A", source_ids: [],     verify: "verified",
    note: "Bewilligung durch Pflegekasse / Sozialamt / Eingliederungshilfe." },
  { process_id: "P_KOSTENUEBERNAHME", role_id: "FB",       responsibility: "I", source_ids: [],     verify: "inferred" },

  // ── P_QMZIRKEL ────────────────────────────────────────────────────────────
  { process_id: "P_QMZIRKEL", role_id: "QM",       responsibility: "R", source_ids: ["S6"], verify: "verified" },
  { process_id: "P_QMZIRKEL", role_id: "PDL",      responsibility: "A", source_ids: [],      verify: "inferred" },
  { process_id: "P_QMZIRKEL", role_id: "BB_COORD", responsibility: "C", source_ids: [],      verify: "inferred" },
  { process_id: "P_QMZIRKEL", role_id: "ASS",      responsibility: "C", source_ids: [],      verify: "inferred" },

  // ── P_VORSTANDS_SITZUNG ───────────────────────────────────────────────────
  { process_id: "P_VORSTANDS_SITZUNG", role_id: "VS", responsibility: "R", source_ids: ["S2"], verify: "verified" },
  { process_id: "P_VORSTANDS_SITZUNG", role_id: "MV", responsibility: "A", source_ids: ["S2"], verify: "verified",
    note: "Vorstand ist Mitgliederversammlung rechenschaftspflichtig." },
  { process_id: "P_VORSTANDS_SITZUNG", role_id: "GF", responsibility: "C", source_ids: ["S2"], verify: "verified" },
];

/** Hilfsfunktion: Alle Einträge für Prozess × Rolle. Meist exakt 0 oder 1. */
export function raciFor(process_id: string, role_id: string): RACIEntry | undefined {
  return RACI.find((r) => r.process_id === process_id && r.role_id === role_id);
}

/** Konsistenz-Check: Jeder Prozess sollte genau 1 Accountable haben. */
export function auditRACI(): { process_id: string; issue: string }[] {
  const issues: { process_id: string; issue: string }[] = [];
  for (const p of RACI_PROCESSES) {
    const aCount = RACI.filter((r) => r.process_id === p.id && r.responsibility === "A").length;
    if (aCount === 0) issues.push({ process_id: p.id, issue: "kein Accountable" });
    else if (aCount > 1) issues.push({ process_id: p.id, issue: `${aCount}× Accountable (muss 1 sein)` });
  }
  return issues;
}
