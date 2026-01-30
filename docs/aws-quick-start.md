# AWS 部署快速開始指南

這是為前端工程師準備的 AWS 後端環境快速部署指南。

## 🎯 5 分鐘快速概覽

1. **建立 RDS MySQL 資料庫** → 取得連線資訊
2. **建立 S3 Bucket** → 取得存取金鑰
3. **設定環境變數** → 填入連線資訊
4. **遷移資料庫** → 使用 Prisma
5. **部署應用** → 選擇平台（推薦 Vercel）

---

## 📝 步驟 1: 建立 RDS 資料庫（約 10-15 分鐘）

### 在 AWS Console：

1. 搜尋並進入 **RDS** 服務
2. 點擊「建立資料庫」
3. 選擇：
   - ✅ **MySQL**
   - ✅ **範本**：開發/測試（免費方案）
   - ✅ **執行個體類別**：db-t3-micro
   - ✅ **資料庫名稱**：`blogcraft-dev`
   - ✅ **主使用者名稱**：`admin`
   - ✅ **主密碼**：設定強密碼（**記下來！**）
   - ✅ **公開存取**：否（資料庫不公開存取）

4. 點擊「建立資料庫」
5. 等待 5-10 分鐘建立完成
6. **記下端點**：例如 `blogcraft-db.xxxxx.us-east-1.rds.amazonaws.com`

### ⚠️ 重要：本機開發連線設定

如果設定「公開存取：否」，**本機電腦無法直接連線**。有兩種做法：

**選項 A：允許公開存取（適合開發測試）**
1. 進入 RDS → 選擇你的資料庫 → 點擊「修改」
2. 在「連線」區塊，將「公開存取」改為「是」
3. 在「安全群組」區塊，建立或修改安全群組規則：
   - 類型：MySQL/Aurora
   - 連接埠：3306
   - 來源：我的 IP（或特定 IP 位址）
4. 儲存變更並等待套用（約 5-10 分鐘）

**選項 B：保持不公開（適合正式環境）**
- 本機開發時使用本地資料庫（`.env` 指向本地 MySQL）
- 部署到雲端後，應用程式與 RDS 在同一 VPC 內，可以正常連線

---

## 📦 步驟 2: 建立 S3 Bucket（約 5 分鐘）

### 在 AWS Console：

1. 搜尋並進入 **S3** 服務
2. 點擊「建立儲存貯體」
3. 設定：
   - ✅ **名稱**：`blogcraft-dev`（必須全球唯一）
   - ✅ **區域**：與 RDS 相同（如 `ap-northeast-1`）
   - ✅ **阻擋所有公開存取**：根據需求設定

4. 點擊「建立儲存貯體」

### 建立 IAM 使用者（用於應用存取）：

1. 進入 **IAM** 服務
2. 點擊「使用者」→「建立使用者」
3. 名稱：`blogcraft-s3-user`
4. 附加政策：`AmazonS3FullAccess`
5. 建立存取金鑰：
   - 記錄 **Access Key ID**
   - 記錄 **Secret Access Key**（只顯示一次！）

---

## ⚙️ 步驟 3: 設定環境變數（約 5 分鐘）

### 在專案中：

1. 複製環境變數範本：
   ```bash
   cp .env.aws.example .env.aws
   ```

2. 編輯 `.env.aws`，填入：

```env
# 資料庫（從 RDS 取得）
DATABASE_URL="mysql://admin:YOUR_PASSWORD@blogcraft-db.xxxxx.us-east-1.rds.amazonaws.com:3306/blogcraft_dev"

# S3（從 IAM 取得）
S3_ENDPOINT=https://s3.ap-northeast-1.amazonaws.com
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID
S3_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY
S3_BUCKET=blogcraft-dev

# JWT（產生強密碼）
JWT_SECRET="your-super-secret-jwt-key-here-change-in-devuction"
```

---

## 🔄 步驟 4: 遷移資料庫（約 5 分鐘）

### 使用 Prisma：

1. **更新環境變數**（暫時使用 AWS 資料庫）：
   ```bash
   # 在 .env 中設定 DATABASE_URL 指向 AWS RDS
   ```

2. **推送 Schema**：
   ```bash
   npx prisma db push
   ```

3. **生成 Prisma Client**：
   ```bash
   npm run prisma:generate
   ```

