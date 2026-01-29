import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

// GET /api/get-page?slug=xxx - 取得已發布的頁面/產品（含區塊），供前台使用
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = (searchParams.get("slug") || "").trim();

    if (!slug) {
      return errorResponse("BAD_REQUEST", "缺少 slug", 400);
    }

    const page = await prisma.page.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        type: true,
        content: true,
        metaTitle: true,
        metaDescription: true,
        isPublished: true,
        logo: true,
        externalUrl: true,
        category: true,
        sortOrder: true,
        heroTitle: true,
        heroSubtitle: true,
        heroImages: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!page || !page.isPublished) {
      return errorResponse("NOT_FOUND", "頁面不存在或尚未發布", 404);
    }

    const sections = await prisma.section.findMany({
      where: { pageId: page.id },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        sectionType: true,
        title: true,
        subtitle: true,
        content: true,
        sortOrder: true,
        settings: true,
      },
    });
    // 統一回傳 camelCase（與 Prisma / 後台 API 一致），前後台不再做 snake_case 轉換
    return successResponse({ page, sections });
  } catch (error) {
    return errorResponse("INTERNAL_ERROR", "獲取頁面資料失敗", 500);
  }
}
