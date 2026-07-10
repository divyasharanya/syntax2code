import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps a route so only users with role:"admin" can access it.
 * Anyone else — including authenticated non-admins — is redirected to /.
 * While auth is still loading, shows a spinner.
 */
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
