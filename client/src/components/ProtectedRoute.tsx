
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requireOnboarding?: boolean;
  requireSubscription?: boolean;
  requiredRole?: string;
}

const ProtectedRoute = ({ 
  children, 
  requireOnboarding = false, 
  requireSubscription = false,
  requiredRole
}: ProtectedRouteProps) => {
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

  // 2. Profile must be loaded
  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 3. Role Check
  if (requiredRole && userProfile.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  // 4. Subscription Check
  if (requireSubscription && userProfile.subscriptionStatus !== 'active') {
    return <Navigate to="/payment" replace />;
  }

  // 5. Onboarding Check
  if (requireOnboarding && !userProfile.onboardingCompleted) {
    return <Navigate to="/assessment" replace />;
  }

  // Special Case: If we are ON the assessment page, but already finished it
  if (location.pathname === '/assessment' && userProfile.onboardingCompleted) {
    return <Navigate to="/dashboard" replace />;
  }

  // Special Case: If we are ON the payment page, but already active
  if (location.pathname === '/payment' && userProfile.subscriptionStatus === 'active') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
