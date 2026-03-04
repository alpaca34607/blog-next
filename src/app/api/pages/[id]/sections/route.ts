import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuthOrDemo } from "@/lib/auth-middleware";
import { getWorkspaceFilter, getWorkspaceFilterForList } from "@/lib/demo-utils";
import type { AuthenticatedRequest } from "@/lib/auth-middleware";
import {
  successResponse,
  errorResponse,
  handleApiError,
} from "@/lib/api-response";
import { z } from "zod";

type RouteParams = { id?: string } | Promise<{ id?: string }>;

async function resolvePageId(context: {
  params?: RouteParams;
}): Promise<string | undefined> {
  const params = await Promise.resolve(
    context?.params as RouteParams | undefined
  );
  const id = (params as any)?.id;
  return typeof id === "string" && id.trim().length > 0 ? id : undefined;
}

const createSectionSchema = z.object({
  sectionType: z.string().min(1, "區塊類型不能為空"),
  title: z.string().optional(),
  titleEn: z.string().optional(),
  subtitle: z.string().optional(),
  subtitleEn: z.string().optional(),
  content: z.string().optional(),
  contentEn: z.string().optional(),
  sortOrder: z.number().default(0),
  settings: z.any().optional(),
});

const updateSectionsSchema = z.array(
  z.object({
    id: z.string().optional(), // 新增時不需要 id
    sectionType: z.string().min(1, "區塊類型不能為空"),
    title: z.string().optional(),
    titleEn: z.string().optional(),
    subtitle: z.string().optional(),
    subtitleEn: z.string().optional(),
    content: z.string().optional(),
    contentEn: z.string().optional(),
    sortOrder: z.number(),
    settings: z.any().optional(),
  })
);

// GET /api/pages/[id]/sections - 獲取頁面區塊列表
async function getPageSections(req: AuthenticatedRequest, pageId: string) {
  try {
    // 讀取時允許 demo 訪客存取系統資料（唯讀瀏覽）
    const ws = getWorkspaceFilterForList(req);
    // 檢查頁面是否存在且屬於當前工作區（含系統資料）
    const page = await prisma.page.findFirst({
      where: { id: pageId, demoWorkspaceId: ws.demoWorkspaceId },
      select: { id: true },
    });

    if (!page) {
      return errorResponse("NOT_FOUND", "頁面不存在", 404);
    }

    const sections = await prisma.section.findMany({
      where: { pageId },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        sectionType: true,
        title: true,
        titleEn: true,
        subtitle: true,
        subtitleEn: true,
        content: true,
        contentEn: true,
        sortOrder: true,
        settings: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return successResponse(sections);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/pages/[id]/sections - 創建頁面區塊
async function createPageSection(req: AuthenticatedRequest, pageId: string) {
  try {
    const ws = getWorkspaceFilter(req);
    // 檢查頁面是否存在且屬於當前工作區
    const page = await prisma.page.findFirst({
      where: { id: pageId, demoWorkspaceId: ws.demoWorkspaceId },
      select: { id: true },
    });

    if (!page) {
      return errorResponse("NOT_FOUND", "頁面不存在", 404);
    }

    const body = await req.json();
    const validatedData = createSectionSchema.parse(body);

    const section = await prisma.section.create({
      data: {
        ...validatedData,
        pageId,
      },
      select: {
        id: true,
        sectionType: true,
        title: true,
        titleEn: true,
        subtitle: true,
        subtitleEn: true,
        content: true,
        contentEn: true,
        sortOrder: true,
        settings: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return successResponse(section, "區塊創建成功");
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/pages/[id]/sections - 批量更新頁面區塊
async function updatePageSections(req: AuthenticatedRequest, pageId: string) {
  try {
    const ws = getWorkspaceFilter(req);
    // 檢查頁面是否存在且屬於當前工作區
    const page = await prisma.page.findFirst({
      where: { id: pageId, demoWorkspaceId: ws.demoWorkspaceId },
      select: { id: true },
    });

    if (!page) {
      return errorResponse("NOT_FOUND", "頁面不存在", 404);
    }

    const body = await req.json();
    const validatedSections = updateSectionsSchema.parse(body);

    // 使用事務處理批量更新
    const result = await prisma.$transaction(async (tx: any) => {
      // 刪除現有的所有區塊
      await tx.section.deleteMany({
        where: { pageId },
      });

      // 創建新的區塊
      const createdSections = [];
      for (const sectionData of validatedSections) {
        const { id, ...data } = sectionData;
        const section = await tx.section.create({
          data: {
            ...data,
            pageId,
          },
          select: {
            id: true,
            sectionType: true,
            title: true,
            titleEn: true,
            subtitle: true,
            subtitleEn: true,
            content: true,
            contentEn: true,
            sortOrder: true,
            settings: true,
            createdAt: true,
            updatedAt: true,
          },
        });
        createdSections.push(section);
      }

      return createdSections;
    });

    return successResponse(result, "區塊批量更新成功");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(
  request: NextRequest,
  context: { params?: RouteParams }
) {
  const pageId = await resolvePageId(context);
  if (!pageId) return errorResponse("BAD_REQUEST", "缺少頁面 id", 400);
  return withAuthOrDemo(request, (req) => getPageSections(req, pageId));
}

export async function POST(
  request: NextRequest,
  context: { params?: RouteParams }
) {
  const pageId = await resolvePageId(context);
  if (!pageId) return errorResponse("BAD_REQUEST", "缺少頁面 id", 400);
  return withAuthOrDemo(request, (req) => createPageSection(req, pageId));
}

export async function PUT(
  request: NextRequest,
  context: { params?: RouteParams }
) {
  const pageId = await resolvePageId(context);
  if (!pageId) return errorResponse("BAD_REQUEST", "缺少頁面 id", 400);
  return withAuthOrDemo(request, (req) => updatePageSections(req, pageId));
}
