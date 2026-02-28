import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

// GET /api/get-page?slug=xxx - 取得已發布的頁面/產品（含區塊），供前台使用
// 支援 ?UUID=xxx：優先回傳 DEMO 工作區的頁面，若無則回傳正式
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = (searchParams.get("slug") || "").trim();
    const demoUuid = searchParams.get("UUID") || searchParams.get("uuid") || "";

    if (!slug) {
      return errorResponse("BAD_REQUEST", "缺少 slug", 400);
    }

    // 有 UUID 時：先找 DEMO，再找正式
    let page = null;
    if (demoUuid) {
      page = await prisma.page.findUnique({
        where: { slug_demoWorkspaceId: { slug, demoWorkspaceId: demoUuid } },
        select: {
          id: true,
          title: true,
          titleEn: true,
          slug: true,
          type: true,
          content: true,
          metaTitle: true,
          metaTitleEn: true,
          metaDescription: true,
          metaDescriptionEn: true,
          isPublished: true,
          logo: true,
          externalUrl: true,
          category: true,
          categoryEn: true,
          sortOrder: true,
          introImage: true,
          introImageEn: true,
          heroTitle: true,
          heroTitleEn: true,
          heroSubtitle: true,
          heroSubtitleEn: true,
          heroImages: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }
    if (!page) {
      page = await prisma.page.findUnique({
        where: { slug_demoWorkspaceId: { slug, demoWorkspaceId: "" } },
        select: {
          id: true,
          title: true,
          titleEn: true,
          slug: true,
          type: true,
          content: true,
          metaTitle: true,
          metaTitleEn: true,
          metaDescription: true,
          metaDescriptionEn: true,
          isPublished: true,
          logo: true,
          externalUrl: true,
          category: true,
          categoryEn: true,
          sortOrder: true,
          introImage: true,
          introImageEn: true,
          heroTitle: true,
          heroTitleEn: true,
          heroSubtitle: true,
          heroSubtitleEn: true,
          heroImages: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }

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
        titleEn: true,
        subtitle: true,
        subtitleEn: true,
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
