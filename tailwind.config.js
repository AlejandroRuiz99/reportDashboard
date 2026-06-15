/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0B1320',
          dark: '#070C16',
          black: '#0B1320',
          gold: '#C9A961',
          'gold-dark': '#A8893F',
          'gold-light': '#E2C988',
          cream: '#FAF7F0',
          ink: '#1A2233',
          muted: '#6B7280',
        },
        primary: '#0B1320',
        accent: '#C9A961',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        neutral: '#6B7280',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #0B1320 0%, #1A2233 100%)',
        'gold-gradient': 'linear-gradient(135deg, #C9A961 0%, #E2C988 100%)',
      },
      boxShadow: {
        'brand': '0 4px 14px rgba(11, 19, 32, 0.08)',
        'brand-lg': '0 10px 30px rgba(11, 19, 32, 0.12)',
        'gold': '0 4px 14px rgba(201, 169, 97, 0.25)',
      },
    },
  },
  plugins: [],
}
