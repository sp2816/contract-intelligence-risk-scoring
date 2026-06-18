// src/utils/tokenManager.js
/**
 * Centralized JWT token manager.
 * Uses two separate localStorage keys to keep token and user profile separate:
 *   - `cirs_access_token` stores the raw JWT string.
 *   - `cirs_user` stores a JSON stringified user object (excluding token).
 *
 * This design mirrors the original project conventions while providing
 * convenience helpers for expiry detection and token refresh.
 */

// ---------------------------------------------------------------------------
// Storage keys
// ---------------------------------------------------------------------------
const TOKEN_KEY = 'cirs_access_token'
const USER_KEY = 'cirs_user'

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------
export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || null
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    removeToken()
  }
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
}

// ---------------------------------------------------------------------------
// User helpers (profile without token)
// ---------------------------------------------------------------------------
export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    console.error('Failed to parse stored user data:', e)
    return null
  }
}

export function setStoredUser(user) {
  try {
    const payload = JSON.stringify(user)
    localStorage.setItem(USER_KEY, payload)
  } catch (e) {
    console.error('Failed to store user data:', e)
  }
}

export function removeStoredUser() {
  localStorage.removeItem(USER_KEY)
}

// ---------------------------------------------------------------------------
// Session clear – token AND user data
// ---------------------------------------------------------------------------
export function clearSession() {
  removeToken()
  removeStoredUser()
}

// ---------------------------------------------------------------------------
// JWT expiry utilities (payload is base64‑url encoded)
// ---------------------------------------------------------------------------
export function decodeTokenPayload() {
  const token = getToken()
  if (!token) return null
  try {
    const payload = token.split('.')[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

export function isTokenExpired() {
  const payload = decodeTokenPayload()
  if (!payload || !payload.exp) return true
  // exp is seconds since epoch
  return Date.now() >= payload.exp * 1000
}

// ---------------------------------------------------------------------------
// Refresh token flow – expects a configured axios instance (e.g., axiosClient)
// ---------------------------------------------------------------------------
export async function refreshToken(axiosInstance) {
  try {
    const response = await axiosInstance.post('/auth/refresh-token')
    const newToken = response?.token || response?.access_token || response?.data?.token
    if (newToken) {
      setToken(newToken)
      return newToken
    }
    return null
  } catch (err) {
    console.warn('Token refresh failed', err)
    clearSession()
    return null
  }
}

export default {
  getToken,
  setToken,
  removeToken,
  getStoredUser,
  setStoredUser,
  removeStoredUser,
  clearSession,
  isTokenExpired,
  refreshToken,
}
