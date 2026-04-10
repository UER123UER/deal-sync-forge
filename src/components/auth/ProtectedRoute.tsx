import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [subStatus, setSubStatus] = useState<string | null>(null);
  const [subLoading, setSubLoading] = useState(true);

  // Fetch subscription status directly from DB on every render — avoids stale React state
  useEffect(() => {
    if (!user) { setSubLoading(false); return; }
    supabase
      .from('profiles')
      .select('subscription_status')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        setSubStatus(data?.subscription_status ?? null);
        setSubLoading(false);
      });
  }, [user]);

  if (loading || subLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (subStatus && subStatus !== 'active') {
    if (location.pathname !== '/onboarding/payment') {
      return <Navigate to="/onboarding/payment" replace />;
    }
  }

  return <>{children}</>;
}
