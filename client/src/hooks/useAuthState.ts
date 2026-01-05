import { trpc } from "@/lib/trpc";
import type { AuthState } from "@shared/types";

export function useAuthState(): AuthState {
  const { data: user, isLoading } = trpc.auth.me.useQuery();

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";
  const isApproved = user?.profile?.approved ?? false;
  const needsOnboarding = isAuthenticated && !user?.profile?.displayName;

  return {
    user: user ?? null,
    loading: isLoading,
    isAuthenticated,
    isAdmin,
    isApproved: isAdmin || isApproved, // Admin is always approved
    needsOnboarding,
  };
}
