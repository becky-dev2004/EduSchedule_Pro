// ============================================
// EduSchedule Pro — Protection des routes
// ============================================
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();

  // Chargement en cours
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  // Non connecté
  if (!user) return <Navigate to="/login" />;

  // Rôle non autorisé
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default PrivateRoute;