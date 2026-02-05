# 待實現 API 端點規格文檔

本文檔詳細列出 Blogcraft 項目中需要實現的所有 API 端點規格，基於後台管理功能和前端需求分析。目前所有管理功能均通過前端 localStorage 實現，需轉換為後端 API 調用。

## 概述

本項目採用前端驅動架構轉向後端 API 架構，所有資料操作需要通過 REST API 實現。支援 JWT Bearer Token 認證，統一的錯誤處理和回應格式。

## API 端點列表

### 1. 用戶認證 API

#### POST /api/auth/login

- **功能描述**: 用戶登入認證
- **請求方式**: POST
- **認證**: 不需要
- **請求格式**: JSON
- **回應格式**: JSON

**請求範例**:

```json
{
  "username": "admin",
  "password": "password123"
}
```

**回應範例**:

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-001",
    "username": "admin",
    "role": "admin"
  }
}
```

#### POST /api/auth/refresh

- **功能描述**: 刷新 JWT Token
- **請求方式**: POST
- **認證**: 需要 Bearer Token
- **回應格式**: JSON

### 2. 網站設定管理 API

#### GET /api/site-settings

- **功能描述**: 獲取網站設定 (管理員用)
- **請求方式**: GET
- **認證**: 需要 Bearer Token
- **回應格式**: JSON

#### PUT /api/site-settings

- **功能描述**: 更新網站設定
- **請求方式**: PUT
- **認證**: 需要 Bearer Token
- **請求格式**: JSON
- **回應格式**: JSON

**請求範例**:

```json
{
  "siteName": "Blogcraft",
  "siteNameEn": "Blogcraft",
  "logo": "base64_encoded_image",
  "footerLogo": "base64_encoded_image",
  "copyright": "© 2024 Blogcraft. All rights reserved.",
  "phone": "+886-2-1234-5678",
  "email": "contact@blogcraft.com",
  "contactTime": "週一至週五 09:00-18:00",
  "address": "台北市信義區...",
  "lineQrCode": "base64_encoded_qrcode",
  "socialLinks": {
    "facebook": "https://facebook.com/blogcraft",
    "line": "https://line.me/ti/p/OD4fPP6GtD",
    "youtube": "https://youtube.com/blogcraft"
  },
  "additionalLinks": [
    {
      "title": "隱私權政策",
      "url": "/privacy"
    }
  ]
}
```

### 3. 導航選單管理 API

#### GET /api/navigation

- **功能描述**: 獲取所有導航項目 (管理員用)
- **請求方式**: GET
- **認證**: 需要 Bearer Token
- **回應格式**: JSON

#### POST /api/navigation

- **功能描述**: 新增導航項目
- **請求方式**: POST
- **認證**: 需要 Bearer Token
- **請求格式**: JSON

#### PUT /api/navigation/{id}

- **功能描述**: 更新導航項目
- **請求方式**: PUT
- **認證**: 需要 Bearer Token
- **請求格式**: JSON

#### DELETE /api/navigation/{id}

- **功能描述**: 刪除導航項目
- **請求方式**: DELETE
- **認證**: 需要 Bearer Token

#### PUT /api/navigation/sort

- **功能描述**: 更新導航項目排序
- **請求方式**: PUT
- **認證**: 需要 Bearer Token
- **請求格式**: JSON

**請求範例** (排序):

```json
{
  "items": [
    { "id": "nav-001", "sortOrder": 1 },
    { "id": "nav-002", "sortOrder": 2 }
  ]
}
```

### 4. 新聞管理 API

#### GET /api/news/admin

- **功能描述**: 獲取所有新聞文章 (管理員用，包含未發布)
- **請求方式**: GET
- **認證**: 需要 Bearer Token
- **查詢參數**: page, limit, category, search
- **回應格式**: JSON

#### POST /api/news

- **功能描述**: 新增新聞文章
- **請求方式**: POST
- **認證**: 需要 Bearer Token
- **請求格式**: JSON

#### PUT /api/news/{id}

- **功能描述**: 更新新聞文章
- **請求方式**: PUT
- **認證**: 需要 Bearer Token
- **請求格式**: JSON

#### DELETE /api/news/{id}

- **功能描述**: 刪除新聞文章
- **請求方式**: DELETE
- **認證**: 需要 Bearer Token

#### PUT /api/news/{id}/publish

- **功能描述**: 發布/取消發布新聞
- **請求方式**: PUT
- **認證**: 需要 Bearer Token
- **請求格式**: JSON

**請求範例** (發布控制):

```json
{
  "isPublished": true
}
```

#### PUT /api/news/{id}/featured

- **功能描述**: 設定/取消精選新聞
- **請求方式**: PUT
- **認證**: 需要 Bearer Token
- **請求格式**: JSON

### 5. 頁面管理 API

#### GET /api/pages/admin

- **功能描述**: 獲取所有頁面 (管理員用)
- **請求方式**: GET
- **認證**: 需要 Bearer Token
- **查詢參數**: type (page/product)
- **回應格式**: JSON

#### POST /api/pages

- **功能描述**: 新增頁面
- **請求方式**: POST
- **認證**: 需要 Bearer Token
- **請求格式**: JSON

#### PUT /api/pages/{id}

- **功能描述**: 更新頁面
- **請求方式**: PUT
- **認證**: 需要 Bearer Token
- **請求格式**: JSON

#### DELETE /api/pages/{id}

- **功能描述**: 刪除頁面及其區塊
- **請求方式**: DELETE
- **認證**: 需要 Bearer Token

#### PUT /api/pages/{id}/publish

- **功能描述**: 發布/取消發布頁面
- **請求方式**: PUT
- **認證**: 需要 Bearer Token
- **請求格式**: JSON

### 6. 頁面區塊管理 API

#### GET /api/pages/{pageId}/sections

- **功能描述**: 獲取頁面所有區塊
- **請求方式**: GET
- **認證**: 需要 Bearer Token
- **回應格式**: JSON

#### POST /api/pages/{pageId}/sections

- **功能描述**: 新增頁面區塊
- **請求方式**: POST
- **認證**: 需要 Bearer Token
- **請求格式**: JSON

#### PUT /api/pages/{pageId}/sections/{sectionId}

- **功能描述**: 更新頁面區塊
- **請求方式**: PUT
- **認證**: 需要 Bearer Token
- **請求格式**: JSON

#### DELETE /api/pages/{pageId}/sections/{sectionId}

- **功能描述**: 刪除頁面區塊
- **請求方式**: DELETE
- **認證**: 需要 Bearer Token

#### PUT /api/pages/{pageId}/sections/sort

- **功能描述**: 更新區塊排序
- **請求方式**: PUT
- **認證**: 需要 Bearer Token
- **請求格式**: JSON

### 7. 表格管理 API

#### GET /api/tables

- **功能描述**: 獲取所有表格
- **請求方式**: GET
- **認證**: 需要 Bearer Token
- **回應格式**: JSON

#### POST /api/tables

- **功能描述**: 新增表格
- **請求方式**: POST
- **認證**: 需要 Bearer Token
- **請求格式**: JSON

#### PUT /api/tables/{id}

- **功能描述**: 更新表格設定
- **請求方式**: PUT
- **認證**: 需要 Bearer Token
- **請求格式**: JSON

#### DELETE /api/tables/{id}

- **功能描述**: 刪除表格
- **請求方式**: DELETE
- **認證**: 需要 Bearer Token

#### GET /api/tables/{id}/rows

- **功能描述**: 獲取表格資料行
- **請求方式**: GET
- **認證**: 需要 Bearer Token
- **回應格式**: JSON

#### POST /api/tables/{id}/rows

- **功能描述**: 新增資料行
- **請求方式**: POST
- **認證**: 需要 Bearer Token
- **請求格式**: JSON

#### PUT /api/tables/{id}/rows/{rowId}

- **功能描述**: 更新資料行
- **請求方式**: PUT
- **認證**: 需要 Bearer Token
- **請求格式**: JSON

#### DELETE /api/tables/{id}/rows/{rowId}

- **功能描述**: 刪除資料行
- **請求方式**: DELETE
- **認證**: 需要 Bearer Token

### 8. 時間軸管理 API

#### GET /api/timelines

- **功能描述**: 獲取所有時間軸
- **請求方式**: GET
- **認證**: 需要 Bearer Token
- **回應格式**: JSON

#### POST /api/timelines

- **功能描述**: 新增時間軸
- **請求方式**: POST
- **認證**: 需要 Bearer Token
- **請求格式**: JSON

#### PUT /api/timelines/{id}

- **功能描述**: 更新時間軸
- **請求方式**: PUT
- **認證**: 需要 Bearer Token
- **請求格式**: JSON

#### DELETE /api/timelines/{id}

- **功能描述**: 刪除時間軸
- **請求方式**: DELETE
- **認證**: 需要 Bearer Token

#### GET /api/timelines/{id}/items

- **功能描述**: 獲取時間軸項目
- **請求方式**: GET
- **認證**: 需要 Bearer Token
- **回應格式**: JSON

#### POST /api/timelines/{id}/items

- **功能描述**: 新增時間軸項目
- **請求方式**: POST
- **認證**: 需要 Bearer Token
- **請求格式**: JSON

#### PUT /api/timelines/{id}/items/{itemId}

- **功能描述**: 更新時間軸項目
- **請求方式**: PUT
- **認證**: 需要 Bearer Token
- **請求格式**: JSON

#### DELETE /api/timelines/{id}/items/{itemId}

- **功能描述**: 刪除時間軸項目
- **請求方式**: DELETE
- **認證**: 需要 Bearer Token

#### PUT /api/timelines/{id}/items/sort

- **功能描述**: 更新時間軸項目排序
- **請求方式**: PUT
- **認證**: 需要 Bearer Token
- **請求格式**: JSON

### 9. 檔案上傳 API

#### POST /api/upload

- **功能描述**: 上傳檔案 (圖片等)
- **請求方式**: POST
- **認證**: 需要 Bearer Token
- **請求格式**: FormData
- **回應格式**: JSON

**請求範例** (FormData):

```
file: [File object]
type: "image" | "document"
```

**回應範例**:

```json
{
  "success": true,
  "url": "https://cdn.example.com/uploads/image.jpg",
  "filename": "image.jpg"
}
```

### 10. 統計數據 API

#### GET /api/dashboard/stats

- **功能描述**: 獲取 Dashboard 統計數據
- **請求方式**: GET
- **認證**: 需要 Bearer Token
- **回應格式**: JSON

**回應範例**:

```json
{
  "pagesCount": 12,
  "newsCount": 45,
  "productsCount": 8,
  "tablesCount": 3,
  "timelinesCount": 2
}
```

## 技術實現細節

### 認證機制

- 使用 JWT Bearer Token 認證
- Token 有效期: 24 小時
- Refresh Token 支援
- 支援 Authorization Header: `Bearer {token}`

### 錯誤處理

統一的錯誤回應格式:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "輸入資料驗證失敗",
    "details": {
      "field": "title",
      "reason": "必填欄位"
    }
  }
}
```

