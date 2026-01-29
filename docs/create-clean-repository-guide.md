# 創建乾淨新倉庫指南（不帶歷史記錄）

本指南說明如何將 `dev/api_demo` 分支的內容（不帶歷史記錄）推送到新倉庫。

## 方法一：使用腳本（推薦）

### Windows (PowerShell)
```powershell
.\scripts\create-clean-repo.ps1
```

### Linux/Mac (Bash)
```bash
chmod +x scripts/create-clean-repo.sh
./scripts/create-clean-repo.sh
```

## 方法二：手動執行

### 步驟 1: 確保在正確的分支
```bash
git checkout dev/api_demo
```

### 步驟 2: 創建新的 orphan 分支（沒有歷史）
```bash
git checkout --orphan clean-main
```

### 步驟 3: 清理暫存區
```bash
git rm -rf --cached .
```

### 步驟 4: 添加所有文件
```bash
git add .
```

### 步驟 5: 創建初始 commit
```bash
git commit -m "Initial commit: Clean version from dev/api_demo branch"
```

## 推送到新倉庫

### 步驟 1: 創建新的 GitHub 倉庫
在 GitHub（或其他 Git 服務）上創建一個新的空倉庫。

### 步驟 2: 添加新倉庫為 remote
```bash
git remote add new-origin <新倉庫的URL>
# 例如：git remote add new-origin https://github.com/your-username/new-repo.git
```

### 步驟 3: 推送到新倉庫
```bash
# 選項 A: 使用 clean-main 分支名稱
git push -u new-origin clean-main

# 選項 B: 將分支重命名為 main 後推送
git branch -M main
git push -u new-origin main
```

## 驗證

推送完成後，在新倉庫中應該只會看到一個 commit（初始 commit），不包含任何歷史記錄。

## 注意事項

1. **備份**: 執行前請確保已備份原始倉庫
2. **.gitignore**: 確認 `.gitignore` 文件已正確配置，避免推送不必要的文件
3. **敏感資訊**: 檢查是否有敏感資訊（API keys、密碼等）需要移除
4. **大文件**: 如果專案中有大文件，考慮使用 Git LFS 或移除它們

## 清理（可選）

如果之後想移除新添加的 remote：
```bash
git remote remove new-origin
```

如果想切換回原來的分支：
```bash
git checkout dev/api_demo
```

