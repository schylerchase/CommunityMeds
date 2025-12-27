/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm & Friendly palette
        primary: {
          50: '#fef7f0',
          100: '#fdecd8',
          200: '#fad6b0',
          300: '#f6b87e',
          400: '#f1924a',
          500: '#ed7426',
          600: '#de5a1c',
          700: '#b84419',
          800: '#93371c',
          900: '#782f1a',
        },
        // Warm teal for secondary actions
        secondary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        // Warm neutrals
        warm: {
          50: '#fdfbf7',
          100: '#faf6f0',
          200: '#f5ede0',
          300: '#ebe0cc',
          400: '#d9c9aa',
          500: '#c4ae8a',
          600: '#a8906a',
          700: '#8a7455',
          800: '#6e5c45',
          900: '#4a3f30',
        },
        // High contrast colors for accessibility
        accessible: {
          text: '#1a1a1a',
          bg: '#ffffff',
          border: '#2d2d2d',
          link: '#0056b3',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'base-lg': '1.125rem',
        'lg-lg': '1.375rem',
        'xl-lg': '1.625rem',
        '2xl-lg': '2rem',
      },
      spacing: {
        'touch': '48px',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'warm': '0 4px 14px 0 rgba(237, 116, 38, 0.15)',
        'warm-lg': '0 10px 40px -10px rgba(237, 116, 38, 0.2)',
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
