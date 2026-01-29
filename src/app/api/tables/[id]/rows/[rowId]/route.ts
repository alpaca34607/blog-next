import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-middleware";
import {
  successResponse,
  errorResponse,
  handleApiError,
} from "@/lib/api-response";
import { z } from "zod";

const updateRowSchema = z
  .object({
    data: z.any().optional(), // {columnKey: value}
    sortOrder: z.number().optional(),
    isVisible: z.boolean().optional(),
  })
  .refine((val) => Object.keys(val).length > 0, {
    message: "至少需要一個可更新欄位",
  });

// GET /api/tables/[id]/rows/[rowId] - 獲取單筆表格行（管理用）
async function getTableRowById(tableId: string, rowId: string) {
  try {
    if (!tableId) {
      return errorResponse("VALIDATION_ERROR", "缺少表格 ID", 400);
    }
    if (!rowId) {
      return errorResponse("VALIDATION_ERROR", "缺少行 ID", 400);
    }

    const row = await prisma.tableRow.findUnique({
      where: { id: rowId },
      select: {
        id: true,
        tableId: true,
        data: true,
        sortOrder: true,
        isVisible: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!row || row.tableId !== tableId) {
      return errorResponse("NOT_FOUND", "資料不存在", 404);
    }

    const { tableId: _tableId, ...rest } = row;
    return successResponse(rest);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/tables/[id]/rows/[rowId] - 更新單筆表格行
async function updateTableRow(
  request: NextRequest,
  tableId: string,
  rowId: string
) {
  try {
    if (!tableId) {
      return errorResponse("VALIDATION_ERROR", "缺少表格 ID", 400);
    }
    if (!rowId) {
      return errorResponse("VALIDATION_ERROR", "缺少行 ID", 400);
    }

    // 先確認 row 存在且屬於指定 table（避免跨表更新）
    const existingRow = await prisma.tableRow.findUnique({
      where: { id: rowId },
      select: { id: true, tableId: true },
    });

    if (!existingRow || existingRow.tableId !== tableId) {
      return errorResponse("NOT_FOUND", "資料不存在", 404);
    }

    const body = await request.json();
    const validatedData = updateRowSchema.parse(body);

    const updatedRow = await prisma.tableRow.update({
      where: { id: rowId },
      data: validatedData,
      select: {
        id: true,
        data: true,
        sortOrder: true,
        isVisible: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return successResponse(updatedRow, "資料更新成功");
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/tables/[id]/rows/[rowId] - 刪除單筆表格行
async function deleteTableRow(tableId: string, rowId: string) {
  try {
    if (!tableId) {
      return errorResponse("VALIDATION_ERROR", "缺少表格 ID", 400);
    }
    if (!rowId) {
      return errorResponse("VALIDATION_ERROR", "缺少行 ID", 400);
    }

    const existingRow = await prisma.tableRow.findUnique({
      where: { id: rowId },
      select: { id: true, tableId: true },
    });

    if (!existingRow || existingRow.tableId !== tableId) {
      return errorResponse("NOT_FOUND", "資料不存在", 404);
    }

    await prisma.tableRow.delete({
      where: { id: rowId },
    });

    return successResponse(null, "資料刪除成功");
  } catch (error) {
    return handleApiError(error);
  }
}

export const GET = async (
  _request: NextRequest,
  context: { params: Promise<{ id: string; rowId: string }> }
) => {
  const resolvedParams = await context.params.catch(() => ({
    id: "",
    rowId: "",
  }));
  return getTableRowById(resolvedParams.id, resolvedParams.rowId);
};

export const PUT = async (
  request: NextRequest,
  context: { params: Promise<{ id: string; rowId: string }> }
) => {
  const resolvedParams = await context.params.catch(() => ({
    id: "",
    rowId: "",
  }));
  return withAuth(request, (req) =>
    updateTableRow(req, resolvedParams.id, resolvedParams.rowId)
  );
};

export const DELETE = async (
  request: NextRequest,
  context: { params: Promise<{ id: string; rowId: string }> }
) => {
  const resolvedParams = await context.params.catch(() => ({
    id: "",
    rowId: "",
  }));
  return withAuth(request, () => deleteTableRow(resolvedParams.id, resolvedParams.rowId));
};

