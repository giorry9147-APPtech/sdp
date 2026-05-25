/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // klaar voor container deployment (Haven-compatible)
  // typedRoutes uitgezet — wordt later weer aangezet als we alle dynamische
  // hrefs typed casten (cosmetic, geen runtime-impact).
};

module.exports = nextConfig;
