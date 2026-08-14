import { env } from "@/gateway/config/env";
import { translateKernelError } from "@/gateway/kernel/kernel.errors";
import type {
  AdminLoginRequest,
  AdminLoginResponse,
  AdminOut,
  AdminUserRow,
  CompanySubscription,
  ErrorCodeSummary,
  ErrorLogEntry,
  KernelHealth,
  OverviewResponse,
  SecurityAlert,
} from "@/gateway/kernel/kernel.types";

/**
 * Kernel Admin Client
 *
 * The Admin Gateway's ONLY door to the Kernel's admin API, mirroring
 * how orbit-gateway's kernel.client.ts is the tenant Gateway's only
 * door. Every admin route the Frontend calls ends up as one call
 * through here. Nothing is cached or interpreted - it's relayed.
 */
class KernelAdminClient {
  private async request<T>(
    method: "GET" | "POST",
    path: string,
    opts: { body?: unknown; token?: string } = {},
  ): Promise<T> {
    const url = `${env.kernelUrl}${path}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Gateway-Secret": env.adminGatewaySharedSecret,
    };
    if (opts.token) {
      headers["Authorization"] = `Bearer ${opts.token}`;
    }

    let res: Response;
    try {
      res = await fetch(url, {
        method,
        headers,
        body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
        cache: "no-store",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Kernel unreachable";
      throw new Error(message);
    }

    const text = await res.text();
    let payload: unknown = {};
    try {
      payload = text ? JSON.parse(text) : {};
    } catch {
      throw new Error(`Kernel returned a non-JSON response (${res.status}): ${text}`);
    }

    if (!res.ok) {
      throw translateKernelError(res.status, payload);
    }

    return payload as T;
  }

  // --- Admin auth ---

  async login(input: AdminLoginRequest): Promise<AdminLoginResponse> {
    return this.request<AdminLoginResponse>("POST", "/kernel/v1/admin/auth/login", {
      body: input,
    });
  }

  async session(token: string): Promise<AdminOut> {
    return this.request<AdminOut>("GET", "/kernel/v1/admin/auth/session", { token });
  }

  async changePassword(token: string, newPassword: string): Promise<{ ok: boolean }> {
    return this.request("POST", "/kernel/v1/admin/auth/change-password", {
      token,
      body: { new_password: newPassword },
    });
  }

  // --- Overview / companies / users ---

  async overview(token: string, sinceHours = 24): Promise<OverviewResponse> {
    return this.request<OverviewResponse>(
      "GET",
      `/kernel/v1/admin/overview?since_hours=${sinceHours}`,
      { token },
    );
  }

  async companies(token: string, sinceHours = 24): Promise<{ companies: OverviewResponse["companies"] }> {
    return this.request("GET", `/kernel/v1/admin/companies?since_hours=${sinceHours}`, { token });
  }

  async setCompanyStatus(token: string, companyId: string, isActive: boolean) {
    return this.request<{ ok: boolean }>(
      "POST",
      `/kernel/v1/admin/companies/${companyId}/status`,
      { token, body: { is_active: isActive } },
    );
  }

  async getSubscription(
    token: string,
    companyId: string,
  ): Promise<{ subscription: CompanySubscription | null }> {
    return this.request("GET", `/kernel/v1/admin/companies/${companyId}/subscription`, { token });
  }

  async grantSubscription(
    token: string,
    companyId: string,
  ): Promise<{ subscription: CompanySubscription }> {
    return this.request("POST", `/kernel/v1/admin/companies/${companyId}/subscription`, {
      token,
    });
  }

  async cancelSubscription(token: string, companyId: string): Promise<{ ok: boolean }> {
    return this.request(
      "POST",
      `/kernel/v1/admin/companies/${companyId}/subscription/cancel`,
      { token },
    );
  }

  async users(token: string, search?: string): Promise<{ users: AdminUserRow[] }> {
    const qs = search ? `?search=${encodeURIComponent(search)}` : "";
    return this.request("GET", `/kernel/v1/admin/users${qs}`, { token });
  }

  async setUserStatus(token: string, userId: string, isActive: boolean) {
    return this.request<{ ok: boolean }>("POST", `/kernel/v1/admin/users/${userId}/status`, {
      token,
      body: { is_active: isActive },
    });
  }

  // --- Health ---

  async health(token: string): Promise<KernelHealth> {
    return this.request<KernelHealth>("GET", "/kernel/v1/admin/health", { token });
  }

  // --- Errors ---

  async errors(
    token: string,
    opts: { code?: string; limit?: number } = {},
  ): Promise<{ errors: ErrorLogEntry[]; codes: ErrorCodeSummary[] }> {
    const params = new URLSearchParams();
    if (opts.code) params.set("code", opts.code);
    if (opts.limit) params.set("limit", String(opts.limit));
    const qs = params.toString() ? `?${params.toString()}` : "";
    return this.request("GET", `/kernel/v1/admin/errors${qs}`, { token });
  }

  async errorById(token: string, id: number): Promise<ErrorLogEntry> {
    return this.request("GET", `/kernel/v1/admin/errors/${id}`, { token });
  }

  // --- Security alerts ---

  async securityAlerts(
    token: string,
    resolved?: boolean,
  ): Promise<{ alerts: SecurityAlert[] }> {
    const qs = resolved === undefined ? "" : `?resolved=${resolved}`;
    return this.request("GET", `/kernel/v1/admin/security-alerts${qs}`, { token });
  }

  async resolveSecurityAlert(token: string, id: number): Promise<{ ok: boolean }> {
    return this.request("POST", `/kernel/v1/admin/security-alerts/${id}/resolve`, { token });
  }
}

export const kernelAdminClient = new KernelAdminClient();
