import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  login as apiLogin, 
  register as apiRegister, 
  logout as apiLogout, 
  getCurrentUser 
} from '../api/authApi';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const response = await getCurrentUser();
          setUser(response.user || response); // Adjust based on your API response structure
        } catch (err) {
          console.error("Failed to fetch user, token might be expired", err);
          handleLogout(); // clear invalid token
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  // Handle setting token in local storage and state
  const handleSetToken = (newToken) => {
    if (newToken) {
      localStorage.setItem('token', newToken);
      setToken(newToken);
    } else {
      localStorage.removeItem('token');
      setToken(null);
    }
  };

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiLogin(credentials);
      handleSetToken(data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRegister(userData);
      handleSetToken(data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      // Optional: notify server about logout
      if (token) {
        await apiLogout().catch(console.error);
      }
    } finally {
      handleSetToken(null);
      setUser(null);
      setLoading(false);
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout: handleLogout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
