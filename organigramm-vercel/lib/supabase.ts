/**
 * Server-side Supabase-Client fuer direkten DB-Zugriff.
 *
 * Wird NUR in Route-Handlern und Server-Components genutzt, nie im Client.
 * Verwendet den SERVICE_ROLE_KEY — hat RLS-Bypass. Entsprechend nie im
 * Client-Code importieren.
 *
 * Env-Vars:
 *   SUPABASE_URL           z.B. https://<ref>.supabase.co
 *   SUPABASE_SERVICE_KEY   sb_secret_... (service_role, nicht publishable)
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL + SUPABASE_SERVICE_KEY müssen als Env-Vars gesetzt sein."
    );
  }

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export type ProposalRow = {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  metadata: {
    kind?: string;
    status?: "pending" | "accepted" | "rejected" | "later";
    visibility?: string;
    author_name?: string;
    category?: string;
    node_id?: string | null;
    source_url?: string | null;
    submitted_at?: string;
    // Weitere OB1-Metadata-Felder (topics, people, type) werden ignoriert
    [key: string]: unknown;
  };
};

/** Fetch alle Edit-Proposals, sortiert nach submitted_at absteigend. */
export async function listProposals(status?: ProposalRow["metadata"]["status"]) {
  const supa = getSupabaseAdmin();
  // metadata @> JSON-Filter nutzt den GIN-Index aus der OB1-Schema.
  const filter: Record<string, unknown> = { kind: "edit-proposal" };
  if (status) filter.status = status;

  const { data, error } = await supa
    .from("thoughts")
    .select("id, content, created_at, updated_at, metadata")
    .contains("metadata", filter)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) throw error;
  return (data ?? []) as ProposalRow[];
}

/** Aktualisiert den Status eines Proposals. */
export async function updateProposalStatus(
  id: string,
  status: "accepted" | "rejected" | "later" | "pending",
  decidedBy?: string
) {
  const supa = getSupabaseAdmin();
  // metadata ist jsonb — wir merken uns den alten Wert und schreiben ein
  // Delta. Supabase kennt keinen JSON-Merge-Operator direkt, also read-
  // modify-write.
  const { data: current, error: readErr } = await supa
    .from("thoughts")
    .select("metadata")
    .eq("id", id)
    .single();

  if (readErr) throw readErr;

  const newMetadata = {
    ...(current?.metadata ?? {}),
    status,
    decided_at: new Date().toISOString(),
    decided_by: decidedBy ?? "paul",
  };

  const { error: writeErr } = await supa
    .from("thoughts")
    .update({ metadata: newMetadata })
    .eq("id", id);

  if (writeErr) throw writeErr;
  return { ok: true };
}
