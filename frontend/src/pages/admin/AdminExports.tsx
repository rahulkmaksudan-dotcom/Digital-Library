import React, { useState } from 'react';
import { FileSpreadsheet, Download, BookOpen, ArrowRightLeft, Coins, Users, ShieldAlert } from 'lucide-react';
import { reportService } from '../../api';
import { useToast } from '../../context/ToastContext';
import { apiClient } from '../../api/client';

export const AdminExports: React.FC = () => {
  const { showToast } = useToast();
  const [downloading, setDownloading] = useState<string | null>(null);

  const downloadReport = async (type: string, fileName: string) => {
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
      id: 'books',
      title: 'Full Books Inventory Ledger',
      fileName: 'DPS_College_Library_Books_Inventory.csv',
      description:
        'All book titles, ISBNs, authors, categories, shelf locations, total copies, and available copies.',
      icon: BookOpen,
      badge: 'Inventory Master',
    },
    {
      id: 'loans',
      title: 'Master Circulation & Loans Log',
      fileName: 'DPS_College_Library_Loans_Log.csv',
      description:
        'Every book issuance, return timestamp, borrower details, 10-day scheduled due date, and overdue flags.',
      icon: ArrowRightLeft,
      badge: 'Circulation Archive',
    },
    {
      id: 'fines',
      title: 'Overdue Fines & Accounts Ledger',
      fileName: 'DPS_College_Library_Fines_Ledger.csv',
      description:
        'Detailed breakdown of ₹2.00/day late fines, paid amounts, payment channels (CASH/UPI), and waivers.',
      icon: Coins,
      badge: 'Finance & Compliance',
    },
    {
      id: 'users',
      title: 'Institutional Members Directory',
      fileName: 'DPS_College_Library_Users_Directory.csv',
      description:
        'Export of registered students, faculty, roll numbers, engineering departments, and account active flags.',
      icon: Users,
      badge: 'User Master',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Administrative Reports & Audit Exports
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Generate comprehensive CSV files for NAAC/NBA inspections, institutional records, and library accounting.
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
                  Format: .CSV (Standard UTF-8)
                </span>
                <button
                  onClick={() => downloadReport(rep.id, rep.fileName)}
                  disabled={isCurrent}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-dps-600 hover:bg-dps-700 text-white text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isCurrent ? 'Generating CSV...' : 'Export CSV'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

