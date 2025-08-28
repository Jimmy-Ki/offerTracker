、## 🧭 项目简介：OfferTracker

**OfferTracker** 是一款面向求职者的智能化求职管理系统，旨在帮助用户系统性地记录、追踪和优化整个求职流程。通过多维度的数据记录、可视化分析和智能提醒机制，OfferTracker 让求职不再混乱，帮助用户提升效率、掌控节奏、赢得更理想的 Offer。

---

## 📌 项目背景

在现代职场环境中，求职者往往同时投递多个岗位，面对不同公司、不同渠道、不同阶段的反馈，信息极易混乱。传统的 Excel 表格或笔记工具难以满足动态更新、数据分析、版本管理等需求。

同时，随着远程办公、全球化招聘和个性化简历的兴起，求职流程变得更加复杂。OfferTracker 正是为了解决这些痛点而诞生：

- ✅ 帮助用户清晰记录每一次投递的细节与进展  
- ✅ 提供数据驱动的反馈与洞察  
- ✅ 支持多简历版本管理与岗位匹配  
- ✅ 提供可扩展的商业化能力（如团队协作、猎头管理）

---

## 🧩 实现的功能模块

### 1. 🧑‍💼 用户系统
- 用户注册 / 登录 / 登出
- 多用户支持，数据隔离
- 用户计划类型（Free / Pro / Team）

### 2. 📄 简历管理
- 上传多个简历文件（支持 PDF、DOCX）
- 简历版本命名与迭代记录
- 与岗位记录关联使用

### 3. 📋 求职记录追踪
- 添加岗位记录：公司、职位、投递时间、状态等
- 支持枚举字段（状态、城市、薪资范围等）
- 支持自由字段（备注、拒绝原因等）
- 自定义字段扩展（JSON 格式）

### 4. 📊 数据可视化 Dashboard
- 投递状态分布图（饼图）
- 城市/渠道/岗位类型统计（柱状图）
- 时间线视图（线性或甘特图）
- 投递成功率、平均响应时间分析

### 5. 🔔 智能提醒与优化
- 投递后未更新自动提醒
- 面试时间提醒
- 简历与岗位匹配度提示（预留 AI 模块）

### 6. 📁 文件存储与安全
- 简历文件存储于 Cloudflare R2
- 用户数据存储于 D1 数据库
- 枚举配置与缓存使用 KV 存储
- 身份验证使用 JWT + Cloudflare Access

### 7. 🧠 商业化能力预留
- Pro 用户功能：导出、智能分析、AI建议
- 团队版：猎头或招聘顾问协作管理
- 数据服务：匿名化求职数据分析

---

当然可以，梦琦！下面是为你的项目 **OfferTracker** 编写的完整后端技术文档，涵盖架构设计、技术选型、数据库结构、API 规范、安全机制、部署方式等内容，适合用于开发协作、技术审查或商业化准备。

---

# 📘 OfferTracker 后端技术文档

---

## 🧱 一、架构总览

OfferTracker 后端采用 **Serverless 架构**，基于 Cloudflare 全家桶构建，具备高性能、低延迟、易扩展的特点。

### 技术栈

| 模块         | 技术                     | 说明 |
|--------------|--------------------------|------|
| API 服务     | Cloudflare Workers       | 无服务器函数，处理所有业务逻辑 |
| 数据库       | Cloudflare D1            | 轻量级 SQL 数据库，存储结构化数据 |
| 文件存储     | Cloudflare R2            | 存储用户上传的简历文件 |
| 缓存配置     | Cloudflare KV            | 存储枚举值、用户设置、临时状态等 |
| 身份验证     | JWT + Cloudflare Access  | 支持邮箱注册登录，后期可扩展 OAuth |
| 安全控制     | Cloudflare Access Rules  | 限制资源访问，防止滥用 |
| 日志分析     | Cloudflare Logpush       | 监控 API 使用、性能、用户行为 |

---

## 🗂️ 二、数据库结构（D1）

