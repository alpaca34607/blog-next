import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-middleware";
import {
  successResponse,
  errorResponse,
  handleApiError,
} from "@/lib/api-response";

type RouteParams = { id?: string } | Promise<{ id?: string }>;

async function resolveNavigationId(context: {
  params?: RouteParams;
}): Promise<string | undefined> {
  const params = await Promise.resolve(
    context?.params as RouteParams | undefined
  );
  const id = (params as any)?.id;
  return typeof id === "string" && id.trim().length > 0 ? id : undefined;
}

const updateNavigationSchema = z.object({
  title: z.string().min(1, "標題不能為空").optional(),
  titleEn: z.string().optional(),
  url: z.string().nullable().optional(),
  productCategory: z.string().nullable().optional(),
  type: z.enum(["internal", "external"]).optional(),
  isVisible: z.boolean().optional(),
  sortOrder: z.number().optional(),
  parentId: z.string().nullable().optional(),
});

// GET /api/navigation/[id] - 獲取單個導航項目（公開）
export async function GET(
  request: NextRequest,
  context: { params?: RouteParams }
) {
  try {
    const navigationId = await resolveNavigationId(context);
    if (!navigationId) return errorResponse("BAD_REQUEST", "缺少導航 id", 400);

    const item = await prisma.navigation.findUnique({
      where: { id: navigationId },
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
        children: {
          orderBy: { sortOrder: "asc" },
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
      },
    });

    if (!item) {
      return errorResponse("NOT_FOUND", "導航項目不存在", 404);
    }

    return successResponse(item, "獲取導航項目成功");
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/navigation/[id] - 更新導航項目（需要認證）
export async function PUT(
  request: NextRequest,
  context: { params?: RouteParams }
) {
  return withAuth(request, async (req) => {
    try {
      const navigationId = await resolveNavigationId(context);
      if (!navigationId)
        return errorResponse("BAD_REQUEST", "缺少導航 id", 400);

      const body = await request.json();
      const data = updateNavigationSchema.parse(body);

      const item = await prisma.navigation.update({
        where: { id: navigationId },
        data,
        include: {
          children: true,
        },
      });
      return successResponse(item, "更新導航項目成功");

    } catch (error) {
      return handleApiError(error);
    }
  });
}

// DELETE /api/navigation/[id] - 刪除導航項目（需要認證）
export async function DELETE(
  request: NextRequest,
  context: { params?: RouteParams }
) {
  return withAuth(request, async (req) => {
    try {
      const navigationId = await resolveNavigationId(context);
      if (!navigationId)
        return errorResponse("BAD_REQUEST", "缺少導航 id", 400);

      await prisma.navigation.delete({
        where: { id: navigationId },
      });

      return successResponse(null, "刪除導航項目成功");
    } catch (error) {
      return handleApiError(error);
    }
  });
}
