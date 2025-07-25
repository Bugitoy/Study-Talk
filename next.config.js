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
  // Fix for HMR fetch issues
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
  // Improve development server stability
  experimental: {
    webpackBuildWorker: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'expo-secure-store': false,
    };
    return config;
  },
};

module.exports = nextConfig;
