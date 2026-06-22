/**
 * authApi.js — re-export from auth.js for backward compatibility.
 * New code should import directly from './auth.js'.
 */
export { login, register, logout, getCurrentUser, updatePreferences } from './auth'
