/**
 * /review — Pauls Proposal-Review-Page.
 *
 * Password-gated via ?key=<REVIEW_PASSWORD>. Server-Component, rendert
 * pending Proposals aus OB1 via Supabase-Admin-Client. Accept/Reject/
 * Later-Buttons schicken POST an /api/review.
 */
import Link from "next/link";
import { listProposals, type ProposalRow } from "@/lib/supabase";

type Props = {
  searchParams: { key?: string; status?: string };
};

export const dynamic = "force-dynamic";

export default async function ReviewPage({ searchParams }: Props) {
  const reviewPw = process.env.REVIEW_PASSWORD;
  if (!reviewPw) {
    return (
      <Shell>
        <ErrorCard>REVIEW_PASSWORD-Env-Variable ist nicht gesetzt.</ErrorCard>
      </Shell>
    );
  }

  if (searchParams.key !== reviewPw) {
    return (
      <Shell>
        <LoginCard />
      </Shell>
    );
  }

  const statusFilter = (searchParams.status as ProposalRow["metadata"]["status"]) ?? "pending";
  let proposals: ProposalRow[] = [];
  let loadError: string | null = null;
  try {
    proposals = await listProposals(statusFilter);
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Unbekannter Fehler";
  }

  return (
    <Shell>
      <header className="mb-4">
        <h1 className="text-xl font-semibold text-ink dark:text-paper">
          Proposal-Review
        </h1>
        <p className="text-sm text-ink-soft dark:text-paper/70 mt-1">
          Eingaben aus der Edit-UI (Sub-Projekt E). Status-Filter: <code className="font-mono">{statusFilter}</code>
        </p>
      </header>

      <div className="flex gap-2 mb-4 text-xs">
        {(["pending", "accepted", "rejected", "later"] as const).map((s) => (
          <Link
            key={s}
            href={`/review?key=${encodeURIComponent(reviewPw)}&status=${s}`}
            className={`px-3 py-1 rounded-full border ${
              statusFilter === s
                ? "bg-accent text-white border-accent"
                : "border-ink-soft/20 text-ink-soft hover:bg-ink-soft/5"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      {loadError && (
        <ErrorCard>
          Fehler beim Laden: <code className="font-mono">{loadError}</code>
        </ErrorCard>
      )}

      {!loadError && proposals.length === 0 && (
        <div className="text-sm text-ink-soft italic py-6">
          Keine Proposals mit Status <code className="font-mono">{statusFilter}</code>.
        </div>
      )}

      <ul className="space-y-3">
        {proposals.map((p) => (
          <ProposalCard key={p.id} proposal={p} reviewKey={reviewPw} />
        ))}
      </ul>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-paper dark:bg-ink p-4 md:p-8 max-w-3xl mx-auto">
      {children}
    </main>
  );
}

function LoginCard() {
  return (
    <form
      method="get"
      action="/review"
      className="bg-white dark:bg-ink-soft rounded-xl shadow-card p-6 max-w-md mx-auto mt-12 space-y-3"
    >
      <h1 className="text-lg font-semibold text-ink dark:text-paper">Review-Zugang</h1>
      <p className="text-sm text-ink-soft dark:text-paper/70">
        Passwort nötig. Dieses ist separat vom Edit-Passwort und nur für Paul.
      </p>
      <input
        type="password"
        name="key"
        autoFocus
        className="w-full border border-ink-soft/20 rounded-lg px-3 py-2 bg-paper dark:bg-ink focus:outline-none focus:ring-2 focus:ring-accent"
        placeholder="REVIEW_PASSWORD"
      />
      <button
        type="submit"
        className="w-full bg-accent text-white rounded-lg py-2 font-medium hover:bg-accent/90"
      >
        Einloggen
      </button>
    </form>
  );
}

function ErrorCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-danger-soft border border-danger/40 rounded-lg p-4 text-sm text-danger">
      {children}
    </div>
  );
}

function ProposalCard({ proposal, reviewKey }: { proposal: ProposalRow; reviewKey: string }) {
  const m = proposal.metadata;
  const status = m.status ?? "pending";
  const date = m.submitted_at ?? proposal.created_at;
  const formattedDate = new Date(date).toLocaleString("de-DE");

  return (
    <li className="bg-white dark:bg-ink-soft rounded-lg shadow-card border border-ink-soft/10 p-4">
      <div className="flex items-baseline justify-between gap-2 mb-2">
        <div className="text-sm">
          <span className="font-semibold text-ink dark:text-paper">{m.author_name ?? "Anonym"}</span>
          <span className="text-ink-soft/60 mx-2">·</span>
          <span className="text-xs font-mono uppercase text-ink-soft">{m.category ?? "?"}</span>
          {m.node_id && (
            <>
              <span className="text-ink-soft/60 mx-2">·</span>
              <span className="text-xs font-mono">{m.node_id}</span>
            </>
          )}
        </div>
        <time className="text-[11px] text-ink-soft/60 font-mono">{formattedDate}</time>
      </div>

      <div className="text-sm text-ink dark:text-paper whitespace-pre-wrap mb-3">
        {proposal.content}
      </div>

      {m.source_url && (
        <div className="text-xs mb-3">
          <span className="text-ink-soft">Quelle: </span>
          <a
            href={m.source_url}
            target="_blank"
            rel="noreferrer"
            className="text-accent underline break-all"
          >
            {m.source_url}
          </a>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-ink-soft/10 pt-3 mt-2">
        <span className="text-[11px] font-mono text-ink-soft">
          id: <span className="select-all">{proposal.id}</span>
        </span>
        <form method="post" action="/api/review" className="flex gap-1">
          <input type="hidden" name="key" value={reviewKey} />
          <input type="hidden" name="id" value={proposal.id} />
          {status !== "accepted" && (
            <ActionButton name="action" value="accept" label="Accept" variant="accent" />
          )}
          {status !== "rejected" && (
            <ActionButton name="action" value="reject" label="Reject" variant="danger" />
          )}
          {status !== "later" && status !== "pending" && (
            <ActionButton name="action" value="later" label="Später" variant="warn" />
          )}
          {status !== "pending" && (
            <ActionButton name="action" value="pending" label="Reopen" variant="ghost" />
          )}
        </form>
      </div>
    </li>
  );
}

function ActionButton({
  name,
  value,
  label,
  variant,
}: {
  name: string;
  value: string;
  label: string;
  variant: "accent" | "danger" | "warn" | "ghost";
}) {
  const classes: Record<typeof variant, string> = {
    accent: "bg-accent text-white hover:bg-accent/90",
    danger: "bg-danger text-white hover:bg-danger/90",
    warn: "bg-warn text-ink hover:bg-warn/90",
    ghost: "border border-ink-soft/20 text-ink-soft hover:bg-ink-soft/5",
  } as const;
  return (
    <button
      type="submit"
      name={name}
      value={value}
      className={`text-xs px-3 py-1 rounded ${classes[variant]}`}
    >
      {label}
    </button>
  );
}
