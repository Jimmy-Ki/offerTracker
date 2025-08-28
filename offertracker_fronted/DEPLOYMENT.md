# Cloudflare Pages 部署指南

## 前置要求

1. 安装 Cloudflare Wrangler CLI:
```bash
npm install -g wrangler
```

2. 登录 Cloudflare 账户:
```bash
wrangler login
```

## 部署步骤

### 1. 构建项目
```bash
cd offertracker_fronted
npm run build
```

### 2. 部署到 Cloudflare Pages
```bash
# 方法一：使用 npm 脚本
npm run deploy

# 方法二：手动部署
wrangler pages deploy dist --project-name offertracker-frontend
```

### 3. 配置环境变量（可选）

在 Cloudflare Pages 控制台中配置环境变量：
- `VITE_API_BASE_URL`: 后端 API 地址
- `VITE_GEMINI_API_KEY`: Gemini API 密钥

## 自定义域名配置

1. 在 Cloudflare Pages 控制台中进入项目设置
2. 选择 "Custom domains" 选项卡
3. 添加您的自定义域名
4. 按照提示配置 DNS 记录

## 持续集成

项目已配置 GitHub Actions 工作流，推送到 main 分支时会自动部署。

## 故障排除

### 构建失败
- 检查 Node.js 版本 (推荐 18+)
- 运行 `npm install` 确保所有依赖已安装

### 部署失败
- 确认 wrangler 已登录
- 检查网络连接

### 运行时错误
- 检查环境变量配置
- 查看浏览器控制台错误信息