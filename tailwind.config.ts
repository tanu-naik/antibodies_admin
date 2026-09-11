import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#17204B",
          green: "#72A85A",
          gold: "#B8904A",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(23 32 75 / 0.08), 0 1px 2px -1px rgb(23 32 75 / 0.08)",
        header: "0 1px 2px 0 rgb(23 32 75 / 0.06)",
      },
      borderColor: {
        DEFAULT: "#E5E7EB",
      },
    },
  },
  plugins: [],
};

export default config;
