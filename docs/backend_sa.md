# 後台功能 SA 文檔

本文檔詳細列出 Watchsense後台管理系統的所有功能項目，基於現有程式碼結構分析。

## 管理頁面功能

### Dashboard (`src/app/admin/dashboard/page.tsx`)
- **功能描述**: 後台管理系統首頁，提供整體統計數據和快速操作入口
- **組件結構**:
  - AdminLayout 佈局容器
  - Dashboard 主組件
- **主要功能**:
  - 統計卡片展示:
    - 頁面數量統計
    - 新聞文章數量統計
    - 產品管理數量統計
  - 最新消息列表 (顯示前3篇已發布新聞)
  - 快速操作按鈕:
    - 新增頁面
    - 發布新聞
    - 產品管理
    - 網站設定
  - 即時更新監聽 (與其他管理頁面同步)

### 導覽選單管理 (`src/app/admin/NavigationManager/page.tsx`)
- **功能描述**: 管理網站主導覽列和子選單結構
- **組件結構**:
  - AdminLayout 佈局容器
  - NavigationManager 主組件
- **主要功能**:
  - 導覽項目 CRUD 操作 (新增/編輯/刪除)
  - 拖曳排序功能 (支援鍵盤操作)
  - 子選單支援
  - 項目類型:
    - 內部頁面連結
    - 外部連結
  - 顯示/隱藏控制
  - 產品分類自動整合 (從產品管理同步)
  - 即時更新監聽

### 最新消息管理 (`src/app/admin/NewsManager/page.tsx`)
- **功能描述**: 管理新聞文章的發布和維護
- **組件結構**:
  - AdminLayout 佈局容器
  - NewsManager 主組件
- **主要功能**:
  - 新聞文章 CRUD 操作
  - 分類篩選 (技術文章、媒體報導、活動訊息)
  - 發布/取消發布控制
  - 精選標記功能
  - 分頁顯示 (每頁9筆)
  - 預覽功能 (在新分頁開啟)
  - 富文本編輯器支援
  - 特色圖片上傳
  - 即時更新監聽

### 頁面管理 (`src/app/admin/PageManager/page.tsx`)
- **功能描述**: 管理動態頁面內容和區塊結構
- **組件結構**:
  - AdminLayout 佈局容器
  - PageManager 主組件
- **主要功能**:
  - 頁面 CRUD 操作
  - 區塊編輯入口
  - 發布/草稿狀態控制
  - 頁面預覽功能
  - SEO 設定 (meta title, meta description)
  - Hero 區塊設定 (標題、副標題、圖片)
  - 即時更新監聽

### 產品管理 (`src/app/admin/ProductsManager/page.tsx`)
- **功能描述**: 管理產品頁面 (基於頁面管理擴展)
- **組件結構**:
  - AdminLayout 佈局容器
  - PageManager 主組件 (type="product")
- **主要功能**:
  - 產品頁面 CRUD 操作
  - 產品 Logo 上傳
  - 外部網站連結設定
  - 產品分類設定
  - 導覽排序設定
  - 所有頁面管理功能

### 網站設定管理 (`src/app/admin/SiteSettingsManager/page.tsx`)
- **功能描述**: 管理網站基本資訊和全站設定
- **組件結構**:
  - AdminLayout 佈局容器
  - SiteSettingsManager 主組件
- **主要功能**:
  - 基本資訊設定:
    - 網站名稱 (中英文)
    - 主 Logo 和 Footer Logo 上傳
    - 版權文字設定
  - 聯絡資訊設定:
    - 電話、Email、聯絡時間
    - 地址資訊
    - 聯絡頁面圖片上傳 (聯絡我們圖片、Banner)
  - 社群媒體連結:
    - Facebook、Line、YouTube 連結
    - Line QRcode 圖片網址
  - 補充連結管理 (動態新增/刪除)
  - 設定即時儲存和驗證

