// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',         // Scan pages (index.js, _app.js, api/)
    './components/**/*.{js,jsx}',    // Scan components (CategoryList.js, TransactionList.js)
    './stores/**/*.{js,jsx}',        // Scan stores (appStore.js)
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0070f3',
        secondary: '#1a1a1a',
      },
    },
  },
  plugins: [],
};