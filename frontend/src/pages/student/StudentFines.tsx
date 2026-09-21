import React, { useState, useEffect } from 'react';
import { Coins, AlertCircle, CheckCircle2, Clock, CreditCard, ShieldCheck } from 'lucide-react';
import { fineService } from '../../api';
import { Fine } from '../../types';
import { Pagination } from '../../components/Pagination';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { useToast } from '../../context/ToastContext';

export const StudentFines: React.FC = () => {
  const { showToast } = useToast();
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Pay online modal
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedFine, setSelectedFine] = useState<Fine | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE_UPI' | 'NET_BANKING' | 'CARD'>('ONLINE_UPI');
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    fetchFines();
  }, [page]);

  const fetchFines = async () => {
    setLoading(true);
    try {
      const res = await fineService.getMyFines(page, 10);
      setFines(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load fines', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePayFine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFine) return;
    setPaying(true);
    try {
      await fineService.payFine(selectedFine.id, paymentMethod);
      showToast('Fine payment cleared successfully!', 'success');
      setPayModalOpen(false);
      setSelectedFine(null);
      fetchFines();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Fine payment failed', 'error');
    } finally {
      setPaying(false);
    }
  };

  // Aggregates
  const totalDue = fines
    .filter((f) => f.status === 'PENDING')
    .reduce((sum, f) => sum + Number(f.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Library Fines & Overdue Charges
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Overview of charges on overdue book returns and damaged library materials.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Dues
            </p>
            <h3 className="text-2xl font-black text-rose-600 mt-0.5">
              ₹{totalDue.toFixed(2)}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Fines Recorded
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">
              {totalElements}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-dps-50 text-dps-600 flex items-center justify-center font-bold">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Late Fee Rule
            </p>
            <h3 className="text-sm font-bold text-slate-800 mt-1">
              ₹2.00 / day overdue
            </h3>
          </div>
        </div>
      </div>

      {/* Fines Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex justify-center">
          <LoadingSpinner size="lg" text="Loading fines..." />
        </div>
      ) : fines.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12">
          <EmptyState
            title="No fines recorded"
            description="Awesome job! You have zero outstanding library fines. Keep returning books on or before due date."
            actionText="View Borrowed Books"
            actionLink="/student/my-books"
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Book Description</th>
                  <th className="py-3.5 px-6">Due Date</th>
                  <th className="py-3.5 px-6">Return Date</th>
                  <th className="py-3.5 px-6">Overdue Days</th>
                  <th className="py-3.5 px-6">Amount</th>
                  <th className="py-3.5 px-6">Payment Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {fines.map((fine) => (
                  <tr key={fine.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {fine.bookTitle || fine.loan?.bookTitle || 'Academic Coursebook'}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600 whitespace-nowrap">
                      {fine.loan?.dueDate
                        ? new Date(fine.loan.dueDate).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600 whitespace-nowrap">
                      {fine.loan?.returnDate
                        ? new Date(fine.loan.returnDate).toLocaleDateString()
                        : 'Not returned'}
                    </td>
                    <td className="py-4 px-6 text-xs font-semibold text-slate-700">
                      {fine.daysOverdue ?? fine.overdueDays ?? 0} days
                    </td>
                    <td className="py-4 px-6 text-sm font-black text-slate-900 whitespace-nowrap">
                      ₹{Number(fine.amount).toFixed(2)}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      {fine.status === 'PAID' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Paid ({fine.paymentMethod || 'CASH'})
                        </span>
                      ) : fine.status === 'WAIVED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                          <ShieldCheck className="w-3.5 h-3.5" /> Waived
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <Clock className="w-3.5 h-3.5" /> Unpaid Dues
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      {fine.status === 'PENDING' && (
                        <button
                          onClick={() => {
                            setSelectedFine(fine);
                            setPayModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-dps-600 hover:bg-dps-700 px-3.5 py-1.5 rounded-lg shadow-xs transition"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Pay Online</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
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

      {/* Payment Modal */}
      <Modal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        title="Clear Library Fine"
        maxWidth="sm"
      >
        <form onSubmit={handlePayFine} className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
            <p className="text-xs font-medium text-slate-500">Fine Amount Payable</p>
            <p className="text-3xl font-black text-slate-900 mt-1">
              ₹{selectedFine ? Number(selectedFine.amount).toFixed(2) : '0.00'}
            </p>
            <p className="text-xs text-slate-600 mt-1 line-clamp-1">
              For: {selectedFine?.bookTitle || selectedFine?.loan?.bookTitle || 'Library Overdue Book'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Payment Method
            </label>
            <div className="space-y-2">
              {[
                { id: 'ONLINE_UPI', label: 'UPI (Google Pay, PhonePe, Paytm)' },
                { id: 'NET_BANKING', label: 'College Student Portal / Net Banking' },
                { id: 'CARD', label: 'Debit / Credit Card' },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-medium cursor-pointer transition ${
                    paymentMethod === opt.id
                      ? 'border-dps-600 bg-dps-50/50 text-dps-900 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={opt.id}
                    checked={paymentMethod === opt.id}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="text-dps-600 focus:ring-dps-500"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setPayModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={paying}
              className="px-5 py-2 text-xs font-bold text-white bg-dps-600 hover:bg-dps-700 disabled:opacity-50 rounded-xl shadow-sm transition"
            >
              {paying ? 'Processing Payment...' : 'Confirm & Pay Now'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

