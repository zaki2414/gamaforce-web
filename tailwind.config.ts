import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        title: ["var(--font-title)", "monospace"],
        sans: ["var(--font-body)", "sans-serif"],
      },
      colors: {
        gf: {
          navy: "#1C2B5A",   // Gamaforce blue
          gold: "#E6B52C",   // Aviation gold
          bg: "#F8FAFC",     // Light background
          grid: "#D6DBE5",   // Grid lines
          dark: "#0F172A",
          muted: "#64748B",
        },
      },
    },
  },
  plugins: [],
};

export default config;