### 1. 用户表 `users`

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  plan_type TEXT DEFAULT 'free',
  created_at INTEGER DEFAULT (strftime('%s','now'))
);
```

### 2. 简历表 `resumes`

```sql
CREATE TABLE resumes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  resume_name TEXT,
  file_url TEXT,
  created_at INTEGER,
  updated_at INTEGER,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
```

### 3. 求职记录表 `applications`

```sql
CREATE TABLE applications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  resume_id TEXT,
  company_name TEXT,
  position_title TEXT,
  status TEXT,
  city TEXT,
  salary_range TEXT,
  channel TEXT,
  contact_name TEXT,
  contact_email TEXT,
  application_date INTEGER,
  last_update INTEGER,
  interview_date INTEGER,
  offer_status TEXT,
  rejection_reason TEXT,
  notes TEXT,
  custom_fields TEXT,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(resume_id) REFERENCES resumes(id)
);
```

### 4. 枚举配置表（可选）`enums`

```sql
CREATE TABLE enums (
  type TEXT,
  value TEXT,
  label TEXT
);
```

---

## 🔌 三、API 接口规范

所有接口前缀为 `/api`，除注册和登录外均需携带 JWT 令牌。

### 🔐 Auth 模块

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/register` | POST | 用户注册 |
| `/api/login` | POST | 用户登录，返回 JWT |
| `/api/me` | GET | 获取当前用户信息 |

### 📄 简历模块

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/resumes` | POST | 上传简历（返回 R2 URL） |
| `/api/resumes` | GET | 获取简历列表 |
| `/api/resumes/:id` | PATCH | 更新简历信息 |
| `/api/resumes/:id` | DELETE | 删除简历 |

### 📋 求职记录模块

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/applications` | POST | 新增求职记录 |
| `/api/applications` | GET | 获取所有记录 |
| `/api/applications/:id` | GET | 获取单条记录 |
| `/api/applications/:id` | PATCH | 更新记录 |
| `/api/applications/:id` | DELETE | 删除记录 |

### 📊 Dashboard 模块

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/dashboard/summary` | GET | 状态分布、城市统计等 |
| `/api/dashboard/timeline` | GET | 时间线数据 |
| `/api/dashboard/insights` | GET | 投递成功率、平均响应时间等 |

### ⚙️ 枚举与配置模块

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/enums/:type` | GET | 获取枚举值 |
| `/api/enums/:type` | POST | 添加枚举值（管理员） |

---

## 🔐 四、安全机制

- 所有敏感接口需验证 JWT，使用 `Authorization: Bearer <token>`
- 密码使用 bcrypt 加密存储
- 简历上传使用 R2 预签名 URL，防止恶意上传
- Cloudflare Access 可用于保护后台管理接口
- 所有用户数据按 `user_id` 隔离，防止越权访问

---

## 🚀 五、部署与开发流程

### 本地开发

```bash
# 初始化 Workers 项目
wrangler init offertracker-backend

# 创建数据库
wrangler d1 create offertracker-db
wrangler d1 execute offertracker-db --file=schema.sql

# 启动本地服务
wrangler dev
```

### 部署上线

```bash
wrangler deploy
```

### 文件上传配置（R2）

```bash
# 创建 R2 存储桶
wrangler r2 bucket create offertracker-resumes
```

---

## 🧠 六、后期扩展建议

- OAuth 登录（GitHub、Google）
- AI 简历分析与岗位匹配度评分
- 团队协作功能（猎头场景）
- Webhooks 通知（Slack、邮箱）
- 导出功能（CSV、PDF）

---

太棒了，梦琦！既然我们已经完成了后端架构和接口设计，现在就来梳理 OfferTracker 的前端页面结构。这个部分将包括：

- 所有核心页面及其功能
- 页面包含的元素（组件）
- 每个页面调用的后端接口

---

## 🖼️ OfferTracker 前端页面设计总览

