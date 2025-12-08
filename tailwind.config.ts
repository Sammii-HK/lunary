import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        lunary: {
          // Backgrounds
          bg: '#0A0A1A',
          'bg-deep': '#050510',
          // Primary/Secondary
          primary: '#8458D8',
          secondary: '#7B7BE8',
          // Accents
          'accent-soft': '#C77DFF',
          'accent-highlight': '#D070E8',
          // Text
          text: '#FFFFFF',
          // Semantic
          'warning-soft': '#EE789E',
          error: '#D06060',
          success: '#6B9B7A',
        },
      },
      fontFamily: {
        astro: ['var(--font-astro)'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
export default config;
