# AWS 部署輔助腳本 (PowerShell)
# 此腳本幫助您準備和驗證 AWS 部署環境

Write-Host "🚀 AWS 部署輔助工具" -ForegroundColor Cyan
Write-Host "====================" -ForegroundColor Cyan
Write-Host ""

# 檢查 .env.aws 是否存在
if (-not (Test-Path ".env.aws")) {
    Write-Host "⚠️  未找到 .env.aws 檔案" -ForegroundColor Yellow
    Write-Host "正在從範本建立..."
    if (Test-Path ".env.aws.example") {
        Copy-Item ".env.aws.example" ".env.aws"
        Write-Host "✓ 已建立 .env.aws，請編輯並填入實際值" -ForegroundColor Green
    } else {
        Write-Host "✗ 找不到 .env.aws.example 範本檔案" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✓ 找到 .env.aws 檔案" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 檢查清單：" -ForegroundColor Cyan
Write-Host "============" -ForegroundColor Cyan

# 檢查必要的環境變數
function Check-EnvVar {
    param($varName)
    
    if (Test-Path ".env.aws") {
        $content = Get-Content ".env.aws" -Raw
        if ($content -match "$varName=") {
            $line = (Get-Content ".env.aws") | Where-Object { $_ -match "$varName=" }
            if ($line -match "YOUR_|xxxxx|your-") {
                Write-Host "⚠️  $varName 需要更新" -ForegroundColor Yellow
                return $false
            } else {
                Write-Host "✓  $varName 已設定" -ForegroundColor Green
                return $true
            }
        } else {
            Write-Host "✗  $varName 未設定" -ForegroundColor Red
            return $false
        }
    } else {
        Write-Host "✗  找不到 .env.aws 檔案" -ForegroundColor Red
        return $false
    }
}

Check-EnvVar "DATABASE_URL" | Out-Null
Check-EnvVar "S3_ACCESS_KEY_ID" | Out-Null
Check-EnvVar "S3_SECRET_ACCESS_KEY" | Out-Null
Check-EnvVar "S3_BUCKET" | Out-Null
Check-EnvVar "JWT_SECRET" | Out-Null

Write-Host ""
Write-Host "🔧 準備步驟：" -ForegroundColor Cyan
Write-Host "============" -ForegroundColor Cyan

# 檢查 Node.js 和 npm
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✓ Node.js 已安裝: $nodeVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ 未安裝 Node.js" -ForegroundColor Red
}

try {
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        Write-Host "✓ npm 已安裝: $npmVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ 未安裝 npm" -ForegroundColor Red
}

# 檢查 Prisma
if (Test-Path "prisma/schema.prisma") {
    Write-Host "✓ Prisma schema 存在" -ForegroundColor Green
    
    # 檢查是否需要生成 Prisma Client
    if (-not (Test-Path "node_modules/.prisma")) {
        Write-Host "⚠️  需要生成 Prisma Client" -ForegroundColor Yellow
        Write-Host "執行: npm run prisma:generate"
    }
} else {
    Write-Host "✗ 找不到 Prisma schema" -ForegroundColor Red
}

Write-Host ""
Write-Host "📦 依賴套件檢查：" -ForegroundColor Cyan
Write-Host "================" -ForegroundColor Cyan

if (Test-Path "node_modules") {
    Write-Host "✓ node_modules 存在" -ForegroundColor Green
} else {
    Write-Host "⚠️  需要安裝依賴套件" -ForegroundColor Yellow
    Write-Host "執行: npm install"
}

Write-Host ""
Write-Host "🧪 測試建置：" -ForegroundColor Cyan
Write-Host "============" -ForegroundColor Cyan

$testBuild = Read-Host "是否要測試建置？(y/n)"
if ($testBuild -eq "y" -or $testBuild -eq "Y") {
    Write-Host "正在建置..."
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ 建置成功！" -ForegroundColor Green
    } else {
        Write-Host "✗ 建置失敗，請檢查錯誤訊息" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📝 下一步：" -ForegroundColor Cyan
Write-Host "==========" -ForegroundColor Cyan
Write-Host "1. 編輯 .env.aws 並填入所有必要的值"
Write-Host "2. 在 AWS Console 建立 RDS 和 S3"
Write-Host "3. 執行資料庫遷移"
Write-Host "4. 選擇部署平台（Vercel/Amplify/EC2）"
Write-Host "5. 設定環境變數並部署"
Write-Host ""
Write-Host "詳細說明請參考: docs/aws-deployment-guide.md"
Write-Host ""
