import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#020617',
        foreground: '#e2e8f0',
        'background-secondary': '#0f172a',
        'foreground-secondary': '#94a3b8',
        border: '#1e293b',

        primary: '#6366f1',
        'primary-foreground': '#ffffff',
        secondary: '#4f46e5',
        'secondary-foreground': '#ffffff',

        success: '#22c55e',
        'success-foreground': '#ffffff',
        error: '#ef4444',
        'error-foreground': '#ffffff',

        card: '#0f172a',
        'card-foreground': '#e2e8f0',
        muted: '#334155',
        'muted-foreground': '#94a3b8',
        accent: '#a855f7',
        'accent-foreground': '#ffffff',

        transparent: 'transparent',
        current: 'currentColor',
        black: '#000',
        white: '#fff',
        slate: {
          50: '#f8fafc', 
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        green: { 500: '#22c55e' },
        red: { 500: '#ef4444' },
        pink: { 500: '#ec4899' },
        yellow: { 500: '#eab308' },
        blue: { 500: '#3b82f6' },
      },
      borderRadius: {
        'none': '0px',
        'sm': '8px',
        DEFAULT: '12px',
        'md': '16px',
        'lg': '20px',
        'xl': '24px',
        '2xl': '28px',
        '3xl': '32px',
        'full': '9999px',
        'button': '12px',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        pacifico: ['var(--font-pacifico)', 'cursive'],
      },
    },
  },
  plugins: [],
}
export default config 