### 資料驗證

- 前端和後端雙重驗證
- 支援欄位級別錯誤訊息
- 檔案上傳大小和類型限制

### 分頁支援

統一的分頁參數:

- `page`: 頁碼 (從 1 開始)
- `limit`: 每頁筆數 (預設 10)
- `search`: 搜尋關鍵字
- `sort`: 排序欄位
- `order`: 排序方向 (asc/desc)

### 檔案儲存

- 支援本地儲存和雲端 CDN
- 圖片自動優化壓縮
- 安全的檔案命名和路徑

## 優先實現清單

基於 localStorage 資料遷移到資料庫的優先順序，以下是需要實現的 API 端點清單，按資料依賴性和重要性排序：

### 高優先級 (Phase 1-2)

1. **網站設定** (`siteSettings`)

   - API 端點: `/api/site-settings`
   - 依賴: 無
   - 重要性: 最高 (網站基本資訊)

2. **導航選單** (`navigation`)

   - API 端點: `/api/navigation`
   - 依賴: 無
   - 重要性: 高 (網站導航結構)

3. **頁面** (`pages`)

   - API 端點: `/api/pages`
   - 依賴: 無
   - 重要性: 高 (內容頁面基礎)

4. **新聞** (`news`)
   - API 端點: `/api/news`
   - 依賴: 無
   - 重要性: 高 (內容管理核心)

