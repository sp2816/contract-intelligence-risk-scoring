import axiosClient from './axiosClient'

/**
 * Auth API service.
 *
 * Endpoints match the Flask backend at `/api/auth/*`:
 *   POST /api/auth/signup   → register
 *   POST /api/auth/login    → login
 *   POST /api/auth/logout   → logout
 *   GET  /api/auth/me       → getCurrentUser
 *   PUT  /api/auth/preferences → updatePreferences
 *
 * Because axiosClient's response interceptor already unwraps `.data`,
 * callers receive the payload object directly.
 */

/**
 * Register a new user.
 * @param {{ fullname: string, email: string, password: string }} payload
 */
export async function register(payload) {
  return axiosClient.post('/auth/signup', {
    fullname: payload.fullname || payload.name,
    email: payload.email,
    password: payload.password,
  })
}

/**
 * Login with existing credentials.
 * @param {{ email: string, password: string }} credentials
 */
export async function login(credentials) {
  return axiosClient.post('/auth/login', {
    email: credentials.email,
    password: credentials.password,
  })
}

/**
 * Logout the current user (server-side token invalidation is optional).
 */
export async function logout() {
  return axiosClient.post('/auth/logout')
}

/**
 * Fetch the currently authenticated user profile.
 */
export async function getCurrentUser() {
  return axiosClient.get('/auth/me')
}

/**
 * Update preferences for the current user.
 * @param {object} preferences
 */
export async function updatePreferences(preferences) {
  return axiosClient.put('/auth/preferences', preferences)
}

/**
 * Request a password reset link.
 * @param {string} email
 */
export async function forgotPassword(email) {
  return axiosClient.post('/auth/forgot-password', { email })
}

/**
 * Reset password using a valid recovery token.
 * @param {{ email: string, token: string, password: string }} payload
 */
export async function resetPassword(payload) {
  return axiosClient.post('/auth/reset-password', payload)
}


/**
 * Change the current user's password.
 * @param {{ currentPassword: string, newPassword: string }} payload
 */
export async function changePassword(payload) {
  return axiosClient.put('/auth/change-password', payload)
}