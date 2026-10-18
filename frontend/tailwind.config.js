/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        midnight: {
          DEFAULT: '#080B12',
          surface: '#11151F',
          surfaceElevated: '#171D2B',
          border: '#252B38',
          borderSubtle: '#1C2230',
        },
        gold: {
          DEFAULT: '#F59E0B',
          bright: '#FBBF24',
          soft: '#D4A72C',
          muted: '#926C15',
          glow: 'rgba(245, 158, 11, 0.15)',
        },
      },
    },
  },
  plugins: [],
};

