import type { NextConfig } from "next";
import path from "path";
import createNextIntlPlugin from 'next-intl/plugin';
// Point explicitly to your request config inside src
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.resolve(__dirname),
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  async redirects() {
    return [
      { source: '/dashboard', destination: '/en/dashboard', permanent: false },
      { source: '/dashboard/:path*', destination: '/en/dashboard/:path*', permanent: false },
      { source: '/login', destination: '/en/login', permanent: false },
      { source: '/signup', destination: '/en/signup', permanent: false },
      { source: '/register', destination: '/en/register', permanent: false },
      { source: '/newScan', destination: '/en/newScan', permanent: false },
      { source: '/about', destination: '/en/about', permanent: false },
      { source: '/pricing', destination: '/en/pricing', permanent: false },
    ];
  },
};

export default withNextIntl(nextConfig);