# AWS 後端環境部署指南

本指南將協助您在 AWS 上架設另一個後端環境。

## 📋 前置準備

### 1. AWS 帳號準備
- 確保您有 AWS 帳號
- 建議建立一個新的 IAM 使用者（不要使用 root 帳號）
- 準備好 AWS CLI 或使用 AWS Console

### 2. 所需 AWS 服務
- **RDS (MySQL)** - 資料庫
- **S3** - 檔案儲存
- **應用部署平台** - 可選擇以下之一：
  - Vercel（最簡單，推薦）
  - AWS Amplify
  - EC2 + Docker
  - ECS/Fargate

---

## 🗄️ 步驟 1: 設定 RDS MySQL 資料庫

### 1.1 建立 RDS 執行個體

1. 登入 AWS Console，進入 **RDS** 服務
2. 點擊「建立資料庫」
3. 選擇設定：
   - **引擎類型**：MySQL
   - **版本**：建議 8.0 或以上
   - **範本**：開發/測試（或生產環境）
   - **執行個體類別**：根據需求選擇（如 `db.t3.micro` 用於測試）
   - **儲存體**：20GB 起（可自動擴展）
   - **資料庫名稱**：`blogcraft_prod`（或您想要的名稱）
   - **主使用者名稱**：`admin`（或自訂）
   - **主密碼**：設定強密碼（**請妥善保存**）

4. **網路設定**：
   - **VPC**：選擇預設 VPC 或建立新的
   - **公開存取**：選擇「是」（如果應用不在同一 VPC）
   - **安全群組**：建立新的安全群組，允許：
     - 類型：MySQL/Aurora
     - 來源：您的 IP 或應用伺服器的安全群組

5. **備份設定**：
   - 啟用自動備份
   - 保留期間：7 天（可調整）

6. 點擊「建立資料庫」

### 1.2 取得連線資訊

建立完成後，記下以下資訊：
- **端點**：例如 `blogcraft-db.xxxxx.us-east-1.rds.amazonaws.com`
- **連接埠**：3306
- **資料庫名稱**：`blogcraft_prod`
- **使用者名稱**：`admin`
- **密碼**：您設定的密碼

### 1.3 測試連線

使用 MySQL 客戶端測試連線：
```bash
mysql -h <端點> -P 3306 -u admin -p
```

或使用 MySQL Workbench、DBeaver 等工具。

---

## 📦 步驟 2: 設定 S3 儲存桶

### 2.1 建立 S3 Bucket

1. 進入 **S3** 服務
2. 點擊「建立儲存貯體」
3. 設定：
   - **儲存貯體名稱**：`blogcraft-prod`（必須全球唯一）
   - **AWS 區域**：選擇與 RDS 相同的區域（降低延遲）
   - **阻擋所有公開存取**：根據需求設定（建議啟用，透過 IAM 控制存取）
   - **版本控制**：建議啟用（可選）
   - **加密**：啟用伺服器端加密（建議）

4. 點擊「建立儲存貯體」

### 2.2 設定 CORS（如果需要前端直接上傳）

