#!/bin/bash
# 創建乾淨的新倉庫腳本（不帶歷史記錄）
# 使用方法：在專案根目錄執行此腳本

echo "正在創建乾淨的新倉庫..."

# 1. 確保在 dev/api_demo 分支
echo -e "\n步驟 1: 切換到 dev/api_demo 分支"
git checkout dev/api_demo

# 2. 創建一個新的 orphan 分支（沒有歷史）
echo -e "\n步驟 2: 創建新的 orphan 分支 'clean-main'"
git checkout --orphan clean-main

# 3. 移除所有已追蹤的文件（但保留工作目錄中的文件）
echo -e "\n步驟 3: 清理暫存區"
git rm -rf --cached .

# 4. 添加所有文件
echo -e "\n步驟 4: 添加所有文件到新分支"
git add .

# 5. 創建初始 commit
echo -e "\n步驟 5: 創建初始 commit"
git commit -m "Initial commit: Clean version from dev/api_demo branch"

echo -e "\n完成！"
echo -e "\n下一步操作："
echo "1. 創建新的 GitHub 倉庫（或您要使用的其他 Git 服務）"
echo "2. 執行以下命令推送到新倉庫："
echo "   git remote add new-origin <新倉庫的URL>"
echo "   git push -u new-origin clean-main"
echo -e "\n或者如果您想將 clean-main 設為 main 分支："
echo "   git branch -M main"
echo "   git push -u new-origin main"