| 页面名称 | 路径 | 说明 |
|----------|------|------|
| 登录页 | `/login` | 用户登录 |
| 注册页 | `/register` | 用户注册 |
| 首页 / Dashboard | `/dashboard` | 数据概览与图表 |
| 求职记录列表页 | `/applications` | 查看所有求职记录 |
| 求职记录详情页 | `/applications/:id` | 查看/编辑单条记录 |
| 添加记录页 | `/applications/new` | 添加新求职记录 |
| 简历管理页 | `/resumes` | 上传、查看、管理简历 |
| 设置页 | `/settings` | 用户信息、计划类型、枚举配置等 |
| 错误页 | `/404` | 页面不存在或权限不足 |

---

## 📄 页面详细设计

### 1. 登录页 `/login`

**元素：**
- 邮箱输入框
- 密码输入框
- 登录按钮
- 注册跳转链接

**接口：**
- `POST /api/login`

---

### 2. 注册页 `/register`

**元素：**
- 邮箱输入框
- 密码输入框
- 注册按钮
- 登录跳转链接

**接口：**
- `POST /api/register`

---

### 3. Dashboard 页 `/dashboard`

**元素：**
- 状态分布图（饼图）
- 城市分布图（柱状图）
- 渠道统计图
- 时间线视图（线性图或甘特图）
- 投递成功率、平均响应时间等指标卡片

**接口：**
- `GET /api/dashboard/summary`
- `GET /api/dashboard/timeline`
- `GET /api/dashboard/insights`

---

### 4. 求职记录列表页 `/applications`

**元素：**
- 搜索框 / 筛选器（状态、城市、渠道等）
- 求职记录卡片列表（公司、职位、状态、更新时间）
- 添加新记录按钮

**接口：**
- `GET /api/applications`

---

### 5. 求职记录详情页 `/applications/:id`

**元素：**
- 公司名称、职位名称
- 状态选择器（枚举）
- 城市、薪资、渠道等字段
- 联系人信息
- 面试时间、投递时间、更新时间
- 简历版本选择器
- 自定义字段编辑器
- 备注、拒绝原因输入框
- 保存 / 删除按钮

**接口：**
- `GET /api/applications/:id`
- `PATCH /api/applications/:id`
- `DELETE /api/applications/:id`

---

### 6. 添加记录页 `/applications/new`

**元素：**
- 所有字段表单（同详情页）
- 简历选择器
- 提交按钮

**接口：**
- `POST /api/applications`

---

### 7. 简历管理页 `/resumes`

**元素：**
- 简历上传按钮
- 简历列表（名称、上传时间、版本）
- 简历预览 / 下载 / 删除按钮
- 简历别名编辑器

**接口：**
- `GET /api/resumes`
- `POST /api/resumes`
- `PATCH /api/resumes/:id`
- `DELETE /api/resumes/:id`

---

### 8. 设置页 `/settings`

**元素：**
- 用户信息（邮箱、计划类型）
- 枚举字段管理（状态、城市、薪资等）
- 修改密码 / 退出登录按钮

**接口：**
- `GET /api/me`
- `GET /api/enums/:type`
- `POST /api/enums/:type`

---

## 🧩 UI 组件建议

- **状态标签组件**：颜色区分不同状态（已投递、面试中、Offer 等）
- **图表组件**：使用 Chart.js 或 Recharts 实现可视化
- **字段表单组件**：支持枚举选择、自定义字段扩展
- **简历上传组件**：支持拖拽上传、文件预览、版本命名
- **时间线组件**：展示每条记录的进展过程

---

## 🧠 技术选型建议（前端）

| 技术 | 用途 |
|------|------|
| **React + Next.js** | 页面渲染与路由管理 |
| **Tailwind CSS** | 快速构建响应式 UI |
| **React Query / SWR** | 数据请求与缓存 |
| **Chart.js / Recharts** | 图表可视化 |
| **Zod / Yup** | 表单验证 |
| **JWT + localStorage** | 用户身份验证与持久化 |

---

