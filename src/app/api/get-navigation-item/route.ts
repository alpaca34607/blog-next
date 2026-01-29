import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-response'

// GET /api/get-navigation-item - 與前端現有接口相容
export async function GET() {
  try {
    // 獲取所有可見的導航項目，並構建層次結構
    const allItems = await prisma.navigation.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        title: true,
        titleEn: true,
        url: true,
        productCategory: true,
        type: true,
        isVisible: true,
        sortOrder: true,
        parentId: true,
        createdAt: true,
        updatedAt: true,
        children: {
          where: { isVisible: true },
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            title: true,
            titleEn: true,
            url: true,
            productCategory: true,
            type: true,
            isVisible: true,
            sortOrder: true,
            parentId: true,
            createdAt: true,
            updatedAt: true,
          }
        }
      }
    })

    // 過濾出頂層項目（沒有父項目的）
    const topLevelItems = allItems.filter((item: any) => !item.parentId)

    return successResponse(topLevelItems)
  } catch (error) {
    return errorResponse('INTERNAL_ERROR', '獲取導航選單失敗', 500)
  }
}