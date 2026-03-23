import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // serverActions is now true by default in Next.js 16, 
    // but this is the correct way to write it if you need it:
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.skysports.com',
      },
    ],
  },
};

export default nextConfig;
