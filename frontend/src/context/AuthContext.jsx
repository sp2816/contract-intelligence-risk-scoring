import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { login as loginRequest, register as registerRequest } from '../api/auth.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = window.localStorage.getItem('ai-contract-user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) {
      window.localStorage.setItem('ai-contract-user', JSON.stringify(user))
    } else {
      window.localStorage.removeItem('ai-contract-user')
    }
  }, [user])

  const login = async (credentials) => {
    setLoading(true)
    setError(null)

    try {
      const response = await loginRequest(credentials)
      setUser(response.user)
      return response
    } catch (err) {
      setError(err?.message || 'Unable to sign in')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const register = async (payload) => {
    setLoading(true)
    setError(null)

    try {
      const response = await registerRequest(payload)
      setUser(response.user)
      return response
    } catch (err) {
      setError(err?.message || 'Unable to create account')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
  }

  const value = useMemo(
    () => ({ user, loading, error, login, register, logout }),
    [user, loading, error],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return context
}
