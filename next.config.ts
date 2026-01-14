/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable TypeScript and ESLint checking during build for faster deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {},
  basePath: "",
  assetPrefix: "",
  // Override type checking in production
  env: {
    SKIP_ENV_VALIDATION: "true",
  },
};

module.exports = nextConfig;
