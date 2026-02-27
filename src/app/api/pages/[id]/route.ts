import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-middleware";
import {
  successResponse,
  errorResponse,
  handleApiError,
} from "@/lib/api-response";
import { z } from "zod";

type RouteParams = { id?: string } | Promise<{ id?: string }>;

async function resolvePageId(context: {
  params?: RouteParams;
}): Promise<string | undefined> {
  const params = await Promise.resolve(
    context?.params as RouteParams | undefined
  );
  const id = (params as any)?.id;
  return typeof id === "string" && id.trim().length > 0 ? id : undefined;
}

const updatePageSchema = z.object({
  title: z.string().min(1, "標題不能為空").optional(),
  titleEn: z.string().optional(),
  slug: z.string().min(1, "Slug不能為空").optional(),
  type: z.enum(["page", "product"]).optional(),
  content: z.string().optional(),
  metaTitle: z.string().optional(),
  metaTitleEn: z.string().optional(),
  metaDescription: z.string().optional(),
  metaDescriptionEn: z.string().optional(),
  isPublished: z.boolean().optional(),
  logo: z.string().optional(),
  externalUrl: z.string().optional(),
  category: z.string().optional(),
  categoryEn: z.string().optional(),
  sortOrder: z.number().optional(),
  videoUrl: z.string().optional(),
  introImage: z.string().optional(),
  introImageEn: z.string().optional(),
  isFeatured: z.boolean().optional(),
  heroTitle: z.string().optional(),
  heroTitleEn: z.string().optional(),
  heroSubtitle: z.string().optional(),
  heroSubtitleEn: z.string().optional(),
  heroImages: z.array(z.string()).optional(),
});

// GET /api/pages/[id] - 獲取單個頁面
async function getPageById(request: NextRequest, pageId: string) {
  try {
    const page = await prisma.page.findUnique({
      where: { id: pageId },
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
        videoUrl: true,
        introImage: true,
        introImageEn: true,
        isFeatured: true,
        heroTitle: true,
        heroTitleEn: true,
        heroSubtitle: true,
        heroSubtitleEn: true,
        heroImages: true,
        createdAt: true,
        updatedAt: true,
        sections: {
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
            createdAt: true,
            updatedAt: true,
          },
        },
        _count: {
          select: {
            sections: true,
          },
        },
      },
    });

    if (!page) {
      return errorResponse("NOT_FOUND", "頁面不存在", 404);
    }

    return successResponse(page);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/pages/[id] - 更新頁面
async function updatePage(request: NextRequest, pageId: string) {
  try {
    const body = await request.json();
    const validatedData = updatePageSchema.parse(body);

    // 檢查頁面是否存在
    const existingPage = await prisma.page.findUnique({
      where: { id: pageId },
    });

    if (!existingPage) {
      return errorResponse("NOT_FOUND", "頁面不存在", 404);
    }

    // 如果更新 slug，檢查是否重複
    if (validatedData.slug && validatedData.slug !== existingPage.slug) {
      const slugExists = await prisma.page.findUnique({
        where: { slug: validatedData.slug },
      });

      if (slugExists) {
        return errorResponse("CONFLICT", "Slug 已存在", 409);
      }
    }

    const updatedPage = await prisma.page.update({
      where: { id: pageId },
      data: validatedData,
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
        videoUrl: true,
        introImage: true,
        introImageEn: true,
        isFeatured: true,
        heroTitle: true,
        heroTitleEn: true,
        heroSubtitle: true,
        heroSubtitleEn: true,
        heroImages: true,
        createdAt: true,
        updatedAt: true,
        sections: {
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
            createdAt: true,
            updatedAt: true,
          },
        },
        _count: {
          select: {
            sections: true,
          },
        },
      },
    });

    return successResponse(updatedPage, "頁面更新成功");
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/pages/[id] - 刪除頁面
async function deletePage(request: NextRequest, pageId: string) {
  try {
    // 檢查頁面是否存在
    const existingPage = await prisma.page.findUnique({
      where: { id: pageId },
    });

    if (!existingPage) {
      return errorResponse("NOT_FOUND", "頁面不存在", 404);
    }

    await prisma.page.delete({
      where: { id: pageId },
    });

    return successResponse(null, "頁面刪除成功");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(
  request: NextRequest,
  context: { params?: RouteParams }
) {
  const pageId = await resolvePageId(context);
  if (!pageId) return errorResponse("BAD_REQUEST", "缺少頁面 id", 400);
  return withAuth(request, (req) => getPageById(req, pageId));
}

export async function PUT(
  request: NextRequest,
  context: { params?: RouteParams }
) {
  const pageId = await resolvePageId(context);
  if (!pageId) return errorResponse("BAD_REQUEST", "缺少頁面 id", 400);
  return withAuth(request, (req) => updatePage(req, pageId));
}

export async function DELETE(
  request: NextRequest,
  context: { params?: RouteParams }
) {
  const pageId = await resolvePageId(context);
  if (!pageId) return errorResponse("BAD_REQUEST", "缺少頁面 id", 400);
  return withAuth(request, (req) => deletePage(req, pageId));
}
