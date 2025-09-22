// tailwind.config.mjs
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
        // We are NOT using the font variables from globals.css here.
        // Instead, we are creating utility classes like `font-cal`.
        sans: ["var(--font-inter)"],
        cal: ["var(--font-cal)"],
      },
      // You can still add keyframes and other extensions here
      keyframes: {
        // ...
      },
      animation: {
        // ...
      },
    },
  },
  plugins: [],
};

export default config;
