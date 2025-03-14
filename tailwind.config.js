const {heroui} = require('@heroui/theme');
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "// Or if using `src` directory:\n    \"./src/**/*.{js,ts,jsx,tsx,mdx}\"",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    colors:{
primary:{
  '40':"#ffffff",
  '50': '#666666'
}
    },
    extend: {},
  },
  darkMode: "class",
  plugins: [heroui()],
}