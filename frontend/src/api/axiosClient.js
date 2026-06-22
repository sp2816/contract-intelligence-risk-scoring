import axios from 'axios'
import { getToken, clearSession } from '../utils/tokenManager'

/**
 * Shared Axios instance for the CIRS backend.
 *
 * • Reads `VITE_API_BASE_URL` from .env (falls back to localhost:5000/api)
 * • Automatically attaches the JWT token to every request
 * • Normalizes error responses into a predictable shape
 * • On 401 clears the session and redirects to /login
 */
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// ─── Request interceptor ─────────────────────────────────────────────────────

axiosClient.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ─── Response interceptor ────────────────────────────────────────────────────

axiosClient.interceptors.response.use(
  // Success — unwrap `.data` so callers receive the payload directly
  (response) => response.data,

  (error) => {
    // ---------- Network / CORS / timeout (no response object) ----------
    if (!error?.response) {
      const message =
        error?.message === 'Network Error'
          ? 'Unable to reach the server. Please check your connection or try again later.'
          : error?.code === 'ECONNABORTED'
          ? 'The request timed out. The server may be busy — please try again.'
          : error?.message || 'An unexpected network error occurred.'
      return Promise.reject({ message, status: 0, code: error?.code || 'ERR_NETWORK' })
    }

    const { status, data } = error.response

    // ---------- 401 Unauthorized — session expired / invalid token ------
    if (status === 401) {
      clearSession()
      // Only redirect when we're not already on the login page
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }

    // ---------- Status-specific user-friendly messages ------------------
    const STATUS_MESSAGES = {
      400: 'Invalid request. Please check your input and try again.',
      403: 'You do not have permission to perform this action.',
      404: 'The requested resource was not found.',
      408: 'The request timed out. Please try again.',
      413: 'The file is too large. Please upload a smaller file.',
      429: 'Too many requests. Please wait a moment and try again.',
      500: 'An internal server error occurred. Please try again later.',
      502: 'The server is temporarily unavailable. Please try again later.',
      503: 'The service is temporarily unavailable for maintenance. Please try again later.',
    }

    // ---------- Structured error from backend --------------------------
    if (data && typeof data === 'object') {
      return Promise.reject({
        message: data.message || data.msg || data.detail || STATUS_MESSAGES[status] || 'Request failed.',
        status,
        errors: data.errors || null, // field-level errors if any
      })
    }

    // ---------- Fallback -----------------------------------------------
    return Promise.reject({
      message: typeof data === 'string' ? data : (STATUS_MESSAGES[status] || 'Request failed.'),
      status,
    })
  },
)

export default axiosClient