4. **（可選）從舊主機匯入現有資料**  
   搬遷所需的「內容」就是**舊資料庫的連線資訊**，從舊主機的 `.env` 即可取得：
   - **舊主機**：`DATABASE_URL` 裡的 host（例如 `m-ava-game.intersense.cloud`）
   - **舊埠號**：通常是 `3306`
   - **舊使用者**：`blogcraft`
   - **舊密碼**：`4kItTw3I6Iss4wyV`
   - **舊資料庫名稱**：`blogcraft_dev`
   
   匯出舊資料庫（在本機執行，會提示輸入舊密碼）：
   ```bash
   mysqldump -h m-ava-game.intersense.cloud -P 3306 -u blogcraft -p blogcraft_dev > backup.sql
   ```
   
   匯入到新 RDS（會提示輸入新密碼，即 `.env` 裡 RDS 的主密碼）：
   ```bash
   mysql -h blogcraft-dev.chyyoc6kest7.ap-northeast-1.rds.amazonaws.com -P 3306 -u admin -p blogcraft-dev < backup.sql
   ```
   要直接改資料庫某一筆的某個值，可以用下面幾種方式：
   專案有使用 Prisma，最簡單的方式是用 Prisma Studio（內建、免裝其他軟體）：
   在專案目錄執行：
   npx prisma studio
   會開一個網頁（通常是 http://localhost:5555），可以：
   點左邊的資料表
   看到每一筆資料
   點某個欄位直接改值
   改完會自動寫回資料庫
   連線用的是你 .env 裡的 DATABASE_URL（目前是 RDS），所以改的就是 RDS 裡的資料。

---

## 🚀 步驟 5: 部署應用（約 10 分鐘）

### 選項 A: Vercel（最簡單，推薦）

1. **準備專案**：
   ```bash
   # 確保可以建置
   npm run build
   ```

2. **部署到 Vercel**：
   - 前往 [vercel.com](https://vercel.com)
   - 使用 GitHub 登入
   - 點擊「新增專案」
   - 匯入您的 Git 儲存庫
   - 在「環境變數」中，新增 `.env.aws` 中的所有變數
   - 點擊「部署」

3. **完成！** Vercel 會自動：
   - 建置應用
   - 部署到全球 CDN
   - 提供 HTTPS
   - 提供域名

### 選項 B: AWS Amplify

1. 進入 **AWS Amplify** 服務
2. 點擊「新增應用」→「從 Git 部署」
3. 連接 GitHub/GitLab
4. 在「環境變數」中新增所有變數
5. 部署

---

## ✅ 驗證部署

### 測試 API：

1. **取得部署 URL**（例如：`https://your-app.vercel.app`）

2. **測試端點**：
   ```bash
   # 測試網站設定
   curl https://your-app.vercel.app/api/get-site-settings
   
   # 測試導航
   curl https://your-app.vercel.app/api/get-navigation-item
   ```

3. **測試登入**：
   ```bash
   curl -X POST https://your-app.vercel.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"your@email.com","password":"yourpassword"}'
   ```

---

## 🆘 常見問題

### Q: 資料庫連線失敗？
- ✅ 檢查 `DATABASE_URL` 格式是否正確
- ✅ 確認 RDS 執行個體狀態為「可用」
- ✅ 確認應用程式與資料庫在同一 VPC 或使用 VPC 端點連線

### Q: S3 上傳失敗？
- ✅ 檢查 IAM 使用者的 Access Key 是否正確
- ✅ 檢查 S3 bucket 名稱是否正確
- ✅ 檢查區域是否匹配

### Q: 建置失敗？
- ✅ 檢查環境變數是否都設定了
- ✅ 檢查 `npm run build` 在本地是否成功
- ✅ 查看部署平台的建置日誌

---

## 📚 詳細文件

- **完整指南**：`docs/aws-deployment-guide.md`
- **檢查清單**：`docs/aws-deployment-checklist.md`
- **環境變數範本**：`.env.aws.example`

---

## 🎉 完成！

部署完成後，您應該有：
- ✅ 運作中的 RDS MySQL 資料庫
- ✅ 運作中的 S3 儲存
- ✅ 部署的 Next.js 應用
- ✅ 可用的 API 端點

**下一步**：更新前端應用的 API URL，指向新的後端環境。

---

## 💡 提示

- 使用 **Vercel** 最簡單，適合快速開始
- 開發環境可以使用免費方案
- 記得定期備份資料庫
- 使用 AWS Secrets Manager 管理敏感資訊（進階）

**需要幫助？** 參考完整指南或查看 AWS 文件。
