import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'localstack.havenook.com'
      }
    ]
  }
};

module.exports = nextConfig;