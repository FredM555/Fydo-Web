/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          'fydo-green': {
            50: '#f0f9f0',
            100: '#dcf0dc',
            200: '#b8e1b8',
            300: '#8cc98c',
            400: '#5aad5a',
            500: '#3c903c',
            600: '#2e702e',
            700: '#255a25',
            800: '#1e481e',
            900: '#193d19',
          },
          'fydo-yellow': {
            400: '#ffd166',
          }
        },
      },
    },
    plugins: [],
  }