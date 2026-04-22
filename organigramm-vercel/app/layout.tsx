import type { Metadata } from "next";
import "./globals.css";
import "reactflow/dist/style.css";

export const metadata: Metadata = {
  title: "Organigramm ambulante dienste e.V.",
  description:
    "Interaktives, belegtes Organigramm von ambulante dienste e.V. und seinem Betriebsrat — schwenkbar, zoombar, hell-per-Default.",
};

// Dark-Mode-Init ohne Flash: als static string, pre-paint ausgefuehrt.
// Default = light. Dark nur wenn User explizit per Toggle gewaehlt hat.
// System-Preference wird NICHT respektiert — Paul-Konvention
// (~/Desktop/CLAUDE.md: "Light mode by default for any new HTML artifact").
const THEME_INIT_SCRIPT = `
(() => {
  try {
    if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.classList.add('dark');
    }
  } catch (_) {}
})();
`.trim();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line react/no-danger -- static string, no user data */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
