# OfferTracker 后端部署指南

## 环境要求

- Node.js 18+
- Wrangler CLI
- Cloudflare 账户

## 安装依赖

```bash
cd backend
npm install
```

## 本地开发

### 1. 初始化数据库

```bash
# 创建D1数据库
wrangler d1 create offertracker-db

# 更新wrangler.toml中的database_id
# 执行数据库迁移
wrangler d1 execute offertracker-db --file=migrations/schema.sql
```

### 2. 创建R2存储桶

```bash
wrangler r2 bucket create offertracker-resumes
```

### 3. 创建KV命名空间

```bash
wrangler kv namespace create offertracker-enums
```

### 4. 更新配置文件

编辑 `wrangler.toml`，替换以下配置：

```toml
[[d1_databases]]
binding = "DB"
database_name = "offertracker-db"
database_id = "你的数据库ID"  # 替换为实际的数据库ID

[[r2_buckets]]
binding = "RESUMES_BUCKET"
bucket_name = "offertracker-resumes"

[[kv_namespaces]]
binding = "ENUMS_KV"
id = "你的KV命名空间ID"  # 替换为实际的KV命名空间ID

[vars]
JWT_SECRET = "1145141919810"  # 使用指定的token
```

### 5. 启动本地开发服务器

```bash
wrangler dev
```

服务器将在 http://localhost:8787 启动

## 生产环境部署

### 1. 构建项目

```bash
npm run build
```

### 2. 部署到Cloudflare

```bash
wrangler deploy
```

### 3. 环境变量配置

在生产环境中，确保以下环境变量已配置：

- `JWT_SECRET`: `1145141919810` (使用指定的token)
- 数据库和存储配置已在 `wrangler.toml` 中设置

## API测试

部署完成后，可以使用以下命令测试API：

### 健康检查
```bash
curl https://你的worker域名.workers.dev/health
```

### 用户注册
```bash
curl -X POST https://你的worker域名.workers.dev/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

### 用户登录
```bash
curl -X POST https://你的worker域名.workers.dev/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 文件上传说明

简历文件上传使用R2预签名URL机制：

1. 调用 `POST /api/resumes` 获取上传URL
2. 使用返回的 `upload_url` 和 `file_name` 在前端进行文件上传
3. 文件存储在R2的 `resumes/{user_id}/{resume_id}.pdf` 路径下

## 注意事项

1. **Token安全**: JWT secret已设置为指定的 `1145141919810`，在生产环境中建议使用更复杂的密钥
2. **数据库备份**: 定期备份D1数据库数据
3. **文件存储**: R2存储桶需要配置适当的访问权限
4. **CORS配置**: 前端需要配置正确的CORS策略来访问API

## 故障排除

### 常见问题

1. **数据库连接失败**: 检查 `wrangler.toml` 中的数据库配置
2. **文件上传失败**: 检查R2存储桶权限配置
3. **认证失败**: 确认JWT secret配置正确

### 日志查看

```bash
wrangler tail
```

## 版本更新

更新代码后重新部署：

```bash
wrangler deploy
```

数据库结构变更时需要执行迁移：

```bash
wrangler d1 execute offertracker-db --file=migrations/新的迁移文件.sql