/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
 theme: {
    extend: {
      colors: {
        'brand-black': '#1A1A1A',
        'brand-gold': '#D4AF37', 
        'brand-gray': '#A1A1A1',
        'brand-white': '#F7F7F7',
        'brand-red': '#EF4444',
        'brand-green': '#10B981',
      },
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
        'opensans': ['Open Sans', 'sans-serif'],
        'kaushan': ['"Kaushan Script"', 'cursive'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}