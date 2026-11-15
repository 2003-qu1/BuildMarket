import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function AdminProtectedRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner size="lg" text="Verifying admin credentials..." />;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" state={{ from: location, message: 'Admin access required' }} replace />;
  }

  return children;
}
