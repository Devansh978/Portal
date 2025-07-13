import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { authService, type AuthUser } from "@/lib/auth";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(authService.getUser());
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Only check if we have a token but no user data
    if (authService.getToken() && !user) {
      checkAuth();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const login = async (credentials: { username: string; password: string }) => {
    const response = await authService.login(credentials);
    setUser(response.user);
    return response;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    hasRole: (roles: string[]) => user ? roles.includes(user.role) : false,
    hasPermission: (permission: string) => authService.hasPermission(permission),
  };
}
