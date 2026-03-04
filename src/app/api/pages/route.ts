import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuthOrDemo } from "@/lib/auth-middleware";
import { getWorkspaceFilter, getWorkspaceFilterForList } from "@/lib/demo-utils";
import type { AuthenticatedRequest } from "@/lib/auth-middleware";
import {
  successResponse,
  errorResponse,
  handleApiError,
} from "@/lib/api-response";
import {
  buildWhereClause,
  buildOrderBy,
  getPaginationParams,
  createPaginationResult,
} from "@/lib/query-utils";
import { z } from "zod";

const createPageSchema = z.object({
  title: z.string().min(1, "標題不能為空"),
  titleEn: z.string().optional(),
  slug: z.string().min(1, "Slug不能為空"),
  type: z.enum(["page", "product"]).default("page"),
  content: z.string().optional(),
  metaTitle: z.string().optional(),
  metaTitleEn: z.string().optional(),
  metaDescription: z.string().optional(),
  metaDescriptionEn: z.string().optional(),
  isPublished: z.boolean().default(false),
  logo: z.string().optional(),
  externalUrl: z.string().optional(),
  category: z.string().optional(),
  categoryEn: z.string().optional(),
  sortOrder: z.number().default(0),
  videoUrl: z.string().optional(),
  introImage: z.string().optional(),
  introImageEn: z.string().optional(),
  isFeatured: z.boolean().default(false),
  heroTitle: z.string().optional(),
  heroTitleEn: z.string().optional(),
  heroSubtitle: z.string().optional(),
  heroSubtitleEn: z.string().optional(),
  heroImages: z.array(z.string()).optional(),
});

// GET /api/pages - 獲取頁面列表（管理用，支援分頁、搜尋、排序）
async function getPages(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || undefined;
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as
      | "asc"
      | "desc";

    // 解析篩選條件
    const filter: Record<string, any> = {};
    searchParams.forEach((value, key) => {
      if (key.startsWith("filter[") && key.endsWith("]")) {
        const filterKey = key.slice(7, -1);
        if (value === "true") filter[filterKey] = true;
        else if (value === "false") filter[filterKey] = false;
        else filter[filterKey] = value;
      }
    });

    const {
      skip,
      page: currentPage,
      limit: currentLimit,
    } = getPaginationParams({ page, limit });

    const where = {
      ...buildWhereClause(search, filter, [
        "title",
        "content",
        "metaTitle",
        "metaDescription",
      ]),
      ...getWorkspaceFilterForList(req),
    };
    const orderBy = buildOrderBy(sortBy, sortOrder);

    const [pages, total] = await Promise.all([
      prisma.page.findMany({
        where,
        orderBy,
        skip,
        take: currentLimit,
        select: {
          id: true,
          demoWorkspaceId: true,
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
          _count: {
            select: {
              sections: true,
            },
          },
        },
      }),
      prisma.page.count({ where }),
    ]);

    const pagination = createPaginationResult(total, currentPage, currentLimit);

    return successResponse(pages, undefined, pagination);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/pages - 創建頁面
async function createPage(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const validatedData = createPageSchema.parse(body);
    const { demoWorkspaceId } = getWorkspaceFilter(req);

    // 檢查 slug 是否重複（同一工作區內）
    const existingPage = await prisma.page.findUnique({
      where: { slug_demoWorkspaceId: { slug: validatedData.slug, demoWorkspaceId } },
    });

    if (existingPage) {
      return errorResponse("CONFLICT", "Slug 已存在", 409);
    }

    const page = await prisma.page.create({
      data: { ...validatedData, demoWorkspaceId },
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
        _count: {
          select: {
            sections: true,
          },
        },
      },
    });

    return successResponse(page, "頁面創建成功");
  } catch (error) {
    return handleApiError(error);
  }
}

export const GET = (request: NextRequest) => withAuthOrDemo(request, getPages);
export const POST = (request: NextRequest) => withAuthOrDemo(request, createPage);
