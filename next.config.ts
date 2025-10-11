import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
      },
      {
        protocol: 'https',
        hostname: 'storage.nadapp.net',
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/nadfun/:path*',
        destination: 'https://testnet-v3-api.nad.fun/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/api/nadfun/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
