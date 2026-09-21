import React, { useState, useEffect } from 'react';
import { CalendarCheck, Search, Clock, CheckCircle2, XCircle, AlertCircle, Ban } from 'lucide-react';
import { reservationService } from '../../api';
import { Reservation } from '../../types';
import { Pagination } from '../../components/Pagination';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useToast } from '../../context/ToastContext';

export const LibrarianReservations: React.FC = () => {
  const { showToast } = useToast();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Cancel hold state
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchReservations();
  }, [page, statusFilter]);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const res = await reservationService.searchReservations({
        status: statusFilter || undefined,
        page,
        size: 10,
      });
      setReservations(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to fetch reservations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async () => {
    if (!selectedRes) return;
    setProcessing(true);
    try {
      await reservationService.cancelReservation(selectedRes.id);
      showToast('Reservation cancelled', 'info');
      setCancelModalOpen(false);
      setSelectedRes(null);
      fetchReservations();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to cancel reservation', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" /> Waiting in Queue
          </span>
        );
      case 'READY_FOR_PICKUP':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Ready for Pickup
          </span>
        );
      case 'FULFILLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Fulfilled
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Book Reservation & Hold Queue ({totalElements})
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Students waiting for borrowed books to be returned. Ready books are kept for 3 days.
          </p>
        </div>

        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-dps-500"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Waiting in Queue</option>
            <option value="READY_FOR_PICKUP">Ready for Pickup</option>
            <option value="FULFILLED">Fulfilled</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex justify-center">
          <LoadingSpinner size="lg" text="Loading reservations..." />
        </div>
      ) : reservations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12">
          <EmptyState
            title="No reservations found"
            description="No active holds or waitlists matching selected filter."
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Book Title</th>
                  <th className="py-3 px-4">Reserved Date</th>
                  <th className="py-3 px-4">Pickup Expiry</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reservations.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{res.user?.fullName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {res.user?.studentId} • {res.user?.department}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-900 line-clamp-1">{res.book?.title}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        ISBN: {res.book?.isbn} • Available copies: {res.book?.availableCopies}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {new Date(res.reservationDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {res.expiryDate ? (
                        <span className="font-bold text-amber-700">
                          {new Date(res.expiryDate).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">When returned</span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">{getStatusBadge(res.status)}</td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {(res.status === 'PENDING' || res.status === 'READY_FOR_PICKUP') && (
                        <button
                          onClick={() => {
                            setSelectedRes(res);
                            setCancelModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Cancel Hold"
                        >
                          <Ban className="w-4 h-4" />
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

      {/* Cancel Confirm */}
      <ConfirmDialog
        isOpen={cancelModalOpen}
        title="Cancel Student Hold"
        message={`Cancel the hold for student "${selectedRes?.user?.fullName}" on "${selectedRes?.book?.title}"?`}
        confirmText="Yes, Cancel Hold"
        cancelText="Keep"
        type="danger"
        loading={processing}
        onConfirm={handleCancelReservation}
        onCancel={() => {
          setCancelModalOpen(false);
          setSelectedRes(null);
        }}
      />
    </div>
  );
};

