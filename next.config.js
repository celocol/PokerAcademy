/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  // Ensure proper static file handling
  trailingSlash: false,
  // Output configuration for Vercel
  output: 'standalone',
  // Handle API routes properly
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  // Environment variables
  env: {
    NEXT_PUBLIC_NETWORK_ID: process.env.NEXT_PUBLIC_NETWORK_ID || '42220',
    NEXT_PUBLIC_NETWORK_NAME: process.env.NEXT_PUBLIC_NETWORK_NAME || 'Celo',
  },
  // Experimental features for better Vercel compatibility
  experimental: {
    serverComponentsExternalPackages: ['@celo/contractkit'],
  },
};

module.exports = nextConfig; 