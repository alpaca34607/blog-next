# Server-side API 架構設計

## 概述

基於現有 localStorage 架構，設計完整的 server-side API，使用 Prisma + PostgreSQL，支援 CRUD、分頁、搜尋、排序，並與前端接口相容。

## 1. Prisma Schema 設計

### 資料庫實體

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String?
  role      String   @default("admin")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

model SiteSettings {
  id          String   @id @default(cuid())
  siteName    String
  siteNameEn  String?
  logo        String?
  footerLogo  String?
  copyright   String?
  phone       String?
  email       String?
  contactTime String?
  address     String?
  lineQrCode  String?
  socialLinks Json?    // {facebook: string, line: string, youtube: string}
  additionalLinks Json? // [{title: string, url: string}]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("site_settings")
}

model Navigation {
  id          String      @id @default(cuid())
  title       String
  titleEn     String?
  url         String?
  type        String      @default("internal") // internal | external
  isVisible   Boolean     @default(true)
  sortOrder   Int         @default(0)
  parentId    String?
  parent      Navigation? @relation("NavigationHierarchy", fields: [parentId], references: [id], onDelete: Cascade)
  children    Navigation[] @relation("NavigationHierarchy")
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@map("navigation")
}

model Page {
  id          String    @id @default(cuid())
  title       String
  slug        String    @unique
  type        String    @default("page") // page | product
  content     String?
  metaTitle   String?
  metaDescription String?
  isPublished Boolean   @default(false)
  logo        String?   // for product pages
  externalUrl String?   // for product pages
  category    String?   // for product pages
  sortOrder   Int       @default(0)
  sections    Section[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@map("pages")
}

model Section {
  id          String   @id @default(cuid())
  pageId      String
  page        Page     @relation(fields: [pageId], references: [id], onDelete: Cascade)
  sectionType String   // hero, icon_features, image_text, etc.
  title       String?
  subtitle    String?
  content     String?
  sortOrder   Int      @default(0)
  settings    Json?    // flexible settings based on section type
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("sections")
}

model News {
  id            String   @id @default(cuid())
  title         String
  slug          String   @unique
  excerpt       String?
  content       String
  category      String?
  isPublished   Boolean  @default(false)
  isFeatured    Boolean  @default(false)
  featuredImage String?
  publishDate   DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@map("news")
}

model Table {
  id          String      @id @default(cuid())
  name        String
  description String?
  columns     Json        // [{key: string, label: string, type: string}]
  rows        TableRow[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@map("tables")
}

model TableRow {
  id          String   @id @default(cuid())
  tableId     String
  table       Table    @relation(fields: [tableId], references: [id], onDelete: Cascade)
  data        Json     // {columnKey: value}
  sortOrder   Int      @default(0)
  isVisible   Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("table_rows")
}

model Timeline {
  id          String          @id @default(cuid())
  name        String
  description String?
  items       TimelineItem[]
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  @@map("timelines")
}

model TimelineItem {
  id        String   @id @default(cuid())
  timelineId String
  timeline  Timeline @relation(fields: [timelineId], references: [id], onDelete: Cascade)
  title     String
  content   String?
  image     String?
  year      String?
  sortOrder Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("timeline_items")
}
```

## 2. API Routes 結構

使用 Next.js App Router API routes：

```
src/app/api/
├── auth/
│   ├── login/
│   │   └── route.ts          # POST /api/auth/login
│   └── me/
│       └── route.ts          # GET /api/auth/me
├── site-settings/
│   └── route.ts              # GET, PUT /api/site-settings
├── navigation/
│   └── route.ts              # GET, POST /api/navigation
├── navigation/[id]/
│   └── route.ts              # GET, PUT, DELETE /api/navigation/[id]
├── pages/
│   └── route.ts              # GET, POST /api/pages
├── pages/[id]/
│   ├── route.ts              # GET, PUT, DELETE /api/pages/[id]
│   └── sections/
│       └── route.ts          # GET, POST /api/pages/[id]/sections
├── pages/[id]/sections/[sectionId]/
│   └── route.ts              # GET, PUT, DELETE /api/pages/[id]/sections/[sectionId]
├── news/
│   └── route.ts              # GET, POST /api/news
├── news/[id]/
│   └── route.ts              # GET, PUT, DELETE /api/news/[id]
├── tables/
│   └── route.ts              # GET, POST /api/tables
├── tables/[id]/
│   ├── route.ts              # GET, PUT, DELETE /api/tables/[id]
│   └── rows/
│       └── route.ts          # GET, POST /api/tables/[id]/rows
├── tables/[id]/rows/[rowId]/
│   └── route.ts              # GET, PUT, DELETE /api/tables/[id]/rows/[rowId]
├── timelines/
│   └── route.ts              # GET, POST /api/timelines
├── timelines/[id]/
│   ├── route.ts              # GET, PUT, DELETE /api/timelines/[id]
│   └── items/
│       └── route.ts          # GET, POST /api/timelines/[id]/items
├── timelines/[id]/items/[itemId]/
│   └── route.ts              # GET, PUT, DELETE /api/timelines/[id]/items/[itemId]
└── upload/
    ├── image/
    │   └── route.ts          # POST /api/upload/image
    └── images/
        └── route.ts          # POST /api/upload/images
```

## 3. 認證機制設計

### JWT 認證流程

1. **登入 API** (`POST /api/auth/login`)
   - 請求: `{email: string, password: string}`
   - 驗證用戶憑證
   - 生成 JWT token (包含 user id, email, role)
   - 回應: `{token: string, user: User}`

2. **Middleware 認證**
   - 檢查 Authorization header: `Bearer {token}`
   - 驗證 JWT token
   - 將用戶資訊注入 request

3. **受保護路由**
   - 所有管理 API 都需要認證
   - 前端 API (get-site-settings, get-navigation-item 等) 不需要認證

### JWT Payload 結構

```typescript
{
  userId: string,
  email: string,
  role: string,
  iat: number,
  exp: number
}
```

## 4. 錯誤處理和響應格式

### 統一響應格式

```typescript
// 成功響應
{
  success: true,
  data: T,
  message?: string
}

// 錯誤響應
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any
  }
}

