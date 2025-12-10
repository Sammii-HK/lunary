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
          bg: '#0A0A0A',
          'bg-deep': '#050505',

          // Primary - Nebula Violet (#8458D8)
          primary: {
            50: '#f6f3fc',
            100: '#e7def7',
            200: '#cebdf0',
            300: '#b094e6',
            400: '#855ad8',
            500: '#6730cf',
            600: '#5227a5',
            700: '#3e1d7c',
            800: '#291353',
            900: '#190c32',
            950: '#0c0619',
            DEFAULT: '#8458D8',
          },

          // Secondary - Comet Trail (#7B7BE8)
          secondary: {
            50: '#f2f2fd',
            100: '#dcdcf9',
            200: '#babaf3',
            300: '#8e8eeb',
            400: '#5151e1',
            500: '#2626d9',
            600: '#1e1eae',
            700: '#171782',
            800: '#0f0f57',
            900: '#090934',
            950: '#05051a',
            DEFAULT: '#7B7BE8',
          },

          // Accent - Galaxy Haze (#C77DFF)
          accent: {
            50: '#f8f0ff',
            100: '#edd6ff',
            200: '#dcadff',
            300: '#c67aff',
            400: '#a733ff',
            500: '#9100ff',
            600: '#7400cc',
            700: '#570099',
            800: '#3a0066',
            900: '#23003d',
            950: '#11001f',
            DEFAULT: '#C77DFF',
          },

          // Highlight - Supernova (#D070E8)
          highlight: {
            50: '#fbf2fd',
            100: '#f3dcf9',
            200: '#e8b9f4',
            300: '#d98ded',
            400: '#c54fe3',
            500: '#b723dc',
            600: '#921cb0',
            700: '#6e1584',
            800: '#490e58',
            900: '#2c0835',
            950: '#16041a',
            DEFAULT: '#D070E8',
          },

          // Rose - Cosmic Rose (#EE789E)
          rose: {
            50: '#fdf1f5',
            100: '#fadbe5',
            200: '#f6b7cb',
            300: '#f089aa',
            400: '#e84a7d',
            500: '#e21d5c',
            600: '#b5174a',
            700: '#881137',
            800: '#5b0b25',
            900: '#360716',
            950: '#1b030b',
            DEFAULT: '#EE789E',
          },

          // Error - Solar Flare (#D06060)
          error: {
            50: '#fcf3f3',
            100: '#f6e0e0',
            200: '#ecc0c0',
            300: '#e19999',
            400: '#d06262',
            500: '#c53a3a',
            600: '#9d2f2f',
            700: '#762323',
            800: '#4f1717',
            900: '#2f0e0e',
            950: '#180707',
            DEFAULT: '#D06060',
          },

          // Success - Aurora Green (#6B9B7A)
          success: {
            50: '#f6f9f7',
            100: '#e7efe9',
            200: '#ceded3',
            300: '#b0cab8',
            400: '#85ad92',
            500: '#679876',
            600: '#527a5f',
            700: '#3e5b47',
            800: '#293d2f',
            900: '#19251c',
            950: '#0c120e',
            DEFAULT: '#6B9B7A',
          },

          // Text
          text: '#FFFFFF',
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
