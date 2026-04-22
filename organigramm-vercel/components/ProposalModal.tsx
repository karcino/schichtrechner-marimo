"use client";

import { useEffect, useState } from "react";

/**
 * Edit-UI Modal (Sub-Projekt E, Scope E-LITE).
 *
 * Drei-Schritt-Flow:
 *   1. Password-Gate (shared password aus Vertrauenskreis)
 *   2. Name-Eingabe (bleibt in localStorage)
 *   3. Form (Kategorie + Content + optional Quelle + optional Knoten-ID)
 *
 * Submission ruft /api/propose auf. Keine direkte OB1-Verbindung vom
 * Client — Password + Brain-Key bleiben server-side.
 */

type Props = { open: boolean; onClose: () => void; initialNodeId?: string };

const PW_KEY = "adberlin-editor-pw";
const NAME_KEY = "adberlin-editor-name";

const CATEGORIES: { id: string; label: string; hint: string }[] = [
  { id: "source", label: "Neue Quelle", hint: "Ich habe eine Quelle fuer einen Knoten, die bisher fehlt." },
  { id: "correction", label: "Korrektur", hint: "Ein Name, eine Rolle oder eine Beziehung stimmt nicht." },
  { id: "missing-info", label: "Fehlende Info", hint: "Ein Knoten oder Prozess ist unvollstaendig." },
  { id: "comment", label: "Kommentar / Hinweis", hint: "Beobachtung, Frage oder Anregung ohne konkreten Edit." },
];

type Step = "password" | "name" | "form" | "success" | "error";