### 中優先級 (Phase 3)

5. **頁面區塊** (`sections_{pageId}`)

   - API 端點: `/api/pages/{pageId}/sections`
   - 依賴: 頁面
   - 重要性: 中 (頁面內容細節)

6. **表格** (`customTables`)

   - API 端點: `/api/tables`
   - 依賴: 無
   - 重要性: 中 (資料展示)

7. **表格行資料** (`tableRows_{tableId}`)

   - API 端點: `/api/tables/{id}/rows`
   - 依賴: 表格
   - 重要性: 中 (表格內容)

8. **時間軸** (`timelines`)

   - API 端點: `/api/timelines`
   - 依賴: 無
   - 重要性: 中 (時間線展示)

9. **時間軸項目** (`timelineItems_{timelineId}`)
   - API 端點: `/api/timelines/{id}/items`
   - 依賴: 時間軸
   - 重要性: 中 (時間軸內容)

### 低優先級 (Phase 4)

10. **產品資料** (`products`)

    - API 端點: 整合至 `/api/pages` (type="product")
    - 依賴: 頁面
    - 重要性: 低 (可從頁面資料衍生)

11. **新聞列表頁面設定** (`newsListPageSettings`)

    - API 端點: 整合至頁面設定或單獨端點
    - 依賴: 無
    - 重要性: 低 (頁面配置)

12. **語言設定** (`selectedLang`)
    - API 端點: 不需要 (前端狀態)
    - 依賴: 無
    - 重要性: 最低 (用戶偏好)

## 優先實現順序

1. **Phase 1**: 基礎認證和網站設定

   - 用戶認證 API
   - 網站設定管理 API
   - 檔案上傳 API

2. **Phase 2**: 內容管理基礎

   - 導航選單管理 API
   - 新聞管理 API
   - 頁面管理 API

3. **Phase 3**: 進階功能

   - 頁面區塊管理 API
   - 表格管理 API
   - 時間軸管理 API

4. **Phase 4**: 優化和監控
   - 統計數據 API
   - 快取機制
   - 日誌記錄

## 注意事項

1. **資料遷移**: 需要將現有 localStorage 資料遷移到資料庫
2. **向後相容**: 前端需支援 API 和 localStorage 雙模式
3. **效能考量**: 大量資料需實作分頁和快取
4. **安全性**: 敏感操作需額外權限控制
5. **備份機制**: 重要資料需定期備份

## 相關文件

- [`api_spec_existing.md`](api_spec_existing.md) - 已實現 API 規格
- [`backend_sa.md`](backend_sa.md) - 後台功能架構分析
- [`frontend_sa.md`](frontend_sa.md) - 前台功能架構分析
