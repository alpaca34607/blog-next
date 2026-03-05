import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-middleware";
import {
  successResponse,
  errorResponse,
  handleApiError,
} from "@/lib/api-response";
import { z } from "zod";

const createItemSchema = z.object({
  title: z.string().min(1, "標題不能為空"),
  titleEn: z.string().optional(),
  content: z.string().optional(),
  contentEn: z.string().optional(),
  image: z.string().optional(),
  year: z.string().optional(),
  yearEn: z.string().optional(),
  sortOrder: z.number().default(0),
});

const updateItemsSchema = z.array(
  z.object({
    id: z.string().optional(),
    title: z.string().min(1, "標題不能為空"),
    titleEn: z.string().optional(),
    content: z.string().optional(),
    contentEn: z.string().optional(),
    image: z.string().optional(),
    year: z.string().optional(),
    yearEn: z.string().optional(),
    sortOrder: z.number(),
  })
);

const deleteItemsSchema = z.object({
  ids: z.array(z.string()).min(1, "至少需要一個 ID"),
});

// GET /api/timelines/[id]/items - 獲取時間軸項目列表
async function getTimelineItems(request: NextRequest, timelineId: string) {
  try {
    if (!timelineId) {
      return errorResponse("VALIDATION_ERROR", "缺少時間軸 ID", 400);
    }

    // 檢查時間軸是否存在
    const timeline = await prisma.timeline.findUnique({
      where: { id: timelineId },
      select: { id: true },
    });

    if (!timeline) {
      return errorResponse("NOT_FOUND", "時間軸不存在", 404);
    }

    const items = await prisma.timelineItem.findMany({
      where: { timelineId },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        title: true,
        titleEn: true,
        content: true,
        contentEn: true,
        image: true,
        year: true,
        yearEn: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return successResponse(items);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/timelines/[id]/items - 創建時間軸項目
async function createTimelineItem(request: NextRequest, timelineId: string) {
  try {
    if (!timelineId) {
      return errorResponse("VALIDATION_ERROR", "缺少時間軸 ID", 400);
    }

    // 檢查時間軸是否存在
    const timeline = await prisma.timeline.findUnique({
      where: { id: timelineId },
      select: { id: true },
    });

    if (!timeline) {
      return errorResponse("NOT_FOUND", "時間軸不存在", 404);
    }

    const body = await request.json();
    const validatedData = createItemSchema.parse(body);

    const item = await prisma.timelineItem.create({
      data: {
        ...validatedData,
        timelineId,
      },
      select: {
        id: true,
        title: true,
        titleEn: true,
        content: true,
        contentEn: true,
        image: true,
        year: true,
        yearEn: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return successResponse(item, "項目創建成功");
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/timelines/[id]/items - 批量更新時間軸項目
async function updateTimelineItems(request: NextRequest, timelineId: string) {
  try {
    if (!timelineId) {
      return errorResponse("VALIDATION_ERROR", "缺少時間軸 ID", 400);
    }

    // 檢查時間軸是否存在
    const timeline = await prisma.timeline.findUnique({
      where: { id: timelineId },
      select: { id: true },
    });

    if (!timeline) {
      return errorResponse("NOT_FOUND", "時間軸不存在", 404);
    }

    const body = await request.json();
    const validatedItems = updateItemsSchema.parse(body);

    // 使用事務處理批量更新
    const result = await prisma.$transaction(async (tx: any) => {
      // 刪除現有的所有項目
      await tx.timelineItem.deleteMany({
        where: { timelineId },
      });

      // 創建新的項目
      const createdItems = [];
      for (const itemData of validatedItems) {
        const { id, ...raw } = itemData;
        const item = await tx.timelineItem.create({
          data: {
            ...raw,
            timelineId,
          },
          select: {
            id: true,
            title: true,
            titleEn: true,
            content: true,
            contentEn: true,
            image: true,
            year: true,
            yearEn: true,
            sortOrder: true,
            createdAt: true,
            updatedAt: true,
          },
        });
        createdItems.push(item);
      }

      return createdItems;
    });

    return successResponse(result, "項目批量更新成功");
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/timelines/[id]/items - 批量刪除時間軸項目
async function deleteTimelineItems(request: NextRequest, timelineId: string) {
  try {
    if (!timelineId) {
      return errorResponse("VALIDATION_ERROR", "缺少時間軸 ID", 400);
    }

    // 檢查時間軸是否存在
    const timeline = await prisma.timeline.findUnique({
      where: { id: timelineId },
      select: { id: true },
    });

    if (!timeline) {
      return errorResponse("NOT_FOUND", "時間軸不存在", 404);
    }

    const body = await request.json();
    const { ids } = deleteItemsSchema.parse(body);

    await prisma.timelineItem.deleteMany({
      where: {
        id: { in: ids },
        timelineId,
      },
    });

    return successResponse(null, "項目刪除成功");
  } catch (error) {
    return handleApiError(error);
  }
}

export const GET = async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  const resolvedParams = await context.params.catch(() => ({ id: "" }));
  return getTimelineItems(request, resolvedParams.id);
};

export const POST = async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  const resolvedParams = await context.params.catch(() => ({ id: "" }));
  return withAuth(request, (req) =>
    createTimelineItem(req, resolvedParams.id)
  );
};

export const PUT = async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  const resolvedParams = await context.params.catch(() => ({ id: "" }));
  return withAuth(request, (req) =>
    updateTimelineItems(req, resolvedParams.id)
  );
};

export const DELETE = async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  const resolvedParams = await context.params.catch(() => ({ id: "" }));
  return withAuth(request, (req) =>
    deleteTimelineItems(req, resolvedParams.id)
  );
};
