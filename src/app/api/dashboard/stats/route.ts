import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth-middleware'
import { successResponse, handleApiError } from '@/lib/api-response'

// GET /api/dashboard/stats - 獲取儀表板統計資料
async function getDashboardStats(request: NextRequest) {
  try {
    // 並行獲取所有統計資料
    const [
      totalPages,
      totalNews,
      totalProducts,
      totalTables,
      totalTimelines,
      publishedNews,
      publishedPages
    ] = await Promise.all([
      // 總頁面數
      prisma.page.count(),
      // 總新聞數
      prisma.news.count(),
      // 產品頁面數 (type = 'product')
      prisma.page.count({ where: { type: 'product' } }),
      // 總表格數
      prisma.table.count(),
      // 總時間軸數
      prisma.timeline.count(),
      // 已發布新聞數
      prisma.news.count({ where: { isPublished: true } }),
      // 已發布頁面數
      prisma.page.count({ where: { isPublished: true } })
    ])

    // 獲取最新新聞 (最近5篇已發布的)
    const latestNews = await prisma.news.findMany({
      where: { isPublished: true },
      orderBy: { publishDate: 'desc' },
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
  } catch (error) {
    return handleApiError(error)
  }
}

export const GET = (request: NextRequest) => withAuth(request, getDashboardStats)