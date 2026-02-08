import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: "var(--surface)",
        border: "var(--border)",
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
          light: "var(--accent-light)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        success: {
          DEFAULT: "var(--success)",
          light: "var(--success-light)",
        },
        error: {
          DEFAULT: "var(--error)",
          light: "var(--error-light)",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderColor: {
        DEFAULT: "var(--border)",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.08)",
        "card-hover":
          "0 4px 12px rgba(0,0,0,0.1), 0 2px 6px rgba(0,0,0,0.06)",
      },
      ringOffsetColor: {
        DEFAULT: "var(--background)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
