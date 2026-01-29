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

const createRowSchema = z.object({
  data: z.any(), // {columnKey: value}
  sortOrder: z.number().default(0),
  isVisible: z.boolean().default(true),
});

const updateRowsSchema = z.array(
  z.object({
    id: z.string().optional(), // 新增時不需要 id
    data: z.any(),
    sortOrder: z.number(),
    isVisible: z.boolean(),
  })
);

const deleteRowsSchema = z.object({
  ids: z.array(z.string()).min(1, "至少需要一個 ID"),
});

// GET /api/tables/[id]/rows - 獲取表格行列表
async function getTableRows(request: NextRequest, tableId: string) {
  try {
    if (!tableId) {
      return errorResponse("VALIDATION_ERROR", "缺少表格 ID", 400);
    }

    // 檢查表格是否存在
    const table = await prisma.table.findUnique({
      where: { id: tableId },
      select: { id: true },
    });

    if (!table) {
      return errorResponse("NOT_FOUND", "表格不存在", 404);
    }

    // 匿名請求僅回傳可見資料；若帶有有效 token 則回傳完整資料（管理用）
    const authHeader = request.headers.get("authorization");
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.substring(7)
        : null;
    const user = token ? await getUserFromToken(token) : null;

    const rows = await prisma.tableRow.findMany({
      where: {
        tableId,
        ...(user ? {} : { isVisible: true }),
      },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        data: true,
        sortOrder: true,
        isVisible: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return successResponse(rows);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/tables/[id]/rows - 創建表格行
async function createTableRow(request: NextRequest, tableId: string) {
  try {
    if (!tableId) {
      return errorResponse("VALIDATION_ERROR", "缺少表格 ID", 400);
    }

    // 檢查表格是否存在
    const table = await prisma.table.findUnique({
      where: { id: tableId },
      select: { id: true },
    });

    if (!table) {
      return errorResponse("NOT_FOUND", "表格不存在", 404);
    }

    const body = await request.json();
    const validatedData = createRowSchema.parse(body);

    const row = await prisma.tableRow.create({
      data: {
        ...validatedData,
        tableId,
      },
      select: {
        id: true,
        data: true,
        sortOrder: true,
        isVisible: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return successResponse(row, "行創建成功");
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/tables/[id]/rows - 批量更新表格行
async function updateTableRows(request: NextRequest, tableId: string) {
  try {
    if (!tableId) {
      return errorResponse("VALIDATION_ERROR", "缺少表格 ID", 400);
    }

    // 檢查表格是否存在
    const table = await prisma.table.findUnique({
      where: { id: tableId },
      select: { id: true },
    });

    if (!table) {
      return errorResponse("NOT_FOUND", "表格不存在", 404);
    }

    const body = await request.json();
    const validatedRows = updateRowsSchema.parse(body);

    // 使用事務處理批量更新
    const result = await prisma.$transaction(async (tx: any) => {
      // 刪除現有的所有行
      await tx.tableRow.deleteMany({
        where: { tableId },
      });

      // 創建新的行
      const createdRows = [];
      for (const rowData of validatedRows) {
        const { id, ...data } = rowData;
        const row = await tx.tableRow.create({
          data: {
            ...data,
            tableId,
          },
          select: {
            id: true,
            data: true,
            sortOrder: true,
            isVisible: true,
            createdAt: true,
            updatedAt: true,
          },
        });
        createdRows.push(row);
      }

      return createdRows;
    });

    return successResponse(result, "行批量更新成功");
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/tables/[id]/rows - 批量刪除表格行
async function deleteTableRows(request: NextRequest, tableId: string) {
  try {
    if (!tableId) {
      return errorResponse("VALIDATION_ERROR", "缺少表格 ID", 400);
    }

    // 檢查表格是否存在
    const table = await prisma.table.findUnique({
      where: { id: tableId },
      select: { id: true },
    });

    if (!table) {
      return errorResponse("NOT_FOUND", "表格不存在", 404);
    }

    const body = await request.json();
    const { ids } = deleteRowsSchema.parse(body);

    await prisma.tableRow.deleteMany({
      where: {
        id: { in: ids },
        tableId,
      },
    });

    return successResponse(null, "行刪除成功");
  } catch (error) {
    return handleApiError(error);
  }
}

export const GET = async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  const resolvedParams = await context.params.catch(() => ({ id: "" }));
  return getTableRows(request, resolvedParams.id);
};

export const POST = async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  const resolvedParams = await context.params.catch(() => ({ id: "" }));
  return withAuth(request, (req) => createTableRow(req, resolvedParams.id));
};

export const PUT = async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  const resolvedParams = await context.params.catch(() => ({ id: "" }));
  return withAuth(request, (req) => updateTableRows(req, resolvedParams.id));
};

export const DELETE = async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  const resolvedParams = await context.params.catch(() => ({ id: "" }));
  return withAuth(request, (req) => deleteTableRows(req, resolvedParams.id));
};
