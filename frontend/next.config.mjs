/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // VPS / low-memory friendly tweaks:
  // - Production builds drop source maps (saves significant memory during compile)
  // - Mark heavy crypto libs as external so webpack doesn't try to bundle them
  productionBrowserSourceMaps: false,
  experimental: {
    serverComponentsExternalPackages: [
      "ethers",
      "siwe",
      "merkletreejs",
      "keccak256",
      "bullmq",
      "ioredis",
    ],
    optimizePackageImports: [
      "@tanstack/react-query",
      "ethers",
    ],
  },
  webpack: (config, { isServer }) => {
    // Keep node-only modules out of the client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;
