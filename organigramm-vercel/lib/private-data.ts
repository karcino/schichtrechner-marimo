/**
 * Server-only Loader für die drei gitignored Private-JSONs.
 *
 * Liest aus `<repo-root>/organigramm/raw/` zur Request-Zeit.
 * **NUR in Server-Components / Route-Handlern importieren!**
 * Client-safe Types liegen in `private-data-types.ts`.
 */
import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";

import type {
  PersonRecord,
  ASNRecord,
  CommunicationEntry,
  PrivateDataset,
} from "./private-data-types";

// Re-export types for convenience
export type { PersonRecord, ASNRecord, CommunicationEntry, PrivateDataset } from "./private-data-types";
export { BUERO_LABELS, groupPersonsByBuero } from "./private-data-types";

const RAW_DIR_REL = ["..", "organigramm", "raw"];

async function readJsonIfExists<T>(filename: string): Promise<T | null> {
  const p = path.resolve(process.cwd(), ...RAW_DIR_REL, filename);
  try {
    const raw = await readFile(p, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function loadPrivateDataset(): Promise<PrivateDataset> {
  const rawDirAbs = path.resolve(process.cwd(), ...RAW_DIR_REL);

  const personsData = await readJsonIfExists<{ persons: PersonRecord[] }>(
    "persons-private.json",
  );
  const asnsData = await readJsonIfExists<{ asns: ASNRecord[] }>(
    "asn-kuerzel-private.json",
  );
  const commData = await readJsonIfExists<{
    per_person: Record<string, CommunicationEntry[]>;
  }>("communication-log-private.json");

  return {
    persons: personsData?.persons ?? [],
    asns: asnsData?.asns ?? [],
    commLogByPerson: commData?.per_person ?? {},
    status: {
      personsFound: personsData !== null,
      asnsFound: asnsData !== null,
      commLogFound: commData !== null,
      rawDirAbsolute: rawDirAbs,
    },
  };
}
