import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, Clock, AlertTriangle, CheckCircle2, Search, ArrowRight } from 'lucide-react';
import { loanService } from '../../api';
import { Loan } from '../../types';
import { Pagination } from '../../components/Pagination';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { useToast } from '../../context/ToastContext';

interface StudentLoansProps {
  initialTab?: 'active' | 'history';
}

export const StudentLoans: React.FC<StudentLoansProps> = ({ initialTab = 'active' }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'active' | 'history'>(initialTab);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    fetchLoans();
  }, [activeTab, page]);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      if (activeTab === 'active') {
        const res = await loanService.getMyLoans(page, 10);
        setLoans(res.content);
        setTotalPages(res.totalPages);
        setTotalElements(res.totalElements);
      } else {
        const res = await loanService.getMyHistory(undefined, page, 10);
        setLoans(res.content);
        setTotalPages(res.totalPages);
        setTotalElements(res.totalElements);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to fetch your loans', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, isOverdue: boolean) => {
    if (isOverdue || status === 'OVERDUE') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <AlertTriangle className="w-3.5 h-3.5" /> Overdue
        </span>
      );
    }
    if (status === 'ACTIVE' || status === 'ISSUED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Clock className="w-3.5 h-3.5" /> Active Loan
        </span>
      );
    }
    if (status === 'RETURNED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          <CheckCircle2 className="w-3.5 h-3.5" /> Returned
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {activeTab === 'active' ? 'My Borrowed Books' : 'Borrowing History'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {activeTab === 'active'
              ? 'Keep track of currently issued books, due dates, and renewals.'
              : 'Complete archive of all your past library circulations.'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center bg-slate-200/80 p-1 rounded-xl w-fit">
          <button
            onClick={() => {
              setActiveTab('active');
              setPage(0);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'active'
                ? 'bg-white text-dps-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Currently Borrowed
          </button>
          <button
            onClick={() => {
              setActiveTab('history');
              setPage(0);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'history'
                ? 'bg-white text-dps-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Complete History
          </button>
        </div>
      </div>

      {/* Loan count alert note */}
      <div className="bg-gradient-to-r from-dps-50 to-indigo-50 border border-dps-200/60 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-dps-600 text-white flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Standard Loan Policy: 10 Days
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Please return or renew before the due date to avoid overdue fines of ₹2.00/day.
            </p>
          </div>
        </div>
        <Link
          to="/catalog"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-dps-700 hover:text-dps-800 bg-white border border-dps-200 px-3.5 py-2 rounded-xl shadow-xs transition"
        >
          <span>Browse Books</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex justify-center">
          <LoadingSpinner size="lg" text="Loading loans..." />
        </div>
      ) : loans.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12">
          <EmptyState
            title={activeTab === 'active' ? 'No active loans' : 'No borrowing history'}
            description={
              activeTab === 'active'
                ? "You don't have any books currently borrowed from the library."
                : 'You have not borrowed any books yet.'
            }
            actionText="Explore Library Catalog"
            actionLink="/catalog"
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Book Title</th>
                  <th className="py-3.5 px-6">ISBN</th>
                  <th className="py-3.5 px-6">Issue Date</th>
                  <th className="py-3.5 px-6">Due Date</th>
                  <th className="py-3.5 px-6">Return Date</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loans.map((loan) => {
                  const isOverdue =
                    loan.status !== 'RETURNED' &&
                    new Date(loan.dueDate).getTime() < new Date().getTime();

                  return (
                    <tr key={loan.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {loan.bookCover || loan.book?.coverImage ? (
                            <img
                              src={loan.bookCover || loan.book?.coverImage}
                              alt={loan.bookTitle || loan.book?.title}
                              className="w-10 h-14 object-cover rounded shadow-xs"
                            />
                          ) : (
                            <div className="w-10 h-14 bg-slate-100 rounded flex items-center justify-center text-slate-400">
                              <BookOpen className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <Link
                              to={`/books/${loan.bookId || loan.book?.id}`}
                              className="font-bold text-slate-900 hover:text-dps-600 line-clamp-1"
                            >
                              {loan.bookTitle || loan.book?.title || 'Unknown Title'}
                            </Link>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {loan.authorName || loan.book?.authorName || 'Academic Author'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600 font-mono">
                        {loan.bookIsbn || loan.book?.isbn || 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(loan.issueDate).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs font-semibold whitespace-nowrap">
                        <div
                          className={`flex items-center gap-1.5 ${
                            isOverdue ? 'text-rose-600' : 'text-slate-700'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>{new Date(loan.dueDate).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600 whitespace-nowrap">
                        {loan.returnDate ? (
                          <div className="flex items-center gap-1.5 text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{new Date(loan.returnDate).toLocaleDateString()}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Not returned yet</span>
                        )}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        {getStatusBadge(loan.status, isOverdue)}
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <Link
                          to={`/books/${loan.bookId || loan.book?.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-dps-600 hover:text-dps-700 bg-dps-50 px-3 py-1.5 rounded-lg border border-dps-100 transition"
                        >
                          <span>View Book</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

