import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('opspilot_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(localStorage.getItem('opspilot_token') || null);
  const [loading, setLoading] = useState(() => {
    const hasToken = !!localStorage.getItem('opspilot_token');
    const hasUser = !!localStorage.getItem('opspilot_user');
    return hasToken && !hasUser;
  });

  const logout = () => {
    localStorage.removeItem('opspilot_token');
    localStorage.removeItem('opspilot_user');
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('opspilot_token');
    if (!storedToken) {
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        const res = await api.getMe();
        if (res?.user) {
          setUser(res.user);
          localStorage.setItem('opspilot_user', JSON.stringify(res.user));
        }
      } catch (err) {
        console.warn('Auth token expired or invalid:', err.message);
        if (localStorage.getItem('opspilot_token') === storedToken) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    localStorage.setItem('opspilot_token', res.token);
    localStorage.setItem('opspilot_user', JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
    setLoading(false);
    return res.user;
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    localStorage.setItem('opspilot_token', res.token);
    localStorage.setItem('opspilot_user', JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
    setLoading(false);
    return res.user;
  };

  // 1-Click Role Switcher for Hackathon Demonstration & Evaluation
  const quickLoginAs = async (role) => {
    const demoAccounts = {
      employee: { email: 'employee@opspilot.com', password: 'password123' },
      agent: { email: 'agent@opspilot.com', password: 'password123' },
      admin: { email: 'admin@opspilot.com', password: 'password123' }
    };

    const target = demoAccounts[role];
    if (target) {
      return await login(target.email, target.password);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        quickLoginAs,
        isAuthenticated: !!user,
        isEmployee: user?.role === 'employee',
        isAgent: user?.role === 'agent',
        isAdmin: user?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
