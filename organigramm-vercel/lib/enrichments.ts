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

/**
 * Loader für die UI. Aktuell nur public. In Sub-Projekt I wird hier
 * dynamisch enrichments.private.ts dazugeladen, wenn BUILD_MODE=private.
 */
export function loadEnrichments(): Enrichment[] {
  return ENRICHMENTS_PUBLIC;
}

/** Filter: alle Enrichments für einen Knoten. */
export function enrichmentsFor(node_id: string): Enrichment[] {
  return loadEnrichments().filter((e) => e.node_id === node_id);
}
