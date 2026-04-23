/**
 * Client-safe Types + Konstanten für die Private-View.
 * Kein fs / path / node-import — nur Daten-Shapes.
 */

export type PersonRecord = {
  name: string;
  role_guesses: string[];
  phone_candidates: string[];
  email_candidates: string[];
  buero_guesses: string[];
  occurrences: number;
  first_seen: string | null;
  last_seen: string | null;
  sample_closing_line: string | null;
  in_count?: number;                                 // von Person erhalten
  out_count?: number;                                // an Person gesendet
  top_keywords?: Array<[string, number]>;            // [['schicht', 8], ...]
  co_mentioned_with?: Array<[string, number]>;       // andere Personen (meist leer, s. script)
};

export type ASNRecord = {
  kuerzel: string;
  occurrences: number;
  contexts_count: number;
  associated_bueros: string[];
  /** [Name, count] absteigend sortiert — wer hat Mails mit Bezug auf diesen
   *  ASN unterschrieben. Primär-Kontakt = associated_persons[0]. */
  associated_persons?: Array<[string, number]>;
  first_seen: string | null;
  last_seen: string | null;
};

export type CommunicationEntry = {
  date: string;
  direction: "in" | "out" | "unknown";
  subject_hash: string;
  subject_keyword: string;
  from_domain: string;
  to_domain: string;
};

/** Paul's eigene Schichten pro ASN — Quelle: schichtplaner_allinone.html. */
export type PaulShiftStats = {
  kuerzel: string;
  shifts: number;
  hours: number;
  first_date: string | null;
  last_date: string | null;
  dates: string[];
};

export type PrivateDataset = {
  persons: PersonRecord[];
  asns: ASNRecord[];
  commLogByPerson: Record<string, CommunicationEntry[]>;
  paulShiftsByAsn: Record<string, PaulShiftStats>;
  status: {
    personsFound: boolean;
    asnsFound: boolean;
    commLogFound: boolean;
    paulShiftsFound: boolean;
    rawDirAbsolute: string;
  };
};

export const BUERO_LABELS: Record<string, string> = {
  ES: "Einsatzstelle (Wilhelm-Kabus-Str.)",
  BBS: "Beratungsbüro Süd (Mehringhof)",
  BBW: "Beratungsbüro West",
  BBN: "Beratungsbüro Nordost",
  BR: "Betriebsrat (Urbanstr.)",
  OTHER: "Ohne Büro-Zuordnung",
};

export function groupPersonsByBuero(persons: PersonRecord[]): Record<string, PersonRecord[]> {
  const buckets: Record<string, PersonRecord[]> = {
    ES: [],
    BBS: [],
    BBW: [],
    BBN: [],
    BR: [],
    OTHER: [],
  };
  for (const p of persons) {
    const primary = p.buero_guesses[0] ?? "OTHER";
    const key = primary in buckets ? primary : "OTHER";
    buckets[key].push(p);
  }
  return buckets;
}
