import { NextResponse } from "next/server";
import { ZodError } from "zod";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export function successResponse<T>(
  data: T,
  message?: string,
  pagination?: ApiResponse["pagination"]
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message,
    pagination,
  });
}

export function errorResponse(
  code: string,
  message: string,
  status: number = 400,
  details?: any
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
    },
    { status }
  );
}

export function handleApiError(error: any): NextResponse<ApiError> {
  console.error("API Error:", error);

  if (error instanceof ZodError) {
    return errorResponse("VALIDATION_ERROR", "資料驗證錯誤", 400, error.issues);
  }

  // Prisma: 欄位資料過長（例如：content HTML 太長但欄位型別是 VARCHAR）
  if (error?.code === "P2000") {
    const column = error?.meta?.column_name || error?.meta?.target || undefined;
    return errorResponse(
      "VALIDATION_ERROR",
      column ? `欄位內容過長：${String(column)}` : "欄位內容過長",
      400,
      error?.meta
    );
  }

  if (error?.code === "P2002") {
    return errorResponse("CONFLICT", "資料重複", 409);
  }

  if (error?.code === "P2025") {
    return errorResponse("NOT_FOUND", "資料不存在", 404);
  }

  return errorResponse("INTERNAL_ERROR", "伺服器錯誤", 500);
}
