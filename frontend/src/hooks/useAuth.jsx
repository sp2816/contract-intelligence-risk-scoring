/**
 * useAuth hook — convenience re-export from AuthContext.
 */
import { useAuthContext } from '../context/AuthContext.jsx'

export function useAuth() {
  return useAuthContext()
}
