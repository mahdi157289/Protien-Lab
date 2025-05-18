import tailwindScrollbar from 'tailwind-scrollbar';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#40ee45',
        secondary: '#29292A',
        accent: '#FFFCF9',
        dark: '#1C1C1C',
      },
    },
  },
  plugins: [
    tailwindScrollbar,
  ],
};