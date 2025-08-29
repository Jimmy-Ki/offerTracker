# 🧭 OfferTracker - 智能化求职管理系统

**OfferTracker** 是一款面向求职者的智能化求职管理系统，旨在帮助用户系统性地记录、追踪和优化整个求职流程。通过多维度的数据记录、可视化分析和智能提醒机制，OfferTracker 让求职不再混乱，帮助用户提升效率、掌控节奏、赢得更理想的 Offer。

[![GitHub license](https://img.shields.io/github/license/Jimmy-Ki/offerTracker)](https://github.com/Jimmy-Ki/offerTracker/blob/main/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/Jimmy-Ki/offerTracker)](https://github.com/Jimmy-Ki/offerTracker/issues)
[![GitHub stars](https://img.shields.io/github/stars/Jimmy-Ki/offerTracker)](https://github.com/Jimmy-Ki/offerTracker/stargazers)

## ✨ 特性

### 🧑‍💼 用户系统
- 用户注册 / 登录 / 登出
- 多用户支持，数据隔离
- 用户计划类型（Free / Pro / Team）

### 📄 简历管理
- 上传多个简历文件（支持 PDF、DOCX）
- 简历版本命名与迭代记录
- 与岗位记录关联使用

### 📋 求职记录追踪
- 添加岗位记录：公司、职位、投递时间、状态等
- 支持枚举字段（状态、城市、薪资范围等）
- 支持自由字段（备注、拒绝原因等）
- 自定义字段扩展（JSON 格式）

### 📊 数据可视化 Dashboard
- 投递状态分布图（饼图）
- 城市/渠道/岗位类型统计（柱状图）
- 时间线视图（线性或甘特图）
- 投递成功率、平均响应时间分析

### 🔔 智能提醒与优化
- 投递后未更新自动提醒
- 面试时间提醒
- 简历与岗位匹配度提示（预留 AI 模块）

## 🚀 快速开始

### 前置要求
- Node.js 18+
- Cloudflare 账户（用于部署）
- GitHub 账户（用于CI/CD）

### 本地开发

```bash
# 克隆项目
git clone https://github.com/Jimmy-Ki/offerTracker.git
cd offerTracker

# 安装所有依赖
npm run install:all

# 启动开发服务器（同时启动前后端）
npm run dev

# 或者分别启动
npm run dev:backend    # 后端服务: http://localhost:8787
npm run dev:frontend   # 前端服务: http://localhost:5173
```

### 环境变量配置

创建 `offertracker_fronted/.env.local`：
```env
# API 配置
VITE_API_BASE_URL=http://localhost:8787
VITE_S3_BASE_URL=https://img-job.jimmyki.com

# Gemini AI 配置（可选）
GEMINI_API_KEY=your_gemini_api_key_here
```

## 🏗️ 技术架构

### 后端技术栈
| 模块         | 技术                     | 说明 |
|--------------|--------------------------|------|
| API 服务     | Cloudflare Workers       | 无服务器函数，处理所有业务逻辑 |
| 数据库       | Cloudflare D1            | 轻量级 SQL 数据库，存储结构化数据 |
| 文件存储     | Cloudflare R2            | 存储用户上传的简历文件 |
| 缓存配置     | Cloudflare KV            | 存储枚举值、用户设置、临时状态等 |
| 身份验证     | JWT + Cloudflare Access  | 支持邮箱注册登录 |
| 安全控制     | Cloudflare Access Rules  | 限制资源访问，防止滥用 |

### 前端技术栈
- **React** + **Vite** - 页面渲染与构建工具
- **Tailwind CSS** - 快速构建响应式 UI
- **TypeScript** - 类型安全的开发体验
- **Recharts** - 图表可视化

## 📁 项目结构

```
offerTracker/
├── backend/                 # 后端API服务
│   ├── src/
│   │   ├── routes/         # API路由
│   │   ├── middleware/     # 中间件
│   │   ├── utils/          # 工具函数
│   │   └── types/          # 类型定义
│   ├── migrations/         # 数据库迁移
│   └── wrangler.toml       # Cloudflare配置
├── offertracker_fronted/   # 前端应用
│   ├── components/         # React组件
│   ├── pages/             # 页面组件
│   ├── contexts/          # React Context
│   ├── services/          # API服务
│   └── locales/           # 多语言文件
├── .github/workflows/     # GitHub Actions
└── docs/                  # 项目文档
```

## 🔌 API 接口

### 认证接口
- `POST /api/register` - 用户注册
- `POST /api/login` - 用户登录
- `GET /api/me` - 获取当前用户信息

### 简历管理
- `GET /api/resumes` - 获取简历列表
- `POST /api/resumes` - 上传简历
- `PATCH /api/resumes/:id` - 更新简历信息
- `DELETE /api/resumes/:id` - 删除简历

### 求职记录
- `GET /api/applications` - 获取所有记录
- `POST /api/applications` - 创建记录
- `GET /api/applications/:id` - 获取单条记录
- `PATCH /api/applications/:id` - 更新记录
- `DELETE /api/applications/:id` - 删除记录

### Dashboard
- `GET /api/dashboard/summary` - 汇总数据
- `GET /api/dashboard/timeline` - 时间线数据
- `GET /api/dashboard/insights` - 洞察数据

详细API文档请参考 [API.md](./backend/API.md)

## 🚀 部署指南

### Cloudflare 部署

#### 1. 安装 Wrangler CLI
```bash
npm install -g wrangler
wrangler login
```

#### 2. 初始化 Cloudflare 资源
```bash
# 创建数据库
wrangler d1 create offertracker-db
wrangler d1 execute offertracker-db --file=backend/migrations/schema.sql

# 创建R2存储桶
wrangler r2 bucket create offertracker-resumes

# 创建KV命名空间
wrangler kv namespace create offertracker-enums
```

#### 3. 部署应用
```bash
# 部署后端
cd backend && npm run deploy

# 部署前端
cd offertracker_fronted && npm run deploy
```

### 自动化部署 (GitHub Actions)

项目配置了 GitHub Actions 工作流，推送到 main 分支时会自动：

1. 运行测试和构建
2. 部署后端到 Cloudflare Workers
3. 部署前端到 Cloudflare Pages

#### 所需 GitHub Secrets：
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `VITE_API_BASE_URL`
- `VITE_S3_BASE_URL`

详细部署说明请参考 [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🤝 贡献指南

我们欢迎任何形式的贡献！请阅读我们的贡献指南。

### 开发流程

1. Fork 本仓库
2. 创建功能分支: `git checkout -b feature/新功能`
3. 提交更改: `git commit -m 'feat: 添加新功能'`
4. 推送到分支: `git push origin feature/新功能`
5. 创建 Pull Request

### 代码规范
- 使用 TypeScript 进行开发
- 遵循 ESLint 和 Prettier 配置
- 提交前运行 `npm run lint` 和 `npm run format`

### 提交消息格式
使用约定式提交消息：
```
feat: 添加新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建过程或辅助工具变动
```

详细贡献指南请参考 [CONTRIBUTING.md](./CONTRIBUTING.md)

## 📝 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](./LICENSE) 文件了解详情。

## 🐛 问题报告

如果您发现任何问题或有功能建议，请通过以下方式报告：

1. 查看 [现有Issue](https://github.com/Jimmy-Ki/offerTracker/issues)
2. 创建 [新Issue](https://github.com/Jimmy-Ki/offerTracker/issues/new)

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

## 📞 联系方式

- 项目主页: https://github.com/Jimmy-Ki/offerTracker
- Issues: https://github.com/Jimmy-Ki/offerTracker/issues
- Discussions: https://github.com/Jimmy-Ki/offerTracker/discussions

---

**提示**: 本项目正在积极开发中，API 和功能可能会发生变化。建议定期查看更新日志。

## 📊 更新日志

详细变更记录请查看 [CHANGELOG.md](./CHANGELOG.md)

### [1.0.0] - 2024-08-29
- 初始版本发布
- 完整的求职管理系统功能
- Cloudflare Workers 后端 API
- React 前端界面
- 简历管理和求职记录追踪
- 数据可视化 Dashboard

---
*让求职变得更简单，更高效！🎯*
