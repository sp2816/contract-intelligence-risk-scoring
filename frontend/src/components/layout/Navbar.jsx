import React, { useState, useEffect, useRef, useMemo } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'
import routePaths from '../../utils/routes.js'
import { listContracts } from '../../api/contracts'
import { 
  Menu, X, Home, Bell, User as UserIcon, 
  Sun, Moon, LayoutDashboard, MessageSquare, 
  FileText, Files, BarChart3, ChevronDown,
  CheckCircle2, AlertCircle, Clock, Loader2, LogOut
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', path: routePaths.dashboard, icon: LayoutDashboard },
  { label: 'Contracts', path: routePaths.contracts, icon: Files },
  { label: 'Chatbot', path: routePaths.chatbot, icon: MessageSquare },
  { label: 'Contract Analysis', path: routePaths.contractAnalysis, icon: FileText },
  { label: 'Analytics', path: routePaths.analytics, icon: BarChart3 },
]

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function Navbar({ onToggleMobileMenu, isMobileMenuOpen }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const isLight = theme === 'light'

  const [contracts, setContracts] = useState([])
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [readIds, setReadIds] = useState(() => {
    try {
      const saved = localStorage.getItem('read-notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const dropdownRef = useRef(null)

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const response = await listContracts();
        if (response && response.contracts) {
          setContracts(response.contracts);
        }
      } catch (err) {
        console.error("Error fetching contracts for notifications", err);
      }
    };

    if (user) {
      fetchContracts();
      const interval = setInterval(fetchContracts, 8000); // check status every 8s
      return () => clearInterval(interval);
    }
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = useMemo(() => {
    const list = [];
    contracts.forEach((c) => {
      const date = new Date(c.upload_date);
      
      // 1. Upload Notification
      const uploadId = `${c.id}-upload`;
      list.push({
        id: uploadId,
        title: 'Contract Uploaded',
        message: `"${c.original_filename}" uploaded successfully.`,
        time: date,
        unread: !readIds.includes(uploadId),
        type: 'upload'
      });

      // 2. Status check
      const statusLower = c.status?.toLowerCase();
      if (statusLower === 'processing') {
        const processId = `${c.id}-processing`;
        list.push({
          id: processId,
          title: 'Analysis Started',
          message: `AI is checking "${c.original_filename}" for risk elements.`,
          time: new Date(date.getTime() + 1000 * 2),
          unread: !readIds.includes(processId),
          type: 'processing'
        });
      } else if (['analyzed', 'completed', 'analysis_complete', 'approved', 'reviewed'].includes(statusLower)) {
        const analyzeId = `${c.id}-analyzed`;
        list.push({
          id: analyzeId,
          title: 'AI Analysis Complete',
          message: `"${c.original_filename}" risk score: ${c.risk_score != null ? `${c.risk_score}%` : 'Pending'}.`,
          time: new Date(date.getTime() + 1000 * 8),
          unread: !readIds.includes(analyzeId),
          type: 'success',
          risk: c.risk_score
        });
      }
    });

    return list.sort((a, b) => b.time - a.time);
  }, [contracts, readIds]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => n.unread).length;
  }, [notifications]);

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadIds(allIds);
    localStorage.setItem('read-notifications', JSON.stringify(allIds));
  };

  const handleMarkSingleAsRead = (id) => {
    if (readIds.includes(id)) return;
    const nextRead = [...readIds, id];
    setReadIds(nextRead);
    localStorage.setItem('read-notifications', JSON.stringify(nextRead));
  };

  return (
    <header className={`sticky top-0 z-30 border-b backdrop-blur-xl transition-colors duration-300 ${isLight
        ? 'border-slate-200 bg-white/95'
        : 'border-slate-800 bg-slate-900/90'
      }`}>
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left Section: Mobile Menu + Logo */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger menu toggle */}
          {user && (
            <button
              type="button"
              onClick={onToggleMobileMenu}
              className={`inline-flex items-center justify-center rounded-xl p-2 transition lg:hidden ${isLight ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-900' : 'text-slate-400 hover:bg-slate-850 hover:text-white'
                }`}
              aria-label={isMobileMenuOpen ? 'Close main menu' : 'Open main menu'}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}

          {/* Logo brand "ContractMind" with custom gradient lightning bolt icon */}
          <Link 
            to="/" 
            className="flex items-center gap-2 select-none hover:opacity-90 transition ml-2 lg:ml-0"
          >
            <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="50%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              <path 
                d="M13 2L3 14H12L11 22L21 10H12L13 2Z" 
                fill="url(#logoGradient)" 
                stroke="url(#logoGradient)" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
              <span className="text-brand-500">Contract</span>Mind
            </span>
          </Link>
        </div>

        {/* Middle Section: Horizontal Nav Links (Desktop) */}
        {user && (
          <nav className="hidden lg:flex items-center gap-1 h-full">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 h-16 text-sm font-medium border-b-2 transition-all duration-200 ${isActive
                    ? 'border-brand-500 text-brand-500 font-semibold'
                    : isLight
                      ? 'border-transparent text-slate-500 hover:text-brand-500'
                      : 'border-transparent text-slate-400 hover:text-brand-500'
                  }`
                }
              >
                <item.icon className="h-4 w-4 mr-2" />
                <span>{item.label}</span>
                <ChevronDown className="h-3 w-3 ml-1.5 opacity-50" />
              </NavLink>
            ))}
          </nav>
        )}

        {/* Right Section: Icons + Theme Toggle + Profile */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Home Redirect Link */}
              <Link 
                to="/dashboard"
                title="Go to Dashboard Home"
                className={`p-2 transition rounded-full ${isLight ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-900' : 'text-slate-400 hover:text-white hover:bg-slate-850'
                  }`}
              >
                <Home className="h-5 w-5" />
              </Link>

              {/* Chat / Chatbot quick link */}
              <Link
                to={routePaths.chatbot}
                title="AI Chatbot Assistant"
                className={`p-2 transition rounded-full ${isLight ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-900' : 'text-slate-400 hover:text-white hover:bg-slate-850'
                  }`}
              >
                <MessageSquare className="h-5 w-5" />
              </Link>

              {/* Notifications bell dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  title="Notifications"
                  className={`relative p-2 transition rounded-full ${isLight ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-900' : 'text-slate-400 hover:text-white hover:bg-slate-850'
                    } ${isNotificationsOpen ? (isLight ? 'bg-slate-100' : 'bg-slate-850') : ''}`}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-3 w-3 rounded-full bg-red-500 border-2 border-white dark:border-slate-900 animate-pulse-soft"></span>
                  )}
                </button>

                {/* Notifications Dropdown Panel */}
                {isNotificationsOpen && (
                  <div className={`absolute right-0 mt-2.5 w-80 sm:w-96 rounded-2xl border p-4 shadow-2xl backdrop-blur-md z-50 transition-all duration-200 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>Notifications</h4>
                        {unreadCount > 0 && (
                          <span className="bg-red-500/10 text-red-500 text-2xs font-extrabold px-1.5 py-0.5 rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          className="text-xs font-semibold text-brand-500 hover:text-brand-600 transition"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="mt-2 max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-500">
                          No notifications yet. Upload contracts to get started.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div 
                            key={n.id}
                            onClick={() => handleMarkSingleAsRead(n.id)}
                            className={`flex gap-3 py-3 px-2 rounded-xl transition cursor-pointer ${isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800/40'} ${n.unread ? (isLight ? 'bg-brand-500/5' : 'bg-brand-500/10') : ''}`}
                          >
                            <div className="mt-0.5 shrink-0">
                              {n.type === 'upload' && <Files className="h-4.5 w-4.5 text-blue-500" />}
                              {n.type === 'processing' && <Loader2 className="h-4.5 w-4.5 text-yellow-500 animate-spin" />}
                              {n.type === 'success' && (
                                n.risk >= 71 ? (
                                  <AlertCircle className="h-4.5 w-4.5 text-red-500" />
                                ) : (
                                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                                )
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-semibold leading-normal ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>
                                {n.title}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                                {n.message}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-500">
                                <Clock className="h-3 w-3" />
                                <span>{timeAgo(n.time)}</span>
                              </div>
                            </div>
                            {n.unread && (
                              <div className="h-2 w-2 rounded-full bg-brand-500 shrink-0 mt-2 self-start" />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
                className={`p-2 rounded-full transition ${isLight ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-900' : 'text-slate-400 hover:text-white hover:bg-slate-850'
                  }`}
              >
                {isLight ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>

              {/* Logout Button */}
              <button
                onClick={logout}
                title="Logout"
                className={`p-2 rounded-full transition ${isLight ? 'text-slate-500 hover:bg-red-50 hover:text-red-500' : 'text-slate-400 hover:text-red-400 hover:bg-slate-850'
                  }`}
              >
                <LogOut className="h-5 w-5" />
              </button>

              {/* User Profile Avatar with green online status dot */}
              <Link
                to="/profile"
                className={`relative flex items-center justify-center h-9 w-9 rounded-full border transition-transform duration-200 hover:scale-105 font-bold text-brand-500 ${isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-850 border-slate-700'
                  }`}
                title="View Profile"
              >
                {(user.fullname || user.name) ? (
                  (user.fullname || user.name).charAt(0).toUpperCase()
                ) : (
                  <UserIcon className="h-4 w-4" />
                )}
                {/* Active/online status dot */}
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
              </Link>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
