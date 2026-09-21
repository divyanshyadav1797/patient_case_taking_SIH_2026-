import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, DEFAULT_USERS } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on application startup
  useEffect(() => {
    const session = authService.getCurrentSession();
    if (session && session.user) {
      setUser(session.user);
    }
    setLoading(false);
  }, []);

  const login = async (role, credentials) => {
    setLoading(true);
    try {
      const session = await authService.login(role, credentials);
      setUser(session.user);
      return session.user;
    } finally {
      setLoading(false);
    }
  };

  const register = async (role, formData) => {
    setLoading(true);
    try {
      const session = await authService.register(role, formData);
      setUser(session.user);
      return session.user;
    } finally {
      setLoading(false);
    }
  };

  const completeOtpRegistration = async (payload) => {
    setLoading(true);
    try {
      const session = await authService.completeOtpRegistration(payload);
      setUser(session.user);
      return session.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    role: user?.role || null,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    completeOtpRegistration,
    fetchAadhaar: (aadhaar) => authService.fetchAadhaar(aadhaar),
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
