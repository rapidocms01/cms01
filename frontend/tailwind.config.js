/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        navy: {
          DEFAULT: '#001B61',
          50: '#e6ebf5',
          100: '#cce3f0',
          800: '#00164e',
          900: '#001B61',
        },
        amberAccent: {
          DEFAULT: '#FFA800',
          400: '#ffb726',
          500: '#FFA800',
          600: '#e69700',
        },
        charcoal: {
          DEFAULT: '#101720',
          700: '#232d3b',
          800: '#19212c',
          900: '#101720',
        },
        softWhite: {
          DEFAULT: '#F5F5F5',
          100: '#F5F5F5',
          200: '#EBEBEB',
        },
        primary: {
          DEFAULT: '#001B61',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#101720',
          foreground: '#ffffff',
        },
        destructive: {
          DEFAULT: '#dc2626',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#f1f5f9',
          foreground: '#64748b',
        },
        accent: {
          DEFAULT: '#F5F5F5',
          foreground: '#101720',
        },
      },
    },
  },
  plugins: [],
}
