import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-middleware";
import {
  successResponse,
  errorResponse,
  handleApiError,
} from "@/lib/api-response";

type RouteParams = { key?: string } | Promise<{ key?: string }>;

async function resolveKey(context: {
  params?: RouteParams;
}): Promise<string | undefined> {
  const params = await Promise.resolve(
    context?.params as RouteParams | undefined
  );
  const key = (params as any)?.key;
  return typeof key === "string" && key.trim().length > 0 ? key : undefined;
}

// GET /api/config/[key] - 取得設定（公開）
async function getConfig(key: string) {
  try {
    const record = await prisma.appConfig.findUnique({
      where: { key },
      select: { key: true, value: true, updatedAt: true },
    });
    return successResponse(record?.value ?? null);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/config/[key] - 更新設定（需要認證）
async function putConfig(request: NextRequest, key: string) {
  try {
    const body = await request.json().catch(() => null);
    const updated = await prisma.appConfig.upsert({
      where: { key },
      update: { value: body },
      create: { key, value: body },
      select: { key: true, value: true, updatedAt: true },
    });
    return successResponse(updated.value, "更新設定成功");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(
  request: NextRequest,
  context: { params?: RouteParams }
) {
  const key = await resolveKey(context);
  if (!key) return errorResponse("BAD_REQUEST", "缺少 key", 400);
  return getConfig(key);
}

export async function PUT(
  request: NextRequest,
  context: { params?: RouteParams }
) {
  const key = await resolveKey(context);
  if (!key) return errorResponse("BAD_REQUEST", "缺少 key", 400);
  return withAuth(request, (req) => putConfig(req, key));
}