// 分頁響應
{
  success: true,
  data: T[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

### 錯誤代碼

- `VALIDATION_ERROR`: 資料驗證錯誤
- `UNAUTHORIZED`: 未認證
- `FORBIDDEN`: 權限不足
- `NOT_FOUND`: 資源不存在
- `CONFLICT`: 資源衝突
- `INTERNAL_ERROR`: 伺服器錯誤

### 錯誤處理 Middleware

```typescript
// middleware/error-handler.ts
export function handleApiError(error: any) {
  if (error instanceof PrismaClientKnownRequestError) {
    // 處理資料庫錯誤
  }
  if (error instanceof ZodError) {
    // 處理驗證錯誤
  }
  // 通用錯誤處理
}
```

## 5. CRUD 操作和查詢功能

### 通用查詢參數

```typescript
interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filter?: Record<string, any>;
}
```

### 支援的功能

- **分頁**: `?page=1&limit=10`
- **搜尋**: `?search=關鍵字`
- **排序**: `?sortBy=createdAt&sortOrder=desc`
- **篩選**: `?filter[isPublished]=true`

### 範例 API 端點

#### GET /api/news
```typescript
// 支援查詢參數
GET /api/news?page=1&limit=9&search=資安&sortBy=publishDate&sortOrder=desc&filter[category]=新聞
```

#### GET /api/pages
```typescript
// 產品列表
GET /api/pages?filter[type]=product&sortBy=sortOrder&sortOrder=asc
```

## 6. 圖片上傳 API

### POST /api/upload/image
- **Content-Type**: `multipart/form-data`
- **Body**: `image: File`
- **回應**: `{success: true, url: string}`

### POST /api/upload/images
- **Content-Type**: `multipart/form-data`
- **Body**: `images: File[]`
- **回應**: `{success: true, urls: string[]}`

### 實現細節
- 使用 multer 或類似庫處理檔案上傳
- 儲存到本地 public/images 或雲端儲存
- 生成唯一檔案名稱
- 回傳相對 URL

## 7. 遷移策略

### 階段性遷移

#### Phase 1: 雙重儲存
- 同時寫入 localStorage 和資料庫
- API 優先從資料庫讀取，fallback 到 localStorage
- 確保前端相容性

#### Phase 2: 資料遷移
- 建立遷移腳本從 localStorage 匯入資料庫
- 驗證資料完整性
- 逐步切換到資料庫優先

#### Phase 3: 清理
- 移除 localStorage 相關程式碼
- 優化 API 效能

### 遷移腳本

```typescript
// scripts/migrate-data.ts
async function migrateSiteSettings() {
  const localData = localStorage.getItem('siteSettings');
  if (localData) {
    await prisma.siteSettings.create({ data: JSON.parse(localData) });
  }
}

// 類似遷移其他資料
```

## 8. 與前端接口相容性

### 保持現有 API 接口

- `GET /api/get-site-settings` → 從資料庫獲取
- `GET /api/get-navigation-item` → 從資料庫獲取，支援階層結構
- `GET /api/get-products` → 從 pages 表篩選 type="product"
- `GET /api/get-news` → 從 news 表獲取已發布文章

### 新增管理 API

- 管理介面使用新的 RESTful API
- 前端管理頁面調整為呼叫 server API 而非操作 localStorage

## 9. 效能優化

### 快取策略
- Redis 快取常用資料 (網站設定、導航)
- API 回應快取
- 圖片 CDN

### 資料庫優化
- 適當的索引
- 分頁查詢優化
- N+1 查詢問題解決

## 10. 安全性考量

### API 安全
- JWT token 驗證
- CORS 設定
- Rate limiting
- Input sanitization

### 資料安全
- SQL injection 防護 (Prisma 內建)
- XSS 防護
- 檔案上傳安全檢查

## 11. 部署和環境配置

### 環境變數
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
NEXTAUTH_SECRET=...
CLOUDINARY_URL=... # 或其他儲存服務
```

### 部署步驟
1. 設定資料庫
2. 執行 Prisma migrations
3. 執行資料遷移腳本
4. 部署應用程式

## 12. 測試策略

### API 測試
- Unit tests for route handlers
- Integration tests for database operations
- E2E tests for critical flows

### 工具
- Jest + Supertest for API testing
- Prisma test database
- Postman/Newman for API documentation and testing