在儲存貯體的「權限」標籤中，新增 CORS 設定：

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["https://yourdomain.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

### 2.3 建立 IAM 使用者（用於應用存取 S3）

1. 進入 **IAM** 服務
2. 建立新使用者：`blogcraft-s3-user`
3. 附加政策：`AmazonS3FullAccess`（或建立自訂政策，僅允許特定 bucket）
4. 建立存取金鑰（Access Key）：
   - 記錄 **Access Key ID**
   - 記錄 **Secret Access Key**（只會顯示一次）

---

## 🔄 步驟 3: 遷移資料庫

### 3.1 從現有資料庫匯出

在本地環境執行：

```bash
# 匯出資料庫結構和資料
mysqldump -h <現有資料庫主機> -u <使用者名稱> -p <資料庫名稱> > blogcraft_backup.sql

# 或只匯出結構（不含資料）
mysqldump -h <現有資料庫主機> -u <使用者名稱> -p --no-data <資料庫名稱> > blogcraft_schema.sql
```

### 3.2 使用 Prisma 遷移（推薦）

如果使用 Prisma，可以：

1. **更新 `.env` 檔案**，設定新的資料庫 URL：
```env
DATABASE_URL="mysql://admin:YOUR_PASSWORD@blogcraft-db.xxxxx.us-east-1.rds.amazonaws.com:3306/blogcraft_prod"
```

2. **執行 Prisma 遷移**：
```bash
# 產生遷移檔案（如果還沒有）
npx prisma migrate dev --name init

# 或直接推送 schema 到新資料庫
npx prisma db push
```

3. **匯入現有資料**（如果需要）：
```bash
mysql -h <RDS端點> -u admin -p blogcraft_prod < blogcraft_backup.sql
```

### 3.3 驗證資料庫

```bash
# 使用 Prisma Studio 檢查
npx prisma studio
```

---

## ⚙️ 步驟 4: 設定環境變數

### 4.1 建立新的 `.env` 檔案（用於 AWS 環境）

建立 `.env.production` 或 `.env.aws`：

```env
# JWT 設定
JWT_SECRET="your-super-secret-jwt-key-here-change-in-production"

# 資料庫連線（RDS）
DATABASE_URL="mysql://admin:YOUR_PASSWORD@blogcraft-db.xxxxx.us-east-1.rds.amazonaws.com:3306/blogcraft_prod"

# API URL（部署後更新）
NEXT_PUBLIC_API_URL="https://your-api-domain.com"

# S3 設定
S3_ENDPOINT=https://s3.us-east-1.amazonaws.com
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID
S3_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY
S3_BUCKET=blogcraft-prod
```

### 4.2 安全注意事項

⚠️ **重要**：
- 不要將 `.env` 檔案提交到 Git
- 在部署平台使用環境變數設定，不要硬編碼
- 考慮使用 AWS Secrets Manager 或 Parameter Store 管理敏感資訊

---

## 🚀 步驟 5: 選擇部署平台

### 選項 A: Vercel（最簡單，推薦）

1. **準備專案**：
   - 確保 `package.json` 有 `build` 和 `start` 腳本
   - 確保 `.gitignore` 包含 `.env*`

2. **部署到 Vercel**：
   - 前往 [vercel.com](https://vercel.com)
   - 使用 GitHub/GitLab 帳號登入
   - 匯入您的專案
   - 在「環境變數」設定中，新增所有 `.env` 中的變數
   - 部署

3. **優點**：
   - 自動 CI/CD
   - 免費方案可用
   - 自動 HTTPS
   - 全球 CDN

### 選項 B: AWS Amplify

1. **建立 Amplify App**：
   - 進入 **AWS Amplify** 服務
   - 選擇「新增應用」→「從 Git 部署」
   - 連接 GitHub/GitLab
   - 選擇分支

2. **設定建置設定**：
   建立 `amplify.yml`：
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
           - npx prisma generate
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
         - .next/cache/**/*
   ```

3. **設定環境變數**：
   - 在 Amplify Console 的「環境變數」中新增

### 選項 C: EC2 + Docker（進階）

1. **建立 EC2 執行個體**
2. **安裝 Docker 和 Docker Compose**
3. **建立 Dockerfile**：
   ```dockerfile
   FROM node:20-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npx prisma generate
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```
4. **部署應用**

---

## 🔐 步驟 6: 安全設定

### 6.1 RDS 安全群組

確保只允許必要的 IP 或安全群組存取：
- 應用伺服器的安全群組
- 您的管理 IP（用於維護）

### 6.2 S3 權限

- 使用 IAM 政策限制存取
- 不要公開 bucket（除非需要公開讀取）
- 啟用存取日誌

### 6.3 環境變數加密

考慮使用：
- **AWS Secrets Manager**：管理 JWT_SECRET、資料庫密碼
- **AWS Systems Manager Parameter Store**：管理其他設定

---

## 📝 步驟 7: 更新應用設定

### 7.1 更新 `next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'blogcraft-prod.s3.us-east-1.amazonaws.com',
        // 或使用 CloudFront 域名
        hostname: 'd1234567890.cloudfront.net'
      }
    ]
  },
  // 如果使用自訂域名
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          // 或限制特定域名
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### 7.2 測試 API

部署後，測試 API 端點：
- `GET /api/get-site-settings`
- `GET /api/get-navigation-item`
- `POST /api/auth/login`

---

## 🧪 步驟 8: 測試與驗證

### 檢查清單

- [ ] RDS 資料庫可以連線
- [ ] Prisma 可以正常查詢資料
- [ ] S3 可以上傳/下載檔案
- [ ] API 端點正常回應
- [ ] JWT 認證正常運作
- [ ] 環境變數正確設定
- [ ] HTTPS 正常運作
- [ ] CORS 設定正確（如果前端分離）

---

## 💰 成本估算（參考）

### 開發/測試環境（每月）
- **RDS db.t3.micro**：約 $15-20 USD
- **S3 儲存（10GB）**：約 $0.23 USD
- **S3 請求**：約 $0.01 USD
- **Vercel Hobby**：免費
- **總計**：約 $15-25 USD/月

### 生產環境（每月）
- **RDS db.t3.small**：約 $30-40 USD
- **S3 儲存（100GB）**：約 $2.30 USD
- **S3 請求**：約 $0.10 USD
- **Vercel Pro**：$20 USD/月
- **總計**：約 $50-65 USD/月

---

## 🆘 常見問題

### Q: 如何處理資料庫遷移？
A: 使用 Prisma Migrate 或手動執行 SQL 腳本。

### Q: S3 檔案如何從舊環境遷移？
A: 使用 AWS CLI：
```bash
aws s3 sync s3://old-bucket s3://blogcraft-prod
```

### Q: 如何監控應用？
A: 
- 使用 AWS CloudWatch 監控 RDS
- 使用 Vercel Analytics（如果使用 Vercel）
- 設定 CloudWatch Alarms

### Q: 如何備份？
A:
- RDS 自動備份已啟用
- S3 版本控制可恢復檔案
- 定期匯出資料庫快照

---

## 📚 參考資源

- [AWS RDS 文件](https://docs.aws.amazon.com/rds/)
- [AWS S3 文件](https://docs.aws.amazon.com/s3/)
- [Next.js 部署文件](https://nextjs.org/docs/deployment)
- [Prisma 部署指南](https://www.prisma.io/docs/guides/deployment)
- [Vercel 文件](https://vercel.com/docs)

---

## 🎯 下一步

1. 完成上述步驟後，您的 AWS 後端環境應該已經運作
2. 更新前端應用，指向新的 API URL
3. 設定監控和告警
4. 建立備份策略
5. 考慮設定 CDN（CloudFront）加速靜態資源

如有問題，請參考 AWS 文件或尋求協助。
