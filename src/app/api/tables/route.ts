import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, withAuthOrDemo } from '@/lib/auth-middleware'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'
import { buildWhereClause, buildOrderBy, getPaginationParams, createPaginationResult } from '@/lib/query-utils'
import { z } from 'zod'

const createTableSchema = z.object({
  name: z.string().min(1, '表格名稱不能為空'),
  description: z.string().optional(),
  columns: z.array(z.object({
    key: z.string(),
    label: z.string(),
    type: z.string()
  })).min(1, '至少需要一個欄位')
})

// GET /api/tables - 獲取表格列表（管理用，支援分頁、搜尋、排序）
async function getTables(request: NextRequest) {
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

    const [tables, total] = await Promise.all([
      prisma.table.findMany({
        where,
        orderBy,
        skip,
        take: currentLimit,
        select: {
          id: true,
          name: true,
          description: true,
          columns: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              rows: true
            }
          }
        }
      }),
      prisma.table.count({ where })
    ])

    const pagination = createPaginationResult(total, currentPage, currentLimit)

    return successResponse(tables, undefined, pagination)
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/tables - 創建表格
async function createTable(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createTableSchema.parse(body)

    const table = await prisma.table.create({
      data: validatedData,
      select: {
        id: true,
        name: true,
        description: true,
        columns: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            rows: true
          }
        }
      }
    })

    return successResponse(table, '表格創建成功')
  } catch (error) {
    return handleApiError(error)
  }
}

export const GET = (request: NextRequest) => withAuthOrDemo(request, getTables)
export const POST = (request: NextRequest) => withAuth(request, createTable)