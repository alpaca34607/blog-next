# Section Settings API 規格說明

## 概述

`settings` 欄位是 Section 的擴充設定，用於儲存不同 section 類型的特定參數。為了讓 API 通用於不同 case 的 section，所有欄位都設為**可選（nullable）**，可一次傳遞包含所有 section 組件需要的參數。

## 圖片上傳流程

### 重要說明

所有圖片相關欄位（如 `image`、`hero_image`、`hero_images`、`images`、`featured_image`、`icon_image` 等）**必須儲存圖片 URL**，而非 base64 字串。

### 圖片上傳 API

前端會使用 **FormData** 格式將圖片檔案傳送到圖片上傳 API，後端處理後回傳圖片 URL。

#### 上傳單張圖片（POST /api/upload/image）

**Request:**

- **Content-Type**: `multipart/form-data`
- **Body (FormData)**:
  - `image`: File（圖片檔案）

**Response:**

```json
{
  "success": true,
  "url": "/images/uploaded/hero-1234567890.jpg"
}
```

#### 上傳多張圖片（POST /api/upload/images）

**Request:**

- **Content-Type**: `multipart/form-data`
- **Body (FormData)**:
  - `images`: File[]（多張圖片檔案陣列）

**Response:**

```json
{
  "success": true,
  "urls": [
    "/images/uploaded/gallery-1234567890.jpg",
    "/images/uploaded/gallery-1234567891.jpg"
  ]
}
```

### 前端處理流程

1. 使用者選擇圖片檔案
2. 前端建立 FormData，將圖片檔案加入
3. 前端發送 POST 請求到圖片上傳 API
4. 後端接收圖片，儲存到伺服器或雲端儲存，回傳圖片 URL
5. 前端取得圖片 URL 後，將 URL 儲存到 `settings` 的對應欄位
6. 前端儲存 Section 時，將包含圖片 URL 的 `settings` 傳送到後端

### 範例

```typescript
// 前端上傳圖片範例
const formData = new FormData();
formData.append("image", file);

const response = await fetch("/api/upload/image", {
  method: "POST",
  body: formData,
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const { url } = await response.json();

// 將 URL 儲存到 settings
const settings = {
  ...otherSettings,
  hero_image: url, // 儲存 URL，而非 base64
};
```

## 欄位定義

### SectionSettings 物件結構

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

## 詳細欄位說明

### CTA Section 相關欄位

| 欄位名稱            | 類型             | 說明                     | 範例                                    |
| ------------------- | ---------------- | ------------------------ | --------------------------------------- |
| `cta_content`       | `string \| null` | CTA 內容（支援 HTML）    | `"<p>立即聯絡我們</p>"`                 |
| `button_text`       | `string \| null` | 按鈕文字                 | `"前往瞭解"`                            |
| `button_link`       | `string \| null` | 按鈕連結 URL             | `"/contact"` 或 `"https://example.com"` |
| `button_color`      | `string \| null` | 按鈕背景顏色（Hex 色碼） | `"#273840"`                             |
| `button_text_color` | `string \| null` | 按鈕文字顏色（Hex 色碼） | `"#ffffff"`                             |

### Card Grid Section 相關欄位

| 欄位名稱                 | 類型                 | 說明                                   | 範例                   |
| ------------------------ | -------------------- | -------------------------------------- | ---------------------- |
| `data_source`            | `string \| null`     | 資料來源類型                           | `"news"` 或 `"custom"` |
| `limit`                  | `number \| null`     | 顯示卡片數量限制                       | `6`                    |
| `sort_by`                | `string \| null`     | 排序方式                               | `"date"` 或 `"title"`  |
| `filter`                 | `string \| null`     | 篩選條件                               | `""`                   |
| `cards`                  | `CardItem[] \| null` | 自定義卡片列表（見下方 CardItem 定義） | 見下方範例             |
| `enable_category_filter` | `boolean \| null`    | 是否啟用分類篩選                       | `true`                 |
| `categories`             | `string[] \| null`   | 自定義分類列表                         | `["新聞", "公告"]`     |

