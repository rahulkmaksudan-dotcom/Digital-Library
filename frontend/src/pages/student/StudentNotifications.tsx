import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Clock, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { notificationService } from '../../api';
import { NotificationItem } from '../../types';
import { Pagination } from '../../components/Pagination';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { useNotifications } from '../../context/NotificationContext';
import { useToast } from '../../context/ToastContext';

export const StudentNotifications: React.FC = () => {
  const { showToast } = useToast();
  const { refreshUnreadCount } = useNotifications();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getNotifications(page, 15);
      setNotifications(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to fetch notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      refreshUnreadCount();
      showToast('Notification marked as read', 'info');
    } catch (err: any) {
      showToast('Failed to update notification', 'error');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      refreshUnreadCount();
      showToast('All notifications marked as read', 'success');
    } catch (err: any) {
      showToast('Failed to mark all as read', 'error');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'WARNING':
      case 'OVERDUE':
        return <AlertTriangle className="w-5 h-5 text-rose-600" />;
      case 'SUCCESS':
      case 'PICKUP_READY':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      default:
        return <Info className="w-5 h-5 text-dps-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Notifications & Alerts
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Stay updated with due date reminders, reservation pickup alerts, and campus announcements.
          </p>
        </div>
        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-dps-700 hover:border-dps-200 rounded-xl shadow-xs transition"
          >
            <CheckCheck className="w-4 h-4 text-dps-600" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex justify-center">
          <LoadingSpinner size="lg" text="Loading notifications..." />
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12">
          <EmptyState
            title="You're all caught up!"
            description="You don't have any notifications at the moment. Important book circulation and college library alerts will appear here."
            actionText="Go to Dashboard"
            actionLink="/student/dashboard"
          />
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`p-4 sm:p-5 rounded-2xl border transition flex items-start gap-4 ${
                item.isRead
                  ? 'bg-white border-slate-200/80 text-slate-700'
                  : 'bg-dps-50/40 border-dps-200 text-slate-900 shadow-xs'
              }`}
            >
              <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-100 flex-shrink-0">
                {getTypeIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900 truncate">
                    {item.title}
                  </h4>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {item.message}
                </p>
              </div>

              {!item.isRead && (
                <button
                  onClick={() => handleMarkAsRead(item.id)}
                  className="flex-shrink-0 text-[11px] font-bold text-dps-600 hover:text-dps-700 bg-white border border-dps-200 px-2.5 py-1 rounded-lg transition"
                >
                  Mark read
                </button>
              )}
            </div>
          ))}

          {totalPages > 1 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
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

