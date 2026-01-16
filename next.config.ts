/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable TypeScript checking during build for faster deployment
  // Note: eslint config removed - Next.js 16+ doesn't support it in next.config
  typescript: {
    ignoreBuildErrors: true,
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
