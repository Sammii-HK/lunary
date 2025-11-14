import { createRequire } from 'module';
const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Exclude Playwright from bundling (server-only, Node.js runtime)
    if (isServer) {
      config.externals = config.externals || [];
      const playwrightExternals = {
        playwright: 'commonjs playwright',
        'playwright-core': 'commonjs playwright-core',
        chromium: 'commonjs chromium',
      };
      
      // Handle both array and function externals
      if (Array.isArray(config.externals)) {
        config.externals.push(playwrightExternals);
      } else if (typeof config.externals === 'function') {
        const originalExternals = config.externals;
        config.externals = (context, request, callback) => {
          if (request === 'playwright' || request === 'playwright-core' || request === 'chromium') {
            return callback(null, `commonjs ${request}`);
          }
          return originalExternals(context, request, callback);
        };
      } else {
        config.externals = [config.externals, playwrightExternals];
      }
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

    // Client-side polyfills for Jazz
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
            // Separate chunk for MUI (large library)
            mui: {
              name: 'mui',
              test: /[\\/]node_modules[\\/]@mui[\\/]/,
              chunks: 'all',
              priority: 30,
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

    return config;
  },

  // Transpile packages for better compatibility
  transpilePackages: ['jazz-tools'],

  // Compression and optimization
  compress: true,

  // Experimental optimizations for faster builds
  experimental: {
    // Optimize package imports (tree-shake unused exports)
    optimizePackageImports: [
      '@mui/material',
      'lucide-react',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-label',
      '@radix-ui/react-switch',
    ],
  },

  // PWA Configuration
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
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
            key: 'Cache-Control',
            value: 'public, s-maxage=86400, stale-while-revalidate=172800',
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
};

export default nextConfig;
