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
};

export type ASNRecord = {
  kuerzel: string;
  occurrences: number;
  contexts_count: number;
  associated_bueros: string[];
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

export type PrivateDataset = {
  persons: PersonRecord[];
  asns: ASNRecord[];
  commLogByPerson: Record<string, CommunicationEntry[]>;
  status: {
    personsFound: boolean;
    asnsFound: boolean;
    commLogFound: boolean;
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
