import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

/**
 * GET/POST /api/demo/cleanup
 * 刪除超過 24 小時的 DEMO 工作區及其關聯資料。
 * Vercel Cron 每小時自動呼叫；或可手動 GET /api/demo/cleanup?secret=xxx
 * 設定環境變數 DEMO_CLEANUP_SECRET 可防止未授權觸發。
 */
async function runCleanup(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secret =
      searchParams.get("secret") ||
      request.headers.get("authorization")?.replace("Bearer ", "");
    const expectedSecret =
      process.env.DEMO_CLEANUP_SECRET || process.env.CRON_SECRET;

    if (expectedSecret && secret !== expectedSecret) {
      return errorResponse("UNAUTHORIZED", "未授權", 401);
    }

    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const expired = await prisma.demoWorkspace.findMany({
      where: { createdAt: { lt: cutoff } },
      select: { id: true },
    });

    const ids = expired.map((w) => w.id);

    if (ids.length === 0) {
      return successResponse({ deleted: 0, message: "無需清理的 DEMO 工作區" });
    }

    await prisma.$transaction([
      prisma.page.deleteMany({ where: { demoWorkspaceId: { in: ids } } }),
      prisma.navigation.deleteMany({ where: { demoWorkspaceId: { in: ids } } }),
      prisma.news.deleteMany({ where: { demoWorkspaceId: { in: ids } } }),
      prisma.demoWorkspace.deleteMany({ where: { id: { in: ids } } }),
    ]);

    return successResponse({
      deleted: ids.length,
      ids,
      message: `已清理 ${ids.length} 個過期 DEMO 工作區`,
    });
  } catch (error) {
    console.error("[demo/cleanup] error:", error);
    return errorResponse("INTERNAL_ERROR", "清理失敗", 500);
  }
}

export async function GET(request: NextRequest) {
  return runCleanup(request);
}

export async function POST(request: NextRequest) {
  return runCleanup(request);
}
