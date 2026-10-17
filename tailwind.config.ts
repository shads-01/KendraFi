import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#070B14",
        surface: "#0D1424",
        "surface-raised": "#131C31",
        "surface-card": "#18243E",
        border: "rgba(255, 255, 255, 0.08)",
        "border-glow": "rgba(99, 102, 241, 0.25)",
        primary: {
          DEFAULT: "#4F46E5",
          hover: "#4338CA",
          light: "#818CF8",
        },
        accent: {
          cyan: "#06B6D4",
          emerald: "#10B981",
          amber: "#F59E0B",
          rose: "#F43F5E",
          purple: "#A855F7",
        },
      },
      fontFamily: {
        mono: ["var(--font-mono)", "JetBrains Mono", "Fira Code", "monospace"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 12s linear infinite",
        "wave-pulse": "wavePulse 1.2s ease-in-out infinite alternate",
      },
      keyframes: {
        wavePulse: {
          "0%": { height: "20%" },
          "100%": { height: "95%" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