### 表格管理 (`src/app/admin/TableManager/page.tsx`)
- **功能描述**: 建立和管理自訂資料表格
- **組件結構**:
  - AdminLayout 佈局容器
  - TableManager 主組件
- **主要功能**:
  - 表格 CRUD 操作
  - 動態欄位設定
  - 資料行 CRUD 操作
  - 搜尋功能控制
  - 資料顯示/隱藏控制
  - 表格切換管理

### 時間軸管理 (`src/app/admin/TimelineManager/page.tsx`)
- **功能描述**: 建立和管理時間軸內容
- **組件結構**:
  - AdminLayout 佈局容器
  - TimelineManager 主組件
- **主要功能**:
  - 時間軸 CRUD 操作
  - 時間軸項目 CRUD 操作
  - 拖曳排序功能
  - 項目圖片上傳
  - 年份標記
  - 時間軸切換管理

## 組件功能

### AdminLayout (`src/components/Backend/AdminLayout.tsx`)
- **功能描述**: 後台管理系統統一佈局容器
- **主要功能**:
  - 響應式側邊導航
  - 頂部工具欄
  - 主要內容區域
  - 統一樣式和佈局
  - 管理頁面導航

### Dashboard (`src/components/Backend/Dashboard.tsx`)
- **功能描述**: Dashboard 主內容組件
- **主要功能**:
  - 統計數據計算和展示
  - 最新消息載入和顯示
  - 快速操作連結
  - localStorage 資料同步
  - 自訂事件監聽

### NavigationManager (`src/components/Backend/NavigationManerger/NavigationManager.tsx`)
- **功能描述**: 導覽選單管理主組件
- **主要功能**:
  - 導覽項目列表展示
  - 拖曳排序處理
  - CRUD 操作處理
  - 資料驗證和儲存
  - 產品分類同步

### NewsManager (`src/components/Backend/NewsManager/NewsManager.tsx`)
- **功能描述**: 新聞管理主組件
- **主要功能**:
  - 新聞列表分頁展示
  - 分類篩選處理
  - CRUD 操作處理
  - 狀態控制 (發布/草稿/精選)
  - 預覽連結生成

### PageManager (`src/components/Backend/PageManager/PageManager.tsx`)
- **功能描述**: 頁面管理主組件 (支援頁面和產品模式)
- **主要功能**:
  - 頁面/產品列表展示
  - CRUD 操作處理
  - 區塊編輯入口
  - 預覽連結生成
  - 模式切換 (頁面/產品)

### SiteSettingsManager (`src/components/Backend/SiteSettingsManager.tsx`)
- **功能描述**: 網站設定管理主組件
- **主要功能**:
  - 表單資料管理
  - 圖片上傳處理
  - 設定儲存和驗證
  - 動態連結管理

### TableManager (`src/components/Backend/TableManager/TableManager.tsx`)
- **功能描述**: 表格管理主組件
- **主要功能**:
  - 表格列表管理
  - 欄位設定處理
  - 資料行 CRUD 操作
  - 表格切換邏輯

### TimelineManager (`src/components/Backend/TimelineManager/TimelineManager.tsx`)
- **功能描述**: 時間軸管理主組件
- **主要功能**:
  - 時間軸列表管理
  - 項目拖曳排序
  - CRUD 操作處理
  - 時間軸切換邏輯

## 技術特點

- **狀態管理**: 使用 React useState 和 useEffect
- **資料儲存**: localStorage 作為主要儲存方式
- **即時同步**: 自訂事件和 storage 事件監聽
- **拖曳功能**: @dnd-kit 庫支援拖曳排序
- **響應式設計**: 支援桌面和手機版面
- **表單處理**: 統一的 CRUD 操作模式
- **圖片上傳**: Base64 編碼儲存
- **分頁支援**: React Paginate 組件
- **富文本編輯**: 自訂 RichTextEditor 組件