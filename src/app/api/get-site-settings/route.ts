import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

// GET /api/get-site-settings - 與前端現有接口相容
export async function GET() {
  try {
    const settings = await prisma.siteSettings.findFirst();

    if (!settings) {
      // 如果沒有設定，回傳一組安全的預設值（避免前台渲染失敗）
      return successResponse({
        siteName: "Blogcraft",
        siteNameEn: "Blogcraft",
        // SEO（若尚未建立 SiteSettings，回傳安全值以保持介面穩定）
        metaTitle: "Blogcraft",
        metaDescription: "",
        logo: null,
        footerLogo: null,
        copyright: "© 2024 Blogcraft. All rights reserved.",
        phone: "+886-2-1234-5678",
        email: "contact@blogcraft.com",
        contactTime: "週一至週五 09:00-18:00",
        address: "台北市信義區...",
        lineQrCode: null,
        socialLinks: {
          facebook: "https://facebook.com/blogcraft",
          line: "https://line.me/blogcraft",
          youtube: "https://youtube.com/blogcraft",
        },
        additionalLinks: [
          {
            title: "隱私權政策",
            url: "/privacy",
          },
        ],
      });
    }

    // 現在 SiteSettings Prisma model 已包含 metaTitle/metaDescription 欄位
    // 直接回傳設定中的值
    return successResponse({
      ...settings,
      metaTitle: settings.metaTitle,
      metaDescription: settings.metaDescription,
      contactImage: settings.contactImage,
      contactBanner: settings.contactBanner,
    });
  } catch (error) {
    return errorResponse("INTERNAL_ERROR", "獲取網站設定失敗", 500);
  }
}
