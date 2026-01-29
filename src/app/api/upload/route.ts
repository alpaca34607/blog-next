import { NextRequest } from 'next/server'
import { randomUUID } from 'crypto'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { NodeHttpHandler } from '@smithy/node-http-handler'
import https from 'https'
import { withAuth } from '@/lib/auth-middleware'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'

export const runtime = 'nodejs'

// 驗證檔案類型
function isValidFileType(mimeType: string, allowedTypes: string[]): boolean {
  return allowedTypes.some(type => {
    if (type.includes('*')) {
      return mimeType.startsWith(type.replace('*', ''))
    }
    return mimeType === type
  })
}

// 取得副檔名（不含點），並轉為小寫
function getFileExt(filename: string): string {
  const ext = filename.split('.').pop() || ''
  return ext.trim().toLowerCase()
}

// 驗證是否允許上傳（同時考慮 mimeType 與副檔名）
function isAllowedUpload(file: File): boolean {
  // 允許的 mimeType（含萬用字元）
  const allowedMimeTypes = [
    'image/*',
    'application/pdf',
    'text/*',
    // Office
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-powerpoint', // .ppt
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    // 壓縮檔
    'application/zip', // .zip
    'application/x-zip-compressed', // .zip (常見於 Windows)
    'application/x-rar-compressed', // .rar
    'application/vnd.rar', // .rar
  ]

  // 允許的副檔名（避免瀏覽器/作業系統回傳不穩定的 mimeType）
  const allowedExts = new Set([
    // images
    'jpg',
    'jpeg',
    'png',
    'gif',
    'webp',
    // docs
    'pdf',
    'txt',
    'doc',
    'docx',
    'xls',
    'xlsx',
    'ppt',
    'pptx',
    // archives
    'zip',
    'rar',
  ])

  const ext = getFileExt(file.name)
  const extAllowed = allowedExts.has(ext)
  if (!extAllowed) return false

  // mimeType 正常時用 mimeType 判斷；若是 octet-stream（常見於某些環境），則以副檔名為準
  const mimeType = (file.type || '').trim().toLowerCase()
  if (mimeType === '' || mimeType === 'application/octet-stream') return true

  return isValidFileType(mimeType, allowedMimeTypes)
}

// 產生唯一的檔案名稱
function generateUniqueFileName(originalName: string): string {
  const ext = originalName.split('.').pop() || ''
  const uuid = randomUUID()
  return `${uuid}.${ext}`
}

function getRequiredEnv(name: string): string {
  const value = (process.env[name] || '').trim()
  if (!value) {
    throw new Error(`缺少環境變數：${name}`)
  }
  return value
}

function stripTrailingSlashes(input: string): string {
  return input.replace(/\/+$/, '')
}

function buildObjectUrl(params: { baseUrl: string; bucket: string; key: string }): string {
  const base = stripTrailingSlashes(params.baseUrl)
  const bucket = params.bucket.replace(/^\/+|\/+$/g, '')
  const key = params.key.replace(/^\/+/g, '')
  return `${base}/${bucket}/${key}`
}

function createS3Client(): S3Client {
  const region = getRequiredEnv('S3_REGION')
  const endpoint = getRequiredEnv('S3_ENDPOINT')
  const accessKeyId = getRequiredEnv('S3_ACCESS_KEY_ID')
  const secretAccessKey = getRequiredEnv('S3_SECRET_ACCESS_KEY')

  const insecureTls =
    (process.env.S3_INSECURE_TLS || '').trim().toLowerCase() === 'true' ||
    (process.env.S3_INSECURE_TLS || '').trim() === '1'

  return new S3Client({
    region,
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
    // S3 相容服務（例如 MinIO/LocalStack）通常需要 path-style
    forcePathStyle: true,
    ...(insecureTls
      ? {
          // 允許自簽憑證（僅建議用於測試環境）
          requestHandler: new NodeHttpHandler({
            httpsAgent: new https.Agent({ rejectUnauthorized: false }),
          }),
        }
      : {}),
  })
}

// POST /api/upload - 上傳檔案
async function uploadFile(request: NextRequest) {
  try {
    const s3Client = createS3Client()
    const bucket = getRequiredEnv('S3_BUCKET')
    const urlBase = ((process.env.S3_PUBLIC_BASE_URL || '') as string).trim() || getRequiredEnv('S3_ENDPOINT')

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const file = formData.get('file') as File | null

    if (!files.length && !file) {
      return errorResponse('VALIDATION_ERROR', '沒有檔案被上傳', 400)
    }

    const uploadedFiles: { filename: string; url: string; size: number; mimeType: string }[] = []

    // 處理單個檔案上傳
    if (file && !files.length) {
      if (!isAllowedUpload(file)) {
        return errorResponse('VALIDATION_ERROR', '不支援的檔案類型', 400)
      }

      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        return errorResponse('VALIDATION_ERROR', '檔案大小超過限制 (10MB)', 400)
      }

      const filename = generateUniqueFileName(file.name)
      const key = `uploads/${filename}`
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: buffer,
          ContentType: (file.type || 'application/octet-stream').trim(),
        })
      )

      const url = buildObjectUrl({ baseUrl: urlBase, bucket, key })
      uploadedFiles.push({
        filename,
        url,
        size: file.size,
        mimeType: file.type
      })
    }

    // 處理多檔案上傳
    if (files.length > 0) {
      const maxFiles = 10
      if (files.length > maxFiles) {
        return errorResponse('VALIDATION_ERROR', `最多只能上傳 ${maxFiles} 個檔案`, 400)
      }

      for (const file of files) {
        if (!isAllowedUpload(file)) {
          return errorResponse('VALIDATION_ERROR', '不支援的檔案類型', 400)
        }

        const maxSize = 10 * 1024 * 1024 // 10MB
        if (file.size > maxSize) {
          return errorResponse('VALIDATION_ERROR', '檔案大小超過限制 (10MB)', 400)
        }

        const filename = generateUniqueFileName(file.name)
        const key = `uploads/${filename}`
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        await s3Client.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: buffer,
            ContentType: (file.type || 'application/octet-stream').trim(),
          })
        )

        const url = buildObjectUrl({ baseUrl: urlBase, bucket, key })
        uploadedFiles.push({
          filename,
          url,
          size: file.size,
          mimeType: file.type
        })
      }
    }

    if (uploadedFiles.length === 1) {
      return successResponse({
        filename: uploadedFiles[0].filename,
        url: uploadedFiles[0].url,
        size: uploadedFiles[0].size,
        mimeType: uploadedFiles[0].mimeType
      }, '檔案上傳成功')
    } else {
      return successResponse({
        files: uploadedFiles
      }, `${uploadedFiles.length} 個檔案上傳成功`)
    }
  } catch (error) {
    return handleApiError(error)
  }
}

export const POST = (request: NextRequest) => withAuth(request, uploadFile)