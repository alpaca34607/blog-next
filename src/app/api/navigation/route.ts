import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-middleware";
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
  QueryParams,
} from "@/lib/query-utils";

const navigationSchema = z.object({
  title: z.string().min(1, "標題不能為空"),
  titleEn: z.string().optional(),
  url: z.string().optional(),
  productCategory: z.string().optional(),
  type: z.enum(["internal", "external"]).default("internal"),
  isVisible: z.boolean().default(true),
  sortOrder: z.number().default(0),
  parentId: z.string().optional(),
});

// GET /api/navigation - 獲取導航選單（公開）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const flat = searchParams.get("flat") === "true";
    const params: QueryParams = {
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "50"),
      search: searchParams.get("search") || undefined,
      sortBy: searchParams.get("sortBy") || "sortOrder",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "asc",
      filter: {
        isVisible: searchParams.get("isVisible") === "true" ? true : undefined,
      },
    };

    const { page, limit, skip } = getPaginationParams(params);
    const where = buildWhereClause(params.search, params.filter, [
      "title",
      "titleEn",
    ]);
    // 導航列排序需要穩定：sortOrder 相同時再以 createdAt 排序
    const orderBy = [
      ...(buildOrderBy(params.sortBy, params.sortOrder) || []),
      { createdAt: "asc" as const },
    ];

    // tree 模式：只回傳頂層項目，避免 child 同時出現在 root 與 children
    const whereRoot = flat ? where : { ...where, parentId: null };

    // 使用 select 顯式指定欄位
    const [items, total] = await Promise.all([
      prisma.navigation.findMany({
        where: whereRoot,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          titleEn: true,
          url: true,
          productCategory: true,
          type: true,
          isVisible: true,
          sortOrder: true,
          parentId: true,
          createdAt: true,
          updatedAt: true,
          ...(flat
            ? {}
            : {
                children: {
                  orderBy: [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }],
                  select: {
                    id: true,
                    title: true,
                    titleEn: true,
                    url: true,
                    productCategory: true,
                    type: true,
                    isVisible: true,
                    sortOrder: true,
                    parentId: true,
                    createdAt: true,
                    updatedAt: true,
                  },
                },
              }),
        },
      }),
      prisma.navigation.count({ where: whereRoot }),
    ]);

    const pagination = createPaginationResult(total, page, limit);

    return successResponse(items, "獲取導航選單成功", pagination);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/navigation - 創建導航項目（需要認證）
export async function POST(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const body = await request.json();
      const data = navigationSchema.parse(body);

      const item = await prisma.navigation.create({
        data,
        include: {
          children: true,
        },
      });
      return successResponse(item, "創建導航項目成功");

    } catch (error) {
      return handleApiError(error);
    }
  });
}
