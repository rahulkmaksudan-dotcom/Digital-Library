import React, { useState } from 'react';
import { FileSpreadsheet, Download, BookOpen, ArrowRightLeft, Coins, Users, ShieldCheck } from 'lucide-react';
import { reportService } from '../../api';
import { useToast } from '../../context/ToastContext';
import { apiClient } from '../../api/client';

export const LibrarianReports: React.FC = () => {
  const { showToast } = useToast();
  const [downloading, setDownloading] = useState<string | null>(null);

  const downloadReport = async (type: 'books' | 'loans' | 'fines' | 'users', fileName: string) => {
    setDownloading(type);
    try {
      const res = await apiClient.get(`/reports/export/${type}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast(`${fileName} exported successfully!`, 'success');
    } catch (err: any) {
      showToast('Failed to generate export file. Please check permissions.', 'error');
    } finally {
      setDownloading(null);
    }
  };

  const reports = [
    {
      id: 'books' as const,
      title: 'Complete Book Inventory Catalog',
      fileName: 'Thakur_DPS_Books_Inventory.csv',
      description:
        'CSV export of all 35+ titles, ISBNs, authors, engineering categories, physical rack locations, and total vs available stock.',
      icon: BookOpen,
      badge: 'Catalog Data',
    },
    {
      id: 'loans' as const,
      title: 'Circulation Transactions & Loans',
      fileName: 'Thakur_DPS_Loan_Circulation.csv',
      description:
        'Complete record of books issued, student roll numbers, borrowing dates, scheduled 10-day return dates, and return timestamps.',
      icon: ArrowRightLeft,
      badge: 'Circulation Records',
    },
    {
      id: 'fines' as const,
      title: 'Overdue Fines & Revenue Ledger',
      fileName: 'Thakur_DPS_Fines_Ledger.csv',
      description:
        'Export of late fees computed at ₹2.00/day, fine collection statuses (PAID, PENDING, WAIVED), and payment methods.',
      icon: Coins,
      badge: 'Finance & Accounts',
    },
    {
      id: 'users' as const,
      title: 'Student & Faculty Membership Directory',
      fileName: 'Thakur_DPS_Members_Directory.csv',
      description:
        'Full list of registered college students, engineering departments, semesters, student IDs, emails, and account active flags.',
      icon: Users,
      badge: 'User Records',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Circulation Reports & CSV Data Exports
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Export verified library records for academic auditing, accreditation (NAAC/NBA), and college administration review.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reports.map((rep) => {
          const Icon = rep.icon;
          const isCurrent = downloading === rep.id;

          return (
            <div
              key={rep.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-dps-300 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-dps-50 border border-dps-200 text-dps-700 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 uppercase tracking-wider">
                    {rep.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{rep.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {rep.description}
                </p>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">
                  Format: .CSV (UTF-8)
                </span>
                <button
                  onClick={() => downloadReport(rep.id, rep.fileName)}
                  disabled={isCurrent}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-dps-600 hover:bg-dps-700 text-white text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isCurrent ? 'Generating CSV...' : 'Download CSV'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

