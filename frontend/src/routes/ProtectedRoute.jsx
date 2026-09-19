import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute Guard
 * Checks authentication status and allowed user roles.
 * - If not authenticated: redirects to /login with return location
 * - If authenticated but unauthorized for the requested role:
 *   redirects user to their own portal dashboard
 */
export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#0F172A',
        color: '#38BDF8',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}></i>
          <p style={{ fontSize: '1rem', color: '#94A3B8' }}>Verifying authorization...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // User is authenticated but does not have permission for this role's portal
    const fallbackPath = `/${user.role}/dashboard`;
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
}
