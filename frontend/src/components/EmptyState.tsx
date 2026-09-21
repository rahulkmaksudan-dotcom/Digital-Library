import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon, FolderSearch } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionText?: string;
  actionLink?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = FolderSearch,
  title,
  description,
  actionLabel,
  actionText,
  actionLink,
  onAction,
}) => {
  const label = actionText || actionLabel;

  return (
    <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center flex flex-col items-center justify-center my-4">
      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mb-4 shadow-sm">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-slate-800 tracking-tight">{title}</h3>
      {description && (
        <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">{description}</p>
      )}
      {label && actionLink && (
        <Link
          to={actionLink}
          className="mt-5 px-4 py-2 text-xs font-semibold text-white bg-dps-600 hover:bg-dps-700 rounded-xl shadow-sm transition"
        >
          {label}
        </Link>
      )}
      {label && onAction && !actionLink && (
        <button
          onClick={onAction}
          className="mt-5 px-4 py-2 text-xs font-semibold text-white bg-dps-600 hover:bg-dps-700 rounded-xl shadow-sm transition"
        >
          {label}
        </button>
      )}
    </div>
  );
};

