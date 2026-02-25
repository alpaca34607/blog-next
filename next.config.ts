import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n.ts");

const nextConfig: NextConfig = {
  images: {
    // 開發環境禁用圖片優化，避免快取問題
    unoptimized: process.env.NODE_ENV === "development",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s3.ap-northeast-1.amazonaws.com",
        pathname: "/blogcraft-dev/uploads/**",
      },
    ],
  },
};

module.exports = withNextIntl(nextConfig);
