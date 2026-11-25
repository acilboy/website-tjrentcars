import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        // Derived from official TJ Rentcar logo ink (Obsidian Black & Warm Charcoal)
        brand: {
          50: "#f7f6f3",
          100: "#eceae3",
          200: "#ddd9ce",
          300: "#c5bfb0",
          400: "#9b968a",
          500: "#726e65",
          600: "#52504a",
          700: "#373634",
          800: "#222326",
          900: "#141518",
          950: "#0b0c0e",
        },
        // Derived from official TJ Rentcar logo metallic gold (#BA9135)
        gold: {
          50: "#fbf8ee",
          100: "#f5eed6",
          200: "#ead8a6",
          300: "#ddc173",
          400: "#cfa848",
          500: "#ba9135",
          600: "#997222",
          700: "#7d5b19",
          800: "#654816",
          900: "#4f3813",
        },
      },
    },
  },
  plugins: [],
};
export default config;
