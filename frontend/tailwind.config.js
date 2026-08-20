/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#F5F5F7",
        surface: "#FFFFFF",
        primary: "#007AFF",
        primaryHover: "#005bb5",
        textMain: "#1D1D1F",
        textMuted: "#86868B",
        borderLight: "#D2D2D7",
        success: "#34C759",
        warning: "#FF9500",
        danger: "#FF3B30"
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'San Francisco', 'Inter', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'apple': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'apple-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
        'apple-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
      }
    },
  },
  plugins: [],
}
