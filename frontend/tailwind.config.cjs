const path = require("path");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    path.join(__dirname, "src/**/*.{js,jsx}"),
    path.join(__dirname, "app/**/*.{js,jsx}"),
    path.join(__dirname, "components/**/*.{js,jsx}"),
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f9ff",
          500: "#3b82f6",
          600: "#2563eb",
          900: "#1e3a8a",
        },
      },
    },
  },
  plugins: [],
};
