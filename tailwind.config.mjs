/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        space: ["var(--font-space)"],
        mono: ["var(--font-mono)"],
      },
      colors: {
        space: "#020617",
        azure: "#3B82F6",
        technical: "#F97316",
      },
    },
  },
  plugins: [],
};

export default config;
