import { createRequire } from 'module';
const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
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
    }

    return config;
  },

  // Transpile packages for better compatibility
  transpilePackages: ['jazz-tools'],
};

export default nextConfig;
