import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requireOnboarding?: boolean;
  requireSubscription?: boolean;
}

const ProtectedRoute = ({ children, requireOnboarding = false, requireSubscription = false }: ProtectedRouteProps) => {
  const { user, userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 1. Must be logged in
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // 2. Profile must be loaded to make further decisions
  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 3. Subscription Check
  if (requireSubscription && userProfile.subscriptionStatus !== 'active') {
    return <Navigate to="/payment" replace />;
  }

  // 4. Onboarding Check
  // If we require onboarding, and it's not done, go to assessment
  if (requireOnboarding && !userProfile.onboardingCompleted) {
    return <Navigate to="/assessment" replace />;
  }

  // Special Case: If we are ON the assessment page, but already finished it, go to dashboard
  if (location.pathname === '/assessment' && userProfile.onboardingCompleted) {
    return <Navigate to="/dashboard" replace />;
  }

  // Special Case: If we are ON the payment page, but already active, go to dashboard
  if (location.pathname === '/payment' && userProfile.subscriptionStatus === 'active') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;