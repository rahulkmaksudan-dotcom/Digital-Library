import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  CalendarCheck,
  Coins,
  Bookmark,
  Clock,
  AlertTriangle,
  ArrowRight,
  Search,
  FileDown,
  Send,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { analyticsService, loanService } from '../../api';
import { DashboardStats, Loan } from '../../types';
import { StatCard } from '../../components/StatCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [currentLoans, setCurrentLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsData, loansData] = await Promise.all([
          analyticsService.getStudentStats(),
          loanService.getMyLoans(0, 5),
        ]);
        setStats(statsData);
        setCurrentLoans(loansData.content);
      } catch (err) {
        console.error('Error fetching student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading student dashboard..." />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-dps-950 to-dps-800 text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-navy-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-dps-300 mb-2 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Student Knowledge Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.fullName}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
            {user?.department} • Roll No: <span className="font-mono text-dps-300">{user?.studentId}</span>
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/books"
            className="px-4 py-2.5 bg-white text-navy-950 hover:bg-slate-100 rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2"
          >
            <Search className="w-4 h-4 text-dps-600" />
            <span>Search Books</span>
          </Link>
          <Link
            to="/digital-resources"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold backdrop-blur-md border border-white/20 transition flex items-center gap-2"
          >
            <FileDown className="w-4 h-4 text-dps-300" />
            <span>Digital Notes</span>
          </Link>
          <Link
            to="/student/requests"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold backdrop-blur-md border border-white/20 transition flex items-center gap-2"
          >
            <Send className="w-4 h-4 text-emerald-400" />
            <span>Request Book</span>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Active Loans"
          value={stats?.myActiveLoans || 0}
          subtitle="Physical books currently borrowed"
          icon={BookOpen}
          color="blue"
        />

        <StatCard
          title="Due Soon"
          value={stats?.myDueSoon || 0}
          subtitle="Due within the next 3 days"
          icon={Clock}
          color={stats?.myDueSoon && stats.myDueSoon > 0 ? 'amber' : 'emerald'}
        />

        <StatCard
          title="Overdue Items"
          value={stats?.myOverdue || 0}
          subtitle="Accruing fine daily"
          icon={AlertTriangle}
          color={stats?.myOverdue && stats.myOverdue > 0 ? 'rose' : 'emerald'}
        />

        <StatCard
          title="Total Unpaid Fines"
          value={`₹ ${stats?.myPendingFines || '0.00'}`}
          subtitle="Payable at circulation desk"
          icon={Coins}
          color={stats?.myPendingFines && Number(stats.myPendingFines) > 0 ? 'rose' : 'emerald'}
        />
      </div>

      {/* Current Borrowed Books Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Currently Borrowed Books
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Standard 10-day period loan tracking and due date reminders.
            </p>
          </div>
          <Link
            to="/student/my-books"
            className="text-xs font-bold text-dps-600 hover:text-dps-700 flex items-center gap-1"
          >
            <span>View all loans</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {currentLoans.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">No active book loans</p>
            <p className="text-xs text-slate-400 mt-1">You do not currently have any physical books borrowed.</p>
            <Link
              to="/books"
              className="mt-3 inline-block px-4 py-2 bg-dps-600 text-white rounded-xl text-xs font-bold"
            >
              Explore Books Catalog
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">Book Title</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Fine</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentLoans.map((loan) => {
                  const isOverdue = loan.status === 'OVERDUE' || loan.daysOverdue > 0;
                  return (
                    <tr key={loan.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <Link to={`/books/${loan.bookId}`} className="hover:text-dps-600">
                          {loan.bookTitle}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{loan.authorName}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">{loan.issueDate}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        {loan.dueDate}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isOverdue
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {isOverdue ? 'Overdue' : 'Active (10 Days)'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800">
                        ₹ {loan.fineAmount || '0.00'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Links / Student Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/student/reservations"
          className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-card hover:shadow-card-hover transition group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-400">
              {stats?.myReservations || 0} active
            </span>
          </div>
          <h3 className="font-bold text-sm text-slate-900 group-hover:text-amber-600 transition">
            Book Reservations
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Check the status of reserved books waiting for deposit and collection.
          </p>
        </Link>

        <Link
          to="/student/favorites"
          className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-card hover:shadow-card-hover transition group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Bookmark className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-400">
              {stats?.myFavorites || 0} saved
            </span>
          </div>
          <h3 className="font-bold text-sm text-slate-900 group-hover:text-rose-600 transition">
            My Wishlist
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Quickly access textbooks and publications saved for future semesters.
          </p>
        </Link>

        <Link
          to="/student/fines"
          className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-card hover:shadow-card-hover transition group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Coins className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-400">₹ 2.00 / day</span>
          </div>
          <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-600 transition">
            Fine Management
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Review overdue days, calculated late fines, payment history and receipts.
          </p>
        </Link>
      </div>
    </div>
  );
};

