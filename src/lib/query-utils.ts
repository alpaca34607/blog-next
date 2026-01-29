export interface QueryParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  filter?: Record<string, any>
}

export interface PaginationResult {
  page: number
  limit: number
  total: number
  totalPages: number
}

export function buildWhereClause(
  search?: string,
  filter?: Record<string, any>,
  searchFields: string[] = []
): any {
  const where: any = {}

  // 處理篩選條件
  if (filter) {
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        where[key] = value
      }
    })
  }

  // 處理搜尋
  if (search && searchFields.length > 0) {
    where.OR = searchFields.map(field => ({
      [field]: {
        contains: search,
        mode: 'insensitive'
      }
    }))
  }

  return where
}

export function buildOrderBy(
  sortBy?: string,
  sortOrder: 'asc' | 'desc' = 'desc'
): any[] {
  if (!sortBy) return [{ createdAt: 'desc' }]

  return [{
    [sortBy]: sortOrder
  }]
}

export function getPaginationParams(params: QueryParams) {
  const page = Math.max(1, params.page || 1)
  const limit = Math.min(100, Math.max(1, params.limit || 10))
  const skip = (page - 1) * limit

  return { page, limit, skip }
}

export function createPaginationResult(
  total: number,
  page: number,
  limit: number
): PaginationResult {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  }
}