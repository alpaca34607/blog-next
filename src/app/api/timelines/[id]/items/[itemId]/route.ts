import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-middleware";
import {
  successResponse,
  errorResponse,
  handleApiError,
} from "@/lib/api-response";
import { z } from "zod";

const updateTimelineItemSchema = z.object({
  title: z.string().min(1, "標題不能為空").optional(),
  titleEn: z.string().optional(),
  content: z.string().optional(),
  contentEn: z.string().optional(),
  image: z.string().optional(),
  year: z.string().optional(),
  yearEn: z.string().optional(),
  sortOrder: z.number().optional(),
});

// GET /api/timelines/[id]/items/[itemId] - 取得單筆時間軸項目
async function getTimelineItem(timelineId: string, itemId: string) {
  try {
    if (!timelineId || !itemId) {
      return errorResponse("VALIDATION_ERROR", "缺少時間軸 ID 或項目 ID", 400);
    }

    const item = await prisma.timelineItem.findFirst({
      where: { id: itemId, timelineId },
      select: {
        id: true,
        timelineId: true,
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

    if (!item) {
      return errorResponse("NOT_FOUND", "項目不存在", 404);
    }

    return successResponse(item);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/timelines/[id]/items/[itemId] - 更新單筆時間軸項目
async function updateTimelineItem(
  request: NextRequest,
  timelineId: string,
  itemId: string
) {
  try {
    if (!timelineId || !itemId) {
      return errorResponse("VALIDATION_ERROR", "缺少時間軸 ID 或項目 ID", 400);
    }

    const body = await request.json();
    const data = updateTimelineItemSchema.parse(body);

    // 確保項目屬於該 timelineId（避免跨時間軸誤改）
    const existing = await prisma.timelineItem.findFirst({
      where: { id: itemId, timelineId },
      select: { id: true },
    });

    if (!existing) {
      return errorResponse("NOT_FOUND", "項目不存在", 404);
    }

    const updated = await prisma.timelineItem.update({
      where: { id: itemId },
      data,
      select: {
        id: true,
        timelineId: true,
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

    return successResponse(updated, "項目更新成功");
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/timelines/[id]/items/[itemId] - 刪除單筆時間軸項目
async function deleteTimelineItem(timelineId: string, itemId: string) {
  try {
    if (!timelineId || !itemId) {
      return errorResponse("VALIDATION_ERROR", "缺少時間軸 ID 或項目 ID", 400);
    }

    // 確保項目屬於該 timelineId
    const existing = await prisma.timelineItem.findFirst({
      where: { id: itemId, timelineId },
      select: { id: true },
    });

    if (!existing) {
      return errorResponse("NOT_FOUND", "項目不存在", 404);
    }

    await prisma.timelineItem.delete({ where: { id: itemId } });

    return successResponse(null, "項目刪除成功");
  } catch (error) {
    return handleApiError(error);
  }
}

export const GET = async (
  _request: NextRequest,
  context: { params: Promise<{ id: string; itemId: string }> }
) => {
  const resolvedParams = await context.params.catch(() => ({
    id: "",
    itemId: "",
  }));
  return getTimelineItem(resolvedParams.id, resolvedParams.itemId);
};

export const PUT = async (
  request: NextRequest,
  context: { params: Promise<{ id: string; itemId: string }> }
) => {
  const resolvedParams = await context.params.catch(() => ({
    id: "",
    itemId: "",
  }));
  return withAuth(request, (req) =>
    updateTimelineItem(req, resolvedParams.id, resolvedParams.itemId)
  );
};

export const DELETE = async (
  request: NextRequest,
  context: { params: Promise<{ id: string; itemId: string }> }
) => {
  const resolvedParams = await context.params.catch(() => ({
    id: "",
    itemId: "",
  }));
  return withAuth(request, () =>
    deleteTimelineItem(resolvedParams.id, resolvedParams.itemId)
  );
};

