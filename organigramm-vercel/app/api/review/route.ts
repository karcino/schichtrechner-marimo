/**
 * POST /api/review
 *
 * Verarbeitet Accept/Reject/Later/Reopen-Klicks vom /review-UI.
 * Form-Encoded Body: { key, id, action }.
 * Nach Erfolg Redirect zurueck zu /review?key=...&status=...
 */
import { NextResponse } from "next/server";
import { getProposal, updateProposalStatus } from "@/lib/supabase";
import { createProposalIssue } from "@/lib/github";

const VALID_ACTIONS = new Set(["accept", "reject", "later", "pending"] as const);
type Action = "accept" | "reject" | "later" | "pending";
const ACTION_TO_STATUS: Record<Action, "accepted" | "rejected" | "later" | "pending"> = {
  accept: "accepted",
  reject: "rejected",
  later: "later",
  pending: "pending",
};

export async function POST(req: Request) {
  const reviewPw = process.env.REVIEW_PASSWORD;
  if (!reviewPw) {
    return NextResponse.json({ error: "REVIEW_PASSWORD fehlt." }, { status: 503 });
  }

  const form = await req.formData();
  const key = form.get("key");
  const id = form.get("id");
  const action = form.get("action");

  if (key !== reviewPw) {
    return NextResponse.redirect(new URL("/review", req.url));
  }
  if (typeof id !== "string" || id.length === 0) {
    return NextResponse.json({ error: "id fehlt." }, { status: 400 });
  }
  if (typeof action !== "string" || !VALID_ACTIONS.has(action as Action)) {
    return NextResponse.json({ error: "Unbekannte Aktion." }, { status: 400 });
  }

  const newStatus = ACTION_TO_STATUS[action as Action];
  const extras: Record<string, unknown> = {};

  // Bei Accept: zusaetzlich GitHub-Issue erzeugen, damit Paul im GitHub-
  // Web-UI die Aenderung tracken + integrieren kann. Fehlschlag bricht
  // nicht die Status-Aenderung ab — nur Log + Hinweis.
  if (action === "accept") {
    try {
      const proposal = await getProposal(id);
      if (proposal) {
        const issue = await createProposalIssue(proposal);
        if (issue) {
          extras.issue_url = issue.html_url;
          extras.issue_number = issue.number;
        }
      }
    } catch (err) {
      console.error("createProposalIssue failed (non-fatal):", err);
    }
  }

  try {
    await updateProposalStatus(id, newStatus, extras);
  } catch (err) {
    console.error("updateProposalStatus failed:", err);
    return NextResponse.json({ error: "DB-Update fehlgeschlagen." }, { status: 502 });
  }

  // Zurueck zur Review-Seite, selber Status-Filter wie vorher.
  // Kommt die Request von /review?status=pending → wir leiten auf pending zurueck.
  const referer = req.headers.get("referer") ?? "/review";
  const target = new URL(referer, req.url);
  if (!target.searchParams.has("key")) target.searchParams.set("key", reviewPw);
  return NextResponse.redirect(target, { status: 303 });
}
