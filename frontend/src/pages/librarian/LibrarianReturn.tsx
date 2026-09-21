import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Coins,
  BookOpen,
} from 'lucide-react';
import { loanService } from '../../api';
import { Loan } from '../../types';
import { Pagination } from '../../components/Pagination';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { useToast } from '../../context/ToastContext';

export const LibrarianReturn: React.FC = () => {
  const { showToast } = useToast();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Return Processing Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [returnNotes, setReturnNotes] = useState('Returned in good physical condition');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'ONLINE_UPI' | 'UNPAID'>('CASH');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchActiveLoans();
  }, [page]);

  const fetchActiveLoans = async () => {
    setLoading(true);
    try {
      const res = await loanService.searchLoans({
        status: 'ACTIVE',
        query: searchQuery || undefined,
        page,
        size: 10,
      });
      setLoans(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to fetch active circulations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchActiveLoans();
  };

  const handleOpenReturnModal = (loan: Loan) => {
    setSelectedLoan(loan);
    setReturnNotes('Returned in good physical condition');
    setPaymentMethod('CASH');
    setModalOpen(true);
  };

  const handleConfirmReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan) return;

    setProcessing(true);
    try {
      await loanService.returnBook(selectedLoan.id, {
        notes: returnNotes,
        paymentMethod: paymentMethod === 'UNPAID' ? undefined : paymentMethod,
      });
      showToast(`Book "${selectedLoan.bookTitle || selectedLoan.book?.title || 'Book'}" marked as returned! Stock restored.`, 'success');
      setModalOpen(false);
      setSelectedLoan(null);
      fetchActiveLoans();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to process return', 'error');
    } finally {
      setProcessing(false);
    }
  };

  // Calculate overdue days & estimated fine
  const calculateOverdueInfo = (dueDateStr: string) => {
    const due = new Date(dueDateStr);
    const now = new Date();
    const diffMs = now.getTime() - due.getTime();
    if (diffMs <= 0) return { days: 0, fine: 0 };
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return { days, fine: days * 2.0 }; // ₹2.00 per day
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Circulation Desk: Return Book & Fine Collection
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Receive borrowed books back from students, evaluate wear condition, and record overdue fines.
        </p>
      </div>

      {/* Search Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student roll no, student name, book title, or ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-dps-500 focus:bg-white transition"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition"
          >
            Filter Loans
          </button>
        </form>
      </div>

      {/* Active Loans Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex justify-center">
          <LoadingSpinner size="lg" text="Fetching active loans..." />
        </div>
      ) : loans.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12">
          <EmptyState
            title="No active loans found"
            description="There are currently no active loans matching your search filters."
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Student Borrower</th>
                  <th className="py-3 px-4">Book Title</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Due Date (10 Days)</th>
                  <th className="py-3 px-4">Overdue Status</th>
                  <th className="py-3 px-4 text-right">Circulation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loans.map((loan) => {
                  const { days, fine } = calculateOverdueInfo(loan.dueDate);
                  const isOverdue = days > 0;

                  return (
                    <tr key={loan.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{loan.userName || loan.user?.fullName}</p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {loan.studentId || loan.user?.studentId || 'STUDENT'} • {loan.user?.department || 'Member'}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-900 line-clamp-1">
                          {loan.bookTitle || loan.book?.title}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          ISBN: {loan.bookIsbn || loan.book?.isbn || 'N/A'} • Shelf: {loan.book?.shelfLocation || 'Rack'}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {new Date(loan.issueDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-medium">
                        <span className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                          {new Date(loan.dueDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isOverdue ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3 h-3" />
                            {days} Days Late (Est. ₹{fine.toFixed(2)})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Clock className="w-3 h-3" /> On Track
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenReturnModal(loan)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-dps-600 hover:bg-dps-700 text-white font-bold text-xs rounded-lg shadow-xs transition"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Process Return</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

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

      {/* Return Desk Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Confirm Book Return"
        maxWidth="md"
      >
        {selectedLoan && (
          <form onSubmit={handleConfirmReturn} className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Book:</span>
                <span className="font-bold text-slate-900 truncate max-w-[240px]">
                  {selectedLoan.bookTitle || selectedLoan.book?.title}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Student:</span>
                <span className="font-bold text-slate-900">
                  {selectedLoan.userName || selectedLoan.user?.fullName} ({selectedLoan.studentId || selectedLoan.user?.studentId || 'ID'})
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Scheduled Due Date:</span>
                <span className="font-medium text-slate-800">
                  {new Date(selectedLoan.dueDate).toLocaleDateString()}
                </span>
              </div>

              {calculateOverdueInfo(selectedLoan.dueDate).days > 0 && (
                <div className="pt-2 mt-2 border-t border-slate-200 flex justify-between items-center text-rose-600">
                  <span className="font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Overdue ({calculateOverdueInfo(selectedLoan.dueDate).days} days late):
                  </span>
                  <span className="font-black text-sm">
                    ₹{calculateOverdueInfo(selectedLoan.dueDate).fine.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {calculateOverdueInfo(selectedLoan.dueDate).days > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Overdue Fine Collection Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'CASH', label: 'Cash at Desk' },
                    { id: 'ONLINE_UPI', label: 'College UPI / QR' },
                    { id: 'UNPAID', label: 'Record as Due' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition ${
                        paymentMethod === m.id
                          ? 'border-dps-600 bg-dps-50 text-dps-900'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Book Condition / Staff Notes
              </label>
              <input
                type="text"
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-dps-500"
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={processing}
                className="px-5 py-2 text-xs font-bold text-white bg-dps-600 hover:bg-dps-700 disabled:opacity-50 rounded-xl shadow-xs transition"
              >
                {processing ? 'Processing...' : 'Confirm Return & Restore Stock'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

