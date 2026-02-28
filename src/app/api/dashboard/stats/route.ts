import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuthOrDemo } from '@/lib/auth-middleware'
import { getWorkspaceFilter } from '@/lib/demo-utils'
import type { AuthenticatedRequest } from '@/lib/auth-middleware'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'

// GET /api/dashboard/stats - 獲取儀表板統計資料
async function getDashboardStats(req: AuthenticatedRequest) {
  try {
    const ws = getWorkspaceFilter(req)
    const pageNewsWhere = { demoWorkspaceId: ws.demoWorkspaceId }

    // DEMO 模式：僅統計 pages/news；正式：含 tables/timelines
    const tablesCount = ws.demoWorkspaceId ? Promise.resolve(0) : prisma.table.count()
    const timelinesCount = ws.demoWorkspaceId ? Promise.resolve(0) : prisma.timeline.count()

    const [
      totalPages,
      totalNews,
      totalProducts,
      totalTables,
      totalTimelines,
      publishedNews,
      publishedPages
    ] = await Promise.all([
      prisma.page.count({ where: pageNewsWhere }),
      prisma.news.count({ where: pageNewsWhere }),
      prisma.page.count({ where: { ...pageNewsWhere, type: 'product' } }),
      tablesCount,
      timelinesCount,
      prisma.news.count({ where: { ...pageNewsWhere, isPublished: true } }),
      prisma.page.count({ where: { ...pageNewsWhere, isPublished: true } })
    ])

    // 獲取最新新聞 (最近5篇已發布的)
    const latestNews = await prisma.news.findMany({
      where: { ...pageNewsWhere, isPublished: true },
      orderBy: [{ publishDate: 'desc' }, { id: 'desc' }],
      take: 5,
      select: {
        id: true,
        title: true,
        category: true,
        publishDate: true,
        featuredImage: true
      }
    })

    const stats = {
      overview: {
        totalPages,
        totalNews,
        totalProducts,
        totalTables,
        totalTimelines,
        publishedNews,
        publishedPages
      },
      latestNews: latestNews.map((news: any) => ({
        id: news.id,
        title: news.title,
        category: news.category || '未分類',
        date: news.publishDate?.toISOString().split('T')[0] || '',
        thumbnail: news.featuredImage || '/images/news/default.png'
      }))
    }

    return successResponse(stats)
  } catch (error: any) {
    console.error('[dashboard/stats] error:', error)
    // 開發時回傳詳細錯誤以便除錯
    if (process.env.NODE_ENV === 'development') {
      return errorResponse(
        'INTERNAL_ERROR',
        error?.message || '伺服器錯誤',
        500,
        { code: error?.code, meta: error?.meta }
      )
    }
    return handleApiError(error)
  }
}

export const GET = (request: NextRequest) => withAuthOrDemo(request, getDashboardStats)