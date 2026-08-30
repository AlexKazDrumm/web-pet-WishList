const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3031';

let apiUrl;
try {
  apiUrl = new URL(apiBase);
} catch {
  apiUrl = new URL('http://localhost:3031');
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  outputFileTracingRoot: require('path').join(__dirname, '../../'),
  transpilePackages: ['@wishlist/shared'],
  images: {
    remotePatterns: [
      {
        protocol: apiUrl.protocol === 'https:' ? 'https' : 'http',
        hostname: apiUrl.hostname,
        port: apiUrl.port || undefined,
        pathname: '/files/**',
      },
    ],
  },
};

module.exports = nextConfig;
