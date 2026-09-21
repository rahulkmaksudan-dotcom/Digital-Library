import React, { useState, useEffect } from 'react';
import { Send, Clock, CheckCircle2, XCircle, ShoppingBag, MessageSquare } from 'lucide-react';
import { bookRequestService } from '../../api';
import { BookRequest } from '../../types';
import { Pagination } from '../../components/Pagination';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { useToast } from '../../context/ToastContext';

export const LibrarianRequests: React.FC = () => {
  const { showToast } = useToast();
  const [requests, setRequests] = useState<BookRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Status Update Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<BookRequest | null>(null);
  const [newStatus, setNewStatus] = useState<'APPROVED' | 'REJECTED' | 'ORDERED'>('APPROVED');
  const [adminComment, setAdminComment] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [page, statusFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await bookRequestService.searchRequests({
        status: statusFilter || undefined,
        page,
        size: 10,
      });
      setRequests(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to fetch book requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStatusModal = (req: BookRequest) => {
    setSelectedReq(req);
    setNewStatus(req.status === 'PENDING' ? 'APPROVED' : (req.status as any));
    setAdminComment(req.adminComment || '');
    setModalOpen(true);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;
    setProcessing(true);
    try {
      await bookRequestService.updateStatus(selectedReq.id, newStatus, adminComment);
      showToast(`Request updated to ${newStatus}`, 'success');
      setModalOpen(false);
      setSelectedReq(null);
      fetchRequests();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update request status', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Student Book Procurement Requests ({totalElements})
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review textbook requests submitted by students and faculty for inclusion in the college library.
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
            <option value="PENDING">Under Review (Pending)</option>
            <option value="APPROVED">Approved</option>
            <option value="ORDERED">Procurement / Ordered</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex justify-center">
          <LoadingSpinner size="lg" text="Loading book requests..." />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12">
          <EmptyState
            title="No requests found"
            description="There are currently no book procurement requests matching this filter."
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Student Requester</th>
                  <th className="py-3 px-4">Requested Book Title</th>
                  <th className="py-3 px-4">Author & ISBN</th>
                  <th className="py-3 px-4">Purpose / Justification</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{req.user?.fullName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {req.user?.studentId} • {req.user?.department}
                      </p>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {req.title}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <p className="font-medium text-slate-800">{req.author || 'N/A'}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{req.isbn || 'No ISBN'}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs line-clamp-2">
                      {req.reason || 'Course reference material'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          req.status === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : req.status === 'ORDERED'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : req.status === 'REJECTED'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenStatusModal(req)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-dps-50 hover:text-dps-700 text-slate-700 font-bold rounded-lg border border-slate-200 transition"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Review</span>
                      </button>
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

      {/* Review Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Review Book Purchase Request"
        maxWidth="md"
      >
        {selectedReq && (
          <form onSubmit={handleUpdateStatus} className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1">
              <p className="font-bold text-slate-900 text-sm">{selectedReq.title}</p>
              <p className="text-slate-600">
                Author: <span className="font-semibold text-slate-800">{selectedReq.author || 'N/A'}</span>
              </p>
              <p className="text-slate-600">
                Requested By:{' '}
                <span className="font-semibold text-slate-800">
                  {selectedReq.user?.fullName} ({selectedReq.user?.studentId})
                </span>
              </p>
              {selectedReq.reason && (
                <p className="text-slate-500 italic mt-1 pt-1 border-t border-slate-200">
                  "{selectedReq.reason}"
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Update Request Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'APPROVED', label: 'Approve' },
                  { id: 'ORDERED', label: 'Order / Buy' },
                  { id: 'REJECTED', label: 'Reject' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setNewStatus(s.id as any)}
                    className={`p-2 rounded-xl border text-xs font-bold transition ${
                      newStatus === s.id
                        ? 'border-dps-600 bg-dps-50 text-dps-900'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Librarian Feedback / Acquisition Note
              </label>
              <textarea
                rows={3}
                placeholder="e.g. 5 copies approved under Library Budget 2026. Vendor PO issued."
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-dps-500"
              />
            </div>

            <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={processing}
                className="px-5 py-2 text-xs font-bold text-white bg-dps-600 hover:bg-dps-700 rounded-xl"
              >
                {processing ? 'Saving...' : 'Save Decision'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

