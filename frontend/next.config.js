/**

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // keep turbopack enabled by default in Next 16 dev
  },
  // allow requests from 127.0.0.1 and localhost during development
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  // Narrow turbopack workspace root to this frontend folder to speed up dev
  turbopack: {
    root: __dirname,
  },
  // Proxy rewrites for development so frontend can call backend without CORS issues
  async rewrites() {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8001/api/v1';
    const adminBase = process.env.NEXT_PUBLIC_ADMIN_API || 'http://127.0.0.1:8001/api/v1/admin';
    return [
      { source: '/api/:path*', destination: `${apiBase.replace(/\/$/, '')}/:path*` },
      { source: '/admin/:path*', destination: `${adminBase.replace(/\/$/, '')}/:path*` },
    ];
  },
};

module.exports = nextConfig;
