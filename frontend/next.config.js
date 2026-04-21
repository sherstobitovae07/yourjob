/**
 * Allow common dev origins (localhost and 127.0.0.1)
 * to avoid Turbopack blocking cross-origin dev resource requests.
 */
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // keep turbopack enabled by default in Next 16 dev
  },
  // allow requests from 127.0.0.1 and localhost during development
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
};

module.exports = nextConfig;
