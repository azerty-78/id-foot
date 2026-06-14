import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0D1B2A",
          800: "#162438",
          700: "#1E3148",
          600: "#243A55",
          500: "#2E4A6A",
        },
        green: {
          DEFAULT: "#39E75F",
          dark: "#2BC44E",
          dim: "#1A7A32",
          bg: "#E8FBED",
        },
        gray: {
          50: "#F7F8FA",
          100: "#EEF0F4",
          200: "#D8DCE5",
          400: "#9099AA",
          600: "#5A6478",
        },
        danger: "#E03B3B",
        warning: "#F5A623",
        white: "#FFFFFF",
        /* Alias rétrocompatibilité */
        brand: {
          DEFAULT: "#39E75F",
          hover: "#2BC44E",
          dark: "#0D1B2A",
          light: "#E8FBED",
        },
        gold: "#39E75F",
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "20px",
      },
      boxShadow: {
        sm: "0 1px 3px rgba(13,27,42,0.08), 0 1px 2px rgba(13,27,42,0.06)",
        md: "0 4px 12px rgba(13,27,42,0.10), 0 2px 4px rgba(13,27,42,0.06)",
        lg: "0 8px 24px rgba(13,27,42,0.12)",
        green: "0 4px 16px rgba(57,231,95,0.25)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
};

export default config;
