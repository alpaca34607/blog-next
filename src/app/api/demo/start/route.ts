import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateDemoToken } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";

/**
 * POST /api/demo/start
 * 建立 DEMO 訪客工作區，回傳 demoId 與 24h 有效的 token。
 * 無需認證。
 */
export async function POST(request: NextRequest) {
  try {
    const workspace = await prisma.demoWorkspace.create({
      data: {},
    });

    const token = generateDemoToken(workspace.id);

    return successResponse(
      {
        demoId: workspace.id,
        token,
      },
      "DEMO 工作區已建立，資料將於 24 小時後自動刪除"
    );
  } catch (error) {
    console.error("[demo/start] error:", error);
    return errorResponse("INTERNAL_ERROR", "建立 DEMO 工作區失敗", 500);
  }
}
