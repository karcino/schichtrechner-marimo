/**
 * Enrichments — Pro-Knoten-Zusatzinfos mit Provenance.
 *
 * Ergänzt NODES in data.ts, ohne es zu polluten. Wird vom Ingest-Pipeline
 * (Sub-Projekte D/J) befüllt und in der UI als zusätzliches Badge pro Knoten
 * gerendert.
 *
 * Dual-Build (Sub-Projekt I):
 *   visibility="public"  → immer sichtbar
 *   visibility="private" → nur wenn NEXT_PUBLIC_BUILD_MODE=private
 *
 * Private Enrichments leben in enrichments.private.ts (gitignored) und
 * werden in Sub-Projekt I dynamisch dazugeladen.
 */

export type EnrichmentKind =
  | "process-evidence"
  | "osint-finding"
  | "schichtplan-signal"
  | "financial-note"
  | "email-reference-private";

export type Enrichment = {
  /** Referenz auf OrgNode.id aus data.ts */
  node_id: string;
  kind: EnrichmentKind;
  /** Kurze Zusammenfassung, 1–2 Sätze. Bei email-reference-private FIX "Mailaustausch mit Arbeitgeber". */
  summary: string;
  /** Referenzen auf SOURCES aus sources.ts. Darf leer sein, wenn ob1_refs vorhanden. */
  source_ids: string[];
  /** OB1-Entry-IDs für Deep-Drill (Paul-only via MCP). */
  ob1_refs?: string[];
  /** YYYY-MM-DD */
  added: string;
  confidence: "high" | "medium" | "low";
  /** Dual-Build-Gate. */
  visibility: "public" | "private";
};

export const ENRICHMENTS_PUBLIC: Enrichment[] = [
  // Wird iterativ aus Sub-Projekt D (Register-Scraper) und J (RACI) gefüllt.
];

// Dual-Build-Gate: Generator (scripts/generate-enrichments.mjs) schreibt
// enrichments.generated.ts vor jedem Build. Im public-Build exportiert er
// den leeren Stub; im private-Build (BUILD_MODE=private) bündelt er die
// echte enrichments.private.ts mit rein.
import { ENRICHMENTS_PRIVATE, INCLUDES_PRIVATE } from "./enrichments.generated";

/** Loader für die UI. Merged public + private (wenn private-Build aktiv). */
export function loadEnrichments(): Enrichment[] {
  if (!INCLUDES_PRIVATE) return ENRICHMENTS_PUBLIC;
  return [...ENRICHMENTS_PUBLIC, ...ENRICHMENTS_PRIVATE];
}

/** Filter: alle Enrichments für einen Knoten. */
export function enrichmentsFor(node_id: string): Enrichment[] {
  return loadEnrichments().filter((e) => e.node_id === node_id);
}

/** Build-Mode-Flag für die UI (z.B. Banner "Private Build" im Header). */
export const IS_PRIVATE_BUILD = INCLUDES_PRIVATE;
