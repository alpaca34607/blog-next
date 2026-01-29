/**
 * 將資料庫中的明文密碼轉換成 bcrypt hash
 * 
 * 使用方法：
 * 1. 轉換所有明文密碼：node scripts/hash-passwords.mjs
 * 2. 轉換特定用戶：node scripts/hash-passwords.mjs --email admin-test@gmail.com
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// 檢查字串是否已經是 bcrypt hash（bcrypt hash 通常以 $2a$, $2b$, $2y$ 開頭）
function isBcryptHash(str) {
  return /^\$2[ayb]\$.{56}$/.test(str)
}

async function hashPasswords(email) {
  try {
    console.log('開始轉換密碼...\n')

    // 取得要處理的用戶
    const users = email
      ? [await prisma.user.findUnique({ where: { email } })]
      : await prisma.user.findMany()

    const usersToProcess = users.filter(Boolean)

    if (usersToProcess.length === 0) {
      console.log('找不到要處理的用戶')
      return
    }

    let updatedCount = 0
    let skippedCount = 0

    for (const user of usersToProcess) {
      // 檢查密碼是否已經是 hash
      if (isBcryptHash(user.password)) {
        console.log(`✓ ${user.email} - 密碼已經是 hash，跳過`)
        skippedCount++
        continue
      }

      // 將明文密碼轉換成 hash
      const hashedPassword = bcrypt.hashSync(user.password, 10)
      
      // 更新資料庫
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      })

      console.log(`✓ ${user.email} - 密碼已轉換成 hash`)
      updatedCount++
    }

    console.log(`\n完成！`)
    console.log(`- 已更新: ${updatedCount} 個用戶`)
    console.log(`- 已跳過: ${skippedCount} 個用戶（已經是 hash）`)

  } catch (error) {
    console.error('轉換密碼時發生錯誤:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// 解析命令列參數
const args = process.argv.slice(2)
const emailIndex = args.indexOf('--email')
const email = emailIndex !== -1 && args[emailIndex + 1] ? args[emailIndex + 1] : undefined

hashPasswords(email)
