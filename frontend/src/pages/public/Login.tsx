import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, LogIn, Lock, Mail, GraduationCap, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Login: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAdmin, isLibrarian } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) return;

    setLoading(true);
    try {
      await login(identifier.trim(), password);
      // Determine redirection based on role
      const savedUser = JSON.parse(localStorage.getItem('dlms_user') || '{}');
      if (savedUser.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (savedUser.role === 'LIBRARIAN') {
        navigate('/librarian/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      // Error handled by ToastContext inside AuthContext
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (id: string, pass: string) => {
    setIdentifier(id);
    setPassword(pass);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-dps-700 to-dps-500 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-dps-600/30">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Sign In to Portal
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Thakur Shree DPS College of Engineering and Management
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 sm:p-8">
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Email Address or Student ID *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. DPS2023CS001 or admin@dpslibrary.edu"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dps-500/20 text-xs text-slate-800"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-slate-700">Password *</label>
                <Link
                  to="/forgot-password"
                  className="text-dps-600 hover:text-dps-700 font-semibold"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dps-500/20 text-xs text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-dps-600 hover:bg-dps-700 text-white font-bold rounded-xl shadow-md shadow-dps-600/30 transition text-xs uppercase tracking-wider flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Fill Pills */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 text-center">
              1-Click Demo Credentials
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => fillDemo('admin@dpslibrary.edu', 'Admin@123')}
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-left transition"
              >
                <span className="font-bold block text-dps-700">Admin</span>
                <span className="text-[10px] text-slate-400">admin@dpslibrary.edu</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('librarian@dpslibrary.edu', 'Librarian@123')}
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-left transition"
              >
                <span className="font-bold block text-emerald-700">Librarian</span>
                <span className="text-[10px] text-slate-400">librarian@dpslibrary.edu</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('student1@dpslibrary.edu', 'Student@123')}
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-left transition"
              >
                <span className="font-bold block text-indigo-700">Student (Ashish)</span>
                <span className="text-[10px] text-slate-400">student1@dpslibrary.edu</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('faculty1@dpslibrary.edu', 'Faculty@123')}
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-left transition"
              >
                <span className="font-bold block text-purple-700">Faculty</span>
                <span className="text-[10px] text-slate-400">faculty1@dpslibrary.edu</span>
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have a student account?{' '}
            <Link to="/register" className="font-bold text-dps-600 hover:text-dps-700">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

