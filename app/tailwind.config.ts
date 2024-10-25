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
        background: "var(--background)",
        foreground: "var(--foreground)",
        gray: {
          100: "#E6EAE8",
          200: "#CED4D2",
          300: "#A4B6B0",
          400: "#879791",
          500: "#B87D76",
          600: "#35403C",
          700: "#232A27",
          800: "#1D201F",
          900: "#010302",
        },
        orange: {
          100: "#FED4AE",
          200: "#F0BC8F",
          300: "#F2A663",
          400: "#FF9838",
          500: "#FF8214",
          600: "#E86D00",
          700: "#A3540F",
          800: "#5D2E04",
          900: "#2E1500",
        },
        yellow: {
          100: "#FFF0AD",
          200: "#FEEE9F",
          300: "#FBE98D",
          400: "#FEE56D",
          500: "#FFE033",
          600: "#DCC241",
          700: "#978220",
          800: "#735E12",
          900: "#4F3E08",
        },
        green: {
          100: "#EBF8D0",
          200: "#D3FEB8",
          300: "#A9F788",
          400: "#7EEE59",
          500: "#46D71D",
          600: "#44A829",
          700: "#1A6605",
          800: "#0F4002",
          900: "#0A2E00",
        },
        purple: {
          100: "#F2EDFD",
          200: "#DECEFD",
          300: "#BBA0EE",
          400: "#946FDB",
          500: "#6D3DC7",
          600: "#4C2791",
          700: "#371772",
          800: "#220C4B",
          900: "#192325",
        },
      },
      fontFamily: {
        sans: ["Agave", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
