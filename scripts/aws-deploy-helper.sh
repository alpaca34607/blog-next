#!/bin/bash

# AWS 部署輔助腳本
# 此腳本幫助您準備和驗證 AWS 部署環境

echo "🚀 AWS 部署輔助工具"
echo "===================="
echo ""

# 顏色定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 檢查 .env.aws 是否存在
if [ ! -f ".env.aws" ]; then
    echo -e "${YELLOW}⚠️  未找到 .env.aws 檔案${NC}"
    echo "正在從範本建立..."
    if [ -f ".env.aws.example" ]; then
        cp .env.aws.example .env.aws
        echo -e "${GREEN}✓ 已建立 .env.aws，請編輯並填入實際值${NC}"
    else
        echo -e "${RED}✗ 找不到 .env.aws.example 範本檔案${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ 找到 .env.aws 檔案${NC}"
fi

echo ""
echo "📋 檢查清單："
echo "============"

# 檢查必要的環境變數
check_env_var() {
    if grep -q "$1" .env.aws 2>/dev/null; then
        if grep "$1" .env.aws | grep -q "YOUR_\|xxxxx\|your-"; then
            echo -e "${YELLOW}⚠️  $1 需要更新${NC}"
            return 1
        else
            echo -e "${GREEN}✓  $1 已設定${NC}"
            return 0
        fi
    else
        echo -e "${RED}✗  $1 未設定${NC}"
        return 1
    fi
}

check_env_var "DATABASE_URL"
check_env_var "S3_ACCESS_KEY_ID"
check_env_var "S3_SECRET_ACCESS_KEY"
check_env_var "S3_BUCKET"
check_env_var "JWT_SECRET"

echo ""
echo "🔧 準備步驟："
echo "============"

# 檢查 Node.js 和 npm
if command -v node &> /dev/null; then
    echo -e "${GREEN}✓ Node.js 已安裝: $(node --version)${NC}"
else
    echo -e "${RED}✗ 未安裝 Node.js${NC}"
fi

if command -v npm &> /dev/null; then
    echo -e "${GREEN}✓ npm 已安裝: $(npm --version)${NC}"
else
    echo -e "${RED}✗ 未安裝 npm${NC}"
fi

# 檢查 Prisma
if [ -f "prisma/schema.prisma" ]; then
    echo -e "${GREEN}✓ Prisma schema 存在${NC}"
    
    # 檢查是否需要生成 Prisma Client
    if [ ! -d "node_modules/.prisma" ]; then
        echo -e "${YELLOW}⚠️  需要生成 Prisma Client${NC}"
        echo "執行: npm run prisma:generate"
    fi
else
    echo -e "${RED}✗ 找不到 Prisma schema${NC}"
fi

echo ""
echo "📦 依賴套件檢查："
echo "================"

if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓ node_modules 存在${NC}"
else
    echo -e "${YELLOW}⚠️  需要安裝依賴套件${NC}"
    echo "執行: npm install"
fi

echo ""
echo "🧪 測試建置："
echo "============"

read -p "是否要測試建置？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "正在建置..."
    npm run build
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ 建置成功！${NC}"
    else
        echo -e "${RED}✗ 建置失敗，請檢查錯誤訊息${NC}"
    fi
fi

echo ""
echo "📝 下一步："
echo "=========="
echo "1. 編輯 .env.aws 並填入所有必要的值"
echo "2. 在 AWS Console 建立 RDS 和 S3"
echo "3. 執行資料庫遷移"
echo "4. 選擇部署平台（Vercel/Amplify/EC2）"
echo "5. 設定環境變數並部署"
echo ""
echo "詳細說明請參考: docs/aws-deployment-guide.md"
echo ""
