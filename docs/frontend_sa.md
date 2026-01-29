# 前台功能 SA 文檔

本文檔詳細列出 Watchsense前台網站的所有功能項目，基於現有程式碼結構分析。

## 頁面功能

### 首頁 (`src/app/page.tsx`)
- **功能描述**: 網站首頁，展示公司整體形象和主要服務
- **組件結構**:
  - Layout 佈局容器
  - HomePage 主頁面組件
- **主要區塊**:
  - Hero 區塊: 首頁橫幅和主要視覺
  - IntroSection: 公司簡介區塊
  - ServiceSection: 服務展示區塊 (支援影片播放模態框)
  - NewsSection: 最新消息展示
  - ContactSection: 聯絡資訊
  - PartnerSection: 合作夥伴展示

### 聯絡頁面 (`src/app/contact/page.tsx`)
- **功能描述**: 提供客戶聯絡方式和線上諮詢表單
- **組件結構**:
  - Layout 佈局容器
  - ContactPage 聯絡頁面組件
- **主要功能**:
  - 聯絡資訊展示 (電話、LINE QR碼)
  - 聯絡表單:
    - 公司名稱/個人姓名
    - 聯絡窗口
    - 聯絡電話
    - 電子郵件
    - LINE ID
    - 得知來源 (下拉選單: Google, Facebook, Youtube 等)
    - 主旨 (下拉選單: 各產品服務項目)
    - 聯繫需求 (下拉選單: 合作洽談, 業務需求, 技術提問等)
    - 留言內容 (多行文字)
  - 公司地址展示 (支援 Google Maps 連結)

### 新聞列表頁面 (`src/app/news/page.tsx`)
- **功能描述**: 展示所有已發布新聞文章的列表
- **組件結構**:
  - Layout 佈局容器
  - HeroSection: 頁面橫幅
  - CardGridSection: 新聞卡片網格展示
- **主要功能**:
  - 可設定頁面標題和副標題
  - 分類篩選功能 (技術文章、媒體報導、活動訊息)
  - 支援從 localStorage 載入設定
  - 即時更新監聽

### 新聞詳情頁面 (`src/app/news/[slug]/page.tsx`)
- **功能描述**: 顯示單篇新聞文章的詳細內容
- **組件結構**:
  - Layout 佈局容器
- **主要功能**:
  - 麵包屑導航 (首頁 > 最新消息 > 文章標題)
  - 文章資訊展示:
    - 分類標籤
    - 發布日期
    - 文章標題
    - 文章摘要
    - 特色圖片
    - 文章內容 (支援 HTML)
  - 相關文章推薦 (同分類前3篇)
  - 返回列表按鈕

### 動態頁面 (`src/app/[slug]/page.tsx`)
- **功能描述**: 動態渲染管理後台建立的頁面或產品頁面
- **組件結構**:
  - Layout 佈局容器
- **支援的區塊類型**:
  - HeroSection: 橫幅區塊
  - IconFeaturesSection: 圖標特色區塊
  - ImageTextSection: 圖文區塊
  - VideoTextSection: 影片文字區塊
  - CTASection: 行動呼籲區塊
  - CardGridSection: 卡片網格區塊
  - ContentBlockSection: 內容區塊
  - DownloadsSection: 下載區塊
  - GallerySection: 圖片庫區塊
  - ProductSpecsSection: 產品規格區塊
  - TableSection: 表格區塊
  - TimelineSection: 時間軸區塊
- **主要功能**:
  - 從 localStorage 載入頁面和區塊資料
  - 支援頁面標題和 meta 資訊設定
  - 即時更新監聽

### 登入頁面 (`src/app/login/page.tsx`)
- **功能描述**: CMS 客戶管理系統登入入口
- **組件結構**:
  - Layout 佈局容器
- **主要功能**:
  - 帳號輸入欄位
  - 驗證碼輸入欄位
  - Email 取得驗證碼按鈕
  - 登入按鈕
  - 背景圖片展示

## 組件功能

### Layout (`src/components/Frontend/Layout.tsx`)
- **功能描述**: 全站統一佈局容器
- **主要功能**:
  - 視窗大小監聽和響應式處理
  - 載入畫面控制
  - 滾動控制 (載入時隱藏滾動)
  - 包含 Header、Footer、GoTopButton 子組件

### Header (`src/components/Frontend/Components/Header.tsx`)
- **功能描述**: 網站頂部導航欄
- **子組件**:
  - Navigation: 主導航選單 (支援多層下拉)
  - LanguageToggle: 語言切換
  - TopUtils: 頂部工具欄
  - MobileMenu: 手機版選單
- **主要功能**:
  - 品牌 Logo 展示
  - 動態導航項目載入 (從 localStorage)
  - 產品分類整合
  - 語言切換功能
  - 手機版漢堡選單

### HomePage (`src/components/Frontend/HomePage/index.tsx`)
- **功能描述**: 首頁內容容器
- **子組件**:
  - Hero: 首頁橫幅
  - IntroSection: 公司簡介
  - ServiceSection: 服務展示 (含影片模態框)
  - VideoModal: 影片播放模態框
  - NewsSection: 新聞區塊
  - ContactSection: 聯絡區塊
  - PartnerSection: 合作夥伴區塊
- **主要功能**:
  - 影片播放控制
  - 多區塊內容整合

### ContactPage (`src/components/Frontend/ContactPage/index.tsx`)
- **功能描述**: 聯絡頁面內容
- **主要功能**:
  - 從 API 獲取網站設定
  - 聯絡資訊卡片展示
  - 聯絡表單處理
  - 地址和地圖連結

### Footer (`src/components/Frontend/Components/Footer.tsx`)
- **功能描述**: 網站底部資訊欄
- **主要功能**:
  - 公司資訊展示
  - 聯絡方式
  - 版權資訊

### GoTopButton (`src/components/Frontend/Components/GoTopButton.tsx`)
- **功能描述**: 返回頁面頂部按鈕
- **主要功能**:
  - 滾動位置監聽
  - 平滑滾動到頂部

### ScrollToTop (`src/components/Frontend/Components/ScrollToTop.tsx`)
- **功能描述**: 滾動到頂部工具
- **主要功能**:
  - 頁面載入時自動滾動到頂部

### ClipPathBtn (`src/components/Frontend/Components/ClipPathBtn.tsx`)
- **功能描述**: 自訂形狀按鈕組件
- **主要功能**:
  - CSS clip-path 效果按鈕

### FlipButton (`src/components/Frontend/Components/FlipButton.tsx`)
- **功能描述**: 翻轉效果按鈕組件
- **主要功能**:
  - CSS 翻轉動畫效果

## 技術特點

- **狀態管理**: 使用 React useState 和 useEffect
- **資料來源**: localStorage 和 API 整合
- **響應式設計**: 支援桌面和手機版面
- **多語言支援**: 中英文切換
- **動態內容**: 支援後台管理內容動態更新
- **SEO 優化**: Next.js App Router 支援