import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth-middleware'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'

const siteSettingsSchema = z.object({
  siteName: z.string().min(1, '網站名稱不能為空'),
  siteNameEn: z.string().optional(),
  logo: z.string().optional(),
  footerLogo: z.string().optional(),
  copyright: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  contactTime: z.string().optional(),
  address: z.string().optional(),
  lineQrCode: z.string().optional(),
  socialLinks: z.record(z.string(), z.string()).optional(),
  additionalLinks: z.array(z.object({
    title: z.string(),
    url: z.string()
  })).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  contactImage: z.string().optional(),
  contactBanner: z.string().optional()
})

// GET /api/site-settings - 獲取網站設定（公開）
export async function GET() {
  try {
    const settings = await prisma.siteSettings.findFirst()

    if (!settings) {
      return errorResponse('NOT_FOUND', '網站設定不存在', 404)
    }

    return successResponse(settings, '獲取網站設定成功')
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT /api/site-settings - 更新網站設定（需要認證）
export async function PUT(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const body = await request.json()
      const data = siteSettingsSchema.parse(body)

      const settings = await prisma.siteSettings.upsert({
        where: { id: 'default' }, // 使用固定 ID，因為只有一個設定
        update: data,
        create: { id: 'default', ...data }
      })

      return successResponse(settings, '更新網站設定成功')
    } catch (error) {
      return handleApiError(error)
    }
  })
}