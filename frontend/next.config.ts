import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.BACKEND_URL || 'http://159.69.22.100:8000'}/:path*`, // Proxy to Backend
      },
    ];
  },
};

export default nextConfig;
