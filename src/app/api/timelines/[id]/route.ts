import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-middleware";
import {
  successResponse,
  errorResponse,
  handleApiError,
} from "@/lib/api-response";
import { z } from "zod";

const updateTimelineSchema = z.object({
  name: z.string().min(1, "時間軸名稱不能為空").optional(),
  description: z.string().optional(),
});

// GET /api/timelines/[id] - 獲取單個時間軸（DEMO 唯讀可見）
async function getTimelineById(request: NextRequest, id: string) {
  try {
    if (!id) {
      return errorResponse("VALIDATION_ERROR", "缺少時間軸 ID", 400);
    }

    const timeline = await prisma.timeline.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        items: {
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            title: true,
            content: true,
            image: true,
            year: true,
            sortOrder: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
    });

    if (!timeline) {
      return errorResponse("NOT_FOUND", "時間軸不存在", 404);
    }

    return successResponse(timeline);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/timelines/[id] - 更新時間軸
async function updateTimeline(request: NextRequest, id: string) {
  try {
    if (!id) {
      return errorResponse("VALIDATION_ERROR", "缺少時間軸 ID", 400);
    }

    const body = await request.json();
    const validatedData = updateTimelineSchema.parse(body);

    // 檢查時間軸是否存在
    const existingTimeline = await prisma.timeline.findUnique({
      where: { id },
    });

    if (!existingTimeline) {
      return errorResponse("NOT_FOUND", "時間軸不存在", 404);
    }

    const updatedTimeline = await prisma.timeline.update({
      where: { id },
      data: validatedData,
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        items: {
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            title: true,
            content: true,
            image: true,
            year: true,
            sortOrder: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
    });

    return successResponse(updatedTimeline, "時間軸更新成功");
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/timelines/[id] - 刪除時間軸
async function deleteTimeline(request: NextRequest, id: string) {
  try {
    if (!id) {
      return errorResponse("VALIDATION_ERROR", "缺少時間軸 ID", 400);
    }

    // 檢查時間軸是否存在
    const existingTimeline = await prisma.timeline.findUnique({
      where: { id },
    });

    if (!existingTimeline) {
      return errorResponse("NOT_FOUND", "時間軸不存在", 404);
    }

    await prisma.timeline.delete({
      where: { id },
    });

    return successResponse(null, "時間軸刪除成功");
  } catch (error) {
    return handleApiError(error);
  }
}

export const GET = async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  const resolvedParams = await context.params.catch(() => ({ id: "" }));
  return getTimelineById(request, resolvedParams.id);
};

export const PUT = async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  const resolvedParams = await context.params.catch(() => ({ id: "" }));
  return withAuth(request, (req) => updateTimeline(req, resolvedParams.id));
};

export const DELETE = async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  const resolvedParams = await context.params.catch(() => ({ id: "" }));
  return withAuth(request, (req) => deleteTimeline(req, resolvedParams.id));
};
