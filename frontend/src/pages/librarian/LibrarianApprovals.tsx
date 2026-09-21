import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  CheckCircle,
  XCircle,
  Download,
  FileText,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { resourceService } from '../../api';
import { DigitalResource } from '../../types';
import { Pagination } from '../../components/Pagination';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { useToast } from '../../context/ToastContext';

export const LibrarianApprovals: React.FC = () => {
  const { showToast } = useToast();
  const [resources, setResources] = useState<DigitalResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    fetchResources();
  }, [page, statusFilter]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await resourceService.getAllResources({
        status: statusFilter || undefined,
        page,
        size: 10,
      });
      setResources(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to fetch resource approvals', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    try {
      await resourceService.updateStatus(id, status);
      showToast(`Resource ${status.toLowerCase()}!`, status === 'APPROVED' ? 'success' : 'info');
      fetchResources();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update resource', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Digital Academic Resource Approvals ({totalElements})
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review syllabi, question papers, and lecture notes uploaded by faculty before publishing to students.
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
            <option value="PENDING">Pending Review</option>
            <option value="APPROVED">Published (Approved)</option>
            <option value="REJECTED">Rejected Submissions</option>
            <option value="">All Uploads</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex justify-center">
          <LoadingSpinner size="lg" text="Loading resources..." />
        </div>
      ) : resources.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12">
          <EmptyState
            title="Approval queue clear"
            description="There are currently no uploaded resources awaiting verification in this status."
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Resource Title</th>
                  <th className="py-3 px-4">Subject & Department</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Uploaded By</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resources.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-dps-600 flex-shrink-0" />
                        <span className="line-clamp-1">{item.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{item.subject}</p>
                      <p className="text-[11px] text-slate-500">
                        {item.department} • Sem {item.semester}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-slate-100 rounded-md font-semibold text-slate-700 uppercase text-[10px]">
                        {item.resourceType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {item.uploader?.fullName || 'Faculty'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : item.status === 'REJECTED'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {item.fileName && (
                          <a
                            href={resourceService.getDownloadUrl(item.fileName)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-500 hover:text-dps-600 hover:bg-slate-100 rounded-lg transition"
                            title="Download/Inspect Resource"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}

                        {item.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(item.id, 'APPROVED')}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(item.id, 'REJECTED')}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-lg transition"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}
                      </div>
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
    </div>
  );
};

