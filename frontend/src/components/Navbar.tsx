import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Bell,
  Search,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  FileText,
  Bookmark,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, isLibrarian, isStudent, logout } = useAuth();
  const { unreadCount, recentNotifications, markAsRead, markAllAsRead } = useNotification();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const getDashboardLink = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isLibrarian) return '/librarian/dashboard';
    return '/student/dashboard';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      {/* Top Banner / College Header */}
      <div className="bg-gradient-to-r from-navy-950 via-dps-950 to-navy-900 text-white text-xs py-1.5 px-4 sm:px-8 border-b border-navy-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1">
          <div className="flex items-center gap-2 font-medium tracking-wide text-slate-200">
            <GraduationCap className="w-4 h-4 text-dps-400" />
            <span>Thakur Shree DPS College of Engineering and Management</span>
          </div>
          <div className="flex items-center gap-4 text-slate-300 text-[11px]">
            <span>Central Library Hours: 8:00 AM – 8:00 PM</span>
            <span className="hidden md:inline">|</span>
            <span className="hidden md:inline">support: library@dpscollege.edu</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-dps-700 to-dps-500 flex items-center justify-center text-white shadow-md shadow-dps-500/20 group-hover:scale-105 transition">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-bold text-slate-900 tracking-tight leading-none group-hover:text-dps-600 transition">
              DIGITAL LIBRARY
            </div>
            <div className="text-[10px] font-semibold tracking-wider text-dps-600 uppercase mt-0.5">
              DPS College Management System
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-lg transition ${
              location.pathname === '/' ? 'text-dps-600 font-semibold bg-dps-50' : 'hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            Home
          </Link>
          <Link
            to="/books"
            className={`px-3 py-1.5 rounded-lg transition ${
              location.pathname.startsWith('/books') ? 'text-dps-600 font-semibold bg-dps-50' : 'hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            Books Catalog
          </Link>
          <Link
            to="/digital-resources"
            className={`px-3 py-1.5 rounded-lg transition ${
              location.pathname.startsWith('/digital-resources') ? 'text-dps-600 font-semibold bg-dps-50' : 'hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            Academic Resources
          </Link>
          <Link
            to="/categories"
            className={`px-3 py-1.5 rounded-lg transition ${
              location.pathname === '/categories' ? 'text-dps-600 font-semibold bg-dps-50' : 'hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            Categories
          </Link>
          <Link
            to="/about"
            className={`px-3 py-1.5 rounded-lg transition ${
              location.pathname === '/about' ? 'text-dps-600 font-semibold bg-dps-50' : 'hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            About & Team
          </Link>
          <Link
            to="/contact"
            className={`px-3 py-1.5 rounded-lg transition ${
              location.pathname === '/contact' ? 'text-dps-600 font-semibold bg-dps-50' : 'hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            Contact
          </Link>
        </nav>

        {/* Right Action Icons & Auth */}
        <div className="flex items-center gap-2.5">
          {/* Quick Search Button */}
          <Link
            to="/books"
            className="p-2 text-slate-500 hover:text-dps-600 hover:bg-slate-100 rounded-lg transition"
            title="Search books catalog"
          >
            <Search className="w-5 h-5" />
          </Link>

          {isAuthenticated && user ? (
            <>
              {/* Notification Bell with Dropdown */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="relative p-2 text-slate-500 hover:text-dps-600 hover:bg-slate-100 rounded-lg transition"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                      <div className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                        <span>Notifications</span>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 bg-dps-100 text-dps-800 rounded-full text-xs">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-dps-600 hover:text-dps-800 font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                      {recentNotifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 text-xs">
                          No notifications yet.
                        </div>
                      ) : (
                        recentNotifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => {
                              if (!notif.isRead) markAsRead(notif.id);
                              if (notif.link) {
                                navigate(notif.link);
                                setNotifDropdownOpen(false);
                              }
                            }}
                            className={`p-3.5 hover:bg-slate-50 cursor-pointer transition flex items-start gap-3 ${
                              !notif.isRead ? 'bg-dps-50/40' : ''
                            }`}
                          >
                            <div className="w-2 h-2 mt-1.5 rounded-full bg-dps-500 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-slate-800 leading-snug">
                                {notif.title}
                              </p>
                              <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                                {notif.message}
                              </p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(notif.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="p-2 border-t border-slate-100 text-center">
                      <Link
                        to={isStudent ? '/student/notifications' : getDashboardLink()}
                        onClick={() => setNotifDropdownOpen(false)}
                        className="text-xs font-medium text-dps-600 hover:text-dps-800"
                      >
                        View all notifications →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2 rounded-xl hover:bg-slate-100 border border-slate-200/80 transition"
                >
                  <div className="w-7 h-7 rounded-lg bg-dps-600 text-white font-bold text-xs flex items-center justify-center">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-slate-800 leading-tight max-w-[110px] truncate">
                      {user.fullName}
                    </p>
                    <p className="text-[10px] text-dps-600 font-medium leading-tight">
                      {user.role}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 divide-y divide-slate-100">
                    <div className="px-4 py-2.5">
                      <p className="text-xs font-semibold text-slate-900">{user.fullName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      {user.studentId && (
                        <p className="text-[10px] font-mono text-dps-600 mt-0.5">{user.studentId}</p>
                      )}
                    </div>

                    <div className="py-1">
                      <Link
                        to={getDashboardLink()}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                      >
                        <ShieldCheck className="w-4 h-4 text-dps-600" />
                        <span>Portal Dashboard</span>
                      </Link>

                      {isStudent && (
                        <>
                          <Link
                            to="/student/my-books"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                          >
                            <BookOpen className="w-4 h-4 text-slate-400" />
                            <span>My Borrowed Books</span>
                          </Link>
                          <Link
                            to="/student/favorites"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                          >
                            <Bookmark className="w-4 h-4 text-slate-400" />
                            <span>My Wishlist</span>
                          </Link>
                          <Link
                            to="/student/profile"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                          >
                            <User className="w-4 h-4 text-slate-400" />
                            <span>My Profile</span>
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                          navigate('/');
                        }}
                        className="flex items-center gap-2.5 w-full px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium transition"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-dps-600 hover:bg-slate-100 rounded-lg transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-dps-600 hover:bg-dps-700 rounded-lg shadow-sm shadow-dps-600/30 transition"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg">
          <Link
            to="/"
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Home
          </Link>
          <Link
            to="/books"
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Books Catalog
          </Link>
          <Link
            to="/digital-resources"
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Academic Resources
          </Link>
          <Link
            to="/categories"
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Categories
          </Link>
          <Link
            to="/about"
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            About & Team
          </Link>
          <Link
            to="/contact"
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Contact
          </Link>

          {isAuthenticated ? (
            <div className="pt-3 border-t border-slate-100 space-y-1">
              <Link
                to={getDashboardLink()}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-dps-600 bg-dps-50"
              >
                Go to Dashboard ({user?.role})
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
              <Link
                to="/login"
                className="text-center py-2 text-sm font-medium border border-slate-200 rounded-lg"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-center py-2 text-sm font-medium bg-dps-600 text-white rounded-lg"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

