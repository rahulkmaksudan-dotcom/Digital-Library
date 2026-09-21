import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  ArrowRightLeft,
  AlertTriangle,
  Coins,
  ShieldCheck,
  CalendarCheck,
  FolderOpen,
  Sliders,
  FileSpreadsheet,
  BarChart3,
  TrendingUp,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { analyticsService, auditLogService } from '../../api';
import { DashboardStats, AuditLogItem } from '../../types';
import { StatCard } from '../../components/StatCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useToast } from '../../context/ToastContext';

export const AdminDashboard: React.FC = () => {
  const { showToast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, logsRes] = await Promise.all([
        analyticsService.getDashboardStats(),
        auditLogService.getAuditLogs({ page: 0, size: 6 }),
      ]);
      setStats(statsRes);
      setRecentLogs(logsRes.content);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load administrative overview', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading central administration console..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Executive Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30">
              System Administration
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-slate-300">
              Thakur Shree DPS College
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Central Administrative Console
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Manage institutional users, system rules, catalog policies, security audit trails, and college-wide circulation analytics.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/admin/users"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-dps-600 hover:bg-dps-500 text-white text-xs font-bold rounded-xl shadow-md transition"
            >
              <Users className="w-4 h-4" />
              <span>User & Role Directory</span>
            </Link>
            <Link
              to="/admin/settings"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold rounded-xl transition"
            >
              <Sliders className="w-4 h-4" />
              <span>Configure System Rules</span>
            </Link>
            <Link
              to="/admin/exports"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold rounded-xl transition"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Audit & CSV Exports</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Registered Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          description="Students, faculty & staff"
          variant="primary"
        />
        <StatCard
          title="Textbooks in Catalog"
          value={stats?.totalBooks || 0}
          icon={BookOpen}
          description="Across 10 departments"
          variant="secondary"
        />
        <StatCard
          title="Active Book Loans"
          value={stats?.activeLoans || 0}
          icon={ArrowRightLeft}
          description="Currently in circulation"
          variant="default"
        />
        <StatCard
          title="Overdue Circulations"
          value={stats?.overdueLoans || 0}
          icon={AlertTriangle}
          description="Requires librarian follow-up"
          variant="accent"
        />
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pending Waitlists
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">
              {stats?.pendingReservations || 0}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Students in holds queue</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Unpaid Fine Dues
            </p>
            <h3 className="text-2xl font-black text-rose-600 mt-0.5">
              ₹{Number(stats?.pendingFinesAmount || 0).toFixed(2)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Calculated at ₹2.00/day</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              System Security
            </p>
            <h3 className="text-sm font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
              <span>All Systems Operational</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">JWT Auth & Audit Active</p>
          </div>
        </div>
      </div>

      {/* Grid: Audit Logs & Administrative Quick Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Security Audit Log Stream */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Live Security & Audit Trail
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time tracking of administrative logins, circulation changes, and fine waivers
              </p>
            </div>
            <Link
              to="/admin/audit-logs"
              className="text-xs font-bold text-dps-600 hover:text-dps-700 inline-flex items-center gap-1"
            >
              <span>View Full Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">User / Actor</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Entity Details</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {log.user ? log.user.fullName : 'System Service'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-slate-100 text-slate-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                      {log.details || `${log.entityName} #${log.entityId}`}
                    </td>
                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Administration Short-cuts */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Master System Controls
            </h3>
            <div className="space-y-2.5">
              <Link
                to="/admin/categories"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-dps-50/60 transition group border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <FolderOpen className="w-4 h-4 text-slate-600 group-hover:text-dps-700" />
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-dps-700">
                      Departments & Categories
                    </p>
                    <p className="text-[11px] text-slate-500">10 academic branches</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-dps-600" />
              </Link>

              <Link
                to="/admin/authors"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-dps-50/60 transition group border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-slate-600 group-hover:text-dps-700" />
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-dps-700">
                      Authors Directory
                    </p>
                    <p className="text-[11px] text-slate-500">Curriculum textbook writers</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-dps-600" />
              </Link>

              <Link
                to="/admin/settings"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-dps-50/60 transition group border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <Sliders className="w-4 h-4 text-slate-600 group-hover:text-dps-700" />
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-dps-700">
                      Circulation Settings
                    </p>
                    <p className="text-[11px] text-slate-500">10-day limit, ₹2.00 fine rate</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-dps-600" />
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-navy-950 text-white p-5 rounded-2xl shadow-sm">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              College System Spec
            </h4>
            <p className="text-xs text-slate-300 mt-1">
              Thakur Shree DPS College of Engineering and Management
            </p>
            <div className="mt-3 text-[11px] text-slate-400 space-y-1 font-mono">
              <p>• Backend: Spring Boot 3.3.4 (Java 21)</p>
              <p>• Frontend: React 18 + Vite + Tailwind</p>
              <p>• DB Engine: PostgreSQL / H2</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

