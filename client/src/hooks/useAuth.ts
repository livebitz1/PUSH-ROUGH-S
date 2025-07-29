import { useQuery } from "@tanstack/react-query";

interface User {
  id: number;
  phoneNumber: string;
  email?: string;
  fullName?: string;
  age?: number;
  gender?: string;
  address?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: Infinity,
    gcTime: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchInterval: false,
  });

  // If there's an error (401), consider user as not authenticated
  const isAuthenticated = !!user && !error;

  return {
    user,
    isLoading,
    isAuthenticated,
  };
}
