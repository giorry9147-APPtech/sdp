/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // klaar voor container deployment (Haven-compatible)
  experimental: {
    typedRoutes: true,
  },
};

module.exports = nextConfig;
