/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'display': ['3.75rem', { lineHeight: '1.08', letterSpacing: '-0.025em', fontWeight: '700' }],
        'heading': ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.025em', fontWeight: '700' }],
        'subheading': ['1.375rem', { lineHeight: '1.35', letterSpacing: '-0.015em', fontWeight: '600' }],
      },
      colors: {
        accent: {
          DEFAULT: '#635bff',
          light: '#f0eeff',
          dark: '#4f46e5',
        },
        stripe: {
          navy: '#0a2540',
          dark: '#425466',
          muted: '#6b7c93',
        },
      },
      boxShadow: {
        'card': '0 2px 5px -1px rgba(50,50,93,.25), 0 1px 3px -1px rgba(0,0,0,.3)',
        'card-hover': '0 6px 12px -2px rgba(50,50,93,.25), 0 3px 7px -3px rgba(0,0,0,.3)',
        'elevated': '0 13px 27px -5px rgba(50,50,93,.25), 0 8px 16px -8px rgba(0,0,0,.3)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
    },
  },
  plugins: [],
}
