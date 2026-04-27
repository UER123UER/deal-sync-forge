import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';
import { getNextOnboardingPath, useOnboardingStatus } from '@/hooks/useOnboardingStatus';
import { supabase } from '@/integrations/supabase/client';

const ONBOARDING_PATHS = new Set([
  '/onboarding/agreement',
  '/onboarding/billing',
  '/onboarding/deposit',
  '/onboarding/payment',
]);

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [subStatus, setSubStatus] = useState<string | null>(null);
  const [subLoading, setSubLoading] = useState(true);
  const { data: onboardingStatus, isLoading: onboardingLoading } = useOnboardingStatus();

  useEffect(() => {
    if (!user) {
      setSubLoading(false);
      return;
    }

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

  if (loading || subLoading || onboardingLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  const isOnboardingRoute = ONBOARDING_PATHS.has(location.pathname);
  const nextPath = getNextOnboardingPath(onboardingStatus);

  if (subStatus && subStatus !== 'active') {
    if (!isOnboardingRoute || location.pathname !== nextPath) {
      return <Navigate to={nextPath} replace />;
    }
  }

  if (subStatus === 'active' && isOnboardingRoute) {
    return <Navigate to="/transactions" replace />;
  }

  return <>{children}</>;
}
