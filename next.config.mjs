import { withSentryConfig } from '@sentry/nextjs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Bundle analyzer (only enabled when ANALYZE env var is set)
const withBundleAnalyzer =
  process.env.ANALYZE === 'true'
    ? require('@next/bundle-analyzer')({
        enabled: true,
      })
    : (config) => config;

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer, nextRuntime, dev }) => {
    // Exclude Playwright and ffmpeg-static from bundling (server-only, Node.js runtime)
    if (isServer) {
      config.externals = config.externals || [];
      const serverExternals = {
        playwright: 'commonjs playwright',
        'playwright-core': 'commonjs playwright-core',
        chromium: 'commonjs chromium',
        'ffmpeg-static': 'commonjs ffmpeg-static',
        'fluent-ffmpeg': 'commonjs fluent-ffmpeg',
      };

      // Handle both array and function externals
      if (Array.isArray(config.externals)) {
        config.externals.push(serverExternals);
      } else if (typeof config.externals === 'function') {
        const originalExternals = config.externals;
        config.externals = (context, request, callback) => {
          if (
            request === 'playwright' ||
            request === 'playwright-core' ||
            request === 'chromium' ||
            request === 'ffmpeg-static' ||
            request === 'fluent-ffmpeg'
          ) {
            return callback(null, `commonjs ${request}`);
          }
          return originalExternals(context, request, callback);
        };
      } else {
        config.externals = [config.externals, serverExternals];
      }
    }

    // Exclude Brevo and Node.js built-ins from Edge runtime
    // Brevo uses Node.js 'http' module which isn't available in Edge runtime
    if (nextRuntime === 'edge') {
      const originalExternals = config.externals;
      config.externals = ({ context, request }, callback) => {
        // Exclude Brevo package and Node.js built-ins from Edge runtime
        if (
          request === '@getbrevo/brevo' ||
          request?.startsWith('@getbrevo/') ||
          request === 'http' ||
          request === 'https' ||
          request === 'net' ||
          request === 'tls' ||
          request === 'fs' ||
          request === 'path' ||
          request === 'async_hooks' ||
          request === 'crypto' ||
          request === 'stream' ||
          request === 'util' ||
          request === 'url' ||
          request?.startsWith('node:')
        ) {
          return callback(null, `commonjs ${request}`);
        }
        // Prevent auth.ts and email.ts from being bundled in Edge runtime
        // These modules use Node.js-only dependencies (Brevo, crypto, etc.)
        if (
          (typeof request === 'string' && request.includes('/lib/email')) ||
          (typeof request === 'string' && request.includes('/lib/auth')) ||
          (typeof request === 'string' && request.includes('@getbrevo'))
        ) {
          // Throw error to prevent bundling - these modules should never be used in Edge runtime
          return callback(
            new Error(
              `${request} cannot be used in Edge runtime. Use Node.js runtime instead.`,
            ),
          );
        }
        if (typeof originalExternals === 'function') {
          return originalExternals({ context, request }, callback);
        }
        return callback();
      };
    }

    // Enable WebAssembly experiments
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      syncWebAssembly: true,
    };

    // Handle WASM files
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
      resourceQuery: { not: [/module/] },
    });

    // Ignore binary files from ffmpeg-static (prevent Next.js/Turbopack from trying to parse them)
    if (isServer) {
      // Add as noParse to prevent webpack from parsing the binary
      if (!config.module.noParse) {
        config.module.noParse = [];
      }
      if (Array.isArray(config.module.noParse)) {
        config.module.noParse.push(/ffmpeg-static.*\/ffmpeg$/);
      } else {
        config.module.noParse = [
          config.module.noParse,
          /ffmpeg-static.*\/ffmpeg$/,
        ];
      }
    }

    // Client-side polyfills
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        path: false,
        stream: false,
        util: false,
        url: false,
        buffer: require.resolve('buffer'),
      };

      // Optimize chunk splitting for client-side bundles
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk for common dependencies
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]/,
              priority: 20,
              minChunks: 2, // Only create vendor chunk if used in 2+ chunks
            },
            // Separate chunk for astrochart (large library)
            astrochart: {
              name: 'astrochart',
              test: /[\\/]node_modules[\\/]@astrodraw[\\/]/,
              chunks: 'all',
              priority: 30,
            },
            // Separate chunk for Radix UI
            radix: {
              name: 'radix',
              test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
              chunks: 'all',
              priority: 25,
            },
          },
        },
      };
    }

    // Edge runtime: Allow buffer but exclude Node.js-only modules
    if (nextRuntime === 'edge') {
      // Buffer is available in Edge runtime via Web APIs
      // Don't exclude it, but ensure Brevo and other Node.js modules are excluded

      // Optimize chunk splitting for better tree shaking
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk for common dependencies
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]/,
              priority: 20,
            },
            // Separate chunk for astrochart (large library)
            astrochart: {
              name: 'astrochart',
              test: /[\\/]node_modules[\\/]@astrodraw[\\/]/,
              chunks: 'all',
              priority: 30,
            },
            // Separate chunk for Radix UI
            radix: {
              name: 'radix',
              test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
              chunks: 'all',
              priority: 25,
            },
          },
        },
      };
    }

    // Suppress "Critical dependency" warnings for intentional dynamic imports
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /posthog-js/,
        message: /Critical dependency/,
      },
    ];

    return config;
  },

  // Transpile packages for better compatibility
  transpilePackages: [],

  // Compression and optimization
  compress: true,

  // Disable source maps in production to save memory
  productionBrowserSourceMaps: false,

  // SWC compiler configuration - remove console statements in production
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn'], // Keep console.error and console.warn
          }
        : false,
  },

  // Experimental optimizations for faster builds
  experimental: {
    // Optimize package imports (tree-shake unused exports)
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-label',
      '@radix-ui/react-switch',
      'react-day-picker',
      'dayjs',
      'recharts',
      'posthog-js',
      'date-fns',
      '@react-email/components',
    ],
    // Reduce memory usage during builds
    workerThreads: false,
    cpus: 1,
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // PWA Configuration
  async headers() {
    // In development, disable service worker caching
    const isDev = process.env.NODE_ENV === 'development';

    return [
      // Security headers for all routes
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value:
              'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
          {
            key: 'Cache-Control',
            value: isDev
              ? 'no-cache, no-store, must-revalidate'
              : 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/admin-manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache OG images for 24 hours (content updates daily)
        source: '/api/og/:path*',
        headers: [
          {
            key: 'Content-Type',
            value: 'image/png',
          },
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=86400, stale-while-revalidate=172800',
          },
        ],
      },
      {
        // Cache global cosmic data API (2 hours)
        source: '/api/cosmic/global',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=7200, stale-while-revalidate=3600',
          },
        ],
      },
      {
        // Cache user cosmic snapshots API (4 hours)
        source: '/api/cosmic/snapshot',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=14400, stale-while-revalidate=7200',
          },
        ],
      },
      {
        // Cache static assets aggressively
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-Robots-Tag',
            value: 'noindex',
          },
        ],
      },
      {
        source: '/press-kit/press-release-template.md',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex',
          },
        ],
      },
      {
        source: '/press-kit/founder-bio.pdf',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex',
          },
        ],
      },
      {
        // Cache images
        source: '/icons/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      // Forecast -> Transits hub redirect
      {
        source: '/forecast',
        destination: '/transits',
        permanent: true,
      },
      {
        source: '/forecast/:year',
        destination: '/grimoire/transits#year-:year',
        permanent: true,
      },
      // Blog week URL format normalization
      {
        source: '/blog/week/:week(\\d+)-:year(\\d{4})',
        destination: '/blog/week/week-:week-:year',
        permanent: true,
      },
      // Moon calendar year pages -> Grimoire moon year pages
      {
        source: '/moon-calendar/:year(\\d{4})',
        destination: '/grimoire/moon/:year',
        permanent: true,
      },
      {
        source: '/moon',
        destination: '/grimoire/moon',
        permanent: true,
      },
      // ========================================
      // GRIMOIRE CONSOLIDATION REDIRECTS
      // Phase 1: Deleted duplicate index pages
      // ========================================
      {
        source: '/grimoire/moon-phases',
        destination: '/grimoire/moon/phases',
        permanent: true,
      },
      {
        source: '/grimoire/moon-phases/:phase',
        destination: '/grimoire/moon/phases/:phase',
        permanent: true,
      },
      {
        source: '/grimoire/full-moons',
        destination: '/grimoire/moon/full-moons',
        permanent: true,
      },
      {
        source: '/grimoire/full-moons/:month',
        destination: '/grimoire/moon/full-moons/:month',
        permanent: true,
      },
      {
        source: '/grimoire/tarot-spreads',
        destination: '/grimoire/tarot/spreads',
        permanent: true,
      },
      {
        source: '/grimoire/tarot-spreads/:spread',
        destination: '/grimoire/tarot/spreads/:spread',
        permanent: true,
      },
      {
        source: '/grimoire/scrying',
        destination: '/grimoire/divination/scrying',
        permanent: true,
      },
      {
        source: '/grimoire/dream-interpretation',
        destination: '/grimoire/divination/dream-interpretation',
        permanent: true,
      },
      {
        source: '/grimoire/pendulum-divination',
        destination: '/grimoire/divination/pendulum',
        permanent: true,
      },
      {
        source: '/grimoire/reading-omens',
        destination: '/grimoire/divination/omen-reading',
        permanent: true,
      },
      {
        source: '/grimoire/planets',
        destination: '/grimoire/astronomy/planets',
        permanent: true,
      },
      {
        source: '/grimoire/planets/:planet',
        destination: '/grimoire/astronomy/planets/:planet',
        permanent: true,
      },
      {
        source: '/grimoire/breathwork',
        destination: '/grimoire/meditation/breathwork',
        permanent: true,
      },
      // Sabbats redirect (duplicate of wheel-of-the-year)
      {
        source: '/grimoire/sabbats',
        destination: '/grimoire/wheel-of-the-year',
        permanent: true,
      },
      {
        source: '/grimoire/sabbats/:sabbat',
        destination: '/grimoire/wheel-of-the-year/:sabbat',
        permanent: true,
      },
      // ========================================
      // PHASE 2: ORPHAN PAGE MOVES
      // ========================================
      // Moon section moves
      {
        source: '/grimoire/moon-rituals',
        destination: '/grimoire/moon/rituals',
        permanent: true,
      },
      {
        source: '/grimoire/moon-signs',
        destination: '/grimoire/moon/signs',
        permanent: true,
      },
      // Tarot section moves
      {
        source: '/grimoire/tarot-suits',
        destination: '/grimoire/tarot/suits',
        permanent: true,
      },
      {
        source: '/grimoire/tarot-suits/:suit',
        destination: '/grimoire/tarot/suits/:suit',
        permanent: true,
      },
      // Modern witchcraft section moves
      {
        source: '/grimoire/witchcraft-ethics',
        destination: '/grimoire/modern-witchcraft/ethics',
        permanent: true,
      },
      {
        source: '/grimoire/witchcraft-tools',
        destination: '/grimoire/modern-witchcraft/tools-guide',
        permanent: true,
      },
      {
        source: '/grimoire/witches',
        destination: '/grimoire/modern-witchcraft/famous-witches',
        permanent: true,
      },
      {
        source: '/grimoire/witches/:witch',
        destination: '/grimoire/modern-witchcraft/famous-witches/:witch',
        permanent: true,
      },
      // Spells section moves
      {
        source: '/grimoire/spellcraft-fundamentals',
        destination: '/grimoire/spells/fundamentals',
        permanent: true,
      },
      // Candle magic section moves
      {
        source: '/grimoire/anointing-candles',
        destination: '/grimoire/candle-magic/anointing',
        permanent: true,
      },
      {
        source: '/grimoire/incantations-by-candle-color',
        destination: '/grimoire/candle-magic/incantations',
        permanent: true,
      },
      {
        source: '/grimoire/lighting-candles-on-altar',
        destination: '/grimoire/candle-magic/altar-lighting',
        permanent: true,
      },
      // Astronomy section moves
      {
        source: '/grimoire/retrogrades',
        destination: '/grimoire/astronomy/retrogrades',
        permanent: true,
      },
      {
        source: '/grimoire/retrogrades/:planet',
        destination: '/grimoire/astronomy/retrogrades/:planet',
        permanent: true,
      },
      {
        source: '/grimoire/astronomy/retrogrades/venus-2',
        destination: '/grimoire/astronomy/retrogrades/venus',
        permanent: true,
      },
      // ========================================
      // END GRIMOIRE CONSOLIDATION REDIRECTS
      // ========================================
      // Aspects and Houses route restructure (SEO preservation)
      {
        source:
          '/grimoire/aspects/:aspect(conjunction|opposition|trine|square|sextile)',
        destination: '/grimoire/aspects/types/:aspect',
        permanent: true,
      },
      {
        source:
          '/grimoire/houses/:house(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth)',
        destination: '/grimoire/houses/overview/:house',
        permanent: true,
      },
      // Monthly horoscopes moved under Grimoire
      {
        source: '/horoscope/today/',
        destination: '/grimoire/horoscopes/today',
        permanent: true,
      },
      {
        source:
          '/horoscope/today/:sign(aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces)',
        destination: '/grimoire/horoscopes/today/:sign',
        permanent: true,
      },
      {
        source: '/horoscope/weekly/',
        destination: '/grimoire/horoscopes/weekly',
        permanent: true,
      },
      {
        source:
          '/horoscope/weekly/:sign(aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces)',
        destination: '/grimoire/horoscopes/weekly/:sign',
        permanent: true,
      },
      {
        source:
          '/horoscope/:sign(aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces)',
        destination: '/grimoire/horoscopes/:sign',
        permanent: true,
      },
      {
        source:
          '/horoscope/:sign(aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces)/:year(\\d{4})',
        destination: '/grimoire/horoscopes/:sign/:year',
        permanent: true,
      },
      {
        source:
          '/horoscope/:sign(aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces)/:year(\\d{4})/:month',
        destination: '/grimoire/horoscopes/:sign/:year/:month',
        permanent: true,
      },
    ];
  },
};

// Only enable Sentry build integration when explicitly requested
// Set ENABLE_SENTRY_SOURCEMAPS=true in Vercel to enable source map uploads
// This prevents expensive source map processing on every build
const shouldEnableSentry =
  process.env.ENABLE_SENTRY_SOURCEMAPS === 'true' &&
  process.env.SENTRY_AUTH_TOKEN;

export default shouldEnableSentry
  ? withSentryConfig(withBundleAnalyzer(nextConfig), {
      org: 'lunar-computing-inc',
      project: 'javascript-nextjs',
      silent: !process.env.CI,
      tunnelRoute: '/monitoring',
    })
  : withBundleAnalyzer(nextConfig);
