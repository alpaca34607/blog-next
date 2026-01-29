import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from './auth'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    name: string | null
    role: string
  }
}

export async function withAuth(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const authHeader = request.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: '缺少認證令牌'
      }
    }, { status: 401 })
  }

  const token = authHeader.substring(7)
  const user = await getUserFromToken(token)

  if (!user) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: '無效的認證令牌'
      }
    }, { status: 401 })
  }

  // 將用戶資訊添加到 request
  const authenticatedRequest = request as AuthenticatedRequest
  authenticatedRequest.user = user

  return handler(authenticatedRequest)
}