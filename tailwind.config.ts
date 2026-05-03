import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080808",
        surface: "#111111",
        "surface-elevated": "#1a1a1a",
        "surface-hover": "#222222",
        border: "#2a2a2a",
        "border-gold": "rgba(201, 168, 76, 0.25)",
        gold: {
          DEFAULT: "#C9A84C",
          light: "#E8C96A",
          lighter: "#F5DFA0",
          dark: "#8B6914",
          muted: "rgba(201, 168, 76, 0.15)",
        },
        text: {
          primary: "#F5F0E0",
          secondary: "#A89880",
          muted: "#6B5D4F",
        },
        success: "#4CAF7D",
        danger: "#E05252",
        warning: "#E0A852",
      },
      fontFamily: {
        display: ["Inter", "system-ui", "sans-serif"],
        body: ["system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "pulse-gold": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(201, 168, 76, 0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(201, 168, 76, 0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "pulse-gold": "pulse-gold 1.5s ease-in-out",
        shimmer: "shimmer 2s linear infinite",
      },
      boxShadow: {
        gold: "0 0 20px rgba(201, 168, 76, 0.2)",
        "gold-sm": "0 0 10px rgba(201, 168, 76, 0.15)",
        "inner-gold": "inset 0 1px 0 rgba(201, 168, 76, 0.1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
