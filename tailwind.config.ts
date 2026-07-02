import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf8f7',
          100: '#faeeec',
          200: '#f5d9d5',
          300: '#edb8b1',
          400: '#e08e84',
          500: '#d06a5e',
          600: '#be4e41',
          700: '#a83e33',
          800: '#8c342b',
          900: '#722e27',
          950: '#3f1714',
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '0.875rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
};

export default config;
