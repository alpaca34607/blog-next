import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-response'

// GET /api/get-products - 與前端現有接口相容
// 支援 ?UUID=xxx：合併正式 + 該 DEMO 工作區的產品
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const demoUuid = searchParams.get('UUID') || searchParams.get('uuid') || ''

    const whereBase = { type: 'product', isPublished: true }
    const [officialProducts, demoProducts] = await Promise.all([
      prisma.page.findMany({
        where: { ...whereBase, demoWorkspaceId: '' },
        orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        title: true,
        titleEn: true,
        slug: true,
        type: true,
        metaTitle: true,
        metaTitleEn: true,
        metaDescription: true,
        metaDescriptionEn: true,
        isPublished: true,
        logo: true,
        externalUrl: true,
        category: true,
        categoryEn: true,
        sortOrder: true,
        videoUrl: true,
        introImage: true,
        introImageEn: true,
        isFeatured: true,
        heroTitle: true,
        heroTitleEn: true,
        heroSubtitle: true,
        heroSubtitleEn: true,
        heroImages: true,
        createdAt: true,
        updatedAt: true
      }
    }),
      demoUuid
        ? prisma.page.findMany({
            where: { ...whereBase, demoWorkspaceId: demoUuid },
            orderBy: { sortOrder: 'asc' },
            select: {
              id: true,
              title: true,
              titleEn: true,
              slug: true,
              type: true,
              metaTitle: true,
              metaTitleEn: true,
              metaDescription: true,
              metaDescriptionEn: true,
              isPublished: true,
              logo: true,
              externalUrl: true,
              category: true,
              categoryEn: true,
              sortOrder: true,
              videoUrl: true,
              introImage: true,
              introImageEn: true,
              isFeatured: true,
              heroTitle: true,
              heroTitleEn: true,
              heroSubtitle: true,
              heroSubtitleEn: true,
              heroImages: true,
              createdAt: true,
              updatedAt: true
            }
          })
        : []
    ])

    const products = [...officialProducts, ...demoProducts].sort(
      (a, b) => a.sortOrder - b.sortOrder
    )

    return successResponse(products)
  } catch (error) {
    return errorResponse('INTERNAL_ERROR', '獲取產品列表失敗', 500)
  }
}