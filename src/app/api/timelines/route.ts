import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth-middleware'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'
import { buildWhereClause, buildOrderBy, getPaginationParams, createPaginationResult } from '@/lib/query-utils'
import { z } from 'zod'

const createTimelineSchema = z.object({
  name: z.string().min(1, '時間軸名稱不能為空'),
  description: z.string().optional()
})

// GET /api/timelines - 獲取時間軸列表（管理用，支援分頁、搜尋、排序）
async function getTimelines(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || undefined
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

    const { skip, page: currentPage, limit: currentLimit } = getPaginationParams({ page, limit })

    const where = buildWhereClause(search, {}, ['name', 'description'])
    const orderBy = buildOrderBy(sortBy, sortOrder)

    const [timelines, total] = await Promise.all([
      prisma.timeline.findMany({
        where,
        orderBy,
        skip,
        take: currentLimit,
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              items: true
            }
          }
        }
      }),
      prisma.timeline.count({ where })
    ])

    const pagination = createPaginationResult(total, currentPage, currentLimit)

    return successResponse(timelines, undefined, pagination)
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/timelines - 創建時間軸
async function createTimeline(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createTimelineSchema.parse(body)

    const timeline = await prisma.timeline.create({
      data: validatedData,
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            items: true
          }
        }
      }
    })

    return successResponse(timeline, '時間軸創建成功')
  } catch (error) {
    return handleApiError(error)
  }
}

export const GET = (request: NextRequest) => withAuth(request, getTimelines)
export const POST = (request: NextRequest) => withAuth(request, createTimeline)