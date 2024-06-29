/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
          primary : '#F47721'
      }
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
}