import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bpebyazjesoxxzuzifmv.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/products/**',
      },
    ],
    domains: [
      'bpebyazjesoxxzuzifmv.supabase.co',
    ],
  },
};

export default nextConfig;
