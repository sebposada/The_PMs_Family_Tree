import { useAuthState } from "@/hooks/useAuthState";
import { getLoginUrl } from "@/const";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireApproval?: boolean;
  requireAdmin?: boolean;
}

export function RouteGuard({ 
  children, 
  requireAuth = false,
  requireApproval = false,
  requireAdmin = false,
}: RouteGuardProps) {
  const auth = useAuthState();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (auth.loading) return;

    // Redirect to login if auth required but not authenticated
    if (requireAuth && !auth.isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    // Redirect to onboarding if needs display name
    if (auth.isAuthenticated && auth.needsOnboarding && window.location.pathname !== "/onboarding") {
      setLocation("/onboarding");
      return;
    }

    // Redirect to pending if not approved
    if (requireApproval && auth.isAuthenticated && !auth.isApproved && window.location.pathname !== "/pending") {
      setLocation("/pending");
      return;
    }

    // Redirect to home if admin required but not admin
    if (requireAdmin && !auth.isAdmin) {
      setLocation("/");
      return;
    }
  }, [auth, requireAuth, requireApproval, requireAdmin, setLocation]);

  // Show loading state
  if (auth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render if redirecting
  if (requireAuth && !auth.isAuthenticated) {
    return null;
  }

  if (auth.isAuthenticated && auth.needsOnboarding && window.location.pathname !== "/onboarding") {
    return null;
  }

  if (requireApproval && auth.isAuthenticated && !auth.isApproved && window.location.pathname !== "/pending") {
    return null;
  }

  if (requireAdmin && !auth.isAdmin) {
    return null;
  }

  return <>{children}</>;
}
