/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Merriweather", "serif"],
        emoji: ["Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"],
        courier: ["Courier New", "Courier", "monospace"],
      }
    },
    colors: {
      primary: '#9e7777',
      secondary: '#b8a085',
      accent: '#8c5e58',
      background: '#f5f5f5',
      text: '#404040',
      alt: '#EAE0D5'
    },
    screens: {
      'tinyMobile': '280px',
      // => @media (min-width: 280px) { ... }
      'mobile': '480px',
      // => @media (min-width: 480px) { ... }
      'tablet': '640px',
      // => @media (min-width: 640px) { ... }

      'laptop': '1024px',
      // => @media (min-width: 1024px) { ... }
      'desktop': '1280px',
      // => @media (min-width: 1280px) { ... }
      'larger-desktop': '1440px',
    },
  },
  plugins: [],
}

