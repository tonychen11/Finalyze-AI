module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#f97316',      // Orange - warmth & energy
        'primary-dark': '#ea580c', // Darker orange for hover
        accent: '#3b82f6',       // Blue - stability & trust
        'accent-dark': '#1d4ed8', // Darker blue for hover
        success: '#10b981',      // Green - growth & gains
        warning: '#f59e0b',      // Amber - caution
      },
    },
  },
  plugins: [],
}
