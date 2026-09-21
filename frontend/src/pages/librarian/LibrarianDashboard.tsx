import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  ArrowRightLeft,
  RotateCcw,
  AlertTriangle,
  Coins,
  CalendarCheck,
  Users,
  Search,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { analyticsService, loanService } from '../../api';
import { DashboardStats, Loan } from '../../types';
import { StatCard } from '../../components/StatCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useToast } from '../../context/ToastContext';

export const LibrarianDashboard: React.FC = () => {
  const { showToast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentLoans, setRecentLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, loansRes] = await Promise.all([
        analyticsService.getDashboardStats(),
        loanService.searchLoans({ page: 0, size: 5 }),
      ]);
      setStats(statsRes);
      setRecentLoans(loansRes.content);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading librarian circulation desk..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-dps-900 via-dps-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30">
            Circulation Control Desk
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
            Librarian Operations Center
          </h1>
          <p className="text-sm text-slate-200 mt-2 leading-relaxed">
            Manage book circulation, issue textbooks to students, process book returns, collect overdue fines, and oversee library inventory.
          </p>

          {/* Quick Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/librarian/issue"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs font-bold rounded-xl shadow-md transition"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Issue Book (10-Day Loan)</span>
            </Link>
            <Link
              to="/librarian/return"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold rounded-xl transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Return Desk & Fines</span>
            </Link>
            <Link
              to="/librarian/books"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold rounded-xl transition"
            >
              <BookOpen className="w-4 h-4" />
              <span>Manage Catalog</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Books in Library"
          value={stats?.totalBooks || 0}
          icon={BookOpen}
          description="Available in college catalog"
          variant="primary"
        />
        <StatCard
          title="Active Loans"
          value={stats?.activeLoans || 0}
          icon={ArrowRightLeft}
          description="Currently issued to students"
          variant="secondary"
        />
        <StatCard
          title="Overdue Circulations"
          value={stats?.overdueLoans || 0}
          icon={AlertTriangle}
          description="Exceeded 10-day period"
          variant="accent"
        />
        <StatCard
          title="Total Fines Pending"
          value={`₹${Number(stats?.pendingFinesAmount || 0).toFixed(2)}`}
          icon={Coins}
          description="Unpaid overdue fines"
          variant="default"
        />
      </div>

      {/* Operations Quick Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Circulations Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Recent Circulation Transactions
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Latest books issued and returned across college departments
              </p>
            </div>
            <Link
              to="/librarian/return"
              className="text-xs font-bold text-dps-600 hover:text-dps-700 inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Book</th>
                  <th className="py-2.5 px-3">Issue Date</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-800">{loan.user?.fullName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {loan.user?.studentId}
                      </p>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-medium text-slate-800 line-clamp-1">
                        {loan.book?.title}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {loan.book?.isbn}
                      </p>
                    </td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                      {new Date(loan.issueDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-700">
                      {new Date(loan.dueDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          loan.status === 'OVERDUE'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : loan.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {loan.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Librarian Shortcuts & Info */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Daily Circulation Tasks
            </h3>
            <div className="space-y-2.5">
              <Link
                to="/librarian/reservations"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-dps-50/60 transition group border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                    <CalendarCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-dps-700">
                      Reservation Queue
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {stats?.pendingReservations || 0} students waiting
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-dps-600 transition" />
              </Link>

              <Link
                to="/librarian/fines"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-dps-50/60 transition group border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-rose-100 text-rose-700">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-dps-700">
                      Overdue Fines Desk
                    </p>
                    <p className="text-[11px] text-slate-500">Collect or waive late fees</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-dps-600 transition" />
              </Link>

              <Link
                to="/librarian/requests"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-dps-50/60 transition group border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-dps-700">
                      Book Purchase Requests
                    </p>
                    <p className="text-[11px] text-slate-500">Review student demands</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-dps-600 transition" />
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-dps-50 rounded-2xl border border-indigo-100 p-5">
            <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
              College Library Rules
            </h4>
            <ul className="text-xs text-indigo-800/90 mt-2 space-y-1.5 list-disc list-inside">
              <li>Max 3 books per student at any time</li>
              <li>Standard loan duration: 10 days</li>
              <li>Overdue rate: ₹2.00 per day</li>
              <li>Auto reminder emails sent 3 days before due</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

