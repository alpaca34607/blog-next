import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuthOrDemo } from '@/lib/auth-middleware'
import { getWorkspaceFilter, getWorkspaceFilterForList } from '@/lib/demo-utils'
import type { AuthenticatedRequest } from '@/lib/auth-middleware'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'
import { buildWhereClause, buildOrderBy, getPaginationParams, createPaginationResult } from '@/lib/query-utils'
import { z } from 'zod'

const createNewsSchema = z.object({
  title: z.string().min(1, '標題不能為空'),
  titleEn: z.string().optional(),
  slug: z.string().min(1, 'Slug不能為空'),
  excerpt: z.string().optional(),
  excerptEn: z.string().optional(),
  content: z.string().min(1, '內容不能為空'),
  contentEn: z.string().optional(),
  category: z.string().optional(),
  categoryEn: z.string().optional(),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  featuredImage: z.string().optional(),
  publishDate: z.string().datetime().optional()
})

// GET /api/news - 獲取新聞列表（管理用，支援分頁、搜尋、排序）
async function getNews(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || undefined
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

    // 解析篩選條件
    const filter: Record<string, any> = {}
    searchParams.forEach((value, key) => {
      if (key.startsWith('filter[') && key.endsWith(']')) {
        const filterKey = key.slice(7, -1)
        if (value === 'true') filter[filterKey] = true
        else if (value === 'false') filter[filterKey] = false
        else filter[filterKey] = value
      }
    })

    const { skip, page: currentPage, limit: currentLimit } = getPaginationParams({ page, limit })

    const where = {
      ...buildWhereClause(search, filter, ['title', 'content', 'category']),
      ...getWorkspaceFilterForList(req),
    }
    const orderBy = buildOrderBy(sortBy, sortOrder)

    const [news, total] = await Promise.all([
      prisma.news.findMany({
        where,
        orderBy,
        skip,
        take: currentLimit,
        select: {
          id: true,
          demoWorkspaceId: true,
          title: true,
          titleEn: true,
          slug: true,
          excerpt: true,
          excerptEn: true,
          content: true,
          contentEn: true,
          category: true,
          categoryEn: true,
          isPublished: true,
          isFeatured: true,
          featuredImage: true,
          publishDate: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.news.count({ where })
    ])

    const pagination = createPaginationResult(total, currentPage, currentLimit)

    return successResponse(news, undefined, pagination)
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/news - 創建新聞
async function createNews(req: AuthenticatedRequest) {
  try {
    const body = await req.json()
    const validatedData = createNewsSchema.parse(body)
    const { demoWorkspaceId } = getWorkspaceFilter(req)

    // 檢查 slug 是否重複（同一工作區內）
    const existingNews = await prisma.news.findUnique({
      where: { slug_demoWorkspaceId: { slug: validatedData.slug, demoWorkspaceId } }
    })

    if (existingNews) {
      return errorResponse('CONFLICT', 'Slug 已存在', 409)
    }

    const news = await prisma.news.create({
      data: {
        ...validatedData,
        demoWorkspaceId,
        publishDate: validatedData.publishDate ? new Date(validatedData.publishDate) : undefined
      },
      select: {
        id: true,
        title: true,
        titleEn: true,
        slug: true,
        excerpt: true,
        excerptEn: true,
        content: true,
        contentEn: true,
        category: true,
        categoryEn: true,
        isPublished: true,
        isFeatured: true,
        featuredImage: true,
        publishDate: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return successResponse(news, '新聞創建成功')
  } catch (error) {
    return handleApiError(error)
  }
}

export const GET = (request: NextRequest) => withAuthOrDemo(request, getNews)
export const POST = (request: NextRequest) => withAuthOrDemo(request, createNews)