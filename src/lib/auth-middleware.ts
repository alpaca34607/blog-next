import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken, verifyDemoToken } from './auth'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    name: string | null
    role: string
  }
  /** DEMO 訪客模式：有值表示為訪客，僅能操作該 workspace 的資料 */
  demoWorkspaceId?: string
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
        message: '您無權限執行此操作'
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
        message: '您無權限執行此操作'
      }
    }, { status: 401 })
  }

  // 將用戶資訊添加到 request
  const authenticatedRequest = request as AuthenticatedRequest
  authenticatedRequest.user = user

  return handler(authenticatedRequest)
}

/**
 * 支援管理員 JWT 或 DEMO 訪客 Token。
 * 管理員：request.user 有值；訪客：request.demoWorkspaceId 有值。
 */
export async function withAuthOrDemo(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const authHeader = request.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: '您無權限執行此操作'
      }
    }, { status: 401 })
  }

  const token = authHeader.substring(7)

  // 1. 先嘗試管理員 Token
  const user = await getUserFromToken(token)
  if (user) {
    const req = request as AuthenticatedRequest
    req.user = user
    return handler(req)
  }

  // 2. 再嘗試 DEMO Token
  const demoPayload = verifyDemoToken(token)
  if (demoPayload?.demoId) {
    const req = request as AuthenticatedRequest
    req.demoWorkspaceId = demoPayload.demoId
    return handler(req)
  }

  return NextResponse.json({
    success: false,
    error: {
      code: 'UNAUTHORIZED',
      message: '您無權限執行此操作'
    }
  }, { status: 401 })
}