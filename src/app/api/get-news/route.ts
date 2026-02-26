import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

// GET /api/get-news - 與前端現有接口相容
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const isFeatured = searchParams.get("isFeatured");
    const slug = searchParams.get("slug");

    const where: any = {
      isPublished: true,
    };

    if (slug) {
      where.slug = slug;
    }

    if (category) {
      where.category = category;
    }

    if (isFeatured === "true") {
      where.isFeatured = true;
    }

    const news = await prisma.news.findMany({
      where,
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
    });

    return successResponse(news);
  } catch (error) {
    return errorResponse("INTERNAL_ERROR", "獲取新聞列表失敗", 500);
  }
}
