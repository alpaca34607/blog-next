import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

// GET /api/get-news - 與前端現有接口相容
// 支援 ?UUID=xxx：合併正式 + 該 DEMO 工作區的新聞
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const isFeatured = searchParams.get("isFeatured");
    const slug = searchParams.get("slug");
    const demoUuid = searchParams.get("UUID") || searchParams.get("uuid") || "";

    const whereBase: any = {
      isPublished: true,
    };

    if (slug) {
      whereBase.slug = slug;
    }

    if (category) {
      whereBase.category = category;
    }

    if (isFeatured === "true") {
      whereBase.isFeatured = true;
    }

    const whereOfficial = { ...whereBase, demoWorkspaceId: "" };
    const [officialNews, demoNews] = await Promise.all([
      prisma.news.findMany({
        where: whereOfficial,
        orderBy: { publishDate: "desc" },
        select: {
          id: true,
          title: true,
          titleEn: true,
          slug: true,
          excerpt: true,
          excerptEn: true,
          content: true,
          contentEn: true,
          category: true,
          categoryEn: true,
          isPublished: true,
          isFeatured: true,
          featuredImage: true,
          publishDate: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      demoUuid
        ? prisma.news.findMany({
            where: { ...whereBase, demoWorkspaceId: demoUuid },
            orderBy: { publishDate: "desc" },
            select: {
              id: true,
              title: true,
              titleEn: true,
              slug: true,
              excerpt: true,
              excerptEn: true,
              content: true,
              contentEn: true,
              category: true,
              categoryEn: true,
              isPublished: true,
              isFeatured: true,
              featuredImage: true,
              publishDate: true,
              createdAt: true,
              updatedAt: true,
            },
          })
        : [],
    ]);

    const news = [...officialNews, ...demoNews].sort((a, b) => {
      const dateA = a.publishDate ? new Date(a.publishDate).getTime() : 0;
      const dateB = b.publishDate ? new Date(b.publishDate).getTime() : 0;
      return dateB - dateA;
    });

    return successResponse(news);
  } catch (error) {
    return errorResponse("INTERNAL_ERROR", "獲取新聞列表失敗", 500);
  }
}
