import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        neo: {
          bg: "#F4F5F0",
          card: "#FAFBF8",
          primary: "#222831",
          secondary: "#64748B",
          border: "#E5E7EB",
          darkBg: "#12151B",
          darkCard: "#1B2028",
          darkPrimary: "#F1F5F9",
          darkSecondary: "#94A3B8",
          darkBorder: "#2D3748",
        },
        accent: {
          cyan: "#06B6D4",
          magenta: "#D946EF",
          blue: "#3B82F6",
          purple: "#8B5CF6",
          orange: "#F97316",
        },
      },
      boxShadow: {
        "neo-flat": "5px 5px 12px rgba(163, 177, 198, 0.35), -5px -5px 12px rgba(255, 255, 255, 0.9)",
        "neo-raised": "6px 6px 14px rgba(163, 177, 198, 0.4), -6px -6px 14px rgba(255, 255, 255, 0.95)",
        "neo-raised-sm": "3px 3px 8px rgba(163, 177, 198, 0.3), -3px -3px 8px rgba(255, 255, 255, 0.9)",
        "neo-raised-lg": "10px 10px 24px rgba(163, 177, 198, 0.45), -10px -10px 24px rgba(255, 255, 255, 0.95)",
        "neo-inset": "inset 2px 2px 5px rgba(163, 177, 198, 0.35), inset -2px -2px 5px rgba(255, 255, 255, 0.9)",
        "neo-inset-deep": "inset 3px 3px 6px rgba(163, 177, 198, 0.45), inset -3px -3px 6px rgba(255, 255, 255, 0.95)",
        "neo-dark-flat": "5px 5px 12px rgba(0, 0, 0, 0.5), -4px -4px 10px rgba(255, 255, 255, 0.04)",
        "neo-dark-raised": "6px 6px 16px rgba(0, 0, 0, 0.6), -5px -5px 12px rgba(255, 255, 255, 0.05)",
        "neo-dark-raised-sm": "3px 3px 8px rgba(0, 0, 0, 0.5), -3px -3px 6px rgba(255, 255, 255, 0.04)",
        "neo-dark-inset": "inset 3px 3px 7px rgba(0, 0, 0, 0.6), inset -2px -2px 5px rgba(255, 255, 255, 0.05)",
      },
      borderRadius: {
        neo: "1.25rem",
        "neo-sm": "0.75rem",
        "neo-lg": "1.75rem",
      },
    },
  },
  plugins: [],
};
export default config;

