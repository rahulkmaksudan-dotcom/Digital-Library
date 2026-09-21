import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, Clock, BookOpen, Ban, AlertCircle, CheckCircle2 } from 'lucide-react';
import { reservationService } from '../../api';
import { Reservation } from '../../types';
import { Pagination } from '../../components/Pagination';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useToast } from '../../context/ToastContext';

export const StudentReservations: React.FC = () => {
  const { showToast } = useToast();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Cancellation modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchReservations();
  }, [page]);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const res = await reservationService.getMyReservations(page, 10);
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
    if (!selectedReservation) return;
    setCancelling(true);
    try {
      await reservationService.cancelReservation(selectedReservation.id);
      showToast('Reservation cancelled successfully', 'success');
      setCancelModalOpen(false);
      setSelectedReservation(null);
      fetchReservations();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to cancel reservation', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> In Queue
          </span>
        );
      case 'READY_FOR_PICKUP':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Pickup
          </span>
        );
      case 'FULFILLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Fulfilled
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
            Cancelled
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-600">
            Expired
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
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
            My Book Reservations
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track books you reserved while on loan. When a copy returns, you'll be notified for pickup.
          </p>
        </div>
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 bg-dps-600 hover:bg-dps-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition self-start sm:self-auto"
        >
          <BookOpen className="w-4 h-4" />
          <span>Browse Catalog</span>
        </Link>
      </div>

      {/* Info notice */}
      <div className="bg-amber-50/80 border border-amber-200/70 rounded-2xl p-4 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
        <p className="text-xs text-amber-800">
          Once a reserved book becomes ready for pickup at the circulation desk, you have{' '}
          <strong className="font-semibold">3 days</strong> to claim it before the reservation expires.
        </p>
      </div>

      {/* Reservation List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex justify-center">
          <LoadingSpinner size="lg" text="Loading reservations..." />
        </div>
      ) : reservations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12">
          <EmptyState
            title="No active reservations"
            description="You have not placed a hold on any books. If a book is currently borrowed by another student, you can reserve it from the book page."
            actionText="Find Books to Reserve"
            actionLink="/catalog"
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Book Details</th>
                  <th className="py-3.5 px-6">Reserved On</th>
                  <th className="py-3.5 px-6">Pickup Expiry</th>
                  <th className="py-3.5 px-6">Queue Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {reservations.map((resItem) => {
                  const canCancel =
                    resItem.status === 'PENDING' || resItem.status === 'READY_FOR_PICKUP' || resItem.status === 'ACTIVE';

                  return (
                    <tr key={resItem.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {resItem.bookCover || resItem.book?.coverImage ? (
                            <img
                              src={resItem.bookCover || resItem.book?.coverImage}
                              alt={resItem.bookTitle || resItem.book?.title}
                              className="w-10 h-14 object-cover rounded shadow-xs"
                            />
                          ) : (
                            <div className="w-10 h-14 bg-slate-100 rounded flex items-center justify-center text-slate-400">
                              <BookOpen className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <Link
                              to={`/books/${resItem.bookId || resItem.book?.id}`}
                              className="font-bold text-slate-900 hover:text-dps-600 line-clamp-1"
                            >
                              {resItem.bookTitle || resItem.book?.title || 'Academic Book'}
                            </Link>
                            <p className="text-xs text-slate-500 mt-0.5">
                              ISBN: {resItem.bookIsbn || resItem.book?.isbn || 'N/A'} • Shelf:{' '}
                              {resItem.book?.shelfLocation || 'Main'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600 whitespace-nowrap">
                        {new Date(resItem.reservationDate).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600 whitespace-nowrap">
                        {resItem.expiryDate ? (
                          <span className="font-medium text-amber-700">
                            {new Date(resItem.expiryDate).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">When available</span>
                        )}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        {getStatusBadge(resItem.status)}
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        {canCancel && (
                          <button
                            onClick={() => {
                              setSelectedReservation(resItem);
                              setCancelModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-200 transition"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Cancel Hold</span>
                          </button>
                        )}
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

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={cancelModalOpen}
        title="Cancel Book Hold"
        message={`Are you sure you want to cancel your reservation for "${selectedReservation?.bookTitle || selectedReservation?.book?.title || 'this book'}"? You will forfeit your position in the waitlist queue.`}
        confirmText="Yes, Cancel Hold"
        cancelText="Keep Reservation"
        type="danger"
        loading={cancelling}
        onConfirm={handleCancelReservation}
        onCancel={() => {
          setCancelModalOpen(false);
          setSelectedReservation(null);
        }}
      />
    </div>
  );
};

