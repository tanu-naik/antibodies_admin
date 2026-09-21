/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_URL_API: process.env.NEXT_URL_API,
  },
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.cache = {
        type: 'memory',
      };
    }
    return config;
  },
};

module.exports = nextConfig;
