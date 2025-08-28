#!/bin/bash

# OfferTracker 前端部署脚本
echo "🚀 开始部署 OfferTracker 前端到 Cloudflare Pages..."

# 检查是否安装了 wrangler
if ! command -v wrangler &> /dev/null; then
    echo "❌ wrangler 未安装，请先运行: npm install -g wrangler"
    exit 1
fi

# 构建项目
echo "📦 构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi

echo "✅ 构建成功"

# 检查是否已登录 Cloudflare
echo "🔐 检查 Cloudflare 登录状态..."
wrangler whoami &> /dev/null

if [ $? -ne 0 ]; then
    echo "⚠️  未登录 Cloudflare，请运行: wrangler login"
    echo "然后重新运行此脚本"
    exit 1
fi

echo "✅ 已登录 Cloudflare"

# 部署到 Cloudflare Pages
echo "🌐 部署到 Cloudflare Pages..."
wrangler pages deploy dist --project-name offertracker-frontend

if [ $? -eq 0 ]; then
    echo "🎉 部署成功！"
    echo "📋 您的应用已部署到 Cloudflare Pages"
    echo "💡 提示：您可以在 Cloudflare 控制台中配置自定义域名和环境变量"
else
    echo "❌ 部署失败"
    exit 1
fi