**CardItem 結構：**

```typescript
{
  "id"?: string,
  "title": string,  // 必填
  "excerpt"?: string,
  "category"?: string,
  "publish_date"?: string,
  "featured_image"?: string,  // 圖片 URL（必須透過圖片上傳 API 取得，不接受 base64）
  "link"?: string,
  "is_featured"?: boolean
}
```

### Hero Section 相關欄位

| 欄位名稱      | 類型               | 說明                                                     | 範例                                         |
| ------------- | ------------------ | -------------------------------------------------------- | -------------------------------------------- |
| `image`       | `string \| null`   | 單張背景圖片 URL（**必須透過圖片上傳 API 取得**）        | `"/images/hero.jpg"`                         |
| `hero_image`  | `string \| null`   | Hero 背景圖片 URL（別名，**必須透過圖片上傳 API 取得**） | `"/images/hero.jpg"`                         |
| `hero_images` | `string[] \| null` | Hero 輪播圖片列表（多張，**必須透過圖片上傳 API 取得**） | `["/images/hero1.jpg", "/images/hero2.jpg"]` |

> **重要：** 所有圖片欄位必須儲存圖片 URL，**不接受 base64 字串**。圖片需先透過 `/api/upload/image` 或 `/api/upload/images` API 上傳後，取得 URL 再儲存。

### Icon Features Section 相關欄位

| 欄位名稱   | 類型                    | 說明                                    | 範例       |
| ---------- | ----------------------- | --------------------------------------- | ---------- |
| `features` | `FeatureItem[] \| null` | 功能項目列表（見下方 FeatureItem 定義） | 見下方範例 |

**FeatureItem 結構：**

```typescript
{
  "icon"?: string,  // 圖標名稱（如 "shield", "zap", "users"）
  "icon_image"?: string,  // 自定義圖標圖片 URL（必須透過圖片上傳 API 取得，不接受 base64）
  "title": string,  // 必填
  "description"?: string
}
```

### Video Text Section 相關欄位

| 欄位名稱      | 類型             | 說明                     | 範例                                      |
| ------------- | ---------------- | ------------------------ | ----------------------------------------- |
| `video`       | `string \| null` | 影片 URL（支援 YouTube） | `"https://www.youtube.com/watch?v=xxxxx"` |
| `button_text` | `string \| null` | 按鈕文字                 | `"了解更多"`                              |
| `button_link` | `string \| null` | 按鈕連結 URL             | `"/products"`                             |

> **注意：** `button_text` 和 `button_link` 與 CTA Section 共用相同欄位名稱

### Gallery Section 相關欄位

| 欄位名稱 | 類型               | 說明                                                     | 範例                                               |
| -------- | ------------------ | -------------------------------------------------------- | -------------------------------------------------- |
| `images` | `string[] \| null` | 圖片列表（**必須透過圖片上傳 API 取得，不接受 base64**） | `["/images/gallery1.jpg", "/images/gallery2.jpg"]` |

### Downloads Section 相關欄位

| 欄位名稱    | 類型                     | 說明                                     | 範例       |
| ----------- | ------------------------ | ---------------------------------------- | ---------- |
| `downloads` | `DownloadItem[] \| null` | 下載項目列表（見下方 DownloadItem 定義） | 見下方範例 |

**DownloadItem 結構：**

```typescript
{
  "id"?: string,
  "title": string,  // 必填
  "category"?: string,
  "publish_date"?: string,
  "file_size"?: string,
  "file_url"?: string,
  "file_name"?: string,
  "file_type"?: string
}
```

### Product Specs Section 相關欄位

