/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        feeling: {
          "very-bad": "#ef4444",
          bad: "#f97316",
          normal: "#eab308",
          good: "#22c55e",
          "very-good": "#16a34a",
          none: "#e5e7eb",
        },
      },
    },
  },
  plugins: [],
};
