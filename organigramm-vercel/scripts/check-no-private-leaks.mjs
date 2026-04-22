#!/usr/bin/env node
// Post-Build-Gate: scannt .next/ auf verbotene Strings aus privaten Enrichments.
// Läuft in CI (GitHub Actions) als zusätzliche Verteidigungslinie, falls ein
// falscher BUILD_MODE-Wert oder ein commit-gesteuertes Leak durchrutschen würde.
//
// Exit-Codes:
//   0 — sauber, kein Leak
//   1 — Leak gefunden (CI bricht ab)
import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const buildDir = resolve(__dirname, "..", ".next");

const FORBIDDEN_STRINGS = [
  "Mailaustausch mit Arbeitgeber",
  "email-reference-private",
];

const ALLOWED_EXTENSIONS = new Set([".js", ".mjs", ".cjs", ".html", ".json", ".css", ".map"]);

function walk(dir, visitor) {
  for (const entry of readdirSync(dir)) {
    const full = resolve(dir, entry);
    const stats = statSync(full);
    if (stats.isDirectory()) walk(full, visitor);
    else if (stats.isFile()) visitor(full);
  }
}

const hits = [];
try {
  walk(buildDir, (file) => {
    if (!ALLOWED_EXTENSIONS.has(extname(file))) return;
    const content = readFileSync(file, "utf8");
    for (const needle of FORBIDDEN_STRINGS) {
      if (content.includes(needle)) {
        hits.push({ file: file.replace(buildDir, ".next"), needle });
      }
    }
  });
} catch (err) {
  if (err.code === "ENOENT") {
    console.error(`[check-leaks] .next/ nicht gefunden — bitte erst 'npm run build' ausführen.`);
    process.exit(1);
  }
  throw err;
}

if (hits.length > 0) {
  console.error("[check-leaks] PRIVACY-LEAK: private Enrichment-Marker in Build-Output gefunden.");
  for (const { file, needle } of hits) {
    console.error(`  - ${file}: "${needle}"`);
  }
  process.exit(1);
}

console.log("[check-leaks] OK — keine privaten Marker im Build-Output.");
