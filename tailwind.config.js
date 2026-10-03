/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#080a09',
          900: '#0e1110',
          850: '#141816',
          800: '#1b201d',
          700: '#282f2c',
          600: '#3f4945'
        },
        signal: {
          orange: '#c8a873',
          amber: '#c8a873',
          emerald: '#10b981',
          cyan: '#06b6d4',
          olive: '#6b8e23'
        },
        paper: '#f5f3ef',
        muted: '#8e948f',
      },
      fontFamily: {
        display:    ['Space Grotesk', 'sans-serif'],
        serif:      ['Newsreader', 'Georgia', 'serif'],
        sans:       ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        'mono-code':['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(28px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.45s cubic-bezier(0.22,1,0.36,1) both',
        'slide-up': 'slide-up 0.5s cubic-bezier(0.22,1,0.36,1) both',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
