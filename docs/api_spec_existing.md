# 已實現 API 端點規格文檔

本文檔詳細列出 Watchsense項目中已實現的所有 API 端點規格，基於前端 API 調用函數和相關規格文檔分析。

## 概述

本項目採用前端驅動的架構，主要使用 localStorage 作為資料儲存方式。前端定義了多個 API 調用函數，這些函數模擬了標準的 REST API 接口，但實際資料操作通過 localStorage 實現。

## API 端點列表

### 1. 網站設定 API

#### GET /api/get-site-settings
- **功能描述**: 獲取網站基本設定資訊
- **請求方式**: GET
- **認證**: 需要 Bearer Token
- **回應格式**: JSON
- **使用位置**: 前台聯絡頁面、網站基本資訊展示
- **資料來源**: localStorage (鍵名: siteSettings)

**回應範例**:
```json
{
  "siteName": "Watchsense",
  "siteNameEn": "Watchsense",
  "logo": "base64_encoded_image",
  "footerLogo": "base64_encoded_image",
  "copyright": "© 2024 Watchsense. All rights reserved.",
  "phone": "+886-2-1234-5678",
  "email": "contact@watchsense.com",
  "contactTime": "週一至週五 09:00-18:00",
  "address": "台北市信義區...",
  "lineQrCode": "base64_encoded_qrcode",
  "socialLinks": {
    "facebook": "https://facebook.com/watchsense",
    "line": "https://line.me/watchsense",
    "youtube": "https://youtube.com/watchsense"
  },
  "additionalLinks": [
    {
      "title": "隱私權政策",
      "url": "/privacy"
    }
  ]
}
```

### 2. 導航選單 API

#### GET /api/get-navigation-item
- **功能描述**: 獲取網站導航選單結構
- **請求方式**: GET
- **認證**: 需要 Bearer Token
- **回應格式**: JSON
- **使用位置**: 前台 Header 導航欄
- **資料來源**: localStorage (鍵名: navigationItems)

**回應範例**:
```json
[
  {
    "id": "nav-001",
    "title": "首頁",
    "titleEn": "Home",
    "url": "/",
    "type": "internal",
    "isVisible": true,
    "sortOrder": 1,
    "children": []
  },
  {
    "id": "nav-002",
    "title": "產品服務",
    "titleEn": "Products",
    "url": "#",
    "type": "internal",
    "isVisible": true,
    "sortOrder": 2,
    "children": [
      {
        "id": "nav-003",
        "title": "產品A",
        "titleEn": "Product A",
        "url": "/products/product-a",
        "type": "internal",
        "isVisible": true,
        "sortOrder": 1
      }
    ]
  }
]
```

### 3. 產品列表 API

#### GET /api/get-products
- **功能描述**: 獲取所有產品頁面資訊
- **請求方式**: GET
- **認證**: 需要 Bearer Token
- **回應格式**: JSON
- **使用位置**: 前台導航選單產品分類整合
- **資料來源**: localStorage (鍵名: pages, 篩選 type="product")

