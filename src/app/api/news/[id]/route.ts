import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-middleware";
import {
  successResponse,
  errorResponse,
  handleApiError,
} from "@/lib/api-response";
import { z } from "zod";

const updateNewsSchema = z.object({
  title: z.string().min(1, "標題不能為空").optional(),
  slug: z.string().min(1, "Slug不能為空").optional(),
  excerpt: z.string().optional(),
  content: z.string().min(1, "內容不能為空").optional(),
  category: z.string().optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  featuredImage: z.string().optional(),
  publishDate: z.string().datetime().optional(),
});

function getIdFromRequest(request: NextRequest, params?: { id?: string }) {
  // 兼容某些情境下 Next 沒有正確傳入 params（避免 id 變成 undefined 導致 Prisma 500）
  const id = params?.id;
  if (typeof id === "string" && id.trim()) return id.trim();

  const pathname = new URL(request.url).pathname;
  const fallback = pathname.split("/").filter(Boolean).pop();
  return fallback || "";
}

// GET /api/news/[id] - 獲取單個新聞
async function getNewsById(request: NextRequest, id: string) {
  try {
    if (!id) {
      return errorResponse("VALIDATION_ERROR", "缺少新聞 ID", 400);
    }

    const news = await prisma.news.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        category: true,
        isPublished: true,
        isFeatured: true,
        featuredImage: true,
        publishDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!news) {
      return errorResponse("NOT_FOUND", "新聞不存在", 404);
    }

    return successResponse(news);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/news/[id] - 更新新聞
async function updateNews(request: NextRequest, id: string) {
  try {
    if (!id) {
      return errorResponse("VALIDATION_ERROR", "缺少新聞 ID", 400);
    }

    const body = await request.json();
    const validatedData = updateNewsSchema.parse(body);

    // 檢查新聞是否存在
    const existingNews = await prisma.news.findUnique({
      where: { id },
    });

    if (!existingNews) {
      return errorResponse("NOT_FOUND", "新聞不存在", 404);
    }

    // 如果更新 slug，檢查是否重複
    if (validatedData.slug && validatedData.slug !== existingNews.slug) {
      const slugExists = await prisma.news.findUnique({
        where: { slug: validatedData.slug },
      });

      if (slugExists) {
        return errorResponse("CONFLICT", "Slug 已存在", 409);
      }
    }

    const updatedNews = await prisma.news.update({
      where: { id },
      data: {
        ...validatedData,
        publishDate: validatedData.publishDate
          ? new Date(validatedData.publishDate)
          : undefined,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        category: true,
        isPublished: true,
        isFeatured: true,
        featuredImage: true,
        publishDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return successResponse(updatedNews, "新聞更新成功");
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/news/[id] - 刪除新聞
async function deleteNews(request: NextRequest, id: string) {
  try {
    if (!id) {
      return errorResponse("VALIDATION_ERROR", "缺少新聞 ID", 400);
    }

    // 檢查新聞是否存在
    const existingNews = await prisma.news.findUnique({
      where: { id },
    });

    if (!existingNews) {
      return errorResponse("NOT_FOUND", "新聞不存在", 404);
    }

    await prisma.news.delete({
      where: { id },
    });

    return successResponse(null, "新聞刪除成功");
  } catch (error) {
    return handleApiError(error);
  }
}

export const GET = async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  const resolvedParams = await context.params.catch(() => ({ id: "" }));
  const id = getIdFromRequest(request, resolvedParams);
  return withAuth(request, (req) => getNewsById(req, id));
};

export const PUT = async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  const resolvedParams = await context.params.catch(() => ({ id: "" }));
  const id = getIdFromRequest(request, resolvedParams);
  return withAuth(request, (req) => updateNews(req, id));
};

export const DELETE = async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  const resolvedParams = await context.params.catch(() => ({ id: "" }));
  const id = getIdFromRequest(request, resolvedParams);
  return withAuth(request, (req) => deleteNews(req, id));
};