export default function ProposalModal({ open, onClose, initialNodeId }: Props) {
  const [step, setStep] = useState<Step>("password");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("comment");
  const [content, setContent] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [nodeId, setNodeId] = useState(initialNodeId ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Bei Open: vorgespeicherten Name + Passwort aus localStorage lesen
  useEffect(() => {
    if (!open) return;
    const storedPw = typeof window !== "undefined" ? localStorage.getItem(PW_KEY) : null;
    const storedName = typeof window !== "undefined" ? localStorage.getItem(NAME_KEY) : null;
    if (storedPw && storedName) {
      setPassword(storedPw);
      setName(storedName);
      setStep("form");
    } else if (storedName) {
      setName(storedName);
      setStep("password");
    } else {
      setStep("password");
    }
  }, [open]);

  // Escape-Key schliesst das Modal
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.trim().length === 0) return;
    // Kein Server-Check hier — nur Vorspeichern + Fortschritt
    setStep("name");
  }

  function handleNameSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length === 0) return;
    localStorage.setItem(NAME_KEY, name.trim());
    setStep("form");
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (content.trim().length === 0) return;
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/propose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          name: name.trim(),
          category,
          content: content.trim(),
          source_url: sourceUrl.trim() || undefined,
          node_id: nodeId.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        // Passwort erst NACH erfolgreichem Submit cachen — sonst wuerden
        // wir einen falschen Key einfrieren
        localStorage.setItem(PW_KEY, password);
        setStep("success");
        setContent("");
        setSourceUrl("");
      } else {
        setErrorMessage(data?.error ?? "Unbekannter Fehler.");
        if (res.status === 401) {
          // Passwort falsch — cache loeschen, zurueck zum Gate
          localStorage.removeItem(PW_KEY);
          setPassword("");
          setStep("password");
        } else {
          setStep("error");
        }
      }
    } catch {
      setErrorMessage("Netzwerkfehler. Bitte nochmal probieren.");
      setStep("error");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    // State wird beim naechsten Open frisch geladen — ausser success,
    // da soll der User erst die Bestaetigung sehen
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-ink-soft rounded-xl shadow-card max-w-lg w-full p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          aria-label="Schliessen"
          className="absolute top-3 right-3 text-ink-soft hover:text-ink dark:hover:text-paper"
        >
          ✕
        </button>

        {step === "password" && (
          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <h2 className="text-lg font-semibold text-ink dark:text-paper">Vorschlag hinzufuegen</h2>
            <p className="text-sm text-ink-soft dark:text-paper/70">
              Zutritt mit dem geteilten Passwort. Frag Paul, wenn du keins hast.
            </p>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Passwort"
              className="w-full border border-ink-soft/20 rounded-lg px-3 py-2 bg-paper dark:bg-ink focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              type="submit"
              className="w-full bg-accent text-white rounded-lg py-2 font-medium hover:bg-accent/90"
            >
              Weiter
            </button>
          </form>
        )}

        {step === "name" && (
          <form onSubmit={handleNameSubmit} className="space-y-3">
            <h2 className="text-lg font-semibold text-ink dark:text-paper">Wie heisst du?</h2>
            <p className="text-sm text-ink-soft dark:text-paper/70">
              Frei waehlbar. Bleibt in deinem Browser gespeichert — kein Account, kein Tracking.
              Wird als Attribution an Paul weitergegeben.
            </p>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Paul F."
              maxLength={60}
              className="w-full border border-ink-soft/20 rounded-lg px-3 py-2 bg-paper dark:bg-ink focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              type="submit"
              className="w-full bg-accent text-white rounded-lg py-2 font-medium hover:bg-accent/90"
            >
              Weiter
            </button>
          </form>
        )}

        {step === "form" && (
          <form onSubmit={handleFormSubmit} className="space-y-3">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-semibold text-ink dark:text-paper">Dein Vorschlag</h2>
              <span className="text-xs text-ink-soft">als <span className="font-mono">{name}</span></span>
            </div>

            <div>
              <label className="text-xs text-ink-soft dark:text-paper/70 block mb-1">Kategorie</label>
              <div className="grid grid-cols-2 gap-1 text-xs">
                {CATEGORIES.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setCategory(c.id)}
                    className={`px-2 py-1.5 rounded border transition text-left ${
                      category === c.id
                        ? "bg-accent text-white border-accent"
                        : "border-ink-soft/20 text-ink-soft hover:bg-ink-soft/5"
                    }`}
                    title={c.hint}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-ink-soft dark:text-paper/70 block mb-1">
                Beschreibung <span className="text-[10px]">({content.length}/2000)</span>
              </label>
              <textarea
                autoFocus
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={CATEGORIES.find((c) => c.id === category)?.hint}
                maxLength={2000}
                rows={4}
                className="w-full border border-ink-soft/20 rounded-lg px-3 py-2 bg-paper dark:bg-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="text-xs text-ink-soft dark:text-paper/70 block mb-1">
                Knoten-ID (optional) — wenn es um einen spezifischen Knoten geht
              </label>
              <input
                type="text"
                value={nodeId}
                onChange={(e) => setNodeId(e.target.value)}
                placeholder="z.B. VS, BB_COORD, NLW"
                className="w-full border border-ink-soft/20 rounded-lg px-3 py-2 bg-paper dark:bg-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="text-xs text-ink-soft dark:text-paper/70 block mb-1">
                Quelle/URL (optional) — wenn du einen Link als Beleg hast
              </label>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://..."
                className="w-full border border-ink-soft/20 rounded-lg px-3 py-2 bg-paper dark:bg-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || content.trim().length === 0}
              className="w-full bg-accent text-white rounded-lg py-2 font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Wird gesendet…" : "Absenden"}
            </button>
          </form>
        )}

        {step === "success" && (
          <div className="space-y-3 text-center py-4">
            <div className="text-2xl">✓</div>
            <h2 className="text-lg font-semibold text-ink dark:text-paper">Danke!</h2>
            <p className="text-sm text-ink-soft dark:text-paper/70">
              Paul schaut rein. Beim naechsten Besuch siehst du dein Vorschlag als
              Quelle oder Korrektur am Knoten, wenn er angenommen wurde.
            </p>
            <button
              onClick={handleClose}
              className="text-sm text-accent underline"
            >
              Schliessen
            </button>
          </div>
        )}

        {step === "error" && (
          <div className="space-y-3 text-center py-4">
            <div className="text-2xl text-danger">✕</div>
            <h2 className="text-lg font-semibold text-ink dark:text-paper">Fehler</h2>
            <p className="text-sm text-ink-soft dark:text-paper/70">
              {errorMessage ?? "Unbekannter Fehler."}
            </p>
            <button
              onClick={() => setStep("form")}
              className="text-sm text-accent underline"
            >
              Nochmal probieren
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
