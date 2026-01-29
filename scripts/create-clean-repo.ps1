# 創建乾淨的新倉庫腳本（不帶歷史記錄）
# 使用方法：在專案根目錄執行此腳本

Write-Host "正在創建乾淨的新倉庫..." -ForegroundColor Green

# 1. 確保在 dev/api_demo 分支
Write-Host ""
Write-Host "步驟 1: 切換到 dev/api_demo 分支" -ForegroundColor Yellow
git checkout dev/api_demo

# 2. 創建一個新的 orphan 分支（沒有歷史）
Write-Host ""
Write-Host "步驟 2: 創建新的 orphan 分支 clean-main" -ForegroundColor Yellow
git checkout --orphan clean-main

# 3. 移除所有已追蹤的文件（但保留工作目錄中的文件）
Write-Host ""
Write-Host "步驟 3: 清理暫存區" -ForegroundColor Yellow
git rm -rf --cached .

# 4. 添加所有文件
Write-Host ""
Write-Host "步驟 4: 添加所有文件到新分支" -ForegroundColor Yellow
git add .

# 5. 創建初始 commit
Write-Host ""
Write-Host "步驟 5: 創建初始 commit" -ForegroundColor Yellow
git commit -m "Initial commit: Clean version from dev/api_demo branch"

Write-Host ""
Write-Host "完成！" -ForegroundColor Green
Write-Host ""
Write-Host "下一步操作：" -ForegroundColor Cyan
Write-Host "1. 創建新的 GitHub 倉庫（或您要使用的其他 Git 服務）" -ForegroundColor White
Write-Host "2. 執行以下命令推送到新倉庫：" -ForegroundColor White
$cmd1 = '   git remote add new-origin <新倉庫的URL>'
$cmd2 = '   git push -u new-origin clean-main'
Write-Host $cmd1 -ForegroundColor Gray
Write-Host $cmd2 -ForegroundColor Gray
Write-Host ""
$msg = '或者如果您想將 clean-main 設為 main 分支：'
Write-Host $msg -ForegroundColor Cyan
$cmd3 = '   git branch -M main'
$cmd4 = '   git push -u new-origin main'
Write-Host $cmd3 -ForegroundColor Gray
Write-Host $cmd4 -ForegroundColor Gray
