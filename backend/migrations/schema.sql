-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  plan_type TEXT DEFAULT 'free',
  created_at INTEGER DEFAULT (strftime('%s','now'))
);

-- 简历表
CREATE TABLE IF NOT EXISTS resumes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  resume_name TEXT,
  file_url TEXT,
  created_at INTEGER,
  updated_at INTEGER,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

-- 求职记录表
CREATE TABLE IF NOT EXISTS applications (
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

-- 枚举配置表
CREATE TABLE IF NOT EXISTS enums (
  type TEXT,
  value TEXT,
  label TEXT
);

-- 插入默认枚举值
INSERT OR IGNORE INTO enums (type, value, label) VALUES
('status', 'applied', '已投递'),
('status', 'interviewing', '面试中'),
('status', 'offer', '收到Offer'),
('status', 'rejected', '已拒绝'),
('status', 'withdrawn', '已撤回'),

('city', 'beijing', '北京'),
('city', 'shanghai', '上海'),
('city', 'shenzhen', '深圳'),
('city', 'guangzhou', '广州'),
('city', 'hangzhou', '杭州'),

('salary_range', '0-10k', '0-10k'),
('salary_range', '10k-20k', '10k-20k'),
('salary_range', '20k-30k', '20k-30k'),
('salary_range', '30k-50k', '30k-50k'),
('salary_range', '50k+', '50k+'),

('channel', 'boss', 'Boss直聘'),
('channel', 'lagou', '拉勾网'),
('channel', 'zhilian', '智联招聘'),
('channel', '51job', '前程无忧'),
('channel', 'internal', '内推'),
('channel', 'company', '官网直投');