import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-response'

// GET /api/get-navigation-item - 與前端現有接口相容
// 支援 ?UUID=xxx：合併正式 + 該 DEMO 工作區的導覽
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const demoUuid = searchParams.get('UUID') || searchParams.get('uuid') || ''

    const whereBase = { isVisible: true }
    const whereOfficial = { ...whereBase, demoWorkspaceId: '' }
    const whereDemo = demoUuid ? { ...whereBase, demoWorkspaceId: demoUuid } : null

    // 正式導覽
    const officialItems = await prisma.navigation.findMany({
      where: whereOfficial,
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

    let topLevelItems = officialItems.filter((item: any) => !item.parentId)

    // 若有 UUID，合併 DEMO 導覽
    if (whereDemo) {
      const demoItems = await prisma.navigation.findMany({
        where: whereDemo,
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
      const demoTopLevel = demoItems.filter((item: any) => !item.parentId)
      topLevelItems = [...topLevelItems, ...demoTopLevel]
    }

    return successResponse(topLevelItems)
  } catch (error) {
    return errorResponse('INTERNAL_ERROR', '獲取導航選單失敗', 500)
  }
}