import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// 在 Serverless 環境（Vercel）中，若不快取實例，每次 API 呼叫都會建立新的
// PrismaClient 並開啟新的資料庫連線，容易耗盡 AWS RDS 的連線上限。
// 因此不論環境皆快取至 globalThis，避免重複建立連線池。
export const prisma = globalForPrisma.prisma ?? new PrismaClient()

globalForPrisma.prisma = prisma