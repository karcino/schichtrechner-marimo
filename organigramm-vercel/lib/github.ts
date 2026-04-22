/**
 * GitHub REST-API Client für Accept-to-Issue-Flow.
 *
 * Wird aufgerufen, wenn Paul einen Proposal im /review akzeptiert:
 * erzeugt ein strukturiertes Issue im schichtrechner-marimo-Repo mit
 * dem Vorschlags-Inhalt, Attribution, Kategorie, OB1-Link.
 *
 * Env-Vars:
 *   GITHUB_TOKEN   Personal Access Token mit public_repo oder repo scope
 *   GITHUB_OWNER   z.B. "karcino"
 *   GITHUB_REPO    z.B. "schichtrechner-marimo"
 *
 * Falls eine der drei Env-Vars fehlt: createProposalIssue() wirft nicht,
 * sondern loggt nur + liefert null. /review funktioniert damit auch
 * ohne GitHub-Integration (Accept-Update in OB1 bleibt erhalten).
 */
import type { ProposalRow } from "./supabase";

type IssueResponse = {
  html_url: string;
  number: number;
};

const CATEGORY_LABELS: Record<string, string> = {
  "new-source": "Neue Quelle (strukturiert)",
  source: "Quellen-Hinweis",
  correction: "Korrektur",
  "missing-info": "Fehlende Info",
  comment: "Kommentar",
};

function excerpt(text: string, maxLen = 60): string {
  const s = text.replace(/\[Vorschlag von [^\]]+\]\s*/g, "").replace(/\[[^\]]+\]\s*/, "").trim();
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen - 1).trimEnd() + "…";
}

export async function createProposalIssue(proposal: ProposalRow): Promise<IssueResponse | null> {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;

  if (!token || !owner || !repo) {
    console.warn("[github] createProposalIssue skipped — env vars missing.");
    return null;
  }

  const m = proposal.metadata;
  const categoryLabel = CATEGORY_LABELS[m.category ?? "comment"] ?? m.category ?? "Unkategorisiert";
  const authorName = m.author_name ?? "Anonym";
  const submittedAt = m.submitted_at ?? proposal.created_at;
  const dateStr = new Date(submittedAt).toLocaleDateString("de-DE");

  const title = m.category === "new-source" && m.source_title
    ? `Proposal (${categoryLabel}): ${m.source_title}`
    : `Proposal (${categoryLabel}): ${excerpt(proposal.content)}`;

  // Structured body als Markdown — so lesbar im GitHub-Web-UI
  const bodyParts: string[] = [
    `> **Kategorie:** ${categoryLabel}`,
    `> **Eingereicht:** ${dateStr} von \`${authorName}\``,
  ];
  if (m.node_id) bodyParts.push(`> **Knoten:** \`${m.node_id}\``);
  if (m.source_url) bodyParts.push(`> **URL:** ${m.source_url}`);
  if (m.source_title) bodyParts.push(`> **Titel:** ${m.source_title}`);
  if (m.source_kind) bodyParts.push(`> **Kind:** \`${m.source_kind}\``);
  bodyParts.push("", "## Inhalt", "", proposal.content);

  // Kategorie-spezifischer Integrations-Hint
  bodyParts.push("", "---", "", "### Integration", "");

  if (m.category === "new-source" && m.source_title && m.source_url && m.source_kind) {
    const today = new Date().toISOString().slice(0, 10);
    bodyParts.push(
      "Ready-to-paste fuer `organigramm-vercel/lib/sources.ts` — die naechste freie `S<n>`-ID verwenden:",
      "",
      "```ts",
      `  S??: { id: "S??", title: ${JSON.stringify(m.source_title)}, url: ${JSON.stringify(m.source_url)}, accessed: "${today}", kind: "${m.source_kind}" },`,
      "```",
      "",
      m.node_id
        ? `Danach in \`data.ts\` den \`sources\`-Array des Knotens \`${m.node_id}\` um die neue ID erweitern.`
        : "Die Quelle ist nicht knoten-gebunden — optional in einem passenden Knoten referenzieren.",
    );
  } else {
    bodyParts.push(
      "Je nach Kategorie:",
      "",
      "**Quellen-Hinweis →** `organigramm-vercel/lib/sources.ts`: neuen `SOURCES`-Eintrag mit naechster freier `S<n>`-ID erstellen, dann in `data.ts` den Knoten-`sources`-Array erweitern.",
      "",
      "**Korrektur →** direktes Edit in `organigramm-vercel/lib/data.ts` am betreffenden NODES-Eintrag oder RACI-Entry.",
      "",
      "**Fehlende Info →** je nach Feld entweder neuen Knoten ergaenzen (data.ts NODES) oder description/role eines bestehenden Knotens erweitern.",
      "",
      "**Kommentar →** nur zur Kenntnis — ggf. auf einen Issue-Kommentar antworten und schliessen.",
    );
  }

  bodyParts.push("", "---", "", `OB1-Entry: \`${proposal.id}\``);

  const body = bodyParts.join("\n");

  const labels: string[] = ["proposal", "from-edit-ui"];
  if (m.category) labels.push(`kind:${m.category}`);

  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, body, labels }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("[github] Issue-create failed:", res.status, errBody.slice(0, 200));
      return null;
    }

    const issue = (await res.json()) as IssueResponse;
    return issue;
  } catch (err) {
    console.error("[github] Issue-create network error:", err);
    return null;
  }
}
