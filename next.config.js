/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["cdn.builder.io"],
  },
  experimental: {
    appDir: true,
  },
};

module.exports = nextConfig;