| 欄位名稱 | 類型                 | 說明                                                         | 範例                                               |
| -------- | -------------------- | ------------------------------------------------------------ | -------------------------------------------------- |
| `images` | `string[] \| null`   | 產品圖片列表（**必須透過圖片上傳 API 取得，不接受 base64**） | `["/images/product1.jpg", "/images/product2.jpg"]` |
| `specs`  | `SpecItem[] \| null` | 規格項目列表（見下方 SpecItem 定義）                         | 見下方範例                                         |

> **注意：** `images` 與 Gallery Section 共用相同欄位名稱

**SpecItem 結構：**

```typescript
{
  "name": string,  // 必填
  "value": string  // 必填
}
```

### Table Section 相關欄位

| 欄位名稱   | 類型             | 說明    | 範例          |
| ---------- | ---------------- | ------- | ------------- |
| `table_id` | `string \| null` | 表格 ID | `"table-001"` |

### Timeline Section 相關欄位

| 欄位名稱      | 類型             | 說明      | 範例             |
| ------------- | ---------------- | --------- | ---------------- |
| `timeline_id` | `string \| null` | 時間軸 ID | `"timeline-001"` |

## JSON Schema 範例

### 完整範例（包含所有欄位）

```json
{
  "cta_content": "<p>立即聯絡我們</p>",
  "button_text": "前往瞭解",
  "button_link": "/contact",
  "button_color": "#273840",
  "button_text_color": "#ffffff",
  "data_source": "custom",
  "limit": 6,
  "sort_by": "date",
  "filter": null,
  "cards": [
    {
      "id": "card-001",
      "title": "產品標題",
      "excerpt": "產品簡介",
      "category": "產品",
      "publish_date": "2024-01-01",
      "featured_image": "/images/product.jpg",
      "link": "/products/001",
      "is_featured": true
    }
  ],
  "enable_category_filter": true,
  "categories": ["新聞", "公告"],
  "image": "/images/hero.jpg",
  "hero_image": "/images/hero.jpg",
  "hero_images": ["/images/hero1.jpg", "/images/hero2.jpg"],
  "features": [
    {
      "icon": "shield",
      "title": "安全可靠",
      "description": "企業級資安防護"
    }
  ],
  "video": "https://www.youtube.com/watch?v=xxxxx",
  "images": ["/images/gallery1.jpg", "/images/gallery2.jpg"],
  "downloads": [
    {
      "id": "download-001",
      "title": "產品說明書",
      "category": "文件",
      "publish_date": "2024-01-01",
      "file_size": "2.5 MB",
      "file_url": "/files/manual.pdf",
      "file_name": "manual.pdf",
      "file_type": "pdf"
    }
  ],
  "specs": [
    {
      "name": "處理器",
      "value": "Intel Core i7"
    }
  ],
  "table_id": "table-001",
  "timeline_id": "timeline-001"
}
```

### CTA Section 範例

```json
{
  "cta_content": "<p>立即聯絡我們</p>",
  "button_text": "前往瞭解",
  "button_link": "/contact",
  "button_color": "#273840",
  "button_text_color": "#ffffff"
}
```

### Card Grid Section 範例

```json
{
  "data_source": "news",
  "limit": 6,
  "sort_by": "date",
  "enable_category_filter": true,
  "categories": ["新聞", "公告"]
}
```

### Hero Section 範例（單張圖片）

```json
{
  "hero_image": "/images/hero.jpg"
}
```

### Hero Section 範例（輪播圖片）

```json
{
  "hero_images": ["/images/hero1.jpg", "/images/hero2.jpg", "/images/hero3.jpg"]
}
```

### Icon Features Section 範例

```json
{
  "features": [
    {
      "icon": "shield",
      "title": "安全可靠",
      "description": "企業級資安防護，保障您的數據安全"
    },
    {
      "icon_image": "/images/custom-icon.png",
      "title": "高效能",
      "description": "極速處理，提升工作效率"
    }
  ]
}
```

## 重要說明

1. **所有欄位都是可選的（nullable）**：後端可以只傳遞需要的欄位，不需要的欄位可以設為 `null` 或不傳遞。

