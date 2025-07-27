/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "cdn.builder.io",
      "lh3.googleusercontent.com",
      "lh4.googleusercontent.com", 
      "lh5.googleusercontent.com",
      "lh6.googleusercontent.com",
      "gravatar.com",
    ],
  },
  // Fix for HMR fetch issues and CSS source maps
  webpack: (config, { dev, isServer }) => {
    // Fix for HMR fetch issues
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    
    // Fix for CSS source map 404 errors
    config.module.rules.forEach((rule) => {
      if (rule.oneOf) {
        rule.oneOf.forEach((oneOfRule) => {
          if (oneOfRule.sideEffects === false) {
            oneOfRule.sideEffects = true;
          }
        });
      }
    });
    
    // Disable CSS source maps in production
    if (!dev) {
      config.devtool = false;
    }
    
    // Resolve alias for expo-secure-store
    config.resolve.alias = {
      ...config.resolve.alias,
      'expo-secure-store': false,
    };
    
    return config;
  },
  // Improve development server stability
  experimental: {
    webpackBuildWorker: true,
  },
  // Disable CSS source maps in production to prevent 404 errors
  productionBrowserSourceMaps: false,
  // Optimize CSS handling
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Configure CSS handling
  css: {
    // Disable CSS source maps
    sourceMap: false,
  },
  // Optimize for production
  swcMinify: true,
  // Configure headers to prevent source map requests
  async headers() {
    return [
      {
        source: '/_next/static/css/:path*',
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

module.exports = nextConfig;
