import api from './axios';

/**
 * Login user
 * @param {Object} credentials - { email, password }
 */
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

/**
 * Register new user
 * @param {Object} userData - { name, email, password, etc. }
 */
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

/**
 * Logout user
 */
export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

/**
 * Refresh JWT token
 */
export const refreshToken = async () => {
  const response = await api.post('/auth/refresh-token');
  return response.data;
};

/**
 * Get current user profile
 */
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};
