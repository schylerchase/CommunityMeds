/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // High contrast colors for accessibility
        accessible: {
          text: '#1a1a1a',
          bg: '#ffffff',
          border: '#2d2d2d',
          link: '#0056b3',
        }
      },
      fontSize: {
        // Larger font sizes for accessibility
        'base-lg': '1.125rem',
        'lg-lg': '1.375rem',
        'xl-lg': '1.625rem',
        '2xl-lg': '2rem',
      },
      spacing: {
        // Minimum 48px touch targets
        'touch': '48px',
      }
    },
  },
  plugins: [],
}
