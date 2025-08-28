# OfferTracker 一键部署指南

## 🚀 快速开始

### 前置要求
- Node.js 18+
- Cloudflare 账户
- GitHub 账户

### 本地开发
```bash
# 安装所有依赖
npm run install:all

# 启动开发服务器（同时启动前后端）
npm run dev

# 或者分别启动
npm run dev:backend    # 后端服务: http://localhost:8787
npm run dev:frontend   # 前端服务: http://localhost:5173
```

## ☁️ Cloudflare 部署配置

### 1. 安装 Wrangler CLI
```bash
npm install -g wrangler
wrangler login
```

### 2. 后端配置 (backend/wrangler.toml)
更新以下配置为您的实际值：
```toml
[[d1_databases]]
binding = "DB"
database_name = "offertracker-db"
database_id = "您的数据库ID"  # 通过 wrangler d1 create 获取

[[r2_buckets]]
binding = "RESUMES_BUCKET"
bucket_name = "offertracker-resumes"

[[kv_namespaces]]
binding = "ENUMS_KV"
id = "您的KV命名空间ID"  # 通过 wrangler kv namespace create 获取

[vars]
JWT_SECRET = "设置一个安全的JWT密钥"
```

### 3. 初始化 Cloudflare 资源
```bash
# 创建数据库
wrangler d1 create offertracker-db
wrangler d1 execute offertracker-db --file=backend/migrations/schema.sql

# 创建R2存储桶
wrangler r2 bucket create offertracker-resumes

# 创建KV命名空间
wrangler kv namespace create offertracker-enums
```

## 🤖 GitHub Actions 自动部署

### 1. 配置 GitHub Secrets
在 GitHub 仓库设置中配置以下 secrets：

| Secret 名称 | 描述 |
|-------------|------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API 令牌 |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 账户 ID |

### 2. 获取 Cloudflare 凭据
```bash
# 获取账户ID
wrangler whoami

# 创建API令牌
# 访问: https://dash.cloudflare.com/profile/api-tokens
# 创建具有 Workers 和 Pages 权限的令牌
```

### 3. 自动部署流程
- 推送到 main/master 分支时自动触发
- 运行测试和构建
- 自动部署到 Cloudflare Workers 和 Pages

## 🔧 环境变量配置

### 后端环境变量
在 `backend/wrangler.toml` 中配置：
```toml
[vars]
JWT_SECRET = "your-secure-jwt-secret"
```

### 前端环境变量配置

#### 开发环境
创建 `offertracker_fronted/.env.local`：
```env
VITE_API_BASE_URL=http://localhost:8787
VITE_S3_BASE_URL=https://img-job.jimmyki.com
GEMINI_API_KEY=您的Gemini API密钥（可选）
```

#### 生产环境
在 Cloudflare Pages 控制台或 GitHub Secrets 中配置：
- `VITE_API_BASE_URL`: 您的生产环境后端API地址
- `VITE_S3_BASE_URL`: 您的S3存储地址
- `GEMINI_API_KEY`: Gemini AI API密钥（可选）

#### GitHub Secrets 配置
在仓库设置中配置以下secrets：
- `VITE_API_BASE_URL`
- `VITE_S3_BASE_URL`
- `GEMINI_API_KEY`（可选）
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## 📊 部署状态检查

### 健康检查
```bash
curl https://您的后端域名.workers.dev/health
```

### 查看日志
```bash
# 后端日志
wrangler tail

# 前端部署状态
# 访问 Cloudflare Pages 控制台查看
```

## 🛠️ 故障排除

### 常见问题
1. **构建失败**: 检查 Node.js 版本和依赖
2. **部署失败**: 确认 Cloudflare 凭据正确
3. **数据库连接错误**: 检查 D1 数据库配置
4. **文件上传问题**: 确认 R2 存储桶权限

### 获取帮助
- 查看 [API文档](./backend/API.md)
- 检查 [后端部署指南](./backend/DEPLOYMENT.md)
- 查看 [前端部署指南](./offertracker_fronted/DEPLOYMENT.md)

## 📝 版本更新
更新代码后重新部署：
```bash
# 手动部署
npm run deploy

# 或者通过GitHub Actions自动部署
git push origin main
```

---
**提示**: 确保所有敏感信息（API密钥、数据库ID等）都通过环境变量或GitHub Secrets配置，不要直接提交到代码库。