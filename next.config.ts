import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: []
  },
  experimental: {
    staleTimes: {
      dynamic: 0,
    },
  },
};

export default nextConfig;
