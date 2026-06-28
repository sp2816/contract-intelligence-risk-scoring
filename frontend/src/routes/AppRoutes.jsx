import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from '../components/layout/AppShell.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import Login from '../pages/Login.jsx'
import Register from '../pages/Register.jsx'
import ForgotPassword from '../pages/ForgotPassword.jsx'
import ResetPassword from '../pages/ResetPassword.jsx'
import Dashboard from '../pages/Dashboard.jsx'
import Chatbot from '../pages/Chatbot.jsx'
import ContractAnalysis from '../pages/ContractAnalysis.jsx'
import Profile from '../pages/Profile.jsx'
import Contracts from '../pages/Contracts.jsx'
import Analytics from '../pages/Analytics.jsx'
import NotFound from '../pages/NotFound.jsx'
import { useAuth } from '../hooks/useAuth.jsx'

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/"
        element={<Navigate to={user ? '/dashboard' : '/login'} replace />}
      />
      <Route
        element={<ProtectedRoute />}
      >
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/contract-analysis" element={<ContractAnalysis />} />
          <Route path="/contracts" element={<Contracts />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/analytics" element={<Analytics />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRoutes
