"use client";

import { useState } from "react";
import ProposalModal from "./ProposalModal";

/**
 * Floating Button "Vorschlag hinzufuegen" rechts unten.
 * Oeffnet das ProposalModal.
 */
export default function ProposalButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 px-4 py-2.5 rounded-full bg-accent text-white shadow-lg hover:bg-accent/90 text-sm font-medium flex items-center gap-1.5"
        title="Vorschlag hinzufuegen"
      >
        <span className="text-base leading-none">+</span>
        <span>Vorschlag</span>
      </button>
      <ProposalModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
