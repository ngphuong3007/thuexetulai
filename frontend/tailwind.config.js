/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Màu chủ đạo của D2-Car
        primary: {
          DEFAULT: '#E8390E',
          dark:    '#C02E0B',
          light:   '#FF5A2E',
        },
        dark: {
          1: '#111318', // background toàn trang
          2: '#1C1F27', // sidebar, navbar
          3: '#252931', // input, card phụ
          4: '#1E2129', // card chính
        },
      },
      fontFamily: {
        sans:    ['DM Sans', 'sans-serif'],
        display: ['Bebas Neue', 'cursive'],
      },
    },
  },
  plugins: [],
}
