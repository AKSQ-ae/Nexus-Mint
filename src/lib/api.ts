const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

export interface ApiResponse<T = any> {
  success?: boolean;
  error?: string;
  data?: T;
  message?: string;
}

export interface ValidateResetResponse {
  valid: boolean;
  error?: string;
  email?: string;
  token?: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message?: string;
  error?: string;
}

class ApiClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor() {
    this.baseUrl = `${SUPABASE_URL}/functions/v1`;
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    const config: RequestInit = {
      headers: this.headers,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async validateResetToken(token: string): Promise<ValidateResetResponse> {
    return this.request<ValidateResetResponse>(`validate-reset?token=${token}`, {
      method: 'GET',
    });
  }

  async resetPassword(token: string, password: string): Promise<ResetPasswordResponse> {
    return this.request<ResetPasswordResponse>('reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    return this.request<ForgotPasswordResponse>('forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }
}

export const apiClient = new ApiClient();