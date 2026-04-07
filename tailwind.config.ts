import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        // Custom breakpoint so marketing nav switches to "desktop" around ~900px.
        marketing: '900px',
      },
      colors: {
        lunary: {
          // Backgrounds (no opacity needed)
          bg: '#0A0A0A',
          'bg-deep': '#050505',

          // Primary - Nebula Violet (#8458D8)
          primary: {
            50: 'rgb(246 243 252 / <alpha-value>)',
            100: 'rgb(231 222 247 / <alpha-value>)',
            200: 'rgb(206 189 240 / <alpha-value>)',
            300: 'rgb(176 148 230 / <alpha-value>)',
            400: 'rgb(133  90 216 / <alpha-value>)',
            500: 'rgb(103  48 207 / <alpha-value>)',
            600: 'rgb( 82  39 165 / <alpha-value>)',
            700: 'rgb( 62  29 124 / <alpha-value>)',
            800: 'rgb( 41  19  83 / <alpha-value>)',
            900: 'rgb( 25  12  50 / <alpha-value>)',
            950: 'rgb( 12   6  25 / <alpha-value>)',
            DEFAULT: 'rgb(132  88 216 / <alpha-value>)',
          },

          // Secondary - Comet Trail (#7B7BE8)
          secondary: {
            50: 'rgb(242 242 253 / <alpha-value>)',
            100: 'rgb(220 220 249 / <alpha-value>)',
            200: 'rgb(186 186 243 / <alpha-value>)',
            300: 'rgb(142 142 235 / <alpha-value>)',
            400: 'rgb( 81  81 225 / <alpha-value>)',
            500: 'rgb( 38  38 217 / <alpha-value>)',
            600: 'rgb( 30  30 174 / <alpha-value>)',
            700: 'rgb( 23  23 130 / <alpha-value>)',
            800: 'rgb( 15  15  87 / <alpha-value>)',
            900: 'rgb(  9   9  52 / <alpha-value>)',
            950: 'rgb(  5   5  26 / <alpha-value>)',
            DEFAULT: 'rgb(123 123 232 / <alpha-value>)',
          },

          // Accent - Galaxy Haze (#C77DFF)
          accent: {
            50: 'rgb(248 240 255 / <alpha-value>)',
            100: 'rgb(237 214 255 / <alpha-value>)',
            200: 'rgb(220 173 255 / <alpha-value>)',
            300: 'rgb(198 122 255 / <alpha-value>)',
            400: 'rgb(167  51 255 / <alpha-value>)',
            500: 'rgb(145   0 255 / <alpha-value>)',
            600: 'rgb(116   0 204 / <alpha-value>)',
            700: 'rgb( 87   0 153 / <alpha-value>)',
            800: 'rgb( 58   0 102 / <alpha-value>)',
            900: 'rgb( 35   0  61 / <alpha-value>)',
            950: 'rgb( 17   0  31 / <alpha-value>)',
            DEFAULT: 'rgb(199 125 255 / <alpha-value>)',
          },

          // Highlight - Supernova (#D070E8)
          highlight: {
            50: 'rgb(251 242 253 / <alpha-value>)',
            100: 'rgb(243 220 249 / <alpha-value>)',
            200: 'rgb(232 185 244 / <alpha-value>)',
            300: 'rgb(217 141 237 / <alpha-value>)',
            400: 'rgb(197  79 227 / <alpha-value>)',
            500: 'rgb(183  35 220 / <alpha-value>)',
            600: 'rgb(146  28 176 / <alpha-value>)',
            700: 'rgb(110  21 132 / <alpha-value>)',
            800: 'rgb( 73  14  88 / <alpha-value>)',
            900: 'rgb( 44   8  53 / <alpha-value>)',
            950: 'rgb( 22   4  26 / <alpha-value>)',
            DEFAULT: 'rgb(208 112 232 / <alpha-value>)',
          },

          // Rose - Cosmic Rose (#EE789E)
          rose: {
            50: 'rgb(253 241 245 / <alpha-value>)',
            100: 'rgb(250 219 229 / <alpha-value>)',
            200: 'rgb(246 183 203 / <alpha-value>)',
            300: 'rgb(240 137 170 / <alpha-value>)',
            400: 'rgb(232  74 125 / <alpha-value>)',
            500: 'rgb(226  29  92 / <alpha-value>)',
            600: 'rgb(181  23  74 / <alpha-value>)',
            700: 'rgb(136  17  55 / <alpha-value>)',
            800: 'rgb( 91  11  37 / <alpha-value>)',
            900: 'rgb( 54   7  22 / <alpha-value>)',
            950: 'rgb( 27   3  11 / <alpha-value>)',
            DEFAULT: 'rgb(238 120 158 / <alpha-value>)',
          },

          // Error - Solar Flare (#D06060)
          error: {
            50: 'rgb(252 243 243 / <alpha-value>)',
            100: 'rgb(246 224 224 / <alpha-value>)',
            200: 'rgb(236 192 192 / <alpha-value>)',
            300: 'rgb(225 153 153 / <alpha-value>)',
            400: 'rgb(208  98  98 / <alpha-value>)',
            500: 'rgb(197  58  58 / <alpha-value>)',
            600: 'rgb(157  47  47 / <alpha-value>)',
            700: 'rgb(118  35  35 / <alpha-value>)',
            800: 'rgb( 79  23  23 / <alpha-value>)',
            900: 'rgb( 47  14  14 / <alpha-value>)',
            950: 'rgb( 24   7   7 / <alpha-value>)',
            DEFAULT: 'rgb(208  96  96 / <alpha-value>)',
          },

          // Success - Aurora Green (#6B9B7A)
          success: {
            50: 'rgb(246 249 247 / <alpha-value>)',
            100: 'rgb(231 239 233 / <alpha-value>)',
            200: 'rgb(206 222 211 / <alpha-value>)',
            300: 'rgb(176 202 184 / <alpha-value>)',
            400: 'rgb(133 173 146 / <alpha-value>)',
            500: 'rgb(103 152 118 / <alpha-value>)',
            600: 'rgb( 82 122  95 / <alpha-value>)',
            700: 'rgb( 62  91  71 / <alpha-value>)',
            800: 'rgb( 41  61  47 / <alpha-value>)',
            900: 'rgb( 25  37  28 / <alpha-value>)',
            950: 'rgb( 12  18  14 / <alpha-value>)',
            DEFAULT: 'rgb(107 155 122 / <alpha-value>)',
          },

          // Text
          text: '#FFFFFF',
        },

        // Brand surface layers — dark purple in dark mode, light lavender in light mode
        layer: {
          deep: 'rgb(var(--layer-deep)   / <alpha-value>)',
          base: 'rgb(var(--layer-base)   / <alpha-value>)',
          raised: 'rgb(var(--layer-raised) / <alpha-value>)',
          high: 'rgb(var(--layer-high)   / <alpha-value>)',
        },

        // Semantic tokens — switch with data-theme attribute
        surface: {
          base: 'rgb(var(--surface-base)     / <alpha-value>)',
          elevated: 'rgb(var(--surface-elevated) / <alpha-value>)',
          card: 'rgb(var(--surface-card)     / <alpha-value>)',
          overlay: 'rgb(var(--surface-overlay)  / <alpha-value>)',
        },
        content: {
          primary: 'rgb(var(--content-primary)          / <alpha-value>)',
          secondary: 'rgb(var(--content-secondary)        / <alpha-value>)',
          muted: 'rgb(var(--content-muted)            / <alpha-value>)',
          brand: 'rgb(var(--content-brand)            / <alpha-value>)',
          'brand-accent':
            'rgb(var(--content-brand-accent)     / <alpha-value>)',
          'brand-secondary':
            'rgb(var(--content-brand-secondary)  / <alpha-value>)',
          error: 'rgb(var(--content-error)            / <alpha-value>)',
          success: 'rgb(var(--content-success)          / <alpha-value>)',
        },
        stroke: {
          subtle: 'rgb(var(--stroke-subtle)  / <alpha-value>)',
          default: 'rgb(var(--stroke-default) / <alpha-value>)',
          strong: 'rgb(var(--stroke-strong)  / <alpha-value>)',
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
