/**
 * POST /api/propose
 *
 * Nimmt Vorschlaege von Besuchern entgegen und schreibt sie in die OB1-
 * Instanz als thoughts mit tag="proposal" + status="pending". Paul kann
 * die Liste via MCP-Query in Claude Code abrufen:
 *
 *   list_thoughts topic="proposal"
 *
 * Sicherheits-Layer:
 * 1. EDIT_PASSWORD-Match (shared password, distributed im Vertrauenskreis)
 * 2. Server-side-only — Client-Check ist nur UX
 * 3. Keine personenbezogenen Daten Dritter in Freitext erlaubt (nur
 *    minimale Validierung im Client — echte Moderation macht Paul)
 *
 * Scope E-LITE: akzeptiert freie Kommentare + optional Source-URL.
 * Struktur-Edits (neue Knoten, Rollen) kommen in E-FULL spaeter.
 */
import { NextResponse } from "next/server";

const CATEGORIES = new Set([
  "source",       // freitextlich: "Ich habe eine neue Quelle fuer Knoten X"
  "new-source",   // strukturiert: url + title + kind + node_id (Sub-Projekt E-FULL)
  "correction",   // "Der Rollen-Name stimmt nicht, richtig ist ..."
  "missing-info", // "Knoten X fehlt Info zu Y"
  "comment",      // Genereller Kommentar / Beobachtung
]);

const SOURCE_KINDS = new Set([
  "primary", "secondary", "archive", "legal", "internal",
  "email-private", "shift-agg", "osint-register", "financial-public", "ob1-synthesis",
]);

// Client-side max lengths — bitte consistent mit ProposalForm halten
const MAX_CONTENT = 2000;
const MAX_NAME = 60;

export async function POST(req: Request) {
  const password = process.env.EDIT_PASSWORD;
  const brainUrl = process.env.BRAIN_URL;
  const brainKey = process.env.BRAIN_KEY;

  if (!password || !brainUrl || !brainKey) {
    // Server misconfiguration — lehne ab, ohne Details preiszugeben
    return NextResponse.json(
      { error: "Edit-UI nicht konfiguriert." },
      { status: 503 }
    );
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungueltiges JSON." }, { status: 400 });
  }

  if (typeof payload !== "object" || payload === null) {
    return NextResponse.json({ error: "Payload muss ein Objekt sein." }, { status: 400 });
  }

  const {
    password: clientPassword,
    name,
    category,
    content,
    source_url,
    node_id,
    // new-source-spezifische Felder (nur bei category="new-source")
    source_title,
    source_kind,
  } = payload as Record<string, unknown>;

  if (clientPassword !== password) {
    return NextResponse.json({ error: "Passwort falsch." }, { status: 401 });
  }

  if (typeof name !== "string" || name.trim().length === 0 || name.length > MAX_NAME) {
    return NextResponse.json({ error: "Name fehlt oder zu lang." }, { status: 400 });
  }

  if (typeof category !== "string" || !CATEGORIES.has(category)) {
    return NextResponse.json({ error: "Unbekannte Kategorie." }, { status: 400 });
  }

  if (typeof content !== "string" || content.trim().length === 0 || content.length > MAX_CONTENT) {
    return NextResponse.json({ error: "Inhalt fehlt oder zu lang." }, { status: 400 });
  }

  // source_url und node_id sind optional
  if (source_url !== undefined && typeof source_url !== "string") {
    return NextResponse.json({ error: "source_url muss String sein." }, { status: 400 });
  }
  if (node_id !== undefined && typeof node_id !== "string") {
    return NextResponse.json({ error: "node_id muss String sein." }, { status: 400 });
  }

  // new-source-Kategorie: strukturierte Felder sind PFLICHT
  if (category === "new-source") {
    if (typeof source_url !== "string" || source_url.trim().length === 0) {
      return NextResponse.json({ error: "URL ist Pflicht bei new-source." }, { status: 400 });
    }
    if (typeof source_title !== "string" || source_title.trim().length === 0) {
      return NextResponse.json({ error: "Titel ist Pflicht bei new-source." }, { status: 400 });
    }
    if (typeof source_kind !== "string" || !SOURCE_KINDS.has(source_kind)) {
      return NextResponse.json({ error: "Unbekanntes kind bei new-source." }, { status: 400 });
    }
    // node_id optional auch hier — Quelle kann global sein, nicht knoten-gebunden
  }

  // An OB1 weiterreichen. capture_thought generiert Embedding + Metadata.
  // Extra-Metadata: unsere eigenen Tags, damit Paul die Proposals spaeter
  // gezielt filtern kann via list_thoughts oder Supabase-Query.
  // Fuer strukturiertes new-source bauen wir einen Marker-Text, der in der
  // OB1-Volltext-Semantiksuche wiederfindbar ist, und legen zusaetzlich die
  // strukturierten Felder in metadata.
  const contentPrefix = `[Vorschlag von ${name.trim()}${node_id ? ` zu Knoten ${node_id}` : ""}] [${category}]`;
  let contentBody = content.trim();
  if (category === "new-source") {
    contentBody = `${source_title as string}\n${source_url as string}\n(kind=${source_kind as string})\n\n${contentBody}`;
  } else if (source_url) {
    contentBody = `${contentBody}\n\nQuelle: ${source_url}`;
  }

  const ob1Body = {
    jsonrpc: "2.0",
    id: Date.now(),
    method: "tools/call",
    params: {
      name: "capture_thought",
      arguments: {
        content: `${contentPrefix} ${contentBody}`,
        metadata: {
          kind: "edit-proposal",
          status: "pending",
          visibility: "public",
          author_name: name.trim(),
          category,
          node_id: node_id ?? null,
          source_url: source_url ?? null,
          source_title: category === "new-source" ? (source_title as string) : null,
          source_kind: category === "new-source" ? (source_kind as string) : null,
          submitted_at: new Date().toISOString(),
        },
      },
    },
  };

  try {
    const ob1Response = await fetch(brainUrl, {
      method: "POST",
      headers: {
        "x-brain-key": brainKey,
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify(ob1Body),
    });

    if (!ob1Response.ok) {
      // OB1 hat das abgelehnt — nicht an Client durchreichen, nur loggen
      console.error("OB1 rejected proposal:", ob1Response.status, await ob1Response.text());
      return NextResponse.json(
        { error: "Vorschlag konnte nicht gespeichert werden." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, message: "Danke! Paul schaut rein." });
  } catch (err) {
    console.error("OB1 fetch error:", err);
    return NextResponse.json(
      { error: "Netzwerkfehler beim Speichern." },
      { status: 502 }
    );
  }
}
