import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function NotFound() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const handleReturn = () => {
    if (isAuthenticated && user?.role) {
      navigate(`/${user.role}/dashboard`);
    } else {
      navigate('/login');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
      color: '#F8FAFC',
      fontFamily: 'Inter, sans-serif',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
        background: 'rgba(30, 41, 59, 0.8)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '1.5rem',
        padding: '3rem 2rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 1.5rem',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '2px solid rgba(239, 68, 68, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#EF4444',
          fontSize: '2.5rem'
        }}>
          <i className="fa-solid fa-triangle-exclamation"></i>
        </div>

        <h1 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.05em', margin: '0 0 0.5rem', color: '#F1F5F9' }}>
          404
        </h1>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#CBD5E1', margin: '0 0 1rem' }}>
          Page Not Found
        </h2>
        <p style={{ fontSize: '0.95rem', color: '#94A3B8', lineHeight: 1.6, margin: '0 0 2rem' }}>
          The requested page could not be located or you may not have sufficient clinical permissions to view this resource.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={handleReturn}
            style={{
              background: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              padding: '0.85rem 1.75rem',
              borderRadius: '0.75rem',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)'
            }}
          >
            <i className="fa-solid fa-house"></i>
            Return to {isAuthenticated ? 'Portal' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
}
