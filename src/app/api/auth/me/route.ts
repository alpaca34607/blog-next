import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/auth-middleware'
import { successResponse } from '@/lib/api-response'

export async function GET(request: NextRequest) {
  return withAuth(request, async (req) => {
    return successResponse(req.user, '獲取用戶資訊成功')
  })
}