**回應範例**:
```json
[
  {
    "id": "product-001",
    "title": "產品A",
    "slug": "product-a",
    "type": "product",
    "isPublished": true,
    "logo": "base64_encoded_logo",
    "externalUrl": "https://external-site.com",
    "category": "security",
    "sortOrder": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### 4. 最新消息 API

#### GET /api/get-news
- **功能描述**: 獲取所有已發布的新聞文章
- **請求方式**: GET
- **認證**: 需要 Bearer Token
- **回應格式**: JSON
- **使用位置**: 前台首頁新聞區塊、新聞列表頁面
- **資料來源**: localStorage (鍵名: news, 篩選 isPublished=true)

**回應範例**:
```json
[
  {
    "id": "news-001",
    "title": "Watchsense 推出全新資安解決方案",
    "slug": "new-security-solution",
    "excerpt": "我們很高興宣布推出全新的企業資安解決方案...",
    "content": "<p>詳細內容...</p>",
    "category": "技術文章",
    "isPublished": true,
    "isFeatured": true,
    "featuredImage": "base64_encoded_image",
    "publishDate": "2024-01-15",
    "createdAt": "2024-01-10T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z"
  }
]
```

## Section Settings API 規格

### Section 設定結構

根據 `API_SPEC_SECTION_SETTINGS.md` 規格，所有 Section 都支援統一的 `settings` 欄位，用於儲存不同 section 類型的特定參數。

**支援的 Section 類型**:
- `hero`: Hero 區塊
- `icon_features`: 圖標特色區塊
- `image_text`: 圖文區塊
- `video_text`: 影片文字區塊
- `cta`: 行動呼籲區塊
- `card_grid`: 卡片網格區塊
- `content_block`: 內容區塊
- `downloads`: 下載區塊
- `gallery`: 圖片庫區塊
- `product_specs`: 產品規格區塊
- `table`: 表格區塊
- `timeline`: 時間軸區塊

### Settings 欄位定義

所有欄位都是可選的 (nullable)，具體欄位根據 section_type 決定：

```typescript
{
  // CTA Section 相關欄位
  "cta_content"?: string | null,
  "button_text"?: string | null,
  "button_link"?: string | null,
  "button_color"?: string | null,
  "button_text_color"?: string | null,

  // Card Grid Section 相關欄位
  "data_source"?: string | null,
  "limit"?: number | null,
  "sort_by"?: string | null,
  "filter"?: string | null,
  "cards"?: CardItem[] | null,
  "enable_category_filter"?: boolean | null,
  "categories"?: string[] | null,

  // Hero Section 相關欄位
  "image"?: string | null,
  "hero_image"?: string | null,
  "hero_images"?: string[] | null,

  // Icon Features Section 相關欄位
  "features"?: FeatureItem[] | null,

  // Video Text Section 相關欄位
  "video"?: string | null,

  // Gallery Section 相關欄位
  "images"?: string[] | null,

  // Downloads Section 相關欄位
  "downloads"?: DownloadItem[] | null,

  // Product Specs Section 相關欄位
  "specs"?: SpecItem[] | null,

  // Table Section 相關欄位
  "table_id"?: string | null,

  // Timeline Section 相關欄位
  "timeline_id"?: string | null
}
```

## 技術實現細節

### 認證機制
- 使用 JWT Bearer Token 認證
- Token 通過 `getAuthToken()` 函數獲取
- 支援 Authorization Header: `Bearer {token}`

### 錯誤處理
- 統一的錯誤回應格式
- 支援網路錯誤和 API 錯誤區分
- 自動重試機制（前端實現）

### 資料同步
- 使用 localStorage 作為主要儲存
- 支援跨分頁即時同步（storage 事件）
- 自訂事件系統用於組件間通訊

### 請求/回應格式
- **Content-Type**: `application/json; charset=utf-8`
- **Accept**: `*/*`
- 支援 FormData 上傳（圖片等）
- 支援 URL-encoded 請求

## 注意事項

1. **資料持久性**: 所有資料儲存在瀏覽器 localStorage 中，清除瀏覽器資料會導致資料遺失
2. **離線支援**: 應用程式可在離線狀態下運行，但無法同步最新資料
3. **資料驗證**: 前端負責基本資料驗證，後端 API 應實現完整驗證邏輯
4. **效能考量**: 大量資料建議實作分頁和快取機制
5. **安全性**: 敏感操作應在實際後端實現時加入適當的安全措施

## 資料儲存方式分析

基於現有程式碼結構和功能需求分析，以下針對各類資料的儲存方式進行評估，建議哪些資料適合繼續使用 localStorage，哪些應改為資料庫持久化。

### 適合繼續使用 localStorage 的資料

#### 1. 用戶界面狀態資料
- **資料類型**: 展開/收起狀態、表單草稿、篩選條件等
- **原因**: 這些資料通常是臨時性的，用戶偏好設定，不需要跨裝置同步
- **範例**:
  - 管理後台表格的展開/收起狀態
  - 搜尋篩選條件快取
  - 表單輸入草稿（非重要資料）

#### 2. 應用程式快取資料
- **資料類型**: API 回應快取、靜態資源快取
- **原因**: 提升效能，減少重複請求，但資料遺失不影響核心功能
- **範例**:
  - 網站設定快取（短期）
  - 導航選單快取
  - 圖片資源快取

#### 3. 離線支援資料
- **資料類型**: 基本頁面內容快取
- **原因**: 支援離線瀏覽，但以唯讀模式為主
- **範例**:
  - 靜態頁面內容快取
  - 基本聯絡資訊快取

### 建議改為資料庫持久化的資料

#### 1. 核心內容資料
- **新聞文章** (`news`): 需要長期保存、版本控制、搜尋功能
- **頁面內容** (`pages`): 動態頁面和產品頁面，包含區塊設定
- **產品資訊**: 產品規格、分類、排序等商業資料
- **原因**: 這些是網站核心內容，需要持久化儲存、備份和恢復

#### 2. 網站設定資料
- **網站基本設定** (`siteSettings`): 公司資訊、聯絡方式、社群連結
- **導航選單** (`navigationItems`): 選單結構和連結設定
- **原因**: 全站共用設定，影響網站運營，需要集中管理

#### 3. 管理資料
- **表格資料** (`tables`): 自訂表格和資料行
- **時間軸資料** (`timelines`): 時間軸項目和排序
- **原因**: 管理後台建立的內容，需要持久化儲存

#### 4. 用戶和權限資料
- **管理員帳號**: 登入認證和權限設定
- **操作日誌**: 內容修改記錄和稽核追蹤
- **原因**: 安全性要求，需要可靠的持久化儲存

### 遷移建議

#### 短期方案（保持相容性）
1. **雙重儲存**: 同時寫入 localStorage 和資料庫
2. **漸進式遷移**: 優先遷移核心資料（新聞、頁面）
3. **快取層**: 使用 localStorage 作為資料庫資料的快取

#### 長期方案（完整遷移）
1. **統一資料來源**: 所有資料從資料庫獲取
2. **localStorage 降級**: 僅用於離線模式和效能優化
3. **同步機制**: 實現資料庫和前端的即時同步

#### 技術實現考量
- **資料庫選型**: 建議使用 PostgreSQL 或 MySQL
- **API 設計**: 保持現有 API 接口，後端切換儲存方式
- **資料遷移**: 提供從 localStorage 到資料庫的資料遷移工具
- **備份策略**: 建立定期備份和災難恢復機制

## 相關文件

- [`frontend_api.ts`](src/app/api/frontend_api.ts) - 前端 API 調用函數實現
- [`API_SPEC_SECTION_SETTINGS.md`](API_SPEC_SECTION_SETTINGS.md) - Section Settings 詳細規格
- [`backend_sa.md`](docs/backend_sa.md) - 後台功能架構分析
- [`frontend_sa.md`](docs/frontend_sa.md) - 前台功能架構分析