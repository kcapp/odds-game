/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  purge: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        container: "#1e1e26",
        lbl_win: "#64a63c",
        lbl_lose: "#3c3f41",
      },
    },
  },
  plugins: [],
};
