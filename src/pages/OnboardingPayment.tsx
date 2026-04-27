import { Navigate } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';
import { getNextOnboardingPath, useOnboardingStatus } from '@/hooks/useOnboardingStatus';

export default function OnboardingPayment() {
  const { user, profile, loading: authLoading } = useAuth();
  const { data: onboardingStatus, isLoading } = useOnboardingStatus({ user, profile, loading: authLoading });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return <Navigate to={getNextOnboardingPath(onboardingStatus)} replace />;
}
