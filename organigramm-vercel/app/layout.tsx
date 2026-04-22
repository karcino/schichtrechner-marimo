import type { Metadata } from "next";
import "./globals.css";
import "reactflow/dist/style.css";

export const metadata: Metadata = {
  title: "Organigramm ambulante dienste e.V.",
  description:
    "Interaktives, belegtes Organigramm von ambulante dienste e.V. und seinem Betriebsrat — schwenkbar, zoombar, dark-mode-fähig.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <script
          // Dark-Mode-Init ohne Flash: vor erstem Paint setzen.
          dangerouslySetInnerHTML={{
            __html: `
              (() => {
                try {
                  const t = localStorage.getItem('theme');
                  const s = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (t === 'dark' || (!t && s)) document.documentElement.classList.add('dark');
                } catch (_) {}
              })();
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
