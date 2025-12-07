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
          violet: '#7358FF',
          rose: '#FF7B9C',
          blue: '#4F5BFF',
          midnight: '#0A0A1A',
          orchid: '#E066FF',
          lavender: '#C77DFF',
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
