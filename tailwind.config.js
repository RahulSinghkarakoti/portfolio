/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
       
      colors: {
        primary: {
          light: '#ffffff', // White for light mode
          dark: '#000000',  // Black for dark mode
              },
      },
      fontFamily: {
      newPopins:["Roboto", "sans-serif"]
      },
    },
  },
  plugins: [],
}