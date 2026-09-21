import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { authService } from '../../api';
import { useToast } from '../../context/ToastContext';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const { error, success } = useToast();

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = await authService.forgotPassword(email.trim());
      setGeneratedToken(token);
      success('Password reset instructions processed! Copy the reset token below.');
    } catch (err: any) {
      error(err.message || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-dps-700 to-dps-500 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-dps-600/30">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Forgot Password
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Enter your college registered email to reset your library password.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 sm:p-8">
          <form onSubmit={handleForgot} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Registered College Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student1@dpslibrary.edu"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dps-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-dps-600 hover:bg-dps-700 text-white font-bold rounded-xl shadow-md shadow-dps-600/30 transition text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Send Reset Link'}
            </button>
          </form>

          {generatedToken && (
            <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Reset Token Generated</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                Copy this secure token and proceed to reset your password:
              </p>
              <textarea
                readOnly
                rows={3}
                value={generatedToken}
                className="w-full font-mono text-[10px] p-2 bg-white border border-emerald-200 rounded-lg select-all"
              />
              <Link
                to={`/reset-password?token=${encodeURIComponent(generatedToken)}`}
                className="inline-flex items-center gap-1.5 font-bold text-emerald-700 hover:text-emerald-900 mt-2"
              >
                <span>Proceed to Reset Password →</span>
              </Link>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Remembered your password?{' '}
            <Link to="/login" className="font-bold text-dps-600 hover:text-dps-700">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

