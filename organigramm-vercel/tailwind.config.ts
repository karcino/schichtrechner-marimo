import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink:    { DEFAULT: "#0f0f10", soft: "#2a2a2d" },
        paper:  { DEFAULT: "#fafaf7", soft: "#f1efe8" },
        line:   { DEFAULT: "#e7e4dc", dark: "#2b2b30" },
        accent: { DEFAULT: "#2d6a4f", soft: "#d8eadd" },
        warn:   { DEFAULT: "#b45309", soft: "#fef3c7" },
        info:   { DEFAULT: "#1e40af", soft: "#dbeafe" },
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["JetBrains Mono", "SF Mono", "ui-monospace", "Menlo", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,.04), 0 4px 12px rgba(0,0,0,.04)",
      },
    },
  },
  plugins: [],
};
export default config;
