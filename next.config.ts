import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.shopify.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '**',
        pathname: '/cdn/shop/**',
      },
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/cdn/shop/**',
      },
    ],
  },
};

export default nextConfig;
