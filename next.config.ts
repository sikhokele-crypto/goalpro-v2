/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['logos.skysports.com'], // If you decide to show team logos later
  },
  experimental: {
    serverActions: true,
  },
};

export default nextConfig;
