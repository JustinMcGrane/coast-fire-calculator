import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "bg-deep": "#0a1c2b",
        "bg-panel": "#122a3d",
        "bg-panel-2": "#173247",
        gold: "#e8a33d",
        "gold-soft": "#f0c078",
        teal: "#5b9aa8",
        text: "#f2efe7",
        "text-muted": "#8fa3b0",
        green: "#6fae8c",
        line: "rgba(242,239,231,0.10)",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      borderRadius: {
        DEFAULT: "14px",
      },
    },
  },
  plugins: [],
};

export default config;
