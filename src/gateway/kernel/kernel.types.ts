export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AdminOut {
  id: string;
  username: string;
  must_change_password: boolean;
}

export interface AdminLoginResponse {
  token: string;
  expires_in: number;
  admin: AdminOut;
}

export interface CompanyUsage {
  company_id: string;
  name: string;
  country: string;
  is_active: boolean;
  read_pct: number;
  write_pct: number;
  analysis_pct: number;
  total_events: number;
  window_hours: number;
  subscription_status: "none" | "active" | "expired" | "cancelled";
  subscription_ends_at: string | null;
  subscription_amount_display: string | null;
}

export interface PythonHealth {
  running: boolean;
  pid: number;
  version: string;
  uptime_seconds: number;
}

export interface KernelHealth {
  status: "ok" | "degraded";
  database: boolean;
  python: PythonHealth;
}

export interface SecurityAlert {
  id: number;
  severity: "info" | "warning" | "critical";
  category: string;
  message: string;
  company_id: string | null;
  source_page: string | null;
  resolved: boolean;
  created_at: string;
}

export interface OverviewResponse {
  companies: CompanyUsage[];
  kernel_health: KernelHealth;
  open_security_alerts: SecurityAlert[];
}

export interface CompanyMembership {
  company_id: string;
  company_name: string;
  role: string;
}

export interface AdminUserRow {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  created_at: string;
  companies: CompanyMembership[];
}

export interface ErrorLogEntry {
  id: number;
  source: string;
  code: string;
  message: string;
  detail: Record<string, unknown>;
  company_id: string | null;
  request_path: string | null;
  created_at: string;
}

export interface ErrorCodeSummary {
  code: string;
  occurrences: number;
  last_seen: string;
}

export interface CompanySubscription {
  id: number;
  company_id: string;
  status: "active" | "expired" | "cancelled";
  started_at: string;
  ends_at: string;
  created_at: string;
  amount_cents: number;
  currency: string;
  amount_display: string;
}
