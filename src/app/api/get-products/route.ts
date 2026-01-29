import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-response'

// GET /api/get-products - 與前端現有接口相容
export async function GET() {
  try {
    const products = await prisma.page.findMany({
      where: {
        type: 'product',
        isPublished: true
      },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        title: true,
        slug: true,
        type: true,
        metaTitle: true,
        metaDescription: true,
        isPublished: true,
        logo: true,
        externalUrl: true,
        category: true,
        sortOrder: true,
        videoUrl: true,
        introImage: true,
        isFeatured: true,
        heroTitle: true,
        heroSubtitle: true,
        heroImages: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return successResponse(products)
  } catch (error) {
    return errorResponse('INTERNAL_ERROR', '獲取產品列表失敗', 500)
  }
}