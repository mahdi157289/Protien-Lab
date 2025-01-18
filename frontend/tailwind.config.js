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
        primary: '#EE4540',
        secondary: '#29292A',
        accent: '#FFFCF9',
        dark: '#1C1C1C',
      },
    },
  },
  plugins: [
    tailwindScrollbar,
  ],
  variants: {
    scrollbar: ['rounded'],
  },
};