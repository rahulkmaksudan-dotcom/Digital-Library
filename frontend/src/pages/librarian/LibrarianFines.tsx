import React, { useState, useEffect } from 'react';
import { Coins, Search, CheckCircle2, ShieldCheck, Clock, CreditCard, Ban } from 'lucide-react';
import { fineService } from '../../api';
import { Fine } from '../../types';
import { Pagination } from '../../components/Pagination';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { useToast } from '../../context/ToastContext';

export const LibrarianFines: React.FC = () => {
  const { showToast } = useToast();
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Pay Modal State
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedFine, setSelectedFine] = useState<Fine | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'ONLINE_UPI' | 'CARD'>('CASH');
  const [processingPay, setProcessingPay] = useState(false);

  // Waive Modal State
  const [waiveModalOpen, setWaiveModalOpen] = useState(false);
  const [waiveReason, setWaiveReason] = useState('Medical leave verified by Dean');
  const [processingWaive, setProcessingWaive] = useState(false);

  useEffect(() => {
    fetchFines();
  }, [page, statusFilter]);

  const fetchFines = async () => {
    setLoading(true);
    try {
      const res = await fineService.searchFines({
        status: statusFilter || undefined,
        query: searchQuery || undefined,
        page,
        size: 10,
      });
      setFines(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to fetch fines', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchFines();
  };

  const handlePayFine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFine) return;
    setProcessingPay(true);
    try {
      await fineService.payFine(selectedFine.id, paymentMethod);
      showToast('Fine cleared and marked as PAID', 'success');
      setPayModalOpen(false);
      setSelectedFine(null);
      fetchFines();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to record payment', 'error');
    } finally {
      setProcessingPay(false);
    }
  };

  const handleWaiveFine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFine) return;
    setProcessingWaive(true);
    try {
      await fineService.waiveFine(selectedFine.id, waiveReason);
      showToast('Fine successfully waived under library rules', 'info');
      setWaiveModalOpen(false);
      setSelectedFine(null);
      fetchFines();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to waive fine', 'error');
    } finally {
      setProcessingWaive(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Overdue Fine Ledger & Collection ({totalElements})
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Track outstanding late return penalties, collect desk payments, and process administrative waivers.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name, roll no, or book title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-dps-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition"
          >
            Filter
          </button>
        </form>

        <div className="w-full md:w-48">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-dps-500"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending (Unpaid)</option>
            <option value="PAID">Paid</option>
            <option value="WAIVED">Waived</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex justify-center">
          <LoadingSpinner size="lg" text="Loading fines ledger..." />
        </div>
      ) : fines.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12">
          <EmptyState
            title="No fines found"
            description="No fine transactions recorded matching selected criteria."
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Overdue Book</th>
                  <th className="py-3 px-4">Days Overdue</th>
                  <th className="py-3 px-4">Fine Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Desk Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fines.map((fine) => (
                  <tr key={fine.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{fine.user?.fullName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {fine.user?.studentId} • {fine.user?.department}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-900 line-clamp-1">
                        {fine.loan?.book?.title || 'Academic Text'}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        ISBN: {fine.loan?.book?.isbn}
                      </p>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {fine.overdueDays} days
                    </td>
                    <td className="py-3 px-4 font-black text-slate-900 text-sm whitespace-nowrap">
                      ₹{Number(fine.amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {fine.status === 'PAID' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Paid ({fine.paymentMethod || 'CASH'})
                        </span>
                      ) : fine.status === 'WAIVED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          <ShieldCheck className="w-3 h-3" /> Waived
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <Clock className="w-3 h-3" /> Unpaid Dues
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {fine.status === 'PENDING' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedFine(fine);
                              setPayModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>Collect</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedFine(fine);
                              setWaiveModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition"
                          >
                            <ShieldCheck className="w-3 h-3" />
                            <span>Waive</span>
                          </button>
                        </div>
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

      {/* Collect Fine Modal */}
      <Modal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        title="Collect Overdue Fine at Desk"
        maxWidth="sm"
      >
        <form onSubmit={handlePayFine} className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
            <p className="text-xs text-slate-500 font-semibold">Fine Amount Due</p>
            <p className="text-3xl font-black text-emerald-700 mt-1">
              ₹{selectedFine ? Number(selectedFine.amount).toFixed(2) : '0.00'}
            </p>
            <p className="text-xs text-slate-700 mt-1 font-bold">
              Student: {selectedFine?.user?.fullName} ({selectedFine?.user?.studentId})
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Payment Method Received
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['CASH', 'ONLINE_UPI', 'CARD'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`p-2 rounded-xl border text-xs font-bold transition ${
                    paymentMethod === method
                      ? 'border-dps-600 bg-dps-50 text-dps-900'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setPayModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processingPay}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
            >
              {processingPay ? 'Saving...' : 'Confirm Payment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Waive Fine Modal */}
      <Modal
        isOpen={waiveModalOpen}
        onClose={() => setWaiveModalOpen(false)}
        title="Waive Overdue Fine"
        maxWidth="sm"
      >
        <form onSubmit={handleWaiveFine} className="space-y-4">
          <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 text-xs">
            <p className="font-bold text-purple-900">
              Waiving fine of ₹{selectedFine ? Number(selectedFine.amount).toFixed(2) : '0.00'}
            </p>
            <p className="text-purple-700 mt-0.5">
              For student: {selectedFine?.user?.fullName} ({selectedFine?.user?.studentId})
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Reason / Administrative Approval *
            </label>
            <textarea
              required
              rows={3}
              value={waiveReason}
              onChange={(e) => setWaiveReason(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-dps-500"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setWaiveModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processingWaive}
              className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl"
            >
              {processingWaive ? 'Processing...' : 'Confirm Waiver'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

