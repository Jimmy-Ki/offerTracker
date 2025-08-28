
export interface User {
  id: string;
  email: string;
  plan_type: 'free' | 'pro' | 'team';
  created_at: number;
}

export interface AuthResponse {
  token: string;
  user: User;
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
  resume_name?: string;
}

export type ApplicationInput = Omit<Application, 'id' | 'user_id' | 'last_update' | 'resume_name'>;

export interface DashboardSummary {
  status_distribution: Record<string, number>;
  city_distribution: Record<string, number>;
  channel_distribution: Record<string, number>;
  total_applications: number;
  success_rate: number;
  average_response_time: number;
}

export interface EnumItem {
  type: string;
  value: string;
  label: string;
}
