import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: false,

  // Turbopack config (required in Next.js 16+ when using webpack config)
  turbopack: {},

  // Exclude WASM-heavy packages from bundling - they'll be loaded at runtime
  serverExternalPackages: [
    '@radr/shadowwire',
    '@lightprotocol/hasher.rs',
    'privacycash',
  ],

  webpack: (config, { isServer }) => {
    // Ignore WASM files in client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        os: false,
      };
    }

    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // Ignore problematic WASM imports
    config.externals = config.externals || [];
    if (Array.isArray(config.externals)) {
      config.externals.push({
        '@radr/shadowwire': 'commonjs @radr/shadowwire',
      });
    }

    return config;
  },
};

export default nextConfig;
