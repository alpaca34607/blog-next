import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET!

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10)
}

/** 是否為 bcrypt 雜湊（以 $2a$, $2b$, $2y$ 開頭） */
function isBcryptHash(stored: string): boolean {
  return /^\$2[aby]\$\d{2}\$/.test(stored)
}

/**
 * 驗證密碼：若資料庫存的是 bcrypt 雜湊則用 bcrypt 比對，否則視為明文比對。
 * 方便在 Prisma Studio 直接寫入明文密碼進行測試。
 */
export function verifyPassword(password: string, storedPassword: string): boolean {
  if (isBcryptHash(storedPassword)) {
    return bcrypt.compareSync(password, storedPassword)
  }
  return password === storedPassword
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export async function getUserFromToken(token: string) {
  const payload = verifyToken(token)
  if (!payload?.userId) return null

  return await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, name: true, role: true }
  })
}

// ----------------------------- DEMO 訪客 Token（24h 有效）-----------------------------
export interface DemoTokenPayload {
  demoId: string
  iat?: number
  exp?: number
}

export function generateDemoToken(demoId: string): string {
  return jwt.sign(
    { demoId } as DemoTokenPayload,
    JWT_SECRET,
    { expiresIn: '24h' }
  )
}

export function verifyDemoToken(token: string): DemoTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as DemoTokenPayload
  } catch {
    return null
  }
}