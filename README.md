This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
啟動prisma後台 npm run prisma:studio
更新prisma欄位 npx prisma generate

---

## Deploy on Vercel

https://blogcreation-next.vercel.app/zh

---

## 環境建置

本專案使用 **MySQL + Prisma** 作為資料層，資料庫部署於 AWS RDS。
圖片與靜態檔案存放於 **AWS S3**

### 完整 `.env` 範例

```env
# 資料庫
DATABASE_URL="mysql://<user>:<password>@<rds-endpoint>:3306/<dbname>"

# AWS S3
S3_ENDPOINT=""
S3_REGION="ap-northeast-1"
S3_ACCESS_KEY_ID="<your-access-key-id>"
S3_SECRET_ACCESS_KEY="<your-secret-access-key>"
S3_BUCKET="<your-bucket-name>"

#JWT
JWT_SECRET=""

```

---


## Demo 訪客模式

### 資料流說明

**一、啟動 demo 工作區**

- 前端呼叫 `POST /api/demo/start`，後端建立獨立的 demo workspace 並核發 24 小時有效的 JWT token
- token 與 workspace ID 寫入 Cookie，後續後台的所有 API 請求都會帶上這組 token 做身份識別
- 伺服器端透過 `withAuthOrDemo()` middleware 判斷是管理員還是 demo 訪客，demo 訪客寫入的資料都會標記上自己的 `demoWorkspaceId`

**二、後台操作期間**

- 後台列表頁會同時顯示正式資料與 demo 訪客自建的資料，兩者以 badge 區分
- 正式資料（`demoWorkspaceId = ""`）在 demo 模式下鎖定為唯讀，無法編輯或刪除
- `useDemoMode()` hook 統一管理 demo 狀態偵測，`isItemReadOnly()` 供各元件判斷單筆資料的唯讀狀態

**三、前往前台預覽**

- 後台點「前往前台頁面」時，連結會帶上 `?UUID=<workspaceId>` 參數
- 前台透過 `useDemoUuid()` 從 URL 讀取這個 ID，再帶入公開 API 的請求中
- `useDemoHref()` hook 負責讓前台所有內部導覽連結自動保留 `?UUID=...`，確保切換頁面時 demo 狀態不會丟失

**四、前台資料合併（伺服器端）**

- 公開 API（如 `/api/get-news?UUID=cmma4p...`）收到請求後，在伺服器端分兩批查詢：
  - 第一批：`WHERE demoWorkspaceId = ""`，取得正式資料
  - 第二批：`WHERE demoWorkspaceId = "cmma4p..."`，取得該 demo 的資料
- 兩批結果合併排序後回傳，一般訪客沒有帶 UUID 時完全不查 demo 資料，行為與沒有這個功能時一模一樣

### 相關程式碼

- `hooks/useDemoMode.ts` — 偵測 demo 訪客狀態，回傳 `isDemoMode` 與 `isItemReadOnly(item)`
- `hooks/useDemoUuid.ts` — 從前台 URL 的 `?UUID=xxx` 讀取 workspace ID
- `hooks/useDemoHref.ts` — 前台路徑轉換，自動附加 UUID 讓導覽保持連貫
- `utils/common.ts` — `getDemoId()` / `getDemoToken()` 從 Cookie 讀取（後台用）
- `lib/auth-middleware.ts` — `withAuthOrDemo()` 伺服器端驗證 middleware
- `app/api/demo/start/route.ts` — 建立 demo workspace 並核發 token

---



