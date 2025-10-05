import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "./queryClient";
import { useLocation } from "wouter";
import { getApiUrl } from "@/config";

/**
 * Centralized logout utility hook
 * Provides consistent logout functionality across the application
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async () => {
      // Clear local JWT token
      localStorage.removeItem('deskai_jwt');
      
      // Notify server to clear session (for completeness)
      try {
        await apiRequest("POST", getApiUrl("/api/logout"));
      } catch (error) {
        // Ignore server errors - local logout is the primary concern
        // Log in development only
        if (import.meta.env.MODE === 'development') {
          console.warn("Server logout failed:", error);
        }
      }
    },
    onSuccess: () => {
      // Clear all authentication-related query data
      queryClient.setQueryData([getApiUrl("/api/v2/user/data")], null as any);
      queryClient.setQueryData([getApiUrl("/api/user")], null as any);
      
      // Invalidate all queries to ensure fresh data on next login
      queryClient.invalidateQueries({ queryKey: [getApiUrl("/api/v2/user/data")] });
      queryClient.invalidateQueries({ queryKey: [getApiUrl("/api/user")] });
      queryClient.invalidateQueries({ queryKey: [getApiUrl("/api/subscription")] });
      queryClient.invalidateQueries({ queryKey: [getApiUrl("/api/usage-stats")] });
      
      // Redirect to auth page
      setLocation("/auth");
    },
    onError: (error) => {
      // Log in development only
      if (import.meta.env.MODE === 'development') {
        console.error("Logout error:", error);
      }
      
      // Even if logout fails, clear local state and redirect
      queryClient.setQueryData([getApiUrl("/api/v2/user/data")], null as any);
      queryClient.setQueryData([getApiUrl("/api/user")], null as any);
      queryClient.invalidateQueries({ queryKey: [getApiUrl("/api/v2/user/data")] });
      queryClient.invalidateQueries({ queryKey: [getApiUrl("/api/user")] });
      queryClient.invalidateQueries({ queryKey: [getApiUrl("/api/subscription")] });
      queryClient.invalidateQueries({ queryKey: [getApiUrl("/api/usage-stats")] });
      
      setLocation("/auth");
    },
  });
}