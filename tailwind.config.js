/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'rgb(214, 151, 49)',
          dark: 'rgb(180, 120, 30)',
        },
        sky: {
          DEFAULT: '#0d3b66',
          light: '#1a5f8a',
        },
        stone: '#2d2d2d',
      },
      fontFamily: {
        display: ['Outfit', 'system-ui', 'sans-serif'],
        body: ['Outfit', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        'pill': '9999px',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0,0,0,0.08)',
        'card': '0 10px 35px rgba(0,0,0,0.08)',
        'card-hover': '0 20px 45px rgba(214, 151, 49, 0.15)',
      },
    },
  },
  plugins: [],
}
