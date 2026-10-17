import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Planora Light Design System — DESIGN.md §3
        canvas: "#F4F5F7",
        "card-white": "#FFFFFF",
        sidebar: "#F8F9FA",
        "border-subtle": "#EDEFF2",
        charcoal: "#1A1D1F",
        "body-text": "#2D3135",
        "muted-text": "#717579",
        // Primary Orange Brand
        primary: {
          DEFAULT: "#FF5C00",
          hover: "#E55200",
          tint: "#FFF0E6",
          "tint-border": "#FFD8BF",
        },
        // Semantic Feedback Palette
        success: {
          DEFAULT: "#00A35C",
          alt: "#10B981",
          tint: "#E8F8F0",
        },
        attention: {
          DEFAULT: "#FF1744",
          alt: "#EF4444",
          tint: "#FEECEE",
        },
        info: {
          DEFAULT: "#0084FF",
          alt: "#2563EB",
          tint: "#EBF5FF",
        },
        neutral: {
          DEFAULT: "#717579",
          tint: "#F4F5F7",
        },
      },
      fontFamily: {
        sans: [
          "'Noto Sans'",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
        mono: [
          "'JetBrains Mono'",
          "'Fira Code'",
          "monospace",
        ],
      },
      borderRadius: {
        "card": "16px",
        "card-lg": "24px",
        "pill": "9999px",
      },
      boxShadow: {
        "card": "0 2px 12px -2px rgba(0, 0, 0, 0.04)",
        "card-elevated": "0 12px 32px -4px rgba(0, 0, 0, 0.08)",
        "sidebar": "0 2px 16px rgba(0, 0, 0, 0.03)",
        "cta": "0 4px 14px rgba(255, 92, 0, 0.3)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 12s linear infinite",
        "wave-pulse": "wavePulse 1.2s ease-in-out infinite alternate",
        "fade-in": "fadeIn 0.3s ease-out",
      },
      keyframes: {
        wavePulse: {
          "0%": { height: "20%" },
          "100%": { height: "95%" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
