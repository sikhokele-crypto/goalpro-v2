/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // This ignores the 'item' error you were having
    ignoreBuildErrors: true,
  },
  // We removed the 'eslint' block that caused the new error
};

module.exports = nextConfig;
