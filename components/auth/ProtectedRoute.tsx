import { useEffect, useState } from "react";

import { useAuth } from "@/components/providers/auth-provider";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoading && !user && !isRedirecting) {
        console.log("[ProtectedRoute] No authenticated user detected, redirecting to login");
        setIsRedirecting(true);
        
        try {
          // Clear any invalid sessions
          localStorage.removeItem("auth_session");
          document.cookie = "auth_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        } catch (e) {
          console.error("[ProtectedRoute] Error clearing session:", e);
        }

        // Force immediate redirect
        window.location.href = "/login";
      }
    };

    checkAuth();
  }, [user, isLoading, isRedirecting]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
      </div>
    );
  }

  // If not authenticated and not loading, don't render children
  if (!user && !isLoading) {
    return null;
  }

  // If authenticated, render children
  return <>{children}</>;
}