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
        "breathing-gradient": {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(calc(-100% - 1rem))" },
        },
        "marquee-reverse": {
          from: { transform: "translateX(calc(-100% - 1rem))" },
          to: { transform: "translateX(0)" },
        },
      },
      animation: {
        "breathing-gradient": "breathing-gradient 10s ease infinite",
        marquee: "marquee 50s linear infinite",
        "marquee-reverse": "marquee-reverse 50s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
