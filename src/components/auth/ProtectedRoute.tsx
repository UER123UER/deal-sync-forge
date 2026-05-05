import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';
import { getFallbackOnboardingStatus, getNextOnboardingPath, useOnboardingStatus } from '@/hooks/useOnboardingStatus';

const ONBOARDING_PATHS = new Set([
  '/onboarding/agreement',
  '/onboarding/billing',
  '/onboarding/deposit',
  '/onboarding/payment',
]);

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const isAgreementRoute = location.pathname === '/onboarding/agreement';
  const {
    data: onboardingStatus,
    error: onboardingError,
    isLoading: onboardingLoading,
  } = useOnboardingStatus({ user, profile, loading });
  const isOnboardingRoute = ONBOARDING_PATHS.has(location.pathname);

  if (loading || (!isOnboardingRoute && onboardingLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  const effectiveStatus = onboardingError
    ? getFallbackOnboardingStatus({ user, profile })
    : onboardingStatus ?? getFallbackOnboardingStatus({ user, profile });
  const nextPath = getNextOnboardingPath(effectiveStatus);
  const subscriptionStatus = effectiveStatus.subscriptionStatus;
  const billingComplete = subscriptionStatus === 'active' || effectiveStatus.billingWaived;

  if (isAgreementRoute && subscriptionStatus !== 'active') {
    return <>{children}</>;
  }

  if (!billingComplete || !effectiveStatus.hasDepositAccount) {
    if (!isOnboardingRoute || location.pathname !== nextPath) {
      return <Navigate to={nextPath} replace />;
    }
  }

  if (billingComplete && effectiveStatus.hasDepositAccount && isOnboardingRoute) {
    return <Navigate to="/transactions" replace />;
  }

  return <>{children}</>;
}
