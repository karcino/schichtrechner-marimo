/**
 * Template für enrichments.private.ts.
 *
 * Kopiere diese Datei zu `enrichments.private.ts` (gitignored!) und befülle
 * sie aus der privaten OB1-Instanz nach Sub-Projekt B (Email-Ingestion).
 *
 * WICHTIG:
 *   - enrichments.private.ts steht in .gitignore und darf niemals commited werden.
 *   - Pre-commit-Hook aus Sub-Projekt I blockiert versehentliches Staging.
 *   - Jeder Eintrag hat summary fix auf "Mailaustausch mit Arbeitgeber".
 *   - Details leben nur in der privaten OB1-Instanz, abrufbar via MCP-Query.
 */

import type { Enrichment } from "./enrichments";

export const ENRICHMENTS_PRIVATE: Enrichment[] = [
  // Beispiel-Eintrag (deaktiviert):
  // {
  //   node_id: "EINSATZ_HQ",
  //   kind: "email-reference-private",
  //   summary: "Mailaustausch mit Arbeitgeber",
  //   source_ids: [],
  //   ob1_refs: ["ob1:private:0000-0000-0000-0000"],
  //   added: "2026-04-22",
  //   confidence: "medium",
  //   visibility: "private",
  // },
];
