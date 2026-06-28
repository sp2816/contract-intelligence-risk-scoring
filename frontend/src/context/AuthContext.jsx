import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getCurrentUser,
} from '../api/auth'
import {
  getToken,
  setToken,
  clearSession,
  getStoredUser,
  setStoredUser,
  isTokenExpired,
} from '../utils/tokenManager'

const AuthContext = createContext(null)

// ──────────────────────────────────────────────────────────────────────────────
// Provider
// ──────────────────────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser())
  const [token, setTokenState] = useState(() => getToken())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ---------- Persist token + sync React state ─────────────────────────────
  const persistToken = useCallback((newToken) => {
    setToken(newToken) // localStorage
    setTokenState(newToken) // React state
  }, [])

  const persistUser = useCallback((newUser) => {
    setStoredUser(newUser)
    setUser(newUser)
  }, [])

  // ---------- Boot: revalidate session on mount ────────────────────────────
  useEffect(() => {
    let cancelled = false

    async function initAuth() {
      const storedToken = getToken()
      if (!storedToken || isTokenExpired()) {
        clearSession()
        setUser(null)
        setTokenState(null)
        setLoading(false)
        return
      }

      try {
        const data = await getCurrentUser()
        if (!cancelled) {
          const userData = data.user || data
          persistUser(userData)
        }
      } catch {
        // Token invalid / server unreachable — clear everything
        if (!cancelled) {
          clearSession()
          setUser(null)
          setTokenState(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    initAuth()
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- Login ────────────────────────────────────────────────────────
  const login = useCallback(async (credentials) => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiLogin(credentials)
      persistToken(data.token || data.access_token)
      persistUser(data.user || data)
      return data
    } catch (err) {
      const msg = err?.message || 'Login failed. Please check your credentials.'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [persistToken, persistUser])

  // ---------- Register ─────────────────────────────────────────────────────
  const register = useCallback(async (userData) => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiRegister(userData)
      // Some backends auto-login after signup (return token); others don't.
      if (data.token || data.access_token) {
        persistToken(data.token || data.access_token)
        persistUser(data.user || data)
      }
      return data
    } catch (err) {
      const msg = err?.message || 'Registration failed. Please try again.'
      console.log(err);
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [persistToken, persistUser])

  // ---------- Logout ───────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    setLoading(true)
    try {
      await apiLogout().catch(() => {})
    } finally {
      clearSession()
      setUser(null)
      setTokenState(null)
      setError(null)
      setLoading(false)
    }
  }, [])

  // ---------- Clear error helper ───────────────────────────────────────────
  const clearError = useCallback(() => setError(null), [])

  // ---------- Update Preferences ───────────────────────────────────────────
  // Merges new prefs into the stored user object (local-only; extend with API
  // call here when the backend endpoint is ready).
  const updatePrefs = useCallback(async (prefs) => {
    const updated = {
      ...(user || {}),
      preferences: {
        ...(user?.preferences || {}),
        ...prefs,
      },
    }
    persistUser(updated)
    return updated
  }, [user, persistUser])

  // ---------- Context value ────────────────────────────────────────────────
  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    clearError,
    updatePrefs,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// Hook — exported under BOTH names so every consumer works
// ──────────────────────────────────────────────────────────────────────────────

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an <AuthProvider>')
  return ctx
}

// Alias used by ProtectedRoute and some components
export const useAuth = useAuthContext

export default AuthContext
