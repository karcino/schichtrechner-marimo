/**
 * Committed Stub für enrichments.private.ts.
 *
 * Immer leer. Wird vom Generator (scripts/generate-enrichments.mjs) als
 * Fallback verwendet, wenn kein echtes enrichments.private.ts existiert
 * oder BUILD_MODE=public.
 *
 * Die echte private Datei (enrichments.private.ts, gitignored) wird von Paul
 * lokal befüllt aus Sub-Projekt B (Email-Ingestion). Sie überschreibt diesen
 * Stub im private-Build automatisch — der Generator bündelt sie zu
 * lib/enrichments.generated.ts zusammen.
 *
 * NIEMALS hier echte Daten einfüllen. Dieser Stub ist commited.
 */

import type { Enrichment } from "./enrichments";

export const ENRICHMENTS_PRIVATE: Enrichment[] = [];