2. **欄位共用**：某些欄位名稱在不同 section 中會共用（如 `button_text`、`button_link`、`image`、`images`），這是設計上的考量，因為不同 section 可能需要類似的功能。

3. **陣列欄位**：如果不需要陣列資料，可以傳遞 `null` 或空陣列 `[]`。

4. **必填欄位**：在子類型（如 `CardItem`、`FeatureItem`）中，某些欄位是必填的（如 `title`），但在 `SectionSettings` 層級，這些陣列欄位本身是可選的。

5. **資料驗證**：後端應根據 `section_type` 驗證對應的欄位，例如 `section_type` 為 `"cta"` 時，應驗證 CTA 相關欄位。

6. **圖片欄位規範**：
   - **所有圖片相關欄位必須儲存圖片 URL**，絕對不接受 base64 字串
   - 前端需先透過圖片上傳 API（`/api/upload/image` 或 `/api/upload/images`）上傳圖片
   - 上傳 API 回傳的 URL 才可儲存到 `settings` 的圖片欄位
   - 後端 API 應驗證圖片欄位格式，確保是有效的 URL 而非 base64
   - 圖片 URL 建議使用相對路徑（如 `/images/xxx.jpg`）或完整的 HTTP/HTTPS URL

## API 請求/回應範例

### 建立 Section（POST /api/sections）

**Request Body:**

```json
{
  "section_type": "cta",
  "title": "聯絡我們",
  "subtitle": "有任何問題歡迎聯絡",
  "settings": {
    "cta_content": "<p>立即聯絡我們</p>",
    "button_text": "前往聯絡頁面",
    "button_link": "/contact",
    "button_color": "#273840",
    "button_text_color": "#ffffff"
  }
}
```

### 更新 Section（PUT /api/sections/:id）

**Request Body:**

```json
{
  "settings": {
    "button_text": "立即聯絡",
    "button_link": "/contact-us"
  }
}
```

### 回應資料（GET /api/sections/:id）

**Response Body:**

```json
{
  "id": "section-001",
  "section_type": "cta",
  "title": "聯絡我們",
  "settings": {
    "cta_content": "<p>立即聯絡我們</p>",
    "button_text": "前往聯絡頁面",
    "button_link": "/contact",
    "button_color": "#273840",
    "button_text_color": "#ffffff"
  }
}
```

### 建立包含圖片的 Section（POST /api/sections）

**前置步驟：** 先上傳圖片取得 URL

**步驟 1：上傳圖片（POST /api/upload/image）**

```
Content-Type: multipart/form-data

FormData:
  image: [File物件]
```

**Response:**

```json
{
  "success": true,
  "url": "/images/uploaded/hero-1234567890.jpg"
}
```

**步驟 2：建立 Section 並使用圖片 URL**

**Request Body:**

```json
{
  "section_type": "hero",
  "title": "首頁 Hero",
  "subtitle": "歡迎來到我們的網站",
  "settings": {
    "hero_image": "/images/uploaded/hero-1234567890.jpg"
  }
}
```

### 更新包含多張圖片的 Section（PUT /api/sections/:id）

**前置步驟：** 先上傳多張圖片取得 URL

**步驟 1：上傳多張圖片（POST /api/upload/images）**

```
Content-Type: multipart/form-data

FormData:
  images: [File物件1, File物件2, File物件3]
```

**Response:**

```json
{
  "success": true,
  "urls": [
    "/images/uploaded/gallery-1234567890.jpg",
    "/images/uploaded/gallery-1234567891.jpg",
    "/images/uploaded/gallery-1234567892.jpg"
  ]
}
```

**步驟 2：更新 Section 並使用圖片 URL**

**Request Body:**

```json
{
  "settings": {
    "hero_images": [
      "/images/uploaded/gallery-1234567890.jpg",
      "/images/uploaded/gallery-1234567891.jpg",
      "/images/uploaded/gallery-1234567892.jpg"
    ]
  }
}
```
