export interface User {
  id: string;
  email: string;
  password_hash: string;
  plan_type: 'free' | 'pro' | 'team';
  created_at: number;
}

export interface Resume {
  id: string;
  user_id: string;
  resume_name: string;
  file_url: string;
  created_at: number;
  updated_at: number;
}

export interface Application {
  id: string;
  user_id: string;
  resume_id?: string;
  company_name: string;
  position_title: string;
  status: string;
  city?: string;
  salary_range?: string;
  channel?: string;
  contact_name?: string;
  contact_email?: string;
  application_date: number;
  last_update: number;
  interview_date?: number;
  offer_status?: string;
  rejection_reason?: string;
  notes?: string;
  custom_fields?: string;
}

export interface EnumItem {
  type: string;
  value: string;
  label: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  confirmPassword: string;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'password_hash'>;
}

export interface DashboardSummary {
  status_distribution: Record<string, number>;
  city_distribution: Record<string, number>;
  channel_distribution: Record<string, number>;
  total_applications: number;
  success_rate: number;
  average_response_time: number;
}

export interface Environment {
  DB: D1Database;
  RESUMES_BUCKET: R2Bucket;
  ENUMS_KV: KVNamespace;
  JWT_SECRET: string;
}

export interface JwtPayload {
  id: string;
  email: string;
  plan_type: 'free' | 'pro' | 'team';
}