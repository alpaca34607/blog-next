import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-middleware";
import { getUserFromToken } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  handleApiError,
} from "@/lib/api-response";
import { z } from "zod";

const updateTableSchema = z.object({
  name: z.string().min(1, "表格名稱不能為空").optional(),
  description: z.string().optional(),
  columns: z
    .array(
      z.object({
        key: z.string(),
        label: z.string(),
        type: z.string(),
      })
    )
    .min(1, "至少需要一個欄位")
    .optional(),
});

// GET /api/tables/[id] - 獲取單個表格
async function getTableById(request: NextRequest, id: string) {
  try {
    if (!id) {
      return errorResponse("VALIDATION_ERROR", "缺少表格 ID", 400);
    }

    // 匿名請求僅回傳可見 row；若帶有有效 token 則回傳完整資料（管理用）
    const authHeader = request.headers.get("authorization");
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.substring(7)
        : null;
    const user = token ? await getUserFromToken(token) : null;

    const table = await prisma.table.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        columns: true,
        createdAt: true,
        updatedAt: true,
        rows: {
          orderBy: { sortOrder: "asc" },
          ...(user ? {} : { where: { isVisible: true } }),
          select: {
            id: true,
            data: true,
            sortOrder: true,
            isVisible: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        _count: {
          select: {
            rows: true,
          },
        },
      },
    });

    if (!table) {
      return errorResponse("NOT_FOUND", "表格不存在", 404);
    }

    return successResponse(table);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/tables/[id] - 更新表格
async function updateTable(request: NextRequest, id: string) {
  try {
    if (!id) {
      return errorResponse("VALIDATION_ERROR", "缺少表格 ID", 400);
    }

    const body = await request.json();
    const validatedData = updateTableSchema.parse(body);

    // 檢查表格是否存在
    const existingTable = await prisma.table.findUnique({
      where: { id },
    });

    if (!existingTable) {
      return errorResponse("NOT_FOUND", "表格不存在", 404);
    }

    const updatedTable = await prisma.table.update({
      where: { id },
      data: validatedData,
      select: {
        id: true,
        name: true,
        description: true,
        columns: true,
        createdAt: true,
        updatedAt: true,
        rows: {
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            data: true,
            sortOrder: true,
            isVisible: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        _count: {
          select: {
            rows: true,
          },
        },
      },
    });

    return successResponse(updatedTable, "表格更新成功");
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/tables/[id] - 刪除表格
async function deleteTable(request: NextRequest, id: string) {
  try {
    if (!id) {
      return errorResponse("VALIDATION_ERROR", "缺少表格 ID", 400);
    }

    // 檢查表格是否存在
    const existingTable = await prisma.table.findUnique({
      where: { id },
    });

    if (!existingTable) {
      return errorResponse("NOT_FOUND", "表格不存在", 404);
    }

    await prisma.table.delete({
      where: { id },
    });

    return successResponse(null, "表格刪除成功");
  } catch (error) {
    return handleApiError(error);
  }
}

export const GET = async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  const resolvedParams = await context.params.catch(() => ({ id: "" }));
  return getTableById(request, resolvedParams.id);
};

export const PUT = async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  const resolvedParams = await context.params.catch(() => ({ id: "" }));
  return withAuth(request, (req) => updateTable(req, resolvedParams.id));
};

export const DELETE = async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  const resolvedParams = await context.params.catch(() => ({ id: "" }));
  return withAuth(request, (req) => deleteTable(req, resolvedParams.id));
};
