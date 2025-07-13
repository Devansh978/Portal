// src/lib/auth.ts
import { apiRequest } from "./queryClient";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  company?: string;
  role: UserRole;
  isVerified?: boolean;
  createdAt?: string;
}

export type UserRole = "super_admin" | "admin" | "ca" | "builder" | "broker" | "user" | "telecaller";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  role: UserRole;
  company: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: AuthUser;
  message?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

class AuthService {
  private token: string | null = null;
  private refreshToken: string | null = null;
  private user: AuthUser | null = null;
  private readonly baseUrl = "https://homobiebackend-railway-production.up.railway.app";
  private tokenRefreshPromise: Promise<void> | null = null;

  constructor() {
    this.loadFromStorage();
    this.setupTokenRefresh();
  }

  // Initialize from localStorage
  private loadFromStorage() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token");
      this.refreshToken = localStorage.getItem("auth_refresh_token");
      const userData = localStorage.getItem("auth_user");
      this.user = userData ? JSON.parse(userData) : null;
    }
  }

  // Save auth data to storage
  private saveToStorage(token: string, refreshToken: string, user: AuthUser) {
    this.token = token;
    this.refreshToken = refreshToken;
    this.user = user;

    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_refresh_token", refreshToken);
      localStorage.setItem("auth_user", JSON.stringify(user));
    }
  }

  // Clear auth data
  private clearStorage() {
    this.token = null;
    this.refreshToken = null;
    this.user = null;

    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_refresh_token");
      localStorage.removeItem("auth_user");
    }
  }

  // Setup automatic token refresh
  private setupTokenRefresh() {
    if (typeof window !== "undefined" && this.token && this.refreshToken) {
      // Refresh token 1 minute before expiration
      const jwt = this.parseJwt(this.token);
      if (jwt && jwt.exp) {
        const expiresIn = (jwt.exp * 1000) - Date.now() - 60000;
        if (expiresIn > 0) {
          setTimeout(() => this.refreshAuthToken(), expiresIn);
        }
      }
    }
  }

  // Parse JWT token
  private parseJwt(token: string) {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }

  // Register new user
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiRequest<AuthResponse>(`${this.baseUrl}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.token || !response.user) {
        throw new Error("Invalid response from server");
      }

      this.saveToStorage(
        response.token,
        response.refreshToken || "",
        response.user
      );
      this.setupTokenRefresh();

      return response;
    } catch (error) {
      this.handleApiError(error, "Registration failed");
      throw error;
    }
  }

  // User login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiRequest<AuthResponse>(`${this.baseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.token || !response.user) {
        throw new Error("Invalid credentials");
      }

      this.saveToStorage(
        response.token,
        response.refreshToken || "",
        response.user
      );
      this.setupTokenRefresh();

      return response;
    } catch (error) {
      this.handleApiError(error, "Login failed");
      throw error;
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      if (this.token) {
        await apiRequest(`${this.baseUrl}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      this.clearStorage();
    }
  }

  // Refresh auth token
  private async refreshAuthToken(): Promise<void> {
    if (!this.refreshToken || this.tokenRefreshPromise) return;

    try {
      this.tokenRefreshPromise = apiRequest<AuthResponse>(`${this.baseUrl}/auth/refresh`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.refreshToken}`,
        },
      }).then(response => {
        if (response.token && response.user) {
          this.saveToStorage(
            response.token,
            response.refreshToken || this.refreshToken || "",
            response.user
          );
          this.setupTokenRefresh();
        }
      }).finally(() => {
        this.tokenRefreshPromise = null;
      });

      await this.tokenRefreshPromise;
    } catch (error) {
      this.clearStorage();
      console.error("Token refresh failed:", error);
    }
  }

  // Get current user (with optional force refresh)
  async getCurrentUser(forceRefresh = false): Promise<AuthUser | null> {
    if (!this.token) return null;

    if (forceRefresh) {
      try {
        const response = await apiRequest<{ user: AuthUser }>(`${this.baseUrl}/auth/me`, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });

        if (response.user) {
          this.user = response.user;
          if (typeof window !== "undefined") {
            localStorage.setItem("auth_user", JSON.stringify(response.user));
          }
          return response.user;
        }
      } catch (error) {
        console.error("Failed to refresh user data:", error);
      }
    }

    return this.user;
  }

  // Verify email
  async verifyEmail(token: string): Promise<AuthResponse> {
    try {
      const response = await apiRequest<AuthResponse>(`${this.baseUrl}/auth/verify-email`, {
        method: "POST",
        body: JSON.stringify({ token }),
      });

      if (response.token && response.user) {
        this.saveToStorage(
          response.token,
          response.refreshToken || this.refreshToken || "",
          response.user
        );
        this.setupTokenRefresh();
      }

      return response;
    } catch (error) {
      this.handleApiError(error, "Email verification failed");
      throw error;
    }
  }

  // Request password reset
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    return apiRequest(`${this.baseUrl}/auth/request-password-reset`, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
    try {
      const response = await apiRequest<AuthResponse>(`${this.baseUrl}/auth/reset-password`, {
        method: "POST",
        body: JSON.stringify({ token, newPassword }),
      });

      if (response.token && response.user) {
        this.saveToStorage(
          response.token,
          response.refreshToken || "",
          response.user
        );
        this.setupTokenRefresh();
      }

      return response;
    } catch (error) {
      this.handleApiError(error, "Password reset failed");
      throw error;
    }
  }

  // Get current token
  getToken(): string | null {
    return this.token;
  }

  // Get current user
  getUser(): AuthUser | null {
    return this.user;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  // Check if user has specific role
  hasRole(roles: UserRole[]): boolean {
    return this.user ? roles.includes(this.user.role) : false;
  }

  // Check if user has permission
  hasPermission(permission: string): boolean {
    if (!this.user) return false;

    const rolePermissions: Record<UserRole, string[]> = {
      super_admin: [
        "manage_users",
        "manage_all_leads",
        "view_audit_logs",
        "manage_crm_integrations",
        "assign_leads",
        "delete_leads",
      ],
      admin: [
        "manage_users",
        "manage_all_leads",
        "view_audit_logs",
        "assign_leads",
        "delete_leads",
      ],
      telecaller: [
        "manage_all_leads",
        "customize_leads",


      ],
      ca: [
        "manage_all_leads",
        "view_audit_logs",
      ],
      builder: [
        "view_own_leads",
        "create_leads",
      ],
      broker: [
        "view_own_leads",
        "create_leads",
        "manage_own_leads",
      ],
      user: [
        "view_own_leads",
      ],
    };

    return rolePermissions[this.user.role]?.includes(permission) || false;
  }

  // Handle API errors
  private handleApiError(error: unknown, defaultMessage: string): never {
    if (typeof error === "object" && error !== null) {
      const apiError = error as ApiError;

      if (apiError.status === 401) {
        this.clearStorage();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }

      throw new Error(apiError.message || defaultMessage);
    } else if (typeof error === "string") {
      throw new Error(error);
    } else {
      throw new Error(defaultMessage);
    }
  }
}

export const authService = new AuthService();

// Enhanced authenticated fetch
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = authService.getToken();

  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  headers.set("Content-Type", "application/json");

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Try to refresh token if we have a refresh token
      if (authService.getToken() && authService.getUser()) {
        await authService.refreshAuthToken();
        const newToken = authService.getToken();
        if (newToken) {
          headers.set("Authorization", `Bearer ${newToken}`);
          return fetch(url, {
            ...options,
            headers,
          });
        }
      }

      // If still unauthorized, logout
      await authService.logout();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new Error("Session expired. Please login again.");
    }

    return response;
  } catch (error) {
    if (error instanceof Error && error.message.includes("Session expired")) {
      throw error;
    }
    throw new Error("Network request failed");
  }
}