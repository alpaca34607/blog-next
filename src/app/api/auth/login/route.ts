import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api-response'

const loginSchema = z.object({
  email: z.string().email('無效的郵件地址'),
  password: z.string().min(1, '密碼不能為空')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    // 查找用戶
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return errorResponse('UNAUTHORIZED', '郵件地址或密碼錯誤', 401)
    }

    // 驗證密碼
    if (!verifyPassword(password, user.password)) {
      return errorResponse('UNAUTHORIZED', '郵件地址或密碼錯誤', 401)
    }

    // 生成 JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    return successResponse({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    }, '登入成功')

  } catch (error) {
    console.error(error)
    return errorResponse('VALIDATION_ERROR', '資料驗證錯誤', 400, error)
  }
}