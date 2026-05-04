/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#060b16",
        panel: "#0b1424",
        "panel-soft": "#101c31",
        stroke: "rgba(148, 163, 184, 0.14)",
        accent: "#f97316",
        "accent-soft": "#fb923c",
      },
      fontFamily: {
        sans: ["Manrope", "sans-serif"],
      },
      boxShadow: {
        glow: "0 24px 80px rgba(249, 115, 22, 0.14)",
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top, rgba(59, 130, 246, 0.2), transparent 30%), linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
      },
      backgroundSize: {
        "hero-grid": "auto, 36px 36px, 36px 36px",
      },
    },
  },
  plugins: [],
};
