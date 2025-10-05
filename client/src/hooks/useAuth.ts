import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { getApiUrl } from "@/config";

type JwtUser = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  licenseExpiry?: string | null;
};

export function useAuth() {
  const { data: v2Data, isLoading } = useQuery<{ data: { user: JwtUser } } | null>({
    queryKey: [getApiUrl("/api/v2/user/data")],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  return {
    user: (v2Data as any)?.data?.user ?? null,
    isLoading,
    isAuthenticated: !!(v2Data as any)?.data?.user,
  };
}
