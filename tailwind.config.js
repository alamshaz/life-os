/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        fog: "#EEF0EA",
        paper: "#F7F7F2",
        ink: "#1C2321",
        "ink-soft": "#4A534F",
        line: "#D9D6C8",
        ember: "#C08A3E",
        "ember-soft": "#E4C79A",
        teal: "#2F5D62",
        "teal-soft": "#DCE7E6",
        rose: "#B4544A"
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-plex)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"]
      },
      borderRadius: {
        sm: "3px",
        DEFAULT: "4px"
      }
    }
  },
  plugins: []
};
