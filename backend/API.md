# OfferTracker API 文档

## 基础信息

- **Base URL**: `/api`
- **认证**: 除注册和登录外，所有接口都需要在Header中携带 `Authorization: Bearer <token>`
- **Token**: 使用JWT，secret为 `1145141919810`

## 认证接口

### 用户注册
- **URL**: `POST /api/register`
- **Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```
- **响应**:
```json
{
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "plan_type": "free",
    "created_at": 1234567890
  }
}
```

### 用户登录
- **URL**: `POST /api/login`
- **Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- **响应**: 同注册接口

### 获取当前用户信息
- **URL**: `GET /api/me`
- **需要认证**: 是
- **响应**:
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "plan_type": "free",
  "created_at": 1234567890
}
```

## 简历管理接口

### 获取简历列表
- **URL**: `GET /api/resumes`
- **需要认证**: 是
- **响应**:
```json
[
  {
    "id": "resume_id",
    "user_id": "user_id",
    "resume_name": "前端开发简历",
    "file_url": "resumes/user_id/resume_id.pdf",
    "created_at": 1234567890,
    "updated_at": 1234567890
  }
]
```

### 创建简历（获取上传URL）
- **URL**: `POST /api/resumes`
- **需要认证**: 是
- **Body**:
```json
{
  "resume_name": "前端开发简历"
}
```
- **响应**:
```json
{
  "id": "resume_id",
  "upload_url": "upload_id",
  "file_name": "resumes/user_id/resume_id.pdf"
}
```

### 更新简历信息
- **URL**: `PATCH /api/resumes/:id`
- **需要认证**: 是
- **Body**:
```json
{
  "resume_name": "更新后的简历名称"
}
```

### 删除简历
- **URL**: `DELETE /api/resumes/:id`
- **需要认证**: 是

### 获取简历下载信息
- **URL**: `GET /api/resumes/:id/download`
- **需要认证**: 是
- **响应**:
```json
{
  "file_path": "resumes/user_id/resume_id.pdf"
}
```

## 求职记录接口

### 获取所有求职记录
- **URL**: `GET /api/applications`
- **需要认证**: 是
- **响应**:
```json
[
  {
    "id": "application_id",
    "user_id": "user_id",
    "resume_id": "resume_id",
    "company_name": "公司名称",
    "position_title": "职位名称",
    "status": "applied",
    "city": "北京",
    "salary_range": "20k-30k",
    "channel": "boss",
    "contact_name": "联系人",
    "contact_email": "contact@example.com",
    "application_date": 1234567890,
    "last_update": 1234567890,
    "interview_date": 1234567890,
    "offer_status": "accepted",
    "rejection_reason": "拒绝原因",
    "notes": "备注",
    "custom_fields": "{}",
    "resume_name": "简历名称"
  }
]
```

### 获取单条求职记录
- **URL**: `GET /api/applications/:id`
- **需要认证**: 是

### 创建求职记录
- **URL**: `POST /api/applications`
- **需要认证**: 是
- **Body**:
```json
{
  "resume_id": "resume_id",
  "company_name": "公司名称",
  "position_title": "职位名称",
  "status": "applied",
  "city": "北京",
  "salary_range": "20k-30k",
  "channel": "boss",
  "contact_name": "联系人",
  "contact_email": "contact@example.com",
  "application_date": 1234567890,
  "interview_date": 1234567890,
  "offer_status": "pending",
  "rejection_reason": "拒绝原因",
  "notes": "备注",
  "custom_fields": "{}"
}
```

### 更新求职记录
- **URL**: `PATCH /api/applications/:id`
- **需要认证**: 是
- **Body**: 同创建接口，支持部分字段更新

### 删除求职记录
- **URL**: `DELETE /api/applications/:id`
- **需要认证**: 是

## Dashboard接口

### 获取汇总数据
- **URL**: `GET /api/dashboard/summary`
- **需要认证**: 是
- **响应**:
```json
{
  "status_distribution": {
    "applied": 10,
    "interviewing": 5,
    "offer": 2,
    "rejected": 3
  },
  "city_distribution": {
    "北京": 8,
    "上海": 6,
    "深圳": 4
  },
  "channel_distribution": {
    "boss": 12,
    "lagou": 5,
    "internal": 3
  },
  "total_applications": 20,
  "success_rate": 10.0,
  "average_response_time": 7.5
}
```

### 获取时间线数据
- **URL**: `GET /api/dashboard/timeline`
- **需要认证**: 是
- **响应**: 最近50条求职记录的简要信息

### 获取洞察数据
- **URL**: `GET /api/dashboard/insights`
- **需要认证**: 是
- **响应**: 包含月度趋势、状态处理时间、渠道成功率等高级分析数据

## 枚举配置接口

### 获取枚举值
- **URL**: `GET /api/enums/:type`
- **参数**: `type` - 枚举类型 (status/city/salary_range/channel)
- **响应**:
```json
[
  {
    "type": "status",
    "value": "applied",
    "label": "已投递"
  }
]
```

### 获取所有枚举类型
- **URL**: `GET /api/enums`
- **响应**: `["status", "city", "salary_range", "channel"]`

### 批量获取枚举值
- **URL**: `POST /api/enums/batch`
- **Body**:
```json
{
  "types": ["status", "city"]
}
```
- **响应**:
```json
{
  "status": [...],
  "city": [...]
}
```

## 健康检查

### 健康检查
- **URL**: `GET /health`
- **响应**: `{"status": "ok", "timestamp": 1234567890}`