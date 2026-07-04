import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import {
  getCurrentUser,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
} from '../api/auth'
import {
  clearSession,
  getStoredUser,
  getToken,
  isTokenExpired,
  setStoredUser,
  setToken,
} from '../utils/tokenManager'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser())
  const [token, setTokenState] = useState(() => getToken())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const persistToken = useCallback((newToken) => {
    setToken(newToken)
    setTokenState(newToken)
  }, [])

  const persistUser = useCallback((newUser) => {
    setStoredUser(newUser)
    setUser(newUser)
  }, [])

  useEffect(() => {
    let active = true

    async function initAuth() {
      const storedToken = getToken()
      if (!storedToken || isTokenExpired()) {
        clearSession()
        if (active) {
          setUser(null)
          setTokenState(null)
          setLoading(false)
        }
        return
      }

      try {
        const data = await getCurrentUser()
        if (active) {
          persistUser(data.user || data)
        }
      } catch {
        if (active) {
          clearSession()
          setUser(null)
          setTokenState(null)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    initAuth()
    return () => {
      active = false
    }
  }, [persistUser])

  const login = useCallback(async (credentials) => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiLogin(credentials)
      persistToken(data.token || data.access_token)
      persistUser(data.user || data)
      return data
    } catch (err) {
      const message = err?.message || 'Login failed. Please check your credentials.'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [persistToken, persistUser])

  const register = useCallback(async (userData) => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiRegister(userData)
      if (data.token || data.access_token) {
        persistToken(data.token || data.access_token)
        persistUser(data.user || data)
      }
      return data
    } catch (err) {
      const message = err?.message || 'Registration failed. Please try again.'
      console.error('Registration failed', err)
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [persistToken, persistUser])

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

  const clearError = useCallback(() => setError(null), [])

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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an <AuthProvider>')
  return ctx
}

export const useAuth = useAuthContext

export default AuthContext
